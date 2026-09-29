#!/usr/bin/env node
// Showroom FTV Nyon — contrôle structurel du programme SIMPL Windows généré
// (simpl/simpl-windows/ShowroomNyon_Slot2.smw + ShowroomNyon_Slot2.signals.txt).
//
//   node tools/check_slot2.js [fichier.smw]   → « VERT » et code 0, sinon liste des erreurs et code 1
//
// Contrôles :
//   • fin de ligne homogène (celle du socle), blocs [ … ] bien fermés, clés en double dans un bloc ;
//   • en-tête : nom du programme, client ;
//   • signaux (Sg) : H uniques et continus, noms uniques et non vides, type valide (digital / 2 analog / 4 série),
//     suffixe cohérent avec le type (# analogique, $ série, rien en digital) ;
//   • symboles (Sm) : H uniques, parent (PrH) existant, enfants (C) existants et rattachés au bon parent, mC exact,
//     équipement (DvH) existant ;
//   • références I/O : signal existant, index dans la capacité du symbole (mI / tO), au plus un pilote par signal,
//     tout signal référencé, toute entrée pilotée ;
//   • EISC : type du signal conforme à la zone d'index (digital / analog / série), capacité du socle ;
//   • Analog Buffer : I1 digital (enable), autres entrées et sorties analogiques, dimensions cohérentes ;
//   • .signals.txt : même ensemble de signaux, et chaque join pointe sur le bon index EISC.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SMW = path.resolve(process.argv[2] || path.join(ROOT, 'simpl', 'simpl-windows', 'ShowroomNyon_Slot2.smw'));
const TXT = SMW.replace(/\.smw$/i, '.signals.txt');
const SOCLE = path.join(ROOT, 'simpl', 'simpl-windows', '_socle_cp4_eisc.smw');
const CONFIG = path.join(ROOT, 'showroom_config.json');
const errors = [];
const err = m => errors.push(m);

if (!fs.existsSync(SMW)) { console.error('Fichier introuvable : ' + SMW); process.exit(1); }
const raw = fs.readFileSync(SMW, 'latin1');

// ---------------------------------------------------------------- fins de ligne
const crlf = (raw.match(/\r\n/g) || []).length;
const lf = (raw.match(/\n/g) || []).length - crlf;
const cr = (raw.match(/\r/g) || []).length - crlf;
if (cr) err('EOL : ' + cr + ' CR isolés');
if (crlf && lf) err('EOL mélangées : ' + crlf + ' CRLF / ' + lf + ' LF');
if (fs.existsSync(SOCLE)) {
  const socleCrlf = fs.readFileSync(SOCLE, 'latin1').includes('\r\n');
  if (socleCrlf !== (crlf > 0)) err('EOL différente du socle (' + (socleCrlf ? 'CRLF' : 'LF') + ' attendu)');
}
if (!/\n$/.test(raw)) err('le fichier ne se termine pas par une fin de ligne');

// ---------------------------------------------------------------- blocs
const blocks = [];
let cur = null, lineNo = 0;
for (const line of raw.split(/\r?\n/)) {
  lineNo++;
  if (line === '[') { if (cur) err('ligne ' + lineNo + ' : bloc ouvert dans un bloc'); cur = { line: lineNo, kv: new Map(), order: [] }; continue; }
  if (line === ']') { if (!cur) err('ligne ' + lineNo + ' : « ] » sans bloc'); else blocks.push(cur); cur = null; continue; }
  if (!cur) { if (line !== '') err('ligne ' + lineNo + ' hors bloc : ' + line.slice(0, 40)); continue; }
  const i = line.indexOf('=');
  if (i < 1) { err('ligne ' + lineNo + ' sans clé : ' + line.slice(0, 40)); continue; }
  const k = line.slice(0, i), v = line.slice(i + 1);
  if (cur.kv.has(k)) err('ligne ' + lineNo + ' : clé ' + k + ' en double dans le bloc ligne ' + cur.line);
  cur.kv.set(k, v); cur.order.push(k);
}
if (cur) err('bloc ligne ' + cur.line + ' non fermé');
const typed = t => blocks.filter(b => b.kv.get('ObjTp') === t);

// ---------------------------------------------------------------- en-tête
const hd = typed('Hd')[0];
if (!hd) err('en-tête (Hd) absent');
else {
  if (hd.kv.get('PrNm') !== 'ShowroomNyon_Slot2.smw') err('en-tête : PrNm = ' + hd.kv.get('PrNm'));
  if (!/^Fr\xe9quence TV - Showroom Nyon$/.test(hd.kv.get('CltNm') || '')) err('en-tête : CltNm = ' + hd.kv.get('CltNm'));
}

