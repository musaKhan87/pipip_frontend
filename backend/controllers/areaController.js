const Area = require("../models/Area");
const { logAudit, getClientIp } = require("../utils/auditLogger");

// PUBLIC
const getActiveAreas = async (req, res) => {
  try {
    const areas = await Area.find({ is_active: true, is_deleted: { $ne: true } });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch areas" });
  }
};

// ADMIN
const createArea = async (req, res) => {
  try {
    const area = await Area.create(req.body);
    res.status(201).json(area);
  } catch (error) {
    res.status(400).json({ message: "Area creation failed" });
  }
};

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

const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ is_deleted: { $ne: true } });
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
  getAreas
};
