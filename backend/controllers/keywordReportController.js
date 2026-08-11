// Search-term report controller — covers ALL campaign types.
//
// Two Google Ads resources are needed:
//   * search_term_view              — Search, Shopping, Display campaigns.
//                                     Includes cost, conversions, conv_value.
//                                     One query per customer; filter by date.
//   * campaign_search_term_insight  — Performance Max only.
//                                     Two-step extraction (categories → terms).
//                                     NO cost data exposed by Google.
//
// We fetch both, merge by search_term, and bucket each unique term.

import KeywordSearchTermReport from "../models/KeywordSearchTermReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";

const REPORT_TYPES = [
  { type: "LAST_30_DAYS", days: 30 },
  { type: "LAST_60_DAYS", days: 60 },
  { type: "LAST_90_DAYS", days: 90 },
];

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";

// Mutually exclusive bucketing. Order matters — first match wins.
//   has_cost: true if any contributing campaign was Search/Shopping/Display
//             (i.e. cost is meaningful for this term)
const categorize = ({ impressions, clicks, cost, conversions, conversion_value, has_cost }) => {
  if (impressions < 100) return "Low Visibility";
  if (conversions >= 1) {
    if (has_cost && cost > 0) {
      const roas = conversion_value / cost;
      if (roas >= 2) return "Profitable";
      return "Costly Conversions";
    }
    return "Profitable"; // PMax-only converting term — call it profitable since we can't measure cost
  }
  // From here: 0 conversions
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  // Wasteful spend: real money going out, no conversions back.
  if (has_cost && cost > 0 && clicks >= 5) return "Wasteful Spend";
  // Wasteful clicks (no cost data, e.g. PMax): lots of clicks, low CTR, no conversions.
  if (clicks >= 5 && ctr < 2) return "Wasteful Clicks";
  // High Engagement, No Conversion: lots of clicks AND decent CTR but not converted yet.
  // These need human review before negativing.
  if (clicks >= 5 && ctr >= 2) return "High Engagement, No Conversion";
  return "Other";
};

// google-ads-api returns various shapes across versions
const toArray = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.results)) return resp.results;
  if (typeof resp[Symbol.iterator] === "function") return Array.from(resp);
  return [];
};

const num = (v) => Number(v ?? 0) || 0;

const candidateLogins = (tokenDoc, customerId) => [
  null,
  ...(tokenDoc.allCustomerIds || [])
    .map(formatCustomerId)
    .filter((id) => id && id !== customerId),
];

const isAuthError = (msg) =>
  /permission|not allowed|authorization|access|customer not enabled/i.test(msg || "");

// Try a fetch with each candidate login_customer_id until one succeeds.
const withLoginRetry = async (tokenDoc, customerId, fn) => {
  let lastErr = null;
  for (const login of candidateLogins(tokenDoc, customerId)) {
    try {
      return await fn(login);
    } catch (err) {
      lastErr = err;
      const msg = err?.errors?.[0]?.message || err.message || "";
      if (!isAuthError(msg)) throw err;
    }
  }
  throw lastErr || new Error("All login_customer_id candidates failed");
};

// ============= LIST CAMPAIGNS =============
//
// Channel-type enum values per Google Ads API official protobuf:
// 0=UNSPECIFIED 1=UNKNOWN 2=SEARCH 3=DISPLAY 4=SHOPPING 5=HOTEL 6=VIDEO
// 7=MULTI_CHANNEL 8=LOCAL 9=SMART 10=PERFORMANCE_MAX 11=LOCAL_SERVICES
// 12=DISCOVERY 13=TRAVEL 14=DEMAND_GEN
//
// However different versions of google-ads-api have returned different numeric
// codes (it sometimes uses internal/proxy ids that don't match the proto).
// To be safe, we read both numeric AND string forms, plus log unrecognized
// values so we can spot mapping drift.
const CHANNEL_ENUM = {
  2: "SEARCH",
  3: "DISPLAY",
  4: "SHOPPING",
  5: "HOTEL",
  6: "VIDEO",
  7: "MULTI_CHANNEL",
  8: "LOCAL",
  9: "SMART",
  10: "PERFORMANCE_MAX",
  11: "LOCAL_SERVICES",
  12: "DISCOVERY",
  13: "TRAVEL",
  14: "DEMAND_GEN",
};

