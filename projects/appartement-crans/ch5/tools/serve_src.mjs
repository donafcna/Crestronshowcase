#!/usr/bin/env node
/**
 * Serveur statique minimal pour les controles avant livraison (contraste, Playwright).
 *
 * Fichier a part et non « node -e "..." » : Start-Process de Windows PowerShell 5.1 joint
 * les elements de -ArgumentList par des espaces sans les proteger, donc un script en ligne
 * est coupe au premier espace et node meurt aussitot (ERR_CONNECTION_REFUSED cote Playwright).
 *
 * Usage : node tools/serve_src.mjs <racine> [port=4179]
 */
import { createServer } from "http";
import { readFile } from "fs";
import { join, normalize, extname, sep } from "path";

const ROOT = normalize(process.argv[2] || "src");
const PORT = Number(process.argv[3] || 4179);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
};

createServer((q, r) => {
  let rel = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  if (rel === "/" || rel === "") rel = "/index.html";
  // Pas de remontee hors de la racine
  const file = normalize(join(ROOT, rel));
  if (!file.startsWith(ROOT + sep) && file !== ROOT) {
    r.writeHead(403).end("");
    return;
  }
  readFile(file, (e, d) => {
    if (e) {
      r.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 " + rel);
      return;
    }
    // Content-Type explicite : sans lui Chromium peut telecharger le HTML au lieu de l'afficher.
    r.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" }).end(d);
  });
}).listen(PORT, () => console.log(`serve_src : ${ROOT} sur http://localhost:${PORT}`));
