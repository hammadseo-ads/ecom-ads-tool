// Panel 9 · Landing Page (stub)
// -----------------------------------------------------------------------
// The checklist's "Heatmap Analysis" step is about landing-page user
// behaviour (clicks / scroll depth / recordings) — Hotjar / Microsoft
// Clarity territory. The Google Ads API doesn't expose any of it.
//
// This panel is intentionally light for v1: it lists every distinct
// final URL used by active ads, attributes ad-count + cost to each URL,
// and links out to Clarity / Hotjar so the operator does the behavioural
// analysis in the tool that owns that domain. When we later integrate a
// heatmap API this panel can render embedded content.

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

// Try to extract a hostname from a URL string; return empty string if invalid.
const hostOf = (url) => {
  try { return new URL(url).hostname; } catch { return ""; }
};

const buildQuery = (start, end) => `
  SELECT
    ad_group_ad.ad.id,
    ad_group_ad.ad.type,
    ad_group_ad.ad.final_urls,
    ad_group_ad.status,
    ad_group.name,
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM ad_group_ad
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND ad_group_ad.status = 'ENABLED'
`;

const fetchAdsWithUrls = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildQuery(start, end));
  return toArray(resp);
};

export const refreshLandingPage = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const rows = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchAdsWithUrls(tokenDoc, customerId, login, start, end)
  );

  // Aggregate by (final URL). One ad usually has multiple final_urls (rotates);
  // attribute the ad's metrics evenly across all URLs it lists — approximation.
  const byUrl = new Map();
  for (const row of rows) {
    const ad = row.ad_group_ad?.ad || {};
    const urls = ad.final_urls || ad.finalUrls || [];
    if (!urls.length) continue;
    const m = row.metrics || {};
    const share = 1 / urls.length;
    for (const url of urls) {
      const key = String(url);
      const entry = byUrl.get(key) || {
        url: key,
        host: hostOf(key),
        ad_count: 0,
        campaigns: new Set(),
        impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0,
      };
      entry.ad_count += 1;
      const campId = String(row.campaign?.id || "");
      const campName = String(row.campaign?.name || "");
      if (campId) entry.campaigns.add(`${campId}::${campName}`);
      entry.impressions += num(m.impressions) * share;
      entry.clicks += num(m.clicks) * share;
      entry.cost += (num(m.cost_micros ?? m.costMicros) / 1e6) * share;
      entry.conversions += num(m.conversions) * share;
      entry.conversions_value += num(m.conversions_value ?? m.conversionsValue) * share;
      byUrl.set(key, entry);
    }
  }

  const urls = Array.from(byUrl.values()).map((e) => ({
    ...e,
    campaigns: Array.from(e.campaigns).map((s) => {
      const [id, name] = s.split("::");
      return { id, name };
    }),
    ctr: e.impressions > 0 ? (e.clicks / e.impressions) * 100 : 0,
    roas: e.cost > 0 ? e.conversions_value / e.cost : 0,
  }));

  // Rank by cost desc — operator sees the highest-spend URLs first.
  urls.sort((a, b) => b.cost - a.cost);

  const hosts = new Set(urls.map((u) => u.host).filter(Boolean));

  // Flags — v1 stubs. HTTP-liveness check comes later (see the Web-tool
  // Upgrade Plan v2 · Phase 4 · URL Health Monitor).
  const flags = [];
  if (urls.length === 0) {
    flags.push({
      code: "no_final_urls",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: "No active ads with final URLs found in the window. Ads may all be paused.",
    });
  }
  if (hosts.size > 5) {
    flags.push({
      code: "many_landing_domains",
      severity: "info",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `Ads point to ${hosts.size} distinct domains. If unintentional, that's a targeting or tracking-tag risk.`,
      meta: { host_count: hosts.size, hosts: Array.from(hosts) },
    });
  }

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    total_urls: urls.length,
    total_hosts: hosts.size,
    urls,
    note: "Google's API cannot tell us how visitors behave on the landing page. Open each URL in Microsoft Clarity or Hotjar for the click-density / scroll-depth / recording story. Broken-URL detection (HTTP status, redirect chain) is on the roadmap.",
  };

  return { snapshot, flags };
};
