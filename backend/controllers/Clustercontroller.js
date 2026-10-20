const Cluster = require("../models/Cluster");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getUserAreaIds, getAreaScope } = require("../middleware/auth");
const { logAudit, getClientIp } = require("../utils/auditLogger");

// CREATE cluster
exports.createCluster = async (req, res) => {
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

    const cluster = await Cluster.create(req.body);
    res.status(201).json(cluster);
  } catch (error) {
    console.error("Create Cluster Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL clusters
exports.getClusters = async (req, res) => {
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
    }

    const clusters = await Cluster.find(filter)
      .populate("bikes")
      .populate("area_id", "name city")
      .sort({ createdAt: -1 });
    res.json(clusters);
  } catch (error) {
    console.error("Get Clusters Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE cluster by ID
exports.getClusterById = async (req, res) => {
  try {
    const cluster = await Cluster.findById(req.params.id)
      .populate("bikes")
      .populate("area_id", "name city");
    if (!cluster) {
      return res.status(404).json({ message: "Cluster not found" });
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
        (areaId) => areaId.toString() === cluster.area_id?._id?.toString() || areaId.toString() === cluster.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You do not have access to this cluster's area" });
      }
    }

    res.json(cluster);
  } catch (error) {
    console.error("Get Cluster Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE cluster
exports.updateCluster = async (req, res) => {
  try {
    const cluster = await Cluster.findById(req.params.id);
    if (!cluster) {
      return res.status(404).json({ message: "Cluster not found" });
    }

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasOldArea = userAreaIds?.some(
        (areaId) => areaId.toString() === cluster.area_id?.toString()
      );
      if (!hasOldArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the cluster's current area" });
      }

      if (req.body.area_id) {
        const hasNewArea = userAreaIds?.some(
          (areaId) => areaId.toString() === req.body.area_id.toString()
        );
        if (!hasNewArea) {
          return res.status(403).json({ message: "Access denied: You cannot move the cluster to an unassigned area" });
        }
      }
    }

    const updatedCluster = await Cluster.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedCluster);
  } catch (error) {
    console.error("Update Cluster Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE cluster
exports.deleteCluster = async (req, res) => {
  try {
    const cluster = await Cluster.findById(req.params.id);
    if (!cluster) {
      return res.status(404).json({ message: "Cluster not found" });
    }

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasArea = userAreaIds?.some(
        (areaId) => areaId.toString() === cluster.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the cluster's area" });
      }
    }

    // Soft delete: mark as deleted to preserve historical data
    await Cluster.findByIdAndUpdate(req.params.id, { is_deleted: true });

    await logAudit({
      action: "DELETE_CLUSTER",
      severity: "warning",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
      target_id: cluster._id?.toString(),
      target_name: cluster.name,
      details: { area_id: cluster.area_id, soft_deleted: true },
    });

    res.json({ message: "Cluster deleted successfully" });
  } catch (error) {
    console.error("Delete Cluster Error:", error);
    res.status(500).json({ message: error.message });
  }
};