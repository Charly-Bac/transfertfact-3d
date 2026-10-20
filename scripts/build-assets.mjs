// Compresse les assets sources (assets/source/) vers public/ :
// - textures → KTX2 (Basis ETC1S, mipmaps), cartes de couleur en sRGB, les autres en linéaire ;
// - modèles → GLB, textures 512 px en KTX2 ETC1S, géométrie meshopt ;
// - HDRI → JPEG à gain map (scripts/hdr-to-jpg.mjs).
// Prérequis : outil `ktx` (KTX-Software ≥ 4.3) dans le PATH. Usage : node scripts/build-assets.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { AMBIENTCG_TEXTURES, HDRIS, POLYHAVEN_MODELS } from "./assets.manifest.mjs";

const SRC = "assets/source";
const OUT = "public";
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });

/** Une texture : fichier source → .ktx2, taille max, espace colorimétrique. */
function ktx2(src, dest, { srgb, size }) {
  mkdirSync(join(dest, ".."), { recursive: true });
  run("ktx", [
    "create",
    "--format", srgb ? "R8G8B8_SRGB" : "R8G8B8_UNORM",
    // Cartes de données (relief, rugosité) : valeurs brutes, sans conversion sRGB → linéaire.
    ...(srgb ? [] : ["--assign-tf", "linear"]),
    "--encode", "basis-lz",
    "--qlevel", "192",
    "--clevel", "2",
    "--generate-mipmap",
    "--width", String(size),
    "--height", String(size),
    src,
    dest,
  ]);
}

const TEXTURES = [
  // Plateau du bureau : chêne clair.
  { src: "silver_oak_veneer_01/Diffuse_2k.jpg", out: "oak/color.ktx2", srgb: true, size: 2048 },
  { src: "silver_oak_veneer_01/nor_gl_2k.jpg", out: "oak/normal.ktx2", srgb: false, size: 1024 },
  { src: "silver_oak_veneer_01/arm_2k.jpg", out: "oak/arm.ktx2", srgb: false, size: 1024 },
  // Papier des factures : relief et rugosité seulement (le recto imprimé est dessiné en canvas).
  { src: "Paper001/Paper001_1K-JPG_NormalGL.jpg", out: "paper/normal.ktx2", srgb: false, size: 512 },
  { src: "Paper001/Paper001_1K-JPG_Roughness.jpg", out: "paper/roughness.ktx2", srgb: false, size: 512 },
  // Carton des dossiers (teinté par dossier).
  { src: "Paper006/Paper006_1K-JPG_Color.jpg", out: "card/color.ktx2", srgb: true, size: 512 },
  { src: "Paper006/Paper006_1K-JPG_NormalGL.jpg", out: "card/normal.ktx2", srgb: false, size: 512 },
  { src: "Paper006/Paper006_1K-JPG_Roughness.jpg", out: "card/roughness.ktx2", srgb: false, size: 512 },
];

// Garde-fou : chaque texture ambientCG utilisée doit être dans le manifeste (donc créditée).
const acgIds = new Set(AMBIENTCG_TEXTURES.map((t) => t.id));
for (const t of TEXTURES) {
  const id = t.src.split("/")[0];
  if (id.startsWith("Paper") && !acgIds.has(id)) throw new Error(`Texture hors manifeste : ${id}`);
}

for (const t of TEXTURES) {
  ktx2(join(SRC, "textures", t.src), join(OUT, "textures", t.out), t);
  console.log("✔ textures/" + t.out);
}

const tmp = join(SRC, ".tmp");
mkdirSync(tmp, { recursive: true });
mkdirSync(join(OUT, "models"), { recursive: true });
for (const m of POLYHAVEN_MODELS) {
  const a = join(tmp, `${m.id}-a.glb`);
  const b = join(tmp, `${m.id}-b.glb`);
  const out = join(OUT, "models", `${m.id}.glb`);
  const gt = ["gltf-transform"];
  // Simplification géométrique (objets de décor vus de loin) puis textures ramenées à 512 px.
  run("npx", [...gt, "optimize", join(SRC, "models", m.id, `${m.id}.gltf`), a, "--compress", "false", "--texture-compress", "false", "--simplify-ratio", String(m.simplify ?? 0.75), "--simplify-error", "0.0005",
    ...(m.keepNodes ? ["--join", "false", "--flatten", "false", "--instance", "false"] : [])]);
  run("npx", [...gt, "resize", a, a, "--width", "512", "--height", "512"]);
  run("npx", [...gt, "etc1s", a, b, "--quality", "160"]);
  run("npx", [...gt, "meshopt", b, out]);
  console.log("✔ models/" + m.id + ".glb");
}
rmSync(tmp, { recursive: true, force: true });

for (const h of HDRIS) run("node", ["scripts/hdr-to-jpg.mjs", `${h.id}_${h.res}`]);

// Bilan du poids livré.
const sizeOf = (p) => (statSync(p).isDirectory() ? readdirSync(p).reduce((s, f) => s + sizeOf(join(p, f)), 0) : statSync(p).size);
for (const dir of ["textures", "models", "hdri"]) console.log(`${dir.padEnd(9)} ${(sizeOf(join(OUT, dir)) / 1048576).toFixed(2)} Mo`);
