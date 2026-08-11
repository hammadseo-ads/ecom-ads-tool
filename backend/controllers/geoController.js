// Geographic / Zip Code Performance Analysis controller.
//
// Fetches geographic_view rows segmented by location, then resolves the
// returned criterion IDs to human-readable names via geo_target_constant
// lookups (Google Ads API doesn't return city/postal-code names directly).
//
// Bucketing thresholds are user-saved per (account × tool). Defaults:
//   targetRoas    — Winner if ROAS >= this AND spend >= minSpend
//   maxLoserRoas  — Loser if spend >= minSpend AND ROAS < this
//   minSpend      — below this → Sparse bucket (insufficient data)
//
// Critical caveat the page surfaces: PMax campaigns DO NOT support
// location-based bid adjustments — only full exclusion. We expose
// channel_type per contributing campaign so the UI can label the
// recommended action correctly.

import GeoPerformanceReport from "../models/GeoPerformanceReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";
import { CHANNEL_TYPE, CAMPAIGN_STATUS, enumName } from "../utils/googleAdsEnums.js";

const REPORT_TYPES = [
  { type: "LAST_30_DAYS", days: 30 },
  { type: "LAST_60_DAYS", days: 60 },
  { type: "LAST_90_DAYS", days: 90 },
];

// Opt-in only (geo lookups over a full year are heavy) — generated separately
// when the user explicitly clicks "Generate 1-Year", never in the default run.
const YEAR_REPORT_TYPE = { type: "LAST_365_DAYS", days: 365 };

const DEFAULT_THRESHOLDS = {
  targetRoas: 3,
  maxLoserRoas: 1.5,
  minSpend: 25,
};

const GRANULARITY_TO_SEGMENT = {
  postal_code: { segment: "geo_target_postal_code", target_type: "Postal Code" },
  city:        { segment: "geo_target_city",        target_type: "City" },
  region:      { segment: "geo_target_region",      target_type: "Region" },
  metro:       { segment: "geo_target_metro",       target_type: "Metro" },
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
  ...(tokenDoc.allCustomerIds || []).map(formatCustomerId).filter((id) => id && id !== customerId),
];
const isAuthError = (msg) =>
  /permission|not allowed|authorization|access|customer not enabled/i.test(msg || "");
const withLoginRetry = async (tokenDoc, customerId, fn) => {
  let lastErr = null;
  for (const login of candidateLogins(tokenDoc, customerId)) {
    try { return await fn(login); }
    catch (err) {
      lastErr = err;
      const msg = err?.errors?.[0]?.message || err.message || "";
      if (!isAuthError(msg)) throw err;
    }
  }
  throw lastErr || new Error("All login_customer_id candidates failed");
};

const bucketize = (row, t) => {
  if (row.total_cost < t.minSpend) return "Sparse";
  if (row.roas >= t.targetRoas) return "Winner";
  if (row.roas < t.maxLoserRoas) return "Loser";
  return "Sparse";
};

const resolveThresholds = (tokenDoc, cid) => {
  const saved = tokenDoc.toolSettings?.geo?.[cid] || {};
  return { ...DEFAULT_THRESHOLDS, ...saved };
};

// ============= JOB TRACKER =============
const jobs = new Map();
const jobKey = (userId, customerId, granularity) => `${userId}_${customerId}_${granularity}`;
const setJob = (userId, customerId, granularity, patch) => {
  const k = jobKey(userId, customerId, granularity);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId, granularity) => jobs.get(jobKey(userId, customerId, granularity));

// ============= CAMPAIGN TYPE MAP =============
// Need channel_type per campaign to know which actions are valid per row.
const fetchCampaignTypeMap = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(`
    SELECT campaign.id, campaign.name, campaign.advertising_channel_type, campaign.status
    FROM campaign WHERE campaign.status IN ('ENABLED', 'PAUSED')
  `);
  const map = new Map();
  for (const row of toArray(resp)) {
    const c = row.campaign || row;
    // Decode numeric enum (e.g. 10) → "PERFORMANCE_MAX" so per-row action
    // labels (which test channel_type === "PERFORMANCE_MAX") work correctly.
    const ct = enumName(CHANNEL_TYPE, c?.advertising_channel_type ?? c?.advertisingChannelType);
    map.set(String(c.id), {
      campaign_id: String(c.id),
      campaign_name: c.name || `Campaign ${c.id}`,
      channel_type: ct,
      status: enumName(CAMPAIGN_STATUS, c?.status),
    });
  }
  return map;
};

