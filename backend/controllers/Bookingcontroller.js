// controllers/booking.controller.js
// const Booking = require("../models/Booking");
// const Customer = require("../models/Customer");
// const Bike = require("../models/Bike");
// exports.createBooking = async (req, res) => {
//   const booking = await Booking.create(req.body);
//   res.status(201).json(booking);
// };


// exports.createBooking = async (req, res) => {
//     console.log("Booking", req.body)
//   try {
//     const {
//       bike_id,
//       start_datetime,
//       end_datetime,
//       is_new_customer,
//       customer_id,
//       customer_name,
//       customer_phone,
//       customer_email,
//       notes,
//     } = req.body;

//     // 1️⃣ Validate dates
//     if (new Date(end_datetime) <= new Date(start_datetime)) {
//       return res.status(400).json({ message: "End date must be after start date" });
//     }

//     // 2️⃣ Resolve customer
//     let finalCustomerId = customer_id;

//     if (is_new_customer === true || is_new_customer === "true") {
//       if (!customer_name || !customer_phone) {
//         return res.status(400).json({ message: "Customer details required" });
//       }

//       const customer = await Customer.create({
//         name: customer_name,
//         phone: customer_phone,
//         email: customer_email || null,
//       });

//       finalCustomerId = customer._id;
//     }

//     if (!finalCustomerId) {
//       return res.status(400).json({ message: "Customer ID missing" });
//     }

//     // 3️⃣ Get bike & calculate amount
//     const bike = await Bike.findById(bike_id);
//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     const hours =
//       (new Date(end_datetime) - new Date(start_datetime)) / (1000 * 60 * 60);

//     const total_amount = Math.ceil(hours) * bike.price_per_hour;

