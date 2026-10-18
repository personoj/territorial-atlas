import "ol/ol.css";
import "../styles/embed.css";
import "../styles/attribution.css";
import { GeographicPlanningMap } from "../map";
import { MAP_ASSET_BASE } from "../config/assets";

const container = document.getElementById("map")!;
const map = new GeographicPlanningMap(container, { assetBase: MAP_ASSET_BASE });
map
  .initialize()
  .then(() => {
    document.body.dataset.ready = "true";
  })
  .catch((error: unknown) => {
    container.textContent =
      error instanceof Error ? error.message : "地图加载失败";
  });
if (import.meta.hot) import.meta.hot.dispose(() => map.destroy());
