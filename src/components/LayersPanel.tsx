import type { MapLayerState } from "../map";

interface Props {
  open: boolean;
  layers: MapLayerState;
  onClose: () => void;
  onPlanning: (visible: boolean) => void;
  onLabels: (visible: boolean) => void;
  onBoundaries: (visible: boolean) => void;
  onOriginal: (original: boolean) => void;
}

export function LayersPanel({
  open,
  layers,
  onClose,
  onPlanning,
  onLabels,
  onBoundaries,
  onOriginal,
}: Props) {
  return (
    <section
      id="layers-panel"
      className="floating-panel"
      aria-label="地图图层"
      hidden={!open}
    >
      <div className="panel-heading">
        图层
        <button id="close-layers" aria-label="关闭图层" onClick={onClose}>
          ×
        </button>
      </div>
      <label>
        <input
          id="planning-toggle"
          type="checkbox"
          checked={layers.planning}
          onChange={(event) => onPlanning(event.target.checked)}
        />
        <span>省域地形细节</span>
      </label>
      <label>
        <input
          id="labels-toggle"
          type="checkbox"
          checked={layers.labels}
          onChange={(event) => onLabels(event.target.checked)}
        />
        <span>地名与城市标记</span>
      </label>
      <label>
        <input
          id="boundaries-toggle"
          type="checkbox"
          checked={layers.boundaries}
          onChange={(event) => onBoundaries(event.target.checked)}
        />
        <span>市县分区与边界</span>
      </label>
      <div className="variant-tabs" aria-label="底图素材">
        <button
          id="clean-variant"
          aria-pressed={!layers.original}
          onClick={() => onOriginal(false)}
        >
          灰绿山水
        </button>
        <button
          id="original-variant"
          aria-pressed={layers.original}
          disabled={!layers.originalAvailable}
          title="定位湖北后可查看原稿对照"
          onClick={() => onOriginal(true)}
        >
          湖北原图
        </button>
      </div>
      <div className="map-legend">
        <span>
          <i className="capital-symbol">★</i>省会 / 直辖市
        </span>
        <span>
          <i className="city-symbol" />
          城市 / 区县
        </span>
      </div>
      <p className="layer-note">放大后，省域地形与市县分区逐渐显现。</p>
    </section>
  );
}