// ============= GEO ROWS FETCH =============
const fetchGeoRows = async (tokenDoc, customerId, loginCustomerId, start, end, segment) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const query = `
    SELECT
      campaign.id,
      segments.${segment},
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM geographic_view
    WHERE segments.date BETWEEN '${start}' AND '${end}'
      AND metrics.impressions > 0
  `;
  const resp = await client.query(query);
  return toArray(resp).map((row) => {
    const c = row.campaign || {};
    const seg = row.segments || {};
    const m = row.metrics || {};
    // Segment value comes back as a resource-name like "geoTargetConstants/1014221"
    const rawCriterion = seg[segment] || seg[segment.replace(/_(.)/g, (_, l) => l.toUpperCase())];
    const criterion_id = rawCriterion
      ? String(rawCriterion).replace(/^geoTargetConstants\//, "").trim()
      : null;
    return {
      campaign_id: String(c.id || ""),
      criterion_id,
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: num(m.cost_micros) / 1e6,
      conversions: num(m.conversions),
      conversion_value: num(m.conversions_value || m.conversionsValue),
    };
  }).filter((r) => r.criterion_id);
};

// ============= RESOLVE GEO NAMES =============
// Fetch in batches of 100 (GAQL allows up to 10K resources per IN(), but
// 100 keeps each query lightweight).
const resolveGeoNames = async (tokenDoc, customerId, loginCustomerId, criterionIds) => {
  if (criterionIds.length === 0) return new Map();
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const map = new Map();
  for (let i = 0; i < criterionIds.length; i += 100) {
    const chunk = criterionIds.slice(i, i + 100);
    const idList = chunk.map((id) => `'${id}'`).join(", ");
    try {
      const resp = await client.query(`
        SELECT
          geo_target_constant.id,
          geo_target_constant.name,
          geo_target_constant.canonical_name,
          geo_target_constant.target_type,
          geo_target_constant.country_code,
          geo_target_constant.status
        FROM geo_target_constant
        WHERE geo_target_constant.id IN (${idList})
      `);
      for (const row of toArray(resp)) {
        const g = row.geo_target_constant || row.geoTargetConstant || row;
        const id = String(g.id);
        map.set(id, {
          name: g.name || id,
          canonical_name: g.canonical_name || g.canonicalName || g.name || id,
          target_type: g.target_type || g.targetType || "",
          country_code: g.country_code || g.countryCode || "",
        });
      }
    } catch (err) {
      console.warn(`  [geo] resolve names chunk failed: ${err.message?.slice(0, 100)}`);
    }
  }
  return map;
};

