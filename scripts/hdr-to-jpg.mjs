// Convertit assets/source/hdri/<nom>.hdr en public/hdri/<nom>.jpg (gain map UltraHDR, ~10x plus léger).
// Usage : node scripts/hdr-to-jpg.mjs <nom> [qualité 0-1]
import { chromium } from "playwright";
import { createServer } from "vite";
import { writeFileSync, statSync } from "node:fs";

const [name, quality = "0.9"] = process.argv.slice(2);
if (!name) throw new Error("Usage : node scripts/hdr-to-jpg.mjs <nom-sans-extension>");

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(e));
  await page.goto("http://localhost:5199/scripts/hdr-to-jpg/index.html");
  await page.waitForFunction(() => typeof window.convertHdr === "function");
  const b64 = await page.evaluate(([u, q]) => window.convertHdr(u, q), [`/assets/source/hdri/${name}.hdr`, Number(quality)]);
  const out = `public/hdri/${name}.jpg`;
  writeFileSync(out, Buffer.from(b64, "base64"));
  console.log(`${out} : ${(statSync(out).size / 1024).toFixed(0)} Ko`);
} finally {
  await browser.close();
  await server.close();
}
