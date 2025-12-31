// backend/models/GoogleAdsToken.js
import mongoose from "mongoose";

const googleAdsTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  accessToken: String,
  refreshToken: String,
  expiryDate: Date,

  rootCustomerId: String,   // NEW
  isManager: Boolean,       // NEW
  allCustomerIds: [String], // persisted list of accessible customer IDs

  selectedAccountId: String,
  selectedAccountName: String,
  campaignFilters: {
    budgetType: { type: String, default: "all" },
  },
}, { timestamps: true });

export default mongoose.model("GoogleAdsToken", googleAdsTokenSchema);