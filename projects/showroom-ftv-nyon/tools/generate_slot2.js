#!/usr/bin/env node
// Showroom FTV Nyon — génère le programme SIMPL Windows du slot 2 (ShowroomNyon_Slot2.smw) à partir de
// showroom_config.json (source unique) et du socle CP4 + EISC (simpl/simpl-windows/_socle_cp4_eisc.smw,
// copie du socle nu de FTV Home).
//
//   node tools/generate_slot2.js            → simpl/simpl-windows/ShowroomNyon_Slot2.smw (écrasé)
//                                             + ShowroomNyon_Slot2.signals.txt (liste join → nom)
//   node tools/generate_slot2.js --dry-run  → rapport seul, aucun fichier écrit
//
// Ce que le fichier contient :
//   • CP4 + EISC « Packed » IP-ID F0 → 127.0.0.2 (dimension du socle : 2732 joins de chaque type).
//   • SORTIES du symbole = ce que le slot 2 REÇOIT : chaque action de la GUI sous son nom nu
//     (Light_3_Toggle, Music_PlayPause, Video_Remote_Menu…), Room_Select# (a10) et Room_Active_nn
//     (d11-40, un seul haut) posés AVANT chaque action, et les états tenus par le C# par pièce
//     (Rnn_xxx_fb, blocs 1000 + (id-1)*100).
//   • ENTRÉES du symbole = ce que le slot 2 RENVOIE : mesures réelles Rnn_xxx_Actual.
//   • Les signaux de sens « ← » (retours écran calculés par le C#) ne passent jamais sur l'EISC ;
//     aucun sériel n'y passe non plus (les textes restent entre le C# et les écrans).
//   • Un sous-système « Piece nn » par pièce avec un Analog Buffer validé par Room_Active_nn.
//
// Dimensionnement : chaque famille {n} n'est développée que sur le nombre réellement utilisé dans le JSON
// (circuits, scènes, actions, services, favoris, parcourir, sources, caméras). Un nombre qui dépasse la plage
// du contrat ou la limite déclarée est une ERREUR (jamais tronqué en silence).
//
// Mapping des index du symbole EISC (vérifié sur le socle Villa Crans, identique à FTV Home) :
//   digital  : index = join (entrées et sorties)
//   analog   : entrée = join + n1I + 1 ; sortie = join + n1O
//   série    : sortie = join + n1O + n2I − 1   (non utilisé ici)

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'showroom_config.json');
const BASE = path.join(ROOT, 'simpl', 'simpl-windows', '_socle_cp4_eisc.smw');
const OUT = path.join(ROOT, 'simpl', 'simpl-windows', 'ShowroomNyon_Slot2.smw');
const PRG_NAME = 'ShowroomNyon_Slot2';
const CLIENT = 'Fréquence TV - Showroom Nyon';   // tiret ASCII : aucun caractère hors latin1 dans l'en-tête SMW
const DRY = process.argv.includes('--dry-run');

function fail(msg) { console.error('ERREUR : ' + msg); process.exit(1); }

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const contrat = cfg.contrat;
if (!contrat) fail('section « contrat » absente de showroom_config.json');
const lim = contrat.limites || {};
if (!fs.existsSync(BASE)) fail('socle introuvable : ' + path.relative(ROOT, BASE));
let raw = fs.readFileSync(BASE, 'latin1');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';