const listAllCampaigns = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(`
    SELECT campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status
    FROM campaign
    WHERE campaign.status IN ('ENABLED', 'PAUSED')
  `);
  const rawSeen = new Map(); // for diagnostic logging
  const campaigns = toArray(resp)
    .map((row) => {
      const c = row.campaign || row;
      const ct = c?.advertising_channel_type ?? c?.advertisingChannelType;
      let channel = null;
      if (typeof ct === "string") channel = ct.toUpperCase();
      else if (typeof ct === "number") channel = CHANNEL_ENUM[ct] || null;
      // Track raw values we couldn't classify
      if (!channel) {
        const key = `${typeof ct}:${ct}`;
        rawSeen.set(key, (rawSeen.get(key) || 0) + 1);
      }
      return {
        id: String(c?.id || ""),
        name: c?.name || `Campaign ${c?.id || ""}`,
        channel,
        rawChannel: ct,
      };
    })
    .filter((c) => c.id);

  if (rawSeen.size > 0) {
    console.warn(
      `  ⚠️  [keywords] unrecognized channel values: ` +
      [...rawSeen.entries()].map(([k, v]) => `${k}×${v}`).join(", ")
    );
  }
  // Log distribution for transparency
  const dist = campaigns.reduce((acc, c) => {
    const k = c.channel || `unknown(${c.rawChannel})`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  console.log(`  [keywords] campaign channel distribution:`, dist);

  return campaigns;
};

// ============= SEARCH/SHOPPING/DISPLAY: search_term_view (one query, all terms) =============
//
// search_term_view returns per (campaign, ad_group, search_term) rows.
// It works for SEARCH and SHOPPING. (DISPLAY in practice doesn't have search terms,
// so we just include their campaigns and Google returns empty — fine.)
//
// Aggregating by search_term across campaigns happens in the caller.
const fetchClassicSearchTerms = async (
  tokenDoc,
  customerId,
  loginCustomerId,
  startDate,
  endDate,
  classicCampaignIds
) => {
  if (classicCampaignIds.length === 0) return [];
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  // Quote each id for the IN clause
  const idsList = classicCampaignIds.map((id) => `'${id}'`).join(", ");
  const query = `
    SELECT
      search_term_view.search_term,
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM search_term_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.id IN (${idsList})
  `;
  const resp = await client.query(query);
  return toArray(resp).map((row) => {
    const v = row.search_term_view || row.searchTermView || {};
    const camp = row.campaign || {};
    const m = row.metrics || {};
    return {
      search_term: v.search_term || v.searchTerm || "(unknown)",
      campaign_id: String(camp.id || ""),
      campaign_name: camp.name || `Campaign ${camp.id || ""}`,
      // Decode numeric enums too — otherwise Shopping/Display terms would all
      // fall back to "SEARCH", breaking the Lead-Gen Shopping exclusion.
      channel_type: (() => {
        const raw = camp.advertising_channel_type ?? camp.advertisingChannelType;
        if (typeof raw === "string" && !/^\d+$/.test(raw)) return raw;
        return CHANNEL_ENUM[Number(raw)] || "SEARCH";
      })(),
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: num(m.cost_micros) / 1e6,
      conversions: num(m.conversions),
      conversion_value: num(m.conversions_value || m.conversionsValue),
      has_cost: true,
    };
  });
};

// ============= PMAX: campaign_search_term_insight (two-step) =============
//
// Step 1 returns categories WITH their aggregated metrics. We keep these as
// fallback "terms" labelled with the category — Google often groups many
// low-volume queries into a category without exposing individual queries, so
// the category_label IS the only search-term-like signal we have for them.
//
// Step 2 returns individual search terms inside each category. When step 2
// returns rows, we use those (more granular) and drop the category fallback.
const fetchCategoriesForCampaign = async (tokenDoc, customerId, loginCustomerId, campaignId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const query = `
    SELECT
      campaign_search_term_insight.id,
      campaign_search_term_insight.category_label,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign_search_term_insight
    WHERE campaign_search_term_insight.campaign_id = '${campaignId}'
      AND segments.date BETWEEN '${start}' AND '${end}'
  `;
  const resp = await client.query(query);
  return toArray(resp).map((row) => {
    const insight = row.campaign_search_term_insight || row.campaignSearchTermInsight || {};
    const m = row.metrics || {};
    return {
      insight_id: String(insight.id || ""),
      category_label: insight.category_label || insight.categoryLabel || "(uncategorized)",
      // Category-level aggregated metrics
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      conversions: num(m.conversions),
      conversion_value: num(m.conversions_value || m.conversionsValue),
    };
  }).filter((c) => c.insight_id);
};

const fetchTermsForCategory = async (tokenDoc, customerId, loginCustomerId, campaignId, insightId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const query = `
    SELECT
      segments.search_subcategory,
      segments.search_term,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign_search_term_insight
    WHERE campaign_search_term_insight.campaign_id = '${campaignId}'
      AND campaign_search_term_insight.id = '${insightId}'
      AND segments.date BETWEEN '${start}' AND '${end}'
  `;
  const resp = await client.query(query);
  return toArray(resp).map((row) => {
    const seg = row.segments || {};
    const m = row.metrics || {};
    return {
      search_term:
        seg.search_term ||
        seg.searchTerm ||
        seg.search_subcategory_label ||
        seg.search_subcategory ||
        seg.searchSubcategoryLabel ||
        seg.searchSubcategory ||
        "(unknown)",
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: 0,
      conversions: num(m.conversions),
      conversion_value: num(m.conversions_value || m.conversionsValue),
      has_cost: false,
    };
  });
};

// Bounded-parallel mapper — limits concurrent in-flight promises so we don't
// overwhelm Google Ads API rate limits when an account has many campaigns.
const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
};

