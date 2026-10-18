interface Props {
  disabled: boolean;
  layersOpen: boolean;
  onZoom: (delta: number) => void;
  onHubei: () => void;
  onNational: () => void;
  onLayers: () => void;
}

export function MapToolbar({
  disabled,
  layersOpen,
  onZoom,
  onHubei,
  onNational,
  onLayers,
}: Props) {
  return (
    <div className="map-tools" aria-label="地图工具">
      <button
        id="zoom-in"
        title="放大"
        aria-label="放大"
        disabled={disabled}
        onClick={() => onZoom(1)}
      >
        ＋
      </button>
      <button
        id="zoom-out"
        title="缩小"
        aria-label="缩小"
        disabled={disabled}
        onClick={() => onZoom(-1)}
      >
        −
      </button>
      <span className="tool-divider" />
      <button
        id="home-hubei"
        title="定位湖北"
        aria-label="定位湖北"
        disabled={disabled}
        onClick={onHubei}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        id="home-national"
        title="全国视野"
        aria-label="全国视野"
        disabled={disabled}
        onClick={onNational}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <ellipse cx="12" cy="12" rx="3.5" ry="8" />
          <path d="M4 12h16" />
        </svg>
      </button>
      <span className="tool-divider" />
      <button
        id="layers-button"
        title="图层"
        aria-label="图层"
        aria-expanded={layersOpen}
        disabled={disabled}
        onClick={onLayers}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 4 9 5-9 5-9-5 9-5Z M3 13l9 5 9-5M3 17l9 5 9-5" />
        </svg>
      </button>
    </div>
  );
}
