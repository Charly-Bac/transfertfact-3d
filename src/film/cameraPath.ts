// Chemin de caméra : chaque chapitre va de « a » à « b », puis un transit courbe
// (Bézier quadratique) rejoint le point « a » du chapitre suivant. Fonction pure de T.

import { Vector3 } from "three";
import { CH, TRANSIT, chapterAt, type TimedChapter } from "./chapters";
import { clamp, easeInOut } from "./math";

/** Recul global appliqué aux cadrages de la maquette. */
const ZOOM = 0.76;

export interface CameraPose {
  chapter: number;
  /** Vrai pendant le transit vers le chapitre suivant. */
  traveling: boolean;
}

const tmpA = { pos: new Vector3(), look: new Vector3() };
const tmpB = { pos: new Vector3(), look: new Vector3() };
const ctrl = new Vector3();

function keyPose(c: TimedChapter, which: "a" | "b", fitK: number, out: { pos: Vector3; look: Vector3 }) {
  const p = c.cam[which];
  const l = which === "a" ? c.cam.la : c.cam.lb;
  out.look.set(c.stationX + l[0], l[1], l[2]);
  // Recul le long de l'axe de visée, pour que le sujet tienne dans la zone visible.
  out.pos.set(c.stationX + p[0], p[1], p[2]).sub(out.look).multiplyScalar(fitK * ZOOM).add(out.look);
}

/**
 * Calcule la position et la cible de la caméra au temps T.
 * `noTransit` (mouvement réduit) : plan fixe par chapitre, sans travelling ni transit.
 */
export function cameraAt(T: number, fitK: number, outPos: Vector3, outLook: Vector3, noTransit = false): CameraPose {
  const c = chapterAt(T);
  const isLast = c.index === CH.length - 1;

  if (noTransit) {
    keyPose(c, "b", fitK, tmpB);
    outPos.copy(tmpB.pos);
    outLook.copy(tmpB.look);
    return { chapter: c.index, traveling: false };
  }

  const transitStart = c.end - TRANSIT;
  if (T < transitStart || isLast) {
    const u = clamp((T - c.start) / (isLast ? c.duration : c.duration - TRANSIT));
    // Mélange ease + linéaire : départ doux mais mouvement jamais figé.
    const e = easeInOut(u) * 0.55 + u * 0.45;
    keyPose(c, "a", fitK, tmpA);
    keyPose(c, "b", fitK, tmpB);
    outPos.lerpVectors(tmpA.pos, tmpB.pos, e);
    outLook.lerpVectors(tmpA.look, tmpB.look, e);
    return { chapter: c.index, traveling: false };
  }

  const u = easeInOut(clamp((T - transitStart) / TRANSIT));
  keyPose(c, "b", fitK, tmpA);
  keyPose(CH[c.index + 1], "a", fitK, tmpB);
  ctrl.copy(tmpA.pos).lerp(tmpB.pos, 0.5).add(new Vector3(0, 1.6, 1.2));
  const q = 1 - u;
  outPos
    .copy(tmpA.pos)
    .multiplyScalar(q * q)
    .addScaledVector(ctrl, 2 * q * u)
    .addScaledVector(tmpB.pos, u * u);
  outLook.lerpVectors(tmpA.look, tmpB.look, u);
  return { chapter: c.index, traveling: true };
}
