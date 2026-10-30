/**
 * Handmatige "e2e-smoke-test": opent de app in een hoofdloze Chrome,
 * loopt langs alle routes, controleert of er geen JS-fouten zijn en
 * test een paar interacties (favoriet, toevoegen aan team, team aanmaken).
 *
 * Gebruik: npm run dev  (in een ander venster)  →  npm run smoke
 * Plaatjes komen in /screenshots.
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "screenshots");
const BASE = process.env.APP_URL ?? "http://localhost:5173";

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
  if (!found) throw new Error("Geen Chrome/Edge gevonden — zet CHROME_PATH.");
  return found;
}

const ROUTES = [
  ["home", "/"],
  ["pokedex", "/list"],
  ["detail", "/detail/25"],
  ["teams", "/teams"],
  ["favorieten", "/favorieten"],
  ["404", "/bestaat-niet"],
];

const problems = [];
const notes = [];
const ok = (message) => notes.push(`✔ ${message}`);

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: "shell",
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

page.on("pageerror", (error) => problems.push(`JS-fout: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
});

const settle = async () => {
  try {
    await page.waitForNetworkIdle({ idleTime: 900, timeout: 25000 });
  } catch {
    notes.push("· netwerk werd niet helemaal stil (timeout) — gaat verder");
  }
};

/* ---------------- routes + screenshots ---------------- */
for (const [name, route] of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 600));
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  ok(`route ${route} geladen → screenshots/${name}.png`);
}

/* ---------------- interacties ---------------- */
await page.goto(`${BASE}/list`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".pokemon-card:not(.is-skeleton)", { timeout: 30000 });
await settle();

// 1. hartje → melding (toast)
await page.click(".pokemon-card .icon-btn");
await page.waitForSelector(".toast", { timeout: 5000 });
ok("favoriet-toggled → melding verschijnt");

// 2. "+" → dialog met teamkeuze
await page.click(".pokemon-card__actions .icon-btn:last-child");
await page.waitForSelector(".modal", { timeout: 5000 });
ok("toevoegen-aan-team dialog opent");

// 3. kies een team waar die Pokémon nog NIET in zit (anders blijft de
//    dialog open met de melding "zit al in dit team" — dat is de bedoeling)
const pickerItems = await page.$$(".team-picker__item");
await pickerItems[pickerItems.length - 1].click();
await page.waitForSelector(".modal", { hidden: true, timeout: 5000 });
ok("Pokémon toegevoegd aan een team");

// 4. team-detail openen en naar de picker
await page.goto(`${BASE}/teams`, { waitUntil: "domcontentloaded" });
await settle();
const teamCards = await page.$$eval(".team-card", (nodes) => nodes.length);
if (teamCards > 0) {
  await page.click(".team-card .btn--primary");
  await settle();
  const title = await page.$eval("h1", (node) => node.textContent.trim());
  ok(`team-detail geopend: "${title}"`);
  await page.screenshot({ path: path.join(OUT, "team-detail.png"), fullPage: true });
} else {
  problems.push("Geen teamcards gevonden op /teams");
}

// 5. nieuw team aanmaken
await page.goto(`${BASE}/teams`, { waitUntil: "domcontentloaded" });
await settle();
const before = (await page.$$(".team-card")).length;
await page.type(".new-team input", "Smoke Test Team");
await page.click(".new-team button[type=submit]");
await page.waitForFunction(
  (count) => document.querySelectorAll(".team-card").length > count,
  { timeout: 5000 },
  before,
);
ok("nieuw team aangemaakt via het formulier");

// 6. detailpagina met stats
await page.goto(`${BASE}/detail/6`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".stat-bar", { timeout: 20000 });
const statCount = await page.$$eval(".stat-bar", (nodes) => nodes.length);
if (statCount !== 6) problems.push(`Verwachtte 6 statistieken, vond ${statCount}`);
else ok("detailpagina toont 6 statistieken");

await browser.close();

console.log("\n--- smoke test ---");
notes.forEach((note) => console.log(note));
if (problems.length === 0) {
  console.log("\nGeen fouten gevonden ✅");
} else {
  console.log(`\n${problems.length} probleem(en):`);
  [...new Set(problems)].forEach((problem) => console.log(`  ✖ ${problem}`));
  process.exitCode = 1;
}
