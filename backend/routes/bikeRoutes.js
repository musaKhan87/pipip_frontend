const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createBike,
  getBikes,
  updateBike,
  deleteBike,
  getSingleBike,
} = require("../controllers/bikeController");
const { protect, superAdminOnly, authorizeRoles } = require("../middleware/auth");

// Public Catalog / Admin Fleet Fetch
router.get("/", getBikes);
router.get("/:id", getSingleBike);

// Admin & Manager Only: Create Bike
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "manager"),
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "extra_images", maxCount: 5 },
  ]),
  createBike
);

// Admin & Manager Only: Update Bike
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin", "manager"),
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "extra_images", maxCount: 5 },
  ]),
  updateBike
);

// Super Admin Only: Soft Delete Bike
router.delete("/:id", protect, superAdminOnly, deleteBike);

module.exports = router;
