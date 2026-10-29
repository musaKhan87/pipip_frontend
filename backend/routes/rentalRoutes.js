const express = require("express");
const router = express.Router();
const {
  createRentalRequest,
  getAllRentalRequests,
  updateRentalStatus,
  getServer,
} = require("../controllers/rentalController");
const { protect, authorizeRoles } = require("../middleware/auth");

// Public rental request creation from website
router.post("/", createRentalRequest);
router.get("/", getServer);

// 🔒 PROTECTED: Admin panel routes
router.get(
  "/admin",
  protect,
  authorizeRoles("super_admin", "admin", "manager"),
  getAllRentalRequests
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin", "manager"),
  updateRentalStatus
);

module.exports = router;
