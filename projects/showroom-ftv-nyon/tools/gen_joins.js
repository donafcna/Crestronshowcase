#!/usr/bin/env node
// Showroom FTV Nyon — génère simpl-sharp/ShowroomNyon/Joins.cs depuis showroom_config.json → contrat.
//   node tools/gen_joins.js           écrit Joins.cs
//   node tools/gen_joins.js --check   vérifie que Joins.cs est à jour (code 1 sinon) : contrôle de cohérence
// Nom C# = nom du contrat sans {n}, #, $ ni _ (Light_{n}_Toggle → LightToggle). Plage « a-b » → Xxx = a, XxxLast = b.
'use strict';
const sorted = obj => Object.entries(obj).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'showroom_config.json'), 'utf8'));
const OUT = path.join(ROOT, 'simpl-sharp', 'ShowroomNyon', 'Joins.cs');
const DOC = path.join(ROOT, 'docs', 'CONTRAT-JOINS.md');
const c = cfg.contrat;
const ident = n => n.replace(/\{n\}/g, '').replace(/[#$]/g, '').split('_').filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join('');
function block(title, obj, indent) {
  const lines = [], seen = new Set();
  for (const [k, v] of sorted(obj)) {
    const [a, b] = String(k).split('-').map(Number);
    const id = ident(v.nom);
    if (seen.has(id)) throw new Error('Identifiant C# en double : ' + id);
    seen.add(id);
    const desc = (v.desc || '').replace(/\s+/g, ' ');
    lines.push(`${indent}/// <summary>${v.nom} (${k}, ${v.sens || ''}) — ${desc.replace(/[<>&]/g, ' ')}</summary>`);
    lines.push(`${indent}public const uint ${id} = ${a};`);
    if (b) lines.push(`${indent}public const uint ${id}Last = ${b};`);
  }
  return `${indent.slice(4)}public static class ${title}\n${indent.slice(4)}{\n${lines.join('\n')}\n${indent.slice(4)}}`;
}
const sg = c.signauxGlobaux, bp = c.blocsPieces, L = c.limites;
const src = `// GÉNÉRÉ par tools/gen_joins.js depuis showroom_config.json → contrat (version ${c.version}). NE PAS ÉDITER.
// Contrôle : node tools/gen_joins.js --check (échoue si ce fichier n'est plus aligné sur le JSON).
namespace ShowroomNyon
{
    public static class Joins
    {
        public const int MaxRooms = ${L.piecesMax}, MaxCircuits = ${L.circuitsMax}, MaxScenes = ${L.scenesMax}, MaxActions = ${L.actionsMax};
        public const int MaxHouseActions = ${L.actionsMaisonMax}, MaxServices = ${L.servicesMax}, MaxFavs = ${L.favorisMax}, MaxSources = ${L.sourcesMax};
        public const int MaxCameras = ${L.camerasMax}, MaxBrowse = ${L.parcourirMax};
        public const uint BlockBase = ${bp.base}, BlockStep = ${bp.pas};

${block('Dig', sg.digital, '            ')}

${block('Ana', sg.analog, '            ')}

${block('Ser', sg.serial, '            ')}

        /// <summary>Offsets des blocs pièce : join = BlockBase + (id-1)*BlockStep + offset.</summary>
${block('BlkDig', bp.digital, '            ')}

${block('BlkAna', bp.analog, '            ')}
    }
}
`.replace(/\r?\n/g, '\r\n');

// ---------------------------------------------------------------- docs/CONTRAT-JOINS.md (même source)
const tbl = obj => sorted(obj).map(([k, v]) => `| ${k} | \`${v.nom}\` | ${v.sens || ''} | ${(v.desc || '').replace(/\|/g, '/')} |`).join('\n');
const btbl = obj => sorted(obj).map(([k, v]) => `| +${k} | \`Rnn_${v.nom}\` | ${v.fb ? 'oui' : '—'} | ${v.actual ? 'oui' : '—'} | ${v.requis} |`).join('\n');
const md = `# Showroom FTV Nyon — contrat de joins ${c.version}

Généré par \`node tools/gen_joins.js\` depuis \`showroom_config.json\` → \`contrat\` (ne pas éditer à la main).
Le GUI (\`js/bus.js\` : \`Joins.of(nom, n)\`), le C# (\`Joins.cs\`) et le générateur SIMPL lisent la même source.

## Principe
${c.principe.map(p => '- ' + p).join('\n')}

Sens : → écran vers C# · ↔ commande et retour sur le même join · ← retour seul (jamais sur l'EISC).

Écrans : TSW-1070 ${c.ecrans.tsw.ipid}, XPanel ${c.ecrans.xpanel.ipid}, iPad ${c.ecrans.ipad.ipid} et iPhone ${c.ecrans.iphone.ipid}
(Crestron One, projet \`${c.ecrans.ipad.projet}\`). EISC ${c.eisc.ipid} → ${c.eisc.adresseIp} (slot ${c.eisc.slotCible}).

## Digitaux
| Join | Nom | Sens | Description |
|---|---|---|---|
${tbl(sg.digital)}

## Analogiques
| Join | Nom | Sens | Description |
|---|---|---|---|
${tbl(sg.analog)}

## Sériels (écrans seulement)
| Join | Nom | Sens | Description |
|---|---|---|---|
${tbl(sg.serial)}

## Blocs pièce (C# ↔ slot 2) — join = ${bp.base} + (id − 1) × ${bp.pas} + offset
Sortie \`_fb\` = état tenu par le C#, reçu par le slot 2 ; entrée \`_Actual\` = mesure renvoyée par le slot 2, qui fait foi.

### Digitaux
| Offset | Nom | _fb | _Actual | Fonction requise |
|---|---|---|---|---|
${btbl(bp.digital)}

### Analogiques
| Offset | Nom | _fb | _Actual | Fonction requise |
|---|---|---|---|---|
${btbl(bp.analog)}

## Recette Debugger (slot 2)
1. Afficher Aquarium sur la dalle : \`Room_Select#\` = 1, \`Room_Active_01\` haut.
2. Relax (action 1) : \`Room_Action_1\` en impulsion, \`R01_Action_1_fb\` en impulsion, \`R01_Light_1_Level_fb\` = 40 %.
3. Curseur « Spots » : \`Light_1_Level#\` suit, puis \`R01_Light_1_Level_fb\`.
4. Deezer (action 2) : \`Room_Action_2\`, \`R01_Music_Playing_fb\` haut, \`R01_Music_Service_fb\` = 1.
5. Forcer \`R05_Light_3_Level_Actual\` depuis le Debugger : la dalle affiche le niveau reçu (le slot 2 fait foi).
6. Bouton Marche/Arrêt de la barre du bas : \`Room_Off\`, tous les \`R01_*_fb\` retombent.
7. Accueil, Goodbye : \`House_Action_2\`, toutes les pièces éteintes. Console CP4 : \`showroomstate\`.
`.replace(/\r?\n/g, '\n');

if (process.argv.includes('--check')) {
  if (!fs.existsSync(DOC) || fs.readFileSync(DOC, 'utf8') !== md) { console.error('docs/CONTRAT-JOINS.md n\'est pas aligné : lancer node tools/gen_joins.js'); process.exit(1); }
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== src) { console.error('Joins.cs n\'est pas aligné sur showroom_config.json : lancer node tools/gen_joins.js'); process.exit(1); }
  console.log('Joins.cs aligné sur le contrat ' + c.version + '.');
} else { fs.writeFileSync(OUT, src); fs.mkdirSync(path.dirname(DOC), { recursive: true }); fs.writeFileSync(DOC, md); console.log('Joins.cs et docs/CONTRAT-JOINS.md écrits.'); }
