const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      // enum: ["admin", "staff", "user"],
       enum: ["admin", "staff", "user", "investor"],
      default: "staff", // Default to staff for admin panel signups
    },
    assigned_areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);