// ---------------------------------------------------------------- socle : inventaire
const blocks = raw.split(/\r?\n(?=\[\r?\n)/);   // chaque bloc commence par "[\n"
const sgCount = blocks.filter(b => /^\[\r?\nObjTp=Sg\r?\n/.test(b)).length;
if (sgCount) fail('le socle contient encore ' + sgCount + ' signaux : utiliser _socle_cp4_eisc.smw (socle nu).');
const smRe = /\[\r?\nObjTp=Sm\r?\nH=21\r?\nSmC=1160[\s\S]*?\r?\n\]/;
const sm = raw.match(smRe);
if (!sm) fail('symbole EISC (H=21, SmC=1160) introuvable dans le socle');
const dim = k => parseInt(sm[0].match(new RegExp('^' + k + '=(\\d+)$', 'm'))[1], 10);
const N1I = dim('n1I'), N2I = dim('n2I'), N1O = dim('n1O');
const IN_A = N1I + 1, OUT_A = N1O;
const CAP = { d: N1I, a: N2I - 1 };
let maxSmH = 0;
for (const m of raw.matchAll(/ObjTp=Sm\r?\nH=(\d+)/g)) maxSmH = Math.max(maxSmH, +m[1]);

// IP-ID de l'EISC du socle = contrat.eisc.ipid
const dvEisc = raw.match(/\[\r?\nObjTp=Dv\r?\nNm=Ethernet Intersystem Communications \(Packed\)[\s\S]*?\r?\n\]/);
if (!dvEisc) fail('équipement EISC (Dv) introuvable dans le socle');
const ad = (dvEisc[0].match(/^Ad=([0-9A-Fa-f]+)$/m) || [])[1];
if (contrat.eisc && contrat.eisc.ipid && parseInt(contrat.eisc.ipid, 16) !== parseInt(ad, 16))
  fail('IP-ID EISC du socle (' + ad + ') ≠ contrat.eisc.ipid (' + contrat.eisc.ipid + ')');

// ---------------------------------------------------------------- signaux
const signals = [];               // {h, name, type, join, dir}  type: 0 digital, 2 analog
const byName = new Map();
let nextH = 1;
function sig(name, type) {
  if (byName.has(name)) { const s = byName.get(name); if (s.type !== type) fail('type incohérent pour ' + name); return s.h; }
  const s = { h: nextH++, name, type };
  signals.push(s); byName.set(name, s); return s.h;
}
const inputs = {}, outputs = {};   // index EISC -> h
const eiscNames = new Set();       // un nom = un seul index sur le symbole EISC
const joinList = [];               // {kind, dir, join, name} pour .signals.txt
const report = { dOut: 0, dIn: 0, aOut: 0, aIn: 0, rooms: [], buffers: 0 };
function setIdx(map, idx, h, what) {
  if (map[idx] !== undefined) fail('COLLISION ' + what + ' index ' + idx + ' : ' + signals[map[idx] - 1].name + ' / ' + signals[h - 1].name);
  map[idx] = h;
}
function wire(kind, dir, j, name) {
  if (!Number.isInteger(j) || j < 1) fail('join invalide ' + j + ' pour ' + name);
  const cap = kind === 'd' ? CAP.d : CAP.a;
  if (j > cap) fail((kind === 'd' ? 'digital ' : 'analog ') + j + ' (' + name + ') hors capacité du socle (' + cap + ')');
  if (eiscNames.has(name)) fail('nom en double sur l\'EISC : ' + name);
  eiscNames.add(name);
  const h = sig(name, kind === 'd' ? 0 : 2);
  if (kind === 'd') setIdx(dir === 'O' ? outputs : inputs, j, h, dir === 'O' ? 'sortie digitale' : 'entrée digitale');
  else setIdx(dir === 'O' ? outputs : inputs, j + (dir === 'O' ? OUT_A : IN_A), h, dir === 'O' ? 'sortie analogique' : 'entrée analogique');
  report[kind + (dir === 'O' ? 'Out' : 'In')]++;
  joinList.push({ kind, dir, join: j, name });
}
const dout = (j, n) => wire('d', 'O', j, n);
const din = (j, n) => wire('d', 'I', j, n);
const aout = (j, n) => wire('a', 'O', j, n);
const ain = (j, n) => wire('a', 'I', j, n);

// ---------------------------------------------------------------- pièces
const rooms = cfg.pieces || [];
if (!rooms.length) fail('aucune pièce dans showroom_config.json');
const ids = new Set();
for (const p of rooms) {
  if (!Number.isInteger(p.id)) fail('pièce sans id entier : ' + JSON.stringify(p.nom));
  if (ids.has(p.id)) fail('id de pièce en double : ' + p.id);
  ids.add(p.id);
  if (p.id < 1 || (lim.piecesMax && p.id > lim.piecesMax)) fail('pièce ' + p.id + ' hors 1..' + lim.piecesMax);
}
const pil = (p, f) => (p.pilotages && p.pilotages[f]) || null;
const on = (p, f) => !!(pil(p, f) && pil(p, f).actif);
const nn = id => String(id).padStart(2, '0');
const circuitsOf = p => on(p, 'eclairages') ? (pil(p, 'eclairages').circuits || []).length : 0;
const scenesOf = p => on(p, 'eclairages') ? (pil(p, 'eclairages').scenes || []).length : 0;
const actionsOf = p => (p.actions || []).length;
const max = arr => Math.max(0, ...arr);

// ---------------------------------------------------------------- dimensionnement réel (JSON)
const services = (cfg.musique && cfg.musique.services) || [];
const telecommande = (cfg.video && cfg.video.telecommande) || [];
const N = {
  houseActions: ((cfg.maison && cfg.maison.actions) || []).length,
  roomActions: max(rooms.map(actionsOf)),
  scenes: max(rooms.map(scenesOf)),
  circuits: max(rooms.map(circuitsOf)),
  services: services.length,
  favoris: ((cfg.musique && cfg.musique.favoris) || []).length,
  parcourir: max(services.map(s => (s.parcourir || []).length)),
  sources: ((cfg.video && cfg.video.sources) || []).length,
  remote: 8,
  cameras: (cfg.cameras || []).length,
};
for (const [k, l] of [['houseActions', 'actionsMaisonMax'], ['roomActions', 'actionsMax'], ['scenes', 'scenesMax'], ['circuits', 'circuitsMax'],
  ['services', 'servicesMax'], ['favoris', 'favorisMax'], ['parcourir', 'parcourirMax'], ['sources', 'sourcesMax'], ['cameras', 'camerasMax']])
  if (lim[l] !== undefined && N[k] > lim[l]) fail(k + ' = ' + N[k] + ' dépasse contrat.limites.' + l + ' = ' + lim[l]);

// Touches de la télécommande : « Play/Pause » → PlayPause
if (telecommande.length !== N.remote) fail('video.telecommande doit compter ' + N.remote + ' touches (trouvé ' + telecommande.length + ')');
const remoteKeys = telecommande.map(t => String(t).normalize('NFD').replace(/[^A-Za-z0-9]/g, ''));
if (remoteKeys.some(k => !k) || new Set(remoteKeys).size !== remoteKeys.length) fail('touches de télécommande vides ou en double : ' + remoteKeys.join(', '));

// Étend "111-130" + "Light_{n}_Toggle" en [{join, n, name}] limité à `count` ; dépassement = erreur.
function parseRange(range) {
  const m = String(range).match(/^(\d+)(?:-(\d+))?$/);
  if (!m) fail('plage de joins illisible : ' + range);
  const a = +m[1], b = m[2] ? +m[2] : a;
  if (b < a) fail('plage inversée : ' + range);
  return [a, b];
}
function expand(range, name, count) {
  const [a, b] = parseRange(range);
  if (!name.includes('{n}')) return [{ join: a, n: 0, name }];
  if (count > b - a + 1) fail(name + ' : ' + count + ' instances demandées, la plage ' + range + ' n\'en contient que ' + (b - a + 1));
  const out = [];
  for (let n = 1; n <= count; n++) out.push({ join: a + n - 1, n, name: name.replace('{n}', n) });
  return out;
}
// Nombre d'instances d'une famille globale {n} (undefined = signal simple).
const COUNTS = {
  'House_Action_{n}': N.houseActions, 'Room_Action_{n}': N.roomActions, 'Light_Scene_{n}': N.scenes,
  'Light_{n}_Toggle': N.circuits, 'Light_{n}_Level#': N.circuits, 'Music_Service_{n}': N.services,
  'Music_Fav_{n}': N.favoris, 'Music_Browse_{n}': N.parcourir, 'Video_Source_{n}': N.sources,
  'Video_Remote_{n}': N.remote, 'Camera_Select_{n}': N.cameras,
};

// ---------------------------------------------------------------- 1. globaux : actions reçues (sorties)
const G = contrat.signauxGlobaux || {};
for (const [type, fn] of [['digital', dout], ['analog', aout]]) {
  for (const [range, def] of Object.entries(G[type] || {})) {
    if (!['→', '↔', '←'].includes(def.sens)) fail('sens inconnu « ' + def.sens + ' » pour ' + def.nom);
    if (def.sens === '←') continue;                                   // retour écran, jamais sur l'EISC
    if (def.nom === 'Room_Select_{n}') {                              // → Room_Active_nn, join = 10 + id
      const [a, b] = parseRange(range);
      for (const p of rooms) {
        const j = a - 1 + p.id;
        if (j > b) fail('pièce ' + p.id + ' : Room_Select join ' + j + ' hors plage ' + range);
        fn(j, 'Room_Active_' + nn(p.id));
      }
      continue;
    }
    if (def.nom.includes('{n}')) {
      if (!(def.nom in COUNTS)) fail('famille ' + def.nom + ' (' + range + ') sans règle de dimensionnement dans le générateur');
      for (const e of expand(range, def.nom, COUNTS[def.nom]))
        fn(e.join, def.nom === 'Video_Remote_{n}' ? 'Video_Remote_' + remoteKeys[e.n - 1] : e.name);
    } else fn(parseRange(range)[0], def.nom);
  }
}
// Aucun sériel en entrée ni en sortie : on le signale seulement.
const serialSkipped = Object.keys(G.serial || {}).length;

// ---------------------------------------------------------------- 2. blocs pièce
const BP = contrat.blocsPieces || {};
const BASE_J = BP.base, STEP = BP.pas || BP.taille;
if (!Number.isInteger(BASE_J) || !Number.isInteger(STEP)) fail('contrat.blocsPieces.base / pas manquants');
if (BP.serial && Object.keys(BP.serial).length) fail('blocsPieces.serial non prévu (aucun sériel sur l\'EISC)');
function fnActive(p, f) {
  if (f === '*') return true;
  if (!['eclairages', 'audio', 'video'].includes(f)) fail('fonction « requis » inconnue : ' + f);
  return on(p, f);
}
function fnCount(p, def) {
  if (/^Light_\{n\}_/.test(def.nom)) return circuitsOf(p);
  if (def.nom === 'Light_Scene_{n}') return scenesOf(p);
  if (def.nom === 'Action_{n}') return actionsOf(p);
  fail('bloc pièce : famille ' + def.nom + ' sans règle de dimensionnement');
}
for (const p of rooms) {
  if (p.intersystem === false) continue;
  const b = BASE_J + (p.id - 1) * STEP, R = 'R' + nn(p.id) + '_';
  let n = 0;
  for (const [type, table] of [['digital', BP.digital || {}], ['analog', BP.analog || {}]]) {
    for (const [range, def] of Object.entries(table)) {
      const [, hi] = parseRange(range);
      if (hi >= STEP) fail('bloc pièce : offset ' + range + ' ≥ pas ' + STEP);
      if (!fnActive(p, def.requis)) continue;
      const cnt = def.nom.includes('{n}') ? fnCount(p, def) : undefined;
      for (const e of expand(range, def.nom, cnt)) {
        const j = b + e.join;
        if (type === 'digital') {
          if (def.fb) { dout(j, R + e.name + '_fb'); n++; }
          if (def.actual) { din(j, R + e.name + '_Actual'); n++; }
        } else {
          if (def.fb) { aout(j, R + e.name + '_fb#'); n++; }
          if (def.actual) { ain(j, R + e.name + '_Actual#'); n++; }
        }
      }
    }
  }
  report.rooms.push({ id: p.id, nom: p.nom, base: b, signaux: n });
}

// ---------------------------------------------------------------- 3. réécriture du symbole EISC
const head = sm[0].split(/\r?\n/).filter(l => l && l !== '[' && l !== ']' && !/^[IO]\d+=/.test(l) && !/^(mI|mO|tO)=/.test(l));
const miLine = sm[0].match(/^mI=\d+$/m)[0], moLine = sm[0].match(/^mO=\d+$/m)[0], toLine = sm[0].match(/^tO=\d+$/m)[0];
const iK = Object.keys(inputs).map(Number).sort((a, b) => a - b), oK = Object.keys(outputs).map(Number).sort((a, b) => a - b);
const eiscBlock = ['[', ...head, miLine, ...iK.map(k => 'I' + k + '=' + inputs[k]), moLine, toLine, ...oK.map(k => 'O' + k + '=' + outputs[k]), ']'].join(EOL);
raw = raw.replace(smRe, eiscBlock);

// ---------------------------------------------------------------- 4. sous-systèmes « Piece nn » : Analog Buffer validé par Room_Active_nn
const logicRe = /\[\r?\nObjTp=Sm\r?\nH=4\r?\nSmC=156[\s\S]*?\r?\n\]/;
const logic = raw.match(logicRe);
if (!logic) fail('dossier Logic (H=4) introuvable');
const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '');
let h = maxSmH;
const newSm = [];
const logicChildren = [];
for (const p of rooms) {
  const R = 'R' + nn(p.id) + '_';
  const ins = [];
  for (let i = 1; i <= circuitsOf(p); i++) ins.push(['Light_' + i + '_Level#', R + 'Light_' + i + '_Level_Buf#']);
  if (on(p, 'audio')) ins.push(['Music_Volume#', R + 'Music_Volume_Buf#']);
  if (on(p, 'video')) ins.push(['Video_Volume#', R + 'Video_Volume_Buf#']);
  if (!ins.length) continue;
  for (const [src] of ins) if (!byName.has(src)) fail('buffer pièce ' + p.id + ' : ' + src + ' absent de l\'EISC');
  const subH = ++h, bufH = ++h;
  logicChildren.push(subH);
  newSm.push(['[', 'ObjTp=Sm', 'H=' + subH, 'SmC=156', 'Nm=SUBSYSTEM', 'ObjVer=1', 'SmVr=1241', 'PrH=4', 'CF=2', 'Cmn1=Piece ' + nn(p.id) + ' - ' + plain(p.nom), 'mC=1', 'C1=' + bufH, ']'].join(EOL));
  const lines = ['[', 'ObjTp=Sm', 'H=' + bufH, 'SmC=46', 'Nm=Analog Buffer', 'ObjVer=1', 'SmVr=1241', 'PrH=' + subH, 'CF=2', 'n1I=' + (ins.length + 1), 'n1O=' + ins.length, 'mI=' + (ins.length + 1)];
  lines.push('I1=' + sig('Room_Active_' + nn(p.id), 0));
  ins.forEach((e, i) => lines.push('I' + (i + 2) + '=' + sig(e[0], 2)));
  lines.push('mO=' + ins.length, 'tO=' + ins.length);
  ins.forEach((e, i) => lines.push('O' + (i + 1) + '=' + sig(e[1], 2)));
  lines.push(']');
  newSm.push(lines.join(EOL));
  report.buffers++;
}
const logicLines = logic[0].split(/\r?\n/).filter(l => l && l !== '[' && l !== ']' && !/^(mC|C\d+)=/.test(l));
raw = raw.replace(logicRe, ['[', ...logicLines, 'mC=' + logicChildren.length, ...logicChildren.map((c, i) => 'C' + (i + 1) + '=' + c), ']'].join(EOL));

// ---------------------------------------------------------------- 5. en-tête + signaux en fin de fichier
// Le socle est lu/écrit en latin1 ; « — » n'existe pas en latin1 → octet 0x97 (Windows-1252, codage SIMPL Windows).
const cp1252 = s => s.replace(/—/g, '\x97').replace(/–/g, '\x96').replace(/[^\x00-\xff]/g, '?');
raw = raw.replace(/^PrNm=.*$/m, 'PrNm=' + PRG_NAME + '.smw').replace(/^CltNm=.*$/m, 'CltNm=' + cp1252(CLIENT)).replace(/^PgmNm=.*$/m, 'PgmNm=DPE');
const sgBlocks = signals.map(s => ['[', 'ObjTp=Sg', 'H=' + s.h, 'Nm=' + s.name, ...(s.type ? ['SgTp=' + s.type] : []), ']'].join(EOL));
raw = raw.replace(/\s*$/, EOL) + newSm.concat(sgBlocks).join(EOL) + EOL;

// ---------------------------------------------------------------- rapport
console.log('Showroom FTV Nyon — slot 2 : EISC ' + N1I + ' digitaux / ' + (N2I - 1) + ' analogiques ; offsets analogIn=' + IN_A + ' analogOut=' + OUT_A);
console.log('Dimensionnement JSON : ' + rooms.length + ' pièces, ' + N.circuits + ' circuits max, ' + N.scenes + ' scènes max, actions pièce ' + N.roomActions +
  ', actions maison ' + N.houseActions + ', services ' + N.services + ', favoris ' + N.favoris + ', parcourir ' + N.parcourir + ', sources ' + N.sources + ', caméras ' + N.cameras);
console.log('Sorties (reçues par le slot 2) : ' + report.dOut + ' digitales, ' + report.aOut + ' analogiques');
console.log('Entrées (renvoyées par le slot 2) : ' + report.dIn + ' digitales, ' + report.aIn + ' analogiques');
console.log('Sériels du contrat non câblés (texte C# ↔ écrans) : ' + serialSkipped);
for (const r of report.rooms) console.log('  bloc pièce ' + r.id + ' « ' + r.nom + ' » base ' + r.base + ' : ' + r.signaux + ' signaux');
console.log('Analog Buffers par pièce : ' + report.buffers + ' ; signaux nommés : ' + signals.length);
if (DRY) { console.log('(dry-run : rien écrit)'); process.exit(0); }
fs.writeFileSync(OUT, raw, 'latin1');
// Liste join → nom : sens (O = reçu par le slot 2, I = renvoyé), type, join, nom ; puis les signaux internes (buffers).
const ORDER = { dO: 0, dI: 1, aO: 2, aI: 3 };
const lines = joinList.slice().sort((a, b) => ORDER[a.kind + a.dir] - ORDER[b.kind + b.dir] || a.join - b.join)
  .map(e => (e.kind === 'd' ? 'D ' : 'A ') + e.dir + ' ' + String(e.join).padStart(4) + ' ' + e.name);
for (const s of signals) if (!eiscNames.has(s.name)) lines.push((s.type === 2 ? 'A ' : 'D ') + '-    - ' + s.name);
fs.writeFileSync(OUT.replace(/\.smw$/, '.signals.txt'), lines.join('\n') + '\n', 'utf8');
console.log('Écrit : ' + path.relative(ROOT, OUT) + ' + ' + path.basename(OUT).replace(/\.smw$/, '.signals.txt'));
