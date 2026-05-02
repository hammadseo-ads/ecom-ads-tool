// PMax Product ROAS Analysis controller (Mike Rhodes-style bucketing).
//
// Pulls per-product PMax performance from `shopping_performance_view`,
// aggregates by product across campaigns, then buckets into:
//   Heroes        | high-ROAS, high-spend (the winners)
//   Costly        | high spend, low ROAS (cut or restructure)
//   Zombies       | impressions but ZERO clicks (dead in the listing)
//   Sleepers      | clicks but ZERO conversions (broken landing page / wrong intent?)
//   Low Volume    | below the min-spend threshold (insufficient data)
//
// Thresholds are user-configurable per (account × tool) — saved on
// GoogleAdsToken.toolSettings.productRoas. Defaults filled if missing.
//
// Async/polling pattern mirrors keyword-tool: /generate kicks off background
// job, returns 202 STARTED; frontend polls /status until COMPLETED.

import ProductPerformanceReport from "../models/ProductPerformanceReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";

const REPORT_TYPES = [
  { type: "LAST_30_DAYS", days: 30 },
  { type: "LAST_60_DAYS", days: 60 },
  { type: "LAST_90_DAYS", days: 90 },
];

const DEFAULT_THRESHOLDS = {
  targetRoas: 4,            // Heroes need ROAS >= this
  costlyRoasMax: 2,         // Costly = spend >= minSpend AND ROAS < this
  minSpend: 50,             // Below this → Low Volume bucket
  minClicksForSleeper: 5,   // Sleepers need at least this many clicks
};

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";

const num = (v) => Number(v ?? 0) || 0;

const toArray = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.results)) return resp.results;
  if (typeof resp[Symbol.iterator] === "function") return Array.from(resp);
  return [];
};

const candidateLogins = (tokenDoc, customerId) => [
  null,
  ...(tokenDoc.allCustomerIds || [])
    .map(formatCustomerId)
    .filter((id) => id && id !== customerId),
];

const isAuthError = (msg) =>
  /permission|not allowed|authorization|access|customer not enabled/i.test(msg || "");

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

// Bucket assignment — single source of truth. Mutually exclusive, first match.
// Order matters: Heroes wins over Sleepers wins over Zombies wins over Costly
// wins over Low Volume.
const bucketize = (row, t) => {
  const { total_impressions: imp, total_clicks: clicks, total_cost: cost,
          total_conversions: conv, roas } = row;

  // Below min-spend threshold and not zombie/sleeper-worthy → Low Volume
  if (cost < t.minSpend && imp < 100 && clicks < t.minClicksForSleeper) {
    return "Low Volume";
  }

  // Heroes: profitable + has spent meaningful money
  if (roas >= t.targetRoas && cost >= t.minSpend) return "Heroes";

  // Sleepers: getting clicks but zero conversions (broken funnel?)
  if (clicks >= t.minClicksForSleeper && conv === 0) return "Sleepers";

  // Zombies: impressions but no clicks (dead listing — title/image issue)
  if (imp > 100 && clicks === 0) return "Zombies";

  // Costly: real spend, weak return
  if (cost >= t.minSpend && roas < t.costlyRoasMax) return "Costly";

  return "Low Volume";
};

// ============= JOB TRACKER (in-memory, mirrors keyword tool) =============
const jobs = new Map();
const jobKey = (userId, customerId) => `${userId}_${customerId}`;
const setJob = (userId, customerId, patch) => {
  const k = jobKey(userId, customerId);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId) => jobs.get(jobKey(userId, customerId));

// Resolve effective thresholds for this (user, account) — saved values
// filled in with defaults for any missing keys.
const resolveThresholds = (tokenDoc, cid) => {
  const saved = tokenDoc.toolSettings?.productRoas?.[cid] || {};
  return { ...DEFAULT_THRESHOLDS, ...saved };
};

