import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

function setAppHeight() {
  if (typeof window === "undefined") return;
  const height = window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}
setAppHeight();
window.addEventListener("resize", setAppHeight);

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
