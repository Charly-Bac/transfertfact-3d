// Chapitres 2 et 3 (même décor).
// 2 · Le casse-tête : 5 plaques de PA au fond, 12 dossiers éparpillés, des câbles qui s'emmêlent.
// 3 · Centralisation : l'ordinateur transfertFACT arrive, les câbles se démêlent et s'y branchent,
//     les dossiers se rangent en pile et l'écran passe les 5 PA en « Connectée ».

import { use, useMemo, useRef } from "react";
import { BufferGeometry, CatmullRomCurve3, Color, Group, Mesh, MeshStandardMaterial, TubeGeometry, Vector3 } from "three";
import { CH } from "../../film/chapters";
import { CLIENTS, PLATFORMS, seeded } from "../../film/data";
import { clamp, easeInOut, easeOut } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { logosReady } from "../logos";
import { FOLDER, Folder, useFolderMaterials } from "../objects/Folder";
import { Laptop, type LaptopHandle } from "../objects/Laptop";
import { Plaque } from "../objects/Plaque";
import { CS, paintTexture } from "../paint";
import { drawHub } from "../screens";

const MESS = 1;
const CENTRAL = 2;
/** Décalage entre le début du chapitre 2 et celui du chapitre 3 (même décor). */
const CENTRAL_OFFSET = CH[CENTRAL].start - CH[MESS].start;

const PLAQUE_X = [-4.9, -2.45, 0, 2.45, 4.9];
const PLAQUE_Z = -3.6;
const LAPTOP = new Vector3(0, 0, 1.45);
const CABLE_R = 0.026;
/** Échantillons le long d'un câble (aussi le pas du déroulé). */
const SAMPLES = 56;
const RADIAL = 8;

interface FolderState {
  mess: Vector3;
  neat: Vector3;
  yaw: number;
}

/** Dossier qui ne bouge pas : la pile se forme sur lui (aucun autre dossier n'occupe cet endroit). */
const STACK_BASE = 9;

/** Dossiers éparpillés sur une grille 4 × 3 sans chevauchement, puis empilés sur le dossier STACK_BASE. */
function folderLayout(): FolderState[] {
  const rnd = seeded(42);
  const xs = [-4.2, -1.4, 1.4, 4.2];
  const zs = [-0.9, 1.6, 4.1];
  const mess = CLIENTS.map((_, i) => new Vector3(xs[i % 4] + (rnd() - 0.5) * 0.2, 0, zs[Math.floor(i / 4)] + (rnd() - 0.5) * 0.2));
  const base = mess[STACK_BASE];
  return CLIENTS.map((_, i) => {
    // Rang dans la pile = ordre d'atterrissage (le dossier de base est en dessous).
    const rank = i === STACK_BASE ? 0 : i < STACK_BASE ? i + 1 : i;
    return {
      mess: mess[i],
      neat: new Vector3(base.x + (rnd() - 0.5) * 0.05, 0.002 * rank + rank * FOLDER.t, base.z + (rnd() - 0.5) * 0.05),
      yaw: (rnd() - 0.5) * 0.4,
    };
  });
}
const STACK_TOP = (CLIENTS.length - 1) * (FOLDER.t + 0.002) + FOLDER.t;

/** Tracés de contrôle : emmêlé (vers le dossier) et rangé (vers l'arrière de l'ordinateur). */
function cableRoutes(folders: FolderState[]) {
  const rnd = seeded(7);
  return CLIENTS.map((_, i) => {
    const p = i % 5;
    const foot = new Vector3(PLAQUE_X[p], 0, PLAQUE_Z + 0.45);
    const tangled = [foot, new Vector3(PLAQUE_X[p] + (rnd() - 0.5) * 5, 0, -2.2 + rnd() * 1.2), new Vector3(-4 + rnd() * 8, 0, -0.6 + rnd() * 2.4), folders[i].mess.clone()];
    const off = (p - 2) * 0.16 + (Math.floor(i / 5) - 1) * 0.055;
    const tidy = [foot, new Vector3(PLAQUE_X[p], 0, PLAQUE_Z + 1.2), new Vector3(PLAQUE_X[p] * 0.35 + off, 0, -0.7), new Vector3(off * 0.6, 0, LAPTOP.z - 1.1)];
    return { tangled, tidy };
  });
}

