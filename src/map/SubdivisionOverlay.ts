import VectorLayer from "ol/layer/Vector.js";
import LayerGroup from "ol/layer/Group.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Stroke from "ol/style/Stroke.js";
import Fill from "ol/style/Fill.js";
import TextStyle from "ol/style/Text.js";
import type { MapFeature, MapLayerState } from "./types";

/** Replaceable vector linework and interior labels, independent of terrain pixels. */
export class SubdivisionOverlay {
  private readonly townBoundary = [
    new Style({
      stroke: new Stroke({ color: "rgba(252,252,242,.76)", width: 2.6 }),
    }),
    new Style({
      stroke: new Stroke({ color: "rgba(79,106,66,.78)", width: 1.0 }),
    }),
  ];
  private readonly zoneBoundary = [
    new Style({
      stroke: new Stroke({ color: "rgba(252,252,242,.78)", width: 2.5 }),
    }),
    new Style({
      stroke: new Stroke({
        color: "rgba(119,111,77,.8)",
        width: 1.0,
        lineDash: [5, 4],
      }),
    }),
  ];
  private readonly labelStyles = new Map<string, Style>();
  private readonly boundaries = new VectorLayer<VectorSource<MapFeature>>({
    properties: { role: "subdivision-boundaries" },
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: (feature) =>
      feature.get("kind") === "development-zone"
        ? this.zoneBoundary
        : this.townBoundary,
  });
  private readonly labels = new VectorLayer<VectorSource<MapFeature>>({
    properties: { role: "subdivision-labels" },
    declutter: true,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    renderOrder: (a, b) =>
      Number(a.get("kind") === "development-zone") -
      Number(b.get("kind") === "development-zone"),
    style: (feature) => this.labelStyles.get(String(feature.get("code"))),
  });
  readonly layer = new LayerGroup({
    properties: { role: "subdivision-overlay" },
    layers: [this.boundaries, this.labels],
    visible: false,
  });

  setFeatures(features: MapFeature[]) {
    this.labelStyles.clear();
    const places = features.filter((f) => f.get("role") === "label");
    for (const place of places) {
      const zone = place.get("kind") === "development-zone";
      this.labelStyles.set(
        String(place.get("code")),
        new Style({
          text: new TextStyle({
            text: place.get("label") || place.get("name"),
            font: `${zone ? "400 12px" : "500 14px"} "Microsoft YaHei", "PingFang SC", sans-serif`,
            padding: [2, 3, 2, 3],
            fill: new Fill({ color: zone ? "#70654a" : "#405438" }),
            stroke: new Stroke({ color: "rgba(251,251,242,.97)", width: 3.5 }),
          }),
        }),
      );
    }
    this.boundaries.setSource(
      new VectorSource({
        features: features.filter((f) => f.get("role") === "boundary"),
      }),
    );
    this.labels.setSource(new VectorSource({ features: places }));
  }

  updatePresentation(state: MapLayerState) {
    this.layer.setVisible(state.townships);
    this.boundaries.setVisible(state.boundaries);
    this.labels.setVisible(state.labels);
  }

  destroy() {
    this.labelStyles.clear();
    this.boundaries.dispose();
    this.labels.dispose();
    this.layer.dispose();
  }
}
