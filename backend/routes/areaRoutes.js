const express = require("express");
const {
  getActiveAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreas,
} = require("../controllers/areaController");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Public active areas for catalog & booking forms (only returns _id, name, city)
router.get("/", getActiveAreas);

// 🔒 Admin Only
router.post("/", protect, adminOnly, createArea);
router.put("/:id", protect, adminOnly, updateArea);
router.delete("/:id", protect, adminOnly, deleteArea);

// 🔒 Authenticated Admin / Staff / Manager route (returns full area data with operational flags)
router.get(
  "/areas",
  protect,
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  getAreas
);

module.exports = router;
