// Panel 4 · Targeting
// -----------------------------------------------------------------------
// Multi-sub-fetch panel. Data sources:
//   4a. Keywords via `keyword_view`
//   4b. Demographics: age_range_view + gender_view
//   4c. Locations via `geographic_view`
//   4d. Negative keywords via `campaign_criterion` (type=KEYWORD, negative=true)
//        + `shared_criterion` for shared negative lists

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";
import {
  enumName,
  KEYWORD_MATCH_TYPE,
  AD_GROUP_CRITERION_STATUS,
  AGE_RANGE_TYPE,
  GENDER_TYPE,
  INCOME_RANGE_TYPE,
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

// ---------- keywords ----------
const buildKeywordsQuery = (start, end) => `
  SELECT
    ad_group_criterion.criterion_id,
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    ad_group_criterion.quality_info.quality_score,
    ad_group_criterion.status,
    ad_group.id,
    ad_group.name,
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM keyword_view
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND ad_group_criterion.negative = false
    AND ad_group_criterion.status IN ('ENABLED', 'PAUSED')
    AND campaign.status IN ('ENABLED', 'PAUSED')
  ORDER BY metrics.cost_micros DESC
  LIMIT 5000
`;

const fetchKeywords = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildKeywordsQuery(start, end));
  const byId = new Map();
  for (const row of toArray(resp)) {
    const agc = row.ad_group_criterion || row.adGroupCriterion || {};
    const kw = agc.keyword || {};
    const c = row.campaign || {};
    const ag = row.ad_group || row.adGroup || {};
    const m = row.metrics || {};
    const id = String(agc.criterion_id ?? agc.criterionId ?? "");
    if (!id) continue;
    const cur = byId.get(id) || {
      id,
      text: kw.text || "",
      match_type: enumName(KEYWORD_MATCH_TYPE, kw.match_type ?? kw.matchType),
      quality_score: num(agc.quality_info?.quality_score ?? agc.qualityInfo?.qualityScore) || null,
      status: enumName(AD_GROUP_CRITERION_STATUS, agc.status),
      ad_group_id: String(ag.id || ""),
      ad_group_name: ag.name || "",
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
  return Array.from(byId.values()).map((k) => ({
    ...k,
    ctr: k.impressions > 0 ? (k.clicks / k.impressions) * 100 : 0,
    cost_per_conversion: k.conversions > 0 ? k.cost / k.conversions : 0,
    roas: k.cost > 0 ? k.conversions_value / k.cost : 0,
  }));
};

// ---------- age / gender ----------
const buildDemoQuery = (view, dimField, start, end) => `
  SELECT
    ${dimField},
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM ${view}
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.status = 'ENABLED'
`;

const DEMO_ENUM_MAP = {
  AGE: AGE_RANGE_TYPE,
  GENDER: GENDER_TYPE,
  INCOME: INCOME_RANGE_TYPE,
};

const fetchDemo = async (tokenDoc, customerId, loginCustomerId, view, dimField, dimKey, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildDemoQuery(view, dimField, start, end));
  const byCampaign = new Map();
  const enumMap = DEMO_ENUM_MAP[dimKey];
  for (const row of toArray(resp)) {
    const c = row.campaign || {};
    const m = row.metrics || {};
    const cid = String(c.id || "");
    if (!cid) continue;
    // Extract dimension value using dot-path resolution
    const rawDim = dimField.split(".").reduce((o, k) => o?.[k], row);
    const dimVal = enumMap ? enumName(enumMap, rawDim) : String(rawDim || "");
    const cur = byCampaign.get(cid) || {
      campaign_id: cid,
      campaign_name: c.name || "",
      by_segment: {},
    };
    const seg = cur.by_segment[dimVal] || { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 };
    seg.impressions += num(m.impressions);
    seg.clicks += num(m.clicks);
    seg.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    seg.conversions += num(m.conversions);
    seg.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    cur.by_segment[dimVal] = seg;
    byCampaign.set(cid, cur);
  }
  return Array.from(byCampaign.values()).map((c) => ({
    dimension: dimKey,
    campaign_id: c.campaign_id,
    campaign_name: c.campaign_name,
    segments: Object.entries(c.by_segment).map(([value, m]) => ({
      value,
      ...m,
      roas: m.cost > 0 ? m.conversions_value / m.cost : 0,
    })),
  }));
};

// ---------- locations ----------
// Filtering `campaign.status = 'ENABLED'` inside GAQL was empirically
// over-restrictive against `geographic_view` — the query returned zero
// rows for accounts that had geographic activity but the join couldn't
// be resolved with that filter. We drop the filter server-side and
// aggregate at the row level; enabled-vs-paused rollups happen after
// fetch if the operator needs them.
const buildLocationsQuery = (start, end) => `
  SELECT
    geographic_view.country_criterion_id,
    geographic_view.location_type,
    campaign.id,
    campaign.name,
    campaign.status,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM geographic_view
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND metrics.impressions > 0
  LIMIT 2000
`;

