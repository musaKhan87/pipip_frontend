const Expense = require("../models/Expense");
const User = require("../models/User");
const { getUserAreaIds } = require("../middleware/auth");

// CREATE a new expense
exports.createExpense = async (req, res) => {
  try {
    const {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount,
      approver_name,
      remarks,
      area_id,
    } = req.body;

    // Handle uploaded files
    let invoiceProofs = [];
    if (req.files?.invoice_proof) {
      invoiceProofs = req.files.invoice_proof.map((file) => file.path);
    }

    const paymentProof = req.files?.payment_proof?.[0]?.path || null;

    const userAreaIds = getUserAreaIds(req.user);
    const assignedAreaId = area_id || (userAreaIds && userAreaIds[0]) || null;

    const expense = await Expense.create({
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount: Number(expense_amount),
      approver_name,
      remarks,
      invoice_proofs: invoiceProofs,
      payment_proof: paymentProof,
      created_by: req.user._id,
      area_id: assignedAreaId,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all expenses (with search/filters & role-based visibility)
exports.getExpenses = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Role-based visibility: Super Admin sees all; Area Manager and Staff see area expenses
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      const userAreaIds = getUserAreaIds(req.user);

      const areaUsers = await User.find({
        $or: [
          { areaId: { $in: userAreaIds } },
          { assigned_areas: { $in: userAreaIds } }
        ]
      }).select("_id").lean();

      const userIdsInArea = areaUsers.map((u) => u._id);

      query.$or = [
        { area_id: { $in: userAreaIds } },
        { created_by: { $in: [...userIdsInArea, req.user._id] } }
      ];
    }

    if (search) {
      const searchConditions = [
        { expense_name: { $regex: search, $options: "i" } },
        { expense_category: { $regex: search, $options: "i" } },
        { expense_done_by: { $regex: search, $options: "i" } },
        { vendor_receiver_name: { $regex: search, $options: "i" } },
        { approver_name: { $regex: search, $options: "i" } },
      ];

      // 1. Try parsing full standard date (YYYY-MM-DD)
      const parsedDate = Date.parse(search);
      if (!isNaN(parsedDate) && search.includes("-")) {
        const searchDate = new Date(parsedDate);
        const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59, 999);
        
        searchConditions.push({
          expense_date: { $gte: startOfDay, $lte: endOfDay }
        });
      }

      // 2. Handle searching a simple number (like "12") to match day, month, or year
      const num = parseInt(search, 10);
      if (!isNaN(num)) {
        searchConditions.push(
          { $expr: { $eq: [{ $dayOfMonth: "$expense_date" }, num] } },
          { $expr: { $eq: [{ $month: "$expense_date" }, num] } },
          { $expr: { $eq: [{ $year: "$expense_date" }, num] } }
        );
      }

      // 3. Handle month name matches (like "July", "Jul", "dec")
      const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const monthIndex = monthNames.findIndex((m) => m.startsWith(search.toLowerCase()));
      if (monthIndex !== -1) {
        searchConditions.push({
          $expr: { $eq: [{ $month: "$expense_date" }, monthIndex + 1] }
        });
      }

      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { $or: searchConditions }
          ]
        };
      } else {
        query.$or = searchConditions;
      }
    }

    const expenses = await Expense.find(query)
      .populate("created_by", "fullName email")
      .populate("area_id", "name city")
      .sort({ expense_date: -1 }).lean();

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single expense detail
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("created_by", "fullName email")
      .populate("area_id", "name city");

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      const userAreaIds = getUserAreaIds(req.user);
      const isCreator = expense.created_by._id.toString() === req.user._id.toString();
      const isSameArea = userAreaIds.some((aId) => aId.toString() === expense.area_id?._id?.toString() || aId.toString() === expense.area_id?.toString());
      if (!isCreator && !isSameArea) {
        return res.status(403).json({ message: "Access denied to this expense record" });
      }
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE an existing expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      const userAreaIds = getUserAreaIds(req.user);
      const isCreator = expense.created_by.toString() === req.user._id.toString();
      const isSameArea = userAreaIds.some((aId) => aId.toString() === expense.area_id?.toString());
      if (!isCreator && !isSameArea) {
        return res.status(403).json({ message: "Access denied to edit this expense record" });
      }
    }

    const {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount,
      approver_name,
      remarks,
      remaining_invoices, // existing invoice URLs that user kept
    } = req.body;

    const updateData = {
      expense_date,
      expense_name,
      expense_category,
      expense_done_by,
      vendor_receiver_name,
      expense_amount: Number(expense_amount),
      approver_name,
      remarks,
    };

    // 1. Process invoice proofs
    let finalInvoices = [];
    if (remaining_invoices) {
      try {
        finalInvoices = JSON.parse(remaining_invoices);
      } catch (e) {
        // Fallback if not stringified JSON
        finalInvoices = Array.isArray(remaining_invoices) ? remaining_invoices : [remaining_invoices];
      }
    } else {
      finalInvoices = expense.invoice_proofs || [];
    }

    if (req.files?.invoice_proof) {
      const newInvoicePaths = req.files.invoice_proof.map((file) => file.path);
      finalInvoices = [...finalInvoices, ...newInvoicePaths];
    }
    updateData.invoice_proofs = finalInvoices.slice(0, 5);

    // 2. Process payment proof
    if (req.files?.payment_proof) {
      updateData.payment_proof = req.files.payment_proof[0].path;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate("created_by", "fullName email");

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};