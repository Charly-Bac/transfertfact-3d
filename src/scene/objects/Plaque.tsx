// Plaque de présentation d'une PA : bloc laqué blanc imprimé du logo fourni, pied en aluminium.

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import { MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MAT } from "../materials";
import { paintTexture } from "../paint";
import { drawPlaque } from "../screens";

/** Plaque 22 × 13 cm, 2,5 cm d'épaisseur. */
export const PLAQUE = { w: 2.2, h: 1.3, d: 0.25 };

const geo = {
  block: new RoundedBoxGeometry(PLAQUE.w, PLAQUE.h, PLAQUE.d, 4, 0.05),
  foot: new RoundedBoxGeometry(PLAQUE.w + 0.12, 0.07, 0.5, 2, 0.025),
};
const lacquer = new MeshPhysicalMaterial({ color: "#f7f7f5", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });

type Props = { name: string; logo: HTMLImageElement } & ThreeElements["group"];

export function Plaque({ name, logo, ...props }: Props) {
  const face = useMemo(() => {
    const tex = paintTexture(1024, 600, (g, w, h) => drawPlaque(g, w, h, name, logo));
    return new MeshStandardMaterial({ map: tex, roughness: 0.35 });
  }, [name, logo]);
  const y = 0.07 + PLAQUE.h / 2;
  return (
    <group {...props}>
      <mesh geometry={geo.foot} material={MAT.alu} position-y={0.035} castShadow receiveShadow />
      <mesh geometry={geo.block} material={lacquer} position-y={y} castShadow receiveShadow />
      <mesh material={face} position={[0, y, PLAQUE.d / 2 + 0.002]}>
        <planeGeometry args={[PLAQUE.w - 0.12, (PLAQUE.w - 0.12) * (600 / 1024)]} />
      </mesh>
    </group>
  );
}
