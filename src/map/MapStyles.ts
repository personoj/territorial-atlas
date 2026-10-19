import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import TextStyle from "ol/style/Text.js";
import CircleStyle from "ol/style/Circle.js";
import RegularShape from "ol/style/RegularShape.js";
import { smooth } from "./utils";
import type {
  MapFeature,
  PlaceFeature,
  MapLayerState,
  RegionEmphasis,
} from "./types";

const font = '"Microsoft YaHei", "PingFang SC", sans-serif';
export const CITY_TINTS = [
  [204, 217, 191, 0.24],
  [223, 230, 208, 0.28],
  [193, 209, 178, 0.22],
  [228, 232, 214, 0.28],
];
interface LabelStyle {
  style: Style;
  text: TextStyle;
  geometry: Point | null;
  marker: CircleStyle | null;
}

/** Map symbols and labels are independent from React and from UI CSS. */
export class MapStyles {
  private labelStyles = new WeakMap<PlaceFeature, LabelStyle>();
  private markerStyles = new Map<string, Style>();
  private boundaryStyles = new Map<string, Style>();
  private countyStyles = new Map<number, Style>();
  private focusBorders = new Map<number, Style[]>();
  constructor(
    private view: View,
    private state: () => MapLayerState,
    private emphasis: (regionId: string) => RegionEmphasis,
    private activeCity: () => number | undefined = () => undefined,
  ) {}
  isOriginalFeature(feature: MapFeature) {
    return this.state().original && feature.get("regionId") === "hubei";
  }
  private zoomOffset(feature: MapFeature) {
    return (
      this.emphasis(feature.get("regionId")).zoomOffset ??
      Number(feature.get("zoomOffset") || 0)
    );
  }
  cityBoundaryStyle(feature: MapFeature, res: number) {
    if (!this.state().boundaries || this.isOriginalFeature(feature))
      return undefined;
    const step = Math.round(
      smooth(
        ((this.view.getZoomForResolution(res) ?? 4) -
          5.9 -
          this.zoomOffset(feature)) /
          0.7,
      ) *
        this.emphasis(feature.get("regionId")).focus *
        100,
    );
    if (!step) return undefined;
    const tintIndex = feature.get("tintIndex"),
      key = `${tintIndex}:${step}`;
    if (!this.boundaryStyles.has(key)) {
      const tint = CITY_TINTS[tintIndex],
        alpha = step / 100;
      this.boundaryStyles.set(
        key,
        new Style({
          fill: new Fill({ color: [...tint.slice(0, 3), tint[3] * alpha] }),
          stroke: new Stroke({
            color: `rgba(91,115,79,${alpha * 0.83})`,
            width: 1.15,
          }),
        }),
      );
    }
    return this.boundaryStyles.get(key);
  }
  countyBoundaryStyle(feature: MapFeature, res: number) {
    if (
      !this.state().boundaries ||
      this.isOriginalFeature(feature) ||
      (this.view.getZoomForResolution(res) ?? 4) <=
        8.8 + this.zoomOffset(feature)
    )
      return undefined;
    const step = Math.round(this.emphasis(feature.get("regionId")).focus * 100);
    if (!step) return undefined;
    if (!this.countyStyles.has(step))
      this.countyStyles.set(
        step,
        new Style({
          stroke: new Stroke({
            color: `rgba(83,102,78,${(0.3 * step) / 100})`,
            width: 0.7,
            lineDash: [2, 5],
          }),
        }),
      );
    return this.countyStyles.get(step);
  }
  focusBorderStyle(feature: MapFeature, res: number) {
    const zoom = this.view.getZoomForResolution(res) ?? 4;
    const step = Math.round(
      this.emphasis(feature.get("regionId")).focus *
        smooth((zoom - 5.4 - this.zoomOffset(feature)) / 0.8) *
        100,
    );
    if (!step) return undefined;
    if (!this.focusBorders.has(step)) {
      const alpha = step / 100;
      this.focusBorders.set(step, [
        new Style({
          stroke: new Stroke({
            color: `rgba(248,249,238,${alpha * 0.94})`,
            width: 5,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: `rgba(65,91,64,${alpha * 0.95})`,
            width: 2.05,
          }),
        }),
      ]);
    }
    return this.focusBorders.get(step);
  }
  cityMarkerStyle(feature: PlaceFeature, res: number) {
    if (Number(feature.get("adcode")) === this.activeCity()) return undefined;
    if (!this.state().labels || this.isOriginalFeature(feature))
      return undefined;
    const capital = feature.get("capital");
    const emphasis = this.emphasis(feature.get("regionId"));
    const visibility =
      emphasis.focus +
      (capital && feature.get("contextLabel") ? emphasis.context * 0.3 : 0);
    if (!visibility) return undefined;
    const start =
      (!capital && feature.get("subdivisionLabel") === "区县" ? 7.9 : 6.0) +
      this.zoomOffset(feature);
    const step = Math.round(
      smooth(((this.view.getZoomForResolution(res) ?? 4) - start) / 0.6) *
        visibility *
        100,
    );
    if (!step) return undefined;
    const key = `${capital ? "capital" : "city"}:${step}`;
    if (!this.markerStyles.has(key)) {
      const symbol = capital
        ? new RegularShape({
            points: 5,
            radius: 5.5,
            radius2: 2.6,
            fill: new Fill({ color: "#52694a" }),
            stroke: new Stroke({ color: "#f6f5e9", width: 1.4 }),
          })
        : new CircleStyle({
            radius: 2.8,
            fill: new Fill({ color: "#51664a" }),
            stroke: new Stroke({ color: "#f6f5e9", width: 1.4 }),
          });
      symbol.setOpacity(step / 100);
      this.markerStyles.set(key, new Style({ image: symbol }));
    }
    return this.markerStyles.get(key);
  }
  labelStyle(f: PlaceFeature, res: number) {
    if (
      this.activeCity() &&
      (f.get("level") === "county" ||
        Number(f.get("adcode")) === this.activeCity())
    )
      return undefined;
    if (!this.state().labels || this.isOriginalFeature(f)) return undefined;
    const level = f.get("level"),
      zoom = this.view.getZoomForResolution(res) ?? 4,
      zoomOffset = this.zoomOffset(f),
      capital = f.get("capital"),
      city = level === "city",
      small = level === "county";
    const province = level === "province";
    const emphasis = this.emphasis(f.get("regionId"));
    const focusFade = 1 - smooth((zoom - 5.8 - zoomOffset) / 0.7);
    const provinceContext = emphasis.overview
      ? 1
      : 0.48 + emphasis.context * 0.28;
    const alpha = province
      ? emphasis.focus * focusFade + (1 - emphasis.focus) * provinceContext
      : small
        ? smooth((zoom - 8.6 - zoomOffset) / 0.6) * emphasis.focus
        : smooth((zoom - 6.0 - zoomOffset) / 0.6) *
          (emphasis.focus +
            (f.get("contextLabel") ? emphasis.context * 0.34 : 0));
    if (alpha <= 0) return undefined;
    let cached = this.labelStyles.get(f);
    if (!cached) {
      const text = new TextStyle({
        text: province
          ? f
              .get("name")
              .replace(
                /壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区|省|市/g,
                "",
              )
          : f.get("name"),
        fill: new Fill(),
        stroke: new Stroke({ width: 3 }),
        padding: province ? [4, 5, 4, 5] : [3, 4, 3, 4],
      });
      const style = new Style({ text });
      const geometry = city
        ? new Point(f.getGeometry()!.getCoordinates())
        : null;
      if (geometry) style.setGeometry(geometry);
      const marker = small
        ? new CircleStyle({
            radius: 2,
            fill: new Fill({ color: "#75816a" }),
            stroke: new Stroke({ color: "#f6f5e9", width: 1.6 }),
          })
        : null;
      if (marker) style.setImage(marker);
      cached = { style, text, geometry, marker };
      this.labelStyles.set(f, cached);
    }
    if (province) {
      cached.text.setFont(`500 ${zoom < 5 ? 12 : 16}px ${font}`);
      cached.text.getFill()!.setColor(`rgba(91,111,80,${alpha})`);
      cached.text.getStroke()!.setColor(`rgba(246,247,237,${alpha * 0.9})`);
    } else {
      const seatMix =
        f.get("municipality") || f.get("seatLabel")
          ? 1
          : smooth((zoom - 7.6 - zoomOffset) / 0.8);
      if (city) {
        const seat = f.getGeometry()!.getCoordinates(),
          area = (f.get("areaCenter") as Point).getCoordinates();
        cached.geometry!.setCoordinates(
          area.map((v, i) => v * (1 - seatMix) + seat[i] * seatMix),
        );
      }
      const size = capital
        ? 15
        : small
          ? 12
          : f.get("subdivisionLabel") === "区县"
            ? 13
            : 14;
      cached.text.setFont(`${capital ? 600 : 500} ${size}px ${font}`);
      cached.text.setOffsetY(city ? (capital ? -18 : -14) * seatMix : -12);
      cached.text.getFill()!.setColor(`rgba(64,84,56,${alpha})`);
      cached.text.getStroke()!.setColor(`rgba(248,248,237,${alpha * 0.94})`);
      if (cached.marker) cached.marker.setOpacity(alpha);
    }
    return cached.style;
  }
}
