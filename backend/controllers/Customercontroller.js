const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Bike = require("../models/Bike");
const Cluster = require("../models/Cluster");
const User = require("../models/User");
const { getAreaScope, getUserAreaIds } = require("../middleware/auth");

exports.createCustomer = async (req, res) => {
  try {
    const aadhaarImage = req.files?.aadhaar_image?.[0]?.path || null;
    const licenseImage = req.files?.license_image?.[0]?.path || null;

    // Handle the 5 extra documents
    let extraDocs = [];
    if (req.files?.extra_documents) {
      extraDocs = req.files.extra_documents.map(file => file.path);
    }

    let area_id = req.body.area_id || null;
    // If user is manager or staff, default area_id to their assigned area if not provided
    if (!area_id && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id).populate("assigned_areas").populate("areaId");
        if (currentUser && (currentUser.role === "manager" || currentUser.role === "staff")) {
          area_id = currentUser.areaId?._id || currentUser.areaId || currentUser.assigned_areas?.[0]?._id || currentUser.assigned_areas?.[0] || null;
        }
      } catch (e) {}
    }

    const customer = await Customer.create({
      ...req.body,
      area_id: area_id || undefined,
      aadhaar_image_url: aadhaarImage,
      license_image_url: licenseImage,
      extra_documents: extraDocs // Store the array of paths
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : "";

    let currentUser = req.user;
    if (!currentUser && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).populate("assigned_areas").populate("areaId");
        req.user = currentUser;
      } catch (err) {}
    }

    const andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });
    }

    const scope = currentUser ? getAreaScope(req) : null;
    if (scope && scope.length > 0) {
      // Find bikes and clusters in scope
      const areaBikes = await Bike.find({ area_id: { $in: scope } }).select("_id").lean();
      const bikeIds = areaBikes.map((b) => b._id);
      const areaClusters = await Cluster.find({ area_id: { $in: scope } }).select("_id").lean();
      const clusterIds = areaClusters.map((c) => c._id);

      // Find all bookings with those bikes or clusters
      const bookings = await Booking.find({
        $or: [
          { bike_id: { $in: bikeIds } },
          { cluster_id: { $in: clusterIds } },
        ],
      }).select("customer_id").lean();

      const bookingCustomerIds = [
        ...new Set(bookings.map((b) => b.customer_id?.toString()).filter(Boolean)),
      ];

      const areaOrConditions = [];
      if (bookingCustomerIds.length > 0) {
        areaOrConditions.push({ _id: { $in: bookingCustomerIds } });
      }
      areaOrConditions.push({ area_id: { $in: scope } });

      andConditions.push({ $or: areaOrConditions });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* ================= UPDATE CUSTOMER ================= */
// exports.updateCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     res.json(customer);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// exports.updateCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);
//     if (!customer) return res.status(404).json({ message: "Not found" });

//     const updateData = { ...req.body };

//     // 1. Handle Single Uploads (Aadhaar/License)
//     if (req.files?.aadhaar_image) {
//       updateData.aadhaar_image_url = req.files.aadhaar_image[0].path;
//     }
//     if (req.files?.license_image) {
//       updateData.license_image_url = req.files.license_image[0].path;
//     }

//     // 2. Handle Extra Documents Syncing
//     let finalDocs = [];
//     if (req.body.remaining_documents) {
//       finalDocs = JSON.parse(req.body.remaining_documents);
//     } else {
//       finalDocs = customer.extra_documents || [];
//     }

//     if (req.files?.extra_documents) {
//       const newPaths = req.files.extra_documents.map(f => f.path);
//       finalDocs = [...finalDocs, ...newPaths];
//     }

//     updateData.extra_documents = finalDocs.slice(0, 5);

//     const updatedCustomer = await Customer.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true }
//     );

//     res.json(updatedCustomer);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const updateData = { ...req.body };

    // Handle File Updates
    if (req.files?.aadhaar_image) {
      updateData.aadhaar_image_url = req.files.aadhaar_image[0].path;
    }
    if (req.files?.license_image) {
      updateData.license_image_url = req.files.license_image[0].path;
    }

    // Sync Extra Documents
    let finalDocs = [];
    if (req.body.remaining_documents) {
      finalDocs = JSON.parse(req.body.remaining_documents);
    } else {
      finalDocs = customer.extra_documents || [];
    }

    if (req.files?.extra_documents) {
      const newPaths = req.files.extra_documents.map((f) => f.path);
      finalDocs = [...finalDocs, ...newPaths];
    }
    updateData.extra_documents = finalDocs.slice(0, 5);

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    );
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* ================= DELETE CUSTOMER ================= */
exports.deleteCustomer = async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({
      customer_id: req.params.id,
    });

    if (bookingCount > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing bookings",
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CUSTOMER BOOKING HISTORY ================= */
exports.getCustomerBookings = async (req, res) => {
  try {
    let currentUser = req.user;
    if (!currentUser && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).populate("assigned_areas").populate("areaId");
        req.user = currentUser;
      } catch (err) {}
    }

    const filter = { customer_id: req.params.id };
    const scope = currentUser ? getAreaScope(req) : null;
    if (scope && scope.length > 0) {
      const areaBikes = await Bike.find({ area_id: { $in: scope } }).select("_id").lean();
      const bikeIds = areaBikes.map((b) => b._id);
      const areaClusters = await Cluster.find({ area_id: { $in: scope } }).select("_id").lean();
      const clusterIds = areaClusters.map((c) => c._id);
      filter.$or = [
        { bike_id: { $in: bikeIds } },
        { cluster_id: { $in: clusterIds } },
      ];
    }

    const bookings = await Booking.find(filter)
      .populate("bike_id")
      .populate("cluster_id")
      .sort({ start_datetime: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};