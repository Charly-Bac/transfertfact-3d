// Smartphone moderne posé à plat : coque arrondie en aluminium, verre, écran rétroéclairé.

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import { MeshBasicMaterial, type Group, type Texture } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MAT } from "../materials";

/** Dimensions réelles : 7,2 × 15 cm, 0,8 cm d'épaisseur. */
export const PHONE = { w: 0.72, h: 1.5, d: 0.08 };

type Props = { screen: Texture } & ThreeElements["group"];

export const Phone = forwardRef<Group, Props>(function Phone({ screen, ...props }, ref) {
  const geo = useMemo(
    () => ({
      body: new RoundedBoxGeometry(PHONE.w, PHONE.d, PHONE.h, 6, 0.09),
      glass: new RoundedBoxGeometry(PHONE.w - 0.02, 0.004, PHONE.h - 0.02, 4, 0.08),
    }),
    [],
  );
  // Écran émissif : non affecté par l'éclairage de la scène, comme un vrai rétroéclairage.
  const screenMat = useMemo(() => new MeshBasicMaterial({ map: screen }), [screen]);

  return (
    <group ref={ref} {...props}>
      <mesh geometry={geo.body} material={MAT.aluDark} position-y={PHONE.d / 2} castShadow receiveShadow />
      <mesh geometry={geo.glass} material={MAT.glass} position-y={PHONE.d + 0.001} receiveShadow />
      <mesh material={screenMat} rotation-x={-Math.PI / 2} position-y={PHONE.d + 0.0035}>
        <planeGeometry args={[PHONE.w - 0.07, PHONE.h - 0.09]} />
      </mesh>
    </group>
  );
});
