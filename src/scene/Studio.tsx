// Studio : HDRI pour l'éclairage et les reflets (non affichée), lumière principale douce et chaude
// venant de l'arrière-gauche, fond de studio uni qui se fond dans le brouillard.

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, DirectionalLight, Object3D } from "three";
import { focusTarget } from "./CameraRig";

const BACKDROP = new Color("#e6dfd5");
/** Lumière principale : arrière-gauche, haute, légèrement chaude. */
const KEY_OFFSET: [number, number, number] = [-8, 14, -7];
const HDRI_URL = `${import.meta.env.BASE_URL}hdri/photo_studio_loft_hall_1k.jpg`;

export function Studio() {
  const key = useRef<DirectionalLight>(null);
  const target = useRef(new Object3D());

  // La lumière suit la cible de la caméra : ombres nettes et cadre d'ombre réduit à la station filmée.
  useFrame(() => {
    if (!key.current) return;
    key.current.position.set(focusTarget.x + KEY_OFFSET[0], focusTarget.y + KEY_OFFSET[1], focusTarget.z + KEY_OFFSET[2]);
    target.current.position.copy(focusTarget);
    target.current.updateMatrixWorld();
  });

  return (
    <>
      <color attach="background" args={[BACKDROP]} />
      <fogExp2 attach="fog" args={[BACKDROP, 0.0075]} />
      <Environment files={HDRI_URL} environmentIntensity={0.55} environmentRotation={[0, Math.PI * 0.75, 0]} />
      <primitive object={target.current} />
      <directionalLight
        ref={key}
        color="#fff0dc"
        intensity={2.2}
        target={target.current}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 9, -9, 1, 50]} />
      </directionalLight>
      <hemisphereLight args={["#ffffff", "#b89a76", 0.15]} />
    </>
  );
}
