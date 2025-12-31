// backend/models/Campaign.js
import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
    unique: true, // e.g., "camp_123"
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "paused", "ended"],
    default: "active",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
}, { timestamps: true });

// Index for fast lookup
CampaignSchema.index({ userId: 1, customerId: 1 });
CampaignSchema.index({ id: 1 }, { unique: true });

export default mongoose.model("Campaign", CampaignSchema);