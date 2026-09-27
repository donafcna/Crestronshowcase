#!/usr/bin/env node
// Club Étoile — génère le programme SIMPL Windows du slot 2 (ClubEtoile_Slot2.smw) à partir de
// config/club-etoile_config.json et du socle CP4 + EISC (simpl/simpl-windows/_socle_cp4_eisc.smw).
//
//   node tools/generate_slot2.js            → simpl/simpl-windows/ClubEtoile_Slot2.smw (écrasé)
//   node tools/generate_slot2.js --dry-run  → rapport seul, aucun fichier écrit
//
// Ce que le fichier contient :
//   • CP4 + EISC « Packed » IP-ID F0 → 127.0.0.2 (2732 joins de chaque type : dimension du socle).
//   • SORTIES du symbole = ce que le slot 2 REÇOIT : chaque action de la GUI sous son nom nu
//     (Scene_Party, Crowd_Packed, Smoke_On, Macro_PeakAlert, Room_Level#, HVAC_Fan#…), Room_Select# (a10),
//     Room_Active_00 (tout le club) et Room_Active_nn (d101-110, un seul haut) posés AVANT chaque action,
//     les états tenus par le C# par salle (Rnn_xxx_fb, blocs 1000 + (id-1)*100) et les états tenus des
//     fonctions globales dans le bloc club (Club_xxx_fb, 500 + join global).
//   • ENTRÉES du symbole = ce que le slot 2 RENVOIE : mesures réelles Rnn_xxx_Actual (blocs salle) et états
//     club xxx_Actual (CTA, limiteur, dB, ventilation, température, fumée, strobe, lyres, source écran DJ).
//   • Un sous-système « Salle nn - Nom » par salle avec un Analog Buffer validé par Room_Active_nn :
//     démonstration de la bufferisation par a10 (les buffers digitaux se posent de la même façon dans
//     SIMPL Windows, symbole Buffer, enable = Room_Active_nn). Room_Active_00 (tout le club) est à
//     combiner en OR avec chaque Room_Active_nn si les drivers doivent suivre les actions globales
//     (le C# pousse de toute façon les Rnn_xxx_fb de chaque salle).
//
// Mapping des index du symbole EISC (vérifié sur le socle Villa Crans) :
//   digital  : index = join (entrées et sorties)
//   analog   : entrée = join + n1I + 1 ; sortie = join + n1O
//   série    : sortie = join + n1O + n2I − 1   (les sériels en entrée ne sont pas câblés)

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'config', 'club-etoile_config.json');
const BASE = path.join(ROOT, 'simpl', 'simpl-windows', '_socle_cp4_eisc.smw');
const OUT = path.join(ROOT, 'simpl', 'simpl-windows', 'ClubEtoile_Slot2.smw');
const DRY = process.argv.includes('--dry-run');

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const contrat = cfg.contrat;
const lim = contrat.limites;
let raw = fs.readFileSync(BASE, 'latin1');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';

