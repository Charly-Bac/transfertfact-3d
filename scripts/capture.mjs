// Captures de vérification : node scripts/capture.mjs [url] [sortie] [t1,t2,...] [largeurxhauteur]
// Exemple : node scripts/capture.mjs http://localhost:4173/ captures/etape1 2,4,12 1440x900
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [url = "http://localhost:4173/", out = "captures", times = "4", size = "1440x900"] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

for (const t of times.split(",")) {
  const sep = url.includes("?") ? "&" : "?";
  await page.goto(`${url}${sep}t=${t}&pause`, { waitUntil: "networkidle" });
  await page.waitForSelector(".loading", { state: "detached", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const file = `${out}/t${String(t).replace(".", "_")}-${width}x${height}.png`;
  await page.screenshot({ path: file });
  console.log("capture", file);
}
if (errors.length) console.log("Erreurs console :\n" + errors.join("\n"));
await browser.close();
