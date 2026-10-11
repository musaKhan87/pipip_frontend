require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const VehicleServiceHistory = require("../models/VehicleServiceHistory");
const Bike = require("../models/Bike");
const Area = require("../models/Area");
const connectDB = require("../config/db");

async function migrateServiceHistoryAreas() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for VehicleServiceHistory migration...");

    // Find all service records that don't have area_id
    const recordsWithoutArea = await VehicleServiceHistory.find({
      $or: [{ area_id: null }, { area_id: { $exists: false } }],
    });

    console.log(`Found ${recordsWithoutArea.length} service records lacking area_id.`);

    let updatedCount = 0;
    let fallbackCount = 0;
    let fallbackArea = null;

    for (const record of recordsWithoutArea) {
      const bike = await Bike.findById(record.bike_id);
      if (bike && bike.area_id) {
        await VehicleServiceHistory.updateOne(
          { _id: record._id },
          { $set: { area_id: bike.area_id } }
        );
        updatedCount++;
      } else {
        // If bike has no area, assign to the first active area as fallback
        if (!fallbackArea) {
          fallbackArea = await Area.findOne({ status: "active" });
          if (!fallbackArea) {
            fallbackArea = await Area.findOne();
          }
        }
        if (fallbackArea) {
          await VehicleServiceHistory.updateOne(
            { _id: record._id },
            { $set: { area_id: fallbackArea._id } }
          );
          fallbackCount++;
        }
      }
    }

    console.log(`Migration Complete:`);
    console.log(`- Updated from Bike area: ${updatedCount}`);
    console.log(`- Updated with fallback area: ${fallbackCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateServiceHistoryAreas();
