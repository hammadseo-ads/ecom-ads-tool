// Panel 3 · Structure
// -----------------------------------------------------------------------
// Three sub-parts:
//   3a. Ad groups per campaign (Search/Display/Shopping)
//   3b. Asset groups per PMax campaign (with ad_strength)
//   3c. Conversion goals config check — # of primary goals per campaign
//
// Change history thumbnail is deferred — Panel 12 already covers it in
// depth; embedding a thumbnail here would duplicate the panel.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";
import {
  enumName,
  CHANNEL_TYPE,
  AD_GROUP_STATUS,
  AD_GROUP_TYPE,
  ASSET_GROUP_STATUS,
  AD_STRENGTH,
  CAMPAIGN_STATUS,
  CONVERSION_ACTION_CATEGORY,
} from "../../utils/googleAdsEnums.js";

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
    try { return await fn(login); }
    catch (err) {
      lastErr = err;
      const msg = err?.errors?.[0]?.message || err.message || "";
      if (!isAuthError(msg)) throw err;
    }
  }
  throw lastErr || new Error("All login_customer_id candidates failed");
};
const fmtDate = (d) => new Date(d).toISOString().split("T")[0];

// ---------- ad groups ----------
const buildAdGroupsQuery = (start, end) => `
  SELECT
    ad_group.id,
    ad_group.name,
    ad_group.status,
    ad_group.type,
    ad_group.cpc_bid_micros,
    campaign.id,
    campaign.name,
    campaign.advertising_channel_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM ad_group
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND ad_group.status IN ('ENABLED', 'PAUSED')
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchAdGroups = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildAdGroupsQuery(start, end));
  const byId = new Map();
  for (const row of toArray(resp)) {
    const ag = row.ad_group || {};
    const c = row.campaign || {};
    const m = row.metrics || {};
    const id = String(ag.id || "");
    if (!id) continue;
    const cur = byId.get(id) || {
      id,
      name: ag.name || `Ad group ${id}`,
      status: enumName(AD_GROUP_STATUS, ag.status),
      type: enumName(AD_GROUP_TYPE, ag.type),
      cpc_bid: num(ag.cpc_bid_micros ?? ag.cpcBidMicros) / 1e6,
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      channel_type: enumName(CHANNEL_TYPE, c.advertising_channel_type ?? c.advertisingChannelType),
      impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0,
    };
    cur.impressions += num(m.impressions);
    cur.clicks += num(m.clicks);
    cur.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    cur.conversions += num(m.conversions);
    cur.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    byId.set(id, cur);
  }
  return Array.from(byId.values()).map((ag) => ({
    ...ag,
    ctr: ag.impressions > 0 ? (ag.clicks / ag.impressions) * 100 : 0,
    roas: ag.cost > 0 ? ag.conversions_value / ag.cost : 0,
    cost_per_conversion: ag.conversions > 0 ? ag.cost / ag.conversions : 0,
  }));
};

// ---------- asset groups (PMax) ----------
const buildAssetGroupsQuery = (start, end) => `
  SELECT
    asset_group.id,
    asset_group.name,
    asset_group.status,
    asset_group.ad_strength,
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM asset_group
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchAssetGroups = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildAssetGroupsQuery(start, end));
  const byId = new Map();
  for (const row of toArray(resp)) {
    const ag = row.asset_group || row.assetGroup || {};
    const c = row.campaign || {};
    const m = row.metrics || {};
    const id = String(ag.id || "");
    if (!id) continue;
    const cur = byId.get(id) || {
      id,
      name: ag.name || `Asset group ${id}`,
      status: enumName(ASSET_GROUP_STATUS, ag.status),
      ad_strength: enumName(AD_STRENGTH, ag.ad_strength ?? ag.adStrength),
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0,
    };
    cur.impressions += num(m.impressions);
    cur.clicks += num(m.clicks);
    cur.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    cur.conversions += num(m.conversions);
    cur.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    byId.set(id, cur);
  }
  return Array.from(byId.values()).map((ag) => ({
    ...ag,
    ctr: ag.impressions > 0 ? (ag.clicks / ag.impressions) * 100 : 0,
    roas: ag.cost > 0 ? ag.conversions_value / ag.cost : 0,
  }));
};

// ---------- conversion goals per campaign ----------
// We fetch each campaign's selective_optimization + associated conversion
// actions' primary_for_goal flag. If a campaign has 0 or >1 primaries, flag.
const buildGoalsQuery = () => `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.selective_optimization.conversion_actions
  FROM campaign
  WHERE campaign.status IN ('ENABLED', 'PAUSED')
`;

const buildPrimaryActionsQuery = () => `
  SELECT
    conversion_action.resource_name,
    conversion_action.primary_for_goal,
    conversion_action.category,
    conversion_action.name
  FROM conversion_action
  WHERE conversion_action.status = 'ENABLED'
`;

