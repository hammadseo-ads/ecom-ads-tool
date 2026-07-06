// Panel 8 · Conversion Tracking
// -----------------------------------------------------------------------
// Audits the CONFIG of every conversion action. Cannot verify the tag is
// installed correctly on the site — that would require Tag Assistant /
// GTM inspection or a cross-check against Shopify / GA4 (roadmap).
//
// Flags surface the common mistakes:
//   - Multiple conversion actions marked as Primary at the account level
//     (checklist calls this out explicitly)
//   - `Every` counting on a Lead / Signup category (usually a mistake —
//     should be One so multiple form submits from one buyer don't inflate)
//   - Actions with 0 recent firings that used to fire
//   - Actions with `include_in_conversions_metric = false` that are also
//     campaign goals (means they're not in the main Conversions column,
//     confusing for reporting)

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";
import {
  enumName,
  CONVERSION_ACTION_STATUS,
  CONVERSION_ACTION_TYPE,
  CONVERSION_ACTION_CATEGORY,
  CONVERSION_ACTION_COUNTING_TYPE,
  ATTRIBUTION_MODEL,
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

// ---------- GAQL ----------
// One query for the config, second one for the recent firing counts
// segmented by conversion_action.
const CONFIG_QUERY = `
  SELECT
    conversion_action.id,
    conversion_action.name,
    conversion_action.type,
    conversion_action.status,
    conversion_action.category,
    conversion_action.counting_type,
    conversion_action.click_through_lookback_window_days,
    conversion_action.view_through_lookback_window_days,
    conversion_action.include_in_conversions_metric,
    conversion_action.primary_for_goal,
    conversion_action.attribution_model_settings.attribution_model,
    conversion_action.value_settings.default_value
  FROM conversion_action
  WHERE conversion_action.status IN ('ENABLED', 'HIDDEN', 'REMOVED')
`;

const buildFiringQuery = (start, end) => `
  SELECT
    segments.conversion_action,
    segments.conversion_action_name,
    metrics.all_conversions,
    metrics.all_conversions_value
  FROM customer
  WHERE segments.date BETWEEN '${start}' AND '${end}'
`;

const fetchConfig = async (tokenDoc, customerId, loginCustomerId) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(CONFIG_QUERY);
  return toArray(resp).map((row) => {
    const ca = row.conversion_action || row.conversionAction || {};
    return {
      id: String(ca.id || ""),
      resource_name: `customers/${customerId}/conversionActions/${ca.id}`,
      name: ca.name || "",
      type: enumName(CONVERSION_ACTION_TYPE, ca.type),
      status: enumName(CONVERSION_ACTION_STATUS, ca.status),
      category: enumName(CONVERSION_ACTION_CATEGORY, ca.category),
      counting_type: enumName(CONVERSION_ACTION_COUNTING_TYPE, ca.counting_type ?? ca.countingType),
      click_through_lookback_days: num(ca.click_through_lookback_window_days ?? ca.clickThroughLookbackWindowDays),
      view_through_lookback_days: num(ca.view_through_lookback_window_days ?? ca.viewThroughLookbackWindowDays),
      include_in_conversions_metric: Boolean(ca.include_in_conversions_metric ?? ca.includeInConversionsMetric),
      primary_for_goal: Boolean(ca.primary_for_goal ?? ca.primaryForGoal),
      attribution_model: enumName(
        ATTRIBUTION_MODEL,
        ca.attribution_model_settings?.attribution_model ??
        ca.attributionModelSettings?.attributionModel
      ),
      default_value: num(ca.value_settings?.default_value ?? ca.valueSettings?.defaultValue),
    };
  });
};

const fetchFiring = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildFiringQuery(start, end));
  const rows = toArray(resp);
  // Aggregate by conversion_action resource path
  const byAction = new Map();
  for (const row of rows) {
    const seg = row.segments || {};
    const key = String(seg.conversion_action || seg.conversionAction || "");
    if (!key) continue;
    const cur = byAction.get(key) || { all_conversions: 0, all_conversions_value: 0 };
    const m = row.metrics || {};
    cur.all_conversions += num(m.all_conversions ?? m.allConversions);
    cur.all_conversions_value += num(m.all_conversions_value ?? m.allConversionsValue);
    byAction.set(key, cur);
  }
  return byAction;
};

// ---------- flag engine ----------
const LEAD_CATEGORIES = new Set([
  "LEAD", "SUBMIT_LEAD_FORM", "BOOK_APPOINTMENT", "REQUEST_QUOTE",
  "GET_DIRECTIONS", "OUTBOUND_CLICK", "CONTACT", "SIGN_UP",
]);

