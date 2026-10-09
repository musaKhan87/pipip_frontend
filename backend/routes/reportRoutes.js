// routes/reportRoutes.js
const express = require("express");
const { getDailyRevenueReport, getBikeRevenueReport, getBookingStats, getIdleBikesReport , getEndingSoon , getRecentlyExpired } = require("../controllers/reportController");
const { protect, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

// Admin & Manager report routes
router.get("/stats", authorizeRoles("super_admin", "admin", "manager"), getBookingStats);
router.get("/bike-revenue", authorizeRoles("super_admin", "admin", "manager"), getBikeRevenueReport);
router.get("/idle-bikes", authorizeRoles("super_admin", "admin", "manager"), getIdleBikesReport);
router.get("/daily-revenue", authorizeRoles("super_admin", "admin", "manager"), getDailyRevenueReport);

// Area-scoped ending soon & expired routes for Super Admin, Admin, Manager, and Staff
router.get("/ending-soon", authorizeRoles("super_admin", "admin", "manager", "staff"), getEndingSoon);
router.get("/recently-expired", authorizeRoles("super_admin", "admin", "manager", "staff"), getRecentlyExpired);

module.exports = router;