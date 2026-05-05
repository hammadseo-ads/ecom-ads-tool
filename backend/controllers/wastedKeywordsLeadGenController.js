// Lead-Gen Budget Wastage by Keywords controller.
//
// Pulls every search term from `search_term_view` over the chosen lookback
// window (30 / 60 / 90 days) where:
//     metrics.cost_micros > 0
//   AND metrics.conversions = 0
//
// In other words: we paid Google for the click, the user clicked, and they
// never converted. For lead-gen accounts these are the strongest negative-
// keyword candidates because there's no "but they bought later" excuse —
// the conversion is a form-fill or call, which would have happened in-session.
//
// PMax is excluded because Google does not expose cost per PMax search term;
// "wasted spend" can't be computed without cost.
//
// Same async fire-and-forget + DB-cached pattern as the eCommerce keyword
// tool. In-memory job tracker per (user, customer_id, days). Results stored
// per-row in WastedKeywordsLeadGenReport.

import WastedKeywordsLeadGenReport from "../models/WastedKeywordsLeadGenReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import {
  getGoogleAdsClient,
  refreshGoogleToken,
} from "../utils/googleAdsClient.js";

const ALLOWED_DAYS = new Set([30, 60, 90]);

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";

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
  /permission|not allowed|authorization|access|customer not enabled/i.test(
    msg || ""
  );

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

// Channel-type numeric → string. Search/Shopping/Display are the only
// channel types that expose per-search-term cost.
const CHANNEL_ENUM = {
  2: "SEARCH",
  3: "DISPLAY",
  4: "SHOPPING",
  10: "PERFORMANCE_MAX",
};
const channelTypeStr = (v) =>
  typeof v === "number" ? CHANNEL_ENUM[v] || `UNKNOWN_${v}` : String(v ?? "UNKNOWN");

// In-memory job tracker (per Node process). DB is source of truth — this is
// just so the frontend can poll status while a long query is running.
const jobs = new Map();
const jobKey = (userId, customerId, days) =>
  `${userId}_${customerId}_${days}`;
const setJob = (userId, customerId, days, patch) => {
  const k = jobKey(userId, customerId, days);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId, days) =>
  jobs.get(jobKey(userId, customerId, days));

