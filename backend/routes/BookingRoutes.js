const express = require("express");
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  adminCreateBooking,
  extendBooking,
  assignBikeToBooking,
} = require("../controllers/Bookingcontroller");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");
const verifyTurnstile = require("../middleware/verifyTurnstile");
const { bookingCreationLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// CREATE booking (Public Online Checkout - Protected with Rate Limiting & Turnstile Anti-Bot)
router.post("/", bookingCreationLimiter, verifyTurnstile, createBooking);

// Protected Routes (Admin / Staff / Manager)
router.post("/admin", protect, upload.any(), adminCreateBooking);
router.get("/", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, upload.single("payment_screenshot"), updateBooking);
router.patch("/:id/status", protect, updateBookingStatus);
router.put("/:id/assign-bike", protect, assignBikeToBooking);

// Protected: Extend Booking (Requires Authentication & Authorized Role)
router.patch(
  "/:id/extend",
  protect,
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  extendBooking
);

// Admin Only
router.delete("/:id", protect, adminOnly, deleteBooking);

module.exports = router;