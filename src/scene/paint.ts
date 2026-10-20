// Textures dessinées en canvas (écrans, factures, étiquettes) aux couleurs du site.

import { CanvasTexture, SRGBColorSpace } from "three";

export const CS = {
  green: "#4aac35",
  greenD: "#3c940c",
  teal: "#4ebbb7",
  tealD: "#086666",
  yellow: "#ffd43a",
  ink: "#444444",
  text: "#6a6a6a",
  line: "#e2eae5",
  mist: "#f2f7f4",
  print: "#1d2120",
  printSoft: "#5d6360",
};

export const FT = '"Sometype Mono",ui-monospace,Menlo,monospace';
export const FB = '"Roboto",system-ui,sans-serif';

/** Polices chargées avant de dessiner les textures (sinon le canvas utilise une police de repli). */
export const fontsReady: Promise<void> = Promise.race([
  Promise.all(
    [`700 60px ${FT}`, `500 60px ${FT}`, `400 30px ${FT}`, `300 30px ${FB}`, `400 30px ${FB}`, `500 30px ${FB}`, `700 30px ${FB}`].map((f) =>
      document.fonts.load(f),
    ),
  ).then(() => undefined),
  new Promise<void>((r) => setTimeout(r, 2500)),
]).catch(() => undefined);

export type Ctx = CanvasRenderingContext2D;

export function roundRect(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Grain de papier très léger, déterministe. */
export function grain(g: Ctx, w: number, h: number, amount: number, seed = 7) {
  const id = g.getImageData(0, 0, w, h);
  const d = id.data;
  let s = seed;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 16807) % 2147483647;
    const n = ((s / 2147483647) - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(id, 0, 0);
}

/** Texture canvas redessinable : `redraw(state)` ne repeint que si l'état change. */
export interface PaintedTexture<S> extends CanvasTexture {
  redraw: (state: S) => void;
}

export function paintTexture<S = void>(w: number, h: number, draw: (g: Ctx, w: number, h: number, state: S) => void, initial?: S): PaintedTexture<S> {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: false })!;
  const t = new CanvasTexture(c) as PaintedTexture<S>;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  let current: S | undefined;
  let drawn = false;
  t.redraw = (state: S) => {
    if (drawn && state === current) return;
    drawn = true;
    current = state;
    draw(g, w, h, state);
    t.needsUpdate = true;
  };
  t.redraw(initial as S);
  return t;
}
