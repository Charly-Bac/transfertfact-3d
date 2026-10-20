// Chemise cartonnée de dossier client : carton photo teinté, onglet, étiquette imprimée.

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import { Color, MeshStandardMaterial, type Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FOLDER_COLORS } from "../../film/data";
import { useTiledTextures } from "../assets";
import { paintTexture } from "../paint";
import { drawFolderLabel } from "../screens";

/** Chemise 16 × 21 cm ; épaisseur avec quelques feuilles. */
export const FOLDER = { w: 1.6, d: 2.1, t: 0.04 };

const geo = {
  body: new RoundedBoxGeometry(FOLDER.w, FOLDER.t, FOLDER.d, 2, 0.015),
  tab: new RoundedBoxGeometry(0.62, FOLDER.t, 0.26, 2, 0.015),
};

const CARD = { map: "textures/card/color.ktx2", normalMap: "textures/card/normal.ktx2", roughnessMap: "textures/card/roughness.ktx2" };

/** Matières des chemises : une par teinte, carton photo partagé. */
export function useFolderMaterials() {
  const t = useTiledTextures(CARD, [1, 1.3]);
  return useMemo(
    () => FOLDER_COLORS.map((c) => new MeshStandardMaterial({ map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap, color: new Color(c).multiplyScalar(1.15), roughness: 0.9 })),
    [t],
  );
}

type Props = { client: number; materials: MeshStandardMaterial[] } & ThreeElements["group"];

export const Folder = forwardRef<Group, Props>(function Folder({ client, materials, ...props }, ref) {
  const label = useMemo(() => {
    const tex = paintTexture(640, 300, (g, w, h) => drawFolderLabel(g, w, h, client));
    return new MeshStandardMaterial({ map: tex, roughness: 0.8 });
  }, [client]);
  const mat = materials[client % materials.length];
  return (
    <group ref={ref} {...props}>
      <mesh geometry={geo.body} material={mat} position-y={FOLDER.t / 2} castShadow receiveShadow />
      <mesh geometry={geo.tab} material={mat} position={[-0.4, FOLDER.t / 2, -FOLDER.d / 2 - 0.11]} castShadow receiveShadow />
      <mesh material={label} rotation-x={-Math.PI / 2} position={[0, FOLDER.t + 0.002, -0.25]} receiveShadow>
        <planeGeometry args={[1.3, 0.61]} />
      </mesh>
    </group>
  );
});
