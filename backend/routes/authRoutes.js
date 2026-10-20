const express = require("express");
const {
  login,
  register,
  getStaff,
  deleteStaff,
  getMe,
  updateStaffAreas,
  updateStaff,
  createManager,
  getManagers,
  updateManager,
  deleteManager,
  getInvestors,
  updateInvestor,
  deleteInvestor,
} = require("../controllers/authController");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Strict Login Rate Limiter: max 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts from this IP, please try again after 15 minutes." },
});

// Public Routes
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);

// Manager Management Routes (Super Admin / Admin Only)
router.post("/managers", protect, adminOnly, createManager);
router.get("/managers", protect, adminOnly, getManagers);
router.put("/managers/:id", protect, adminOnly, updateManager);
router.delete("/managers/:id", protect, adminOnly, deleteManager);

// Investor Management Routes (Super Admin / Admin Only)
router.post("/investors", protect, adminOnly, register);
router.get("/investors", protect, adminOnly, getInvestors);
router.put("/investors/:id", protect, adminOnly, updateInvestor);
router.delete("/investors/:id", protect, adminOnly, deleteInvestor);

// Staff Routes (Super Admin, Admin, Area Manager)
router.get("/staff", protect, authorizeRoles("super_admin", "admin", "manager"), getStaff);
router.post("/staff", protect, authorizeRoles("super_admin", "admin", "manager"), register);
router.put("/staff/:id", protect, authorizeRoles("super_admin", "admin", "manager"), updateStaff);
router.delete("/staff/:id", protect, authorizeRoles("super_admin", "admin", "manager"), deleteStaff);
router.delete("/:id", protect, authorizeRoles("super_admin", "admin", "manager"), deleteStaff);
router.put("/:id/areas", protect, adminOnly, updateStaffAreas);

module.exports = router;