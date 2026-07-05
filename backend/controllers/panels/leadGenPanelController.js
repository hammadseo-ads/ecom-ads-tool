// Panel 10 · Lead Generation
// -----------------------------------------------------------------------
// Only meaningful for accounts that use Lead Form Extensions. If none
// exist we return a clean N/A snapshot the frontend can render as a
// "not applicable" state.
//
// Data source: `lead_form_submission_data` for actual submissions, plus
// `asset` (with type LEAD_FORM) to enumerate the forms themselves.

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

// ---------- lead form assets ----------
const buildFormsQuery = () => `
  SELECT
    asset.id,
    asset.name,
    asset.lead_form_asset.business_name,
    asset.lead_form_asset.call_to_action_type,
    asset.lead_form_asset.headline,
    asset.lead_form_asset.description,
    asset.lead_form_asset.fields
  FROM asset
  WHERE asset.type = 'LEAD_FORM'
`;

const fetchLeadForms = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildFormsQuery());
  return toArray(resp).map((row) => {
    const a = row.asset || {};
    const lf = a.lead_form_asset || a.leadFormAsset || {};
    return {
      id: String(a.id || ""),
      resource_name: `customers/${customerId}/assets/${a.id}`,
      name: a.name || lf.business_name || lf.businessName || "",
      business_name: lf.business_name ?? lf.businessName ?? "",
      call_to_action: String(lf.call_to_action_type ?? lf.callToActionType ?? ""),
      headline: lf.headline || "",
      description: lf.description || "",
      fields: (lf.fields || []).map((f) => String(f.input_type ?? f.inputType ?? "")),
      field_count: (lf.fields || []).length,
    };
  });
};

// ---------- form usage (which campaigns / ad groups reference them) ----------
const buildAssociationsQuery = () => `
  SELECT
    campaign.id,
    campaign.name,
    campaign_asset.asset,
    campaign_asset.field_type
  FROM campaign_asset
  WHERE campaign_asset.field_type = 'LEAD_FORM'
`;

const fetchFormAssociations = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildAssociationsQuery());
  const byAsset = new Map();
  for (const row of toArray(resp)) {
    const asset = String(row.campaign_asset?.asset ?? row.campaignAsset?.asset ?? "");
    if (!asset) continue;
    const camps = byAsset.get(asset) || [];
    camps.push({
      id: String(row.campaign?.id || ""),
      name: row.campaign?.name || "",
    });
    byAsset.set(asset, camps);
  }
  return byAsset;
};

// ---------- submission counts ----------
// Impressions + click-related metrics for the LEAD_FORM asset itself
// via campaign_asset. all_conversions ≈ submissions when the form's
// conversion action is set as an account goal.
const buildSubmissionQuery = (start, end) => `
  SELECT
    campaign_asset.asset,
    metrics.impressions,
    metrics.clicks,
    metrics.all_conversions,
    metrics.all_conversions_value,
    metrics.cost_micros
  FROM campaign_asset
  WHERE campaign_asset.field_type = 'LEAD_FORM'
    AND segments.date BETWEEN '${start}' AND '${end}'
`;

const fetchSubmissions = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildSubmissionQuery(start, end));
  const byAsset = new Map();
  for (const row of toArray(resp)) {
    const asset = String(row.campaign_asset?.asset ?? row.campaignAsset?.asset ?? "");
    if (!asset) continue;
    const m = row.metrics || {};
    const cur = byAsset.get(asset) || { impressions: 0, clicks: 0, submissions: 0, submission_value: 0, cost: 0 };
    cur.impressions += num(m.impressions);
    cur.clicks += num(m.clicks);
    cur.submissions += num(m.all_conversions ?? m.allConversions);
    cur.submission_value += num(m.all_conversions_value ?? m.allConversionsValue);
    cur.cost += num(m.cost_micros ?? m.costMicros) / 1e6;
    byAsset.set(asset, cur);
  }
  return byAsset;
};

