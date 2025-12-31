// backend/models/Performance.js
import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema({
  // Core identifiers
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  campaignId: {
    type: String,
    required: true,
  },

  // Product info
  productId: {
    type: String,
    required: true,
  },
  productTitle: {
    type: String,
    required: true,
  },

  // Performance metrics
  clicks: {
    type: Number,
    default: 0,
    min: 0,
  },
  impressions: {
    type: Number,
    default: 0,
    min: 0,
  },
  cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  conversions: {
    type: Number,
    default: 0,
    min: 0,
  },
  conversionValue: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Optional: category tag (for filtering)
  categoryTag: {
    type: String,
    enum: [
      "Profitable",
      "Costly",
      "Zero-Conversion",
      "Zombie",
      "Uncategorized",
    ],
    default: "Uncategorized",
  },

  // Timestamps
  date: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast filtering
PerformanceSchema.index({ userId: 1, customerId: 1, campaignId: 1 });
PerformanceSchema.index({ userId: 1, customerId: 1, categoryTag: 1 });

export default mongoose.model("Performance", PerformanceSchema);