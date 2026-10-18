import type { RefObject } from "react";

interface Props {
  containerRef: RefObject<HTMLElement | null>;
  onInteract: () => void;
}

export function MapCanvas({ containerRef, onInteract }: Props) {
  return (
    <main
      id="geographic-map"
      ref={containerRef}
      tabIndex={0}
      aria-label="可连续缩放和拖动的省域地理地图"
      onPointerDown={onInteract}
      onWheel={onInteract}
    />
  );
}
