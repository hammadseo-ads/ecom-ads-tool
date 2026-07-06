// Audit CRUD + panel state controller.
//
// Audits are user-scoped and customer-scoped. Every write updates
// updatedAt so the operator sees "last edited" times on the audit list.
//
// Per-panel data fetching lives in ./panels/*.js — this controller only
// handles the audit-level lifecycle and delegates panel refresh to the
// specific panel controller.

import Audit, {
  PANEL_STATUSES,
  AUDIT_STATUSES,
  TIME_FRAMES,
} from "../models/Audit.js";

// Panel refresh dispatch table — add each panel here as it's built.
import { refreshCampaignOverview } from "./panels/campaignOverviewController.js";
import { refreshPerformanceSnapshot } from "./panels/performanceSnapshotController.js";
import { refreshChangeHistory } from "./panels/changeHistoryController.js";
import { refreshStructure } from "./panels/structureController.js";
import { refreshWhereWhen } from "./panels/whereWhenController.js";
import { refreshConversionTracking } from "./panels/conversionTrackingController.js";
import { refreshLandingPage } from "./panels/landingPageController.js";
import { refreshTargeting } from "./panels/targetingController.js";
import { refreshCreativeAssets } from "./panels/creativeAssetsController.js";
import { refreshSearchTerms } from "./panels/searchTermsController.js";
import { refreshLeadGen } from "./panels/leadGenPanelController.js";
import { refreshEcommerce } from "./panels/ecommerceController.js";

const PANEL_REFRESH = {
  campaign_overview: refreshCampaignOverview,
  performance_snapshot: refreshPerformanceSnapshot,
  structure: refreshStructure,
  targeting: refreshTargeting,
  creative_assets: refreshCreativeAssets,
  search_terms: refreshSearchTerms,
  where_when: refreshWhereWhen,
  conversion_tracking: refreshConversionTracking,
  landing_page: refreshLandingPage,
  lead_gen: refreshLeadGen,
  ecommerce: refreshEcommerce,
  change_history: refreshChangeHistory,
};

// Panels whose data source has a hard time-window cap on the API side and
// therefore cannot honour the audit's time_frame. For these we skip the
// multi-period expansion entirely and always run a single-period fetch,
// regardless of whether the audit is LAST_30_DAYS or ALL_THREE_PERIODS.
//
// change_history · Google Ads API's `change_event` resource is capped at
// LESS THAN 30 days. Asking for exactly -30 days returns "start date too
// old". Requesting the same window for LAST_60_DAYS or LAST_90_DAYS is
// wasted API quota — the API refuses anything older than 30 days no
// matter what we ask.
const SINGLE_PERIOD_PANELS = new Set(["change_history"]);

