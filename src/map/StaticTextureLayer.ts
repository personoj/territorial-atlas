import ImageLayer from "ol/layer/Image.js";
import type { Options } from "ol/layer/BaseImage.js";
import type ImageSource from "ol/source/Image.js";
import CanvasImageLayerRenderer from "ol/renderer/canvas/ImageLayer.js";
import type { FrameState } from "ol/Map.js";

/** Static decoded art is safe to bind during camera movement; it never issues view-dependent requests. */
class StaticTextureRenderer extends CanvasImageLayerRenderer {
  private preparedSource: ImageSource | null = null;
  constructor(private textureLayer: StaticTextureLayer) {
    super(textureLayer);
  }

  override prepareFrame(frame: FrameState) {
    const source = this.textureLayer.getSource();
    if (source !== this.preparedSource) {
      // Do not retain a released bitmap when an LRU slot receives a new source.
      this.image = null;
      this.preparedSource = source;
    }
    // The default image renderer defers a new image until animation ends (appropriate for WMS).
    // Only this already-decoded static texture renderer bypasses that gate; the shared frame stays intact.
    const ready = super.prepareFrame(
      frame.viewHints[0] || frame.viewHints[1]
        ? { ...frame, viewHints: [0, 0] }
        : frame,
    );
    if (ready && source) this.textureLayer.markPrepared(source);
    return ready;
  }
}

export class StaticTextureLayer extends ImageLayer<ImageSource> {
  private drawableSource: ImageSource | null = null;
  constructor(
    options: Options<ImageSource>,
    private onFirstPrepared: () => void,
  ) {
    super(options);
  }

  override createRenderer() {
    return new StaticTextureRenderer(this);
  }

  override setSource(source: ImageSource | null) {
    if (source !== this.getSource()) this.drawableSource = null;
    super.setSource(source);
  }

  markPrepared(source: ImageSource) {
    if (source !== this.getSource() || source === this.drawableSource) return;
    this.drawableSource = source;
    this.onFirstPrepared();
  }
}
