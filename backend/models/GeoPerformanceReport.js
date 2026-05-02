import mongoose from "mongoose";

// Per-location performance, fetched from geographic_view + joined to
// geo_target_constant for human-readable names.
//
// Each document = one (user, customer, period, granularity) tuple, with all
// rows for that period embedded.
//
// IMPORTANT: bid adjustments by location are not allowed in PMax — only full
// exclusion. We capture per-campaign channel_type per location so the UI can
// label the action correctly (Adjust bid vs Exclude).

const geoRowSchema = new mongoose.Schema({
  criterion_id: String,        // Google Ads location criterion ID (e.g., "1014221")
  name: String,                // Resolved from geo_target_constant (e.g., "10001")
  canonical_name: String,      // Full path (e.g., "10001, New York, NY, US")
  target_type: String,         // "Postal Code" | "City" | "Region" | "Metro" | etc.
  country_code: String,        // ISO-2 (e.g., "US")

  total_impressions: { type: Number, default: 0 },
  total_clicks: { type: Number, default: 0 },
  total_cost: { type: Number, default: 0 },
  total_conversions: { type: Number, default: 0 },
  total_conversion_value: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  conv_rate: { type: Number, default: 0 },
  roas: { type: Number, default: 0 },
  cpa: { type: Number, default: 0 },

  bucket: { type: String, index: true }, // Winner | Loser | Sparse

  // Campaigns that contributed to this location's metrics — so the UI can
  // show "Exclude only" if any contributing campaign is PMax.
  campaigns: [{
    campaign_id: String,
    campaign_name: String,
    channel_type: String,
    impressions: Number,
    clicks: Number,
    cost: Number,
    conversions: Number,
    conversion_value: Number,
  }],
}, { _id: false });

const geoPerformanceReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer_id: { type: String, required: true },
  report_type: {
    type: String,
    enum: ["LAST_30_DAYS", "LAST_60_DAYS", "LAST_90_DAYS"],
    required: true,
  },
  granularity: {
    type: String,
    enum: ["postal_code", "city", "region", "metro"],
    required: true,
  },
  view_type: {
    type: String,
    enum: ["GEOGRAPHIC_VIEW", "USER_LOCATION_VIEW"],
    default: "GEOGRAPHIC_VIEW",
  },
  report_start_date: Date,
  report_end_date: Date,
  rows: [geoRowSchema],
}, { timestamps: true });

geoPerformanceReportSchema.index({ user: 1, customer_id: 1, report_type: 1, granularity: 1 });

const GeoPerformanceReport = mongoose.model("GeoPerformanceReport", geoPerformanceReportSchema);
export default GeoPerformanceReport;
