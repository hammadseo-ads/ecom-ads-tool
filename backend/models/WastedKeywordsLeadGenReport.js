import mongoose from "mongoose";

// Lead-Gen "Budget Wastage by Keywords" report.
//
// One DB row per (user, customer_id, days, search_term, campaign_id) — i.e.
// a search term can appear multiple times if it triggered ads in multiple
// campaigns; we keep the breakdown so the UI can show per-campaign spend.
//
// Only includes search terms with: cost_micros > 0 AND conversions == 0
// over the chosen lookback window.
//
// PMax campaigns are excluded entirely because Google does not expose cost
// per PMax search term — "wasted spend" can't be computed without cost.
const wastedKeywordsLeadGenReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer_id: { type: String, required: true, index: true },
    days: { type: Number, enum: [30, 60, 90], required: true },
    report_start_date: Date,
    report_end_date: Date,

    search_term: { type: String, required: true },
    // Whether the term is currently added as keyword, excluded as negative,
    // or just appearing as an organic match (Google's status enum string).
    status: String,

    campaign_id: String,
    campaign_name: String,
    channel_type: String, // SEARCH | SHOPPING | DISPLAY (PMax excluded)
    ad_group_id: String,
    ad_group_name: String,

    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    cost: { type: Number, default: 0 }, // dollars
    // Always 0 for these rows — we filter at query time. Stored for clarity.
    conversions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

wastedKeywordsLeadGenReportSchema.index({ user: 1, customer_id: 1, days: 1 });
wastedKeywordsLeadGenReportSchema.index({ user: 1, customer_id: 1, days: 1, cost: -1 });

const WastedKeywordsLeadGenReport = mongoose.model(
  "WastedKeywordsLeadGenReport",
  wastedKeywordsLeadGenReportSchema
);

export default WastedKeywordsLeadGenReport;