const fetchConversionGoalsConfig = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);

  // Which conversion actions are Primary at the account level
  const primaryResp = await client.query(buildPrimaryActionsQuery());
  const primaryMap = new Map();
  for (const row of toArray(primaryResp)) {
    const ca = row.conversion_action || row.conversionAction || {};
    const rn = String(ca.resource_name ?? ca.resourceName ?? "");
    if (!rn) continue;
    primaryMap.set(rn, {
      primary_for_goal: Boolean(ca.primary_for_goal ?? ca.primaryForGoal),
      category: enumName(CONVERSION_ACTION_CATEGORY, ca.category),
      name: ca.name || "",
    });
  }

  // Per-campaign selective_optimization conversion_actions
  const campResp = await client.query(buildGoalsQuery());
  const rows = [];
  for (const row of toArray(campResp)) {
    const c = row.campaign || {};
    const so = c.selective_optimization ?? c.selectiveOptimization ?? {};
    const actions = (so.conversion_actions ?? so.conversionActions ?? []) || [];
    const detail = actions.map((rn) => ({
      resource_name: String(rn),
      ...(primaryMap.get(String(rn)) || {}),
    }));
    // If selective_optimization is empty, campaign inherits account-level
    // primary goals — count those.
    const effective = detail.length > 0
      ? detail
      : Array.from(primaryMap.entries()).filter(([, v]) => v.primary_for_goal).map(([rn, v]) => ({
          resource_name: rn, ...v,
        }));
    const primary_count = effective.filter((a) => a.primary_for_goal).length;
    rows.push({
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      status: enumName(CAMPAIGN_STATUS, c.status),
      goals: effective,
      primary_count,
      uses_selective_optimization: detail.length > 0,
    });
  }
  return rows;
};

// ---------- flag engine ----------
const buildFlags = ({ ad_groups, asset_groups, goals }) => {
  const flags = [];

  // Ad-group dominance (>30% of campaign cost) with poor ROAS (<50% of campaign avg)
  const byCampaign = {};
  for (const ag of ad_groups) {
    if (!byCampaign[ag.campaign_id]) byCampaign[ag.campaign_id] = { total_cost: 0, total_conv_value: 0, groups: [] };
    byCampaign[ag.campaign_id].total_cost += ag.cost;
    byCampaign[ag.campaign_id].total_conv_value += ag.conversions_value;
    byCampaign[ag.campaign_id].groups.push(ag);
  }
  for (const [, camp] of Object.entries(byCampaign)) {
    const campROAS = camp.total_cost > 0 ? camp.total_conv_value / camp.total_cost : 0;
    for (const ag of camp.groups) {
      if (ag.status !== "ENABLED") continue;
      if (camp.total_cost < 100) continue;
      const share = camp.total_cost > 0 ? ag.cost / camp.total_cost : 0;
      if (share > 0.30 && campROAS > 0 && ag.roas < campROAS * 0.5) {
        flags.push({
          code: "ad_group_drags_campaign",
          severity: "warn",
          target_type: "ad_group",
          target_id: ag.id,
          target_name: `${ag.campaign_name} · ${ag.name}`,
          message: `Ad group is ${(share * 100).toFixed(0)}% of campaign cost but ROAS ${ag.roas.toFixed(2)} is <50% of campaign avg ${campROAS.toFixed(2)}.`,
          meta: { share, ag_roas: ag.roas, campaign_avg_roas: campROAS },
        });
      }
    }
  }

  // PMax asset groups with Ad Strength = POOR or NO_ADS
  for (const ag of asset_groups) {
    if (["POOR", "NO_ADS"].includes(ag.ad_strength)) {
      flags.push({
        code: "asset_group_poor_strength",
        severity: "warn",
        target_type: "asset_group",
        target_id: ag.id,
        target_name: `${ag.campaign_name} · ${ag.name}`,
        message: `Asset group Ad Strength = ${ag.ad_strength}. Google throttles reach on weak asset groups — add more headlines / images / descriptions.`,
        meta: { ad_strength: ag.ad_strength },
      });
    }
  }

  // Conversion goals: 0 or >1 Primary per campaign
  for (const g of goals) {
    if (g.status !== "ENABLED") continue;
    if (g.primary_count === 0) {
      flags.push({
        code: "no_primary_goal",
        severity: "critical",
        target_type: "campaign",
        target_id: g.campaign_id,
        target_name: g.campaign_name,
        message: "No Primary conversion goal on this campaign. Smart Bidding has nothing to optimise toward.",
      });
    } else if (g.primary_count > 1) {
      flags.push({
        code: "multiple_primary_goals",
        severity: "warn",
        target_type: "campaign",
        target_id: g.campaign_id,
        target_name: g.campaign_name,
        message: `${g.primary_count} Primary conversion goals selected. Smart Bidding gets confused when >1 primary — pick one.`,
        meta: { primary_count: g.primary_count },
      });
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshStructure = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const ad_groups = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchAdGroups(tokenDoc, customerId, login, start, end)
  );

  let asset_groups = [];
  try {
    asset_groups = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchAssetGroups(tokenDoc, customerId, login, start, end)
    );
  } catch (err) {
    console.warn("[structure] asset_group fetch failed:", err?.message?.slice(0, 200));
  }

  let goals = [];
  try {
    goals = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchConversionGoalsConfig(tokenDoc, customerId, login)
    );
  } catch (err) {
    console.warn("[structure] conversion-goals fetch failed:", err?.message?.slice(0, 200));
  }

  // Rank ad groups + asset groups by cost desc
  ad_groups.sort((a, b) => b.cost - a.cost);
  asset_groups.sort((a, b) => b.cost - a.cost);
  goals.sort((a, b) => (a.campaign_name || "").localeCompare(b.campaign_name || ""));

  const flags = buildFlags({ ad_groups, asset_groups, goals });

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    ad_groups,
    asset_groups,
    goals,
    summary: {
      total_ad_groups: ad_groups.length,
      total_asset_groups: asset_groups.length,
      total_campaigns_with_goals: goals.length,
      campaigns_no_primary: goals.filter((g) => g.primary_count === 0).length,
      campaigns_multi_primary: goals.filter((g) => g.primary_count > 1).length,
    },
  };

  return { snapshot, flags };
};
