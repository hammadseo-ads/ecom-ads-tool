import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import {
  generateReports,
  getCachedReport,
  getReportStatus,
  clearReports,
  exportCSV,
  listChildAccounts
} from "../controllers/onDemandReportController.js";

const router = express.Router();

router.post("/generate", protect, generateReports);
router.post("/cached", protect, getCachedReport);
router.post("/status", protect, getReportStatus);
router.delete("/clear", protect, clearReports);
router.post("/export-csv", protect, exportCSV);
router.post("/list-accounts", protect, listChildAccounts);

export default router;
