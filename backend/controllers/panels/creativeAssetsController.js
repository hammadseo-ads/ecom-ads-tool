// Panel 5 · Ad Creative & Assets
// -----------------------------------------------------------------------
// Three data sources:
//   5a. Headlines / Long headlines / Descriptions (RSAs) via
//       `ad_group_ad_asset_view` — text + Google's performance_label
//       (BEST / GOOD / LOW / LEARNING / PENDING) + pinning + campaign.
//       Per-asset impression / CTR metrics are unreliable in RSAs;
//       we show the label but not per-asset delivery numbers.
//   5b. Images — asset.image_asset with `asset.policy_summary.approval_status`
//       (APPROVED / APPROVED_LIMITED / DISAPPROVED / UNDER_REVIEW).
//   5c. Ad strength — `ad_group_ad.ad_strength` for RSAs. Asset-group
//       strength is already covered in Panel 3 so we don't duplicate.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";

const formatCustomerId = (id) =>
  id ? String(id).replace(/customers\//g, "").replace(/-/g, "").trim() : "";
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

// ---------- 5a. Text assets (headlines / descriptions) ----------
const buildTextAssetsQuery = () => `
  SELECT
    ad_group_ad_asset_view.performance_label,
    ad_group_ad_asset_view.field_type,
    ad_group_ad_asset_view.enabled,
    ad_group_ad_asset_view.pinned_field,
    asset.id,
    asset.text_asset.text,
    ad_group.id,
    ad_group.name,
    campaign.id,
    campaign.name,
    campaign.advertising_channel_type
  FROM ad_group_ad_asset_view
  WHERE ad_group_ad_asset_view.field_type IN (HEADLINE, DESCRIPTION)
    AND campaign.status IN ('ENABLED', 'PAUSED')
    AND ad_group.status = 'ENABLED'
`;

const fetchTextAssets = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildTextAssetsQuery());
  return toArray(resp).map((row) => {
    const av = row.ad_group_ad_asset_view || row.adGroupAdAssetView || {};
    const a = row.asset || {};
    const c = row.campaign || {};
    const ag = row.ad_group || row.adGroup || {};
    return {
      asset_id: String(a.id || ""),
      text: a.text_asset?.text ?? a.textAsset?.text ?? "",
      field_type: String(av.field_type ?? av.fieldType ?? ""),
      performance_label: String(av.performance_label ?? av.performanceLabel ?? "PENDING"),
      enabled: Boolean(av.enabled),
      pinned_field: String(av.pinned_field ?? av.pinnedField ?? ""),
      ad_group_id: String(ag.id || ""),
      ad_group_name: ag.name || "",
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      channel_type: String(c.advertising_channel_type ?? c.advertisingChannelType ?? ""),
    };
  }).map((a) => ({
    ...a,
    char_count: (a.text || "").length,
    char_limit: a.field_type === "DESCRIPTION" ? 90 : 30,
    is_pinned: Boolean(a.pinned_field && a.pinned_field !== "UNSPECIFIED" && a.pinned_field !== "UNKNOWN"),
  }));
};

// ---------- 5b. Images ----------
const buildImagesQuery = () => `
  SELECT
    asset.id,
    asset.name,
    asset.type,
    asset.image_asset.file_size,
    asset.image_asset.full_size.width_pixels,
    asset.image_asset.full_size.height_pixels,
    asset.image_asset.full_size.url,
    asset.policy_summary.approval_status,
    asset.policy_summary.review_status
  FROM asset
  WHERE asset.type = 'IMAGE'
`;

const fetchImages = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildImagesQuery());
  return toArray(resp).map((row) => {
    const a = row.asset || {};
    const ia = a.image_asset || a.imageAsset || {};
    const fs = ia.full_size || ia.fullSize || {};
    const ps = a.policy_summary || a.policySummary || {};
    return {
      id: String(a.id || ""),
      name: a.name || "",
      file_size_bytes: Number(ia.file_size ?? ia.fileSize ?? 0),
      width: Number(fs.width_pixels ?? fs.widthPixels ?? 0),
      height: Number(fs.height_pixels ?? fs.heightPixels ?? 0),
      url: fs.url || "",
      approval_status: String(ps.approval_status ?? ps.approvalStatus ?? ""),
      review_status: String(ps.review_status ?? ps.reviewStatus ?? ""),
    };
  });
};

// ---------- 5c. Ad strength per RSA ----------
const buildAdStrengthQuery = () => `
  SELECT
    ad_group_ad.ad.id,
    ad_group_ad.ad_strength,
    ad_group_ad.status,
    ad_group.id,
    ad_group.name,
    campaign.id,
    campaign.name,
    campaign.advertising_channel_type
  FROM ad_group_ad
  WHERE ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
    AND ad_group_ad.status IN ('ENABLED', 'PAUSED')
    AND ad_group.status = 'ENABLED'
    AND campaign.status IN ('ENABLED', 'PAUSED')
`;

const fetchAdStrength = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildAdStrengthQuery());
  return toArray(resp).map((row) => {
    const aga = row.ad_group_ad || row.adGroupAd || {};
    const c = row.campaign || {};
    const ag = row.ad_group || row.adGroup || {};
    return {
      ad_id: String(aga.ad?.id || ""),
      ad_strength: String(aga.ad_strength ?? aga.adStrength ?? "UNSPECIFIED"),
      status: String(aga.status || ""),
      ad_group_id: String(ag.id || ""),
      ad_group_name: ag.name || "",
      campaign_id: String(c.id || ""),
      campaign_name: c.name || "",
      channel_type: String(c.advertising_channel_type ?? c.advertisingChannelType ?? ""),
    };
  });
};

