// Audit — a first-class object representing one operator-run review of one
// client account at one point in time. Every panel's state (notes, status,
// flags) lives on the audit doc. Per-panel data snapshots (potentially large)
// live embedded as Mixed, but panels that grow past a few hundred KB should
// be split into their own collection later.
//
// Lifecycle: draft → in_progress → sealed. Sealed audits are read-only —
// operator can clone into a new draft but cannot edit the sealed one.
//
// Panel keys mirror the checklist:
//   campaign_overview | performance_snapshot | structure | targeting |
//   creative_assets | search_terms | where_when | conversion_tracking |
//   landing_page | lead_gen | ecommerce | change_history
//
// See Extra files folder/Web-Tool-Upgrade-Plan-v2.md for the full panel spec.

import mongoose from "mongoose";

const PANEL_STATUSES = ["not_reviewed", "reviewed", "flagged", "not_applicable"];
const AUDIT_STATUSES = ["draft", "in_progress", "sealed"];
const TIME_FRAMES = [
  "LAST_30_DAYS",
  "LAST_60_DAYS",
  "LAST_90_DAYS",
  "ALL_THREE_PERIODS", // fetch 30/60/90 in one refresh — snapshot stores all 3
  "CUSTOM",
];
const COMPARE_BASES = ["PRIOR_PERIOD", "PRIOR_YEAR", "ROLLING_AVG"];

const flagSchema = new mongoose.Schema({
  // Stable id so the frontend can dismiss/mark individual flags.
  code: { type: String, required: true },     // e.g. "limited_by_budget"
  severity: {
    type: String,
    enum: ["info", "warn", "critical"],
    default: "warn",
  },
  target_type: String,                        // "campaign" | "ad_group" | "keyword" | etc.
  target_id: String,                          // stable google resource id (string)
  target_name: String,                        // for display
  message: { type: String, required: true },  // human-readable
  // Optional extra context — arbitrary key/value bag for UI (numbers, links, etc.)
  meta: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const panelStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: PANEL_STATUSES,
    default: "not_reviewed",
  },
  notes: { type: String, default: "" },
  reviewed_at: Date,
  // Panel data snapshot — shape is panel-specific, so Mixed.
  // Kept alongside the audit so re-opening a past audit shows what the
  // tool saw *then*, not a stale re-fetch.
  data_snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  data_fetched_at: Date,
  flags: [flagSchema],
}, { _id: false });

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Client / account context
  customer_id: { type: String, required: true, index: true },
  customer_name: String,             // for display; snapshot at audit-create time
  login_customer_id: String,         // MCC login used when fetching (if any)

  // Time frame
  time_frame: {
    type: String,
    enum: TIME_FRAMES,
    required: true,
  },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  compare_base: {
    type: String,
    enum: COMPARE_BASES,
    default: "PRIOR_PERIOD",
  },

  // Lifecycle
  status: {
    type: String,
    enum: AUDIT_STATUSES,
    default: "draft",
  },
  sealed_at: Date,

  // Panels state, keyed by panel key.
  // Uses Mongoose Mixed instead of a strict sub-doc so panels can be added
  // without a schema migration.
  panels: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },

  // Operator-facing name (defaults to `${customer_name} — ${start_date}`).
  title: String,

  // Economics — operator-supplied since Google Ads doesn't know the
  // client's margins. Optional. When present, the tool computes
  // breakeven ROAS = 1 / blended_margin_pct and surfaces the profit /
  // loss delta on every ROAS the audit shows.
  economics: {
    blended_margin_pct: { type: Number, default: null }, // 0.35 = 35% gross margin
    // Reserved for future per-product-type margin override map.
    // margin_by_product_type_l1: { type: Map, of: Number, default: null },
  },
}, { timestamps: true });

auditSchema.index({ user: 1, customer_id: 1, createdAt: -1 });
auditSchema.index({ user: 1, status: 1, createdAt: -1 });

// Ensure `panels` is treated as modified when we set nested keys.
// Mongoose Mixed doesn't auto-detect deep changes.
auditSchema.methods.markPanelsModified = function () {
  this.markModified("panels");
};

const Audit = mongoose.model("Audit", auditSchema);

export default Audit;
export { PANEL_STATUSES, AUDIT_STATUSES, TIME_FRAMES, COMPARE_BASES };
