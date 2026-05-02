import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateGeoReports,
  getCachedGeo,
  getGeoStatus,
  clearGeoReports,
  getGeoThresholds,
  updateGeoThresholds,
} from "../controllers/geoController.js";

const router = express.Router();

router.post("/generate", protect, generateGeoReports);
router.post("/cached", protect, getCachedGeo);
router.post("/status", protect, getGeoStatus);
router.delete("/clear", protect, clearGeoReports);
router.post("/thresholds", protect, getGeoThresholds);
router.post("/thresholds/update", protect, updateGeoThresholds);

export default router;
