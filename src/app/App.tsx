import { useRef } from "react";
import { usePlanningMap } from "../hooks/usePlanningMap";
import { MapCanvas } from "../components/MapCanvas";
import { MapToolbar } from "../components/MapToolbar";

export function App() {
  const container = useRef<HTMLElement>(null);
  const { map, loading, error, locationName } = usePlanningMap(container);

  return (
    <>
      <MapCanvas containerRef={container} locationName={locationName} />
      <MapToolbar
        disabled={!map}
        onZoom={(delta) => map?.zoomBy(delta)}
        onNational={() => map?.fitNational()}
      />
      {(loading || error) && (
        <div id="load-status" role="status">
          {error || "正在载入地图…"}
        </div>
      )}
    </>
  );
}
