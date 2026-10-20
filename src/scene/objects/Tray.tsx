// Bac à courrier A4 en plastique blanc, avec étiquette en façade.

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MAT } from "../materials";
import { paintTexture } from "../paint";
import { drawTrayLabel } from "../screens";

/** Fond intérieur : hauteur à laquelle se pose la première feuille. */
export const TRAY_FLOOR = 0.06;

// Fond, dos, côtés et façade basse : [largeur, hauteur, profondeur, x, y, z].
const PARTS: [number, number, number, number, number, number][] = [
  [2.7, 0.06, 3.5, 0, 0.03, 0],
  [2.7, 0.42, 0.08, 0, 0.21, -1.71],
  [0.08, 0.42, 3.5, -1.31, 0.21, 0],
  [0.08, 0.42, 3.5, 1.31, 0.21, 0],
  [2.7, 0.2, 0.08, 0, 0.1, 1.71],
];
const geos = PARTS.map(([w, h, d]) => new RoundedBoxGeometry(w, h, d, 2, 0.03));

type Props = { text: string; color: string } & ThreeElements["group"];

export function Tray({ text, color, ...props }: Props) {
  const label = useMemo(() => new MeshStandardMaterial({ map: paintTexture(640, 64, (g, w, h) => drawTrayLabel(g, w, h, text, color)), roughness: 0.6 }), [text, color]);
  return (
    <group {...props}>
      {PARTS.map(([, , , x, y, z], i) => (
        <mesh key={i} geometry={geos[i]} material={MAT.plasticWhite} position={[x, y, z]} castShadow receiveShadow />
      ))}
      <mesh material={label} position={[0, 0.1, 1.752]}>
        <planeGeometry args={[1.5, 0.15]} />
      </mesh>
    </group>
  );
}
