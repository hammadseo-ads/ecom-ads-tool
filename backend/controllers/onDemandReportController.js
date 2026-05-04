import OnDemandProductReport from "../models/OnDemandProductReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";

const REPORT_TYPES = [
  { type: "LAST_30_DAYS", days: 30 },
  { type: "LAST_60_DAYS", days: 60 },
  { type: "LAST_90_DAYS", days: 90 },
];

// ------------------- Helpers -------------------
const categorizeProduct = (product) => {
  const roas = product.total_cost === 0 ? 0 : product.total_conversion_value / product.total_cost;
  let category = "Uncategorized";
  if (product.total_cost === 0) category = "Zombie";
  else if (product.total_cost > 0 && product.total_conversions === 0) category = "Zero-Conversion";
  else if (roas > 3) category = "Profitable";
  else if (roas > 0 && roas <= 3) category = "Costly";
  return { roas, category };
};

const processGoogleAdsData = (results, customerId = 'unknown') => {
  if (!results || results.length === 0) {
    console.log(`⚠️  ${customerId}: No results to process`);
    return [];
  }
  
  // Log sample row to understand structure
  console.log(`📊 Sample row for ${customerId}:`, JSON.stringify(results[0], null, 2));
  
  // Google Ads enum values for AdvertisingChannelType v20 (verified by
  // running /api/on-demand-report/debug-raw against a real account):
  //   2 = SEARCH, 3 = DISPLAY, 4 = SHOPPING, 5 = HOTEL, 6 = VIDEO,
  //   7 = MULTI_CHANNEL, 8 = LOCAL, 9 = SMART, 10 = PERFORMANCE_MAX,
  //   11 = LOCAL_SERVICES, 12 = TRAVEL, 13 = DEMAND_GEN.
  // The GAQL WHERE clause already filters server-side to SHOPPING + PMAX,
  // so anything that survives must map to one of those two even if the
  // numeric enum drifts in a future API version.
  const CHANNEL_NUMERIC_TO_NAME = {
    2: 'SEARCH',
    4: 'SHOPPING',
    10: 'PERFORMANCE_MAX',
  };

  const map = new Map();
  let droppedRows = 0;
  results.forEach((row) => {
    const rawChannel = row.campaign?.advertising_channel_type ?? row.campaign?.advertisingChannelType;
    let channelType;
    if (typeof rawChannel === 'number') {
      channelType = CHANNEL_NUMERIC_TO_NAME[rawChannel] || `UNKNOWN_${rawChannel}`;
    } else if (typeof rawChannel === 'string') {
      channelType = rawChannel.toUpperCase().replace(/\s+/g, '_');
    } else {
      channelType = 'UNKNOWN';
    }

    // Trust the GAQL WHERE clause — don't drop rows here. Previously this
    // silently dropped every PMax row because the numeric enum 13 wasn't in
    // the allowlist, leading to half the PMax campaigns disappearing.
    if (!["SHOPPING", "PERFORMANCE_MAX"].includes(channelType)) {
      droppedRows += 1;
      // Still drop truly non-Shopping/PMax rows for safety, but log them so
      // we'd notice if Google ever changes enum numbers again.
      if (droppedRows <= 3) {
        console.log(`⚠️  ${customerId}: dropped row with channel_type=${rawChannel} (normalized=${channelType}). Campaign: ${row.campaign?.name || row.campaign?.id}`);
      }
      return;
    }

    const productId = row.segments?.product_item_id || row.segments?.productItemId || "Unknown";
    const productTitle = row.segments?.product_title || row.segments?.productTitle || "Unknown Product";
    const campaignId = row.campaign?.id || "Unknown";
    const campaignName = row.campaign?.name || "Unknown Campaign";
    const key = `${productId}_${campaignId}`;

    const impressions = Number(row.metrics?.impressions || 0);
    const clicks = Number(row.metrics?.clicks || 0);
    const cost = Number(row.metrics?.cost_micros || 0) / 1e6;
    const conversions = Number(row.metrics?.conversions || 0);
    const conversionValue = Number(row.metrics?.conversions_value || 0);

    if (map.has(key)) {
      const existing = map.get(key);
      existing.total_impressions += impressions;
      existing.total_clicks += clicks;
      existing.total_cost += cost;
      existing.total_conversions += conversions;
      existing.total_conversion_value += conversionValue;
    } else {
      map.set(key, {
        campaign_id: campaignId,
        product_item_id: productId,
        product_title: productTitle,
        product_link: "",
        channel_type: channelType,
        campaign_name: campaignName,
        total_impressions: impressions,
        total_clicks: clicks,
        total_cost: cost,
        total_conversions: conversions,
        total_conversion_value: conversionValue,
      });
    }
  });

  return Array.from(map.values()).map((p) => ({ ...p, ...categorizeProduct(p) }));
};

