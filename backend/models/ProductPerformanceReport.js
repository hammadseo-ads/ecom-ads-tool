import mongoose from "mongoose";

// Per-product PMax performance row, fetched from shopping_performance_view.
// Each row = one (account, customer_id, period, campaign, product) tuple.
//
// Bucketing: every product is assigned to exactly one bucket based on the
// user's saved thresholds at fetch time. We store the bucket on the row so
// the cache endpoint can do simple aggregates without re-running threshold
// logic. If the user changes their thresholds, we rebucket and overwrite
// (no separate "re-bucket" pipeline needed).
const productPerformanceSchema = new mongoose.Schema(
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

    // Product identity
    product_item_id: { type: String, required: true }, // Merchant Center offer id
    product_title: String,
    product_brand: String,
    product_type_l1: String,
    product_type_l2: String,
    product_type_l3: String,
    product_type_l4: String,
    product_type_l5: String,
    custom_label_0: String,
    custom_label_1: String,
    custom_label_2: String,
    custom_label_3: String,
    custom_label_4: String,

    // Source campaign info — a product can appear in multiple PMax campaigns;
    // we aggregate at the (product × period) level and keep a list of
    // campaigns that contributed to it.
    campaigns: [
      {
        campaign_id: String,
        campaign_name: String,
        impressions: Number,
        clicks: Number,
        cost: Number, // dollars
        conversions: Number,
        conversion_value: Number,
      },
    ],

    // Aggregated metrics (sums across all contributing campaigns)
    total_impressions: { type: Number, default: 0 },
    total_clicks: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 }, // dollars (cost_micros / 1e6)
    total_conversions: { type: Number, default: 0 },
    total_conversion_value: { type: Number, default: 0 },

    // Derived metrics
    roas: { type: Number, default: 0 }, // 0 when total_cost == 0
    cpa: { type: Number, default: 0 }, // 0 when total_conversions == 0
    ctr: { type: Number, default: 0 }, // percent
    conv_rate: { type: Number, default: 0 }, // percent

    // Bucket assigned by the threshold logic at fetch time.
    // One of: Heroes | Costly | Zombies | Sleepers | Low Volume
    bucket: { type: String, index: true },
  },
  { timestamps: true }
);

// Find all rows for one (user, account, period) — drives the page load
productPerformanceSchema.index({ user: 1, customer_id: 1, report_type: 1 });
// Per-bucket queries
productPerformanceSchema.index({ user: 1, customer_id: 1, report_type: 1, bucket: 1 });

const ProductPerformanceReport = mongoose.model(
  "ProductPerformanceReport",
  productPerformanceSchema
);

export default ProductPerformanceReport;