async function runGeneration(userId, cid, days) {
  const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
  if (!tokenDoc) throw new Error("Google Ads not connected");

  if (
    tokenDoc.expiryDate &&
    Date.now() > tokenDoc.expiryDate.getTime() - 60000
  ) {
    const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
    await tokenDoc.save();
  }

  setJob(userId, cid, days, { progress: "Querying Google Ads..." });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  // We exclude PMax in the WHERE clause server-side. Search/Shopping/Display
  // exposes cost; PMax does not, so it's not useful for "wasted spend."
  const gaql = `
    SELECT
      search_term_view.search_term,
      search_term_view.status,
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      ad_group.id,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE segments.date >= '${start}'
      AND segments.date <= '${end}'
      AND metrics.cost_micros > 0
      AND metrics.conversions = 0
      AND campaign.advertising_channel_type IN ('SEARCH', 'SHOPPING', 'DISPLAY')
    ORDER BY metrics.cost_micros DESC
    LIMIT 5000
  `;

  const rows = await withLoginRetry(tokenDoc, cid, async (login) => {
    const client = getGoogleAdsClient(tokenDoc.refreshToken, cid, login);
    const resp = await client.query(gaql);
    return toArray(resp);
  });

  // Aggregate per (search_term, campaign_id) — same term appearing across
  // multiple dates / ad groups gets summed at the campaign level.
  const grouped = new Map();
  for (const r of rows) {
    const stv = r.search_term_view || {};
    const camp = r.campaign || {};
    const ag = r.ad_group || {};
    const m = r.metrics || {};

    const term = stv.search_term ?? r.search_term;
    if (!term) continue;
    const campId = String(camp.id ?? "");
    const key = `${term}__${campId}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        search_term: term,
        status: stv.status || null,
        campaign_id: campId,
        campaign_name: camp.name || `Campaign ${campId}`,
        channel_type: channelTypeStr(camp.advertising_channel_type),
        ad_group_id: String(ag.id ?? ""),
        ad_group_name: ag.name || null,
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0,
      });
    }
    const e = grouped.get(key);
    e.impressions += num(m.impressions);
    e.clicks += num(m.clicks);
    e.cost += num(m.cost_micros) / 1e6;
    e.conversions += num(m.conversions);
  }

  // Wipe and re-insert for this (user, customer, days)
  await WastedKeywordsLeadGenReport.deleteMany({
    user: userId,
    customer_id: cid,
    days,
  });

  const docs = Array.from(grouped.values());
  if (docs.length > 0) {
    await WastedKeywordsLeadGenReport.insertMany(
      docs.map((d) => ({
        user: userId,
        customer_id: cid,
        days,
        report_start_date: startDate,
        report_end_date: endDate,
        ...d,
      }))
    );
  }

  return {
    customer_id: cid,
    days,
    rows_returned: rows.length,
    unique_term_campaign_pairs: docs.length,
    total_wasted_cost: docs.reduce((s, d) => s + d.cost, 0),
  };
}

// ============= ENDPOINTS =============

export const generateLeadGenWastedKeywords = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { customer_id, days = 30 } = req.body;
  if (!customer_id)
    return res.status(400).json({ error: "Missing customer_id" });
  if (!ALLOWED_DAYS.has(Number(days)))
    return res.status(400).json({ error: "days must be 30, 60, or 90" });

  const cid = formatCustomerId(customer_id);
  const dnum = Number(days);

  const existing = getJob(userId, cid, dnum);
  if (existing?.status === "RUNNING") {
    return res.status(202).json({
      status: "ALREADY_RUNNING",
      startedAt: existing.startedAt,
      progress: existing.progress,
    });
  }

  const tokenExists = await GoogleAdsToken.exists({ user: userId });
  if (!tokenExists)
    return res.status(401).json({ error: "Google Ads not connected" });

  setJob(userId, cid, dnum, {
    status: "RUNNING",
    startedAt: Date.now(),
    progress: "Starting...",
    error: null,
    result: null,
  });

  res.status(202).json({ status: "STARTED", days: dnum });

  runGeneration(userId, cid, dnum)
    .then((result) => {
      console.log(
        `✅ [leadgen-wasted-kw] ${cid} ${dnum}d: ${result.unique_term_campaign_pairs} terms, $${result.total_wasted_cost.toFixed(2)} wasted`
      );
      setJob(userId, cid, dnum, {
        status: "COMPLETED",
        completedAt: Date.now(),
        result,
      });
    })
    .catch((err) => {
      console.error(
        `💥 [leadgen-wasted-kw] ${cid} ${dnum}d failed: ${err.message}`
      );
      setJob(userId, cid, dnum, {
        status: "FAILED",
        completedAt: Date.now(),
        error: err.message,
      });
    });
};

export const getLeadGenWastedKeywordsCached = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { customer_id, days = 30 } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;
    const dnum = Number(days);

    const q = { user: userId };
    if (cid) q.customer_id = cid;
    if (ALLOWED_DAYS.has(dnum)) q.days = dnum;

    const rows = await WastedKeywordsLeadGenReport.find(q)
      .sort({ cost: -1 })
      .lean();

    // Per-campaign roll-up (so users can see which campaigns are bleeding)
    const byCampaign = new Map();
    for (const r of rows) {
      if (!byCampaign.has(r.campaign_id)) {
        byCampaign.set(r.campaign_id, {
          campaign_id: r.campaign_id,
          campaign_name: r.campaign_name,
          channel_type: r.channel_type,
          unique_terms: 0,
          impressions: 0,
          clicks: 0,
          cost: 0,
        });
      }
      const c = byCampaign.get(r.campaign_id);
      c.unique_terms += 1;
      c.impressions += r.impressions;
      c.clicks += r.clicks;
      c.cost += r.cost;
    }

    // Totals
    const totals = rows.reduce(
      (acc, r) => {
        acc.unique_terms += 1;
        acc.impressions += r.impressions;
        acc.clicks += r.clicks;
        acc.cost += r.cost;
        return acc;
      },
      { unique_terms: 0, impressions: 0, clicks: 0, cost: 0 }
    );

    res.json({
      success: true,
      rows,
      campaign_summary: Array.from(byCampaign.values()).sort(
        (a, b) => b.cost - a.cost
      ),
      totals,
      meta: {
        customer_id: cid,
        days: ALLOWED_DAYS.has(dnum) ? dnum : null,
        report_start_date: rows[0]?.report_start_date || null,
        report_end_date: rows[0]?.report_end_date || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeadGenWastedKeywordsStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { customer_id, days = 30 } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;
    const dnum = Number(days);
    if (!cid)
      return res.status(400).json({ error: "Missing customer_id" });

    const job = getJob(userId, cid, dnum);
    const dbCount = await WastedKeywordsLeadGenReport.countDocuments({
      user: userId,
      customer_id: cid,
      days: dnum,
    });

    res.json({
      status: job?.status || (dbCount > 0 ? "COMPLETED" : "NO_DATA"),
      progress: job?.progress || null,
      error: job?.error || null,
      result: job?.result || null,
      cached_count: dbCount,
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
};

export const clearLeadGenWastedKeywords = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { customer_id, days } = req.body || {};
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    if (ALLOWED_DAYS.has(Number(days))) q.days = Number(days);

    const result = await WastedKeywordsLeadGenReport.deleteMany(q);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