/** Le point (x, z) est-il sur un dossier (empreinte approximée par un rectangle orienté) ? */
function onFolder(x: number, z: number, folders: { pos: Vector3; yaw: number }[]) {
  for (const f of folders) {
    const dx = x - f.pos.x;
    const dz = z - f.pos.z;
    const c = Math.cos(-f.yaw);
    const s = Math.sin(-f.yaw);
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    if (Math.abs(lx) < FOLDER.w / 2 + 0.03 && Math.abs(lz) < FOLDER.d / 2 + 0.03) return f.pos.y + FOLDER.t;
  }
  return 0;
}

/**
 * Construit les 12 câbles pour un mélange m (0 emmêlé → 1 rangé). Les câbles reposent sur le bureau,
 * passent par-dessus les dossiers et par-dessus les câbles déjà posés : aucune interpénétration.
 */
function buildCables(routes: ReturnType<typeof cableRoutes>, m: number, folderNow: { pos: Vector3; yaw: number }[]) {
  const placed: Vector3[][] = [];
  return routes.map((r) => {
    const ctrl = r.tangled.map((p, k) => p.clone().lerp(r.tidy[k], m));
    const pts = new CatmullRomCurve3(ctrl, false, "centripetal").getSpacedPoints(SAMPLES - 1);
    for (const p of pts) {
      let y = CABLE_R + onFolder(p.x, p.z, folderNow);
      for (const other of placed) {
        for (const q of other) {
          const d2 = (p.x - q.x) ** 2 + (p.z - q.z) ** 2;
          if (d2 < (2 * CABLE_R) ** 2) y = Math.max(y, q.y + 2 * CABLE_R * Math.sqrt(1 - d2 / (2 * CABLE_R) ** 2) + 0.002);
        }
      }
      p.y = y;
    }
    // Lissage léger des montées pour un câble souple.
    for (let pass = 0; pass < 2; pass++) for (let k = 1; k < pts.length - 1; k++) pts[k].y = Math.max(pts[k].y, (pts[k - 1].y + pts[k + 1].y) / 2 - 0.004);
    placed.push(pts);
    return new TubeGeometry(new CatmullRomCurve3(pts), SAMPLES * 2, CABLE_R, RADIAL);
  });
}

