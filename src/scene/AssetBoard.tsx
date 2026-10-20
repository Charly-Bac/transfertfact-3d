// Planche de contrôle des assets (?assets) : modèles et matières posés sur le bureau,
// pour vérifier échelle, compression et éclairage. Hors du film.

import { useMemo } from "react";
import { useModel, useTiledTextures } from "./assets";

/** Les modèles Poly Haven sont en mètres ; la scène est en unités de 10 cm. */
const M = 10;

interface ModelProps {
  path: string;
  position: [number, number, number];
  rotation?: number;
  /** Modèle livré à la verticale (plan XY) : on le couche sur le bureau. */
  lieFlat?: boolean;
}

function Model({ path, position, rotation = 0, lieFlat = false }: ModelProps) {
  const { scene } = useModel(path);
  const object = useMemo(() => {
    const o = scene.clone(true);
    o.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;
    });
    return o;
  }, [scene]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive object={object} rotation={[lieFlat ? -Math.PI / 2 : 0, 0, 0]} scale={M} />
    </group>
  );
}

function Sheet({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const t = useTiledTextures({ normalMap: "textures/paper/normal.ktx2", roughnessMap: "textures/paper/roughness.ktx2" }, [1, 1.4]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow castShadow>
      {/* A4 : 21 × 29,7 cm */}
      <planeGeometry args={[2.1, 2.97]} />
      <meshStandardMaterial color="#f6f5f1" normalMap={t.normalMap} normalScale={[0.4, 0.4]} roughnessMap={t.roughnessMap} />
    </mesh>
  );
}

function Folder({ position, color, rotation = 0 }: { position: [number, number, number]; color: string; rotation?: number }) {
  const t = useTiledTextures(
    { map: "textures/card/color.ktx2", normalMap: "textures/card/normal.ktx2", roughnessMap: "textures/card/roughness.ktx2" },
    [1, 1],
  );
  return (
    <mesh position={position} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.04, 3.2]} />
      <meshStandardMaterial map={t.map} color={color} normalMap={t.normalMap} roughnessMap={t.roughnessMap} />
    </mesh>
  );
}

export function AssetBoard() {
  return (
    <group>
      <Model path="models/potted_plant_04.glb" position={[2.6, 0, -1.6]} />
      <Model path="models/stationery_supplies.glb" position={[-0.4, 0.42, 1.8]} rotation={-0.3} lieFlat />
      <Model path="models/office_notepads.glb" position={[0.6, 0, -2.2]} rotation={0.2} />
      <Sheet position={[-0.6, 0.004, -0.4]} rotation={0.08} />
      <Folder position={[-3.4, 0.02, -0.6]} color="#cfe8c7" rotation={-0.12} />
      <Folder position={[-3.3, 0.06, -0.62]} color="#c9ecea" rotation={-0.05} />
    </group>
  );
}

export const showAssetBoard = new URLSearchParams(location.search).has("assets");
