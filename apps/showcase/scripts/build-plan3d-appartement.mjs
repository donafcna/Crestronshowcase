// Régénère public/plan3d/appartement-crans.json depuis projects/appartement-crans/villa_config.json.
// Seuls les champs de disposition 3D sont lus : aucun nom de client, d'adresse ni de personne.
// Usage : node scripts/build-plan3d-appartement.mjs [chemin/villa_config.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || path.join(here, '../../../projects/appartement-crans/villa_config.json'));
const target = path.join(here, '../public/plan3d/appartement-crans.json');
const config = JSON.parse(fs.readFileSync(source, 'utf8'));

// La disposition (pieces[].plan3d) est la source unique : projects/appartement-crans/tools/build_config.py.
const LAYOUT = {};
// Pièces équipées d'enceintes seulement (audioVideo actif sans téléviseur).
const SPEAKERS_ONLY = new Set([2, 3]);

const pieces = config.pieces
  .filter((p) => p.actif !== false && p.plan3d)
  .map((p) => {
    const plan = { ...p.plan3d, ...(LAYOUT[p.id] || {}) };
    const piece = { id: p.id, nom: p.nom, type: plan.type, niveau: p.niveau || 0, x: plan.x, z: plan.z, w: plan.w, d: plan.d, windowWall: plan.windowWall || 'none' };
    if (p.pilotages?.audioVideo?.actif === false) piece.av = false;
    else if (SPEAKERS_ONLY.has(p.id)) piece.tv = false;
    if (p.pilotages?.cvc?.actif === false) piece.cvc = false;
    if (p.pilotages?.moteurs?.actif === false) piece.moteurs = false;
    if (plan.type === 'terrasse') piece.balcon = true;
    piece.banne = false;   // résidence : balcons abrités par la toiture, aucun store banne de façade
    // Trémie au-dessus de l'escalier de l'entrée (mêmes coordonnées locales que la volée dessinée dans interiors.js).
    if (plan.type === 'escalier') piece.stairVoid = { x: 0.45, z: 1.6, w: 1.15, d: 3.3 };
    return piece;
  });

// Contrôle de chevauchement par niveau.
for (const a of pieces) for (const b of pieces) {
  if (a.id >= b.id || a.niveau !== b.niveau) continue;
  const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.z < b.z + b.d && b.z < a.z + a.d;
  if (overlap) throw new Error(`Chevauchement niveau ${a.niveau} : pièces ${a.id} et ${b.id}`);
}

const out = { style: 'chaleureux', enveloppe: 'residence', baseElevation: 18, fpsMax: 60, pieces };
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`${path.relative(process.cwd(), target)} : ${pieces.length} pièces, niveaux ${[...new Set(pieces.map((p) => p.niveau))].join('/')}`);
