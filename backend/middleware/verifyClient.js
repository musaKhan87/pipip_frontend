/**
 * Client Handshake Middleware (Postman & Unofficial Client Protection)
 *
 * Verifies that requests are originating from the official Pipip Mumbai frontend application
 * by inspecting the custom handshake header 'x-client-signature' and blocking raw Postman agents.
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

  // 4. Verify secret client handshake signature
  const signature = req.headers["x-client-signature"];
  const expectedSignature = process.env.CLIENT_SIGNATURE || "PIPIP_SECURE_FRONTEND_V1";

  if (!signature || signature !== expectedSignature) {
    return res.status(403).json({
      message: "Access forbidden: Unofficial client or missing signature.",
    });
  }

  next();
};

module.exports = verifyClient;
