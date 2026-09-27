#!/usr/bin/env node
// Appartement Crans-Montana — contrôle structurel du .smw généré (sans SIMPL Windows).
//   node tools/check_slot2.js [simpl/simpl-windows/AppartementCrans_Slot2.smw]
// Vérifie : fins de ligne homogènes, handles de signaux uniques, noms uniques, chaque I/O du symbole
// EISC pointe sur un signal existant, aucun doublon d'index I/O, chaque signal est référencé,
// type de signal cohérent avec la plage (digital / analog / série), parents (PrH) existants,
// capacités du symbole respectées, en-tête du projet, caractères hors ASCII dans les noms.
// Code de sortie 0 si tout est vert.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.resolve(process.argv[2] || path.join(ROOT, 'simpl', 'simpl-windows', 'AppartementCrans_Slot2.smw'));
const raw = fs.readFileSync(FILE, 'latin1');
const errors = [], notes = [];

// Fins de ligne
const crlf = (raw.match(/\r\n/g) || []).length, lf = (raw.match(/(^|[^\r])\n/g) || []).length;
if (crlf && lf) errors.push('fins de ligne mixtes : ' + crlf + ' CRLF / ' + lf + ' LF');
notes.push('fins de ligne : ' + (crlf ? 'CRLF' : 'LF'));
if (/[^\x00-\x7F]/.test(raw)) errors.push('caractères hors ASCII dans le fichier');

// Blocs
const blocks = raw.split(/\r?\n(?=\[\r?\n)/).map(b => b.replace(/^\[\r?\n/, '').replace(/\r?\n\]\r?\n?$/, ''));
const parse = b => { const o = {}; for (const l of b.split(/\r?\n/)) { const i = l.indexOf('='); if (i > 0) o[l.slice(0, i)] = l.slice(i + 1); } return o; };
const objs = blocks.map(parse).filter(o => o.ObjTp);
const sigs = objs.filter(o => o.ObjTp === 'Sg');
const sms = objs.filter(o => o.ObjTp === 'Sm');
const dvs = objs.filter(o => o.ObjTp === 'Dv');
const hd = objs.find(o => o.ObjTp === 'Hd');
if (!hd) errors.push('en-tête (ObjTp=Hd) absent');
else {
  if (hd.PrNm !== 'AppartementCrans_Slot2.smw') errors.push('PrNm = ' + hd.PrNm);
  notes.push('projet ' + hd.PrNm + ' / client ' + hd.CltNm);
}

// Signaux : handles et noms uniques
const byH = new Map(), byName = new Map();
for (const s of sigs) {
  const h = +s.H;
  if (byH.has(h)) errors.push('handle de signal en double : ' + h);
  byH.set(h, s);
  if (byName.has(s.Nm)) errors.push('nom de signal en double : ' + s.Nm);
  byName.set(s.Nm, h);
  if (!/^[A-Za-z0-9_#$]+$/.test(s.Nm)) errors.push('nom de signal suspect : ' + s.Nm);
}

// Parents
const smH = new Set(sms.map(o => +o.H)), dvH = new Set(dvs.map(o => +o.H));
for (const o of sms) if (o.PrH !== undefined && !smH.has(+o.PrH)) errors.push('symbole H=' + o.H + ' : parent PrH=' + o.PrH + ' inexistant');
for (const o of dvs) if (o.PrH !== undefined && +o.PrH !== 1 && !dvH.has(+o.PrH)) errors.push   // PrH=1 : racine système('device H=' + o.H + ' : parent PrH=' + o.PrH + ' inexistant');
for (const o of sms) for (const [k, v] of Object.entries(o)) if (/^C\d+$/.test(k) && !smH.has(+v)) errors.push('symbole H=' + o.H + ' : enfant ' + k + '=' + v + ' inexistant');

// Symbole EISC
const eisc = sms.find(o => o.SmC === '1160');
if (!eisc) errors.push('symbole EISC (SmC=1160) absent');
const used = new Set();
let counts = { I: { D: 0, A: 0 }, O: { D: 0, A: 0, S: 0 } };
if (eisc) {
  const N1I = +eisc.n1I, N2I = +eisc.n2I, N1O = +eisc.n1O, MI = +eisc.mI, MO = +eisc.mO, TO = +eisc.tO;
  const IN_A = N1I + 1, OUT_A = N1O, OUT_S = N1O + N2I - 1;
  notes.push('EISC n1I=' + N1I + ' n2I=' + N2I + ' n1O=' + N1O + ' (mI=' + MI + ' mO=' + MO + ' tO=' + TO + ')');
  const seen = { I: new Set(), O: new Set() };
  for (const [k, v] of Object.entries(eisc)) {
    const m = k.match(/^([IO])(\d+)$/); if (!m) continue;
    const dir = m[1], idx = +m[2], h = +v;
    if (seen[dir].has(idx)) errors.push('index ' + k + ' en double'); seen[dir].add(idx);
    const s = byH.get(h);
    if (!s) { errors.push(k + '=' + v + ' : signal inexistant'); continue; }
    used.add(h);
    const tp = +(s.SgTp || 0);
    let expect, cls;
    if (dir === 'I') {
      if (idx > MI) errors.push(k + ' dépasse mI=' + MI);
      if (idx <= N1I) { expect = 0; cls = 'D'; } else { expect = 2; cls = 'A'; if (idx - IN_A > N2I - 1) errors.push(k + ' analogique hors plage'); }
    } else {
      if (idx > TO) errors.push(k + ' dépasse tO=' + TO);
      if (idx <= N1O) { expect = 0; cls = 'D'; } else if (idx <= OUT_S) { expect = 2; cls = 'A'; } else { expect = 4; cls = 'S'; }
    }
    if (tp !== expect) errors.push(k + ' (' + s.Nm + ') : SgTp=' + tp + ' attendu ' + expect);
    counts[dir][cls]++;
  }
  // Ordre croissant des I puis des O dans le bloc (SIMPL Windows le relit tel quel)
  const keys = Object.keys(eisc).filter(k => /^[IO]\d+$/.test(k));
  let last = { I: 0, O: 0 };
  for (const k of keys) { const d = k[0], n = +k.slice(1); if (n <= last[d]) errors.push('ordre des index non croissant à ' + k); last[d] = n; }
}
// Signaux référencés par les autres symboles (buffers, etc.)
for (const o of sms) if (o !== eisc) for (const [k, v] of Object.entries(o)) if (/^[IO]\d+$/.test(k)) { if (!byH.has(+v)) errors.push('symbole H=' + o.H + ' ' + k + '=' + v + ' : signal inexistant'); used.add(+v); }
const orphelins = [...byH.keys()].filter(h => !used.has(h));
if (orphelins.length) errors.push(orphelins.length + ' signal(aux) non référencé(s) : ' + orphelins.slice(0, 5).map(h => byH.get(h).Nm).join(', ') + (orphelins.length > 5 ? '…' : ''));

console.log('Contrôle ' + path.relative(ROOT, FILE));
for (const n of notes) console.log('  ' + n);
console.log('  signaux : ' + sigs.length + ' ; entrées EISC : ' + counts.I.D + ' D + ' + counts.I.A + ' A ; sorties EISC : ' + counts.O.D + ' D + ' + counts.O.A + ' A + ' + counts.O.S + ' S');
if (errors.length) { console.error('ROUGE : ' + errors.length + ' défaut(s)\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('VERT : structure cohérente.');
