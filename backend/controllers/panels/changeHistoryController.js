// Panel 12 · Change History
// -----------------------------------------------------------------------
// Answers "what changed?" — the single highest-value diagnostic panel.
//
// GAQL against `change_event`. Google caps this resource at the last 30
// days, regardless of the audit's time frame. We honour the cap, and
// surface the boundary date in the snapshot so the frontend can tell the
// operator "earliest event available: N days ago".
//
// The Google Ads API also has a hard limit of 10,000 events per query.
// If an account exceeds that, we page by descending date until we hit
// the 30-day floor or the row limit.
//
// Flag engine surfaces material changes only: bidding-strategy switches,
// budget swings, status flips, and any script-driven changes on
// critical fields.

import GoogleAdsToken from "../../models/GoogleAdsToken.js";
import { getGoogleAdsClient, refreshGoogleToken } from "../../utils/googleAdsClient.js";
import {
  enumName,
  CHANGE_CLIENT_TYPE,
  CHANGE_RESOURCE_TYPE,
  RESOURCE_CHANGE_OPERATION,
} from "../../utils/googleAdsEnums.js";

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

const fmtDateTime = (d) => {
  // Google Ads DATETIME format: 2026-06-15 14:30:00
  const iso = new Date(d).toISOString().replace("T", " ").split(".")[0];
  return iso;
};

// ---------- GAQL ----------
// change_event supports at most a 30-day lookback. Google's LIMIT here is
// 5000 (not 10000 as the older docs suggest) and ORDER BY change_date_time
// is required — but on some large accounts the query fails silently with
// specific quota / index errors. We use LIMIT 5000, keep ORDER BY DESC
// (required by the API), and wrap in explicit error handling upstream.
const buildQuery = (start, end) => `
  SELECT
    change_event.change_date_time,
    change_event.user_email,
    change_event.client_type,
    change_event.change_resource_type,
    change_event.change_resource_name,
    change_event.resource_change_operation,
    change_event.changed_fields,
    change_event.campaign,
    change_event.ad_group,
    change_event.old_resource,
    change_event.new_resource
  FROM change_event
  WHERE change_event.change_date_time >= '${start}'
    AND change_event.change_date_time <= '${end}'
  ORDER BY change_event.change_date_time DESC
  LIMIT 5000
`;

// ---------- fetching ----------
const fetchChangeEvents = async (tokenDoc, customerId, loginCustomerId, start, end) => {
  const client = getGoogleAdsClient(tokenDoc.refreshToken, customerId, loginCustomerId);
  const resp = await client.query(buildQuery(start, end));
  const rows = toArray(resp);

  return rows.map((row) => {
    const ce = row.change_event || row.changeEvent || {};
    return {
      timestamp: ce.change_date_time ?? ce.changeDateTime ?? null,
      user_email: ce.user_email ?? ce.userEmail ?? "",
      client_type: enumName(CHANGE_CLIENT_TYPE, ce.client_type ?? ce.clientType) || "UNKNOWN",
      resource_type: enumName(CHANGE_RESOURCE_TYPE, ce.change_resource_type ?? ce.changeResourceType) || "UNKNOWN",
      resource_name: ce.change_resource_name ?? ce.changeResourceName ?? "",
      operation: enumName(RESOURCE_CHANGE_OPERATION, ce.resource_change_operation ?? ce.resourceChangeOperation) || "UNKNOWN",
      changed_fields: parseChangedFields(ce.changed_fields ?? ce.changedFields),
      campaign: ce.campaign || "",
      ad_group: ce.ad_group ?? ce.adGroup ?? "",
      // Full JSON blobs kept in the snapshot — enable a future diff drawer
      // without a second fetch. Trimmed later at export if payload gets big.
      old_resource: ce.old_resource ?? ce.oldResource ?? null,
      new_resource: ce.new_resource ?? ce.newResource ?? null,
    };
  }).filter((r) => r.timestamp);
};

// Google Ads returns changed_fields as a FieldMask object with a `paths`
// array. Normalise to a plain string[].
const parseChangedFields = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (raw.paths && Array.isArray(raw.paths)) return raw.paths;
  return [];
};

