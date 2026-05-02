import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateKeywordReports,
  getCachedKeywordReport,
  getKeywordReportStatus,
  clearKeywordReports,
} from "../controllers/keywordReportController.js";

const router = express.Router();

router.post("/generate", protect, generateKeywordReports);
router.post("/cached", protect, getCachedKeywordReport);
router.post("/status", protect, getKeywordReportStatus);
router.delete("/clear", protect, clearKeywordReports);

export default router;
