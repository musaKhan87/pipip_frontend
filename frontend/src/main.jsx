import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App";
import "./index.css";

// 🔐 Secret Client Handshake Signature (Rejects raw Postman & bot requests)
const CLIENT_SIGNATURE = "PIPIP_SECURE_FRONTEND_V1";
axios.defaults.headers.common["x-client-signature"] = CLIENT_SIGNATURE;

// Also patch native window.fetch so fetch() calls automatically attach the handshake header
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (!headers.has("x-client-signature")) {
    headers.set("x-client-signature", CLIENT_SIGNATURE);
  }
  return originalFetch(input, { ...init, headers });
};

createRoot(document.getElementById("root")).render(<App />);