// ---------- material-change classification ----------
// Fields we consider material (drive real performance change).
const MATERIAL_FIELDS = [
  "budget", "amount_micros",
  "status",
  "bidding_strategy", "bidding_strategy_type",
  "target_cpa", "target_roas",
  "keyword", "match_type", "cpc_bid_micros",
  "final_urls",
  "ad", "responsive_search_ad", "final_url",
  "manual_cpc", "manual_cpm", "manual_cpv",
  "maximize_conversions", "maximize_conversion_value",
];

const isMaterial = (event) => {
  if (event.operation === "CREATE" || event.operation === "REMOVE") return true;
  const changed = event.changed_fields.join(" ").toLowerCase();
  return MATERIAL_FIELDS.some((f) => changed.includes(f));
};

// ---------- flag engine ----------
const buildFlags = (events) => {
  const flags = [];

  // Bidding strategy switches
  for (const e of events) {
    const changed = e.changed_fields.join(" ").toLowerCase();
    if (changed.includes("bidding_strategy") || changed.includes("bidding_strategy_type")) {
      flags.push({
        code: "bidding_strategy_changed",
        severity: "critical",
        target_type: "campaign",
        target_id: e.campaign || e.resource_name || "",
        target_name: shortResourceName(e.campaign || e.resource_name),
        message: `Bidding strategy changed on ${new Date(e.timestamp).toLocaleDateString()} by ${e.user_email || e.client_type}. Almost always the biggest performance-shift explanation.`,
        meta: { timestamp: e.timestamp, actor: e.user_email, changed_fields: e.changed_fields },
      });
    }
  }

  // Campaign status flips (ENABLED ↔ PAUSED)
  for (const e of events) {
    if (
      e.resource_type === "CAMPAIGN" &&
      e.changed_fields.some((f) => /status/.test(f))
    ) {
      const oldStatus = extractStatus(e.old_resource);
      const newStatus = extractStatus(e.new_resource);
      if (oldStatus && newStatus && oldStatus !== newStatus) {
        flags.push({
          code: "campaign_status_flipped",
          severity: "warn",
          target_type: "campaign",
          target_id: e.campaign || e.resource_name || "",
          target_name: shortResourceName(e.campaign || e.resource_name),
          message: `Campaign status changed ${oldStatus} → ${newStatus} on ${new Date(e.timestamp).toLocaleDateString()} by ${e.user_email || e.client_type}.`,
          meta: { timestamp: e.timestamp, actor: e.user_email, from: oldStatus, to: newStatus },
        });
      }
    }
  }

  // Big budget swings (>20% change)
  for (const e of events) {
    if (e.resource_type !== "CAMPAIGN_BUDGET") continue;
    const oldAmount = extractBudget(e.old_resource);
    const newAmount = extractBudget(e.new_resource);
    if (oldAmount > 0 && newAmount > 0) {
      const pct = ((newAmount - oldAmount) / oldAmount) * 100;
      if (Math.abs(pct) >= 20) {
        flags.push({
          code: "budget_swing",
          severity: "warn",
          target_type: "campaign_budget",
          target_id: e.resource_name || "",
          target_name: shortResourceName(e.resource_name),
          message: `Budget ${pct > 0 ? "increased" : "decreased"} ${Math.abs(pct).toFixed(0)}% ($${(oldAmount / 1e6).toFixed(2)} → $${(newAmount / 1e6).toFixed(2)}/day) on ${new Date(e.timestamp).toLocaleDateString()}.`,
          meta: { timestamp: e.timestamp, old_amount: oldAmount / 1e6, new_amount: newAmount / 1e6, pct },
        });
      }
    }
  }

  // Script-driven changes on critical fields
  for (const e of events) {
    if (e.client_type !== "GOOGLE_ADS_SCRIPTS") continue;
    if (isMaterial(e)) {
      flags.push({
        code: "script_material_change",
        severity: "info",
        target_type: e.resource_type.toLowerCase(),
        target_id: e.resource_name || "",
        target_name: shortResourceName(e.resource_name),
        message: `Automation script changed a material field (${e.changed_fields.slice(0, 3).join(", ")}${e.changed_fields.length > 3 ? "…" : ""}) on ${new Date(e.timestamp).toLocaleDateString()}. Worth verifying the script's intent.`,
        meta: { timestamp: e.timestamp, changed_fields: e.changed_fields },
      });
    }
  }

  return flags;
};

