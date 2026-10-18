import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "ol/ol.css";
import "./styles/base.css";
import "./styles/map.css";
import "./styles/attribution.css";
import "./styles/controls.css";
import "./styles/dialog.css";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
