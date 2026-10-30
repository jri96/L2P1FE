// Exporteert elke wireframe (figure) uit index.html naar een losse PNG.
// Gebruik: npm run wireframes:images
// Zet de server niet aan nodig — dit script opent het bestand rechtstreeks.
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "images");
const PAGE = "file://" + path.join(HERE, "index.html").replace(/\\/g, "/");

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Geen Chrome/Edge gevonden. Zet CHROME_PATH naar je browser.");
  return found;
}

// Volgorde + bestandsnamen voor het Word-document
const NAMES = {
  "wf-flow": "00-navigatie",
  "wf-home-lofi": "01a-home-lo-fi",
  "wf-home-hifi": "01b-home-hi-fi",
  "wf-pokedex-lofi": "02a-pokedex-lo-fi",
  "wf-pokedex-hifi": "02b-pokedex-hi-fi",
  "wf-detail-lofi": "03a-detail-lo-fi",
  "wf-detail-hifi": "03b-detail-hi-fi",
  "wf-teams-lofi": "04a-teams-lo-fi",
  "wf-teams-hifi": "04b-teams-hi-fi",
  "wf-team-lofi": "05a-team-detail-lo-fi",
  "wf-team-hifi": "05b-team-detail-hi-fi",
  "wf-favorites-lofi": "06a-favorieten-lo-fi",
  "wf-favorites-hifi": "06b-favorieten-hi-fi",
};

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: "shell",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 2 });
await page.goto(PAGE, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500)); // sprites laden

const figures = await page.$$(`figure.wf`);
let count = 0;
for (const fig of figures) {
  const id = await fig.evaluate((el) => el.id);
  const name = NAMES[id] || id;
  const file = path.join(OUT, `${name}.png`);
  await fig.screenshot({ path: file });
  console.log(`✔ ${path.relative(process.cwd(), file)}`);
  count++;
}
await browser.close();
console.log(`\n${count} wireframes geëxporteerd naar ${path.relative(process.cwd(), OUT)}`);