const fetchPMaxSearchTerms = async (tokenDoc, customerId, loginCustomerId, start, end, pmaxCampaigns) => {
  const out = [];
  let categoryFallbackCount = 0;
  let termCount = 0;
  let categoryFetchErrors = 0;
  let termFetchErrors = 0;

  const perCampaign = await mapWithConcurrency(pmaxCampaigns, 4, async (camp) => {
    let categories = [];
    try {
      categories = await fetchCategoriesForCampaign(tokenDoc, customerId, loginCustomerId, camp.id, start, end);
    } catch (err) {
      categoryFetchErrors++;
      console.warn(`  ⚠️  [pmax] ${camp.name} (${camp.id}): list categories failed — ${err.message?.slice(0, 120)}`);
      return { camp, items: [] };
    }
    if (categories.length === 0) return { camp, items: [] };

    // Drill into each category for individual terms; if drilling fails OR
    // returns nothing, fall back to the category's own aggregated metrics.
    const drilled = await mapWithConcurrency(categories, 4, async (cat) => {
      try {
        const terms = await fetchTermsForCategory(tokenDoc, customerId, loginCustomerId, camp.id, cat.insight_id, start, end);
        if (terms.length > 0) {
          termCount += terms.length;
          return terms.map((t) => ({ ...t, category_label: cat.category_label }));
        }
      } catch (err) {
        termFetchErrors++;
        // Fall through to category fallback
      }
      // Category-level fallback row
      categoryFallbackCount++;
      return [{
        search_term: cat.category_label,
        impressions: cat.impressions,
        clicks: cat.clicks,
        cost: 0,
        conversions: cat.conversions,
        conversion_value: cat.conversion_value,
        has_cost: false,
        category_label: cat.category_label,
      }];
    });
    return { camp, items: drilled.flat() };
  });

  for (const { camp, items } of perCampaign) {
    for (const t of items) {
      out.push({
        ...t,
        campaign_id: camp.id,
        campaign_name: camp.name,
        channel_type: "PERFORMANCE_MAX",
      });
    }
  }
  console.log(
    `  [pmax] ${out.length} rows total (${termCount} individual terms + ${categoryFallbackCount} category-level fallbacks; ` +
    `${categoryFetchErrors} category-fetch errors, ${termFetchErrors} term-fetch errors)`
  );
  return out;
};