const fetchLocations = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildLocationsQuery(start, end));
  const rows = toArray(resp).map((row) => {
    const gv = row.geographic_view || row.geographicView || {};
    const c = row.campaign || {};
    const m = row.metrics || {};
    return {
      country_criterion_id: String(gv.country_criterion_id ?? gv.countryCriterionId ?? ""),
      location_type: String(gv.location_type ?? gv.locationType ?? ""),
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: num(m.cost_micros ?? m.costMicros) / 1e6,
      conversions: num(m.conversions),
      conversions_value: num(m.conversions_value ?? m.conversionsValue),
    };
  }).map((r) => ({
    ...r,
    roas: r.cost > 0 ? r.conversions_value / r.cost : 0,
  }));
  rows.sort((a, b) => b.cost - a.cost);
  return rows;
};

// ---------- negatives (count + top items) ----------
const buildNegativesQuery = () => `
  SELECT
    campaign_criterion.criterion_id,
    campaign_criterion.keyword.text,
    campaign_criterion.keyword.match_type,
    campaign.id,
    campaign.name
  FROM campaign_criterion
  WHERE campaign_criterion.negative = true
    AND campaign_criterion.type = 'KEYWORD'
    AND campaign_criterion.status = 'ENABLED'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchNegatives = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildNegativesQuery());
  return toArray(resp).map((row) => {
    const cc = row.campaign_criterion || row.campaignCriterion || {};
    const kw = cc.keyword || {};
    const c = row.campaign || {};
    return {
      id: String(cc.criterion_id ?? cc.criterionId ?? ""),
      text: kw.text || "",
      match_type: String(kw.match_type ?? kw.matchType ?? ""),
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
    };
  }).map((n) => ({
    ...n,
    match_type: enumName(KEYWORD_MATCH_TYPE, n.match_type),
  })).filter((n) => n.text);
};

// ---------- flag engine ----------
const buildFlags = ({ keywords, negatives }) => {
  const flags = [];

  // Wasted broad-match keywords (>$50 cost, 0 conv)
  const wastedBroad = keywords.filter((k) => k.match_type === "BROAD" && k.cost >= 50 && k.conversions === 0);
  for (const k of wastedBroad.slice(0, 15)) {
    flags.push({
      code: "broad_keyword_wasted",
      severity: "warn",
      target_type: "keyword",
      target_id: k.id,
      target_name: `[Broad] ${k.text}`,
      message: `Broad-match keyword "${k.text}" spent $${k.cost.toFixed(2)} with 0 conversions. Convert to phrase / exact, or add tighter negatives.`,
      meta: { text: k.text, cost: k.cost },
    });
  }
  if (wastedBroad.length > 15) {
    flags.push({
      code: "many_wasted_broad_keywords",
      severity: "info",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${wastedBroad.length} broad-match keywords spent >$50 with 0 conversions.`,
      meta: { count: wastedBroad.length },
    });
  }

  // Low quality-score enabled keywords with cost
  const lowQS = keywords.filter((k) => k.quality_score && k.quality_score <= 4 && k.cost >= 10 && k.status === "ENABLED");
  if (lowQS.length > 0) {
    flags.push({
      code: "low_quality_score",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${lowQS.length} enabled keywords have Quality Score ≤ 4. Ad copy or landing page may be misaligned with the keyword.`,
      meta: { count: lowQS.length },
    });
  }

  // Cross-check: any negative keyword that matches a converting search-campaign keyword?
  // We can only match on exact text — the API doesn't do close-variant matching for us.
  const negTexts = new Set(negatives.map((n) => n.text.toLowerCase()));
  const negativesBlockingConverters = keywords.filter((k) => k.conversions > 0 && negTexts.has(k.text.toLowerCase()));
  if (negativesBlockingConverters.length > 0) {
    flags.push({
      code: "negative_blocks_converter",
      severity: "critical",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${negativesBlockingConverters.length} keyword(s) have EXACT-TEXT matches in your negatives list AND have converted. Verify these negatives aren't silently killing good traffic.`,
      meta: { count: negativesBlockingConverters.length, sample: negativesBlockingConverters.slice(0, 5).map((k) => k.text) },
    });
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshTargeting = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const [keywords, age, gender, locations, negatives] = await Promise.all([
    withLoginRetry(tokenDoc, customerId, (login) => fetchKeywords(tokenDoc, customerId, login, start, end)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchDemo(tokenDoc, customerId, login, "age_range_view", "ad_group_criterion.age_range.type", "AGE", start, end)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchDemo(tokenDoc, customerId, login, "gender_view", "ad_group_criterion.gender.type", "GENDER", start, end)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchLocations(tokenDoc, customerId, login, start, end)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchNegatives(tokenDoc, customerId, login)).catch(() => []),
  ]);

  const flags = buildFlags({ keywords, negatives });

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    keywords,
    demographics: {
      age,
      gender,
    },
    locations,
    negatives,
    summary: {
      total_keywords: keywords.length,
      broad_match_count: keywords.filter((k) => k.match_type === "BROAD").length,
      phrase_match_count: keywords.filter((k) => k.match_type === "PHRASE").length,
      exact_match_count: keywords.filter((k) => k.match_type === "EXACT").length,
      total_negatives: negatives.length,
      total_locations_active: locations.length,
    },
  };

  return { snapshot, flags };
};
