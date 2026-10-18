import { useEffect, useRef, useState } from "react";
import { usePlanningMap } from "../hooks/usePlanningMap";
import { usePlaceSearch } from "../hooks/usePlaceSearch";
import { MapCanvas } from "../components/MapCanvas";
import { PlaceSearch } from "../components/PlaceSearch";
import { MapToolbar } from "../components/MapToolbar";
import { LayersPanel } from "../components/LayersPanel";
import { AboutDialog } from "../components/AboutDialog";

export function App() {
  const container = useRef<HTMLElement>(null);
  const { map, loading, error, locationName, layers } =
    usePlanningMap(container);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const results = usePlaceSearch(map, query);
  const closeOverlays = () => {
    setSearchOpen(false);
    setLayersOpen(false);
  };
  const clearSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setLayersOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <MapCanvas
        containerRef={container}
        onInteract={() => {
          closeOverlays();
          setHintVisible(false);
        }}
      />
      <PlaceSearch
        query={query}
        open={searchOpen}
        disabled={!map}
        results={results}
        onQueryChange={setQuery}
        onOpenChange={setSearchOpen}
        onSelect={(result) => {
          map?.focusPlace(result.feature);
          setQuery(result.name);
          setSearchOpen(false);
        }}
      />
      <MapToolbar
        disabled={!map}
        layersOpen={layersOpen}
        onZoom={(delta) => map?.zoomBy(delta)}
        onHubei={() => {
          map?.fitHubei();
          clearSearch();
        }}
        onNational={() => {
          map?.fitNational();
          clearSearch();
        }}
        onLayers={() => setLayersOpen((open) => !open)}
      />
      <LayersPanel
        open={layersOpen}
        layers={layers}
        onClose={() => setLayersOpen(false)}
        onPlanning={(value) => map?.setPlanning(value)}
        onLabels={(value) => map?.setLabels(value)}
        onBoundaries={(value) => map?.setBoundaries(value)}
        onOriginal={(value) => map?.setOriginal(value)}
      />
      <div className="bottom-info">
        <span id="location-label">{locationName}</span>
        <span className="info-dot">·</span>
        <span id="texture-label">
          {layers.original ? "湖北规划原图" : "灰绿山水"}
        </span>
        <button
          id="about-button"
          aria-label="查看样板说明"
          title="样板说明"
          onClick={() => setAboutOpen(true)}
        >
          ⓘ
        </button>
      </div>
      <div id="gesture-hint" style={{ opacity: hintVisible ? 1 : 0 }}>
        滚轮缩放 · 拖动浏览 · 点击区域定位
      </div>
      {(loading || error) && (
        <div id="load-status" role="status">
          {error || "正在载入地图…"}
        </div>
      )}
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
