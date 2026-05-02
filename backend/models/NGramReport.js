import mongoose from "mongoose";

// N-gram aggregates derived from the existing KeywordSearchTermReport collection.
// We do NOT re-fetch from Google for this — the keyword tool's stored search
// terms ARE the source of truth. So this collection is purely a derived
// summary that can be regenerated any time without API calls.
//
// One document per (user, customer, period). Embeds n-grams for each
// (source_type, ngram_size) combo to keep reads cheap.

const ngramRowSchema = new mongoose.Schema({
  ngram: String,
  ngram_size: Number,                 // 1, 2, or 3
  source_term_count: Number,          // how many distinct search terms this n-gram appeared in
  source_type: String,                // SEARCH | PMAX
  has_cost_data: Boolean,             // false for PMax-only n-grams (cost not available)
  total_impressions: Number,
  total_clicks: Number,
  total_cost: { type: Number, default: 0 },
  total_conversions: Number,
  total_conversion_value: Number,
  ctr: Number,
  conv_rate: Number,
  roas: Number,
  cpa: Number,
}, { _id: false });

const nGramReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer_id: { type: String, required: true },
  report_type: {
    type: String,
    enum: ["LAST_30_DAYS", "LAST_60_DAYS", "LAST_90_DAYS"],
    required: true,
  },
  source_term_count_total: Number,    // how many search terms went into the analysis
  ngrams: [ngramRowSchema],
}, { timestamps: true });

nGramReportSchema.index({ user: 1, customer_id: 1, report_type: 1 });

const NGramReport = mongoose.model("NGramReport", nGramReportSchema);
export default NGramReport;
