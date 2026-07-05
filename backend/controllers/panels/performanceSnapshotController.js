// Panel 2 · Performance Snapshot
// -----------------------------------------------------------------------
// Answers "how is this account doing?" — the narrative of the audit.
//
// Fetches per-campaign metrics (same shape as Panel 1) and aggregates them
// to account level. Includes prior-period deltas on every top-line metric
// so the operator sees direction, not just level. Flag engine surfaces
// CTR anomalies, CPA vs target, ROAS vs target, and account-wide Lost IS.
//
// Called by: auditController.refreshPanel({ panelKey: "performance_snapshot" })

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";

// ---------- helpers (duplicated from campaignOverviewController; kept
// local for now, extract to shared/ if a 3rd panel needs them) ----------
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
// One-shot fetch across active + paused campaigns with the KPI metrics.
const buildCampaignQuery = (start, end) => `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type,
    campaign.bidding_strategy_type,
    campaign.maximize_conversion_value.target_roas,
    campaign.target_cpa.target_cpa_micros,
    campaign.target_roas.target_roas,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value,
    metrics.search_budget_lost_impression_share,
    metrics.search_rank_lost_impression_share
  FROM campaign
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchCampaigns = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildCampaignQuery(start, end));
  const rows = toArray(resp);

  const byId = new Map();
  for (const row of rows) {
    const c = row.campaign || {};
    const m = row.metrics || {};
    const id = String(c.id || "");
    if (!id) continue;
    const existing = byId.get(id) || {
      id,
      name: c.name || `Campaign ${id}`,
      status: String(c.status ?? ""),
      channel_type: String(c.advertising_channel_type ?? c.advertisingChannelType ?? ""),
      bidding_strategy_type: String(c.bidding_strategy_type ?? c.biddingStrategyType ?? ""),
      target_roas: num(c.target_roas?.target_roas ?? c.targetRoas?.targetRoas ?? c.maximize_conversion_value?.target_roas ?? c.maximizeConversionValue?.targetRoas),
      target_cpa: num(c.target_cpa?.target_cpa_micros ?? c.targetCpa?.targetCpaMicros) / 1e6,
      impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0,
      _budget_lost_is_sum: 0, _rank_lost_is_sum: 0, _is_samples: 0,
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
    delete r._budget_lost_is_sum; delete r._rank_lost_is_sum; delete r._is_samples;
    return {
      ...r,
      ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
      average_cpc: r.clicks > 0 ? r.cost / r.clicks : 0,
      cost_per_conversion: r.conversions > 0 ? r.cost / r.conversions : 0,
      actual_roas: r.cost > 0 ? r.conversions_value / r.cost : 0,
      search_budget_lost_is: budgetLostIS,
      search_rank_lost_is: rankLostIS,
    };
  });
};

// ---------- aggregation ----------
const aggregate = (rows) => {
  const sum = rows.reduce((acc, r) => ({
    impressions: acc.impressions + r.impressions,
    clicks: acc.clicks + r.clicks,
    cost: acc.cost + r.cost,
    conversions: acc.conversions + r.conversions,
    conversions_value: acc.conversions_value + r.conversions_value,
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 });

  // IS averaged, spend-weighted where possible
  let budgetLostISWeighted = 0, rankLostISWeighted = 0, isWeight = 0;
  for (const r of rows) {
    if (r.search_budget_lost_is != null || r.search_rank_lost_is != null) {
      const w = r.cost > 0 ? r.cost : 1;
      budgetLostISWeighted += (r.search_budget_lost_is ?? 0) * w;
      rankLostISWeighted += (r.search_rank_lost_is ?? 0) * w;
      isWeight += w;
    }
  }
  const budgetLostIS = isWeight > 0 ? budgetLostISWeighted / isWeight : null;
  const rankLostIS = isWeight > 0 ? rankLostISWeighted / isWeight : null;

  return {
    ...sum,
    ctr: sum.impressions > 0 ? (sum.clicks / sum.impressions) * 100 : 0,
    average_cpc: sum.clicks > 0 ? sum.cost / sum.clicks : 0,
    cost_per_conversion: sum.conversions > 0 ? sum.cost / sum.conversions : 0,
    actual_roas: sum.cost > 0 ? sum.conversions_value / sum.cost : 0,
    search_budget_lost_is: budgetLostIS,
    search_rank_lost_is: rankLostIS,
  };
};

// ---------- flag engine ----------
const FLAG_THRESHOLDS = {
  ctr_drop_pct: -25,           // account CTR down more than 25% vs prior
  cpa_multiple: 2.0,           // per-campaign actual CPA > 2× target
  roas_ratio_min: 0.70,        // per-campaign actual ROAS < 70% of target
  budget_lost_is_min: 0.20,    // account-level: >20% lost to budget
  rank_lost_is_min: 0.30,      // account-level: >30% lost to rank
};

const pctChange = (curr, prev) => {
  if (prev == null || prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
};

const buildFlags = (accountSummary, priorSummary, perCampaign) => {
  const flags = [];

  // Account-wide CTR anomaly
  if (priorSummary?.impressions > 0 && accountSummary.ctr > 0) {
    const ctrDelta = pctChange(accountSummary.ctr, priorSummary.ctr);
    if (ctrDelta != null && ctrDelta <= FLAG_THRESHOLDS.ctr_drop_pct) {
      flags.push({
        code: "account_ctr_dropped",
        severity: "warn",
        target_type: "account",
        target_id: "account",
        target_name: "Account-wide",
        message: `CTR dropped ${Math.abs(ctrDelta).toFixed(0)}% vs prior period (${priorSummary.ctr.toFixed(2)}% → ${accountSummary.ctr.toFixed(2)}%). Check creative or search-term quality.`,
        meta: { current: accountSummary.ctr, prior: priorSummary.ctr, delta_pct: ctrDelta },
      });
    }
  }

  // Account-wide Lost IS
  if (accountSummary.search_budget_lost_is != null && accountSummary.search_budget_lost_is >= FLAG_THRESHOLDS.budget_lost_is_min) {
    flags.push({
      code: "account_high_budget_lost_is",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${(accountSummary.search_budget_lost_is * 100).toFixed(0)}% of Search impressions lost to budget. Multiple campaigns are cap-out on budget.`,
      meta: { pct: accountSummary.search_budget_lost_is },
    });
  }
  if (accountSummary.search_rank_lost_is != null && accountSummary.search_rank_lost_is >= FLAG_THRESHOLDS.rank_lost_is_min) {
    flags.push({
      code: "account_high_rank_lost_is",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${(accountSummary.search_rank_lost_is * 100).toFixed(0)}% of Search impressions lost to rank. Bid or ad quality is the constraint.`,
      meta: { pct: accountSummary.search_rank_lost_is },
    });
  }

  // Per-campaign flags
  for (const r of perCampaign) {
    if (r.status !== "ENABLED") continue;
    if (r.target_cpa > 0 && r.cost_per_conversion > 0 && r.cost_per_conversion > r.target_cpa * FLAG_THRESHOLDS.cpa_multiple) {
      flags.push({
        code: "cpa_above_target",
        severity: "critical",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `CPA $${r.cost_per_conversion.toFixed(2)} is more than ${FLAG_THRESHOLDS.cpa_multiple}× target $${r.target_cpa.toFixed(2)}.`,
        meta: { actual: r.cost_per_conversion, target: r.target_cpa },
      });
    }
    if (r.target_roas > 0 && r.actual_roas > 0 && r.actual_roas < r.target_roas * FLAG_THRESHOLDS.roas_ratio_min) {
      flags.push({
        code: "roas_below_target",
        severity: "critical",
        target_type: "campaign",
        target_id: r.id,
        target_name: r.name,
        message: `ROAS ${r.actual_roas.toFixed(2)} is below ${(FLAG_THRESHOLDS.roas_ratio_min * 100).toFixed(0)}% of target ${r.target_roas.toFixed(2)}.`,
        meta: { actual: r.actual_roas, target: r.target_roas },
      });
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshPerformanceSnapshot = async ({ user, audit, start: startOverride, end: endOverride }) => {
  const tokenDoc = await GoogleAdsToken.findOne({ user: user._id });
  if (!tokenDoc) throw new Error("Google Ads is not connected for this user");

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

  const currentRows = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchCampaigns(tokenDoc, customerId, login, start, end)
  );

  // Prior period
  const windowDays = daysBetween(rangeStart, rangeEnd);
  const priorEnd = new Date(rangeStart); priorEnd.setDate(priorEnd.getDate() - 1);
  const priorStart = new Date(priorEnd); priorStart.setDate(priorStart.getDate() - windowDays);

  let priorRows = [];
  try {
    priorRows = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchCampaigns(tokenDoc, customerId, login, fmtDate(priorStart), fmtDate(priorEnd))
    );
  } catch (err) {
    console.warn("[performance_snapshot] prior fetch failed:", err?.message?.slice(0, 200));
  }

  const account = aggregate(currentRows);
  const prior = aggregate(priorRows);

  // Rank per-campaign rows by cost desc
  currentRows.sort((a, b) => b.cost - a.cost);

  // Merge prior into per-campaign for row-level deltas
  const priorById = new Map(priorRows.map((r) => [r.id, r]));
  const perCampaign = currentRows.map((r) => {
    const p = priorById.get(r.id);
    return {
      ...r,
      delta_cost_pct: p ? pctChange(r.cost, p.cost) : null,
      delta_conversions_pct: p ? pctChange(r.conversions, p.conversions) : null,
      delta_conversions_value_pct: p ? pctChange(r.conversions_value, p.conversions_value) : null,
      delta_ctr_pct: p ? pctChange(r.ctr, p.ctr) : null,
    };
  });

  const flags = buildFlags(account, prior, perCampaign);

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    prior_start_date: priorStart,
    prior_end_date: priorEnd,
    account: {
      ...account,
      delta_impressions_pct: pctChange(account.impressions, prior.impressions),
      delta_clicks_pct: pctChange(account.clicks, prior.clicks),
      delta_cost_pct: pctChange(account.cost, prior.cost),
      delta_conversions_pct: pctChange(account.conversions, prior.conversions),
      delta_conversions_value_pct: pctChange(account.conversions_value, prior.conversions_value),
      delta_ctr_pct: pctChange(account.ctr, prior.ctr),
      delta_cpa_pct: pctChange(account.cost_per_conversion, prior.cost_per_conversion),
      delta_roas_pct: pctChange(account.actual_roas, prior.actual_roas),
    },
    prior,
    per_campaign: perCampaign,
  };

  return { snapshot, flags };
};
