// Grand bureau en chêne clair sur lequel sont posées toutes les stations.
// Texture provisoire dessinée en canvas : remplacée par des textures PBR photo à l'étape 2.

import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { CH } from "../film/chapters";

const DESK_DEPTH = 50;
const DESK_THICKNESS = 0.6;
const firstX = CH[0].stationX;
const lastX = CH[CH.length - 1].stationX;
const DESK_WIDTH = lastX - firstX + 80;
const DESK_CENTER_X = (firstX + lastX) / 2;

/** Générateur pseudo-aléatoire déterministe : même bureau à chaque chargement. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function oakCanvas(size: number, rough: boolean) {
  const rnd = seeded(42);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = rough ? "#9a9a9a" : "#d4b48c";
  g.fillRect(0, 0, size, size);
  // Lames du plateau.
  for (let k = 0; k < 4; k++) {
    g.fillStyle = k % 2 ? "rgba(120,80,40,.05)" : "rgba(255,240,215,.06)";
    if (rough) g.fillStyle = k % 2 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.05)";
    g.fillRect(0, (k * size) / 4, size, size / 4);
  }
  // Veinage.
  for (let i = 0; i < 1400; i++) {
    const y = rnd() * size;
    const dark = rnd() < 0.6;
    g.strokeStyle = rough ? (dark ? "#6a6a6a" : "#c0c0c0") : dark ? "#a37b52" : "#ecd7b8";
    g.globalAlpha = 0.04 + rnd() * 0.12;
    g.lineWidth = 0.6 + rnd() * 2.2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= size; x += 64) g.lineTo(x, y + Math.sin(x * 0.004 + i) * 6 + (rnd() - 0.5) * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}

export function Desk() {
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const { map, roughnessMap } = useMemo(() => {
    const make = (rough: boolean) => {
      const t = new CanvasTexture(oakCanvas(rough ? 512 : 2048, rough));
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(DESK_WIDTH / 18, DESK_DEPTH / 18);
      t.anisotropy = maxAniso;
      if (!rough) t.colorSpace = SRGBColorSpace;
      return t;
    };
    return { map: make(false), roughnessMap: make(true) };
  }, [maxAniso]);

  return (
    <mesh position={[DESK_CENTER_X, -DESK_THICKNESS / 2, -8]} receiveShadow>
      <boxGeometry args={[DESK_WIDTH, DESK_THICKNESS, DESK_DEPTH]} />
      <meshStandardMaterial map={map} roughnessMap={roughnessMap} roughness={0.7} metalness={0} envMapIntensity={0.6} />
    </mesh>
  );
}
