// Logos des PA : uniquement les fichiers fournis (assets/logos/ → public/logos/).

import { PLATFORMS } from "../film/data";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Logo introuvable : ${src}`));
    img.src = src;
  });
}

/** Images des logos, dans l'ordre de PLATFORMS (à lire avec `use()`). */
export const logosReady: Promise<HTMLImageElement[]> = Promise.all(
  PLATFORMS.map((p) => loadImage(`${import.meta.env.BASE_URL}logos/${p.logo}.png`)),
);
