// Grand bureau en chêne clair sur lequel sont posées toutes les stations.
// Textures photo Poly Haven (silver_oak_veneer_01, CC0) compressées en KTX2.

import { CH } from "../film/chapters";
import { useTiledTextures } from "./assets";

/** Échelle de la scène : 1 unité = 10 cm. Une tuile de placage couvre 1 m. */
const TILE = 10;
const DESK_DEPTH = 50;
const DESK_THICKNESS = 0.6;
const firstX = CH[0].stationX;
const lastX = CH[CH.length - 1].stationX;
const DESK_WIDTH = lastX - firstX + 80;
const DESK_CENTER_X = (firstX + lastX) / 2;

const OAK = { map: "textures/oak/color.ktx2", normalMap: "textures/oak/normal.ktx2", roughnessMap: "textures/oak/arm.ktx2" };

export function Desk() {
  const t = useTiledTextures(OAK, [DESK_WIDTH / TILE, DESK_DEPTH / TILE]);
  return (
    <mesh position={[DESK_CENTER_X, -DESK_THICKNESS / 2, -8]} receiveShadow>
      <boxGeometry args={[DESK_WIDTH, DESK_THICKNESS, DESK_DEPTH]} />
      {/* roughnessMap lit le canal G de la carte ARM (occlusion, rugosité, métal). */}
      <meshStandardMaterial
        map={t.map}
        normalMap={t.normalMap}
        normalScale={[0.6, 0.6]}
        roughnessMap={t.roughnessMap}
        roughness={0.85}
        metalness={0}
        envMapIntensity={0.7}
      />
    </mesh>
  );
}