// ---------- flag engine ----------
const buildFlags = (forms) => {
  const flags = [];

  for (const f of forms) {
    // Low submission rate: <15% of clicks convert
    if (f.clicks >= 100 && f.submission_rate < 15 && f.submission_rate > 0) {
      flags.push({
        code: "lead_form_low_submission_rate",
        severity: "warn",
        target_type: "lead_form",
        target_id: f.id,
        target_name: f.name || f.business_name,
        message: `Only ${f.submission_rate.toFixed(1)}% of clicks converted to submissions. Form may have too many fields (${f.field_count}) or low-trust design.`,
        meta: { submission_rate: f.submission_rate, clicks: f.clicks, submissions: f.submissions, field_count: f.field_count },
      });
    }
    // Impressions but 0 form opens (clicks)
    if (f.impressions > 500 && f.clicks === 0) {
      flags.push({
        code: "lead_form_no_opens",
        severity: "warn",
        target_type: "lead_form",
        target_id: f.id,
        target_name: f.name || f.business_name,
        message: `${Math.round(f.impressions).toLocaleString()} impressions but no clicks on the form. Targeting / creative mismatch.`,
      });
    }
    // Many fields — friction risk
    if (f.field_count > 6) {
      flags.push({
        code: "lead_form_too_many_fields",
        severity: "info",
        target_type: "lead_form",
        target_id: f.id,
        target_name: f.name || f.business_name,
        message: `Form has ${f.field_count} fields. Above ~5 fields, submission rates usually collapse.`,
        meta: { field_count: f.field_count },
      });
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshLeadGen = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  let forms = [];
  try {
    forms = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchLeadForms(tokenDoc, customerId, login)
    );
  } catch (err) {
    console.warn("[lead_gen] forms fetch failed:", err?.message?.slice(0, 200));
  }

  if (forms.length === 0) {
    return {
      snapshot: {
        time_frame: audit.time_frame,
        start_date: rangeStart,
        end_date: rangeEnd,
        not_applicable: true,
        note: "No Lead Form Extensions found on this account. This panel is only meaningful for lead-generation accounts.",
        forms: [],
      },
      flags: [],
    };
  }

  const [associations, submissions] = await Promise.all([
    withLoginRetry(tokenDoc, customerId, (login) => fetchFormAssociations(tokenDoc, customerId, login)).catch(() => new Map()),
    withLoginRetry(tokenDoc, customerId, (login) => fetchSubmissions(tokenDoc, customerId, login, start, end)).catch(() => new Map()),
  ]);

  const enriched = forms.map((f) => {
    const camps = associations.get(f.resource_name) || [];
    const sub = submissions.get(f.resource_name) || { impressions: 0, clicks: 0, submissions: 0, submission_value: 0, cost: 0 };
    return {
      ...f,
      campaigns: camps,
      impressions: sub.impressions,
      clicks: sub.clicks,
      submissions: sub.submissions,
      submission_value: sub.submission_value,
      cost: sub.cost,
      // "Submission rate" here = submissions / clicks (form opens). Google's own
      // help doc frames it this way: "of people who opened the form, what % submitted".
      submission_rate: sub.clicks > 0 ? (sub.submissions / sub.clicks) * 100 : 0,
      cost_per_submission: sub.submissions > 0 ? sub.cost / sub.submissions : 0,
    };
  });

  // Rank by cost desc
  enriched.sort((a, b) => b.cost - a.cost);

  const flags = buildFlags(enriched);

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    not_applicable: false,
    forms: enriched,
    summary: {
      total_forms: enriched.length,
      total_impressions: enriched.reduce((s, f) => s + f.impressions, 0),
      total_clicks: enriched.reduce((s, f) => s + f.clicks, 0),
      total_submissions: enriched.reduce((s, f) => s + f.submissions, 0),
      total_cost: enriched.reduce((s, f) => s + f.cost, 0),
    },
  };

  return { snapshot, flags };
};