const shortResourceName = (rn) => {
  if (!rn) return "resource";
  const parts = String(rn).split("/");
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
};

const extractStatus = (resource) => {
  if (!resource) return null;
  // Resource JSON shape from Google — status is nested under the resource type
  if (resource.campaign) return resource.campaign.status;
  if (typeof resource === "object" && "status" in resource) return resource.status;
  return null;
};

const extractBudget = (resource) => {
  if (!resource) return 0;
  if (resource.campaign_budget) return num(resource.campaign_budget.amount_micros);
  if (resource.campaignBudget) return num(resource.campaignBudget.amountMicros);
  if (resource.amount_micros) return num(resource.amount_micros);
  return 0;
};

// ---------- main refresh export ----------
export const refreshChangeHistory = async ({ user, audit }) => {
  const tokenDoc = await GoogleAdsToken.findOne({ user: user._id });
  if (!tokenDoc) throw new Error("Google Ads is not connected for this user");

  if (Date.now() > (tokenDoc.expiryDate?.getTime() || 0) - 60000) {
    const t = await refreshGoogleToken(tokenDoc.refreshToken);
    tokenDoc.accessToken = t.access_token;
    tokenDoc.expiryDate = new Date(Date.now() + t.expires_in * 1000);
    await tokenDoc.save();
  }

  const customerId = formatCustomerId(audit.customer_id);

  // change_event only supports LESS THAN 30 days back regardless of audit
  // window. Google's API enforces this strictly — asking for exactly
  // -30 days rounds outside the window and returns:
  //   "The requested start date is too old. It cannot be older than 30 days."
  // So we anchor to -29 days to stay safely inside the cap.
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0);
  const end = new Date(now);

  const events = await withLoginRetry(tokenDoc, customerId, (login) =>
    fetchChangeEvents(tokenDoc, customerId, login, fmtDateTime(start), fmtDateTime(end))
  );

  const flags = buildFlags(events);

  // Grouping counts for the header
  const byActor = {};
  const byResourceType = {};
  const byOperation = { CREATE: 0, UPDATE: 0, REMOVE: 0 };
  for (const e of events) {
    const actor = e.client_type === "GOOGLE_ADS_SCRIPTS" ? "Script" :
                  e.client_type === "GOOGLE_ADS_WEB_CLIENT" ? (e.user_email || "Web user") :
                  e.client_type === "GOOGLE_ADS_EDITOR" ? (e.user_email || "Editor") :
                  e.client_type === "GOOGLE_ADS_API" ? "API" :
                  e.user_email || e.client_type || "Unknown";
    byActor[actor] = (byActor[actor] || 0) + 1;
    byResourceType[e.resource_type] = (byResourceType[e.resource_type] || 0) + 1;
    if (byOperation[e.operation] != null) byOperation[e.operation] += 1;
  }

  const snapshot = {
    // Advertise the Google cap explicitly so the UI can show the boundary.
    // Note: we window at 29 days locally to stay just inside Google's
    // strict "less than 30" enforcement.
    api_cap_days: 29,
    // This panel always fetches a fixed 29-day window regardless of the
    // audit's time_frame — Google's API doesn't allow looking further
    // back on change_event, so requesting 60/90 days would fail with
    // "start date too old". Multi-period audits therefore skip the
    // per-sub-period expansion for this panel (see SINGLE_PERIOD_PANELS
    // in auditController.js). Operator can cross-reference this window
    // against Panel 2's daily performance timeline for the same window
    // to correlate specific changes with metric shifts.
    fixed_window_note: `This panel always covers the last ${29} days. For older change history, use the Google Ads UI → Change History (Google keeps up to 2 years there).`,
    fetched_at: new Date(),
    start_date: start,
    end_date: end,
    earliest_event: events.length ? events[events.length - 1].timestamp : null,
    latest_event: events.length ? events[0].timestamp : null,
    // Precompute material flag per row so filtering is fast client-side
    events: events.map((e) => ({ ...e, material: isMaterial(e) })),
    summary: {
      total_events: events.length,
      material_events: events.filter(isMaterial).length,
      by_actor: byActor,
      by_resource_type: byResourceType,
      by_operation: byOperation,
    },
  };

  return { snapshot, flags };
};
