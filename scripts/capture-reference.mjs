// Captures de la maquette de référence au même instant que le film 3D, pour comparaison.
// Usage : node scripts/capture-reference.mjs <chapitre 1-7> <secondes dans le chapitre> [sortie]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const [chapter = "1", local = "4", out = "captures/reference"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`file://${resolve("reference/maquette-multipa.html")}`, { waitUntil: "networkidle" });
await page.waitForSelector("#loading", { state: "hidden", timeout: 60000 });
// Saut au début du chapitre via la timeline, puis lecture en temps réel jusqu'à l'instant voulu.
await page.locator(".seg").nth(Number(chapter) - 1).click();
await page.waitForTimeout(250 + Number(local) * 1000);
await page.keyboard.press("Space");
const file = `${out}/ch${chapter}-t${String(local).replace(".", "_")}.png`;
await page.screenshot({ path: file });
console.log("capture", file);
await browser.close();