// ---------------------------------------------------------------- signaux
const sg = new Map(), sgNames = new Map();
for (const b of typed('Sg')) {
  const h = +b.kv.get('H'), nm = b.kv.get('Nm'), tp = b.kv.has('SgTp') ? +b.kv.get('SgTp') : 0;
  if (!Number.isInteger(h) || h < 1) { err('signal ligne ' + b.line + ' : H invalide'); continue; }
  if (sg.has(h)) err('signal H=' + h + ' en double');
  if (!nm) err('signal H=' + h + ' sans nom');
  else if (!/^[A-Za-z_][A-Za-z0-9_]*[#$]?$/.test(nm)) err('signal H=' + h + ' : nom invalide « ' + nm + ' »');
  if (nm && sgNames.has(nm)) err('nom de signal en double : ' + nm + ' (H=' + sgNames.get(nm) + ' et H=' + h + ')');
  if (![0, 2, 4].includes(tp)) err('signal ' + nm + ' : SgTp=' + tp + ' inconnu');
  const suf = nm && nm.endsWith('#') ? 2 : nm && nm.endsWith('$') ? 4 : 0;
  if (nm && suf !== tp) err('signal ' + nm + ' : suffixe incohérent avec le type ' + tp);
  sg.set(h, { h, nm, tp, drivers: [], readers: [] });
  if (nm) sgNames.set(nm, h);
}
for (let i = 1; i <= sg.size; i++) if (!sg.has(i)) { err('numérotation des signaux non continue (H=' + i + ' manquant)'); break; }

// ---------------------------------------------------------------- symboles et équipements
const dv = new Map();
for (const b of typed('Dv')) { const h = +b.kv.get('H'); if (dv.has(h)) err('équipement H=' + h + ' en double'); dv.set(h, b); }
const smMap = new Map();
for (const b of typed('Sm')) { const h = +b.kv.get('H'); if (smMap.has(h)) err('symbole H=' + h + ' en double'); smMap.set(h, b); }
const parentOf = new Map();
for (const [h, b] of smMap) {
  const nm = b.kv.get('Nm');
  if (b.kv.has('PrH') && !smMap.has(+b.kv.get('PrH'))) err('symbole ' + h + ' (' + nm + ') : parent PrH=' + b.kv.get('PrH') + ' inexistant');
  if (b.kv.has('DvH') && !dv.has(+b.kv.get('DvH'))) err('symbole ' + h + ' (' + nm + ') : équipement DvH=' + b.kv.get('DvH') + ' inexistant');
  const cs = b.order.filter(k => /^C\d+$/.test(k));
  if (cs.length !== +(b.kv.get('mC') || 0)) err('symbole ' + h + ' (' + nm + ') : mC=' + (b.kv.get('mC') || 0) + ' pour ' + cs.length + ' enfants');
  for (const k of cs) {
    const c = +b.kv.get(k), child = smMap.get(c);
    if (!child) { err('symbole ' + h + ' (' + nm + ') : enfant ' + k + '=' + c + ' inexistant'); continue; }
    if (parentOf.has(c)) err('symbole ' + c + ' rattaché à deux parents (' + parentOf.get(c) + ', ' + h + ')');
    parentOf.set(c, h);
    if (+child.kv.get('PrH') !== h) err('symbole ' + c + ' : PrH=' + child.kv.get('PrH') + ' mais enfant de ' + h);
  }
}
// Un symbole de logique ajouté (SUBSYSTEM ou Analog Buffer) doit être rattaché à un parent.
for (const [h, b] of smMap) if (['SUBSYSTEM', 'Analog Buffer'].includes(b.kv.get('Nm')) && !parentOf.has(h)) err('symbole ' + h + ' (' + b.kv.get('Nm') + ') orphelin');

// ---------------------------------------------------------------- références I/O
const eisc = [...smMap.values()].find(b => b.kv.get('SmC') === '1160');
if (!eisc) err('symbole EISC (SmC=1160) absent');
const n = (b, k) => +(b.kv.get(k) || 0);
for (const [h, b] of smMap) {
  const nm = b.kv.get('Nm');
  const ioKeys = b.order.filter(k => /^[IO]\d+$/.test(k));
  const mI = n(b, 'mI'), tO = n(b, 'tO');
  for (const k of ioKeys) {
    const dir = k[0], idx = +k.slice(1), v = +b.kv.get(k);
    if (dir === 'I' && idx > mI) err(nm + ' ' + k + ' : index > mI=' + mI);
    if (dir === 'O' && idx > tO) err(nm + ' ' + k + ' : index > tO=' + tO);
    if (v === 0) continue;                                     // broche non câblée
    const s = sg.get(v);
    if (!s) { err(nm + ' ' + k + ' : signal H=' + v + ' inexistant'); continue; }
    (dir === 'O' ? s.drivers : s.readers).push(nm + ' ' + k);
    // typage
    let want;
    if (b === eisc) {
      const N1I = n(b, 'n1I'), N2I = n(b, 'n2I'), N1O = n(b, 'n1O');
      if (dir === 'I') want = idx <= N1I ? 0 : idx >= N1I + 2 && idx <= N1I + N2I ? 2 : 4;
      else want = idx <= N1O ? 0 : idx <= N1O + N2I - 1 ? 2 : 4;
      if (want === 4) err('EISC ' + k + ' (' + s.nm + ') : zone série, aucun sériel prévu sur l\'EISC');
    } else if (nm === 'Analog Buffer') want = dir === 'I' && idx === 1 ? 0 : 2;
    if (want !== undefined && s.tp !== want) err(nm + ' ' + k + ' : ' + s.nm + ' de type ' + s.tp + ', attendu ' + want);
  }
  if (nm === 'Analog Buffer') {
    const nI = ioKeys.filter(k => k[0] === 'I').length, nO = ioKeys.filter(k => k[0] === 'O').length;
    if (n(b, 'n1I') !== nI || mI !== nI || n(b, 'n1O') !== nO || n(b, 'mO') !== nO || tO !== nO || nI !== nO + 1)
      err('Analog Buffer ' + h + ' : dimensions incohérentes (n1I=' + n(b, 'n1I') + ' mI=' + mI + ' I=' + nI + ' / n1O=' + n(b, 'n1O') + ' mO=' + n(b, 'mO') + ' tO=' + tO + ' O=' + nO + ')');
  }
}
for (const s of sg.values()) {
  if (s.drivers.length > 1) err('signal ' + s.nm + ' piloté ' + s.drivers.length + ' fois : ' + s.drivers.join(', '));
  if (!s.drivers.length && !s.readers.length) err('signal ' + s.nm + ' jamais référencé');
  if (!s.drivers.length && s.readers.length && !/_Actual#?$/.test(s.nm)) err('signal ' + s.nm + ' lu mais jamais piloté (' + s.readers.join(', ') + ')');
}

// ---------------------------------------------------------------- .signals.txt ↔ SMW
let txtCount = 0;
if (!fs.existsSync(TXT)) err('liste des signaux absente : ' + path.basename(TXT));
else if (eisc) {
  const N1I = n(eisc, 'n1I'), N1O = n(eisc, 'n1O');
  const seen = new Set();
  for (const [i, line] of fs.readFileSync(TXT, 'utf8').split('\n').entries()) {
    if (!line) continue;
    txtCount++;
    const m = line.match(/^([DA]) ([IO-]) +(\d+|-) (\S+)$/);
    if (!m) { err('.signals.txt ligne ' + (i + 1) + ' illisible'); continue; }
    const [, t, dir, j, nm] = m;
    if (seen.has(nm)) err('.signals.txt : ' + nm + ' en double'); seen.add(nm);
    const h = sgNames.get(nm);
    if (!h) { err('.signals.txt : ' + nm + ' absent du SMW'); continue; }
    if ((t === 'A' ? 2 : 0) !== sg.get(h).tp) err('.signals.txt : type de ' + nm + ' incohérent');
    if (dir === '-') continue;
    const idx = t === 'D' ? +j : dir === 'O' ? +j + N1O : +j + N1I + 1;
    if (+eisc.kv.get(dir + idx) !== h) err('.signals.txt : ' + nm + ' join ' + j + ' ≠ EISC ' + dir + idx);
    if (+j > (t === 'D' ? N1I : n(eisc, 'n2I') - 1)) err('.signals.txt : ' + nm + ' join ' + j + ' hors capacité');
  }
  for (const nm of sgNames.keys()) if (!seen.has(nm)) err('.signals.txt : ' + nm + ' manquant');
}

// ---------------------------------------------------------------- pièces du JSON présentes
if (fs.existsSync(CONFIG)) {
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  for (const p of cfg.pieces || []) {
    const nm = 'Room_Active_' + String(p.id).padStart(2, '0');
    if (!sgNames.has(nm)) err('pièce ' + p.id + ' : ' + nm + ' absent');
  }
}

// ---------------------------------------------------------------- verdict
if (errors.length) {
  console.error('ROUGE — ' + errors.length + ' erreur(s) dans ' + path.basename(SMW) + ' :\n - ' + errors.slice(0, 200).join('\n - '));
  process.exit(1);
}
const eiscIO = eisc ? eisc.order.filter(k => /^[IO]\d+$/.test(k)) : [];
console.log('VERT — ' + path.basename(SMW) + ' : ' + blocks.length + ' blocs, ' + sg.size + ' signaux, EISC ' +
  eiscIO.filter(k => k[0] === 'O').length + ' sorties / ' + eiscIO.filter(k => k[0] === 'I').length + ' entrées, ' +
  [...smMap.values()].filter(b => b.kv.get('Nm') === 'Analog Buffer').length + ' Analog Buffers, EOL ' + (crlf ? 'CRLF' : 'LF') +
  ', .signals.txt ' + txtCount + ' lignes.');
