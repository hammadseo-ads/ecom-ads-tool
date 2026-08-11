// Heat Map (Hour × Day) Analysis controller.
//
// Pulls per-campaign hourly performance, aggregates into a 7×24 grid, and
// returns smoothed values + suggested bid multipliers (where actionable).
//
// CRITICAL: bid-by-hour adjustments only work for campaigns on MANUAL_CPC
// or MAXIMIZE_CLICKS. Smart Bidding (Target ROAS, Target CPA, Maximize
// Conversions, etc.) overrides hour-of-day adjustments — Google handles
// the timing internally. PMax is always Smart Bidding. We capture
// `bidding_strategy_type` per campaign so the frontend can show a warning
// banner ("only -100% pause works for this campaign") when relevant.
//
// Smoothing is applied at READ time in /cached, not at fetch time. Lets us
// tweak windows / weights without refetching from Google.
//
// Reference script: Heat Map Creation Tool by managingseo.com
//   smoothingWindow = [-2, -1, 0, 1, 2]
//   smoothingWeight = [0.25, 0.75, 1, 0.75, 0.25]
//   suggestedMultiplier = sqrt(cellConvRate / meanConvRate) - 1, capped ±0.35

import HeatMapReport from "../models/HeatMapReport.js";
import GoogleAdsToken from "../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../utils/googleAdsClient.js";

const REPORT_TYPES = [
  { type: "LAST_30_DAYS", days: 30 },
  { type: "LAST_60_DAYS", days: 60 },
  { type: "LAST_90_DAYS", days: 90 },
];

// Bidding strategies where time-of-day bid adjustments are actually applied
// by Google. Anything else → only -100% pauses are honored.
const MANUAL_BIDDING_TYPES = new Set([
  "MANUAL_CPC", "MANUAL_CPM", "MANUAL_CPV", "MAXIMIZE_CLICKS",
]);

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

// Google Ads API returns day_of_week as an enum string ("MONDAY", "TUESDAY"…)
// or numeric (2-8 in some library versions). Normalize to ISO 1=Mon … 7=Sun.
const DOW_MAP = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
  FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  // Numeric enum (google-ads-api uses 2=MON … 8=SUN per protobuf)
  2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7,
};
const normalizeDayOfWeek = (raw) => {
  if (raw == null) return null;
  if (typeof raw === "string") return DOW_MAP[raw.toUpperCase()] || null;
  if (typeof raw === "number") return DOW_MAP[raw] || null;
  return null;
};

// google-ads-api returns hour as 0-23 already. Some versions return numeric
// enum where 0=HOUR_0 etc. — same value so no remapping needed.
const normalizeHour = (raw) => {
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 23) return null;
  return n;
};

// ============= JOB TRACKER =============
const jobs = new Map();
const jobKey = (userId, customerId) => `${userId}_${customerId}`;
const setJob = (userId, customerId, patch) => {
  const k = jobKey(userId, customerId);
  jobs.set(k, { ...(jobs.get(k) || {}), ...patch });
};
const getJob = (userId, customerId) => jobs.get(jobKey(userId, customerId));