// ============= JOB TRACKER (in-memory) =============
//
// Keyword report generation can take many minutes for accounts with many PMax
// campaigns. We can't keep an HTTP connection open that long (nginx, browser,
// load balancers all kill it). So /generate kicks off the work in the
// background and returns immediately; the frontend polls /status until done.
//
// In-memory map is lost on container restart — fine because the cached data
// in MongoDB is the source of truth and /status checks both.
const jobs = new Map();
const jobKey = (userId, customerId) => `${userId}_${customerId}`;
const setJob = (userId, customerId, patch) => {
  const k = jobKey(userId, customerId);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId) => jobs.get(jobKey(userId, customerId));

// Run the full generation pipeline. Returns a summary; throws on failure.
async function runKeywordGeneration(userId, cid) {
  const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
  if (!tokenDoc) throw new Error("Google Ads not connected");

  if (Date.now() > tokenDoc.expiryDate.getTime() - 60000) {
    const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
    await tokenDoc.save();
  }

  // Find a working login_customer_id and list every active/paused campaign
  const { login: workingLogin, campaigns } = await withLoginRetry(tokenDoc, cid, async (login) => {
    const c = await listAllCampaigns(tokenDoc, cid, login);
    return { login, campaigns: c };
  });

  const classicCampaigns = campaigns.filter((c) =>
    ["SEARCH", "SHOPPING", "DISPLAY"].includes(c.channel)
  );
  const pmaxCampaigns = campaigns.filter((c) => c.channel === "PERFORMANCE_MAX");

  console.log(
    `📊 [keywords] ${cid}: ${campaigns.length} total campaigns ` +
    `(${classicCampaigns.length} Search/Shopping/Display + ${pmaxCampaigns.length} PMax)`
  );

  setJob(userId, cid, {
    progress: `Found ${campaigns.length} campaigns; fetching search terms...`,
  });

  if (classicCampaigns.length === 0 && pmaxCampaigns.length === 0) {
    return { total_terms: 0, message: "No active campaigns found in this account." };
  }

  const allReports = [];

  for (const rpt of REPORT_TYPES) {
    setJob(userId, cid, { progress: `Processing ${rpt.type}...` });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - rpt.days);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const [classicRows, pmaxRows] = await Promise.all([
      fetchClassicSearchTerms(tokenDoc, cid, workingLogin, start, end, classicCampaigns.map((c) => c.id))
        .catch((e) => {
          console.warn(`  ⚠️  search_term_view (${rpt.type}): ${e.message?.slice(0, 100)}`);
          return [];
        }),
      fetchPMaxSearchTerms(tokenDoc, cid, workingLogin, start, end, pmaxCampaigns)
        .catch((e) => {
          console.warn(`  ⚠️  pmax insight (${rpt.type}): ${e.message?.slice(0, 100)}`);
          return [];
        }),
    ]);

    console.log(
      `  ${rpt.type}: classic rows=${classicRows.length}, pmax rows=${pmaxRows.length}`
    );

    // Aggregate by search_term across all campaigns/sources
    const termMap = new Map();
    for (const r of [...classicRows, ...pmaxRows]) {
      if (!r.search_term) continue;
      if (!termMap.has(r.search_term)) {
        termMap.set(r.search_term, {
          search_term: r.search_term,
          total_impressions: 0,
          total_clicks: 0,
          total_cost: 0,
          total_conversions: 0,
          total_conversion_value: 0,
          has_cost_data: false,
          channel_types: new Set(),
          campaigns: [],
        });
      }
      const row = termMap.get(r.search_term);
      row.total_impressions += r.impressions;
      row.total_clicks += r.clicks;
      row.total_cost += r.cost;
      row.total_conversions += r.conversions;
      row.total_conversion_value += r.conversion_value;
      if (r.has_cost) row.has_cost_data = true;
      row.channel_types.add(r.channel_type);
      row.campaigns.push({
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name,
        channel_type: r.channel_type,
        category_label: r.category_label,
        impressions: r.impressions,
        clicks: r.clicks,
        cost: r.cost,
        conversions: r.conversions,
        conversion_value: r.conversion_value,
      });
    }

    const docs = Array.from(termMap.values()).map((r) => {
      const ctr = r.total_impressions > 0 ? (r.total_clicks / r.total_impressions) * 100 : 0;
      const roas = r.total_cost > 0 ? r.total_conversion_value / r.total_cost : 0;
      return {
        search_term: r.search_term,
        total_impressions: r.total_impressions,
        total_clicks: r.total_clicks,
        total_cost: r.total_cost,
        total_conversions: r.total_conversions,
        total_conversion_value: r.total_conversion_value,
        ctr,
        roas,
        has_cost_data: r.has_cost_data,
        channel_types: Array.from(r.channel_types),
        campaigns: r.campaigns,
        category: categorize({
          impressions: r.total_impressions,
          clicks: r.total_clicks,
          cost: r.total_cost,
          conversions: r.total_conversions,
          conversion_value: r.total_conversion_value,
          has_cost: r.has_cost_data,
        }),
      };
    });

    await KeywordSearchTermReport.deleteMany({
      user: userId,
      customer_id: cid,
      report_type: rpt.type,
    });

    if (docs.length > 0) {
      await KeywordSearchTermReport.insertMany(
        docs.map((d) => ({
          user: userId,
          customer_id: cid,
          report_type: rpt.type,
          report_start_date: startDate,
          report_end_date: endDate,
          ...d,
        }))
      );
    }

    console.log(`  ✅ ${rpt.type}: stored ${docs.length} unique search terms`);
    allReports.push({ customer_id: cid, report_type: rpt.type, count: docs.length });
  }

  return {
    reports: allReports,
    total_campaigns: campaigns.length,
    classic_campaigns: classicCampaigns.length,
    pmax_campaigns: pmaxCampaigns.length,
    total_terms: allReports.reduce((s, r) => s + r.count, 0),
  };
}

