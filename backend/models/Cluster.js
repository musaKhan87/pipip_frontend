const mongoose = require("mongoose");

const clusterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike",
      },
    ],
    price_per_hour: { type: Number, required: true },
    price_per_day: { type: Number, required: true },
    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

clusterSchema.index({ is_deleted: 1 });
clusterSchema.index({ area_id: 1 });

module.exports = mongoose.model("Cluster", clusterSchema);