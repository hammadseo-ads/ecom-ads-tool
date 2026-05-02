import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateProductRoasReports,
  getCachedProductRoas,
  getProductRoasStatus,
  clearProductRoasReports,
  getProductRoasThresholds,
  updateProductRoasThresholds,
} from "../controllers/productRoasController.js";

const router = express.Router();

router.post("/generate", protect, generateProductRoasReports);
router.post("/cached", protect, getCachedProductRoas);
router.post("/status", protect, getProductRoasStatus);
router.delete("/clear", protect, clearProductRoasReports);
router.post("/thresholds", protect, getProductRoasThresholds);
router.post("/thresholds/update", protect, updateProductRoasThresholds);

export default router;
