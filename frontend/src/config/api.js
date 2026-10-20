/**
 * Central API & Backend URL Configuration
 *
 * 1. Local Development (localhost / 127.0.0.1):
 *    - Uses relative "/api" (proxied cleanly by Vite in vite.config.js).
 *    - Network tab only shows clean relative requests (e.g. "/api/bikes", "/api/areas").
 *    - "onrender.com" is completely hidden from the browser.
 *
 * 2. Production (pipip.in):
 *    - Uses the Cloudflare reverse proxy: "https://api.pipip.in/api".
 *    - Direct Render URLs are never exposed.
 *    - Overridable via VITE_API_URL or VITE_BACKEND_URL environment variables.
 */

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Root backend domain (used for Socket.io, auth redirects, etc.)
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost ? "" : "https://api.pipip.in");

// Base API endpoint for all REST queries (e.g., /api/bikes)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? "/api" : "https://api.pipip.in/api");

export default API_BASE_URL;