// Time-frame → concrete start/end date. `now` is injectable for tests.
// For ALL_THREE_PERIODS we anchor the audit's canonical window to 90 days
// (widest of the three) so any single-window UI reads still make sense.
// The panel controllers then re-run their fetch for 30/60/90 individually.
export const resolveTimeFrame = (timeFrame, custom, now = new Date()) => {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start;
  switch (timeFrame) {
    case "LAST_30_DAYS":
      start = new Date(now); start.setDate(now.getDate() - 30);
      break;
    case "LAST_60_DAYS":
      start = new Date(now); start.setDate(now.getDate() - 60);
      break;
    case "LAST_90_DAYS":
    case "ALL_THREE_PERIODS":
      start = new Date(now); start.setDate(now.getDate() - 90);
      break;
    case "CUSTOM":
      if (!custom?.start || !custom?.end) {
        throw new Error("CUSTOM time frame requires custom.start and custom.end");
      }
      start = new Date(custom.start);
      return { start, end: new Date(custom.end) };
    default:
      throw new Error(`Unknown time_frame: ${timeFrame}`);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

// For ALL_THREE_PERIODS: enumerate the three sub-windows relative to now.
// Returned as ordered array so the frontend can render 30/60/90 tabs
// consistently.
export const enumerateSubPeriods = (now = new Date()) => {
  const build = (days) => {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { key: `LAST_${days}_DAYS`, days, start, end };
  };
  return [build(30), build(60), build(90)];
};

// POST /api/audit/create
// body: { customer_id, customer_name?, login_customer_id?, time_frame, custom?: {start, end}, compare_base? }
export const createAudit = async (req, res) => {
  try {
    const {
      customer_id,
      customer_name,
      login_customer_id,
      time_frame = "LAST_30_DAYS",
      custom,
      compare_base = "PRIOR_PERIOD",
      title,
    } = req.body || {};

    if (!customer_id) return res.status(400).json({ message: "customer_id required" });
    if (!TIME_FRAMES.includes(time_frame)) {
      return res.status(400).json({ message: `Invalid time_frame; expected one of ${TIME_FRAMES.join(", ")}` });
    }

    const { start, end } = resolveTimeFrame(time_frame, custom);

    const audit = await Audit.create({
      user: req.user._id,
      customer_id: String(customer_id).replace(/customers\//g, "").replace(/-/g, "").trim(),
      customer_name: customer_name || null,
      login_customer_id: login_customer_id ? String(login_customer_id).replace(/customers\//g, "").replace(/-/g, "").trim() : null,
      time_frame,
      start_date: start,
      end_date: end,
      compare_base,
      status: "draft",
      panels: {},
      title: title || null,
    });

    return res.status(201).json({ audit });
  } catch (err) {
    console.error("createAudit error:", err);
    return res.status(500).json({ message: err.message || "Failed to create audit" });
  }
};

// GET /api/audit/list?customer_id=...&status=...&limit=25
export const listAudits = async (req, res) => {
  try {
    const { customer_id, status, limit = 25 } = req.query || {};
    const q = { user: req.user._id };
    if (customer_id) q.customer_id = String(customer_id).replace(/customers\//g, "").replace(/-/g, "").trim();
    if (status && AUDIT_STATUSES.includes(status)) q.status = status;

    const audits = await Audit.find(q)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 25, 200))
      // Return summary shape — drop heavy panels payload
      .select("customer_id customer_name time_frame start_date end_date status title createdAt updatedAt panels")
      .lean();

    // Compute per-audit summary counts so the list UI doesn't need to walk panels.
    const summarized = audits.map((a) => {
      const panels = a.panels || {};
      let reviewed = 0;
      let flagged = 0;
      let total_flags = 0;
      for (const key of Object.keys(panels)) {
        const p = panels[key] || {};
        if (p.status === "reviewed") reviewed += 1;
        if (p.status === "flagged") flagged += 1;
        total_flags += Array.isArray(p.flags) ? p.flags.length : 0;
      }
      return {
        _id: a._id,
        customer_id: a.customer_id,
        customer_name: a.customer_name,
        time_frame: a.time_frame,
        start_date: a.start_date,
        end_date: a.end_date,
        status: a.status,
        title: a.title,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        panel_count: Object.keys(panels).length,
        panels_reviewed: reviewed,
        panels_flagged: flagged,
        total_flags,
      };
    });

    return res.json({ audits: summarized });
  } catch (err) {
    console.error("listAudits error:", err);
    return res.status(500).json({ message: err.message || "Failed to list audits" });
  }
};

// GET /api/audit/:id
export const getAudit = async (req, res) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    return res.json({ audit });
  } catch (err) {
    console.error("getAudit error:", err);
    return res.status(500).json({ message: err.message || "Failed to get audit" });
  }
};

// PATCH /api/audit/:id/panel/:panelKey
// body: { status?, notes? }
export const updatePanelState = async (req, res) => {
  try {
    const { id, panelKey } = req.params;
    const { status, notes } = req.body || {};

    if (status && !PANEL_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status; expected one of ${PANEL_STATUSES.join(", ")}` });
    }

    const audit = await Audit.findOne({ _id: id, user: req.user._id });
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    if (audit.status === "sealed") {
      return res.status(409).json({ message: "Audit is sealed and cannot be modified" });
    }

    const panels = audit.panels || {};
    const p = panels[panelKey] || {};
    if (status !== undefined) {
      p.status = status;
      if (status === "reviewed" || status === "flagged") p.reviewed_at = new Date();
    }
    if (notes !== undefined) p.notes = String(notes || "");
    panels[panelKey] = p;
    audit.panels = panels;
    audit.markPanelsModified();

    // Progress the audit from draft → in_progress on first panel touch.
    if (audit.status === "draft") audit.status = "in_progress";

    await audit.save();
    return res.json({ audit });
  } catch (err) {
    console.error("updatePanelState error:", err);
    return res.status(500).json({ message: err.message || "Failed to update panel" });
  }
};

// Dedup flags by (code + target_id). Keeps the highest-severity variant.
const dedupeFlags = (flagLists) => {
  const seenBy = new Map(); // key -> flag
  const sevRank = { info: 0, warn: 1, critical: 2 };
  for (const flags of flagLists) {
    for (const f of flags || []) {
      const key = `${f.code}|${f.target_id || ""}`;
      const cur = seenBy.get(key);
      if (!cur || (sevRank[f.severity] ?? 0) > (sevRank[cur.severity] ?? 0)) {
        seenBy.set(key, f);
      }
    }
  }
  return Array.from(seenBy.values());
};

// Wrap one refresher call so any failure lands in the snapshot as
// { fetch_status: 'failed', fetch_error } instead of throwing away the
// whole panel. Callers get a consistent { snapshot, flags } shape.
const runOneRefresh = async ({ refresher, user, audit, start, end }) => {
  try {
    const { snapshot, flags } = await refresher({ user, audit, start, end });
    const isNA = snapshot && typeof snapshot === "object" && snapshot.not_applicable === true;
    return {
      snapshot: {
        ...(snapshot || {}),
        fetch_status: isNA ? "not_applicable" : "ok",
        fetched_at: new Date(),
      },
      flags: flags || [],
    };
  } catch (err) {
    const msg = err?.errors?.[0]?.message || err?.message || String(err);
    console.error(`[audit] refresh failed:`, msg?.slice(0, 400));
    return {
      snapshot: {
        fetch_status: "failed",
        fetch_error: msg,
        fetched_at: new Date(),
      },
      flags: [],
    };
  }
};

// Runs a single-period refresh OR a three-period refresh depending on
// audit.time_frame. Returns { snapshot, flags } consistent with the
// single-period shape so callers don't branch, but when multi-period the
// snapshot is { multi_period: true, primary_key, periods: { LAST_30_DAYS: ..., ... } }.
// Panels in SINGLE_PERIOD_PANELS always take the single-period path
// because their data source doesn't honour the audit's time_frame anyway.
const runPanelRefresh = async ({ user, audit, panelKey }) => {
  const refresher = PANEL_REFRESH[panelKey];
  if (!refresher) throw new Error(`Unknown panel key or not yet implemented: ${panelKey}`);

  const forceSinglePeriod = SINGLE_PERIOD_PANELS.has(panelKey);

  if (audit.time_frame === "ALL_THREE_PERIODS" && !forceSinglePeriod) {
    const subs = enumerateSubPeriods();
    const results = {};
    const allFlagLists = [];
    const statuses = new Set();
    for (const sub of subs) {
      // Run sequentially rather than in parallel — Google Ads has aggressive
      // per-minute quotas per developer token; 3 parallel queries per panel ×
      // multiple panels quickly hits QUOTA_EXCEEDED.
      const { snapshot, flags } = await runOneRefresh({
        refresher,
        user,
        audit,
        start: sub.start,
        end: sub.end,
      });
      results[sub.key] = { snapshot, flags };
      allFlagLists.push(flags);
      statuses.add(snapshot?.fetch_status || "unknown");
    }
    // Multi-period fetch status: reflect the aggregate.
    //   all not_applicable  → not_applicable (panel is legitimately N/A)
    //   all failed          → failed
    //   all ok              → ok
    //   any ok + any failed → partial
    //   ok + not_applicable → ok (N/A does not count as failure)
    //   failed + not_applicable (no ok) → failed
    const kinds = Array.from(statuses);
    const anyOk = statuses.has("ok");
    const anyFailed = statuses.has("failed");
    const allNA = kinds.length > 0 && kinds.every((s) => s === "not_applicable");
    const wrapperStatus =
      allNA ? "not_applicable" :
      !anyOk ? "failed" :
      anyFailed ? "partial" :
      "ok";
    return {
      snapshot: {
        multi_period: true,
        primary_key: "LAST_30_DAYS",
        periods: results,
        fetch_status: wrapperStatus,
        fetched_at: new Date(),
      },
      flags: dedupeFlags(allFlagLists),
    };
  }

  // Single-window refresh — audit.start_date / audit.end_date drive it.
  return runOneRefresh({ refresher, user, audit });
};

// POST /api/audit/:id/panel/:panelKey/refresh
// Refetches panel data from Google Ads for this audit. Delegates to
// the panel-specific controller. Handles multi-period expansion.
export const refreshPanel = async (req, res) => {
  try {
    const { id, panelKey } = req.params;

    if (!PANEL_REFRESH[panelKey]) {
      return res.status(400).json({ message: `Unknown panel key or not yet implemented: ${panelKey}` });
    }

    const audit = await Audit.findOne({ _id: id, user: req.user._id });
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    if (audit.status === "sealed") {
      return res.status(409).json({ message: "Audit is sealed and cannot be refreshed" });
    }

    const { snapshot, flags } = await runPanelRefresh({
      user: req.user,
      audit,
      panelKey,
    });

    const panels = audit.panels || {};
    const p = panels[panelKey] || {};
    p.data_snapshot = snapshot;
    p.data_fetched_at = new Date();
    p.flags = flags;
    panels[panelKey] = p;
    audit.panels = panels;
    audit.markPanelsModified();

    if (audit.status === "draft") audit.status = "in_progress";

    await audit.save();

    return res.json({
      panelKey,
      data_snapshot: snapshot,
      flags,
      data_fetched_at: p.data_fetched_at,
    });
  } catch (err) {
    console.error(`refreshPanel(${req.params.panelKey}) error:`, err);
    return res.status(500).json({ message: err.message || "Failed to refresh panel" });
  }
};

// POST /api/audit/:id/run-all
// Runs every implemented panel's refresh sequentially. Returns per-panel
// status so the UI can show which succeeded / failed instead of failing
// the entire batch on one bad panel.
export const runAllPanels = async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findOne({ _id: id, user: req.user._id });
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    if (audit.status === "sealed") {
      return res.status(409).json({ message: "Audit is sealed and cannot be refreshed" });
    }

    const results = [];
    const panels = audit.panels || {};
    for (const panelKey of Object.keys(PANEL_REFRESH)) {
      const startedAt = new Date();
      try {
        const { snapshot, flags } = await runPanelRefresh({
          user: req.user,
          audit,
          panelKey,
        });
        const p = panels[panelKey] || {};
        p.data_snapshot = snapshot;
        p.data_fetched_at = new Date();
        p.flags = flags;
        panels[panelKey] = p;
        results.push({
          panelKey,
          ok: true,
          flag_count: flags.length,
          duration_ms: Date.now() - startedAt.getTime(),
        });
      } catch (err) {
        console.error(`runAllPanels(${panelKey}) error:`, err);
        results.push({
          panelKey,
          ok: false,
          error: err.message || String(err),
          duration_ms: Date.now() - startedAt.getTime(),
        });
      }
    }

    audit.panels = panels;
    audit.markPanelsModified();
    if (audit.status === "draft") audit.status = "in_progress";
    await audit.save();

    return res.json({
      audit_id: id,
      total_panels: Object.keys(PANEL_REFRESH).length,
      succeeded: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
      panels_state: audit.panels,
    });
  } catch (err) {
    console.error("runAllPanels error:", err);
    return res.status(500).json({ message: err.message || "Failed to run panels" });
  }
};

// POST /api/audit/:id/seal
export const sealAudit = async (req, res) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, user: req.user._id });
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    if (audit.status === "sealed") return res.json({ audit });

    audit.status = "sealed";
    audit.sealed_at = new Date();
    await audit.save();

    return res.json({ audit });
  } catch (err) {
    console.error("sealAudit error:", err);
    return res.status(500).json({ message: err.message || "Failed to seal audit" });
  }
};

// DELETE /api/audit/:id
export const deleteAudit = async (req, res) => {
  try {
    const r = await Audit.deleteOne({ _id: req.params.id, user: req.user._id });
    if (r.deletedCount === 0) return res.status(404).json({ message: "Audit not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteAudit error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete audit" });
  }
};
