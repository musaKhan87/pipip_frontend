const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

areaSchema.index({ is_deleted: 1 });
areaSchema.index({ is_active: 1 });

module.exports = mongoose.model("Area", areaSchema);