// ============= MAIN CONTROLLER (now fire-and-forget) =============
export const generateKeywordReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });

  const cid = formatCustomerId(customer_id);

  // Reject if already running for this user+account
  const existing = getJob(userId, cid);
  if (existing?.status === "RUNNING") {
    return res.status(202).json({
      status: "ALREADY_RUNNING",
      startedAt: existing.startedAt,
      progress: existing.progress,
    });
  }

  // Quick sanity: must have a token. If not, fail fast.
  const tokenExists = await GoogleAdsToken.exists({ user: userId });
  if (!tokenExists) return res.status(401).json({ error: "Google Ads not connected" });

  setJob(userId, cid, {
    status: "RUNNING",
    startedAt: Date.now(),
    progress: "Starting...",
    error: null,
    result: null,
  });

  // Respond immediately — frontend polls /status until done
  res.status(202).json({ status: "STARTED" });

  // Fire and forget. Errors are captured into job state.
  runKeywordGeneration(userId, cid)
    .then((result) => {
      console.log(`✅ [keywords] ${cid}: complete — ${result.total_terms} terms`);
      setJob(userId, cid, {
        status: "COMPLETED",
        completedAt: Date.now(),
        result,
      });
    })
    .catch((err) => {
      console.error(`💥 [keywords] ${cid}: failed — ${err.message}`);
      setJob(userId, cid, {
        status: "FAILED",
        completedAt: Date.now(),
        error: err.message,
      });
    });
};


