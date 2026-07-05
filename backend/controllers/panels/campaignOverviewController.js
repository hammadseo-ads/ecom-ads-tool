// Panel 1 · Campaign Overview
// -----------------------------------------------------------------------
// Fetches every campaign (Enabled + Paused + Removed) for the audit's
// customer_id + time frame. Returns a row per campaign with everything
// the checklist Section 1 asks for + prior-period deltas + auto-flags.
//
// Called by: auditController.refreshPanel({ panelKey: "campaign_overview" })
// Returns: { snapshot, flags } — snapshot is embedded in the audit doc.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";

// ---------- helpers ----------
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

const fmtDate = (d) => new Date(d).toISOString().split("T")[0];

const daysBetween = (a, b) =>
  Math.max(1, Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));

// ---------- GAQL ----------
// One query per campaign that returns everything Panel 1 needs.
// Metrics are limited to the audit's time frame.
const buildCampaignsQuery = (start, end) => `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.serving_status,
    campaign.advertising_channel_type,
    campaign.advertising_channel_sub_type,
    campaign.bidding_strategy_type,
    campaign.bidding_strategy_system_status,
    campaign.maximize_conversion_value.target_roas,
    campaign.target_cpa.target_cpa_micros,
    campaign.target_roas.target_roas,
    campaign.start_date,
    campaign.end_date,
    campaign_budget.amount_micros,
    campaign_budget.status,
    campaign_budget.explicitly_shared,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr,
    metrics.average_cpc,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value,
    metrics.cost_per_conversion,
    metrics.search_budget_lost_impression_share,
    metrics.search_rank_lost_impression_share
  FROM campaign
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.status IN ('ENABLED', 'PAUSED', 'REMOVED')
`;

// Fetch and shape rows. Cost normalized to dollars, target values normalized.
const fetchCampaigns = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildCampaignsQuery(start, end));
  const rows = toArray(resp);

  // The query returns one row per (campaign × day-of-metric-aggregation) —
  // google-ads-api aggregates by default when no segments.date is in SELECT,
  // but WHERE segments.date narrows the range. We still guard with a Map
  // by campaign.id in case duplicates appear.
  const byId = new Map();
  for (const row of rows) {
    const c = row.campaign || {};
    const b = row.campaign_budget || row.campaignBudget || {};
    const m = row.metrics || {};
    const id = String(c.id || "");
    if (!id) continue;

    const existing = byId.get(id) || {
      id,
      name: c.name || `Campaign ${id}`,
      status: String(c.status ?? ""),
      serving_status: String(c.serving_status ?? c.servingStatus ?? ""),
      channel_type: String(c.advertising_channel_type ?? c.advertisingChannelType ?? ""),
      channel_sub_type: String(c.advertising_channel_sub_type ?? c.advertisingChannelSubType ?? ""),
      bidding_strategy_type: String(c.bidding_strategy_type ?? c.biddingStrategyType ?? ""),
      bidding_strategy_system_status: String(c.bidding_strategy_system_status ?? c.biddingStrategySystemStatus ?? ""),
      target_roas: num(c.target_roas?.target_roas ?? c.targetRoas?.targetRoas ?? c.maximize_conversion_value?.target_roas ?? c.maximizeConversionValue?.targetRoas),
      target_cpa: num(c.target_cpa?.target_cpa_micros ?? c.targetCpa?.targetCpaMicros) / 1e6,
      start_date: c.start_date ?? c.startDate ?? null,
      end_date: c.end_date ?? c.endDate ?? null,
      daily_budget: num(b.amount_micros ?? b.amountMicros) / 1e6,
      budget_status: String(b.status ?? ""),
      budget_shared: Boolean(b.explicitly_shared ?? b.explicitlyShared),
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      conversions_value: 0,
      // IS metrics are averaged, not summed — track sums + count then divide.
      _budget_lost_is_sum: 0,
      _rank_lost_is_sum: 0,
      _is_samples: 0,
    };

    existing.impressions += num(m.impressions);
    existing.clicks += num(m.clicks);
    existing.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    existing.conversions += num(m.conversions);
    existing.conversions_value += num(m.conversions_value ?? m.conversionsValue);

    const budgetLostIS = m.search_budget_lost_impression_share ?? m.searchBudgetLostImpressionShare;
    const rankLostIS = m.search_rank_lost_impression_share ?? m.searchRankLostImpressionShare;
    if (budgetLostIS != null || rankLostIS != null) {
      existing._budget_lost_is_sum += num(budgetLostIS);
      existing._rank_lost_is_sum += num(rankLostIS);
      existing._is_samples += 1;
    }

    byId.set(id, existing);
  }

  return Array.from(byId.values()).map((r) => {
    const samples = r._is_samples || 1;
    const budgetLostIS = r._is_samples ? r._budget_lost_is_sum / samples : null;
    const rankLostIS = r._is_samples ? r._rank_lost_is_sum / samples : null;
    delete r._budget_lost_is_sum;
    delete r._rank_lost_is_sum;
    delete r._is_samples;

    return {
      ...r,
      ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
      average_cpc: r.clicks > 0 ? r.cost / r.clicks : 0,
      cost_per_conversion: r.conversions > 0 ? r.cost / r.conversions : 0,
      actual_roas: r.cost > 0 ? r.conversions_value / r.cost : 0,
      search_budget_lost_is: budgetLostIS,   // 0..1 fraction (Google's shape)
      search_rank_lost_is: rankLostIS,
      // Flag lever: campaign is budget-limited if it's losing IS to budget
      is_budget_limited: budgetLostIS != null && budgetLostIS > 0.01,
    };
  });
};