//     // 4️⃣ Create booking
//     const booking = await Booking.create({
//       customer_id: finalCustomerId,
//       bike_id,
//       start_datetime,
//       end_datetime,
//       total_amount,
//       notes,
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error("BOOKING ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };





// /**
//  * GET ALL BOOKINGS (ADMIN)
//  */
// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("customer_id", "name phone email")
//       .populate("bike_id", "model number_plate")
//       .sort({ createdAt: -1 });

//     const formatted = bookings.map((b) => ({
//       ...b.toObject(),
//       customers: b.customer_id,
//       bikes: b.bike_id,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * GET SINGLE BOOKING
//  */
// exports.getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id)
//       .populate("customer_id", "name phone email")
//       .populate("bike_id", "model number_plate");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json({
//       ...booking.toObject(),
//       customers: booking.customer_id,
//       bikes: booking.bike_id,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * UPDATE BOOKING (ADMIN CAN EDIT DETAILS)
//  */
// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const { start_datetime, end_datetime, total_amount, notes } = req.body;

//     if (start_datetime !== undefined) booking.start_datetime = start_datetime;

//     if (end_datetime !== undefined) booking.end_datetime = end_datetime;

//     if (total_amount !== undefined) booking.total_amount = total_amount;

//     if (notes !== undefined) booking.notes = notes;

//     booking.updated_by_admin = true;

//     await booking.save();

//     res.json({
//       message: "Booking updated successfully",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * UPDATE BOOKING STATUS (FAST ADMIN ACTION)
//  */
// exports.updateBookingStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const allowedStatus = [
//       "pending",
//       "confirmed",
//       "active",
//       "completed",
//       "cancelled",
//     ];

//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { status, updated_by_admin: true },
//       { new: true },
//     );

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json({
//       message: "Booking status updated",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * DELETE / CANCEL BOOKING
//  */
// exports.deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     await booking.deleteOne();

//     res.json({ message: "Booking deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/booking.controller.js
const Bike = require("../models/Bike");
const Booking = require("../models/Booking");
const Cluster = require("../models/Cluster");
const Customer = require("../models/Customer");
const { sendOrderAlerts } = require("./notificationController");
const { getUserAreaIds, getAreaScope } = require("../middleware/auth");
const { logAudit, getClientIp } = require("../utils/auditLogger");

// Helper to check if a booking belongs to a staff/manager's assigned areas
const checkBookingAreaAccess = async (booking, user) => {
  if (!user || user.role === "super_admin" || user.role === "admin") return true;
  if (user.role !== "staff" && user.role !== "manager") return true;

  const userAreaIds = getUserAreaIds(user);
  if (!userAreaIds || userAreaIds.length === 0) return false;

  let areaId = null;
  if (booking.bike_id) {
    const bike = await Bike.findById(booking.bike_id);
    if (bike) areaId = bike.area_id;
  } else if (booking.cluster_id) {
    const cluster = await Cluster.findById(booking.cluster_id);
    if (cluster) areaId = cluster.area_id;
  }
  if (!areaId) return false;
  return userAreaIds.some(
    (assignedAreaId) => assignedAreaId.toString() === areaId.toString()
  );
};

/**
 * Helper to compute exact rental amount strictly server-side from vehicle rates & duration
 */
const calculateServerRentalAmount = (item, startDatetime, endDatetime) => {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const totalHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));

  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let rentalPrice = 0;
  const hourlyRate = Number(item.price_per_hour || 0);
  const dailyRate = Number(item.price_per_day || 0);

  if (days === 0) {
    if (totalHours < 3) {
      rentalPrice = 3 * hourlyRate;
    } else if (totalHours <= 5) {
      rentalPrice = totalHours * hourlyRate;
    } else {
      rentalPrice = dailyRate;
    }
  } else {
    rentalPrice = days * dailyRate;
    if (remainingHours > 0) {
      if (remainingHours >= 6) {
        rentalPrice += dailyRate;
      } else {
        rentalPrice += Math.min(remainingHours * hourlyRate, dailyRate);
      }
    }
  }

  return rentalPrice;
};

exports.createBooking = async (req, res) => {
  try {
    const {
      customer_id,
      bike_id,
      cluster_id,
      start_datetime,
      end_datetime,
      notes,
      deposit_amount,
      payment_order_id,
      vehicle_make_model,
    } = req.body;

    // 1. Mandatory Input Validation
    if (!customer_id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }
    if (!start_datetime || !end_datetime) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }
    const start = new Date(start_datetime);
    const end = new Date(end_datetime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: "Invalid duration: End time must be after start time" });
    }
    if (!bike_id && !cluster_id) {
      return res.status(400).json({ message: "Bike ID or Cluster ID is required" });
    }

    // 2. Fetch authoritative vehicle record from DB (never trust client rates or vehicle info)
    let targetVehicle = null;
    let vehicleName = vehicle_make_model || "Vehicle";
    let numberPlate = null;

    if (bike_id) {
      targetVehicle = await Bike.findOne({ _id: bike_id, is_deleted: { $ne: true } });
      if (!targetVehicle) {
        return res.status(404).json({ message: "Selected bike not found or unavailable" });
      }
      vehicleName = `${targetVehicle.bike_name || targetVehicle.model} (${targetVehicle.number_plate})`;
      numberPlate = targetVehicle.number_plate;
    } else if (cluster_id) {
      targetVehicle = await Cluster.findOne({ _id: cluster_id, is_deleted: { $ne: true } });
      if (!targetVehicle) {
        return res.status(404).json({ message: "Selected cluster not found or unavailable" });
      }
      vehicleName = `Cluster: ${targetVehicle.name}`;
    }

    // 3. Strict Server-Side Calculation of total_amount
    const serverCalculatedAmount = calculateServerRentalAmount(targetVehicle, start, end);

    // 4. Force initial state to "pending" (Never accept client status or payment_status)
    let finalStatus = "pending";
    let finalPaymentStatus = "pending";

    // 5. Verify Cashfree payment status if payment_order_id is provided
    if (payment_order_id) {
      try {
        const { Cashfree } = require("cashfree-pg");
        const cfPayments = await Cashfree.PGOrderFetchPayments("2023-08-01", payment_order_id);
        const isPaid = cfPayments?.data?.some((p) => p.payment_status === "SUCCESS");
        if (isPaid) {
          finalStatus = "confirmed";
          finalPaymentStatus = "paid";
        }
      } catch (cfErr) {
        console.warn("[Cashfree Verification] Failed to verify payment order:", cfErr.message);
      }
    }

    const bookingData = {
      customer_id,
      bike_id: bike_id || null,
      cluster_id: cluster_id || null,
      vehicle_make_model: vehicleName,
      start_datetime: start,
      end_datetime: end,
      total_amount: serverCalculatedAmount,
      deposit_amount: Number(deposit_amount) || 0,
      notes: notes || undefined,
      booking_source: "online",
      status: finalStatus,
      payment_status: finalPaymentStatus,
      paid_amount: finalPaymentStatus === "paid" ? serverCalculatedAmount : 0,
      supports_partial_payments: true,
      payments: finalPaymentStatus === "paid" ? [
        {
          amount: serverCalculatedAmount,
          payment_method: "online",
          paid_at: new Date(),
          notes: "Online Payment verified via Cashfree",
          recorded_by: "System",
        }
      ] : [],
      payment_order_id: payment_order_id || null,
    };

    const booking = await Booking.create(bookingData);

    // 6. Broadcast notification alert if payment was confirmed
    if (finalStatus === "confirmed" && finalPaymentStatus === "paid") {
      sendOrderAlerts(booking, req.app.get("io"));
    }

    // 7. 🛡️ AUDIT LOG: Record Online Booking permanently in the AuditLog collection
    try {
      let customerName = "Online Customer";
      let customerEmail = req.body.customer_email || null;
      let customerPhone = req.body.customer_phone || null;

      const customer = await Customer.findById(booking.customer_id).lean();
      if (customer) {
        customerName = customer.name || customerName;
        customerEmail = customer.email || customerEmail;
        customerPhone = customer.phone || customerPhone;
      }

      await logAudit({
        action: "ONLINE_BOOKING_CREATED",
        severity: finalStatus === "confirmed" ? "info" : "warning",
        performed_by: null, // Public online customer checkout
        user_email: customerEmail,
        ip_address: getClientIp(req),
        user_agent: req.headers["user-agent"] || "",
        target_id: booking._id?.toString(),
        target_name: `${vehicleName} - ${customerName}`,
        details: {
          booking_id: booking._id,
          booking_source: "online",
          customer_id: booking.customer_id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          bike_id: booking.bike_id || null,
          cluster_id: booking.cluster_id || null,
          vehicle_model: vehicleName,
          number_plate: numberPlate,
          start_datetime: booking.start_datetime,
          end_datetime: booking.end_datetime,
          total_amount: booking.total_amount,
          deposit_amount: booking.deposit_amount,
          status: booking.status,
          payment_status: booking.payment_status,
          payment_order_id: booking.payment_order_id || null,
        },
      });
    } catch (auditErr) {
      console.error("Online Booking Audit Error:", auditErr.message);
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error("Website Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// exports.adminCreateBooking = async (req, res) => {
//   const {
//     bike_id,
//     start_datetime,
//     end_datetime,
//     customer_id,
//     notes,
//   } = req.body;


//   const bike = await Bike.findById(bike_id);
//       if (!bike) return res.status(404).json({ message: "Bike not found" });

//       const hourlyRate = Number(bike.price_per_hour || 0);
//       const start = new Date(start_datetime);
//       const end = new Date(end_datetime);
//       const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
//       const total_amount = hours * hourlyRate;

//       // 3. Create the Booking
//       const booking = await Booking.create({
//         customer_id,
//         bike_id,
//         start_datetime: start,
//         end_datetime: end,
//         total_amount,
//         notes,
//         booking_source: "admin",
//       });

//   res.status(201).json(booking);
  
// }

// exports.adminCreateBooking = async (req, res) => {
//   try {
//     const { bike_id, start_datetime, end_datetime, customer_id, notes } =
//       req.body;

//     const bike = await Bike.findById(bike_id);
//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     const start = new Date(start_datetime);
//     const end = new Date(end_datetime);

//     // 1. Calculate Total Hours
//     const totalHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

//     let total_amount = 0;
//     const hourlyRate = Number(bike.price_per_hour || 0);
//     const dailyRate = Number(bike.price_per_day || 0);

//     // 2. Logic: If 24 hours or more AND a daily rate exists
//     if (totalHours >= 24 && dailyRate > 0) {
//       const days = Math.floor(totalHours / 24);
//       const remainingHours = totalHours % 24;

//       // Calculate: (Full Days * Daily Price) + (Extra Hours * Hourly Price)
//       total_amount = days * dailyRate + remainingHours * hourlyRate;

//       // Optimization: If remaining hours cost more than another full day,
//       // just charge for an extra day (whichever is cheaper)
//       if (remainingHours * hourlyRate > dailyRate) {
//         total_amount = (days + 1) * dailyRate;
//       }
//     } else {
//       // Logic: Less than 24 hours (or no daily rate set)
//       total_amount = totalHours * hourlyRate;
//     }

//     // 3. Create the Booking
//     const booking = await Booking.create({
//       customer_id,
//       bike_id,
//       start_datetime: start,
//       end_datetime: end,
//       total_amount,
//       notes,
//       booking_source: "admin",
//       status: "confirmed", // Or "active" depending on your flow
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error("Booking Error:", error);
//     res.status(500).json({ message: "Server error creating booking" });
//   }
// };


// exports.adminCreateBooking = async (req, res) => {
//   try {

//     const {
//       bike_id,
//       start_datetime,
//       end_datetime,
//       customer_id,

//       customer_name,
//       contact_number,
//       customer_email,
//       customer_location,

//       lead_source,
//       source_name,

//       vehicle_make_model,
//       rental_type,

//       deposit_amount,

//       reference_partner_share,
//       reference_partner_share_given,

//       provider_partner_share,
//       provider_partner_share_given,

//       fuel_quantity,
//       account_manager,

//       remarks,
//       notes,

//       payment_method

//     } = req.body;

//     const bike = await Bike.findById(bike_id);

//     if (!bike) {
//       return res.status(404).json({ message: "Bike not found" });
//     }

//     const start = new Date(start_datetime);
//     const end = new Date(end_datetime);

//     const totalHours = Math.max(
//       1,
//       Math.ceil((end - start) / (1000 * 60 * 60))
//     );

//     let total_amount = 0;

//     const hourlyRate = Number(bike.price_per_hour || 0);
//     const dailyRate = Number(bike.price_per_day || 0);

//     if (totalHours >= 24 && dailyRate > 0) {

//       const days = Math.floor(totalHours / 24);
//       const remainingHours = totalHours % 24;

//       total_amount = days * dailyRate + remainingHours * hourlyRate;

//       if (remainingHours * hourlyRate > dailyRate) {
//         total_amount = (days + 1) * dailyRate;
//       }

//     } else {

//       total_amount = totalHours * hourlyRate;

//     }

//     const booking = await Booking.create({

//       customer_id,
//       bike_id,

//       customer_name,
//       contact_number,
//       customer_email,
//       customer_location,

//       lead_source,
//       source_name,

//       vehicle_make_model,
//       rental_type,

//       start_datetime: start,
//       end_datetime: end,

//       total_amount,

//       deposit_amount: Number(deposit_amount),

//       reference_partner_share: Number(reference_partner_share) || 0,
//       reference_partner_share_given,

//       provider_partner_share: Number(provider_partner_share) || 0,
//       provider_partner_share_given,

//       fuel_quantity: Number(fuel_quantity) || 0,

//       account_manager,

//       remarks,
//       notes,

//       payment_method,

//       status: "confirmed",
//       updated_by_admin: true,

//     });

//     res.status(201).json(booking);

//   } catch (error) {

//     console.error("Booking Error:", error);

//     res.status(500).json({
//       message: "Server error creating booking",
//     });

//   }
// };


exports.adminCreateBooking = async (req, res) => {
  try {

    const {
      bike_id,
      start_datetime,
      end_datetime,
      customer_id,

      customer_name,
      contact_number,
      customer_email,
      customer_location,

      lead_source,
      source_name,

      vehicle_make_model,
      rental_type,
      total_amount: manual_total_amount,
      paid_amount,
      initial_paid_amount,
      deposit_amount,

      reference_partner_share,
      reference_partner_share_given,

      provider_partner_share,
      provider_partner_share_given,

      fuel_quantity,
      account_manager,

      remarks,
      notes,

      payment_method,

      // ✅ NEW FIELDS (added)
      fuel_out_liters,
      fuel_in_liters,
      penalty_amount,
      challan_amount,
      damage_cost

    } = req.body;

    if (
      (manual_total_amount !== undefined && Number(manual_total_amount) < 0) ||
      (deposit_amount !== undefined && Number(deposit_amount) < 0) ||
      (penalty_amount !== undefined && Number(penalty_amount) < 0) ||
      (challan_amount !== undefined && Number(challan_amount) < 0) ||
      (damage_cost !== undefined && Number(damage_cost) < 0)
    ) {
      return res.status(400).json({ message: "Monetary amounts cannot be negative" });
    }

    const bike = await Bike.findById(bike_id);

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      const userAreaIds = getUserAreaIds(req.user);
      const hasBikeArea = userAreaIds?.some(
        (areaId) => areaId.toString() === bike.area_id?.toString()
      );
      if (!hasBikeArea) {
        return res.status(403).json({ message: "Access denied: You cannot create bookings for bikes in unassigned areas" });
      }
    }

    // const start = new Date(start_datetime);
    // const end = new Date(end_datetime);

    let start_datetime_ist = start_datetime;
    if (!start_datetime.includes("Z") && !start_datetime.includes("+")) {
      start_datetime_ist = `${start_datetime}+05:30`;
    }
    const start = new Date(start_datetime_ist);

    let end_datetime_ist = end_datetime;
    if (!end_datetime.includes("Z") && !end_datetime.includes("+")) {
      end_datetime_ist = `${end_datetime}+05:30`;
    }
    const end = new Date(end_datetime_ist);

    // ✅ Safety check
    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const totalHours = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60))
    );

    // let total_amount = 0;


    // const hourlyRate = Number(bike.price_per_hour || 0);
    // const dailyRate = Number(bike.price_per_day || 0);

    // if (totalHours >= 24 && dailyRate > 0) {

    //   const days = Math.floor(totalHours / 24);
    //   const remainingHours = totalHours % 24;

    //   total_amount = days * dailyRate + remainingHours * hourlyRate;

    //   if (remainingHours * hourlyRate > dailyRate) {
    //     total_amount = (days + 1) * dailyRate;
    //   }

    // } else {

    //   total_amount = totalHours * hourlyRate;

    // }

    // ✅ Replaced the old calculation block with this:
    let final_total_amount = 0;

    if (
      manual_total_amount !== undefined &&
      manual_total_amount !== null &&
      manual_total_amount !== ""
    ) {
      final_total_amount = Number(manual_total_amount);
    } else {
      const totalHours = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60)),
      );
      const hourlyRate = Number(bike.price_per_hour || 0);
      const dailyRate = Number(bike.price_per_day || 0);

      // if (totalHours >= 24 && dailyRate > 0) {
      //   const days = Math.floor(totalHours / 24);
      //   const remainingHours = totalHours % 24;
      //   final_total_amount = days * dailyRate + remainingHours * hourlyRate;

      const days = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

        // if (remainingHours * hourlyRate > dailyRate) {
        //   final_total_amount = (days + 1) * dailyRate;

        if (days === 0) {
        if (totalHours < 3) {
          final_total_amount = 3 * hourlyRate;
        } else if (totalHours <= 5) {
          final_total_amount = totalHours * hourlyRate;
        } else {
          final_total_amount = dailyRate;

        }
      } else {
        // final_total_amount = totalHours * hourlyRate;
        final_total_amount = days * dailyRate;
        if (remainingHours > 0) {
          if (remainingHours >= 6) {
            final_total_amount += dailyRate;
          } else {
            final_total_amount += Math.min(remainingHours * hourlyRate, dailyRate);
          }
        }
      }
    }

    const booking = await Booking.create({

      customer_id,
      bike_id,

      customer_name,
      contact_number,
      customer_email,
      customer_location,

      lead_source,
      source_name,

      vehicle_make_model,
      rental_type,

      start_datetime: start,
      end_datetime: end,


      total_amount: final_total_amount,

      paid_amount: (() => {
        if (paid_amount !== undefined && paid_amount !== "") return Math.max(0, Number(paid_amount) || 0);
        if (initial_paid_amount !== undefined && initial_paid_amount !== "") return Math.max(0, Number(initial_paid_amount) || 0);
        return final_total_amount;
      })(),

      payment_status: (() => {
        let initialPaid = 0;
        if (paid_amount !== undefined && paid_amount !== "") initialPaid = Math.max(0, Number(paid_amount) || 0);
        else if (initial_paid_amount !== undefined && initial_paid_amount !== "") initialPaid = Math.max(0, Number(initial_paid_amount) || 0);
        else initialPaid = final_total_amount;

        if (initialPaid >= final_total_amount && final_total_amount > 0) return "paid";
        if (initialPaid > 0) return "partial";
        return "pending";
      })(),

      supports_partial_payments: true,

      payments: (() => {
        let initialPaid = 0;
        if (paid_amount !== undefined && paid_amount !== "") initialPaid = Math.max(0, Number(paid_amount) || 0);
        else if (initial_paid_amount !== undefined && initial_paid_amount !== "") initialPaid = Math.max(0, Number(initial_paid_amount) || 0);
        else initialPaid = final_total_amount;

        if (initialPaid > 0) {
          return [
            {
              amount: initialPaid,
              payment_method: payment_method || "cash",
              paid_at: new Date(),
              notes: notes || "Initial payment on creation",
              recorded_by: req.user?.fullName || req.user?.name || "Admin",
            }
          ];
        }
        return [];
      })(),

      // ✅ SAFE NUMBER CONVERSION
      deposit_amount: Number(deposit_amount) || 0,

      reference_partner_share: Number(reference_partner_share) || 0,
      reference_partner_share_given: reference_partner_share_given || false,

      provider_partner_share: Number(provider_partner_share) || 0,
      provider_partner_share_given: provider_partner_share_given || false,

      fuel_quantity: Number(fuel_quantity) || 0,

      // ✅ NEW FIELDS ADDED
      fuel_out_liters: fuel_out_liters !== undefined ? Number(fuel_out_liters) : undefined,
      fuel_in_liters: fuel_in_liters !== undefined ? Number(fuel_in_liters) : undefined,

      penalty_amount: Number(penalty_amount) || 0,
      challan_amount: Number(challan_amount) || 0,
      damage_cost: Number(damage_cost) || 0,


     booking_source: "admin",   // ✅ add this back


      account_manager,

      remarks,
      notes,

      payment_method,

      status: "confirmed",
      updated_by_admin: true,

    });

    res.status(201).json(booking);

  } catch (error) {

    console.error("Booking Error:", error);

    res.status(500).json({
      message: "Server error creating booking",
    });

  }
};




