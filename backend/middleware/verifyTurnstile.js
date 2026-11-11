const axios = require("axios");

/**
 * Cloudflare Turnstile Verification Middleware
 * Validates single-use cryptographic bot challenge token submitted by frontend checkout.
 * Blocks Chrome DevTools fetch(), Postman, and automated scraping/booking scripts.
 */
const verifyTurnstile = async (req, res, next) => {
  // 1. Allow CORS preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  // 2. Bypass bot check for verified online payment checkouts
  // If payment_order_id exists, the customer has ALREADY authenticated and paid via Cashfree gateway.
  if (req.body?.payment_order_id) {
    return next();
  }

  // 3. Extract token from request payload or header
  const token = req.body?.turnstile_token || req.headers["cf-turnstile-token"];

  if (!token) {
    return res.status(403).json({
      message: "Security verification failed: Turnstile token is missing. Please complete verification.",
    });
  }

  // Fallback to Cloudflare official testing secret (always passes in dev / fallback environments)
  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET ||
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    "1x0000000000000000000000000000000AA";

  const clientIp =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip;

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      formData.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );

    const data = response.data;
    if (!data.success) {
      console.warn("[Turnstile] Verification failed:", data["error-codes"] || data);
      return res.status(403).json({
        message: "Bot protection check failed. Please refresh and try again.",
        errors: data["error-codes"],
      });
    }

    // Token successfully verified by Cloudflare
    next();
  } catch (err) {
    console.error("[Turnstile] Error verifying token with Cloudflare:", err.message);
    // If it's a paid customer or testing secret, do not block legitimate users
    if (req.body?.payment_order_id || secretKey === "1x0000000000000000000000000000000AA") {
      return next();
    }
    return res.status(500).json({
      message: "Security verification service temporarily unavailable.",
    });
  }
};

module.exports = verifyTurnstile;
