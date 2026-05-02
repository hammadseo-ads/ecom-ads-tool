import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  generateNGramReports,
  getCachedNGrams,
  getNGramStatus,
  clearNGramReports,
} from "../controllers/nGramController.js";

const router = express.Router();

router.post("/generate", protect, generateNGramReports);
router.post("/cached", protect, getCachedNGrams);
router.post("/status", protect, getNGramStatus);
router.delete("/clear", protect, clearNGramReports);

export default router;
