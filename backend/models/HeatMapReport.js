import mongoose from "mongoose";

// One document per (user, customer, period). Holds per-campaign metadata
// (so the page can show bidding-strategy warnings) plus per-campaign 7×24
// cells AND a cross-campaign aggregated 7×24 grid.
//
// Smoothing is computed on read (not stored) — it's cheap and lets us
// experiment with smoothing windows later without re-fetching from Google.
const cellSchema = new mongoose.Schema({
  day_of_week: Number, // 1=Monday … 7=Sunday (ISO)
  hour: Number,        // 0–23 in account timezone
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  cost: { type: Number, default: 0 }, // dollars
  conversions: { type: Number, default: 0 },
  conversion_value: { type: Number, default: 0 },
}, { _id: false });

const campaignDataSchema = new mongoose.Schema({
  campaign_id: String,
  campaign_name: String,
  channel_type: String,        // SEARCH / SHOPPING / PERFORMANCE_MAX / DISPLAY / VIDEO / etc.
  bidding_strategy_type: String, // MANUAL_CPC / MAXIMIZE_CLICKS / TARGET_ROAS / TARGET_CPA / ...
  // Whether time-of-day bid adjustments are actionable for this campaign.
  // True only for MANUAL_CPC + MAXIMIZE_CLICKS on Search/Shopping. PMax and
  // any Smart Bidding strategy → false (frontend shows "pause hour" only).
  supports_bid_multiplier: { type: Boolean, default: false },
  cells: [cellSchema], // up to 168 cells (7 × 24); sparse if no data for a slot
}, { _id: false });

const heatMapReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer_id: { type: String, required: true },
  report_type: {
    type: String,
    enum: ["LAST_30_DAYS", "LAST_60_DAYS", "LAST_90_DAYS"],
    required: true,
  },
  report_start_date: Date,
  report_end_date: Date,

  per_campaign: [campaignDataSchema],
  // Aggregated cells across ALL campaigns (sums)
  aggregated_cells: [cellSchema],

  // Counts for the page header
  total_campaigns: { type: Number, default: 0 },
  manual_bidding_campaigns: { type: Number, default: 0 }, // how many support multipliers
}, { timestamps: true });

heatMapReportSchema.index({ user: 1, customer_id: 1, report_type: 1 });

const HeatMapReport = mongoose.model("HeatMapReport", heatMapReportSchema);
export default HeatMapReport;
