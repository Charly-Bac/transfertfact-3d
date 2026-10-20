// Canvas 3D. Rendu à la demande : chaque avancée de l'horloge du film demande une image,
// donc rien n'est recalculé quand le film est en pause ou l'onglet masqué.

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { PCFSoftShadowMap } from "three";
import { film } from "../film/clock";
import { AssetBoard, showAssetBoard } from "./AssetBoard";
import { CameraRig } from "./CameraRig";
import { Desk } from "./Desk";
import { Effects } from "./Effects";
import { MAX_DPR, quality, useQualityLevel } from "./quality";
import { Stations } from "./Stations";
import { Studio } from "./Studio";

function FilmInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => film.onTick(() => invalidate()), [invalidate]);
  return null;
}

export function Scene({ onReady }: { onReady: () => void }) {
  const level = useQualityLevel();
  const dpr = level === 0 ? 1 : Math.min(MAX_DPR, window.devicePixelRatio || 1);

  return (
    <Canvas
      className="gl"
      frameloop="demand"
      dpr={dpr}
      flat
      shadows={{ type: PCFSoftShadowMap }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 36, near: 0.25, far: 90, position: [0, 6, 8] }}
      aria-hidden="true"
    >
      <PerformanceMonitor flipflops={3} onDecline={() => quality.decline()} />
      <FilmInvalidator />
      <CameraRig />
      <Suspense fallback={null}>
        <Studio />
        <Desk />
        {showAssetBoard ? <AssetBoard /> : <Stations />}
        <Effects />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

/** Monté une fois les assets du Suspense chargés : masque l'écran d'attente. */
function Ready({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    onReady();
    invalidate();
  }, [onReady, invalidate]);
  return null;
}