const formatCustomerId = (customerId) => {
  if (!customerId) return '';
  const str = String(customerId);
  const formatted = str.replace(/customers\//g, '').replace(/-/g, '');
  return formatted;
};

// ------------------- ✅ CORRECT MCC CHILD DETECTION -------------------
const getClientAccounts = async (tokenDoc, managerCustomerId) => {
  const formattedManagerId = formatCustomerId(managerCustomerId);
  
  try {
    console.log("🔍 [MCC] Listing children for:", formattedManagerId);
    
    // Debug: log the token context
    console.log("📋 [DEBUG] tokenDoc.rootCustomerId:", tokenDoc?.rootCustomerId ? formatCustomerId(tokenDoc.rootCustomerId) : 'NOT SET');
    console.log("📋 [DEBUG] tokenDoc.allCustomerIds:", tokenDoc?.allCustomerIds);
    console.log("📋 [DEBUG] tokenDoc.isManager:", tokenDoc?.isManager);
    
    // For listing children, use a client authenticated as the manager account.
    // Use tokenDoc.rootCustomerId as the login_customer_id if available (the MCC that granted access)
    const loginHeader = tokenDoc?.rootCustomerId ? formatCustomerId(tokenDoc.rootCustomerId) : null;
    console.log("📋 [DEBUG] Creating manager client with login_customer_id:", loginHeader || 'null (direct access)');
    const managerClient = getGoogleAdsClient(tokenDoc.refreshToken, formattedManagerId, loginHeader);
    
    // Query to get all linked customer accounts
    const childQuery = `
      SELECT 
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.manager
      FROM customer_client 
      WHERE customer_client.status = 'ENABLED'
      ORDER BY customer_client.id
      LIMIT 100
    `;
    
    console.log("📤 Querying customer_client table...");
    const response = await managerClient.query(childQuery);
    
    if (!response || response.length === 0) {
      console.log("⚠️  No child accounts found");
      return [formattedManagerId];
    }
    
    // Log what we found
    console.log(`📊 Found ${response.length} total accounts`);
    response.forEach(row => {
      const id = row.customer_client?.id;
      const name = row.customer_client?.descriptive_name;
      const isManager = row.customer_client?.manager;
      console.log(`   - ${id} (${name}) ${isManager ? '(MANAGER)' : ''}`);
    });

    // Filter to get non-manager client accounts
    const childAccounts = response
      ?.filter(row => row.customer_client?.id && !row.customer_client?.manager)
      ?.map(row => formatCustomerId(row.customer_client.id))
      ?.filter(Boolean) || [];

    console.log("📋 Client accounts found:", childAccounts);

    if (childAccounts.length > 0) {
      console.log(`✅ MCC SUCCESS: ${childAccounts.length} client accounts`);
      return childAccounts;
    }

    console.log("⚠️  No client accounts found — MCC cannot be queried for metrics, skipping");
    return [];
    
  } catch (error) {
    const errMsg = error?.errors?.[0]?.message || error.message;
    console.log("❌ Child query error:", errMsg);
    
    // If permission error, try alternative login_customer_id values from stored allCustomerIds
    if (errMsg && errMsg.toLowerCase().includes('permission') && tokenDoc?.allCustomerIds && tokenDoc.allCustomerIds.length > 0) {
      console.log("🔁 Permission error detected - attempting alternative login_customer_id headers from tokenDoc.allCustomerIds...");
      for (const candidate of tokenDoc.allCustomerIds) {
        try {
          const candidateLogin = formatCustomerId(candidate);
          const currentLogin = tokenDoc?.rootCustomerId ? formatCustomerId(tokenDoc.rootCustomerId) : null;
          if (candidateLogin === currentLogin) {
            console.log(`↩️  Skipping ${candidateLogin} - already tried`);
            continue;
          }
          console.log(`🔍 Attempting alternative login header: ${candidateLogin} for manager ${formattedManagerId}...`);
          const altClient = getGoogleAdsClient(tokenDoc.refreshToken, formattedManagerId, candidateLogin);
          const childQuery = `
            SELECT 
              customer_client.id,
              customer_client.descriptive_name,
              customer_client.manager
            FROM customer_client 
            WHERE customer_client.status = 'ENABLED'
            ORDER BY customer_client.id
            LIMIT 100
          `;
          const altResp = await altClient.query(childQuery);
          if (altResp && altResp.length > 0) {
            console.log(`✅ SUCCESS listing children with login header ${candidateLogin}`);
            const childAccountsAlt = altResp
              ?.filter(row => row.customer_client?.id && !row.customer_client?.manager)
              ?.map(row => formatCustomerId(row.customer_client.id))
              ?.filter(Boolean) || [];
            if (childAccountsAlt.length > 0) {
              console.log(`✅ MCC SUCCESS: ${childAccountsAlt.length} client accounts with login header ${candidateLogin}`);
              // NOTE: do NOT overwrite tokenDoc.rootCustomerId here — that mutates
              // shared state based on a guess and causes wrong-account analysis later.
              return childAccountsAlt;
            }
          }
        } catch (e) {
          const altErr = e?.errors?.[0]?.message || e.message || String(e);
          console.log(`⚠️  Attempt with login ${candidate} failed:`, altErr);
          continue;
        }
      }
      console.log("ℹ️  Alternative login headers exhausted");
    }
    
    console.log("⚠️  Fallback: no valid accounts found - returning empty list");
    return [];
  }
};

// ------------------- MAIN CONTROLLER -------------------
export const generateReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;

  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });

  const formattedCustomerId = formatCustomerId(customer_id);
  
  try {
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(401).json({ error: "Google Ads not connected" });

    if (Date.now() > tokenDoc.expiryDate.getTime() - 60000) {
      console.log("🔄 Refreshing token...");
      const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
      tokenDoc.accessToken = newTokens.access_token;
      tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
      await tokenDoc.save();
    }

    // The user picked a specific leaf account in the navbar — just analyze that.
    // Don't run getClientAccounts (it has a destructive retry loop that overwrites
    // tokenDoc.rootCustomerId with whatever account "worked", corrupting state and
    // running analysis on the wrong account).
    const accountsToProcess = [formattedCustomerId];
    console.log(`🚀 Processing requested account: ${formattedCustomerId}`);

    // Build candidate login_customer_ids. Try in order:
    //   1) no login header (works when customer is directly accessible)
    //   2) every directly-accessible customer (one of them is the parent MCC)
    const candidateLogins = [
      null,
      ...(tokenDoc.allCustomerIds || []).map(formatCustomerId).filter(
        (id) => id && id !== formattedCustomerId
      ),
    ];

    const allReports = [];
    for (const clientId of accountsToProcess) {
      console.log(`\n📂 PROCESSING: ${clientId}`);

      for (const rpt of REPORT_TYPES) {
        let lastErr = null;
        let succeeded = false;
        for (const loginCustomerId of candidateLogins) {
          try {
            const result = await generateSingleAccountReport(tokenDoc, clientId, loginCustomerId, userId, rpt);
            allReports.push(result);
            succeeded = true;
            break;
          } catch (err) {
            lastErr = err;
            const msg = err?.errors?.[0]?.message || err.message || "";
            // Only retry with a different login on permission/auth errors
            if (!/permission|not allowed|authorization|access/i.test(msg)) {
              break;
            }
            console.log(`  ↩️  Retrying ${clientId} ${rpt.type} with different login_customer_id (last error: ${msg.slice(0, 80)})`);
          }
        }
        if (!succeeded) {
          console.error(`❌ ${clientId} ${rpt.type}:`, lastErr?.message);
          allReports.push({
            customer_id: clientId,
            report_type: rpt.type,
            count: 0,
            error: lastErr?.message,
          });
        }
      }
    }

    const totalProducts = allReports.reduce((sum, r) => sum + (r.count || 0), 0);
    console.log(`🎉 TOTAL: ${totalProducts} products`);

    res.json({ 
      success: true, 
      reports: allReports,
      total_accounts: accountsToProcess.length,
      total_products: totalProducts 
    });

  } catch (error) {
    console.error("💥 ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ------------------- SINGLE REPORT -------------------
const generateSingleAccountReport = async (tokenDoc, customerId, loginCustomerId, userId, reportType) => {
  const { type, days } = reportType;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  
  const query = `
    SELECT
      segments.product_title,
      segments.product_item_id,
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM shopping_performance_view
    WHERE segments.date >= '${start}'
      AND segments.date <= '${end}'
      AND metrics.impressions > 0
      AND campaign.advertising_channel_type IN ('SHOPPING','PERFORMANCE_MAX')
    ORDER BY metrics.cost_micros DESC
    LIMIT 5000
  `;

  let allRows = [];
  
  try {
    const response = await client.query(query);
    allRows = Array.isArray(response) ? response : [];
    console.log(`📥 Query response for ${customerId}: ${allRows.length} rows`);
    
  } catch (error) {
    const errorMsg = error?.errors?.[0]?.message || error.message;
    console.error(`❌ Query error for ${customerId}:`, errorMsg);
    
    // If this is a manager account, we can't query it directly
    if (errorMsg.includes('manager account') || errorMsg.includes('Metrics cannot be requested for')) {
      console.log(`⚠️  ${customerId} is a manager account - cannot query metrics directly`);
      console.log(`💡 Need to query child accounts instead`);
      return { 
        customer_id: customerId, 
        report_type: type, 
        count: 0, 
        note: 'Manager account - use child account metrics' 
      };
    }
    throw error;
  }

  const processed = processGoogleAdsData(allRows, customerId);
  
  if (processed.length > 0) {
    await OnDemandProductReport.deleteMany({
      user: userId,
      customer_id: customerId,
      report_type: type,
    });

    await OnDemandProductReport.insertMany(
      processed.map(p => ({
        user: userId,
        customer_id: customerId,
        report_type: type,
        report_start_date: startDate,
        report_end_date: endDate,
        ...p,
      }))
    );
  }

  console.log(`   ✅ ${type}: ${processed.length} products`);
  
  return {
    customer_id: customerId,
    report_type: type,
    count: processed.length,
  };
};

// ------------------- Cached + Other Endpoints -------------------
export const getCachedReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, report_type } = req.body;

    const query = { user: userId };
    if (customer_id) query.customer_id = customer_id;
    if (report_type) query.report_type = report_type;

    const reports = await OnDemandProductReport.find(query).lean();

    const categoryMap = {};
    reports.forEach(p => {
      const cat = p.category || 'Uncategorized';
      categoryMap[cat] = categoryMap[cat] || { 
        bucket: cat, num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0 
      };
      const data = categoryMap[cat];
      data.num_titles += 1;
      data.total_cost += p.total_cost;
      data.total_conversions += p.total_conversions;
      data.total_value += p.total_conversion_value;
    });

    const summaryTable = Object.values(categoryMap).map(cat => ({
      ...cat,
      roas: cat.total_cost === 0 ? 0 : cat.total_value / cat.total_cost
    }));

    // Add TOTAL row
    const totalRow = {
      bucket: 'TOTAL',
      num_titles: reports.length,
      total_cost: reports.reduce((sum, p) => sum + (p.total_cost || 0), 0),
      total_conversions: reports.reduce((sum, p) => sum + (p.total_conversions || 0), 0),
      total_value: reports.reduce((sum, p) => sum + (p.total_conversion_value || 0), 0),
      roas: 0
    };
    totalRow.roas = totalRow.total_cost === 0 ? 0 : totalRow.total_value / totalRow.total_cost;
    summaryTable.push(totalRow);

    const campaigns = [...new Set(reports.map(p => p.campaign_id))].map(id => ({
      id,
      name: reports.find(p => p.campaign_id === id)?.campaign_name || `Campaign ${id}`
    }));

    res.json({
      success: true,
      product_details: reports,
      summary_table: summaryTable,
      campaign_list: [{ id: 'all', name: 'All Campaigns' }, ...campaigns],
      total_products: reports.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    
    const query = { user: userId };
    if (customer_id) query.customer_id = customer_id;

    const count = await OnDemandProductReport.countDocuments(query);
    res.json({ status: count > 0 ? "COMPLETED" : "NO_DATA", count });
  } catch (error) {
    res.status(500).json({ status: "ERROR", error: error.message });
  }
};

// ============================================================================
// DEBUG ENDPOINT — returns raw GAQL output so we can see what channel-type
// values Google is sending and which campaigns/products we'd be processing.
// Hit it from browser console:
//   fetch('/api/on-demand-report/debug-raw', {
//     method: 'POST', credentials: 'include',
//     headers: {'Content-Type':'application/json'},
//     body: JSON.stringify({ customer_id: 'XXXXXXXXXX', days: 30 })
//   }).then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)))
// ============================================================================
export const debugRawProducts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { customer_id, days = 30 } = req.body;
    if (!customer_id) return res.status(400).json({ error: "customer_id required" });

    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(404).json({ error: "no token doc" });

    const cid = formatCustomerId(customer_id);
    const loginCid = tokenDoc.rootCustomerId ? formatCustomerId(tokenDoc.rootCustomerId) : cid;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const client = getGoogleAdsClient(tokenDoc.refreshToken, cid, loginCid);

    const query = `
      SELECT
        segments.product_title,
        segments.product_item_id,
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM shopping_performance_view
      WHERE segments.date >= '${start}'
        AND segments.date <= '${end}'
        AND metrics.impressions > 0
      ORDER BY metrics.cost_micros DESC
      LIMIT 5000
    `;
    // NOTE: deliberately removed the WHERE channel_type IN (...) filter
    // so we can see ALL rows and find anything Google is returning that
    // we don't recognize.

    let rows;
    try {
      const resp = await client.query(query);
      rows = Array.isArray(resp) ? resp : [];
    } catch (err) {
      return res.json({
        error: err?.errors?.[0]?.message || err.message,
        customerId: cid,
        loginCustomerId: loginCid,
      });
    }

    // Per-campaign roll-up so we can see exactly what's being returned
    // and what channel-type each campaign has (raw + JS typeof).
    const perCampaign = new Map();
    let totals = { impressions: 0, clicks: 0, cost: 0, conversions: 0, value: 0 };
    const channelTypeCounts = {}; // raw value -> count

    for (const row of rows) {
      const cidVal = row.campaign?.id;
      const cname = row.campaign?.name;
      const rawCh = row.campaign?.advertising_channel_type ?? row.campaign?.advertisingChannelType;
      const chKey = `${typeof rawCh}:${rawCh}`;
      channelTypeCounts[chKey] = (channelTypeCounts[chKey] || 0) + 1;

      const cost = Number(row.metrics?.cost_micros || 0) / 1e6;
      const conv = Number(row.metrics?.conversions || 0);
      const val = Number(row.metrics?.conversions_value || 0);
      const imp = Number(row.metrics?.impressions || 0);
      const clk = Number(row.metrics?.clicks || 0);

      totals.impressions += imp;
      totals.clicks += clk;
      totals.cost += cost;
      totals.conversions += conv;
      totals.value += val;

      const k = String(cidVal);
      if (!perCampaign.has(k)) {
        perCampaign.set(k, {
          campaign_id: k,
          campaign_name: cname,
          raw_channel_type: rawCh,
          raw_channel_type_typeof: typeof rawCh,
          rows: 0,
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          conversions_value: 0,
        });
      }
      const e = perCampaign.get(k);
      e.rows += 1;
      e.impressions += imp;
      e.clicks += clk;
      e.cost += cost;
      e.conversions += conv;
      e.conversions_value += val;
    }

    res.json({
      customerId: cid,
      loginCustomerId: loginCid,
      dateRange: { start, end },
      totalRowsReturned: rows.length,
      grandTotals: totals,
      channelTypeCountsRaw: channelTypeCounts,
      perCampaign: Array.from(perCampaign.values()).sort((a, b) => b.cost - a.cost),
      sampleFirstRow: rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

export const clearReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    
    const query = { user: userId };
    if (customer_id) query.customer_id = customer_id;

    const result = await OnDemandProductReport.deleteMany(query);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, report_type, campaign_id, category } = req.body;

    console.log("📥 CSV Export Request:", { userId, customer_id, report_type, campaign_id, category });

    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    const requestedFormattedId = customer_id ? formatCustomerId(customer_id) : null;

    // ✅ ALWAYS query by client ID, never by manager ID
    // Reports are stored per client_id in DB, not per manager
    // If caller requested the MCC, fetch and use its child accounts
    let customerIds = [requestedFormattedId || ''];
    if (customer_id && tokenDoc?.rootCustomerId && requestedFormattedId === formatCustomerId(tokenDoc.rootCustomerId)) {
      // The caller requested the MCC (stored rootCustomerId) — fetch its child accounts
      const childAccounts = await getClientAccounts(tokenDoc, requestedFormattedId);
      customerIds = childAccounts.length > 0 ? childAccounts : [];
      console.log(`🔄 Manager account detected. Querying child accounts:`, customerIds);
    } else if (requestedFormattedId && !tokenDoc?.rootCustomerId) {
      // No MCC stored; use the requested customer_id as-is
      customerIds = [requestedFormattedId];
    }

    // Query all relevant customer accounts
    const query = { 
      user: userId,
      customer_id: { $in: customerIds }
    };
    if (report_type) query.report_type = report_type;

    console.log("🔍 Database query:", JSON.stringify(query, null, 2));

    let reports = await OnDemandProductReport.find(query);

    console.log(`📊 Found ${reports.length} reports from database`);

    if (reports.length === 0) {
      console.warn("⚠️  No reports found in database with given filters");
      // Return CSV with headers only to avoid confusion
      const headers = ['Product', 'Campaign', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Value', 'ROAS', 'Category'];
      const csv = headers.join(',');
      
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="report-${Date.now()}.csv"`
      });
      res.send(csv);
      return;
    }

    if (campaign_id && campaign_id !== 'all') {
      const beforeFilter = reports.length;
      reports = reports.filter(p => p.campaign_id === campaign_id);
      console.log(`🔽 After campaign filter: ${beforeFilter} → ${reports.length}`);
    }
    if (category && category !== 'all') {
      const beforeFilter = reports.length;
      reports = reports.filter(p => p.category === category);
      console.log(`🔽 After category filter: ${beforeFilter} → ${reports.length}`);
    }

    const headers = ['Product', 'Campaign', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Value', 'ROAS', 'Category'];
    const csvRows = reports.map(p => [
      `"${p.product_title.replace(/"/g, '""')}"`,
      p.campaign_name || 'Unknown',
      p.total_impressions || 0,
      p.total_clicks || 0,
      `$${(p.total_cost || 0).toFixed(2)}`,
      p.total_conversions || 0,
      `$${(p.total_conversion_value || 0).toFixed(2)}`,
      (p.roas || 0).toFixed(2),
      p.category || 'Uncategorized'
    ]);

    const csv = [headers, ...csvRows].map(row => row.join(',')).join('\n');
    
    console.log(`✅ CSV prepared with ${csvRows.length} rows`);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="report-${Date.now()}.csv"`
    });
    res.send(csv);
  } catch (error) {
    console.error("❌ CSV Export Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const listChildAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;

    if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });

    const formattedCustomerId = formatCustomerId(customer_id);
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(401).json({ error: "Google Ads not connected" });

    // Refresh token if needed
    if (Date.now() > tokenDoc.expiryDate.getTime() - 60000) {
      const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
      tokenDoc.accessToken = newTokens.access_token;
      tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
      await tokenDoc.save();
    }

    // If the request specified a customer_id, list for that customer; otherwise use stored rootCustomerId
    const managerIdForListing = customer_id ? formattedCustomerId : (tokenDoc.rootCustomerId ? formatCustomerId(tokenDoc.rootCustomerId) : formattedCustomerId);
    const clientAccounts = await getClientAccounts(tokenDoc, managerIdForListing);

    res.json({
      success: true,
      customer_id: managerIdForListing,
      available_accounts: clientAccounts,
      account_count: clientAccounts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
