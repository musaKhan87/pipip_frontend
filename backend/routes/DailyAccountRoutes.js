const express = require("express");
const {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/DailyAccountcontroller");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// 🔒 All daily account endpoints require authentication
router.use(protect);

// CREATE operational balance entry
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  createEntry
);

// GET all entries with search/filter queries
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  getEntries
);

// UPDATE operational balance entry
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "manager"),
  updateEntry
);

// DELETE operational balance entry (Admin Only)
router.delete("/:id", adminOnly, deleteEntry);

module.exports = router;
