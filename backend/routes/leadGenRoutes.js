// Routes for the Lead Generation analysis tools.
// Mounted at /api/lead-gen by server.js.
//
// Each tool gets its own subpath. Phase 4A: wasted-keywords. Phases 4B-4D
// will add /heat-map, /geo, /ngrams.

import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateLeadGenWastedKeywords,
  getLeadGenWastedKeywordsCached,
  getLeadGenWastedKeywordsStatus,
  clearLeadGenWastedKeywords,
} from "../controllers/wastedKeywordsLeadGenController.js";

const router = express.Router();

// Wasted Keywords (4A)
router.post("/wasted-keywords/generate", protect, generateLeadGenWastedKeywords);
router.post("/wasted-keywords/cached", protect, getLeadGenWastedKeywordsCached);
router.post("/wasted-keywords/status", protect, getLeadGenWastedKeywordsStatus);
router.delete("/wasted-keywords/clear", protect, clearLeadGenWastedKeywords);

export default router;
