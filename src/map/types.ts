import type Feature from "ol/Feature.js";
import type Geometry from "ol/geom/Geometry.js";
import type Point from "ol/geom/Point.js";
import type { Extent } from "ol/extent.js";
import type { Coordinate } from "ol/coordinate.js";

export type MapFeature = Feature<Geometry>;
export type PlaceFeature = Feature<Point>;

export interface RegionInfo {
  id: string;
  name: string;
  adcode: number;
  available: boolean;
}

export interface RegionDefinition extends RegionInfo {
  capitalAdcode: number;
  capitalCenter?: Coordinate;
  image: string;
  /** Same transparent geography as image, downsampled for neighboring context only. */
  contextImage?: string;
  neighbors?: string[];
  extent: Extent;
  cities: string;
  counties?: string;
  subdivisionLabel: string;
  /** Optional camera bounds, in EPSG:3857; may exclude remote island groups. */
  focusExtent?: Extent;
  transitionZoom?: [number, number];
  maxZoom?: number;
  cityFocusZoom?: number;
  countyFocusZoom?: number;
  capitalName?: string;
  capitalKind?: string;
}

export interface RegionRegistry {
  version: number;
  placeIndex?: string;
  cityDetails?: string;
  regions: Omit<RegionDefinition, "available">[];
}

export interface DetailDefinition {
  id: string;
  name: string;
  adcode: number;
  level: "city" | "county";
  parentId: string;
  parentName: string;
  provinceId: string;
  image: string;
  geometry: string;
  /** Optional separate GeoJSON with boundary lines and interior name anchors. */
  subdivisionOverlay?: string;
  extent: Extent;
  focusExtent?: Extent;
  maxZoom: number;
}

export interface MapNavigation {
  id: string;
  name: string;
  level: "national" | "province" | "city" | "county";
  parentId?: string;
  parentName?: string;
}

export interface DetailLoadState {
  id: string | null;
  name: string;
  loading: boolean;
  ready: boolean;
  error?: string;
}

/** Compatibility for hosts that already consume the city loading event. */
export type CityDetailState = DetailLoadState;

export interface IndexedPlace {
  regionId: string;
  adcode: number;
  name: string;
  shortName?: string;
  level: "city" | "county";
  /** WGS84 administrative-seat coordinate. */
  center: Coordinate;
  /** WGS84 interior point of the largest projected polygon. */
  areaCenter?: Coordinate;
}

export interface PlaceIndex {
  version: number;
  places: IndexedPlace[];
}

export interface MapMetadata {
  extent: Extent;
  [key: string]: unknown;
}

export interface MapStyleConfig {
  chinaExtent: Extent;
  transitionZoom: [number, number];
}

export interface MapLayerState {
  labels: boolean;
  boundaries: boolean;
  townships: boolean;
  townshipsAvailable: boolean;
  planning: boolean;
  original: boolean;
  originalAvailable: boolean;
}

export interface RegionEmphasis {
  focus: number;
  context: number;
  overview: boolean;
  zoomOffset: number;
}

export interface MapViewState {
  center: Coordinate;
  zoom: number;
  resolution: number;
  detailOpacity: number;
  activeRegionId: string | null;
  activeCityId: string | null;
  activeCountyId: string | null;
}

export interface MapLocation {
  id?: string;
  name: string;
  adcode: number;
  level: "national" | "province" | "city" | "county";
  regionName?: string;
  regionAdcode?: number;
}

export interface MapEvents {
  ready: MapMetadata & { regions: RegionDefinition[] };
  viewchange: MapViewState;
  regionchange: RegionInfo;
  locationchange: MapLocation;
  navigationchange: MapNavigation;
  citydetailchange: CityDetailState;
  countydetailchange: DetailLoadState;
  layerchange: MapLayerState;
  layerschange: MapLayerState;
  mapclick: { coordinate: Coordinate };
  asseterror: { regionId: string; resource: string; message: string };
  detailchange: {
    regionId: string;
    resource: "texture" | "context" | "cities" | "counties";
  };
}

export interface SearchResult {
  feature: PlaceFeature;
  name: string;
  description: string;
  key: string;
}
