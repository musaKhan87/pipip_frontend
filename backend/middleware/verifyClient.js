/**
 * Client Handshake & Agent Filtering Middleware
 *
 * Blocks direct Postman Runtime and automated scrapers from hitting internal endpoints.
 * Public booking & customer creation endpoints are protected cryptographically via Cloudflare Turnstile.
 */
const verifyClient = (req, res, next) => {
  // 1. Allow CORS preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  // 2. Allow third-party server-to-server callbacks (e.g. Cashfree payment webhooks)
  if (
    req.path.startsWith("/payment/webhook") ||
    req.baseUrl.includes("/payment/webhook") ||
    req.originalUrl.includes("/payment/webhook")
  ) {
    return next();
  }

  // 3. Block direct Postman Runtime calls outright
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  if (userAgent.includes("postmanruntime")) {
    return res.status(403).json({
      message: "Access forbidden: Direct API testing clients are not allowed.",
    });
  }

  // Allow clean browser requests through
  next();
};

module.exports = verifyClient;
