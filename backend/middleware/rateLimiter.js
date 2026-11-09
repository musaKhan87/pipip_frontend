const rateLimit = require("express-rate-limit");

/**
 * Helper to resolve accurate client IP behind Cloudflare and reverse proxies (e.g. Render)
 */
const getClientIp = (req) => {
  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    "127.0.0.1"
  );
};

/**
 * Strict Rate Limiter for Public Booking Creation
 * Max 5 booking creation attempts per 15 minutes per IP
 */
const bookingCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  statusCode: 429,
  message: {
    message: "Too many booking requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Strict Rate Limiter for Customer Profile Creation
 * Max 5 customer creation attempts per 15 minutes per IP
 */
const customerCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getClientIp,
  statusCode: 429,
  message: {
    message: "Too many customer creation requests from this IP. Please try again after 15 minutes.",
  },
});

module.exports = {
  bookingCreationLimiter,
  customerCreationLimiter,
};
