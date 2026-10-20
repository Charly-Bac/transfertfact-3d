// Télécharge les assets sources (HDRI, textures, modèles) dans assets/source/ (non versionné).
// Usage : node scripts/fetch-assets.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AMBIENTCG_TEXTURES, HDRIS, POLYHAVEN_MODELS, POLYHAVEN_TEXTURES } from "./assets.manifest.mjs";

const SRC = "assets/source";

async function download(url, dest) {
  if (existsSync(dest)) return;
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("↓", dest);
}

const polyhavenFiles = async (id) => (await fetch(`https://api.polyhaven.com/files/${id}`)).json();

for (const h of HDRIS) {
  const files = await polyhavenFiles(h.id);
  await download(files.hdri[h.res].hdr.url, join(SRC, "hdri", `${h.id}_${h.res}.hdr`));
}

for (const t of POLYHAVEN_TEXTURES) {
  const files = await polyhavenFiles(t.id);
  for (const map of t.maps) {
    await download(files[map][t.res].jpg.url, join(SRC, "textures", t.id, `${map}_${t.res}.jpg`));
  }
}

for (const t of AMBIENTCG_TEXTURES) {
  const zip = join(SRC, "textures", t.id, `${t.id}_${t.res}-JPG.zip`);
  await download(`https://ambientcg.com/get?file=${t.id}_${t.res}-JPG.zip`, zip);
  execFileSync("unzip", ["-o", "-q", zip, "-d", dirname(zip)]);
}

for (const m of POLYHAVEN_MODELS) {
  const files = await polyhavenFiles(m.id);
  const gltf = files.gltf[m.res].gltf;
  const dir = join(SRC, "models", m.id);
  await download(gltf.url, join(dir, `${m.id}.gltf`));
  for (const [path, inc] of Object.entries(gltf.include ?? {})) await download(inc.url, join(dir, path));
}

console.log("Assets sources à jour dans", SRC);