// ============= GAQL FETCH =============
//
// Fetches all PMax product rows for one period.
// Aggregates duplicates (same product across multiple PMax campaigns) into
// one row per product, with the per-campaign breakdown saved in `campaigns`.
const fetchPMaxProductsForPeriod = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const query = `
    SELECT
      segments.product_item_id,
      segments.product_title,
      segments.product_brand,
      segments.product_type_l1,
      segments.product_type_l2,
      segments.product_type_l3,
      segments.product_type_l4,
      segments.product_type_l5,
      segments.product_custom_attribute0,
      segments.product_custom_attribute1,
      segments.product_custom_attribute2,
      segments.product_custom_attribute3,
      segments.product_custom_attribute4,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM shopping_performance_view
    WHERE segments.date BETWEEN '${start}' AND '${end}'
      AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
      AND metrics.impressions > 0
  `;

  const resp = await client.query(query);
  const rows = toArray(resp);

  // Aggregate by product_item_id
  const byProduct = new Map();
  for (const row of rows) {
    const seg = row.segments || {};
    const camp = row.campaign || {};
    const m = row.metrics || {};

    const productId = seg.product_item_id || seg.productItemId;
    if (!productId) continue;

    const impressions = num(m.impressions);
    const clicks = num(m.clicks);
    const cost = num(m.cost_micros) / 1e6;
    const conversions = num(m.conversions);
    const conversion_value = num(m.conversions_value || m.conversionsValue);

    if (!byProduct.has(productId)) {
      byProduct.set(productId, {
        product_item_id: productId,
        product_title: seg.product_title || seg.productTitle || `Product ${productId}`,
        product_brand: seg.product_brand || seg.productBrand || "",
        product_type_l1: seg.product_type_l1 || seg.productTypeL1 || "",
        product_type_l2: seg.product_type_l2 || seg.productTypeL2 || "",
        product_type_l3: seg.product_type_l3 || seg.productTypeL3 || "",
        product_type_l4: seg.product_type_l4 || seg.productTypeL4 || "",
        product_type_l5: seg.product_type_l5 || seg.productTypeL5 || "",
        custom_label_0: seg.product_custom_attribute0 || seg.productCustomAttribute0 || "",
        custom_label_1: seg.product_custom_attribute1 || seg.productCustomAttribute1 || "",
        custom_label_2: seg.product_custom_attribute2 || seg.productCustomAttribute2 || "",
        custom_label_3: seg.product_custom_attribute3 || seg.productCustomAttribute3 || "",
        custom_label_4: seg.product_custom_attribute4 || seg.productCustomAttribute4 || "",
        campaigns: [],
        total_impressions: 0,
        total_clicks: 0,
        total_cost: 0,
        total_conversions: 0,
        total_conversion_value: 0,
      });
    }

    const p = byProduct.get(productId);
    p.total_impressions += impressions;
    p.total_clicks += clicks;
    p.total_cost += cost;
    p.total_conversions += conversions;
    p.total_conversion_value += conversion_value;
    p.campaigns.push({
      campaign_id: String(camp.id || ""),
      campaign_name: camp.name || `Campaign ${camp.id || ""}`,
      impressions,
      clicks,
      cost,
      conversions,
      conversion_value,
    });
  }

  return Array.from(byProduct.values());
};

// ============= MAIN GENERATION (background) =============
async function runProductRoasGeneration(userId, cid) {
  const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
  if (!tokenDoc) throw new Error("Google Ads not connected");

  // Refresh access token if needed
  if (Date.now() > tokenDoc.expiryDate?.getTime() - 60000) {
    const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
    await tokenDoc.save();
  }

  const thresholds = resolveThresholds(tokenDoc, cid);
  const allReports = [];

  for (const rpt of REPORT_TYPES) {
    setJob(userId, cid, { progress: `Fetching ${rpt.type}...` });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - rpt.days);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    let products = [];
    try {
      products = await withLoginRetry(tokenDoc, cid, (login) =>
        fetchPMaxProductsForPeriod(tokenDoc, cid, login, start, end)
      );
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err.message || "";
      console.warn(`  [product-roas] ${rpt.type} fetch failed: ${msg.slice(0, 200)}`);
      allReports.push({ report_type: rpt.type, count: 0, error: msg });
      continue;
    }

    // Compute derived metrics + bucket
    const docs = products.map((p) => {
      const roas = p.total_cost > 0 ? p.total_conversion_value / p.total_cost : 0;
      const cpa = p.total_conversions > 0 ? p.total_cost / p.total_conversions : 0;
      const ctr = p.total_impressions > 0 ? (p.total_clicks / p.total_impressions) * 100 : 0;
      const conv_rate = p.total_clicks > 0 ? (p.total_conversions / p.total_clicks) * 100 : 0;
      const enriched = { ...p, roas, cpa, ctr, conv_rate };
      enriched.bucket = bucketize(enriched, thresholds);
      return enriched;
    });

    // Replace previous data for this user+customer+period
    await ProductPerformanceReport.deleteMany({
      user: userId, customer_id: cid, report_type: rpt.type,
    });

    if (docs.length > 0) {
      await ProductPerformanceReport.insertMany(
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

    console.log(`  [product-roas] ${rpt.type}: ${docs.length} products bucketed`);
    allReports.push({ report_type: rpt.type, count: docs.length });
  }

  return {
    reports: allReports,
    total_products: allReports.reduce((s, r) => s + (r.count || 0), 0),
    thresholds,
  };
}

// ============= CONTROLLERS =============

export const generateProductRoasReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
  const cid = formatCustomerId(customer_id);

  // Reject duplicate concurrent jobs
  const existing = getJob(userId, cid);
  if (existing?.status === "RUNNING") {
    return res.status(202).json({
      status: "ALREADY_RUNNING",
      startedAt: existing.startedAt,
      progress: existing.progress,
    });
  }

  const tokenExists = await GoogleAdsToken.exists({ user: userId });
  if (!tokenExists) return res.status(401).json({ error: "Google Ads not connected" });

  setJob(userId, cid, {
    status: "RUNNING",
    startedAt: Date.now(),
    progress: "Starting...",
    error: null,
    result: null,
  });

  res.status(202).json({ status: "STARTED" });

  // Fire and forget
  runProductRoasGeneration(userId, cid)
    .then((result) => {
      console.log(`✅ [product-roas] ${cid}: complete — ${result.total_products} products`);
      setJob(userId, cid, { status: "COMPLETED", completedAt: Date.now(), result });
    })
    .catch((err) => {
      console.error(`💥 [product-roas] ${cid}: failed — ${err.message}`);
      setJob(userId, cid, { status: "FAILED", completedAt: Date.now(), error: err.message });
    });
};