export function CasseTete({ x }: { x: number }) {
  const logos = use(logosReady);
  const folderMats = useFolderMaterials();
  const layout = useMemo(folderLayout, []);
  const routes = useMemo(() => cableRoutes(layout), [layout]);
  const hub = useMemo(() => paintTexture<number>(1280, 800, drawHub, 0), []);
  const cableMats = useMemo(() => PLATFORMS.map((p) => new MeshStandardMaterial({ color: new Color(p.color), roughness: 0.42, metalness: 0.05 })), []);
  const folderRefs = useRef<(Group | null)[]>([]);
  const cableRefs = useRef<(Mesh | null)[]>([]);
  const laptop = useRef<LaptopHandle>(null);
  const lastMix = useRef(-1);
  const folderNow = useMemo(() => layout.map((f) => ({ pos: f.mess.clone(), yaw: f.yaw })), [layout]);

  useChapterFrame(MESS, (l1) => {
    const l2 = l1 - CENTRAL_OFFSET;
    // Les dossiers libèrent d'abord la place, puis l'ordinateur glisse depuis la droite et s'ouvre.
    const slide = l2 < 0 ? 0 : easeOut(clamp((l2 - 2.3) / 1.2));
    const open = l2 < 0 ? 0 : easeInOut(clamp((l2 - 3.2) / 1.2));
    const lg = laptop.current?.group;
    if (lg) {
      lg.visible = slide > 0;
      lg.position.set(LAPTOP.x + (1 - slide) * 9, 0, LAPTOP.z);
    }
    laptop.current?.setOpen(open);
    // Démêlage des câbles et connexion des PA à l'écran.
    const m = l2 < 0 ? 0 : easeInOut(clamp((l2 - 1.2) / 2.6));
    hub.redraw(Math.round(m * 5));
    // Les dossiers s'envolent un à un vers la pile (le dossier de base se redresse sur place).
    layout.forEach((f, i) => {
      const u = l2 < 0 ? 0 : easeInOut(clamp((l2 - 0.2 - i * 0.12) / 1.0));
      const g = folderRefs.current[i];
      const now = folderNow[i];
      now.pos.lerpVectors(f.mess, f.neat, u);
      if (i !== STACK_BASE) now.pos.y += Math.sin(Math.PI * u) * (0.6 + i * 0.06);
      now.yaw = f.yaw * (1 - u);
      if (g) {
        g.position.copy(now.pos);
        g.rotation.set(0, now.yaw, i === STACK_BASE ? 0 : Math.sin(Math.PI * u) * 0.1);
      }
    });
    // Géométrie des câbles : recalculée seulement quand le mélange change (pas de 1/150).
    const q = Math.round(m * 150) / 150;
    const rebuild = q !== lastMix.current;
    lastMix.current = q;
    // Pendant le rangement, les câbles ne contournent que les dossiers encore au sol.
    const grounded = folderNow.filter((f) => f.pos.y < FOLDER.t * 13);
    const geos: BufferGeometry[] | null = rebuild ? buildCables(routes, q, grounded) : null;
    routes.forEach((_, i) => {
      const c = cableRefs.current[i];
      if (!c) return;
      if (geos) {
        c.geometry.dispose();
        c.geometry = geos[i];
      }
      // Déroulé progressif au chapitre 2, câble par câble.
      const e = l1 < 0 ? 0 : easeInOut(clamp((l1 - 0.3 - i * 0.2) / 1.1));
      c.visible = e > 0;
      const index = c.geometry.index;
      if (index) c.geometry.setDrawRange(0, e >= 1 ? index.count : Math.floor(e * SAMPLES * 2) * RADIAL * 6);
    });
  });

  return (
    <group position-x={x}>
      {PLATFORMS.map((p, i) => (
        <Plaque key={p.name} name={p.name} logo={logos[i]} position={[PLAQUE_X[i], 0, PLAQUE_Z]} />
      ))}
      {CLIENTS.map((_, i) => (
        <Folder key={i} ref={(g) => void (folderRefs.current[i] = g)} client={i} materials={folderMats} position={layout[i].mess} rotation-y={layout[i].yaw} />
      ))}
      {routes.map((_, i) => (
        <mesh key={i} ref={(m) => void (cableRefs.current[i] = m)} material={cableMats[i % 5]} castShadow receiveShadow>
          <bufferGeometry />
        </mesh>
      ))}
      <Laptop ref={laptop} screen={hub} position={[LAPTOP.x + 9, 0, LAPTOP.z]} visible={false} />
      <Label chapter={MESS} position={[0, 0.15, PLAQUE_Z + 1.25]} text="5 plateformes différentes" color={CS.ink} big />
      <Label chapter={MESS} position={[-0.5, 0.15, 3.0]} text="12 dossiers clients" color={CS.ink} big />
      <Label chapter={CENTRAL} position={[0, 2.55, LAPTOP.z - 1.2]} text="transfertFACT · une seule interface" color={CS.green} big />
      <Label chapter={CENTRAL} position={[layout[STACK_BASE].mess.x, STACK_TOP + 0.5, layout[STACK_BASE].mess.z]} text="Dossiers centralisés" color={CS.teal} />
    </group>
  );
}