/**
 * GET ALL BOOKINGS (ADMIN)
 */
// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("customer_id", "name phone email")
//       .populate("bike_id", "model number_plate")
//       .sort({ createdAt: -1 });

//     const formatted = bookings.map((b) => ({
//       ...b.toObject(),
//       customers: b.customer_id,
//       bikes: b.bike_id,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getAllBookings = async (req, res) => {
  try {
    // const bookings = await Booking.find()
    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const areaScope = req.user ? getAreaScope(req) : null;

    if (areaScope && areaScope.length > 0) {
      const bikesInAreas = await Bike.find({ area_id: { $in: areaScope } }).select("_id").lean();
      const bikeIds = bikesInAreas.map((b) => b._id);
      const clustersInAreas = await Cluster.find({ area_id: { $in: areaScope } }).select("_id").lean();
      const clusterIds = clustersInAreas.map((c) => c._id);
      filter.$or = [
        { bike_id: { $in: bikeIds } },
        { cluster_id: { $in: clusterIds } }
      ];
    } else if (req.user && req.user.role === "investor") {
      const escapeRegex = (text) => text ? text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
      const nameRegex = new RegExp(`^${escapeRegex(req.user.fullName)}$`, 'i');
      const emailRegex = new RegExp(`^${escapeRegex(req.user.email)}$`, 'i');
      const investorBikes = await Bike.find({
        $or: [
          { bike_owner: { $regex: nameRegex } },
          { bike_owner: { $regex: emailRegex } }
        ]
      }).select("_id").lean();
      const investorBikeIds = investorBikes.map((b) => b._id);
      filter.bike_id = { $in: investorBikeIds };
    }

    // Server-side search filter
    if (req.query.search && typeof req.query.search === "string") {
      const searchRegex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      const searchConditions = [
        { customer_name: { $regex: searchRegex } },
        { contact_number: { $regex: searchRegex } },
        { vehicle_make_model: { $regex: searchRegex } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const isInvestor = req.user && req.user.role === "investor";
    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 25);
    const skip = (page - 1) * limit;

    let totalCount = 0;
    if (isPaginated) {
      totalCount = await Booking.countDocuments(filter);
    }

    let query = Booking.find(filter)
      .populate("customer_id", isInvestor ? "" : "name phone email")
      .populate({
        path: "bike_id",
        select: "bike_name model number_plate bike_owner area_id",
        populate: { path: "area_id", select: "name city" },
      })
      .populate({
        path: "cluster_id",
        select: "name area_id",
        populate: { path: "area_id", select: "name city" },
      })
      .sort({ createdAt: -1 });

    if (isPaginated) {
      query = query.skip(skip).limit(limit);
    }

    const bookings = await query.lean();

    const formatted = bookings.map((b) => {
      // const bookingObj = b.toObject();

      //    if (isInvestor) {
      //   delete bookingObj.customer_name;
      //   delete bookingObj.contact_number;
      //   delete bookingObj.customer_email;
      //   delete bookingObj.customer_location;
      //   delete bookingObj.customer_id;
      //   delete bookingObj.customer_license_files;
      //   delete bookingObj.customer_id_proof_files;
      //   delete bookingObj.payment_screenshot;
      //   delete bookingObj.remarks;
      // }
      if (isInvestor) {
        delete b.customer_name;
        delete b.contact_number;
        delete b.customer_email;
        delete b.customer_location;
        delete b.customer_id;
        delete b.customer_license_files;
        delete b.customer_id_proof_files;
        delete b.payment_screenshot;
        delete b.remarks;
      }

      // ✅ Add formatted IST strings for the frontend to display easily
      return {
        // ...bookingObj,
        // // customers: b.customer_id,
        //  customers: isInvestor ? null : b.customer_id,
        ...b,
        vehicle_make_model: b.vehicle_make_model ? b.vehicle_make_model.replace(/^undefined\s*/i, "").trim() : (b.bike_id ? (b.bike_id.bike_name || b.bike_id.model || "Bike") : "Bike"),
        customers: isInvestor ? null : b.customer_id,
        bikes: b.bike_id,
        ...(() => {
          const isNewFlow = Boolean(
            b.supports_partial_payments === true ||
            (Array.isArray(b.payments) && b.payments.length > 0)
          );
          const totalDue = isNewFlow
            ? (Number(b.total_amount) || 0) + (Number(b.extended_amount) || 0)
            : (Number(b.total_amount) || 0);
          const paid_amount = isNewFlow
            ? (Number(b.paid_amount) || 0)
            : (b.payment_status === "paid" ? totalDue : 0);
          const pending_amount = isNewFlow
            ? Math.max(0, totalDue - paid_amount)
            : 0;
          return {
            totalDue,
            paid_amount,
            pending_amount,
            supports_partial_payments: isNewFlow,
          };
        })(),
        // Format for display: "21/04/2026, 7:00:00 pm"
        // start_datetime_display: b.start_datetime.toLocaleString("en-IN", {
          //  
          start_datetime_display: b.start_datetime ? new Date(b.start_datetime).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        // }),
        // end_datetime_display: b.end_datetime.toLocaleString("en-IN", {
        //         }) : "",
        // end_datetime_display: b.end_datetime ? b.end_datetime.toLocaleString("en-IN", {

        }) : "",
        end_datetime_display: b.end_datetime ? new Date(b.end_datetime).toLocaleString("en-IN", {

          timeZone: "Asia/Kolkata",
          hour12: true,
        // }),
        }) : "",
      };
    });

    if (isPaginated) {
      return res.json({
        bookings: formatted,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentPage: page,
      });
    }

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SINGLE BOOKING
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer_id", "name phone email")
      // .populate("bike_id", "model number_plate");
      .populate({
        path: "bike_id",
        select: "model number_plate area_id",
        populate: { path: "area_id", select: "name city" },
      })
      .populate({
        path: "cluster_id",
        select: "name area_id",
        populate: { path: "area_id", select: "name city" },
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }
    }

    const bObj = booking.toObject();
    const totalDue = (Number(bObj.total_amount) || 0) + (Number(bObj.extended_amount) || 0);
    const isNewFlow = Boolean(
      bObj.supports_partial_payments === true ||
      (Array.isArray(bObj.payments) && bObj.payments.length > 0)
    );
    const paidAmount = isNewFlow
      ? (Number(bObj.paid_amount) || 0)
      : (bObj.payment_status === "paid" ? totalDue : 0);
    const pendingAmount = isNewFlow
      ? Math.max(0, totalDue - paidAmount)
      : 0;

    if (bObj.vehicle_make_model) {
      bObj.vehicle_make_model = bObj.vehicle_make_model.replace(/^undefined\s*/i, "").trim();
    }
    res.json({
      ...bObj,
      customers: booking.customer_id,
      bikes: booking.bike_id,
      totalDue,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      supports_partial_payments: isNewFlow,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE BOOKING (ADMIN CAN EDIT DETAILS)
 */
// exports.updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const { start_datetime, end_datetime, total_amount, notes } = req.body;

//     if (start_datetime !== undefined) booking.start_datetime = start_datetime;

//     if (end_datetime !== undefined) booking.end_datetime = end_datetime;

//     if (total_amount !== undefined) booking.total_amount = total_amount;

//     if (notes !== undefined) booking.notes = notes;

//     booking.updated_by_admin = true;

//     await booking.save();

//     res.json({
//       message: "Booking updated successfully",
//       booking,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.updateBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);   // ✅ debug
    console.log("FILE:", req.file);   // ✅ debug

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }
      // if (req.body.bike_id) {
      if (req.body && req.body.bike_id) {
        const bike = await Bike.findById(req.body.bike_id);
        if (bike) {
          const hasBikeArea = req.user.assigned_areas.some(
            (area) => (area._id?.toString() || area.toString()) === bike.area_id?.toString()
          );
          if (!hasBikeArea) {
            return res.status(403).json({ message: "Access denied: Target bike is in an unassigned area" });
          }
        }
      }
    }

    const body = req.body || {}; // ✅ SAFE FIX

    if (
      (body.total_amount !== undefined && Number(body.total_amount) < 0) ||
      (body.deposit_amount !== undefined && Number(body.deposit_amount) < 0) ||
      (body.penalty_amount !== undefined && Number(body.penalty_amount) < 0) ||
      (body.challan_amount !== undefined && Number(body.challan_amount) < 0) ||
      (body.damage_cost !== undefined && Number(body.damage_cost) < 0)
    ) {
      return res.status(400).json({ message: "Monetary amounts cannot be negative" });
    }

    const updateData = {
      ...body,

      fuel_out_liters:
        body.fuel_out_liters !== undefined
          ? Number(body.fuel_out_liters)
          : undefined,

      fuel_in_liters:
        body.fuel_in_liters !== undefined
          ? Number(body.fuel_in_liters)
          : undefined,

      penalty_amount:
        body.penalty_amount !== undefined
          ? Number(body.penalty_amount)
          : undefined,

      challan_amount:
        body.challan_amount !== undefined
          ? Number(body.challan_amount)
          : undefined,

      damage_cost:
        body.damage_cost !== undefined
          ? Number(body.damage_cost)
          : undefined,
    };

    // ✅ IMAGE SAVE
    if (req.file) {
      updateData.payment_screenshot = req.file.path;
    }

    const oldBikeId = booking.bike_id ? booking.bike_id.toString() : null;
    const newBikeId = updateData.bike_id ? updateData.bike_id.toString() : null;
    const oldStatus = booking.status;
    const newStatus = updateData.status;

    // const booking = await Booking.findByIdAndUpdate(
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: false,
      }
    );

    // Sync bike statuses based on changes
    if (newBikeId !== oldBikeId) {
      if (oldBikeId) {
        await Bike.findByIdAndUpdate(oldBikeId, { status: "available" });
      }
      if (newBikeId) {
        const currentStatus = newStatus || oldStatus;
        if (currentStatus === "confirmed" || currentStatus === "active") {
          await Bike.findByIdAndUpdate(newBikeId, { status: "booked" });
        }
      }
    } else if (newStatus && newStatus !== oldStatus) {
      const bikeToUpdate = newBikeId || oldBikeId;
      if (bikeToUpdate) {
        if (newStatus === "completed" || newStatus === "cancelled") {
          await Bike.findByIdAndUpdate(bikeToUpdate, { status: "available" });
        } else if (newStatus === "confirmed" || newStatus === "active") {
          await Bike.findByIdAndUpdate(bikeToUpdate, { status: "booked" });
        }
      }
    }

    await logAudit({
      action: "UPDATE_BOOKING",
      severity: "info",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      target_id: booking._id,
      target_name: booking.customer_name,
      details: {
        updated_keys: Object.keys(body),
        previous_total: booking.total_amount,
        new_total: updatedBooking.total_amount,
        previous_status: oldStatus,
        new_status: newStatus || oldStatus,
      },
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// exports.updateBooking = async (req, res) => {
//   try {

//     let updateData = { ...req.body };

//     // ✅ Convert numeric fields safely
//     const numberFields = [
//       "fuel_out_liters",
//       "fuel_in_liters",
//       "penalty_amount",
//       "challan_amount",
//       "damage_cost",
//       "deposit_amount",
//       "reference_partner_share",
//       "provider_partner_share",
//       "fuel_quantity"
//     ];

//     numberFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = Number(req.body[field]);
//       }
//     });

//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: false
//       }
//     );

//     res.status(200).json(booking);

//   } catch (error) {
//     console.error("Update Booking Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



/**
 * UPDATE BOOKING STATUS (FAST ADMIN ACTION)
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // const booking = await Booking.findByIdAndUpdate(
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updated_by_admin: true },
      { new: true },
    );

    // if (!booking) {
    //   return res.status(404).json({ message: "Booking not found" });
    // }

    // If the status is completed or cancelled, make the bike available
    if (status === "completed" || status === "cancelled") {
      if (booking.bike_id) {
        await Bike.findByIdAndUpdate(booking.bike_id, { status: "available" });
      }
    } else if (status === "active" || status === "confirmed") {
      // If active or confirmed, ensure the bike status is "booked"
      if (booking.bike_id) {
        await Bike.findByIdAndUpdate(booking.bike_id, { status: "booked" });
      }
    }

    await logAudit({
      action: status === "cancelled" ? "CANCEL_BOOKING" : "UPDATE_BOOKING_STATUS",
      severity: status === "cancelled" ? "warning" : "info",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      target_id: booking._id,
      target_name: booking.customer_name,
      details: {
        previous_status: booking.status,
        new_status: status,
      },
    });

    res.json({
      message: "Booking status updated",
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE / CANCEL BOOKING
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    if (booking.bike_id) {
      await Bike.findByIdAndUpdate(booking.bike_id, { status: "available" });
    }

    await logAudit({
      action: "DELETE_BOOKING",
      severity: "critical",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      target_id: booking._id,
      target_name: booking.customer_name,
      details: {
        booking_status: booking.status,
        total_amount: booking.total_amount,
        contact_number: booking.contact_number,
      },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.extendBooking = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      new_end_datetime,
      extra_amount
    } = req.body;

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }
    }

    // 🚨 Allow extend only if active
    if (booking.status !== "active") {
      return res.status(400).json({
        message: "Only active bookings can be extended"
      });
    }

    const extraNum = Number(extra_amount || 0);
    if (isNaN(extraNum) || extraNum < 0) {
      return res.status(400).json({ message: "Extra amount cannot be negative" });
    }

    const newEnd = new Date(new_end_datetime);
    const oldEnd = booking.end_datetime;

    if (!new_end_datetime || isNaN(newEnd.getTime()) || newEnd <= new Date(oldEnd)) {
      return res.status(400).json({
        message: "New end date must be valid and after the current end date"
      });
    }

    // 🚨 Check availability
    const conflict = await Booking.findOne({
      bike_id: booking.bike_id,
      status: {
        $nin: ["cancelled", "completed"]
      },
      _id: { $ne: booking._id },
      start_datetime: {
        $lt: newEnd
      },
      end_datetime: {
        $gt: oldEnd
      },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Bike already booked in extended time",
        bookedFrom: conflict.start_datetime,
        bookedTo: conflict.end_datetime,
      });
    }

    // Check if booking belongs to the new partial/split payments system
    const isNewFlow = Boolean(
      booking.supports_partial_payments === true ||
      (Array.isArray(booking.payments) && booking.payments.length > 0)
    );

    booking.end_datetime = newEnd;

    if (!isNewFlow) {
      // 🛡️ OLD BOOKING FLOW:
      // In the legacy system, total_amount already accumulates extensions.
      // We do NOT alter payment_status or convert it to partial/dues mode.
      booking.total_amount = (Number(booking.total_amount) || 0) + extraNum;
      booking.extended_amount = (Number(booking.extended_amount) || 0) + extraNum;
      booking.is_extended = true;

      await booking.save();

      await logAudit({
        action: "EXTEND_BOOKING",
        severity: "info",
        performed_by: req.user?._id || req.user?.id,
        user_email: req.user?.email,
        ip_address: getClientIp(req),
        target_id: booking._id,
        target_name: booking.customer_name,
        details: {
          previous_end_datetime: oldEnd,
          new_end_datetime: newEnd,
          extra_amount: extraNum,
          extended_amount: booking.extended_amount,
          total_amount: booking.total_amount,
          total_due: Number(booking.total_amount) || 0,
          payment_status: booking.payment_status,
        },
      });

      return res.json({
        message: "Booking extended successfully",
        booking: {
          ...booking.toObject(),
          totalDue: Number(booking.total_amount) || 0,
        },
      });
    }

    // 🚀 NEW BOOKING FLOW:
    // Preserving customer's prior paid balance if booking was marked 'paid' previously
    let currentPaid = Number(booking.paid_amount || 0);
    const prevTotalDue = (Number(booking.total_amount) || 0) + (Number(booking.extended_amount) || 0);
    if (booking.payment_status === "paid" && (currentPaid === 0 || currentPaid < prevTotalDue)) {
      currentPaid = prevTotalDue;
      booking.paid_amount = currentPaid;
    }

    // For new flow, only add extraNum to extended_amount (totalDue = total_amount + extended_amount)
    booking.extended_amount = (Number(booking.extended_amount) || 0) + extraNum;
    booking.is_extended = true;
    booking.supports_partial_payments = true;

    // Re-evaluate payment_status based on updated totalDue and currentPaid
    const newTotalDue = (Number(booking.total_amount) || 0) + (Number(booking.extended_amount) || 0);
    if (extraNum > 0) {
      if (currentPaid >= newTotalDue) {
        booking.payment_status = "paid";
      } else if (currentPaid > 0) {
        booking.payment_status = "partial";
      } else {
        booking.payment_status = "pending";
      }
    }

    await booking.save();

    await logAudit({
      action: "EXTEND_BOOKING",
      severity: "info",
      performed_by: req.user?._id || req.user?.id,
      user_email: req.user?.email,
      ip_address: getClientIp(req),
      target_id: booking._id,
      target_name: booking.customer_name,
      details: {
        previous_end_datetime: oldEnd,
        new_end_datetime: newEnd,
        extra_amount: extraNum,
        extended_amount: booking.extended_amount,
        total_amount: booking.total_amount,
        total_due: newTotalDue,
        paid_amount: booking.paid_amount,
        payment_status: booking.payment_status,
      },
    });

    res.json({
      message: "Booking extended successfully",
      booking: {
        ...booking.toObject(),
        totalDue: newTotalDue,
        paid_amount: booking.paid_amount,
        pending_amount: Math.max(0, newTotalDue - (Number(booking.paid_amount) || 0)),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


/**
 * ASSIGN BIKE TO SCOOTER POOL BOOKING (ADMIN)
 */
exports.assignBikeToBooking = async (req, res) => {
  try {
    const { bike_id } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }

      const bike = await Bike.findById(bike_id);
      if (bike) {
        const hasBikeArea = req.user.assigned_areas.some(
          (area) => (area._id?.toString() || area.toString()) === bike.area_id?.toString()
        );
        if (!hasBikeArea) {
          return res.status(403).json({ message: "Access denied: Target bike is in an unassigned area" });
        }
      }
    }

    const bike = await Bike.findById(bike_id);
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    if (bike.status !== "available") {
      return res.status(400).json({ message: "Bike is not available" });
    }

    // Assign bike, confirm booking, mark bike as booked
    booking.bike_id = bike_id;
    booking.vehicle_make_model = (bike.bike_name && bike.model && bike.bike_name !== bike.model ? `${bike.bike_name} ${bike.model}` : (bike.bike_name || bike.model || "Bike")).replace(/^undefined\s*/i, "").trim();
    booking.status = "confirmed";
    booking.updated_by_admin = true;
    await booking.save();

    bike.status = "booked";
    await bike.save();

    const populated = await Booking.findById(booking._id)
      .populate("customer_id", "name phone email")
      .populate("bike_id", "model number_plate")
      .populate("cluster_id");

    res.json({ message: "Bike assigned successfully", booking: populated });
  } catch (err) {
    console.error("Assign Bike Error:", err);
    res.status(500).json({ message: err.message });
  }
};
/**
 * RECORD BOOKING PAYMENT (SPLIT / PARTIAL / FULL INSTALLMENT)
 * POST /api/bookings/:id/payment
 */
