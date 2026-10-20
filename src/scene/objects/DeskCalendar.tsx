// Calendrier de bureau « chevalet » : deux plaques de carton reliées par une spirale métallique.
// La page de la veille peut basculer par-dessus la spirale (flip de 0 à 1).

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { BackSide, InstancedMesh, MeshStandardMaterial, Object3D, TorusGeometry, type Group, type Texture } from "three";
import { MAT } from "../materials";

export const CAL = { w: 2.2, h: 2.1, tilt: 0.27 };
const LENGTH = CAL.h / Math.cos(CAL.tilt);
const RINGS = 17;

export interface DeskCalendarHandle {
  /** 0 : page de la veille rabattue sur le devant ; 1 : passée derrière la spirale. */
  setFlip: (u: number) => void;
}

type Props = { today: Texture; yesterday: Texture } & ThreeElements["group"];

export const DeskCalendar = forwardRef<DeskCalendarHandle, Props>(function DeskCalendar({ today, yesterday, ...props }, ref) {
  const flipPivot = useRef<Group>(null);
  const rings = useMemo(() => {
    const geo = new TorusGeometry(0.075, 0.011, 8, 24);
    const mesh = new InstancedMesh(geo, MAT.chrome, RINGS);
    const o = new Object3D();
    for (let i = 0; i < RINGS; i++) {
      o.position.set(-CAL.w / 2 + 0.16 + (i * (CAL.w - 0.32)) / (RINGS - 1), 0, 0);
      o.rotation.set(0, Math.PI / 2, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.castShadow = true;
    return mesh;
  }, []);
  const pages = useMemo(
    () => ({
      today: new MeshStandardMaterial({ map: today, roughness: 0.85 }),
      yesterday: new MeshStandardMaterial({ map: yesterday, roughness: 0.85 }),
      // Verso uni de la page qui bascule.
      back: new MeshStandardMaterial({ color: "#f1efe9", roughness: 0.9, side: BackSide }),
    }),
    [today, yesterday],
  );

  useImperativeHandle(ref, () => ({
    setFlip(u: number) {
      const p = flipPivot.current;
      if (!p) return;
      // La page se soulève vers l'avant, passe au-dessus de la spirale et retombe derrière :
      // de −tilt à −(2π − tilt), soit un tour complet moins l'ouverture du chevalet.
      p.rotation.x = -CAL.tilt - u * (2 * Math.PI - 2 * CAL.tilt);
      p.visible = u < 0.999;
    },
  }));

  return (
    <group {...props}>
      {/* Plaque avant (avec le bloc de pages) et plaque arrière, articulées en haut. */}
      <group position-y={CAL.h} rotation-x={-CAL.tilt}>
        <mesh material={MAT.greyboard} position={[0, -LENGTH / 2, -0.015]} castShadow receiveShadow>
          <boxGeometry args={[CAL.w, LENGTH, 0.03]} />
        </mesh>
        <mesh material={MAT.paperEdge} position={[0, -LENGTH / 2 - 0.02, 0.025]} castShadow receiveShadow>
          <boxGeometry args={[CAL.w - 0.08, LENGTH - 0.12, 0.05]} />
        </mesh>
        <mesh material={pages.today} position={[0, -LENGTH / 2 - 0.02, 0.0505]} receiveShadow>
          <planeGeometry args={[CAL.w - 0.08, LENGTH - 0.12]} />
        </mesh>
      </group>
      <group position-y={CAL.h} rotation-x={CAL.tilt}>
        <mesh material={MAT.greyboard} position={[0, -LENGTH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[CAL.w, LENGTH, 0.03]} />
        </mesh>
      </group>
      {/* Page de la veille, qui bascule par-dessus la spirale. */}
      <group ref={flipPivot} position-y={CAL.h} rotation-x={-CAL.tilt}>
        <mesh material={pages.yesterday} position={[0, -LENGTH / 2 - 0.02, 0.058]} castShadow receiveShadow>
          <planeGeometry args={[CAL.w - 0.08, LENGTH - 0.12]} />
        </mesh>
        <mesh material={pages.back} position={[0, -LENGTH / 2 - 0.02, 0.058]}>
          <planeGeometry args={[CAL.w - 0.08, LENGTH - 0.12]} />
        </mesh>
      </group>
      <primitive object={rings} position-y={CAL.h} />
    </group>
  );
});
