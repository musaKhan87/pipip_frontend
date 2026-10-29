const express = require("express");
const {
  getActiveAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreas,
} = require("../controllers/areaController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Public active areas for catalog & booking forms
router.get("/", getActiveAreas);

// 🔒 Admin Only
router.post("/", protect, adminOnly, createArea);
router.put("/:id", protect, adminOnly, updateArea);
router.delete("/:id", protect, adminOnly, deleteArea);
router.get("/areas", protect, adminOnly, getAreas);

module.exports = router;
