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

  // Server-side cache of /connections result so we don't burn Google Ads API
  // quota on every dashboard load. Each /connections call would otherwise
  // fire 1 + N (account name lookups) + M (per-MCC children) requests.
  // TTL handled in the controller (default 1 hour, refreshable on demand).
  connectionsCache: {
    connections: { type: mongoose.Schema.Types.Mixed, default: null },
    clientAccounts: { type: mongoose.Schema.Types.Mixed, default: null },
    managerAccounts: { type: mongoose.Schema.Types.Mixed, default: null },
    hierarchy: { type: mongoose.Schema.Types.Mixed, default: null },
    cachedAt: { type: Date, default: null },
  },
}, { timestamps: true });

export default mongoose.model("GoogleAdsToken", googleAdsTokenSchema);