// ---------- flag engine ----------
// Thresholds are hard-coded here for v1. Later they'll be operator-configurable
// via a per-client settings collection (Cross-Cutting §2 in the v2 plan).
const FLAG_THRESHOLDS = {
  budget_lost_is_min: 0.05,        // 5%+ lost to budget → budget-limited flag
  rank_lost_is_min: 0.30,          // 30%+ lost to rank → rank-limited flag
  roas_vs_target_min: 0.70,        // actual ROAS < 70% of target
  cpa_vs_target_max: 2.0,          // actual CPA > 2x target
  learning_days_max: 21,           // stuck learning >21 days
  recent_paused_lookback_days: 30, // paused campaigns worth reviewing
};

const buildFlags = (rows, timeFrameStart, timeFrameEnd) => {
  const flags = [];

  for (const r of rows) {
    // Budget-limited
    if (r.status === "ENABLED" && r.search_budget_lost_is != null && r.search_budget_lost_is >= FLAG_THRESHOLDS.budget_lost_is_min) {
      flags.push({
        code: "limited_by_budget",
        severity: "warn",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Losing ${(r.search_budget_lost_is * 100).toFixed(1)}% of Search impressions to budget. If this campaign is profitable, budget-increase is the lever.`,
        meta: { pct: r.search_budget_lost_is },
      });
    }

    // Rank-limited
    if (r.status === "ENABLED" && r.search_rank_lost_is != null && r.search_rank_lost_is >= FLAG_THRESHOLDS.rank_lost_is_min) {
      flags.push({
        code: "limited_by_rank",
        severity: "warn",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Losing ${(r.search_rank_lost_is * 100).toFixed(1)}% of Search impressions to rank. Ad quality or bid amount is the constraint, not budget.`,
        meta: { pct: r.search_rank_lost_is },
      });
    }

    // Bid strategy in learning too long
    if (r.status === "ENABLED" && r.bidding_strategy_system_status === "LEARNING") {
      // We don't have a per-campaign learning-start date from the API cleanly
      // here — surface the flag conservatively and let the operator judge.
      flags.push({
        code: "bidding_learning",
        severity: "info",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Bidding strategy is in "Learning" state. If stuck here more than ${FLAG_THRESHOLDS.learning_days_max} days, changes are being throttled.`,
      });
    }

    // Bid strategy explicitly limited
    if (r.status === "ENABLED" && /^LIMITED_BY_/.test(r.bidding_strategy_system_status || "")) {
      flags.push({
        code: "bidding_limited",
        severity: "warn",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Bidding strategy system status: ${r.bidding_strategy_system_status}. This is preventing Google from fully optimising.`,
        meta: { status: r.bidding_strategy_system_status },
      });
    }

    // ROAS below target (only meaningful when tROAS or MaxConvValue with target)
    if (
      r.status === "ENABLED" &&
      r.target_roas > 0 &&
      r.actual_roas > 0 &&
      r.actual_roas < r.target_roas * FLAG_THRESHOLDS.roas_vs_target_min
    ) {
      flags.push({
        code: "roas_below_target",
        severity: "critical",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Actual ROAS ${r.actual_roas.toFixed(2)} is below ${(FLAG_THRESHOLDS.roas_vs_target_min * 100).toFixed(0)}% of target ${r.target_roas.toFixed(2)}.`,
        meta: { actual: r.actual_roas, target: r.target_roas },
      });
    }

    // CPA above target (Target CPA strategies)
    if (
      r.status === "ENABLED" &&
      r.target_cpa > 0 &&
      r.cost_per_conversion > 0 &&
      r.cost_per_conversion > r.target_cpa * FLAG_THRESHOLDS.cpa_vs_target_max
    ) {
      flags.push({
        code: "cpa_above_target",
        severity: "critical",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Actual CPA $${r.cost_per_conversion.toFixed(2)} is more than ${FLAG_THRESHOLDS.cpa_vs_target_max}× target $${r.target_cpa.toFixed(2)}.`,
        meta: { actual: r.cost_per_conversion, target: r.target_cpa },
      });
    }

    // Recently paused campaigns with positive ROAS during the window
    if (r.status === "PAUSED" && r.cost > 0 && r.actual_roas >= 1.0) {
      flags.push({
        code: "paused_with_positive_roas",
        severity: "info",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Paused campaign with ROAS ${r.actual_roas.toFixed(2)} during window. Worth a look — historically profitable.`,
        meta: { actual_roas: r.actual_roas, cost: r.cost },
      });
    }

    // Zero-spend enabled campaigns (odd)
    if (r.status === "ENABLED" && r.cost === 0 && r.impressions === 0) {
      flags.push({
        code: "enabled_no_delivery",
        severity: "info",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `Enabled campaign with zero impressions in the window. Possible: paused ad groups, disapproved ads, or targeting too narrow.`,
      });
    }
  }

  return flags;
};

// ---------- main refresh export ----------
// Called by auditController.refreshPanel.
// { user, audit, start?, end? } → { snapshot, flags }
// If start/end are passed, they override audit.start_date/end_date. Used by
// the multi-period runner so one panel controller call can serve all 3 windows.
export const refreshCampaignOverview = async ({ user, audit, start: startOverride, end: endOverride }) => {
  const tokenDoc = await GoogleAdsToken.findOne({ user: user._id });
  if (!tokenDoc) throw new Error("Google Ads is not connected for this user");

  // Refresh OAuth if near expiry
  if (Date.now() > (tokenDoc.expiryDate?.getTime() || 0) - 60000) {
    const t = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = t.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + t.expires_in * 1000);
    await tokenDoc.save();
  }

  const customerId = formatCustomerId(audit.customer_id);
  const rangeStart = startOverride ? new Date(startOverride) : new Date(audit.start_date);
  const rangeEnd = endOverride ? new Date(endOverride) : new Date(audit.end_date);
  const start = fmtDate(rangeStart);
  const end = fmtDate(rangeEnd);

  // Current period
  const currentRows = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchCampaigns(tokenDoc, customerId, login, start, end)
  );

  // Prior period (same length, immediately preceding the current window)
  const windowDays = daysBetween(rangeStart, rangeEnd);
  const priorEnd = new Date(rangeStart);
  priorEnd.setDate(priorEnd.getDate() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - windowDays);
  const priorStartStr = fmtDate(priorStart);
  const priorEndStr = fmtDate(priorEnd);

  let priorRows = [];
  try {
    priorRows = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchCampaigns(tokenDoc, customerId, login, priorStartStr, priorEndStr)
    );
  } catch (err) {
    // Prior-period fetch is non-blocking. Log and continue.
    console.warn("[campaign_overview] prior-period fetch failed:", err?.message?.slice(0, 200));
  }

  // Merge prior period stats into current rows by campaign id.
  const priorById = new Map(priorRows.map((r) => [r.id, r]));
  const rows = currentRows.map((r) => {
    const p = priorById.get(r.id);
    const delta = (curr, prev) => {
      if (prev == null || prev === 0) return curr > 0 ? null : 0; // null = no baseline
      return ((curr - prev) / Math.abs(prev)) * 100;
    };
    return {
      ...r,
      prior_impressions: p?.impressions ?? null,
      prior_clicks: p?.clicks ?? null,
      prior_cost: p?.cost ?? null,
      prior_conversions: p?.conversions ?? null,
      prior_conversions_value: p?.conversions_value ?? null,
      delta_impressions_pct: p ? delta(r.impressions, p.impressions) : null,
      delta_clicks_pct: p ? delta(r.clicks, p.clicks) : null,
      delta_cost_pct: p ? delta(r.cost, p.cost) : null,
      delta_conversions_pct: p ? delta(r.conversions, p.conversions) : null,
      delta_conversions_value_pct: p ? delta(r.conversions_value, p.conversions_value) : null,
    };
  });

  // Rank rows: Enabled first (by cost desc), then Paused, then Removed.
  const statusRank = { ENABLED: 0, PAUSED: 1, REMOVED: 2 };
  rows.sort((a, b) => {
    const sa = statusRank[a.status] ?? 3;
    const sb = statusRank[b.status] ?? 3;
    if (sa !== sb) return sa - sb;
    return b.cost - a.cost;
  });

  const flags = buildFlags(rows, rangeStart, rangeEnd);

  // Summary totals for the panel header
  const summary = {
    total_campaigns: rows.length,
    enabled_campaigns: rows.filter((r) => r.status === "ENABLED").length,
    paused_campaigns: rows.filter((r) => r.status === "PAUSED").length,
    removed_campaigns: rows.filter((r) => r.status === "REMOVED").length,
    total_cost: rows.reduce((s, r) => s + r.cost, 0),
    total_conversions: rows.reduce((s, r) => s + r.conversions, 0),
    total_conversions_value: rows.reduce((s, r) => s + r.conversions_value, 0),
  };

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    prior_start_date: priorStart,
    prior_end_date: priorEnd,
    summary,
    rows,
  };

  return { snapshot, flags };
};
