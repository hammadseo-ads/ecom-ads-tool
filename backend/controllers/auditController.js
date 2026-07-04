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

const PANEL_REFRESH = {
  campaign_overview: refreshCampaignOverview,
  // performance_snapshot: refreshPerformanceSnapshot,
  // structure: refreshStructure,
  // ... (added as panels ship)
};

// Time-frame → concrete start/end date. `now` is injectable for tests.
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
      start = new Date(now); start.setDate(now.getDate() - 90);
      break;
    case "ALL_TIME":
      // Google Ads accounts rarely have data older than ~5 years for reporting.
      // Use a fixed floor so queries don't fail on "date too far in the past".
      start = new Date("2020-01-01T00:00:00.000Z");
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

// POST /api/audit/:id/panel/:panelKey/refresh
// Refetches panel data from Google Ads for this audit. Delegates to
// the panel-specific controller.
export const refreshPanel = async (req, res) => {
  try {
    const { id, panelKey } = req.params;

    const refresher = PANEL_REFRESH[panelKey];
    if (!refresher) {
      return res.status(400).json({ message: `Unknown panel key or not yet implemented: ${panelKey}` });
    }

    const audit = await Audit.findOne({ _id: id, user: req.user._id });
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    if (audit.status === "sealed") {
      return res.status(409).json({ message: "Audit is sealed and cannot be refreshed" });
    }

    const { snapshot, flags } = await refresher({
      user: req.user,
      audit,
    });

    const panels = audit.panels || {};
    const p = panels[panelKey] || {};
    p.data_snapshot = snapshot;
    p.data_fetched_at = new Date();
    p.flags = flags || [];
    panels[panelKey] = p;
    audit.panels = panels;
    audit.markPanelsModified();

    if (audit.status === "draft") audit.status = "in_progress";

    await audit.save();

    return res.json({
      panelKey,
      data_snapshot: snapshot,
      flags: p.flags,
      data_fetched_at: p.data_fetched_at,
    });
  } catch (err) {
    console.error(`refreshPanel(${req.params.panelKey}) error:`, err);
    return res.status(500).json({ message: err.message || "Failed to refresh panel" });
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
