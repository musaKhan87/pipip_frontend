const express = require("express");
const {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
} = require("../controllers/Customercontroller");
const upload = require("../middleware/upload");
const { protect, adminOnly, authorizeRoles } = require("../middleware/auth");
const { customerCreationLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// CREATE customer (Public Online Checkout - Protected with Rate Limiter)
router.post(
  "/",
  customerCreationLimiter,
  upload.fields([
    { name: "aadhaar_image", maxCount: 1 },
    { name: "license_image", maxCount: 1 },
    { name: "extra_documents", maxCount: 5 },
  ]),
  createCustomer
);

// 🔒 PROTECTED: Only authenticated Super Admin, Admin, Manager, and Staff can view customers
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  getCustomer
);

// 🔒 PROTECTED: Customer booking history
router.get(
  "/:id/bookings",
  protect,
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  getCustomerBookings
);

// 🔒 PROTECTED: Updates (Super Admin, Admin, Manager, Staff)
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin", "manager", "staff"),
  upload.fields([
    { name: "aadhaar_image", maxCount: 1 },
    { name: "license_image", maxCount: 1 },
    { name: "extra_documents", maxCount: 5 },
  ]),
  updateCustomer
);

// 🔒 PROTECTED: Admin Only Deletion
router.delete("/:id", protect, adminOnly, deleteCustomer);

module.exports = router;
