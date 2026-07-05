// Panel 6 · Search Terms & Competition
// -----------------------------------------------------------------------
// Two data sources, three sub-parts:
//   6a. Search-campaign search terms via `search_term_view` — has full
//       metrics including cost.
//   6b. PMax search-term insights via `campaign_search_term_insight`.
//       Google's API DOES NOT expose per-term cost for PMax (v23.1
//       still). We show what's available (impressions, clicks,
//       conversions, conversion_value) and are explicit about the
//       missing cost.
//   6c. Auction Insights competitor data — not exposed by Google's API.
//       We include a link-out in the panel snapshot to the Google Ads UI.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";

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

// ---------- 6a. Search campaign search terms ----------
const buildSearchTermsQuery = (start, end) => `
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
    metrics.conversions,
    metrics.conversions_value
  FROM search_term_view
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.advertising_channel_type IN ('SEARCH', 'SHOPPING')
    AND metrics.impressions > 0
  ORDER BY metrics.cost_micros DESC
  LIMIT 5000
`;

const fetchSearchTerms = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildSearchTermsQuery(start, end));
  const rows = toArray(resp).map((row) => {
    const stv = row.search_term_view || row.searchTermView || {};
    const c = row.campaign || {};
    const ag = row.ad_group || row.adGroup || {};
    const m = row.metrics || {};
    return {
      search_term: stv.search_term ?? stv.searchTerm ?? "",
      status: String(stv.status || ""),
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      channel_type: String(c.advertising_channel_type ?? c.advertisingChannelType ?? ""),
      ad_group_id: String(ag.id || ""),
      ad_group_name: ag.name || "",
      impressions: num(m.impressions),
      clicks: num(m.clicks),
      cost: num(m.cost_micros ?? m.costMicros) / 1e6,
      conversions: num(m.conversions),
      conversions_value: num(m.conversions_value ?? m.conversionsValue),
    };
  });
  return rows.map((r) => ({
    ...r,
    ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    cost_per_conversion: r.conversions > 0 ? r.cost / r.conversions : 0,
    roas: r.cost > 0 ? r.conversions_value / r.cost : 0,
  }));
};

// ---------- 6b. PMax search-term insights ----------
// campaign_search_term_insight requires filtering by a single campaign per
// query. So we first list PMax campaigns, then loop.
// Cost is NOT available on this resource — Google policy limitation.
const buildPMaxCampaignsQuery = () => `
  SELECT campaign.id, campaign.name
  FROM campaign
  WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const buildPMaxInsightsQuery = (campaignId, start, end) => `
  SELECT
    campaign_search_term_insight.category_label,
    campaign_search_term_insight.id,
    metrics.impressions,
    metrics.clicks,
    metrics.conversions,
    metrics.conversions_value
  FROM campaign_search_term_insight
  WHERE campaign_search_term_insight.campaign_id = '${campaignId}'
    AND segments.date BETWEEN '${start}' AND '${end}'