// ---------- flag engine ----------
const buildFlags = ({ text_assets, images, ad_strengths }) => {
  const flags = [];

  // LOW-labelled headlines
  const lowHeadlines = text_assets.filter((a) => a.field_type === "HEADLINE" && a.performance_label === "LOW" && a.enabled);
  if (lowHeadlines.length > 0) {
    flags.push({
      code: "low_headlines",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${lowHeadlines.length} headlines are labelled LOW by Google. Candidates for the copywriter's rewrite list.`,
      meta: { count: lowHeadlines.length },
    });
  }
  const lowDescriptions = text_assets.filter((a) => a.field_type === "DESCRIPTION" && a.performance_label === "LOW" && a.enabled);
  if (lowDescriptions.length > 0) {
    flags.push({
      code: "low_descriptions",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${lowDescriptions.length} descriptions labelled LOW by Google.`,
      meta: { count: lowDescriptions.length },
    });
  }

  // Disapproved / limited images
  const disapproved = images.filter((i) => i.approval_status === "DISAPPROVED");
  const limited = images.filter((i) => i.approval_status === "APPROVED_LIMITED");
  if (disapproved.length > 0) {
    flags.push({
      code: "disapproved_images",
      severity: "critical",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${disapproved.length} image assets are DISAPPROVED and not showing. Replace them.`,
      meta: { count: disapproved.length },
    });
  }
  if (limited.length > 0) {
    flags.push({
      code: "limited_images",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${limited.length} image assets are APPROVED_LIMITED — Google is showing them less. Review policy reasons.`,
      meta: { count: limited.length },
    });
  }

  // Poor Ad Strength on RSAs
  const poorAds = ad_strengths.filter((a) => (a.ad_strength === "POOR" || a.ad_strength === "AVERAGE") && a.status === "ENABLED");
  if (poorAds.length > 0) {
    flags.push({
      code: "poor_average_rsa_strength",
      severity: "warn",
      target_type: "account",
      target_id: "account",
      target_name: "Account-wide",
      message: `${poorAds.length} responsive search ads have Poor or Average Ad Strength. Google throttles reach on weak RSAs.`,
      meta: { count: poorAds.length },
    });
  }

  // Ad groups with heavily pinned headlines (can distort LOW / GOOD labels)
  const pinnedByAdGroup = {};
  for (const a of text_assets.filter((x) => x.field_type === "HEADLINE" && x.enabled)) {
    if (!pinnedByAdGroup[a.ad_group_id]) pinnedByAdGroup[a.ad_group_id] = { total: 0, pinned: 0, name: `${a.campaign_name} · ${a.ad_group_name}` };
    pinnedByAdGroup[a.ad_group_id].total += 1;
    if (a.is_pinned) pinnedByAdGroup[a.ad_group_id].pinned += 1;
  }
  for (const [id, info] of Object.entries(pinnedByAdGroup)) {
    if (info.total >= 5 && info.pinned / info.total > 0.5) {
      flags.push({
        code: "heavy_pinning",
        severity: "info",
        target_type: "ad_group",
        target_id: id,
        target_name: info.name,
        message: `${info.pinned}/${info.total} headlines are pinned in this ad group. Heavy pinning distorts Google's BEST/LOW labels — the labels reflect the pinned position's performance, not the copy.`,
        meta: { pinned: info.pinned, total: info.total },
      });
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshCreativeAssets = async ({ user, audit }) => {
  const tokenDoc = await GoogleAdsToken.findOne({ user: user._id });
  if (!tokenDoc) throw new Error("Google Ads is not connected for this user");

  if (Date.now() > (tokenDoc.expiryDate?.getTime() || 0) - 60000) {
    const t = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = t.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + t.expires_in * 1000);
    await tokenDoc.save();
  }

  const customerId = formatCustomerId(audit.customer_id);

  const [text_assets, images, ad_strengths] = await Promise.all([
    withLoginRetry(tokenDoc, customerId, (login) => fetchTextAssets(tokenDoc, customerId, login)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchImages(tokenDoc, customerId, login)).catch(() => []),
    withLoginRetry(tokenDoc, customerId, (login) => fetchAdStrength(tokenDoc, customerId, login)).catch(() => []),
  ]);

  const flags = buildFlags({ text_assets, images, ad_strengths });

  // Group text assets for summary
  const byLabel = (list) => list.reduce((acc, a) => { acc[a.performance_label] = (acc[a.performance_label] || 0) + 1; return acc; }, {});

  const snapshot = {
    time_frame: audit.time_frame,
    text_assets,
    images,
    ad_strengths,
    summary: {
      headlines: {
        total: text_assets.filter((a) => a.field_type === "HEADLINE").length,
        by_label: byLabel(text_assets.filter((a) => a.field_type === "HEADLINE")),
      },
      descriptions: {
        total: text_assets.filter((a) => a.field_type === "DESCRIPTION").length,
        by_label: byLabel(text_assets.filter((a) => a.field_type === "DESCRIPTION")),
      },
      images: {
        total: images.length,
        approved: images.filter((i) => i.approval_status === "APPROVED").length,
        limited: images.filter((i) => i.approval_status === "APPROVED_LIMITED").length,
        disapproved: images.filter((i) => i.approval_status === "DISAPPROVED").length,
      },
      ad_strengths: byLabel(ad_strengths.map((a) => ({ performance_label: a.ad_strength }))),
    },
    note: "Google's performance labels (BEST/GOOD/LOW) are directional, not decisive. A LOW headline may be LOW because it was pinned to a position that didn't win the auction lottery. Check pinning before trusting the label.",
  };

  return { snapshot, flags };
};
