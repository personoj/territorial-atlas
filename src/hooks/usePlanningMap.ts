import { useEffect, useState, type RefObject } from "react";
import { GeographicPlanningMap } from "../map";
import type {
  MapViewState,
  MapNavigation,
  DetailLoadState,
  MapLayerState,
} from "../map";
import { MAP_ASSET_BASE } from "../config/assets";

/** Owns the map lifetime; React renders UI without driving individual map frames. */
export function usePlanningMap(container: RefObject<HTMLElement | null>) {
  const [map, setMap] = useState<GeographicPlanningMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("全国");
  const [layers, setLayers] = useState<MapLayerState | null>(null);
  const [navigation, setNavigation] = useState<MapNavigation>({
    id: "national",
    name: "全国",
    level: "national",
  });
  const [cityDetail, setCityDetail] = useState<DetailLoadState | null>(null);
  const [countyDetail, setCountyDetail] = useState<DetailLoadState | null>(
    null,
  );

  useEffect(() => {
    if (!container.current) return;
    setMap(null);
    setError(null);
    setLocationName("全国");
    setLayers(null);
    setNavigation({ id: "national", name: "全国", level: "national" });
    setCityDetail(null);
    setCountyDetail(null);
    delete document.body.dataset.ready;
    delete document.body.dataset.error;
    const instance = new GeographicPlanningMap(container.current, {
      assetBase: MAP_ASSET_BASE,
    });
    const initialRegion = window.location.hash.slice(1);
    let cancelled = false;
    const cleanups: (() => void)[] = [];
    const restoreHash = (id: string, animate = true) => {
      if (id && instance.fitLocation(id, animate)) return;
      instance.fitNational(animate);
    };
    const updateView = (view: MapViewState) => {
      document.body.dataset.zoom = view.zoom.toFixed(3);
      document.body.dataset.center = JSON.stringify(view.center);
    };

    instance
      .initialize()
      .then(() => {
        if (cancelled) return;
        cleanups.push(
          instance.on("locationchange", (detail) =>
            setLocationName(detail.name),
          ),
          instance.on("viewchange", updateView),
          instance.on("asseterror", (detail) => {
            // Keep the navigable national map when a single optional detail fails.
            document.body.dataset.detailError = `${detail.regionId}:${detail.resource}`;
            console.warn(detail.message);
          }),
          instance.on("detailchange", () => {
            delete document.body.dataset.detailError;
          }),
          instance.on("citydetailchange", setCityDetail),
          instance.on("countydetailchange", setCountyDetail),
          instance.on("layerchange", setLayers),
          instance.on("navigationchange", (detail) => {
            setNavigation(detail);
            setLayers(instance.getLayerState());
            const id = detail.id;
            history.replaceState(
              null,
              "",
              `${location.pathname}${location.search}#${id}`,
            );
          }),
        );
        const onHashChange = () => restoreHash(window.location.hash.slice(1));
        window.addEventListener("hashchange", onHashChange);
        cleanups.push(() =>
          window.removeEventListener("hashchange", onHashChange),
        );
        restoreHash(initialRegion, false);
        setLayers(instance.getLayerState());
        updateView(instance.getViewState());
        setMap(instance);
        document.body.dataset.ready = "true";
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        const message = cause instanceof Error ? cause.message : "地图加载失败";
        setError(message);
        document.body.dataset.error = message;
        console.error(cause);
      });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      instance.destroy();
      delete document.body.dataset.ready;
      delete document.body.dataset.error;
      delete document.body.dataset.detailError;
    };
  }, [container]);

  return {
    map,
    error,
    locationName,
    navigation,
    cityDetail,
    countyDetail,
    layers,
    loading: !map && !error,
  };
}
