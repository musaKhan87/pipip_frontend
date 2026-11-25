import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🚫 Prevent mousewheel scroll from inadvertently modifying values in number inputs across the entire application (Client & Admin)
window.addEventListener(
  "wheel",
  () => {
    if (
      document.activeElement &&
      document.activeElement.tagName === "INPUT" &&
      document.activeElement.type === "number"
    ) {
      document.activeElement.blur();
    }
  },
  { passive: true }
);

createRoot(document.getElementById("root")).render(<App />);
