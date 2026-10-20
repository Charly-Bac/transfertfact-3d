// Pilote la caméra depuis le temps du film et exclut la zone de texte du cadre
// (décalage de vue : le sujet est centré dans la partie visible à droite, ou au-dessus sur mobile).

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { cameraAt } from "../film/cameraPath";
import { film, prefersReducedMotion } from "../film/clock";

/** Point visé par la caméra, partagé avec la profondeur de champ et la lumière principale. */
export const focusTarget = new Vector3();

const MOBILE_BREAKPOINT = 820;

export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const fitK = useRef(1);
  const pos = useRef(new Vector3());

  // Le cadrage dépend de la taille du texte : on le recalcule au redimensionnement et à chaque chapitre.
  useEffect(() => {
    const apply = () => {
      const W = Math.max(1, size.width);
      const H = Math.max(1, size.height);
      const copy = document.getElementById("copy");
      const stage = document.getElementById("stage");
      (camera as PerspectiveCamera & { manual?: boolean }).manual = true;
      let visibleAspect: number;
      if (copy && stage) {
        const sr = stage.getBoundingClientRect();
        const cr = copy.getBoundingClientRect();
        if (W <= MOBILE_BREAKPOINT) {
          const offY = Math.max(0, Math.min(H * 0.6, sr.bottom - cr.top + 8));
          camera.aspect = W / (H + offY);
          camera.setViewOffset(W, H + offY, 0, offY, W, H);
          visibleAspect = W / Math.max(1, H - offY);
        } else {
          const offX = Math.min(W * 0.42, cr.right - sr.left + 30);
          camera.aspect = (W + offX) / H;
          camera.setViewOffset(W + offX, H, 0, 0, W, H);
          visibleAspect = (W - offX) / H;
        }
      } else {
        camera.aspect = W / H;
        camera.clearViewOffset();
        visibleAspect = W / H;
      }
      camera.updateProjectionMatrix();
      // Recul supplémentaire quand la zone visible est étroite (portrait, petites fenêtres).
      fitK.current = Math.max(1, 1.2 / Math.max(0.35, visibleAspect));
    };
    apply();
    const unsub = film.subscribe(() => requestAnimationFrame(apply));
    return () => void unsub();
  }, [camera, size.width, size.height]);

  useFrame(() => {
    cameraAt(film.T, fitK.current, pos.current, focusTarget, prefersReducedMotion);
    camera.position.copy(pos.current);
    camera.lookAt(focusTarget);
  });

  return null;
}
