// Audit routes — all JWT-protected. Operator-only, no public surface.
//
// POST   /api/audit                            → create
// GET    /api/audit                            → list (filter by customer_id, status)
// GET    /api/audit/:id                        → get full audit doc
// PATCH  /api/audit/:id/panel/:panelKey        → update panel state (status, notes)
// POST   /api/audit/:id/panel/:panelKey/refresh → refetch panel data from Google
// POST   /api/audit/:id/seal                   → seal (finalise) the audit
// DELETE /api/audit/:id                        → delete

import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createAudit,
  listAudits,
  getAudit,
  updatePanelState,
  refreshPanel,
  runAllPanels,
  updateEconomics,
  sealAudit,
  deleteAudit,
} from "../controllers/auditController.js";

const router = express.Router();

router.post("/", protect, createAudit);
router.get("/", protect, listAudits);
router.get("/:id", protect, getAudit);
router.patch("/:id/panel/:panelKey", protect, updatePanelState);
router.post("/:id/panel/:panelKey/refresh", protect, refreshPanel);
router.post("/:id/run-all", protect, runAllPanels);
router.patch("/:id/economics", protect, updateEconomics);
router.post("/:id/seal", protect, sealAudit);
router.delete("/:id", protect, deleteAudit);

export default router;
