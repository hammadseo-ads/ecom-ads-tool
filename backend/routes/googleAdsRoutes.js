import express from "express";
import protect from "../middleware/authMiddleware.js"; // ✅ default import

import * as googleAdsController from "../controllers/googleAdsController.js"; // ✅ import all named exports

const router = express.Router();

// ---------- OAuth ----------
router.post("/auth-url", protect, googleAdsController.getAuthUrl);
router.get("/callback", googleAdsController.handleCallback);

// ---------- Status & Control ----------
router.get("/status", protect, googleAdsController.getConnections);
router.post("/disconnect", protect, googleAdsController.disconnectGoogleAds);

// ---------- Data ----------
router.post("/connections", protect, googleAdsController.getConnections);
router.post("/campaigns", protect, googleAdsController.getCampaigns);

export default router;