// ============= MAIN GENERATION =============
async function runGeoGeneration(userId, cid, granularity, reportTypes = REPORT_TYPES) {
  const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
  if (!tokenDoc) throw new Error("Google Ads not connected");

  if (Date.now() > tokenDoc.expiryDate?.getTime() - 60000) {
    const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
    await tokenDoc.save();
  }

  const granConfig = GRANULARITY_TO_SEGMENT[granularity];
  if (!granConfig) throw new Error(`Unknown granularity: ${granularity}`);

  setJob(userId, cid, granularity, { progress: "Listing campaigns..." });
  const { login: workingLogin, campaignMap } = await withLoginRetry(tokenDoc, cid, async (login) => {
    const m = await fetchCampaignTypeMap(tokenDoc, cid, login);
    return { login, campaignMap: m };
  });

  const thresholds = resolveThresholds(tokenDoc, cid);
  const allReports = [];

  for (const rpt of reportTypes) {
    setJob(userId, cid, granularity, { progress: `Fetching ${granularity} for ${rpt.type}...` });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - rpt.days);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    let raw = [];
    try {
      raw = await fetchGeoRows(tokenDoc, cid, workingLogin, start, end, granConfig.segment);
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err.message || "";
      console.warn(`  [geo] ${rpt.type} (${granularity}) fetch failed: ${msg.slice(0, 200)}`);
      allReports.push({ report_type: rpt.type, error: msg });
      continue;
    }

    // Aggregate by criterion_id
    const byGeo = new Map();
    for (const r of raw) {
      if (!byGeo.has(r.criterion_id)) {
        byGeo.set(r.criterion_id, {
          criterion_id: r.criterion_id,
          campaigns: new Map(),
          total_impressions: 0, total_clicks: 0, total_cost: 0,
          total_conversions: 0, total_conversion_value: 0,
        });
      }
      const g = byGeo.get(r.criterion_id);
      g.total_impressions += r.impressions;
      g.total_clicks += r.clicks;
      g.total_cost += r.cost;
      g.total_conversions += r.conversions;
      g.total_conversion_value += r.conversion_value;

      // Per-campaign breakdown for this geo
      if (!g.campaigns.has(r.campaign_id)) {
        const meta = campaignMap.get(r.campaign_id) || {
          campaign_id: r.campaign_id, campaign_name: `Campaign ${r.campaign_id}`, channel_type: "UNKNOWN",
        };
        g.campaigns.set(r.campaign_id, {
          ...meta,
          impressions: 0, clicks: 0, cost: 0, conversions: 0, conversion_value: 0,
        });
      }
      const cb = g.campaigns.get(r.campaign_id);
      cb.impressions += r.impressions;
      cb.clicks += r.clicks;
      cb.cost += r.cost;
      cb.conversions += r.conversions;
      cb.conversion_value += r.conversion_value;
    }

    // Resolve criterion IDs → names (chunk 100 at a time)
    const criterionIds = Array.from(byGeo.keys());
    setJob(userId, cid, granularity, { progress: `Resolving ${criterionIds.length} location names...` });
    const nameMap = await resolveGeoNames(tokenDoc, cid, workingLogin, criterionIds);

    // Compute derived + bucket
    const rows = Array.from(byGeo.values()).map((g) => {
      const ctr = g.total_impressions > 0 ? (g.total_clicks / g.total_impressions) * 100 : 0;
      const conv_rate = g.total_clicks > 0 ? (g.total_conversions / g.total_clicks) * 100 : 0;
      const roas = g.total_cost > 0 ? g.total_conversion_value / g.total_cost : 0;
      const cpa = g.total_conversions > 0 ? g.total_cost / g.total_conversions : 0;
      const meta = nameMap.get(g.criterion_id) || {};
      const enriched = {
        criterion_id: g.criterion_id,
        name: meta.name || g.criterion_id,
        canonical_name: meta.canonical_name || meta.name || g.criterion_id,
        target_type: meta.target_type || granConfig.target_type,
        country_code: meta.country_code || "",
        total_impressions: g.total_impressions,
        total_clicks: g.total_clicks,
        total_cost: g.total_cost,
        total_conversions: g.total_conversions,
        total_conversion_value: g.total_conversion_value,
        ctr, conv_rate, roas, cpa,
        campaigns: Array.from(g.campaigns.values()),
      };
      enriched.bucket = bucketize(enriched, thresholds);
      return enriched;
    });

    await GeoPerformanceReport.deleteMany({
      user: userId, customer_id: cid, report_type: rpt.type, granularity,
    });
    if (rows.length > 0) {
      await GeoPerformanceReport.create({
        user: userId, customer_id: cid, report_type: rpt.type, granularity,
        report_start_date: startDate, report_end_date: endDate,
        rows,
      });
    }

    console.log(`  [geo] ${rpt.type} (${granularity}): stored ${rows.length} locations`);
    allReports.push({ report_type: rpt.type, count: rows.length });
  }

  return {
    reports: allReports,
    granularity,
    total_locations: allReports.reduce((s, r) => s + (r.count || 0), 0),
    thresholds,
  };
}

// ============= CONTROLLERS =============

