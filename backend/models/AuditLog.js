const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "DELETE_BIKE",
        "UPDATE_PRICE",
        "DELETE_AREA",
        "DELETE_CLUSTER",
        "DELETE_CUSTOMER",
        "UPDATE_USER_ROLE",
        "LOGIN_SUCCESS",
        "FAILED_LOGIN_ATTEMPT",
        "LOGIN_LOCKOUT_TRIGGERED",
      ],
      index: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
      index: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    user_email: { type: String, default: null, index: true },
    ip_address: { type: String, required: true, index: true },
    user_agent: { type: String, default: "" },
    target_id: { type: String, default: null },
    target_name: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ ip_address: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ user_email: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
