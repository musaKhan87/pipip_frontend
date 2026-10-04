const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "manager", "staff", "user", "investor"],
      default: "staff",
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
    assigned_areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

// Sync areaId and assigned_areas before saving
UserSchema.pre("save", function () {
  if (this.areaId && (!this.assigned_areas || this.assigned_areas.length === 0)) {
    this.assigned_areas = [this.areaId];
  } else if (this.assigned_areas && this.assigned_areas.length > 0 && !this.areaId) {
    this.areaId = this.assigned_areas[0];
  }
});

module.exports = mongoose.model("User", UserSchema);