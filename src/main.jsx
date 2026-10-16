import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./app.css";
import { ErrorBoundary } from "./ui/error-boundary.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>
);

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}
