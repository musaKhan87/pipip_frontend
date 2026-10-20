const Bike = require("../models/Bike");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * ADMIN: Create Bike
 */
// const createBike = async (req, res) => {
// console.log("FILE =>", req.file);
// console.log("BODY =>", req.body);
//   try {
//     const image_url = req.file ? req.file.path : null;

//     const bike = await Bike.create({
//       ...req.body,
//       image_url,
//     });

//     res.status(201).json(bike);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const createBike = async (req, res) => {
//   try {
//     // 👇 ADD THIS LINE HERE
//     console.log("REQ.FILE =>", req.file);
//     console.log(req.body);

//     const image_url = req.file ? req.file.path : null;
//     console.log(image_url);

    
//     const bike = await Bike.create({
//       ...req.body,
//       image_url,
//     });
   
 
//     res.status(201).json(bike);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const { getUserAreaIds, getAreaScope } = require("../middleware/auth");

const createBike = async (req, res) => {
  try {
    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === req.body.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to this area" });
      }
    }

    // Main image handle karein
    const image_url = req.files?.image_url ? req.files.image_url[0].path : null;

    // Extra images handle karein
    let extraImagePaths = [];
    if (req.files?.extra_images) {
      extraImagePaths = req.files.extra_images.map((file) => file.path);
    }

    const bike = await Bike.create({
      ...req.body,
      image_url,
      extra_images: extraImagePaths,
    });

    res.status(201).json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Bikes (with area-based isolation for manager & staff & super admin area switcher)
 */
const getBikes = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    let currentUser = req.user;

    if (!currentUser && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).populate("assigned_areas").populate("areaId");
        req.user = currentUser;
      } catch (err) {
        // ignore jwt errors
      }
    }

    if (currentUser) {
      const scope = getAreaScope(req);
      if (scope && scope.length > 0) {
        filter.area_id = { $in: scope };
      }
      if (currentUser.role === "investor") {
        const escapeRegex = (text) => text ? text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
        const nameRegex = new RegExp(`^${escapeRegex(currentUser.fullName)}$`, 'i');
        const emailRegex = new RegExp(`^${escapeRegex(currentUser.email)}$`, 'i');
        filter.$or = [
          { bike_owner: { $regex: nameRegex } },
          { bike_owner: { $regex: emailRegex } }
        ];
      }
    }

    const bikes = await Bike.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json(bikes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update Bike
 */
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: "Not found" });

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasOldArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasOldArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the bike's current area" });
      }
      if (req.body.area_id) {
        const hasNewArea = userAreaIds?.some(
          (areaId) => areaId.toString() === req.body.area_id.toString()
        );
        if (!hasNewArea) {
          return res.status(403).json({ message: "Access denied: You cannot move the bike to an unassigned area" });
        }
      }
    }

    const updateData = { ...req.body };

    // 1. Handle Main Profile Image
    if (req.files?.image_url) {
      updateData.image_url = req.files.image_url[0].path;
    }

    // 2. Handle Extra Images (Syncing Deletions + New Uploads)
    let finalExtraImages = [];

    // Check if frontend sent the list of images to KEEP
    if (req.body.remaining_extra_images) {
      try {
        finalExtraImages = JSON.parse(req.body.remaining_extra_images);
      } catch (e) {
        finalExtraImages = [];
      }
    } else {
      finalExtraImages = bike.extra_images || [];
    }

    // Append NEWLY uploaded files to the kept ones
    if (req.files?.extra_images) {
      const newPaths = req.files.extra_images.map((f) => f.path);
      finalExtraImages = [...finalExtraImages, ...newPaths];
    }

    // Enforce the 5-image limit and update the data object
    updateData.extra_images = finalExtraImages.slice(0, 5);

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    );

    res.status(200).json(updatedBike);
  } catch (error) {
    console.error("Backend Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Bike
 */
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: "Bike not found" });

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the bike's area" });
      }
    }

    await Bike.findByIdAndUpdate(req.params.id, { is_deleted: true });
    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleBike = async (req, res) => {
  try {
    const bike = await Bike.findOne({ _id: req.params.id, is_deleted: { $ne: true } });
    
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    let currentUser = req.user;
    if (!currentUser && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).populate("assigned_areas").populate("areaId");
      } catch (err) {
        // ignore jwt errors
      }
    }

    if (currentUser && (currentUser.role === "staff" || currentUser.role === "manager")) {
      const userAreaIds = getUserAreaIds(currentUser);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area" });
      }
    }

    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBike,
  getBikes,
  updateBike,
  deleteBike,
  getSingleBike,
};





