// Tasse et soucoupe en porcelaine (profils tournés), café à l'intérieur.

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import { LatheGeometry, SplineCurve, TorusGeometry, Vector2 } from "three";
import { MAT } from "../materials";

function lathe(profile: [number, number][], segments = 96) {
  const curve = new SplineCurve(profile.map(([x, y]) => new Vector2(x, y)));
  return new LatheGeometry(curve.getPoints(profile.length * 8), segments);
}

export function Cup(props: ThreeElements["group"]) {
  const geo = useMemo(
    () => ({
      saucer: lathe([[0, 0.004], [0.42, 0.004], [0.5, 0.012], [0.6, 0.045], [0.64, 0.06], [0.62, 0.064], [0.5, 0.04], [0.4, 0.032], [0, 0.032]]),
      cup: lathe([[0, 0.04], [0.28, 0.04], [0.33, 0.06], [0.36, 0.12], [0.39, 0.5], [0.405, 0.84], [0.41, 0.9], [0.395, 0.905], [0.38, 0.86], [0.36, 0.5], [0.33, 0.14], [0.29, 0.11], [0, 0.11]]),
      handle: new TorusGeometry(0.19, 0.042, 20, 48, Math.PI * 1.15),
    }),
    [],
  );
  return (
    <group {...props}>
      <mesh geometry={geo.saucer} material={MAT.ceramic} castShadow receiveShadow />
      <mesh geometry={geo.cup} material={MAT.ceramic} position-y={0.002} castShadow receiveShadow />
      <mesh material={MAT.coffee} rotation-x={-Math.PI / 2} position-y={0.74} receiveShadow>
        <circleGeometry args={[0.372, 64]} />
      </mesh>
      <mesh geometry={geo.handle} material={MAT.ceramic} position={[0.44, 0.5, 0]} rotation-z={-Math.PI / 2 - 0.2} castShadow />
    </group>
  );
}
