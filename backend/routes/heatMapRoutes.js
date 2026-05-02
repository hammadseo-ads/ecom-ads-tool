import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateHeatMapReports,
  getCachedHeatMap,
  getHeatMapStatus,
  clearHeatMapReports,
} from "../controllers/heatMapController.js";

const router = express.Router();

router.post("/generate", protect, generateHeatMapReports);
router.post("/cached", protect, getCachedHeatMap);
router.post("/status", protect, getHeatMapStatus);
router.delete("/clear", protect, clearHeatMapReports);

export default router;
