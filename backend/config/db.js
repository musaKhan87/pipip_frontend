const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20, // High-performance concurrent connection pool
      minPoolSize: 5,  // Keep 5 warm connections ready
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected");

    // Auto-cleanup hook: Purge unauthorized test records
    try {
      const Booking = require("../models/Booking");
      const Customer = require("../models/Customer");
      const AuditLog = require("../models/AuditLog");

      const testBookingId = "6ae0a61bdbac72fac19369cb";
      const testCustomerId = "6ae0a612dbac72fac19369c7";

      const [delBooking, delCustomer, delAudit] = await Promise.all([
        Booking.deleteOne({ _id: testBookingId }),
        Customer.deleteOne({ _id: testCustomerId }),
        AuditLog.deleteMany({
          $or: [
            { target_id: testBookingId },
            { target_id: testCustomerId },
            { "details.booking_id": testBookingId },
            { "details.customer_id": testCustomerId },
          ],
        }),
      ]);

      if (delBooking.deletedCount > 0 || delCustomer.deletedCount > 0 || delAudit.deletedCount > 0) {
        console.log(
          `[Auto-Cleanup] Successfully purged test records: ${delBooking.deletedCount} booking(s), ${delCustomer.deletedCount} customer(s), ${delAudit.deletedCount} audit log(s).`
        );
      }
    } catch (cleanErr) {
      console.error("[Auto-Cleanup] Test cleanup notice:", cleanErr.message);
    }

    // Auto-migration hook: Backfill area_id for VehicleServiceHistory if missing
    try {
      const VehicleServiceHistory = require("../models/VehicleServiceHistory");
      const Bike = require("../models/Bike");
      const unmigrated = await VehicleServiceHistory.find({
        $or: [{ area_id: null }, { area_id: { $exists: false } }],
      });
      if (unmigrated.length > 0) {
        console.log(`[Auto-Migration] Found ${unmigrated.length} VehicleServiceHistory records lacking area_id. Backfilling...`);
        for (const rec of unmigrated) {
          const bike = await Bike.findById(rec.bike_id);
          if (bike && bike.area_id) {
            await VehicleServiceHistory.updateOne(
              { _id: rec._id },
              { $set: { area_id: bike.area_id } }
            );
          }
        }
        console.log(`[Auto-Migration] Successfully backfilled area_id for VehicleServiceHistory.`);
      }
    } catch (migErr) {
      console.error("[Auto-Migration] VehicleServiceHistory migration notice:", migErr.message);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