// ============= CAMPAIGNS LIST =============
const listCampaignsWithBidding = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign.status
    FROM campaign
    WHERE campaign.status IN ('ENABLED', 'PAUSED')
  `);
  return toArray(resp).map((row) => {
    const c = row.campaign || row;
    const channelType = c?.advertising_channel_type ?? c?.advertisingChannelType;
    const biddingType = c?.bidding_strategy_type ?? c?.biddingStrategyType;
    const statusRaw = c?.status;
    const channel = typeof channelType === "string" ? channelType : String(channelType);
    const bidding = typeof biddingType === "string" ? biddingType : String(biddingType);
    // Google Ads returns status as enum string ("ENABLED"/"PAUSED") or numeric
    // (2=ENABLED, 3=PAUSED, 4=REMOVED). Normalize to the string form.
    const STATUS_MAP = { 2: "ENABLED", 3: "PAUSED", 4: "REMOVED" };
    const status = typeof statusRaw === "string" ? statusRaw : (STATUS_MAP[statusRaw] || String(statusRaw ?? ""));
    return {
      id: String(c?.id || ""),
      name: c?.name || `Campaign ${c?.id || ""}`,
      channel_type: channel,
      status,
      bidding_strategy_type: bidding,
      supports_bid_multiplier: MANUAL_BIDDING_TYPES.has(bidding),
    };
  }).filter((c) => c.id);
};

// ============= HOURLY DATA =============
const fetchHourlyData = async (tokenDoc, customerId, loginCustomerId, start, end, campaignIds) => {
  if (campaignIds.length === 0) return [];
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const idList = campaignIds.map((id) => `'${id}'`).join(", ");
  const query = `
    SELECT
      campaign.id,
      segments.day_of_week,
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${start}' AND '${end}'
      AND campaign.id IN (${idList})
  `;
  const resp = await client.query(query);
  return toArray(resp).map((row) => {
    const c = row.campaign || {};
    const seg = row.segments || {};
    const m = row.metrics || {};
    const day = normalizeDayOfWeek(seg.day_of_week ?? seg.dayOfWeek);
    const hour = normalizeHour(seg.hour);
    return {
      campaign_id: String(c.id || ""),
      day_of_week: day,
      hour,
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: num(m.cost_micros) / 1e6,
      conversions: num(m.conversions),
      conversion_value: num(m.conversions_value || m.conversionsValue),
    };
  }).filter((r) => r.day_of_week !== null && r.hour !== null && r.campaign_id);
};

// ============= AGGREGATION =============
// Sum hourly rows into 168 cells per (campaign × day × hour).
// Date-range rows contributing to the same (day_of_week, hour) get summed
// — the SUM, not the average — that's what the smoothing expects.
const aggregateToCells = (rows) => {
  const grid = new Map(); // key = `${day}_${hour}` → cell
  for (const r of rows) {
    const k = `${r.day_of_week}_${r.hour}`;
    if (!grid.has(k)) {
      grid.set(k, {
        day_of_week: r.day_of_week,
        hour: r.hour,
        impressions: 0, clicks: 0, cost: 0, conversions: 0, conversion_value: 0,
      });
    }
    const c = grid.get(k);
    c.impressions += r.impressions;
    c.clicks += r.clicks;
    c.cost += r.cost;
    c.conversions += r.conversions;
    c.conversion_value += r.conversion_value;
  }
  return Array.from(grid.values());
};

// Sum several campaigns' already-aggregated cell arrays into one 7×24 grid.
// Used to build a filtered aggregate (e.g. only Search + only active campaigns)
// on the fly from the stored per-campaign cells.
const sumCampaignCells = (cellArrays) => {
  const grid = new Map(); // key = `${day}_${hour}` → cell
  for (const cells of cellArrays) {
    for (const c of cells || []) {
      const k = `${c.day_of_week}_${c.hour}`;
      if (!grid.has(k)) {
        grid.set(k, {
          day_of_week: c.day_of_week,
          hour: c.hour,
          impressions: 0, clicks: 0, cost: 0, conversions: 0, conversion_value: 0,
        });
      }
      const g = grid.get(k);
      g.impressions += num(c.impressions);
      g.clicks += num(c.clicks);
      g.cost += num(c.cost);
      g.conversions += num(c.conversions);
      g.conversion_value += num(c.conversion_value);
    }
  }
  return Array.from(grid.values());
};

// A campaign counts as "active" for the toggle when ENABLED. Older cached
// reports predate the stored status field — treat missing status as active so
// nothing silently disappears until the user regenerates.
const isActiveStatus = (status) => !status || status === "ENABLED";

// ============= MAIN GENERATION =============
async function runHeatMapGeneration(userId, cid) {
  const tokenDoc = await GoogleAdsToken.findOne({ user: userId });
  if (!tokenDoc) throw new Error("Google Ads not connected");

  if (Date.now() > tokenDoc.expiryDate?.getTime() - 60000) {
    const newTokens = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + newTokens.expires_in * 1000);
    await tokenDoc.save();
  }

  setJob(userId, cid, { progress: "Listing campaigns..." });
  const { login: workingLogin, campaigns } = await withLoginRetry(tokenDoc, cid, async (login) => {
    const c = await listCampaignsWithBidding(tokenDoc, cid, login);
    return { login, campaigns: c };
  });

  if (campaigns.length === 0) {
    return { reports: [], total_campaigns: 0, message: "No campaigns found." };
  }

  const manualCount = campaigns.filter((c) => c.supports_bid_multiplier).length;
  console.log(
    `📊 [heatmap] ${cid}: ${campaigns.length} campaigns ` +
    `(${manualCount} manual-bidding, ${campaigns.length - manualCount} smart bidding/PMax)`
  );

  const allReports = [];

  for (const rpt of REPORT_TYPES) {
    setJob(userId, cid, { progress: `Fetching hourly data: ${rpt.type}...` });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - rpt.days);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    let rows = [];
    try {
      rows = await fetchHourlyData(tokenDoc, cid, workingLogin, start, end, campaigns.map((c) => c.id));
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err.message || "";
      console.warn(`  [heatmap] ${rpt.type} fetch failed: ${msg.slice(0, 200)}`);
      allReports.push({ report_type: rpt.type, error: msg });
      continue;
    }

    // Group rows by campaign_id
    const byCampaign = new Map();
    for (const r of rows) {
      if (!byCampaign.has(r.campaign_id)) byCampaign.set(r.campaign_id, []);
      byCampaign.get(r.campaign_id).push(r);
    }

    const per_campaign = campaigns.map((camp) => ({
      campaign_id: camp.id,
      campaign_name: camp.name,
      channel_type: camp.channel_type,
      status: camp.status,
      bidding_strategy_type: camp.bidding_strategy_type,
      supports_bid_multiplier: camp.supports_bid_multiplier,
      cells: aggregateToCells(byCampaign.get(camp.id) || []),
    }));

    const aggregated_cells = aggregateToCells(rows);

    await HeatMapReport.deleteMany({ user: userId, customer_id: cid, report_type: rpt.type });
    await HeatMapReport.create({
      user: userId,
      customer_id: cid,
      report_type: rpt.type,
      report_start_date: startDate,
      report_end_date: endDate,
      per_campaign,
      aggregated_cells,
      total_campaigns: campaigns.length,
      manual_bidding_campaigns: manualCount,
    });

    console.log(`  [heatmap] ${rpt.type}: stored ${rows.length} hourly rows across ${campaigns.length} campaigns`);
    allReports.push({ report_type: rpt.type, rows: rows.length });
  }

  return {
    reports: allReports,
    total_campaigns: campaigns.length,
    manual_bidding_campaigns: manualCount,
  };
}

// ============= SMOOTHING + DERIVED METRICS (read-time) =============
const SMOOTH_WINDOW = [-2, -1, 0, 1, 2];
const SMOOTH_WEIGHT = [0.25, 0.75, 1, 0.75, 0.25];
const MAX_BID_MULT = 0.35;

// Build a lookup [day][hour] → cell from a sparse cells array.
const cellsToGrid = (cells) => {
  const grid = {};
  for (let d = 1; d <= 7; d++) {
    grid[d] = {};
    for (let h = 0; h < 24; h++) grid[d][h] = null;
  }
  for (const c of cells) {
    if (c.day_of_week >= 1 && c.day_of_week <= 7 && c.hour >= 0 && c.hour <= 23) {
      grid[c.day_of_week][c.hour] = c;
    }
  }
  return grid;
};

// Smoothed value of a metric at (day, hour) using ±2hr window.
// Wraps around days at hour boundaries (so smoothing at hour 0 of Tuesday
// looks at hours 22, 23 of Monday and hours 1, 2 of Tuesday).
const smoothedAt = (grid, day, hour, metric) => {
  let total = 0, weight = 0;
  for (let i = 0; i < SMOOTH_WINDOW.length; i++) {
    let h = hour + SMOOTH_WINDOW[i];
    let d = day;
    if (h < 0) { h += 24; d = ((d - 2 + 7) % 7) + 1; }      // previous day
    else if (h > 23) { h -= 24; d = (d % 7) + 1; }          // next day
    const cell = grid[d]?.[h];
    if (cell) {
      total += SMOOTH_WEIGHT[i] * (cell[metric] || 0);
      weight += SMOOTH_WEIGHT[i];
    }
  }
  return weight > 0 ? total / weight : 0;
};

// For one campaign (or aggregated grid), produce a 7×24 smoothed result with
// derived metrics (CTR, conv_rate, ROAS) and suggested bid multiplier.
const buildSmoothedGrid = (cells, supportsBidMultiplier) => {
  const grid = cellsToGrid(cells);

  const out = [];
  let totalSmoothedClicks = 0, totalSmoothedConversions = 0;
  // First pass: compute smoothed metrics per cell (no derived yet)
  for (let d = 1; d <= 7; d++) {
    for (let h = 0; h < 24; h++) {
      const sm = {
        day_of_week: d, hour: h,
        impressions: smoothedAt(grid, d, h, "impressions"),
        clicks: smoothedAt(grid, d, h, "clicks"),
        cost: smoothedAt(grid, d, h, "cost"),
        conversions: smoothedAt(grid, d, h, "conversions"),
        conversion_value: smoothedAt(grid, d, h, "conversion_value"),
      };
      sm.ctr = sm.impressions > 0 ? (sm.clicks / sm.impressions) * 100 : 0;
      sm.conv_rate = sm.clicks > 0 ? (sm.conversions / sm.clicks) * 100 : 0;
      sm.roas = sm.cost > 0 ? sm.conversion_value / sm.cost : 0;
      totalSmoothedClicks += sm.clicks;
      totalSmoothedConversions += sm.conversions;
      out.push(sm);
    }
  }

  // Suggested multiplier = sqrt(cellConvRate / meanConvRate) - 1, capped ±35%
  const meanConvRate = totalSmoothedClicks > 0 ? totalSmoothedConversions / totalSmoothedClicks : 0;
  for (const cell of out) {
    if (!supportsBidMultiplier) {
      cell.suggested_bid_multiplier = null;
      continue;
    }
    if (meanConvRate <= 0 || cell.clicks <= 0) {
      cell.suggested_bid_multiplier = null;
      continue;
    }
    const cellConvRate = cell.conversions / cell.clicks;
    const raw = Math.sqrt(cellConvRate / meanConvRate) - 1;
    cell.suggested_bid_multiplier = Math.max(-MAX_BID_MULT, Math.min(MAX_BID_MULT, raw));
  }

  return { cells: out, mean_conv_rate: meanConvRate * 100 };
};

// ============= CONTROLLERS =============

export const generateHeatMapReports = async (req, res) => {
  const userId = req.user._id;
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
  const cid = formatCustomerId(customer_id);

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
    status: "RUNNING", startedAt: Date.now(), progress: "Starting...", error: null, result: null,
  });
  res.status(202).json({ status: "STARTED" });

  runHeatMapGeneration(userId, cid)
    .then((result) => {
      console.log(`✅ [heatmap] ${cid}: complete — ${result.total_campaigns} campaigns`);
      setJob(userId, cid, { status: "COMPLETED", completedAt: Date.now(), result });
    })
    .catch((err) => {
      console.error(`💥 [heatmap] ${cid}: failed — ${err.message}`);
      setJob(userId, cid, { status: "FAILED", completedAt: Date.now(), error: err.message });
    });
};

export const getHeatMapStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const cid = customer_id ? formatCustomerId(customer_id) : null;
    const job = cid ? getJob(userId, cid) : null;
    if (job) {
      return res.json({
        status: job.status, progress: job.progress, startedAt: job.startedAt,
        completedAt: job.completedAt, error: job.error,
      });
    }
    const q = { user: userId };
    if (cid) q.customer_id = cid;
    const count = await HeatMapReport.countDocuments(q);
    res.json({ status: count > 0 ? "COMPLETED" : "NO_DATA" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCachedHeatMap = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      customer_id, report_type, campaign_id,
      channel_type,   // e.g. "SEARCH" | "PERFORMANCE_MAX" | "DEMAND_GEN" | "all"
      status_filter,  // "active" (ENABLED only) | "all" (ENABLED + PAUSED)
    } = req.body;
    if (!customer_id || !report_type) {
      return res.status(400).json({ error: "Missing customer_id or report_type" });
    }
    const cid = formatCustomerId(customer_id);
    const doc = await HeatMapReport.findOne({
      user: userId, customer_id: cid, report_type,
    }).lean();

    if (!doc) {
      return res.json({
        cells: [], mean_conv_rate: 0,
        per_campaign: [], total_campaigns: 0,
        available_channels: [], filtered_campaign_count: 0,
        supports_bid_multiplier: false,
        selected_campaign: null,
      });
    }

    const allCampaigns = doc.per_campaign || [];
    const channelWanted = channel_type && channel_type !== "all" ? channel_type : null;
    const activeOnly = status_filter === "active";

    // Distinct channel types present (for the frontend's channel dropdown).
    const available_channels = Array.from(
      new Set(allCampaigns.map((c) => c.channel_type).filter(Boolean))
    ).sort();

    // Pick which cells to smooth: a specific campaign, or a filtered aggregate.
    let cells, supports;
    let selectedCampaign = null;
    let filteredCount = 0;

    if (campaign_id && campaign_id !== "all") {
      const camp = allCampaigns.find((c) => c.campaign_id === String(campaign_id));
      if (camp) {
        cells = camp.cells;
        supports = camp.supports_bid_multiplier;
        filteredCount = 1;
        selectedCampaign = {
          id: camp.campaign_id, name: camp.campaign_name,
          channel_type: camp.channel_type, status: camp.status,
          bidding_strategy_type: camp.bidding_strategy_type,
          supports_bid_multiplier: camp.supports_bid_multiplier,
        };
      } else {
        cells = []; supports = false;
      }
    } else {
      // Filtered aggregate: sum cells across the campaigns matching the
      // channel + status filters. Fall back to the precomputed aggregate only
      // when no filters are applied (cheaper + identical result).
      const subset = allCampaigns.filter(
        (c) =>
          (!channelWanted || c.channel_type === channelWanted) &&
          (!activeOnly || isActiveStatus(c.status))
      );
      filteredCount = subset.length;

      if (!channelWanted && !activeOnly) {
        cells = doc.aggregated_cells || [];
      } else {
        cells = sumCampaignCells(subset.map((c) => c.cells));
      }
      // Multipliers only meaningful if EVERY campaign in the view supports them.
      // Mixed = disable multiplier suggestions to avoid misleading the user.
      supports = subset.length > 0 && subset.every((c) => c.supports_bid_multiplier);
    }

    const { cells: smoothed, mean_conv_rate } = buildSmoothedGrid(cells, supports);

    res.json({
      cells: smoothed,
      mean_conv_rate,
      per_campaign: allCampaigns.map((c) => ({
        id: c.campaign_id, name: c.campaign_name,
        channel_type: c.channel_type,
        status: c.status,
        bidding_strategy_type: c.bidding_strategy_type,
        supports_bid_multiplier: c.supports_bid_multiplier,
      })),
      total_campaigns: doc.total_campaigns,
      manual_bidding_campaigns: doc.manual_bidding_campaigns,
      available_channels,
      filtered_campaign_count: filteredCount,
      supports_bid_multiplier: supports,
      selected_campaign: selectedCampaign,
      report_start_date: doc.report_start_date,
      report_end_date: doc.report_end_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============= EXPORT (download all data for AI analysis) =============
// Dumps EVERY stored cell across all report periods and all campaigns as a
// flat CSV — one row per (period × campaign × day × hour) with raw metrics
// plus derived CTR / conv-rate / ROAS. Ignores the on-screen filters on
// purpose: the whole point is to hand an AI the complete dataset.
const DOW_NAMES = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };

const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const REPORT_LABELS = {
  LAST_30_DAYS: "Last 30 Days",
  LAST_60_DAYS: "Last 60 Days",
  LAST_90_DAYS: "Last 90 Days",
};

export const exportHeatMap = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    if (!customer_id) return res.status(400).json({ error: "Missing customer_id" });
    const cid = formatCustomerId(customer_id);

    const docs = await HeatMapReport.find({ user: userId, customer_id: cid }).lean();
    if (!docs || docs.length === 0) {
      return res.status(404).json({ error: "No heat map data to export. Generate reports first." });
    }

    const header = [
      "report_period", "report_start_date", "report_end_date", "customer_id",
      "campaign_id", "campaign_name", "channel_type", "status",
      "bidding_strategy_type", "supports_bid_multiplier",
      "day_of_week", "day_name", "hour",
      "impressions", "clicks", "cost", "conversions", "conversion_value",
      "ctr_pct", "conv_rate_pct", "roas",
    ];
    const lines = [header.join(",")];

    // Deterministic period order (30 → 60 → 90) regardless of storage order.
    const periodOrder = { LAST_30_DAYS: 0, LAST_60_DAYS: 1, LAST_90_DAYS: 2 };
    docs.sort((a, b) => (periodOrder[a.report_type] ?? 9) - (periodOrder[b.report_type] ?? 9));

    const fmtDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

    for (const doc of docs) {
      const period = REPORT_LABELS[doc.report_type] || doc.report_type;
      const startD = fmtDate(doc.report_start_date);
      const endD = fmtDate(doc.report_end_date);
      for (const camp of doc.per_campaign || []) {
        for (const c of camp.cells || []) {
          const impressions = num(c.impressions);
          const clicks = num(c.clicks);
          const cost = num(c.cost);
          const conversions = num(c.conversions);
          const convValue = num(c.conversion_value);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
          const roas = cost > 0 ? convValue / cost : 0;
          lines.push([
            csvCell(period), csvCell(startD), csvCell(endD), csvCell(cid),
            csvCell(camp.campaign_id), csvCell(camp.campaign_name),
            csvCell(camp.channel_type), csvCell(camp.status || ""),
            csvCell(camp.bidding_strategy_type), csvCell(camp.supports_bid_multiplier),
            csvCell(c.day_of_week), csvCell(DOW_NAMES[c.day_of_week] || ""), csvCell(c.hour),
            csvCell(impressions), csvCell(clicks), csvCell(cost.toFixed(2)),
            csvCell(conversions), csvCell(convValue.toFixed(2)),
            csvCell(ctr.toFixed(4)), csvCell(convRate.toFixed(4)), csvCell(roas.toFixed(4)),
          ].join(","));
        }
      }
    }

    const csv = lines.join("\n");
    const filename = `heatmap_${cid}_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // Prepend a UTF-8 BOM so Excel opens it with correct encoding.
    res.send("﻿" + csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearHeatMapReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customer_id } = req.body;
    const q = { user: userId };
    if (customer_id) q.customer_id = formatCustomerId(customer_id);
    const r = await HeatMapReport.deleteMany(q);
    res.json({ success: true, deleted: r.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