exports.recordBookingPayment = async (req, res) => {
  try {
    const { amount, payment_method, notes } = req.body;
    const paymentAmount = Number(amount);

    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user && req.user.role === "staff") {
      const hasAccess = await checkBookingAreaAccess(booking, req.user);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied: You do not have access to this area's bookings" });
      }
    }

    const totalDue = (Number(booking.total_amount) || 0) + (Number(booking.extended_amount) || 0);
    const currentPaid = Number(booking.paid_amount) || 0;
    const remainingDue = Math.max(0, totalDue - currentPaid);

    if (paymentAmount > remainingDue) {
      return res.status(400).json({
        message: `Payment amount (₹${paymentAmount}) cannot exceed remaining balance (₹${remainingDue})`,
      });
    }

    const newPaidAmount = currentPaid + paymentAmount;
    const newPaymentStatus = newPaidAmount >= totalDue ? "paid" : "partial";

    if (!Array.isArray(booking.payments)) {
      booking.payments = [];
    }

    const recordedBy = req.user?.fullName || req.user?.name || req.user?.email || "Admin";

    booking.payments.push({
      amount: paymentAmount,
      payment_method: payment_method || "cash",
      notes: notes || "",
      paid_at: new Date(),
      recorded_by: recordedBy,
    });

    booking.paid_amount = newPaidAmount;
    booking.payment_status = newPaymentStatus;
    booking.supports_partial_payments = true;
    booking.updated_by_admin = true;

    await booking.save();

    try {
      await logAudit({
        action: "RECORD_BOOKING_PAYMENT",
        severity: "info",
        performed_by: req.user?._id || req.user?.id,
        user_email: req.user?.email,
        ip_address: getClientIp(req),
        target_id: booking._id,
        target_name: booking.customer_name,
        details: {
          amount: paymentAmount,
          payment_method: payment_method || "cash",
          notes: notes || "",
          new_paid_total: newPaidAmount,
          total_due: totalDue,
          remaining_due: Math.max(0, totalDue - newPaidAmount),
          payment_status: newPaymentStatus,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log error in recordBookingPayment:", auditErr.message);
    }

    const populated = await Booking.findById(booking._id)
      .populate("customer_id", "name phone email")
      .populate({
        path: "bike_id",
        select: "bike_name model number_plate bike_owner area_id",
        populate: { path: "area_id", select: "name city" },
      })
      .populate({
        path: "cluster_id",
        select: "name area_id",
        populate: { path: "area_id", select: "name city" },
      });

    const bObj = populated.toObject();
    const finalTotalDue = (Number(bObj.total_amount) || 0) + (Number(bObj.extended_amount) || 0);
    const finalPaid = Number(bObj.paid_amount) || 0;

    res.json({
      message: "Payment recorded successfully",
      booking: {
        ...bObj,
        customers: populated.customer_id,
        bikes: populated.bike_id,
        totalDue: finalTotalDue,
        paid_amount: finalPaid,
        pending_amount: Math.max(0, finalTotalDue - finalPaid),
        supports_partial_payments: true,
      },
    });
  } catch (err) {
    console.error("Record Booking Payment Error:", err);
    res.status(500).json({ message: err.message || "Failed to record payment" });
  }
};
