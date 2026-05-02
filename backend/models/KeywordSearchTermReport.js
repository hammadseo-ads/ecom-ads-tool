import mongoose from "mongoose";

// Stores Performance Max search term insights, fetched from Google Ads
// `campaign_search_term_insight` resource. One row per (search_term × customer × period).
// Categories are bucketed by clicks/CTR/conversions since cost-per-term is NOT
// available for PMax search terms (Google does not expose it).
const keywordSearchTermReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer_id: { type: String, required: true },
    report_type: {
      type: String,
      enum: ["LAST_30_DAYS", "LAST_60_DAYS", "LAST_90_DAYS"],
      required: true,
    },
    report_start_date: Date,
    report_end_date: Date,

    search_term: { type: String, required: true },
    // Aggregated across campaigns. Per-campaign breakdown lives in the
    // `campaigns` array below.
    total_impressions: { type: Number, default: 0 },
    total_clicks: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 }, // dollars (only Search/Shopping/Display contribute)
    total_conversions: { type: Number, default: 0 },
    total_conversion_value: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // percent
    roas: { type: Number, default: 0 }, // 0 when total_cost == 0
    has_cost_data: { type: Boolean, default: false }, // false if every contributing campaign was PMax
    category: String,
    channel_types: [String], // e.g. ["SEARCH", "PERFORMANCE_MAX"] — the source campaign types

    // Per-campaign details so the user can drill in / filter by campaign.
    campaigns: [
      {
        campaign_id: String,
        campaign_name: String,
        channel_type: String, // SEARCH | SHOPPING | PERFORMANCE_MAX | DISPLAY | ...
        category_label: String, // PMax: Google's "search category" label; others: undefined
        impressions: Number,
        clicks: Number,
        cost: { type: Number, default: 0 }, // 0 for PMax
        conversions: Number,
        conversion_value: Number,
      },
    ],
  },
  { timestamps: true }
);

keywordSearchTermReportSchema.index({ user: 1, customer_id: 1, report_type: 1 });
keywordSearchTermReportSchema.index({ user: 1, customer_id: 1, search_term: 1 });

const KeywordSearchTermReport = mongoose.model(
  "KeywordSearchTermReport",
  keywordSearchTermReportSchema
);

export default KeywordSearchTermReport;
