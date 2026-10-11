const mongoose = require("mongoose");

const vehicleServiceHistorySchema = new mongoose.Schema(
  {
    bike_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
      required: true,
    },
    service_date: {
      type: Date,
      required: true,
    },
    service_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    bill_link: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    recorded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

vehicleServiceHistorySchema.index({ bike_id: 1, service_date: -1 });
vehicleServiceHistorySchema.index({ area_id: 1, service_date: -1 });
vehicleServiceHistorySchema.index({ service_date: -1 });

module.exports = mongoose.model(
  "VehicleServiceHistory",
  vehicleServiceHistorySchema
);