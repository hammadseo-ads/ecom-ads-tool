// Panel 11 · Ecommerce (thin, per user direction)
// -----------------------------------------------------------------------
// The existing /dashboard/product-roas page already covers Heroes /
// Costly / Zombies / Sleepers bucketing with operator-configurable
// thresholds. We do NOT duplicate that here.
//
// Panel 11 adds three net-new pieces:
//   11a. Product eligibility via `shopping_product` (v17+). Flags
//        NOT_ELIGIBLE products so the operator can fix feed issues.
//   11b. Product overlap validator — same product_item_id appearing in
//        multiple PMax asset groups (Google shouldn't allow this; if it
//        happens, feed misconfig).
//   11c. High-level summary tiles from shopping_performance_view for
//        the deep-link callout to /dashboard/product-roas.
//
// Per-asset-group per-product breakdown (the two-query join) is a real
// future upgrade — deferred to a dedicated commit with proper QA against
// UI export totals.

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

// ---------- shopping performance (summary numbers) ----------
const buildShoppingSummaryQuery = (start, end) => `
  SELECT
    segments.product_item_id,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM shopping_performance_view
  WHERE segments.date BETWEEN '${start}' AND '${end}'
`;

const fetchShoppingSummary = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildShoppingSummaryQuery(start, end));
  const rows = toArray(resp);
  const byProduct = new Map();
  for (const row of rows) {
    const s = row.segments || {};
    const m = row.metrics || {};
    const id = String(s.product_item_id ?? s.productItemId ?? "");
    if (!id) continue;
    const cur = byProduct.get(id) || { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversions_value: 0 };
    cur.impressions += num(m.impressions);
    cur.clicks += num(m.clicks);
    cur.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    cur.conversions += num(m.conversions);
    cur.conversions_value += num(m.conversions_value ?? m.conversionsValue);
    byProduct.set(id, cur);
  }
  return byProduct;
};

// ---------- product eligibility (shopping_product resource v17+) ----------
const buildEligibilityQuery = () => `
  SELECT
    shopping_product.merchant_center_id,
    shopping_product.item_id,
    shopping_product.title,
    shopping_product.brand,
    shopping_product.status,
    shopping_product.currency_code,
    shopping_product.price_micros,
    shopping_product.availability,
    shopping_product.channel,
    shopping_product.issues
  FROM shopping_product
`;

const fetchEligibility = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildEligibilityQuery());
  return toArray(resp).map((row) => {
    const p = row.shopping_product || row.shoppingProduct || {};
    return {
      merchant_center_id: String(p.merchant_center_id ?? p.merchantCenterId ?? ""),
      item_id: String(p.item_id ?? p.itemId ?? ""),
      title: p.title || "",
      brand: p.brand || "",
      status: String(p.status || ""),
      currency: String(p.currency_code ?? p.currencyCode ?? ""),
      price: num(p.price_micros ?? p.priceMicros) / 1e6,
      availability: String(p.availability || ""),
      channel: String(p.channel || ""),
      issues: (p.issues || []).map((i) => ({
        code: i.code ?? "",
        description: i.description ?? "",
        severity: String(i.severity ?? "").toLowerCase(),
      })),
    };
  });
};

// ---------- PMax product overlap ----------
// Fetch which asset group each product is served through in PMax and flag
// duplicates. Uses `asset_group_product_group_view` — one row per (asset
// group, listing group leaf) with segments.product_item_id.
const buildOverlapQuery = (start, end) => `
  SELECT
    campaign.id,
    campaign.name,
    asset_group.id,
    asset_group.name,
    segments.product_item_id,
    metrics.impressions,
    metrics.cost_micros
  FROM asset_group_product_group_view
  WHERE segments.date BETWEEN '${start}' AND '${end}'
    AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
    AND metrics.impressions > 0
  LIMIT 10000
`;

const fetchOverlap = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildOverlapQuery(start, end));
  // Build (product, campaign) -> set of asset groups
  const byKey = new Map();
  for (const row of toArray(resp)) {
    const s = row.segments || {};
    const c = row.campaign || {};
    const ag = row.asset_group || row.assetGroup || {};
    const m = row.metrics || {};
    const productId = String(s.product_item_id ?? s.productItemId ?? "");
    const campaignId = String(c.id || "");
    if (!productId || !campaignId) continue;
    const key = `${campaignId}::${productId}`;
    const cur = byKey.get(key) || {
      product_item_id: productId,
      campaign_id: campaignId,
      campaign_name: c.name || "",
      asset_groups: new Map(),
    };
    const agId = String(ag.id || "");
    const existing = cur.asset_groups.get(agId) || {
      asset_group_id: agId,
      asset_group_name: ag.name || "",
      impressions: 0,
      cost: 0,
    };
    existing.impressions += num(m.impressions);
    existing.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    cur.asset_groups.set(agId, existing);
    byKey.set(key, cur);
  }
  // Flatten and keep only products in >1 asset group per campaign
  const overlaps = [];
  for (const info of byKey.values()) {
    if (info.asset_groups.size > 1) {
      overlaps.push({
        product_item_id: info.product_item_id,
        campaign_id: info.campaign_id,
        campaign_name: info.campaign_name,
        asset_groups: Array.from(info.asset_groups.values()),
      });
    }
  }
  return overlaps;
};

