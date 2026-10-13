const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to create JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc    Get current user profile
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate("assigned_areas")
      .populate("areaId");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Please contact administrator." });
    }

    if (await bcrypt.compare(password, user.password)) {
      const primaryArea = user.areaId || (user.assigned_areas && user.assigned_areas[0]);
      res.json({
        token: generateToken(user._id),
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
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Signup)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, areaId, assigned_areas, status } = req.body;

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
      role: role || "staff",
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