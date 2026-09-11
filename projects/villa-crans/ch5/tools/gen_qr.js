#!/usr/bin/env node
/**
 * gen_qr.js — Génère un QR code par pièce de villa_config.json.
 *
 * Chaque QR ouvre le GUI Web XPanel hébergé sur le CP4 dans le navigateur du téléphone,
 * directement sur la bonne pièce, sans application Crestron :
 *
 *     https://<CP4>/villaftv/index.html?ipId=0x1N&room=N[&authtoken=...]
 *
 *   - ipId  : IP-ID Web XPanel dédié à la pièce (0x10 + id de pièce, déclaré côté C#).
 *   - room  : id de la pièce (le GUI sélectionne la pièce à la connexion ; le C# la force aussi).
 *   - authtoken : optionnel, évite la page de login du CP4 (authentication ON).
 *
 * Usage :
 *   node tools/gen_qr.js [--base https://192.168.1.200/villaftv/index.html] [--out qr]
 *                        [--config villa_config.json] [--token XXXX] [--ipid-base 0x10]
 *                        [--wifi "Villa Crans"] [--size 600]
 *
 * Sorties (dossier --out, défaut ./qr) :
 *   NN_<slug>.png / NN_<slug>.svg   un QR par pièce
 *   index.html                       planche imprimable (A4, une carte par pièce)
 *   qr_manifest.json                 liste pièce → URL
 *
 * Dépendance : npm i -D qrcode
 */
'use strict';

const fs = require('fs');
const path = require('path');

let QRCode;
try {
    QRCode = require('qrcode');
} catch (e) {
    console.error('Module "qrcode" introuvable. Installez-le : npm install --save-dev qrcode');
    process.exit(1);
}

// --- Arguments ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function opt(name, def) {
    const i = args.indexOf('--' + name);
    if (i === -1) return def;
    const v = args[i + 1];
    return (v === undefined || v.startsWith('--')) ? true : v;
}

const root = path.resolve(__dirname, '..');
const configPath = path.resolve(root, opt('config', 'villa_config.json'));
const outDir = path.resolve(root, opt('out', 'qr'));
const baseUrl = opt('base', 'https://192.168.1.200/villaftv/index.html');
const token = opt('token', '');
const ipidBase = parseInt(opt('ipid-base', '0x10'), 16);
const wifiName = opt('wifi', '');
const size = parseInt(opt('size', '600'), 10);

if (isNaN(ipidBase)) { console.error('--ipid-base invalide (attendu hexa, ex. 0x10)'); process.exit(1); }

// --- Lecture de la configuration ---------------------------------------------------------
let cfg;
try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    console.error('Impossible de lire ' + configPath + ' : ' + e.message);
    process.exit(1);
}
const pieces = (cfg.pieces || []).filter(p => p && typeof p.id === 'number');
if (!pieces.length) { console.error('Aucune pièce dans ' + configPath); process.exit(1); }

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'et').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();

function buildUrl(piece) {
    const ipId = '0x' + (ipidBase + piece.id).toString(16).toUpperCase().padStart(2, '0');
    const u = new URL(baseUrl);
    u.searchParams.set('ipId', ipId);
    u.searchParams.set('room', String(piece.id));
    if (token) u.searchParams.set('authtoken', token);
    return { ipId, url: u.toString() };
}

// --- Génération --------------------------------------------------------------------------
fs.mkdirSync(outDir, { recursive: true });

(async () => {
    const manifest = [];
    const cards = [];
    for (const piece of pieces) {
        if (piece.id < 1 || piece.id > 30) {
            console.warn('Pièce ' + piece.id + ' hors contrat (1..30), ignorée.');
            continue;
        }
        const { ipId, url } = buildUrl(piece);
        const file = String(piece.id).padStart(2, '0') + '_' + slugify(piece.nom || ('piece' + piece.id));
        const pngPath = path.join(outDir, file + '.png');
        const svgPath = path.join(outDir, file + '.svg');

        const qrOpts = { errorCorrectionLevel: 'M', margin: 2 };
        await QRCode.toFile(pngPath, url, Object.assign({ width: size }, qrOpts));
        const svg = await QRCode.toString(url, Object.assign({ type: 'svg' }, qrOpts));
        fs.writeFileSync(svgPath, svg, 'utf8');

        manifest.push({ id: piece.id, nom: piece.nom, icone: piece.icone || '', ipId, url, png: path.basename(pngPath), svg: path.basename(svgPath) });
        cards.push({ piece, ipId, url, svg });
        console.log('  ' + ipId + '  ' + String(piece.id).padStart(2) + '  ' + (piece.nom || '') + '  ->  ' + file + '.png');
    }

    fs.writeFileSync(path.join(outDir, 'qr_manifest.json'), JSON.stringify({
        genere: new Date().toISOString(), base: baseUrl, ipidBase: '0x' + ipidBase.toString(16).toUpperCase(), pieces: manifest
    }, null, 2), 'utf8');

    fs.writeFileSync(path.join(outDir, 'index.html'), buildSheet(cards), 'utf8');
    console.log('\n' + cards.length + ' QR générés dans ' + outDir);
    console.log('Planche imprimable : ' + path.join(outDir, 'index.html'));
})().catch(e => { console.error(e); process.exit(1); });

// --- Planche imprimable ------------------------------------------------------------------
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function buildSheet(cards) {
    const wifiLine = wifiName ? '<p class="hint">Connectez-vous au Wi-Fi <b>' + esc(wifiName) + '</b>, puis scannez.</p>'
                              : '<p class="hint">Connectez-vous au Wi-Fi de la villa, puis scannez.</p>';
    const items = cards.map(c => `
    <section class="card">
      <h2>${esc(c.piece.icone || '🏠')} ${esc(c.piece.nom)}</h2>
      <div class="qr">${c.svg}</div>
      ${wifiLine}
      <p class="meta">Pièce ${c.piece.id} · IP-ID ${esc(c.ipId)}</p>
      <p class="url">${esc(c.url)}</p>
    </section>`).join('\n');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Villa Crans — QR codes par pièce</title>
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 16px; background: #f4f4f5; color: #18181b; }
  header { margin: 0 0 16px; }
  header h1 { font-size: 20px; margin: 0 0 4px; }
  header p { margin: 0; color: #52525b; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; text-align: center; break-inside: avoid; page-break-inside: avoid; }
  .card h2 { font-size: 18px; margin: 0 0 10px; }
  .qr svg { width: 200px; height: 200px; }
  .hint { font-size: 13px; color: #3f3f46; margin: 10px 0 4px; }
  .meta { font-size: 11px; color: #71717a; margin: 4px 0 0; }
  .url { font-size: 9px; color: #a1a1aa; word-break: break-all; margin: 2px 0 0; }
  @media print {
    body { background: #fff; padding: 0; }
    header { display: none; }
    .grid { grid-template-columns: repeat(2, 1fr); gap: 10mm; }
    .card { border: 1px solid #ccc; border-radius: 6px; }
    .qr svg { width: 55mm; height: 55mm; }
  }
</style>
</head>
<body>
<header>
  <h1>Villa Crans — QR codes par pièce</h1>
  <p>Généré le ${esc(new Date().toLocaleString('fr-FR'))} · base ${esc(baseUrl)} · ${cards.length} pièces · Ctrl+P pour imprimer (A4, 2 colonnes).</p>
</header>
<div class="grid">
${items}
</div>
</body>
</html>
`;
}
