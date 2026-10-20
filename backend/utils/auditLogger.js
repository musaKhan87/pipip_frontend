const AuditLog = require("../models/AuditLog");

/**
 * Creates an immutable audit log entry in MongoDB
 */
const logAudit = async ({
  action,
  severity = "info",
  performed_by = null,
  user_email = null,
  ip_address = "unknown",
  user_agent = "",
  target_id = null,
  target_name = null,
  details = {},
}) => {
  try {
    await AuditLog.create({
      action,
      severity,
      performed_by,
      user_email,
      ip_address,
      user_agent,
      target_id,
      target_name,
      details,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

/**
 * Resolves the client IP address from proxy headers or connection
 */
const getClientIp = (req) => {
  if (!req) return "unknown";
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
};

module.exports = { logAudit, getClientIp };
