import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateHeatMapReports,
  getCachedHeatMap,
  getHeatMapStatus,
  clearHeatMapReports,
  exportHeatMap,
} from "../controllers/heatMapController.js";

const router = express.Router();

router.post("/generate", protect, generateHeatMapReports);
router.post("/cached", protect, getCachedHeatMap);
router.post("/status", protect, getHeatMapStatus);
router.post("/export", protect, exportHeatMap);
router.delete("/clear", protect, clearHeatMapReports);

export default router;
