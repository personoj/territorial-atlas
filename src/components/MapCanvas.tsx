import type { RefObject } from "react";

interface Props {
  containerRef: RefObject<HTMLElement | null>;
  locationName: string;
}

export function MapCanvas({ containerRef, locationName }: Props) {
  return (
    <main
      id="geographic-map"
      ref={containerRef}
      tabIndex={0}
      aria-label={`${locationName}地图，支持区域下钻、缩放和拖动`}
    />
  );
}
