const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id)
        .populate("assigned_areas")
        .populate("areaId")
        .select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check user status
      if (req.user.status === "inactive") {
        return res.status(403).json({ message: "Account is inactive. Please contact administrator." });
      }

      // Convenience getter for single assigned area ID
      const areaRef = req.user.areaId || (req.user.assigned_areas && req.user.assigned_areas[0]);
      req.userAreaId = areaRef?._id ? areaRef._id.toString() : areaRef ? areaRef.toString() : null;

      next();
      return;
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "No token found" });
};

const superAdminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "super_admin" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Super Admins only" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "super_admin" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userRole = req.user.role;
    // Treat super_admin and admin interchangeably
    const isAllowed = roles.some((role) => {
      if (role === "super_admin" || role === "admin") {
        return userRole === "super_admin" || userRole === "admin";
      }
      return userRole === role;
    });

    if (isAllowed) {
      next();
    } else {
      res.status(403).json({ message: `Access denied: ${userRole} is not authorized for this resource` });
    }
  };
};

// Helper function to extract assigned area ObjectIds array for non-superadmin users
const getUserAreaIds = (user) => {
  if (!user) return [];
  if (user.role === "super_admin" || user.role === "admin") {
    return null; // Null means no area filtering (all areas)
  }

  const ids = [];
  if (user.areaId) {
    ids.push(user.areaId._id || user.areaId);
  }
  if (user.assigned_areas && user.assigned_areas.length > 0) {
    user.assigned_areas.forEach((area) => {
      const areaId = area._id || area;
      if (!ids.some((id) => id.toString() === areaId.toString())) {
        ids.push(areaId);
      }
    });
  }
  return ids;
};

/**
 * Unified Area Resolution Mechanism
 * - Super Admin / Admin: Returns requested areaId (from header x-area-id or query areaId) as array, or null if 'all' / unselected.
 * - Manager / Staff: Returns ONLY their assigned area IDs array, ignoring any request overrides.
 */
const getAreaScope = (req) => {
  if (!req || !req.user) return [];

  const user = req.user;
  const isSuper = user.role === "super_admin" || user.role === "admin";

  if (isSuper) {
    const requestedArea = req.headers?.["x-area-id"] || req.query?.areaId;
    if (
      requestedArea &&
      requestedArea !== "all" &&
      requestedArea !== "undefined" &&
      requestedArea !== "null"
    ) {
      return [requestedArea.toString()];
    }
    return null; // Null means All Areas (no restriction)
  }

  // Non-superadmin (Manager / Staff): Strictly enforce assigned area(s)
  const ids = [];
  if (user.areaId) {
    const aId = user.areaId._id ? user.areaId._id.toString() : user.areaId.toString();
    ids.push(aId);
  }
  if (user.assigned_areas && user.assigned_areas.length > 0) {
    user.assigned_areas.forEach((area) => {
      const aId = area._id ? area._id.toString() : area.toString();
      if (!ids.includes(aId)) {
        ids.push(aId);
      }
    });
  }
  return ids;
};

module.exports = {
  protect,
  adminOnly,
  superAdminOnly,
  authorizeRoles,
  getUserAreaIds,
  getAreaScope,
};