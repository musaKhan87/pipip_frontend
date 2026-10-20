const Bike = require("../models/Bike");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logAudit, getClientIp } = require("../utils/auditLogger");
const { getUserAreaIds, getAreaScope } = require("../middleware/auth");

const SENSITIVE_PROJECTION =
  "-bike_owner -fine_owner -bike_expenses -gps_installed_date -last_service_date -last_battery_changed -last_tyre_change";

/**
 * Helper to resolve user from auth token (optional auth endpoints)
 */
const resolveCurrentUser = async (req) => {
  if (req.user) return req.user;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .populate("assigned_areas")
        .populate("areaId")
        .lean();
      req.user = user;
      return user;
    } catch (err) {
      // invalid token, treat as public
    }
  }
  return null;
};

/**
 * Sanitizes incoming bike payload (converts empty string dates & ObjectIds to null, normalizes numbers)
 */
const sanitizeBikeData = (body) => {
  const data = { ...body };

  // 1. Sanitize ObjectId references (convert "" or "none" to null)
  if (
    !data.area_id ||
    data.area_id === "" ||
    data.area_id === "none" ||
    data.area_id === "null" ||
    data.area_id === "undefined"
  ) {
    data.area_id = null;
  }

  // 2. Sanitize Date fields (convert "" to null)
  const dateFields = [
    "insurance_end_date",
    "puc_end_date",
    "bike_end_date",
    "last_service_date",
    "last_battery_changed",
    "last_tyre_change",
    "gps_installed_date",
  ];
  dateFields.forEach((field) => {
    if (
      data[field] === "" ||
      data[field] === "null" ||
      data[field] === "undefined" ||
      data[field] === undefined
    ) {
      data[field] = null;
    } else {
      const parsedDate = new Date(data[field]);
      data[field] = isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
  });

  // 3. Sanitize Numbers
  if (data.cc !== undefined) data.cc = Number(data.cc) || 0;
  if (data.price_per_hour !== undefined) data.price_per_hour = Number(data.price_per_hour) || 0;
  if (data.price_per_day !== undefined) data.price_per_day = Number(data.price_per_day) || 0;
  if (data.bike_expenses !== undefined) data.bike_expenses = Number(data.bike_expenses) || 0;
  if (data.total_km_run !== undefined) data.total_km_run = Number(data.total_km_run) || 0;

  // 4. Sanitize Strings & Plate
  if (data.number_plate) {
    data.number_plate = data.number_plate.trim().toUpperCase().replace(/\s+/g, "");
  }
  if (data.bike_name) data.bike_name = data.bike_name.trim();
  if (data.model) data.model = data.model.trim();

  delete data.remaining_extra_images;

  return data;
};

/**
 * ADMIN / MANAGER: Create Bike
 */
const createBike = async (req, res) => {
  try {
    const bikeData = sanitizeBikeData(req.body);

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasArea =
        bikeData.area_id &&
        userAreaIds?.some((areaId) => areaId.toString() === bikeData.area_id.toString());
      if (!hasArea) {
        return res
          .status(403)
          .json({ message: "Access denied: You are not assigned to this area" });
      }
    }

    // Input bounds validation
    if (
      bikeData.price_per_hour < 0 ||
      bikeData.price_per_day < 0 ||
      bikeData.bike_expenses < 0
    ) {
      return res.status(400).json({ message: "Pricing and expenses cannot be negative" });
    }

    if (!bikeData.bike_name || !bikeData.model || !bikeData.number_plate) {
      return res.status(400).json({ message: "Bike name, model, and number plate are required" });
    }

    // Main image
    const image_url = req.files?.image_url ? req.files.image_url[0].path : null;

    // Extra images
    let extraImagePaths = [];
    if (req.files?.extra_images) {
      extraImagePaths = req.files.extra_images.map((file) => file.path);
    }

    bikeData.image_url = image_url;
    bikeData.extra_images = extraImagePaths;

    const bike = await Bike.create(bikeData);

    await logAudit({
      action: "CREATE_BIKE",
      severity: "info",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
      target_id: bike._id?.toString(),
      target_name: `${bike.bike_name} (${bike.number_plate})`,
      details: {
        model: bike.model,
        price_per_day: bike.price_per_day,
        price_per_hour: bike.price_per_hour,
        area_id: bike.area_id,
      },
    });

    res.status(201).json(bike);
  } catch (error) {
    console.error("Create Bike Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "A bike with this number plate already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Bikes (Dual-Mode: Smart Pagination + Public Catalog Caching)
 */
const getBikes = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    const currentUser = await resolveCurrentUser(req);
    const isPublic = !currentUser;

    // 1. Status Filter
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // 2. Area Filter
    if (req.query.area_id && req.query.area_id !== "all") {
      filter.area_id = req.query.area_id;
    }

    // 3. User Role Scoping
    if (currentUser) {
      const scope = getAreaScope(req);
      if (scope && scope.length > 0) {
        filter.area_id = { $in: scope };
      }
      if (currentUser.role === "investor") {
        const escapeRegex = (text) => (text ? text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");
        const nameRegex = new RegExp(`^${escapeRegex(currentUser.fullName)}$`, "i");
        const emailRegex = new RegExp(`^${escapeRegex(currentUser.email)}$`, "i");
        filter.$or = [
          { bike_owner: { $regex: nameRegex } },
          { bike_owner: { $regex: emailRegex } },
        ];
      }
    }

    // 4. Server-Side Search
    if (req.query.search && typeof req.query.search === "string" && req.query.search.trim().length > 0) {
      const searchRegex = new RegExp(
        req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      const searchConditions = [
        { bike_name: { $regex: searchRegex } },
        { model: { $regex: searchRegex } },
        { number_plate: { $regex: searchRegex } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // HTTP Conditional Caching for Public Viewers
    if (isPublic) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    }

    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

    // Dual-Mode Branch A: Smart Pagination for Admin Panel
    if (isPaginated) {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 25);
      const skip = (page - 1) * limit;

      // Fleet Status Breakdown Query (computed over scope without active status filter)
      const filterForStats = { ...filter };
      delete filterForStats.status;

      const [bikes, totalCount, statusCounts] = await Promise.all([
        Bike.find(filter)
          .select(isPublic ? SENSITIVE_PROJECTION : "")
          .populate("area_id", "name location")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Bike.countDocuments(filter),
        Bike.aggregate([
          { $match: filterForStats },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

      const stats = {
        total: 0,
        available: 0,
        booked: 0,
        maintenance: 0,
      };
      statusCounts.forEach((s) => {
        if (s._id && stats[s._id] !== undefined) {
          stats[s._id] = s.count;
          stats.total += s.count;
        }
      });

      return res.status(200).json({
        bikes,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentPage: page,
        stats,
      });
    }

    // Dual-Mode Branch B: Standard Array for Public Catalog / Legacy Consumers
    const bikes = await Bike.find(filter)
      .select(isPublic ? SENSITIVE_PROJECTION : "")
      .populate("area_id", "name location")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(bikes);
  } catch (error) {
    console.error("Get Bikes Error:", error);
    res.status(500).json({ message: "Server error fetching bikes" });
  }
};

/**
 * Update Bike
 */
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike || bike.is_deleted) return res.status(404).json({ message: "Bike not found" });

    // Area check for staff/manager
    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasOldArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasOldArea) {
        return res
          .status(403)
          .json({ message: "Access denied: You are not assigned to the bike's current area" });
      }
      if (req.body.area_id) {
        const hasNewArea = userAreaIds?.some(
          (areaId) => areaId.toString() === req.body.area_id.toString()
        );
        if (!hasNewArea) {
          return res
            .status(403)
            .json({ message: "Access denied: You cannot move the bike to an unassigned area" });
        }
      }
    }

    // Price modification authorization (Admin / Super Admin Only)
    const oldPriceDay = bike.price_per_day;
    const oldPriceHour = bike.price_per_hour;
    const isDayPriceChanged =
      req.body.price_per_day !== undefined && Number(req.body.price_per_day) !== oldPriceDay;
    const isHourPriceChanged =
      req.body.price_per_hour !== undefined && Number(req.body.price_per_hour) !== oldPriceHour;

    if (isDayPriceChanged || isHourPriceChanged) {
      if (req.user && req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied: Only Super Admins and Admins can modify rental pricing",
        });
      }
    }

    // Non-negative validation
    if (
      (req.body.price_per_day !== undefined && Number(req.body.price_per_day) < 0) ||
      (req.body.price_per_hour !== undefined && Number(req.body.price_per_hour) < 0) ||
      (req.body.bike_expenses !== undefined && Number(req.body.bike_expenses) < 0)
    ) {
      return res.status(400).json({ message: "Pricing and expenses cannot be negative" });
    }

    const updateData = sanitizeBikeData(req.body);

    // 1. Handle Main Profile Image
    if (req.files?.image_url) {
      updateData.image_url = req.files.image_url[0].path;
    }

    // 2. Handle Extra Images
    let finalExtraImages = [];
    if (req.body.remaining_extra_images) {
      try {
        finalExtraImages = JSON.parse(req.body.remaining_extra_images);
      } catch (e) {
        finalExtraImages = [];
      }
    } else {
      finalExtraImages = bike.extra_images || [];
    }

    if (req.files?.extra_images) {
      const newPaths = req.files.extra_images.map((f) => f.path);
      finalExtraImages = [...finalExtraImages, ...newPaths];
    }

    updateData.extra_images = finalExtraImages.slice(0, 5);

    // Audit price changes
    if (isDayPriceChanged || isHourPriceChanged) {
      await logAudit({
        action: "UPDATE_PRICE",
        severity: "info",
        performed_by: req.user?._id || req.user?.id,
        user_email: req.user?.email,
        ip_address: getClientIp(req),
        user_agent: req.headers["user-agent"] || "",
        target_id: bike._id?.toString(),
        target_name: `${bike.bike_name} (${bike.number_plate})`,
        details: {
          old_price_day: oldPriceDay,
          new_price_day: Number(req.body.price_per_day ?? oldPriceDay),
          old_price_hour: oldPriceHour,
          new_price_hour: Number(req.body.price_per_hour ?? oldPriceHour),
        },
      });
    }

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedBike);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A bike with this number plate already exists" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Backend Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Bike (Soft Delete)
 */
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike || bike.is_deleted) return res.status(404).json({ message: "Bike not found" });

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasArea) {
        return res
          .status(403)
          .json({ message: "Access denied: You are not assigned to the bike's area" });
      }
    }

    await Bike.findByIdAndUpdate(req.params.id, { is_deleted: true });

    await logAudit({
      action: "DELETE_BIKE",
      severity: "warning",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
      target_id: bike._id?.toString(),
      target_name: `${bike.bike_name} (${bike.number_plate})`,
      details: {
        model: bike.model,
        area_id: bike.area_id,
        soft_deleted: true,
      },
    });

    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Single Bike
 */
const getSingleBike = async (req, res) => {
  try {
    const bike = await Bike.findOne({ _id: req.params.id, is_deleted: { $ne: true } }).populate(
      "area_id",
      "name location"
    );

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const currentUser = await resolveCurrentUser(req);
    const isPublic = !currentUser;

    if (currentUser && (currentUser.role === "staff" || currentUser.role === "manager")) {
      const userAreaIds = getUserAreaIds(currentUser);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === (bike.area_id?._id || bike.area_id)?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area" });
      }
    }

    // Mask sensitive fields if public request
    if (isPublic) {
      const sanitized = bike.toObject();
      delete sanitized.bike_owner;
      delete sanitized.fine_owner;
      delete sanitized.bike_expenses;
      delete sanitized.gps_installed_date;
      delete sanitized.last_service_date;
      delete sanitized.last_battery_changed;
      delete sanitized.last_tyre_change;
      return res.json(sanitized);
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