// ============= CACHED =============
export const getCachedKeywordReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, report_type } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    if (report_type) q.report_type = report_type;

    const rows = await KeywordSearchTermReport.find(q).lean();

    // Per-bucket summary
    const bucketMap = new Map();
    for (const r of rows) {
      const cat = r.category || "Other";
      if (!bucketMap.has(cat)) {
        bucketMap.set(cat, {
          bucket: cat,
          num_terms: 0,
          total_impressions: 0,
          total_clicks: 0,
          total_cost: 0,
          total_conversions: 0,
          total_conversion_value: 0,
        });
      }
      const b = bucketMap.get(cat);
      b.num_terms += 1;
      b.total_impressions += r.total_impressions;
      b.total_clicks += r.total_clicks;
      b.total_cost += r.total_cost || 0;
      b.total_conversions += r.total_conversions;
      b.total_conversion_value += r.total_conversion_value;
    }
    const summary_table = Array.from(bucketMap.values()).map((b) => ({
      ...b,
      ctr: b.total_impressions > 0 ? (b.total_clicks / b.total_impressions) * 100 : 0,
      roas: b.total_cost > 0 ? b.total_conversion_value / b.total_cost : 0,
    }));

    // TOTAL row
    const totals = rows.reduce(
      (acc, r) => {
        acc.num_terms += 1;
        acc.total_impressions += r.total_impressions;
        acc.total_clicks += r.total_clicks;
        acc.total_cost += r.total_cost || 0;
        acc.total_conversions += r.total_conversions;
        acc.total_conversion_value += r.total_conversion_value;
        return acc;
      },
      { bucket: "TOTAL", num_terms: 0, total_impressions: 0, total_clicks: 0, total_cost: 0, total_conversions: 0, total_conversion_value: 0 }
    );
    totals.ctr = totals.total_impressions > 0 ? (totals.total_clicks / totals.total_impressions) * 100 : 0;
    totals.roas = totals.total_cost > 0 ? totals.total_conversion_value / totals.total_cost : 0;
    summary_table.unshift(totals);

    // Distinct campaigns for filter dropdown
    const campaignMap = new Map();
    for (const r of rows) {
      for (const c of r.campaigns || []) {
        if (!campaignMap.has(c.campaign_id)) {
          campaignMap.set(c.campaign_id, {
            id: c.campaign_id,
            name: c.campaign_name,
            channel_type: c.channel_type,
          });
        }
      }
    }
    const campaign_list = Array.from(campaignMap.values());

    res.json({
      term_details: rows,
      summary_table,
      campaign_list,
      total_terms: rows.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= CLEAR =============
export const clearKeywordReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    const r = await KeywordSearchTermReport.deleteMany(q);
    res.json({ success: true, deleted: r.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= STATUS (for polling) =============
//
// Returns the current background job's state if one exists for this
// (user, customer) pair, otherwise falls back to checking whether stored data
// exists in MongoDB.
//
// Possible status values:
//   RUNNING    — job in progress
//   COMPLETED  — job finished, data ready
//   FAILED     — job errored (`error` field set)
//   NO_DATA    — no job and no cached data
export const getKeywordReportStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;

    // 1. Check live job state first
    const job = cid ? getJob(userId, cid) : null;
    if (job) {
      return res.json({
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        error: job.error,
        count: job.result?.total_terms,
      });
    }

    // 2. No active job — check DB for cached data
    const q = { user: userId };
    if (cid) q.customer_id = cid;
    const count = await KeywordSearchTermReport.countDocuments(q);
    res.json({
      status: count > 0 ? "COMPLETED" : "NO_DATA",
      count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
