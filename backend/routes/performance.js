// backend/routes/performance.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getAggregatedPerformance } from "../controllers/performanceController.js";

const router = express.Router();

// POST /api/performance/aggregated
router.post("/aggregated", protect, getAggregatedPerformance);

export default router;