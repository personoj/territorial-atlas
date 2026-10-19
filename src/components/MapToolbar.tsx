interface Props {
  disabled: boolean;
  onZoom: (delta: number) => void;
  onNational: () => void;
}

export function MapToolbar({ disabled, onZoom, onNational }: Props) {
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
        id="home-national"
        title="返回全国"
        aria-label="返回全国"
        disabled={disabled}
        onClick={onNational}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <ellipse cx="12" cy="12" rx="3.5" ry="8" />
          <path d="M4 12h16" />
        </svg>
      </button>
    </div>
  );
}
