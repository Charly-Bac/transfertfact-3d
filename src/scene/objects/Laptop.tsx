// Ordinateur portable 13" en aluminium : touches instanciées, charnière animable, écran rétroéclairé.

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Color, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, type Group, type Texture } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MAT } from "../materials";

/** Dimensions réelles : 30 × 21 cm, écran 16:10. */
const W = 3.0;
const D = 2.1;
const ROWS = [14, 14, 13, 12, 11];

export interface LaptopHandle {
  /** 0 : fermé ; 1 : ouvert (≈ 105°). */
  setOpen: (u: number) => void;
  group: Group | null;
}

// Géométries et matières partagées entre tous les ordinateurs du film.
const shared = (() => {
  const keyMat = new MeshStandardMaterial({ color: new Color("#1e2023"), roughness: 0.62, metalness: 0.05 });
  return {
    base: new RoundedBoxGeometry(W, 0.11, D, 4, 0.05),
    well: new RoundedBoxGeometry(W - 0.3, 0.01, 1.12, 2, 0.03),
    key: new RoundedBoxGeometry(0.17, 0.03, 0.165, 2, 0.02),
    pad: new RoundedBoxGeometry(1.15, 0.004, 0.72, 2, 0.04),
    lid: new RoundedBoxGeometry(W, 0.06, D, 4, 0.04),
    keyMat,
  };
})();

type Props = { screen: Texture } & ThreeElements["group"];

export const Laptop = forwardRef<LaptopHandle, Props>(function Laptop({ screen, ...props }, ref) {
  const group = useRef<Group>(null);
  const hinge = useRef<Group>(null);
  const keys = useMemo(() => {
    const n = ROWS.reduce((a, b) => a + b, 0) + 1;
    const mesh = new InstancedMesh(shared.key, shared.keyMat, n);
    const o = new Object3D();
    let k = 0;
    const span = W - 0.44;
    ROWS.forEach((count, r) => {
      const kw = span / count;
      for (let i = 0; i < count; i++) {
        o.position.set(-span / 2 + kw * (i + 0.5), 0.118, -0.78 + r * 0.19);
        o.scale.set(kw / 0.19, 1, 1);
        o.updateMatrix();
        mesh.setMatrixAt(k++, o.matrix);
      }
    });
    // Barre d'espace.
    o.position.set(0, 0.118, 0.17);
    o.scale.set(4.8, 1, 1);
    o.updateMatrix();
    mesh.setMatrixAt(k, o.matrix);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, []);
  const screenMat = useMemo(() => new MeshBasicMaterial({ map: screen }), [screen]);

  useImperativeHandle(ref, () => ({
    setOpen(u: number) {
      if (hinge.current) hinge.current.rotation.x = -0.02 - 1.82 * u;
    },
    get group() {
      return group.current;
    },
  }));

  return (
    <group ref={group} {...props}>
      <mesh geometry={shared.base} material={MAT.alu} position-y={0.055} castShadow receiveShadow />
      <mesh geometry={shared.well} material={MAT.graphite} position={[0, 0.107, -0.37]} receiveShadow />
      <primitive object={keys} />
      <mesh geometry={shared.pad} material={MAT.aluDark} position={[0, 0.111, 0.6]} receiveShadow />
      {/* Couvercle articulé au fond du clavier ; l'écran est sur sa face intérieure. */}
      <group ref={hinge} position={[0, 0.11, -D / 2]} rotation-x={-0.02}>
        <mesh geometry={shared.lid} material={MAT.alu} position={[0, 0.03, D / 2]} castShadow receiveShadow />
        <mesh material={MAT.glass} rotation-x={Math.PI / 2} position={[0, -0.0015, D / 2]}>
          <planeGeometry args={[W - 0.08, D - 0.08]} />
        </mesh>
        <mesh material={screenMat} rotation-x={Math.PI / 2} position={[0, -0.003, D / 2 + 0.03]}>
          <planeGeometry args={[W - 0.24, D - 0.3]} />
        </mesh>
      </group>
    </group>
  );
});
