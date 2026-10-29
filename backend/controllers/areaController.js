const Area = require("../models/Area");
const { logAudit, getClientIp } = require("../utils/auditLogger");

// PUBLIC: Only return the exact 3 fields needed for customer dropdowns (_id, name, city)
const getActiveAreas = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");

    const areas = await Area.find({ is_active: true, is_deleted: { $ne: true } })
      .select("_id name city") // 👈 Whitelist: ONLY returns _id, name, and city
      .sort({ name: 1 })
      .lean();

    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch areas" });
  }
};

// ADMIN: Create Area
const createArea = async (req, res) => {
  try {
    const area = await Area.create(req.body);
    res.status(201).json(area);
  } catch (error) {
    res.status(400).json({ message: "Area creation failed" });
  }
};

// ADMIN: Update Area
const updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(area);
  } catch (error) {
    res.status(400).json({ message: "Area update failed" });
  }
};

// ADMIN: Soft Delete Area
const deleteArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    // Soft delete: mark as deleted and inactive to prevent data loss
    await Area.findByIdAndUpdate(req.params.id, { is_deleted: true, is_active: false });

    await logAudit({
      action: "DELETE_AREA",
      severity: "warning",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
      target_id: req.params.id,
      target_name: area ? `${area.name} (${area.city})` : "Area",
      details: { soft_deleted: true },
    });

    res.json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Area delete failed" });
  }
};

// ADMIN / STAFF / MANAGER: Get all areas including internal flags
const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ is_deleted: { $ne: true } })
      .sort({ name: 1 })
      .lean();
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch areas" });
  }
};

module.exports = {
  getActiveAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreas,
};
