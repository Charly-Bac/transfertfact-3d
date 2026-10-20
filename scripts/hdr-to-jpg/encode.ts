import { encodeAndCompress, findTextureMinMax } from "@monogrid/gainmap-js/encode";
import { encodeJPEGMetadata } from "@monogrid/gainmap-js/libultrahdr";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

declare global {
  interface Window {
    convertHdr: (url: string, quality: number) => Promise<string>;
  }
}

window.convertHdr = async (url, quality) => {
  const image = await new HDRLoader().loadAsync(url);
  const textureMax = findTextureMinMax(image);
  const result = await encodeAndCompress({
    image,
    maxContentBoost: Math.max(...textureMax),
    mimeType: "image/jpeg",
    quality,
    flipY: true,
  });
  const jpeg = encodeJPEGMetadata({ ...result, sdr: result.sdr, gainMap: result.gainMap });
  let bin = "";
  for (let i = 0; i < jpeg.length; i++) bin += String.fromCharCode(jpeg[i]);
  return btoa(bin);
};