const buildFlags = (actions) => {
  const flags = [];

  // Count primaries per category — checklist calls out too-many-primaries
  const primariesByCategory = {};
  for (const a of actions.filter((x) => x.status === "ENABLED")) {
    if (!a.primary_for_goal) continue;
    primariesByCategory[a.category] = (primariesByCategory[a.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(primariesByCategory)) {
    if (count > 1) {
      flags.push({
        code: "multiple_primary_goals",
        severity: "critical",
        target_type: "conversion_action",
        target_id: cat,
        target_name: cat,
        message: `${count} conversion actions in the "${cat}" category are marked as Primary. Google's Smart Bidding gets confused when >1 primary exists per category — pick one.`,
        meta: { category: cat, count },
      });
    }
  }

  for (const a of actions) {
    if (a.status !== "ENABLED") continue;

    // Every counting on lead / signup category
    if (a.counting_type === "MANY_PER_CLICK" && LEAD_CATEGORIES.has(a.category)) {
      flags.push({
        code: "lead_counting_every",
        severity: "warn",
        target_type: "conversion_action",
        target_id: a.id,
        target_name: a.name,
        message: `Counting = Every-per-click on a ${a.category} action. For leads / signups, One-per-click is almost always correct.`,
        meta: { category: a.category, counting_type: a.counting_type },
      });
    }

    // Excluded from conversions metric but marked Primary
    if (a.primary_for_goal && !a.include_in_conversions_metric) {
      flags.push({
        code: "primary_excluded_from_conv_metric",
        severity: "warn",
        target_type: "conversion_action",
        target_id: a.id,
        target_name: a.name,
        message: "Primary goal but excluded from the main Conversions column. Reporting will look confusing (goal drives bidding, metric doesn't reflect it).",
      });
    }

    // Zero-firing streak
    if (a.recent_conversions === 0 && a.status === "ENABLED") {
      flags.push({
        code: "zero_firing",
        severity: "warn",
        target_type: "conversion_action",
        target_id: a.id,
        target_name: a.name,
        message: `No firings in the window. If this action fires on a real event on the site, the tag may be broken.`,
      });
    }
  }

  // Duplicate-looking names (case-insensitive equality)
  const seenNames = new Map();
  for (const a of actions.filter((x) => x.status === "ENABLED")) {
    const key = a.name.trim().toLowerCase();
    if (!key) continue;
    if (seenNames.has(key)) {
      flags.push({
        code: "duplicate_action_name",
        severity: "info",
        target_type: "conversion_action",
        target_id: a.id,
        target_name: a.name,
        message: `Another action named "${a.name}" also exists. Verify these aren't double-counting the same event.`,
        meta: { first_id: seenNames.get(key), second_id: a.id },
      });
    } else {
      seenNames.set(key, a.id);
    }
  }

  return flags;
};

// ---------- main refresh export ----------
export const refreshConversionTracking = async ({ user, audit, start: startOverride, end: endOverride }) => {
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

  const actions = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchConfig(tokenDoc, customerId, login)
  );

  // Firing counts (best-effort — non-blocking if it errors)
  let firing = new Map();
  try {
    firing = await withLoginRetry(tokenDoc, customerId, (login) =>
      fetchFiring(tokenDoc, customerId, login, start, end)
    );
  } catch (err) {
    console.warn("[conversion_tracking] firing fetch failed:", err?.message?.slice(0, 200));
  }

  // Merge firing counts into actions
  const enriched = actions.map((a) => ({
    ...a,
    recent_conversions: firing.get(a.resource_name)?.all_conversions ?? 0,
    recent_conversions_value: firing.get(a.resource_name)?.all_conversions_value ?? 0,
  }));

  // Rank: Enabled + Primary first, then Enabled, then others
  enriched.sort((a, b) => {
    const rank = (x) => (x.status === "ENABLED" ? 0 : 1) * 10 + (x.primary_for_goal ? 0 : 1);
    return rank(a) - rank(b) || b.recent_conversions - a.recent_conversions;
  });

  const flags = buildFlags(enriched);

  const enabledActions = enriched.filter((a) => a.status === "ENABLED");
  const summary = {
    total_actions: enriched.length,
    enabled_actions: enabledActions.length,
    primary_actions: enabledActions.filter((a) => a.primary_for_goal).length,
    zero_firing: enabledActions.filter((a) => a.recent_conversions === 0).length,
    total_conversions_in_window: enriched.reduce((s, a) => s + a.recent_conversions, 0),
  };

  const snapshot = {
    time_frame: audit.time_frame,
    start_date: rangeStart,
    end_date: rangeEnd,
    summary,
    actions: enriched,
    note: "Config-side audit only. Verifying the tag is actually firing on the site requires Tag Assistant, or cross-referencing with Shopify / GA4 (roadmap).",
  };

  return { snapshot, flags };
};
