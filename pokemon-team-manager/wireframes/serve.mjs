// Kleine statische server om de wireframes in de browser te bekijken.
// Gebruik: node serve.mjs   →   http://localhost:5199
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// map van dit bestand (fileURLToPath houdt spaties in de padnaam correct)
const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = 5199;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const rel = normalize(url === "/" ? "index.html" : url.replace(/^\/+/, ""));
    if (rel.startsWith("..")) throw new Error("outside root");
    const data = await readFile(join(ROOT, rel));
    res.writeHead(200, { "Content-Type": TYPES[extname(rel)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
}).listen(PORT, () => console.log(`Wireframes: http://localhost:${PORT}`));