// ---------------------------------------------------------------- socle : inventaire
const blocks = raw.split(/\r?\n(?=\[\r?\n)/);   // chaque bloc commence par "[\n"
const sgCount = blocks.filter(b => /^\[\r?\nObjTp=Sg\r?\n/.test(b)).length;
if (sgCount) throw new Error('Le socle contient encore ' + sgCount + ' signaux : utiliser _socle_cp4_eisc.smw (socle nu).');
const smRe = /\[\r?\nObjTp=Sm\r?\nH=21\r?\nSmC=1160[\s\S]*?\r?\n\]/;
const sm = raw.match(smRe);
if (!sm) throw new Error('Symbole EISC (H=21, SmC=1160) introuvable dans le socle');
const dim = k => parseInt(sm[0].match(new RegExp('^' + k + '=(\\d+)$', 'm'))[1], 10);
const N1I = dim('n1I'), N2I = dim('n2I'), N1O = dim('n1O');
const IN_A = N1I + 1, OUT_A = N1O, OUT_S = N1O + N2I - 1;
const CAP = { d: N1I, a: N2I - 1, s: N2I - 1 };
let maxSmH = 0;
for (const m of raw.matchAll(/ObjTp=Sm\r?\nH=(\d+)/g)) maxSmH = Math.max(maxSmH, +m[1]);

// ---------------------------------------------------------------- signaux
const signals = [];               // {h, name, type}  type: 0 digital, 2 analog, 4 série
const byName = new Map();
let nextH = 1;
function sig(name, type) {
  if (byName.has(name)) { const s = byName.get(name); if (s.type !== type) throw new Error('Type incohérent pour ' + name); return s.h; }
  const s = { h: nextH++, name, type };
  signals.push(s); byName.set(name, s); return s.h;
}
const inputs = {}, outputs = {};   // index EISC -> h
const report = { dOut: 0, dIn: 0, aOut: 0, aIn: 0, sOut: 0, rooms: [], buffers: 0, club: 0 };
function setIdx(map, idx, h, what) {
  if (map[idx] !== undefined && map[idx] !== h) throw new Error('COLLISION ' + what + ' index ' + idx + ' : ' + signals[map[idx] - 1].name + ' / ' + signals[h - 1].name);
  map[idx] = h;
}
const dout = (j, n) => { if (j > CAP.d) throw new Error('digital ' + j + ' hors capacité'); setIdx(outputs, j, sig(n, 0), 'sortie digitale'); report.dOut++; };
const din = (j, n) => { if (j > CAP.d) throw new Error('digital ' + j + ' hors capacité'); setIdx(inputs, j, sig(n, 0), 'entrée digitale'); report.dIn++; };
const aout = (j, n) => { if (j > CAP.a) throw new Error('analog ' + j + ' hors capacité'); setIdx(outputs, j + OUT_A, sig(n, 2), 'sortie analogique'); report.aOut++; };
const ain = (j, n) => { if (j > CAP.a) throw new Error('analog ' + j + ' hors capacité'); setIdx(inputs, j + IN_A, sig(n, 2), 'entrée analogique'); report.aIn++; };
const sout = (j, n) => { if (j > CAP.s) throw new Error('série ' + j + ' hors capacité'); setIdx(outputs, j + OUT_S, sig(n, 4), 'sortie série'); report.sOut++; };

// ---------------------------------------------------------------- dimensionnement réel (JSON)
const rooms = (cfg.pieces || []).filter(p => p.id >= 1 && p.id <= lim.piecesMax);
const nn = id => String(id).padStart(2, '0');
const pil = (p, f) => (p.pilotages && p.pilotages[f]) || null;
// Circuits : l'index global est la position dans le JSON ; un circuit actif=false garde sa place mais n'est pas câblé.
const circuits = p => (pil(p, 'eclairages') && pil(p, 'eclairages').actif ? (pil(p, 'eclairages').circuits || []) : []).slice(0, lim.circuitsMax);
const circuitActive = (p, i) => { const c = circuits(p)[i]; return !!c && c.actif !== false; };
const anyAmbiance = rooms.some(p => pil(p, 'ambiance') && pil(p, 'ambiance').actif);
const club = cfg.club || {};
const nScenes = anyAmbiance ? Math.min(lim.scenesMax, (club.scenes || []).length) : 0;
const nCrowd = Math.min(lim.affluencesMax, (club.affluence || []).length);
const hvac = !!(club.cvc && club.cvc.actif);
const audio = !!(club.audio && club.audio.actif);
const effets = !!(club.effets && club.effets.actif);
const ecran = !!(club.ecranDj && club.ecranDj.actif);
const nScreenSrc = ecran ? Math.min(lim.sourcesEcranMax, ((club.ecranDj || {}).sources || []).length) : 0;
const macros = club.macros || {};

// Étend "151-154" + "Screen_Source_{n}" en [{join, name, n}] limité à `count`.
function expand(range, name, count) {
  const m = String(range).match(/^(\d+)(?:-(\d+))?$/);
  const a = +m[1], b = m[2] ? +m[2] : a;
  const out = [];
  for (let j = a; j <= b; j++) {
    const n = j - a + 1;
    if (count !== undefined && n > count) break;
    out.push({ join: j, name: name.replace('{n}', n), n });
  }
  return out;
}
// Combien d'instances câbler pour un signal global, selon le JSON (0 = pas sur l'EISC, undefined = toutes).
const sceneIds = { Scene_Signature: 1, Scene_Party: 2, Scene_Calm: 3, Scene_Off: 4 };
const crowdIds = { Crowd_Cozy: 1, Crowd_Busy: 2, Crowd_Packed: 3 };
const macroKeys = { Macro_PeakAlert: 'peakAlert', Macro_CalmEnd: 'calmEnd', Macro_AllOff: 'allOff', Macro_PartyQuick: 'partyQuick' };
function countFor(name) {
  if (name.startsWith('Room_Select')) return 0;                       // remplacé par Room_Active_nn
  if (/^Club_View_|^Club_Floor|^Config_|^Systeme_|^Club_Summary|^Room_Name|^Room_Subtitle|^Room_Mood|^Room_Color/.test(name)) return 0;   // écrans seulement
  if (sceneIds[name]) return nScenes >= sceneIds[name] && (club.scenes || []).some(s => s.id === sceneIds[name]) ? undefined : 0;
  if (name === 'Room_Level#') return anyAmbiance ? undefined : 0;
  if (crowdIds[name]) return (club.affluence || []).some(c => c.id === crowdIds[name]) ? undefined : 0;
  if (/^HVAC_/.test(name)) return hvac ? undefined : 0;
  if (/^Audio_/.test(name)) return audio ? undefined : 0;
  if (/^Smoke_|^Strobe_|^Lyres_/.test(name)) return effets ? undefined : 0;
  if (name.startsWith('Screen_Source_{n}')) return nScreenSrc;
  if (/^Screen_/.test(name)) return ecran ? undefined : 0;
  if (macroKeys[name]) return macros[macroKeys[name]] ? undefined : 0;
  if (name.startsWith('Light_{n}')) return 0;                         // dérivés : écrans seulement, le slot 2 les a dans les blocs salle
  return undefined;
}

// ---------------------------------------------------------------- 1. globaux : actions reçues (sorties)
const rsRange = Object.entries(contrat.signauxGlobaux.digital).find(([, d]) => d.nom === 'Room_Select_{n}');
if (!rsRange) throw new Error('Room_Select_{n} absent du contrat');
const RS_BASE = +String(rsRange[0]).split('-')[0] - 1;
aout(10, 'Room_Select#');
dout(RS_BASE, 'Room_Active_00');                                       // tout le club (Room_Select# = 0)
for (const p of rooms) dout(RS_BASE + p.id, 'Room_Active_' + nn(p.id));
let maxGlobal = 10;
for (const [type, fn] of [['digital', dout], ['analog', aout]]) {
  for (const [range, def] of Object.entries(contrat.signauxGlobaux[type])) {
    maxGlobal = Math.max(maxGlobal, expand(range, def.nom).slice(-1)[0].join);
    if (def.sens === '←') continue;                                   // feedback écran, jamais en sortie EISC
    const c = countFor(def.nom);
    if (c === 0) continue;
    for (const e of expand(range, def.nom, c)) fn(e.join, e.name);
  }
}
// 2. globaux club : états tenus par le C# (bloc club, sorties) et états réels renvoyés par le slot 2 (entrées)
const me = contrat.signauxMaisonEisc || {};
const CLUB_BASE = (me.blocClub || {}).base;
if (!CLUB_BASE || CLUB_BASE <= maxGlobal) throw new Error('Bloc club : base ' + CLUB_BASE + ' doit dépasser le dernier join global ' + maxGlobal);
for (const [range, name] of Object.entries(me.digitalFb || {})) {
  const c = countFor(name); if (c === 0) continue;
  for (const e of expand(range, name, c)) { dout(CLUB_BASE + e.join, 'Club_' + e.name + '_fb'); report.club++; }
}
for (const [range, name] of Object.entries(me.analogFb || {})) {
  const c = countFor(name + '#'); if (c === 0) continue;
  for (const e of expand(range, name, c)) { aout(CLUB_BASE + e.join, 'Club_' + e.name + '_fb#'); report.club++; }
}
for (const [range, name] of Object.entries(me.digitalActual || {})) {
  const c = countFor(name); if (c === 0) continue;
  for (const e of expand(range, name, c)) din(e.join, e.name + '_Actual');
}
for (const [range, name] of Object.entries(me.analogActual || {})) {
  const c = countFor(name + '#'); if (c === 0) continue;
  for (const e of expand(range, name, c)) ain(e.join, e.name + '_Actual#');
}

// ---------------------------------------------------------------- 3. blocs salle
const BASE_J = contrat.blocsPieces.base, SIZE = contrat.blocsPieces.taille;
if (BASE_J + rooms.length * SIZE - 1 > CAP.d) throw new Error('Blocs salle : ' + rooms.length + ' × ' + SIZE + ' depuis ' + BASE_J + ' dépasse la capacité EISC ' + CAP.d);
if (BASE_J <= maxGlobal) throw new Error('Blocs salle : base ' + BASE_J + ' chevauche les joins globaux (≤ ' + maxGlobal + ')');
if (BASE_J <= CLUB_BASE + maxGlobal) throw new Error('Blocs salle : base ' + BASE_J + ' chevauche le bloc club (' + CLUB_BASE + '..' + (CLUB_BASE + maxGlobal) + ')');
function fnActive(p, f) {
  if (f === '*') return true;
  return !!(pil(p, f) && pil(p, f).actif);
}
function fnCount(p, f, name) {
  if (f === 'eclairages') return circuits(p).length;
  if (name.startsWith('Scene_')) return nScenes;
  return undefined;
}
for (const p of rooms) {
  if (p.intersystem === false) continue;
  const b = BASE_J + (p.id - 1) * SIZE, R = 'R' + nn(p.id) + '_';
  let n = 0;
  for (const [type, table] of [['digital', contrat.blocsPieces.digital], ['analog', contrat.blocsPieces.analog], ['serial', contrat.blocsPieces.serial]]) {
    for (const [range, def] of Object.entries(table)) {
      if (!fnActive(p, def.fonction)) continue;
      const cnt = def.nom.includes('{n}') ? fnCount(p, def.fonction, def.nom) : undefined;
      for (const e of expand(range, def.nom, cnt)) {
        if (def.fonction === 'eclairages' && def.nom.includes('{n}') && !circuitActive(p, e.n - 1)) continue;   // circuit déclaré mais inactif
        const j = b + e.join;
        if (j >= b + SIZE) throw new Error('Bloc salle ' + p.id + ' : offset ' + e.join + ' ≥ taille ' + SIZE);
        if (type === 'digital') {
          if (def.fb) { dout(j, R + e.name + '_fb'); n++; }
          if (def.actual) { din(j, R + e.name + '_Actual'); n++; }
        } else if (type === 'analog') {
          if (def.fb) { aout(j, R + e.name + '_fb#'); n++; }
          if (def.actual) { ain(j, R + e.name + '_Actual#'); n++; }
        } else { sout(j, R + e.name + '$'); n++; }
      }
    }
  }
  report.rooms.push({ id: p.id, nom: p.nom, base: b, signaux: n });
}

// ---------------------------------------------------------------- 4. réécriture du symbole EISC
const head = sm[0].split(/\r?\n/).filter(l => l && l !== '[' && l !== ']' && !/^[IO]\d+=/.test(l) && !/^(mI|mO|tO)=/.test(l));
const miLine = sm[0].match(/^mI=\d+$/m)[0], moLine = sm[0].match(/^mO=\d+$/m)[0], toLine = sm[0].match(/^tO=\d+$/m)[0];
const iK = Object.keys(inputs).map(Number).sort((a, b) => a - b), oK = Object.keys(outputs).map(Number).sort((a, b) => a - b);
const eiscBlock = ['[', ...head, miLine, ...iK.map(k => 'I' + k + '=' + inputs[k]), moLine, toLine, ...oK.map(k => 'O' + k + '=' + outputs[k]), ']'].join(EOL);
raw = raw.replace(smRe, eiscBlock);

// ---------------------------------------------------------------- 5. sous-systèmes « Salle nn - Nom » : Analog Buffer validé par Room_Active_nn
const logicRe = /\[\r?\nObjTp=Sm\r?\nH=4\r?\nSmC=156[\s\S]*?\r?\n\]/;
const logic = raw.match(logicRe);
if (!logic) throw new Error('Dossier Logic (H=4) introuvable');
let h = maxSmH;
const newSm = [];
const logicChildren = [];
const sansAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '-');
for (const p of rooms) {
  const R = 'R' + nn(p.id) + '_';
  const ins = [];
  if (pil(p, 'ambiance') && pil(p, 'ambiance').actif) ins.push(['Room_Level#', R + 'Room_Level_Buf#']);
  if (!ins.length) continue;
  const subH = ++h, bufH = ++h;
  logicChildren.push(subH);
  newSm.push(['[', 'ObjTp=Sm', 'H=' + subH, 'SmC=156', 'Nm=SUBSYSTEM', 'ObjVer=1', 'SmVr=1241', 'PrH=4', 'CF=2', 'Cmn1=Salle ' + nn(p.id) + ' - ' + sansAccent(p.nom), 'mC=1', 'C1=' + bufH, ']'].join(EOL));
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

// ---------------------------------------------------------------- 6. en-tête + signaux en fin de fichier
raw = raw.replace(/^PrNm=.*$/m, 'PrNm=ClubEtoile_Slot2.smw').replace(/^CltNm=.*$/m, 'CltNm=Club Etoile').replace(/^PgmNm=.*$/m, 'PgmNm=DPE');
const sgBlocks = signals.map(s => ['[', 'ObjTp=Sg', 'H=' + s.h, 'Nm=' + s.name, ...(s.type ? ['SgTp=' + s.type] : []), ']'].join(EOL));
raw = raw.replace(/\s*$/, EOL) + newSm.concat(sgBlocks).join(EOL) + EOL;

// ---------------------------------------------------------------- garde-fous finaux
const names = signals.map(s => s.name);
if (new Set(names).size !== names.length) throw new Error('Doublon de nom de signal');
if (/[^\x00-\x7f]/.test(names.join(''))) throw new Error('Nom de signal non ASCII');

// ---------------------------------------------------------------- rapport
console.log('Club Étoile — slot 2 : EISC ' + N1I + ' digitaux / ' + (N2I - 1) + ' analog-série ; offsets analogIn=' + IN_A + ' analogOut=' + OUT_A + ' serieOut=' + OUT_S);
console.log('Dimensionnement JSON : ' + rooms.length + ' salles, scènes ' + nScenes + ', affluences ' + nCrowd + ', CVC ' + hvac + ', audio ' + audio + ', effets ' + effets + ', écran DJ ' + nScreenSrc + ' sources, macros ' + Object.keys(macros).length);
console.log('Bloc club : base ' + CLUB_BASE + ' → ' + report.club + ' états tenus (Club_xxx_fb) ; blocs salle : base ' + BASE_J + ', taille ' + SIZE + ' → joins ' + BASE_J + '..' + (BASE_J + rooms.length * SIZE - 1) + ' (capacité ' + CAP.d + ')');
console.log('Sorties (reçues par le slot 2) : ' + report.dOut + ' digitales, ' + report.aOut + ' analogiques, ' + report.sOut + ' séries');
console.log('Entrées (renvoyées par le slot 2) : ' + report.dIn + ' digitales, ' + report.aIn + ' analogiques');
for (const r of report.rooms) console.log('  bloc salle ' + nn(r.id) + ' « ' + r.nom + ' » base ' + r.base + ' : ' + r.signaux + ' signaux');
console.log('Analog Buffers par salle : ' + report.buffers + ' ; signaux nommés : ' + signals.length);
if (DRY) { console.log('(dry-run : rien écrit)'); process.exit(0); }
fs.writeFileSync(OUT, raw, 'latin1');
fs.writeFileSync(OUT.replace(/\.smw$/, '.signals.txt'), signals.map(s => (s.type === 2 ? 'A ' : s.type === 4 ? 'S ' : 'D ') + s.name).join('\n') + '\n', 'utf8');
console.log('Écrit : ' + path.relative(ROOT, OUT));