export const getProductRoasStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;

    const job = cid ? getJob(userId, cid) : null;
    if (job) {
      return res.json({
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        error: job.error,
        count: job.result?.total_products,
      });
    }
    const q = { user: userId };
    if (cid) q.customer_id = cid;
    const count = await ProductPerformanceReport.countDocuments(q);
    res.json({ status: count > 0 ? "COMPLETED" : "NO_DATA", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCachedProductRoas = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, report_type } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    if (report_type) q.report_type = report_type;

    const rows = await ProductPerformanceReport.find(q).lean();

    // Per-bucket summary
    const bucketMap = new Map();
    for (const r of rows) {
      const cat = r.bucket || "Low Volume";
      if (!bucketMap.has(cat)) {
        bucketMap.set(cat, {
          bucket: cat,
          num_products: 0,
          total_impressions: 0,
          total_clicks: 0,
          total_cost: 0,
          total_conversions: 0,
          total_conversion_value: 0,
        });
      }
      const b = bucketMap.get(cat);
      b.num_products += 1;
      b.total_impressions += r.total_impressions;
      b.total_clicks += r.total_clicks;
      b.total_cost += r.total_cost;
      b.total_conversions += r.total_conversions;
      b.total_conversion_value += r.total_conversion_value;
    }
    const summary_table = Array.from(bucketMap.values()).map((b) => ({
      ...b,
      ctr: b.total_impressions > 0 ? (b.total_clicks / b.total_impressions) * 100 : 0,
      roas: b.total_cost > 0 ? b.total_conversion_value / b.total_cost : 0,
      cpa: b.total_conversions > 0 ? b.total_cost / b.total_conversions : 0,
    }));

    // TOTAL row
    const totals = rows.reduce((acc, r) => {
      acc.num_products += 1;
      acc.total_impressions += r.total_impressions;
      acc.total_clicks += r.total_clicks;
      acc.total_cost += r.total_cost;
      acc.total_conversions += r.total_conversions;
      acc.total_conversion_value += r.total_conversion_value;
      return acc;
    }, {
      bucket: "TOTAL",
      num_products: 0, total_impressions: 0, total_clicks: 0,
      total_cost: 0, total_conversions: 0, total_conversion_value: 0,
    });
    totals.ctr = totals.total_impressions > 0 ? (totals.total_clicks / totals.total_impressions) * 100 : 0;
    totals.roas = totals.total_cost > 0 ? totals.total_conversion_value / totals.total_cost : 0;
    totals.cpa = totals.total_conversions > 0 ? totals.total_cost / totals.total_conversions : 0;
    summary_table.unshift(totals);

    res.json({
      product_details: rows,
      summary_table,
      total_products: rows.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearProductRoasReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    const r = await ProductPerformanceReport.deleteMany(q);
    res.json({ success: true, deleted: r.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= THRESHOLDS (GET / SET) =============

export const getProductRoasThresholds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
    const cid = formatCustomerId(customer_id);
    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    const thresholds = tokenDoc ? resolveThresholds(tokenDoc, cid) : DEFAULT_THRESHOLDS;
    res.json({ thresholds, defaults: DEFAULT_THRESHOLDS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductRoasThresholds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, thresholds } = req.body;
    if (!customer_id || !thresholds) {
      return res.status(400).json({ error: "Missing customer_id or thresholds" });
    }
    const cid = formatCustomerId(customer_id);

    // Validate + sanitize numeric inputs
    const sanitized = {};
    for (const key of ["targetRoas", "costlyRoasMax", "minSpend", "minClicksForSleeper"]) {
      if (thresholds[key] !== undefined) {
        const n = Number(thresholds[key]);
        if (Number.isFinite(n) && n >= 0) sanitized[key] = n;
      }
    }
    if (Object.keys(sanitized).length === 0) {
      return res.status(400).json({ error: "No valid threshold values provided" });
    }

    const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
    if (!tokenDoc) return res.status(401).json({ error: "Google Ads not connected" });

    const ts = tokenDoc.toolSettings || {};
    ts.productRoas = ts.productRoas || {};
    ts.productRoas[cid] = { ...(ts.productRoas[cid] || {}), ...sanitized };
    tokenDoc.toolSettings = ts;
    tokenDoc.markModified("toolSettings");
    await tokenDoc.save();

    res.json({ thresholds: { ...DEFAULT_THRESHOLDS, ...ts.productRoas[cid] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
