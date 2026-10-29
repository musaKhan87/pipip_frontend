const express = require("express");
const { createCustomer, getCustomer, updateCustomer, deleteCustomer, getCustomerBookings } = require("../controllers/Customercontroller");
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const { customerCreationLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// CREATE customer (Protected with Rate Limiter)
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

router.put(
  "/:id",
  upload.fields([
    { name: "aadhaar_image", maxCount: 1 },
    { name: "license_image", maxCount: 1 },
    { name: "extra_documents", maxCount: 5 },
  ]),
  updateCustomer
);

router.get("/", getCustomer);
router.delete("/:id", protect, adminOnly, deleteCustomer);

// booking history
router.get("/:id/bookings", getCustomerBookings);

module.exports = router;