// ---------- flag engine ----------
const buildFlags = ({ eligibility, overlaps }) => {
  const flags = [];

  const notEligible = eligibility.filter((p) => p.status === "NOT_ELIGIBLE");
  if (notEligible.length > 0) {
    flags.push({
      code: "products_not_eligible",
      severity: "critical",
      target_type: "account",
      target_id: "account",
      target_name: "Merchant Center feed",
      message: `${notEligible.length} products marked NOT_ELIGIBLE by Google. Feed / policy issues are silently blocking these from serving.`,
      meta: { count: notEligible.length },
    });
  }

  const restricted = eligibility.filter((p) => p.status === "READY_TO_SERVE" && p.issues.some((i) => i.severity === "warning" || i.severity === "error"));
  if (restricted.length > 0) {
    flags.push({
      code: "products_have_issues",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Merchant Center feed",
      message: `${restricted.length} serving products have feed issues that may throttle delivery. Review in Merchant Center.`,
      meta: { count: restricted.length },
    });
  }

  if (overlaps.length > 0) {
    flags.push({
      code: "product_overlap",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "PMax feed structure",
      message: `${overlaps.length} product(s) appear in multiple asset groups within the same PMax campaign. Asset groups compete against each other in the auction — a feed / listing-group misconfig.`,
      meta: { count: overlaps.length, sample: overlaps.slice(0, 5).map((o) => o.product_item_id) },
    });
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshEcommerce = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const [shoppingMap, eligibility, overlaps] = await Promise.all([
    withLoginRetry(tokenDoc, customerId, (login) => fetchShoppingSummary(tokenDoc, customerId, login, start, end)).catch(() => new Map()),
    withLoginRetry(tokenDoc, customerId, (login) => fetchEligibility(tokenDoc, customerId, login)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchOverlap(tokenDoc, customerId, login, start, end)).catch(() => []),
  ]);

  // Not applicable if no shopping-related activity at all
  if (shoppingMap.size === 0 && eligibility.length === 0) {
    return {
      snapshot: {
        time_frame: audit.time_frame,
        start_date: rangeStart,
        end_date: rangeEnd,
        not_applicable: true,
        note: "No Shopping / Performance Max product activity found on this account. This panel is only meaningful for ecommerce accounts running product ads.",
      },
      flags: [],
    };
  }

  const products = Array.from(shoppingMap.values());
  const totalCost = products.reduce((s, p) => s + p.cost, 0);
  const totalConv = products.reduce((s, p) => s + p.conversions, 0);
  const totalConvValue = products.reduce((s, p) => s + p.conversions_value, 0);
  const productsWithClicks = products.filter((p) => p.clicks > 0);
  const zombies = products.filter((p) => p.impressions > 0 && p.clicks === 0);
  const sleepers = productsWithClicks.filter((p) => p.conversions === 0);
  const heroes = productsWithClicks.filter((p) => p.cost > 0 && p.conversions > 0 && (p.conversions_value / p.cost) >= 4);
  const costly = productsWithClicks.filter((p) => p.cost > 50 && (p.cost > 0 ? (p.conversions_value / p.cost) : 0) < 2);

  const flags = buildFlags({ eligibility, overlaps });

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    not_applicable: false,
    // High-level summary for the deep-link tile grid
    summary: {
      total_products_with_activity: shoppingMap.size,
      total_cost: totalCost,
      total_conversions: totalConv,
      total_conversions_value: totalConvValue,
      account_roas: totalCost > 0 ? totalConvValue / totalCost : 0,
      heroes: heroes.length,
      costly: costly.length,
      zombies: zombies.length,
      sleepers: sleepers.length,
      eligibility_total: eligibility.length,
      eligibility_not_eligible: eligibility.filter((p) => p.status === "NOT_ELIGIBLE").length,
      eligibility_with_issues: eligibility.filter((p) => p.issues && p.issues.length > 0).length,
      overlap_count: overlaps.length,
    },
    eligibility,
    overlaps,
    deep_link: "/dashboard/product-roas",
    deep_link_label: "Open full Product ROAS report",
    per_asset_group_note: "Per-product × per-asset-group breakdown is deferred to a dedicated release with proper QA against the Google Ads UI CSV export. For now, use the Google Ads UI (Products → filter by Asset Group → Download) for that view.",
  };

  return { snapshot, flags };
};
