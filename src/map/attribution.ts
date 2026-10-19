import Attribution from "ol/control/Attribution.js";
import type OLMap from "ol/Map.js";

// Trusted, authored attribution markup, shared by the page and standalone embed.
export const MAP_ATTRIBUTIONS = [
  `<div class="atlas-attribution-sources">
      <strong>地图资料来源</strong>
      <p>海岸线：© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> · <a href="https://download.geofabrik.de/asia/china.html" target="_blank" rel="noopener noreferrer">Geofabrik</a></p>
      <p>香港海岸线：© 香港特别行政区政府 · <a href="https://www.landsd.gov.hk/en/spatial-data/open-data.html" target="_blank" rel="noopener noreferrer">地政总署</a> · <a href="https://data.gov.hk/en/terms-and-conditions" target="_blank" rel="noopener noreferrer">DATA.GOV.HK</a></p>
      <p>行政区划：<a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener noreferrer">DataV</a> · <a href="https://data.gov.tw/dataset/7441" target="_blank" rel="noopener noreferrer">国土测绘中心开放资料</a></p>
      <p>地形与水系参考：<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener noreferrer">Mapzen Terrain Tiles</a></p>
    </div>`,
];

/** Show credit on startup, then leave a small, accessible information button. */
class CompactMapAttribution extends Attribution {
  private introTimer?: ReturnType<typeof setTimeout>;
  private stopIntro = () => {
    if (this.introTimer !== undefined) clearTimeout(this.introTimer);
    this.introTimer = undefined;
  };
  private dismissFromMap = (event: Event) => {
    if (this.element?.contains(event.target as Node)) return;
    this.stopIntro();
    this.setCollapsed(true);
  };

  constructor() {
    super({
      collapsible: true,
      collapsed: true,
      label: "ⓘ",
      collapseLabel: "×",
      tipLabel: "资料来源",
      attributions: MAP_ATTRIBUTIONS,
    });
    this.element?.classList.add("atlas-map-attribution");
    this.element
      ?.querySelector("button")
      ?.setAttribute("aria-label", "资料来源");
    // A deliberate interaction keeps reopened information available for reading.
    this.element?.addEventListener("pointerdown", this.stopIntro);
    this.element?.addEventListener("focusin", this.stopIntro);
    this.element?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      this.stopIntro();
      this.setCollapsed(true);
      this.element?.querySelector("button")?.focus();
      event.stopPropagation();
    });
  }

  showIntro() {
    if (!this.getMap()) return;
    this.stopIntro();
    this.setCollapsed(false);
    this.introTimer = setTimeout(() => {
      this.introTimer = undefined;
      this.setCollapsed(true);
    }, 5000);
  }

  override setMap(map: OLMap | null) {
    this.stopIntro();
    const oldViewport = this.getMap()?.getViewport();
    oldViewport?.removeEventListener("pointerdown", this.dismissFromMap);
    oldViewport?.removeEventListener("wheel", this.dismissFromMap);
    super.setMap(map);
    const viewport = map?.getViewport();
    viewport?.addEventListener("pointerdown", this.dismissFromMap);
    viewport?.addEventListener("wheel", this.dismissFromMap, { passive: true });
  }

  protected override disposeInternal() {
    this.setMap(null);
    super.disposeInternal();
  }
}

export function createMapAttribution() {
  return new CompactMapAttribution();
}
