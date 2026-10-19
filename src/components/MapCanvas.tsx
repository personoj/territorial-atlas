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
      aria-label={`${locationName}地图，点击省份切换，支持缩放和拖动`}
    />
  );
}