`;

const fetchPMaxInsights = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const pmaxCampaigns = toArray(await client.query(buildPMaxCampaignsQuery())).map((row) => ({
    id: String(row.campaign?.id || ""),
    name: row.campaign?.name || "",
  })).filter((c) => c.id);

  const all = [];
  // Sequential loop — PMax accounts rarely have >10 campaigns, so serial
  // is fine and keeps us well below Google's rate limits.
  for (const c of pmaxCampaigns) {
    try {
      const resp = await client.query(buildPMaxInsightsQuery(c.id, start, end));
      for (const row of toArray(resp)) {
        const insight = row.campaign_search_term_insight || row.campaignSearchTermInsight || {};
        const m = row.metrics || {};
        all.push({
          campaign_id: c.id,
          campaign_name: c.name,
          category_label: insight.category_label ?? insight.categoryLabel ?? "",
          insight_id: insight.id ?? "",
          impressions: num(m.impressions),
          clicks: num(m.clicks),
          // NO cost field — Google's API doesn't expose it for PMax search insights.
          conversions: num(m.conversions),
          conversions_value: num(m.conversions_value ?? m.conversionsValue),
        });
      }
    } catch (err) {
      console.warn(`[search_terms] PMax insight query failed for campaign ${c.id}:`, err?.message?.slice(0, 200));
    }
  }
  return all.map((r) => ({
    ...r,
    ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
    conv_rate: r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0,
  }));
};

// ---------- flag engine ----------
const FLAG_THRESHOLDS = {
  wasted_cost: 50,       // >$50 with 0 conv → candidate negative
  underperformer_cost: 100, // >$100 with CVR <25% of campaign avg
  add_as_keyword_min_conv: 2, // 2+ conversions → candidate keyword
};

const buildFlags = ({ search_terms, pmax_insights }) => {
  const flags = [];

  // Wasted search terms in Search campaigns
  const wasted = search_terms.filter((t) => t.cost >= FLAG_THRESHOLDS.wasted_cost && t.conversions === 0);
  for (const t of wasted.slice(0, 15)) {
    flags.push({
      code: "search_term_wasted",
      severity: "warn",
      target_type: "search_term",
      target_id: t.search_term,
      target_name: `"${t.search_term}"`,
      message: `Spent $${t.cost.toFixed(2)} on "${t.search_term}" (${t.campaign_name}) with 0 conversions. Candidate negative keyword.`,
      meta: { search_term: t.search_term, cost: t.cost, campaign: t.campaign_name },
    });
  }
  if (wasted.length > 15) {
    flags.push({
      code: "many_wasted_search_terms",
      severity: "info",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${wasted.length} search terms spent >$${FLAG_THRESHOLDS.wasted_cost} with 0 conversions. Bulk-negative pass recommended.`,
      meta: { count: wasted.length },
    });
  }

  // Candidate keywords (converted but not already tracked as keyword)
  const candidates = search_terms.filter((t) => t.conversions >= FLAG_THRESHOLDS.add_as_keyword_min_conv && t.status !== "ADDED");
  if (candidates.length > 0) {
    flags.push({
      code: "candidate_keywords",
      severity: "info",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${candidates.length} search terms with ${FLAG_THRESHOLDS.add_as_keyword_min_conv}+ conversions aren't in your keyword list. Add as exact-match?`,
      meta: { count: candidates.length },
    });
  }

  // PMax categories with clicks + 0 conversions (info only — no cost to
  // scale the flag by)
  const pmaxDead = pmax_insights.filter((i) => i.clicks >= 50 && i.conversions === 0);
  if (pmaxDead.length > 0) {
    flags.push({
      code: "pmax_dead_categories",
      severity: "info",
      target_type: "account",
      target_id: "account",
      target_name: "PMax insights",
      message: `${pmaxDead.length} PMax search-term categories drove ≥50 clicks with 0 conversions. Google doesn't expose per-category cost, so exact waste unknown — add these themes as negatives in PMax Insights UI.`,
      meta: { count: pmaxDead.length },
    });
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshSearchTerms = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const [search_terms, pmax_insights] = await Promise.all([
    withLoginRetry(tokenDoc, customerId, (login) => fetchSearchTerms(tokenDoc, customerId, login, start, end)).catch((err) => {
      console.warn("[search_terms] Search terms fetch failed:", err?.message?.slice(0, 200));
      return [];
    }),
    withLoginRetry(tokenDoc, customerId, (login) => fetchPMaxInsights(tokenDoc, customerId, login, start, end)).catch((err) => {
      console.warn("[search_terms] PMax insights fetch failed:", err?.message?.slice(0, 200));
      return [];
    }),
  ]);

  const flags = buildFlags({ search_terms, pmax_insights });

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    search_terms,
    pmax_insights,
    pmax_cost_note: "Google's API does not expose per-search-term cost for Performance Max campaigns (as of API v23.1). The Google Ads UI shows it because Google has the data internally, but the API refuses to return it. For exact PMax per-term cost, use Google Ads UI → Insights → Search terms → Download.",
    auction_insights_note: "Auction Insights competitor data (Impression Share, Overlap Rate, Position Above) is not exposed by Google's API. You can pull your own impression-share metrics from Panel 2, but the competitor breakdown must be viewed in the Google Ads UI directly.",
    summary: {
      total_search_terms: search_terms.length,
      wasted_search_terms: search_terms.filter((t) => t.cost >= FLAG_THRESHOLDS.wasted_cost && t.conversions === 0).length,
      candidate_keywords: search_terms.filter((t) => t.conversions >= FLAG_THRESHOLDS.add_as_keyword_min_conv && t.status !== "ADDED").length,
      total_pmax_categories: pmax_insights.length,
      total_search_term_cost: search_terms.reduce((s, t) => s + t.cost, 0),
      total_search_term_conversions: search_terms.reduce((s, t) => s + t.conversions, 0),
    },
  };

  return { snapshot, flags };
};
