const express = require("express");
const {
  getTodayReport,
  getHistoricalReports,
  getSettings,
  updateSettings,
} = require("../controllers/dailyReportController");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// GET live today's automated totals
router.get("/today", authorizeRoles("super_admin", "admin", "manager"), getTodayReport);

// GET historical reports list
router.get("/history", authorizeRoles("super_admin", "admin", "manager"), getHistoricalReports);

// GET report configuration settings (Super Admin only)
router.get("/settings", adminOnly, getSettings);

// POST/PUT update configuration settings (Super Admin only)
router.post("/settings", adminOnly, updateSettings);

module.exports = router;