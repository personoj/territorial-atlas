import type View from "ol/View.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import TextStyle from "ol/style/Text.js";
import type { MapFeature } from "./types";
import { smooth } from "./utils";

const font = '"Microsoft YaHei", "PingFang SC", sans-serif';

/** Native geographic context, kept below China's artwork and interaction layers. */
export class SurroundingContext {
  readonly baseLayer: VectorLayer<VectorSource<MapFeature>>;
  readonly lineLayer: VectorLayer<VectorSource<MapFeature>>;
  readonly labelLayer: VectorLayer<VectorSource<MapFeature>>;
  private labelStyles = new WeakMap<MapFeature, Style>();

  constructor(
    features: MapFeature[],
    private view: View,
  ) {
    const sourceFor = (...kinds: string[]) =>
      new VectorSource({
        features: features.filter((feature) =>
          kinds.includes(feature.get("kind")),
        ),
        wrapX: false,
      });
    const ocean = new Style({ fill: new Fill({ color: "#dce9eb" }) });
    const land = new Style({ fill: new Fill({ color: "#eceee3" }) });
    const coast = new Style({
      stroke: new Stroke({ color: "#a5b7af", width: 0.8 }),
    });
    const boundary = new Style({
      stroke: new Stroke({ color: "#a3af9d", width: 0.75 }),
    });
    const disputed = new Style({
      stroke: new Stroke({ color: "#a3af9d", width: 0.7, lineDash: [3, 3] }),
    });
    this.baseLayer = new VectorLayer({
      source: sourceFor("ocean", "land"),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: (feature) => (feature.get("kind") === "ocean" ? ocean : land),
    });
    this.lineLayer = new VectorLayer({
      source: sourceFor("coast", "boundary"),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: (feature) =>
        feature.get("kind") === "coast"
          ? coast
          : feature.get("disputed")
            ? disputed
            : boundary,
    });
    this.labelLayer = new VectorLayer({
      source: sourceFor("country-label", "sea-label"),
      declutter: true,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      renderOrder: (a, b) => Number(a.get("rank")) - Number(b.get("rank")),
      style: (feature, resolution) =>
        this.labelStyle(feature as MapFeature, resolution),
    });
  }

  private labelStyle(feature: MapFeature, resolution: number) {
    const zoom = this.view.getZoomForResolution(resolution) ?? 4;
    const alpha =
      smooth((zoom - Number(feature.get("minZoom"))) / 0.55) *
      (1 - smooth((zoom - Number(feature.get("maxZoom"))) / 0.8));
    if (alpha < 0.01) return undefined;
    const sea = feature.get("kind") === "sea-label";
    let style = this.labelStyles.get(feature);
    if (!style) {
      const name = feature.get("name") as string;
      style = new Style({
        text: new TextStyle({
          text: sea || feature.get("major") ? [...name].join(" ") : name,
          font: `${feature.get("major") ? 14 : 12}px ${font}`,
          fill: new Fill(),
          stroke: new Stroke({ width: 2.5 }),
          padding: [5, 7, 5, 7],
        }),
      });
      this.labelStyles.set(feature, style);
    }
    style
      .getText()!
      .getFill()!
      .setColor(sea ? [111, 145, 150, alpha] : [124, 139, 113, alpha]);
    style
      .getText()!
      .getStroke()!
      .setColor(
        sea ? [236, 244, 244, alpha * 0.75] : [248, 248, 238, alpha * 0.85],
      );
    return style;
  }

  update(focus: number, labelsVisible: boolean) {
    this.lineLayer.setOpacity(0.76 - focus * 0.24);
    this.labelLayer.setOpacity(0.9 - focus * 0.24);
    this.labelLayer.setVisible(labelsVisible);
  }
}
