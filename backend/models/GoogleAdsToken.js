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

  // Per-account metadata cache. Survives rate-limits and bad fetches:
  // once we've successfully looked up an account's name + manager flag,
  // we keep it forever and never overwrite with a placeholder.
  // Map<customerId, { name, isManager, lastSeenAt }>.
  // Stored as Mixed so adds/updates don't require defining nested schema.
  accountMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model("GoogleAdsToken", googleAdsTokenSchema);