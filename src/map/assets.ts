import type { Extent } from "ol/extent.js";
import type { ImageObject } from "ol/Image.js";

/** Asset requests belong to the map instance and stop when its host unmounts. */
export async function readMapJSON<T>(
  url: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`无法加载地图资料：${url}`);
  const data = (await response.json()) as T;
  signal.throwIfAborted();
  return data;
}

export interface DecodedMapImage {
  image: ImageBitmap | HTMLImageElement;
  dispose: () => void;
}

/** Match ImageStatic's native-pixel georeferencing, independent of view zoom/DPR. */
export function staticMapImage(
  image: DecodedMapImage["image"],
  extent: Extent,
): ImageObject {
  const resolutionX = (extent[2] - extent[0]) / image.width;
  const resolutionY = (extent[3] - extent[1]) / image.height;
  return {
    image,
    extent,
    resolution:
      resolutionX === resolutionY ? resolutionY : [resolutionX, resolutionY],
    pixelRatio: 1,
  };
}

/** Decode only requested province images and release their pixels on cache eviction. */
export async function decodeMapImage(
  url: string,
  signal: AbortSignal,
): Promise<DecodedMapImage> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`无法加载地图贴图：${url}`);
  const blob = await response.blob();
  signal.throwIfAborted();
  if (typeof createImageBitmap === "function") {
    const image = await createImageBitmap(blob);
    if (signal.aborted) {
      image.close();
      signal.throwIfAborted();
    }
    return { image, dispose: () => image.close() };
  }
  const objectURL = URL.createObjectURL(blob);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        signal.removeEventListener("abort", abort);
        image.onload = null;
        image.onerror = null;
      };
      const abort = () => {
        cleanup();
        image.src = "";
        reject(new DOMException("地图已卸载", "AbortError"));
      };
      signal.addEventListener("abort", abort, { once: true });
      image.onload = () => {
        cleanup();
        resolve();
      };
      image.onerror = () => {
        cleanup();
        reject(new Error(`无法解码地图贴图：${url}`));
      };
      image.src = objectURL;
    });
    signal.throwIfAborted();
    return {
      image,
      dispose: () => {
        image.src = "";
        URL.revokeObjectURL(objectURL);
      },
    };
  } catch (error) {
    image.src = "";
    URL.revokeObjectURL(objectURL);
    throw error;
  }
}

export function preloadMapImage(
  url: string,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      signal.removeEventListener("abort", abort);
      image.onload = null;
      image.onerror = null;
    };
    const abort = () => {
      cleanup();
      image.src = "";
      reject(new DOMException("地图已卸载", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
    image.onload = () => {
      cleanup();
      resolve();
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`无法加载地图贴图：${url}`));
    };
    image.src = url;
  });
}
