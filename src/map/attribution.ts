import Attribution from "ol/control/Attribution.js";

// Trusted, authored markup. Keep OSM credit outside the optional source-details disclosure.
export const MAP_ATTRIBUTIONS = [
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
  `<details class="atlas-attribution-details">
    <summary>资料来源</summary>
    <div class="atlas-attribution-sources">
      <p>海岸线：© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> · <a href="https://download.geofabrik.de/asia/china.html" target="_blank" rel="noopener noreferrer">Geofabrik</a></p>
      <p>香港海岸线：© 香港特别行政区政府 · <a href="https://www.landsd.gov.hk/en/spatial-data/open-data.html" target="_blank" rel="noopener noreferrer">地政总署</a> · <a href="https://data.gov.hk/en/terms-and-conditions" target="_blank" rel="noopener noreferrer">DATA.GOV.HK</a></p>
      <p>行政区划：<a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener noreferrer">DataV</a> · <a href="https://data.gov.tw/dataset/7441" target="_blank" rel="noopener noreferrer">国土测绘中心开放资料</a></p>
      <p>地形与水系参考：<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Mapzen Terrain Tiles</a></p>
    </div>
  </details>`,
];

/** Shared by the React page and any standalone engine embed. */
export function createMapAttribution() {
  return new Attribution({
    className: "ol-attribution atlas-map-attribution",
    collapsible: false,
    collapsed: false,
    attributions: MAP_ATTRIBUTIONS,
  });
}
