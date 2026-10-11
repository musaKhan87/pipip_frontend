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
} = require("../controllers/authController");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

// Public Routes
router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);

// Manager Management Routes (Super Admin / Admin Only)
router.post("/managers", protect, adminOnly, createManager);
router.get("/managers", protect, adminOnly, getManagers);
router.put("/managers/:id", protect, adminOnly, updateManager);
router.delete("/managers/:id", protect, adminOnly, deleteManager);

// Staff Routes (Super Admin, Admin, Area Manager)
router.get("/staff", protect, authorizeRoles("super_admin", "admin", "manager"), getStaff);
router.post("/staff", protect, authorizeRoles("super_admin", "admin", "manager"), register);
router.put("/staff/:id", protect, authorizeRoles("super_admin", "admin", "manager"), updateStaff);
router.delete("/staff/:id", protect, authorizeRoles("super_admin", "admin", "manager"), deleteStaff);
router.delete("/:id", protect, authorizeRoles("super_admin", "admin", "manager"), deleteStaff);
router.put("/:id/areas", protect, adminOnly, updateStaffAreas);

module.exports = router;