export const generateGeoReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id, granularity = "postal_code", scope } = req.body;
  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
  if (!GRANULARITY_TO_SEGMENT[granularity]) {
    return res.status(400).json({ error: `Unknown granularity: ${granularity}` });
  }
  const cid = formatCustomerId(customer_id);

  // scope="year" → only the 1-year report (opt-in). Anything else → 30/60/90.
  const reportTypes = scope === "year" ? [YEAR_REPORT_TYPE] : REPORT_TYPES;

  const existing = getJob(userId, cid, granularity);
  if (existing?.status === "RUNNING") {
    return res.status(202).json({
      status: "ALREADY_RUNNING", startedAt: existing.startedAt, progress: existing.progress,
    });
  }
  const tokenExists = await GoogleAdsToken.exists({ user: userId });
  if (!tokenExists) return res.status(401).json({ error: "Google Ads not connected" });

  setJob(userId, cid, granularity, {
    status: "RUNNING", startedAt: Date.now(), progress: "Starting...", error: null, result: null,
  });
  res.status(202).json({ status: "STARTED" });

  runGeoGeneration(userId, cid, granularity, reportTypes)
    .then((result) => {
      console.log(`✅ [geo] ${cid} (${granularity}): complete — ${result.total_locations} locations (scope=${scope || "standard"})`);
      setJob(userId, cid, granularity, { status: "COMPLETED", completedAt: Date.now(), result });
    })
    .catch((err) => {
      console.error(`💥 [geo] ${cid}: failed — ${err.message}`);
      setJob(userId, cid, granularity, { status: "FAILED", completedAt: Date.now(), error: err.message });
    });
};

export const getGeoStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, granularity = "postal_code" } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;
    const job = cid ? getJob(userId, cid, granularity) : null;
    if (job) {
      return res.json({
        status: job.status, progress: job.progress,
        startedAt: job.startedAt, completedAt: job.completedAt, error: job.error,
        count: job.result?.total_locations,
      });
    }
    const q = { user: userId };
    if (cid) q.customer_id = cid;
    if (granularity) q.granularity = granularity;
    const count = await GeoPerformanceReport.countDocuments(q);
    res.json({ status: count > 0 ? "COMPLETED" : "NO_DATA" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCachedGeo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, report_type, granularity = "postal_code" } = req.body;
    if (!customer_id || !report_type) {
      return res.status(400).json({ error: "Missing customer_id or report_type" });
    }
    const cid = formatCustomerId(customer_id);
    const doc = await GeoPerformanceReport.findOne({
      user: userId, customer_id: cid, report_type, granularity,
    }).lean();

    if (!doc) {
      return res.json({ rows: [], summary_table: [], total_locations: 0, granularity });
    }

    // Bucket summary
    const bucketMap = new Map();
    for (const r of doc.rows || []) {
      const b = r.bucket || "Sparse";
      if (!bucketMap.has(b)) {
        bucketMap.set(b, {
          bucket: b, num_locations: 0,
          total_impressions: 0, total_clicks: 0, total_cost: 0,
          total_conversions: 0, total_conversion_value: 0,
        });
      }
      const s = bucketMap.get(b);
      s.num_locations += 1;
      s.total_impressions += r.total_impressions;
      s.total_clicks += r.total_clicks;
      s.total_cost += r.total_cost;
      s.total_conversions += r.total_conversions;
      s.total_conversion_value += r.total_conversion_value;
    }
    const summary_table = Array.from(bucketMap.values()).map((b) => ({
      ...b,
      ctr: b.total_impressions > 0 ? (b.total_clicks / b.total_impressions) * 100 : 0,
      roas: b.total_cost > 0 ? b.total_conversion_value / b.total_cost : 0,
      // CPL (cost per lead) — for lead-gen analysis where ROAS is ~0.
      cpa: b.total_conversions > 0 ? b.total_cost / b.total_conversions : 0,
    }));

    res.json({
      rows: doc.rows,
      summary_table,
      total_locations: doc.rows.length,
      granularity,
      report_start_date: doc.report_start_date,
      report_end_date: doc.report_end_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearGeoReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    const r = await GeoPerformanceReport.deleteMany(q);
    res.json({ success: true, deleted: r.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGeoThresholds = async (req, res) => {
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

export const updateGeoThresholds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id, thresholds } = req.body;
    if (!customer_id || !thresholds) {
      return res.status(400).json({ error: "Missing customer_id or thresholds" });
    }
    const cid = formatCustomerId(customer_id);
    const sanitized = {};
    for (const key of ["targetRoas", "maxLoserRoas", "minSpend"]) {
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
    ts.geo = ts.geo || {};
    ts.geo[cid] = { ...(ts.geo[cid] || {}), ...sanitized };
    tokenDoc.toolSettings = ts;
    tokenDoc.markModified("toolSettings");
    await tokenDoc.save();
    res.json({ thresholds: { ...DEFAULT_THRESHOLDS, ...ts.geo[cid] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
