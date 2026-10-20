const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { logAudit, getClientIp } = require("../utils/auditLogger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to create JWT with role and areaId
const generateToken = (userOrId) => {
  if (userOrId && typeof userOrId === "object") {
    const primaryArea = userOrId.areaId || (userOrId.assigned_areas && userOrId.assigned_areas[0]);
    const areaIdStr = primaryArea?._id ? primaryArea._id.toString() : primaryArea ? primaryArea.toString() : null;
    return jwt.sign(
      {
        id: userOrId._id || userOrId.id,
        role: userOrId.role,
        areaId: areaIdStr,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  }
  return jwt.sign({ id: userOrId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id)
      .populate("assigned_areas")
      .populate("areaId")
      .select("-password")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login with 5-attempt lockout defense)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check failed attempts from this IP or email in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedCount = await AuditLog.countDocuments({
      $or: [{ ip_address: ip }, { user_email: cleanEmail }],
      action: "FAILED_LOGIN_ATTEMPT",
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (failedCount >= 5) {
      await logAudit({
        action: "LOGIN_LOCKOUT_TRIGGERED",
        severity: "critical",
        user_email: cleanEmail,
        ip_address: ip,
        user_agent: userAgent,
        details: {
          failedAttempts: failedCount,
          reason: "Account locked: 5 consecutive failed login attempts within 15 minutes.",
        },
      });

      return res.status(429).json({
        message:
          "Account temporarily locked due to 5 consecutive failed attempts. Please try again after 15 minutes.",
      });
    }

    const user = await User.findOne({ email: cleanEmail })
      .populate("assigned_areas")
      .populate("areaId");

    if (!user) {
      await logAudit({
        action: "FAILED_LOGIN_ATTEMPT",
        severity: "warning",
        user_email: cleanEmail,
        ip_address: ip,
        user_agent: userAgent,
        details: { reason: "User does not exist", attemptNumber: failedCount + 1 },
      });

      if (failedCount + 1 >= 5) {
        await logAudit({
          action: "LOGIN_LOCKOUT_TRIGGERED",
          severity: "critical",
          user_email: cleanEmail,
          ip_address: ip,
          user_agent: userAgent,
          details: { thresholdReached: true },
        });
        return res.status(429).json({
          message:
            "Account temporarily locked due to 5 consecutive failed attempts. Please try again after 15 minutes.",
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Please contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAudit({
        action: "FAILED_LOGIN_ATTEMPT",
        severity: "warning",
        performed_by: user._id,
        user_email: user.email,
        ip_address: ip,
        user_agent: userAgent,
        details: { reason: "Incorrect password", attemptNumber: failedCount + 1 },
      });

      if (failedCount + 1 >= 5) {
        await logAudit({
          action: "LOGIN_LOCKOUT_TRIGGERED",
          severity: "critical",
          performed_by: user._id,
          user_email: user.email,
          ip_address: ip,
          user_agent: userAgent,
          details: { thresholdReached: true },
        });
        return res.status(429).json({
          message:
            "Account temporarily locked due to 5 consecutive failed attempts. Please try again after 15 minutes.",
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success: Log LOGIN_SUCCESS
    await logAudit({
      action: "LOGIN_SUCCESS",
      severity: "info",
      performed_by: user._id,
      user_email: user.email,
      ip_address: ip,
      user_agent: userAgent,
      details: { role: user.role },
    });

    const primaryArea = user.areaId || (user.assigned_areas && user.assigned_areas[0]);
    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        areaId: primaryArea ? (primaryArea._id || primaryArea) : null,
        assigned_areas: user.assigned_areas || [],
        status: user.status || "active",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Staff / Investor Creation)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, areaId, assigned_areas, status } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Role Escalation Defense:
    // Only authenticated Super Admin / Admin can assign privileged roles (admin, super_admin, manager)
    let assignedRole = role || "staff";
    const creatorRole = req.user?.role;
    const isSuperOrAdmin = creatorRole === "super_admin" || creatorRole === "admin";

    if (assignedRole === "super_admin" || assignedRole === "admin") {
      if (!isSuperOrAdmin) {
        return res.status(403).json({ message: "Access denied: Cannot assign admin roles." });
      }
    }

    // If manager is creating, they can strictly only create "staff"
    if (creatorRole === "manager" && assignedRole !== "staff") {
      assignedRole = "staff";
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const areas = assigned_areas || (areaId ? [areaId] : []);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: assignedRole,
      areaId: areaId || (areas[0] || null),
      assigned_areas: areas,
      status: status || "active",
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Area Manager (Super Admin)
exports.createManager = async (req, res) => {
  try {
    const { fullName, email, password, areaId, status } = req.body;

    if (!fullName || !email || !password || !areaId) {
      return res.status(400).json({ message: "Full name, email, password, and assigned area are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "manager",
      areaId: areaId,
      assigned_areas: [areaId],
      status: status || "active",
    });

    const populatedManager = await User.findById(manager._id)
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password");

    res.status(201).json({ message: "Area Manager created successfully", manager: populatedManager });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Area Managers (Super Admin)
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Area Manager (Super Admin)
exports.updateManager = async (req, res) => {
  try {
    const { fullName, email, password, areaId, status } = req.body;
    const manager = await User.findById(req.params.id);

    if (!manager || manager.role !== "manager") {
      return res.status(404).json({ message: "Area Manager not found" });
    }

    if (email && email !== manager.email) {
      const existing = await User.findOne({ email, _id: { $ne: manager._id } });
      if (existing) {
        return res.status(400).json({ message: "A user with this email already exists." });
      }
      manager.email = email;
    }

    if (fullName) manager.fullName = fullName;
    if (status) manager.status = status;
    if (areaId) {
      manager.areaId = areaId;
      manager.assigned_areas = [areaId];
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      manager.password = await bcrypt.hash(password, salt);
    }

    await manager.save();

    const updatedManager = await User.findById(manager._id)
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password");

    res.json({ message: "Area Manager updated successfully", manager: updatedManager });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Area Manager (Super Admin)
exports.deleteManager = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);
    if (!manager || manager.role !== "manager") {
      return res.status(404).json({ message: "Area Manager not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Area Manager deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Investors (Super Admin)
exports.getInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: "investor" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Investor (Super Admin)
exports.updateInvestor = async (req, res) => {
  try {
    const { fullName, email, password, status } = req.body;
    const investor = await User.findById(req.params.id);

    if (!investor || investor.role !== "investor") {
      return res.status(404).json({ message: "Investor not found" });
    }

    if (email && email !== investor.email) {
      const existing = await User.findOne({ email, _id: { $ne: investor._id } });
      if (existing) {
        return res.status(400).json({ message: "A user with this email already exists." });
      }
      investor.email = email;
    }

    if (fullName) investor.fullName = fullName;
    if (status) investor.status = status;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      investor.password = await bcrypt.hash(password, salt);
    }

    await investor.save();
    const updated = await User.findById(investor._id).select("-password");
    res.json({ message: "Investor updated successfully", investor: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Investor (Super Admin)
exports.deleteInvestor = async (req, res) => {
  try {
    const investor = await User.findById(req.params.id);
    if (!investor || investor.role !== "investor") {
      return res.status(404).json({ message: "Investor not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Investor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff (Settings Page / Area Manager Team View)
exports.getStaff = async (req, res) => {
  try {
    let query = { role: "staff" };

    // If Area Manager, only show staff belonging to manager's assigned area
    if (req.user && req.user.role === "manager") {
      const managerAreaId = req.user.areaId?._id || req.user.areaId || (req.user.assigned_areas && req.user.assigned_areas[0]);
      if (managerAreaId) {
        query.$or = [
          { areaId: managerAreaId },
          { assigned_areas: managerAreaId }
        ];
      }
    } else if (req.user && req.user.role === "staff") {
      return res.status(403).json({ message: "Access denied: Staff cannot manage or view team settings" });
    }

    const staff = await User.find(query)
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Area Manager check
    if (req.user && req.user.role === "manager") {
      const managerAreaId = (req.user.areaId?._id || req.user.areaId || req.user.assigned_areas?.[0])?.toString();
      const staffAreaId = (user.areaId?._id || user.areaId || user.assigned_areas?.[0])?.toString();
      if (managerAreaId !== staffAreaId) {
        return res.status(403).json({ message: "Access denied: Cannot delete staff from another area" });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff member's assigned areas
exports.updateStaffAreas = async (req, res) => {
  try {
    const { assigned_areas, areaId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const areas = assigned_areas || (areaId ? [areaId] : []);
    user.assigned_areas = areas;
    user.areaId = areaId || areas[0] || null;

    await user.save();
    const updatedUser = await User.findById(req.params.id)
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password");

    res.json({ message: "Staff areas updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Staff Member (Super Admin / Admin / Manager)
exports.updateStaff = async (req, res) => {
  try {
    const { fullName, email, password, areaId, assigned_areas, status, role } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Area Manager authorization check
    if (req.user && req.user.role === "manager") {
      const managerAreaId = (req.user.areaId?._id || req.user.areaId || req.user.assigned_areas?.[0])?.toString();
      const staffAreaId = (staff.areaId?._id || staff.areaId || staff.assigned_areas?.[0])?.toString();
      if (managerAreaId !== staffAreaId) {
        return res.status(403).json({ message: "Access denied: Cannot edit staff from another area" });
      }
    }

    if (email && email !== staff.email) {
      const existing = await User.findOne({ email, _id: { $ne: staff._id } });
      if (existing) {
        return res.status(400).json({ message: "A user with this email already exists." });
      }
      staff.email = email;
    }

    if (fullName) staff.fullName = fullName;
    if (status) staff.status = status;
    if (role && (req.user.role === "super_admin" || req.user.role === "admin")) {
      staff.role = role;
    }

    if (areaId || assigned_areas) {
      const areas = assigned_areas || (areaId ? [areaId] : []);
      staff.assigned_areas = areas;
      staff.areaId = areaId || areas[0] || null;
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
    }

    await staff.save();

    const updatedStaff = await User.findById(staff._id)
      .populate("areaId", "name city")
      .populate("assigned_areas", "name city")
      .select("-password");

    res.json({ message: "Staff updated successfully", staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};