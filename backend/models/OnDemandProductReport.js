import mongoose from "mongoose";

const onDemandProductReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer_id: { type: String, required: true },
  report_type: { 
    type: String, 
    enum: ['LAST_30_DAYS', 'LAST_60_DAYS', 'LAST_90_DAYS'], 
    required: true 
  },
  report_start_date: Date,
  report_end_date: Date,

  // Product fields
  campaign_id: String,
  product_item_id: String,
  product_title: String,
  product_link: String,
  channel_type: String,
  campaign_name: String,
  total_impressions: Number,
  total_clicks: Number,
  total_cost: Number,
  total_conversions: Number,
  total_conversion_value: Number,
  roas: Number,
  category: String,
}, { timestamps: true });

// Compound indexes
onDemandProductReportSchema.index({ user: 1, customer_id: 1, report_type: 1 });
onDemandProductReportSchema.index({ user: 1, customer_id: 1, campaign_id: 1 });

const OnDemandProductReport = mongoose.model('OnDemandProductReport', onDemandProductReportSchema);

export default OnDemandProductReport;
