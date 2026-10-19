import { useRef } from "react";
import { usePlanningMap } from "../hooks/usePlanningMap";
import { MapCanvas } from "../components/MapCanvas";
import { MapToolbar } from "../components/MapToolbar";

export function App() {
  const container = useRef<HTMLElement>(null);
  const {
    map,
    loading,
    error,
    locationName,
    navigation,
    cityDetail,
    countyDetail,
    layers,
  } = usePlanningMap(container);
  const detail = countyDetail?.id ? countyDetail : cityDetail;
  const status =
    error ||
    detail?.error ||
    (loading
      ? "正在载入地图…"
      : detail?.loading
        ? `正在载入${detail.name}…`
        : "");

  return (
    <>
      <MapCanvas containerRef={container} locationName={locationName} />
      <MapToolbar
        disabled={!map}
        onZoom={(delta) => map?.zoomBy(delta)}
        onNational={() => map?.fitNational()}
        parentName={
          navigation.level === "city" || navigation.level === "county"
            ? navigation.parentName
            : undefined
        }
        onParent={() => map?.fitParent()}
        townshipsAvailable={layers?.townshipsAvailable ?? false}
        townshipsVisible={layers?.townships ?? true}
        onToggleTownships={() => map?.setTownships(!layers?.townships)}
      />
      {status && (
        <div id="load-status" role="status">
          {status}
        </div>
      )}
    </>
  );
}
