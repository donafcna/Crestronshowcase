#!/usr/bin/env node
// Club Étoile — vérifie que config/club-etoile_config.json (contrat) et simpl-sharp/ClubEtoile/Joins.cs
// racontent la même chose, et qu'aucun join ne se chevauche.
//   node tools/check-contract.js   → code de sortie 0 si tout est cohérent.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'club-etoile_config.json'), 'utf8'));
const cs = fs.readFileSync(path.join(ROOT, 'simpl-sharp', 'ClubEtoile', 'Joins.cs'), 'utf8');
const errors = [];

// ---- constantes C#
const consts = {};
let scope = '';
for (const line of cs.split(/\r?\n/)) {
  const s = line.match(/public static class (\w+)/); if (s) scope = s[1] === 'Joins' ? '' : s[1] + '.';
  const m = line.match(/public const (?:uint|int) (\w+) = (\d+);/); if (m) consts[scope + m[1]] = +m[2];
}

// ---- JSON nom → constante C# (les noms {n} pointent sur une base = début − 1)
const MAP = {
  digital: {
    Scene_Signature: 'SceneSignature', Scene_Party: 'SceneParty', Scene_Calm: 'SceneCalm', Scene_Off: 'SceneOff',
    Room_Select_All: 'RoomSelectAll', 'Room_Select_{n}': 'RoomSelectBase',
    Crowd_Cozy: 'CrowdCozy', Crowd_Busy: 'CrowdBusy', Crowd_Packed: 'CrowdPacked',
    HVAC_CTA_Online: 'HvacCtaOnline', Audio_Limiter: 'AudioLimiter',
    Smoke_On: 'SmokeOn', Smoke_Off: 'SmokeOff', Strobe_On: 'StrobeOn', Strobe_Off: 'StrobeOff', Lyres_On: 'LyresOn', Lyres_Off: 'LyresOff',
    'Screen_Source_{n}': 'ScreenSourceBase',
    Macro_PeakAlert: 'MacroPeakAlert', Macro_CalmEnd: 'MacroCalmEnd', Macro_AllOff: 'MacroAllOff', Macro_PartyQuick: 'MacroPartyQuick',
    Club_View_Building: 'ClubViewBuilding', Club_View_Floor: 'ClubViewFloor', Club_View_Room: 'ClubViewRoom',
    Config_Resync: 'ConfigResync',
  },
  analog: {
    'Room_Select#': 'RoomSelect', 'Room_Level#': 'RoomLevel', 'Scene#': 'Scene',
    'HVAC_Fan#': 'HvacFan', 'HVAC_Setpoint#': 'HvacSetpoint', 'HVAC_Temperature#': 'HvacTemperature',
    'Audio_Dancefloor_Volume#': 'AudioDancefloorVolume', 'Audio_Bar_Volume#': 'AudioBarVolume', 'Audio_Db#': 'AudioDb',
    'Strobe_Freq#': 'StrobeFreq', 'Screen_Source#': 'ScreenSource', 'Club_Floor#': 'ClubFloor',
    'Light_{n}_Level#': 'LightLevelBase', 'Config_ChunkAck#': 'ConfigChunkAck',
  },
  serial: {
    'Room_Name$': 'RoomName', 'Room_Subtitle$': 'RoomSubtitle', 'Scene_Name$': 'SceneName', 'Club_Summary$': 'ClubSummary', 'Room_Mood$': 'RoomMood', 'Room_Color$': 'RoomColor',
    'HVAC_Status$': 'HvacStatus', 'Crowd_Name$': 'CrowdName', 'Audio_Limiter_Text$': 'AudioLimiterText', 'Smoke_Status$': 'SmokeStatus', 'Strobe_Status$': 'StrobeStatus', 'Screen_Source_Name$': 'ScreenSourceName',
    'Systeme_IpId$': 'SystemIpId', 'Systeme_CpzNom$': 'SystemCpzName', 'Systeme_CpzDate$': 'SystemCpzDate', 'Config_Json$': 'ConfigJson', 'Config_Hash$': 'ConfigHash',
  },
  roomDigital: { 'Light_{n}_On': 'Room.LightOnBase', 'Scene_{n}': 'Room.SceneBase', Room_Displayed: 'Room.Displayed' },
  roomAnalog: { 'Light_{n}_Level': 'Room.LightLevelBase', Room_Level: 'Room.Level', Scene: 'Room.Scene' },
  roomSerial: { Room_Name: 'Room.Name' },
};
const start = r => +String(r).split('-')[0];
const end = r => { const p = String(r).split('-'); return +(p[1] || p[0]); };

function checkTable(label, table, map) {
  const used = [];
  for (const [range, def] of Object.entries(table)) {
    const a = start(range), b = end(range);
    for (const [ua, ub, un] of used) if (a <= ub && b >= ua) errors.push(label + ' : ' + def.nom + ' (' + range + ') chevauche ' + un + ' (' + ua + '-' + ub + ')');
    used.push([a, b, def.nom]);
    const c = map[def.nom];
    if (!c) { errors.push(label + ' : aucune constante C# associée à ' + def.nom); continue; }
    if (consts[c] === undefined) { errors.push(label + ' : constante ' + c + ' absente de Joins.cs'); continue; }
    const expected = def.nom.includes('{n}') ? a - 1 : a;
    if (consts[c] !== expected) errors.push(label + ' : ' + def.nom + ' = ' + a + ' dans le JSON, ' + c + ' = ' + consts[c] + ' dans Joins.cs');
    if (b - a + 1 > 40 && !def.nom.includes('{n}')) errors.push(label + ' : plage ' + range + ' suspecte pour ' + def.nom);
  }
  // toutes les constantes du C# doivent exister dans le JSON (pas de join fantôme)
  for (const c of Object.values(map)) if (!Object.values(table).some(d => map[d.nom] === c)) errors.push(label + ' : ' + c + ' (Joins.cs) absent du JSON');
}
const g = cfg.contrat.signauxGlobaux;
checkTable('digital', g.digital, MAP.digital);
checkTable('analog', g.analog, MAP.analog);
checkTable('serial', g.serial, MAP.serial);
const bp = cfg.contrat.blocsPieces;
checkTable('bloc digital', bp.digital, MAP.roomDigital);
checkTable('bloc analog', bp.analog, MAP.roomAnalog);
checkTable('bloc serial', bp.serial, MAP.roomSerial);
for (const t of [bp.digital, bp.analog, bp.serial]) for (const r of Object.keys(t)) if (end(r) >= bp.taille) errors.push('bloc salle : offset ' + r + ' ≥ taille ' + bp.taille);
if (consts.RoomBlockBase !== bp.base || consts.RoomBlockSize !== bp.taille) errors.push('RoomBlockBase/Size ≠ contrat.blocsPieces');
const L = cfg.contrat.limites;
for (const [k, c] of [['piecesMax', 'MaxRooms'], ['circuitsMax', 'MaxCircuits'], ['scenesMax', 'MaxScenes'], ['affluencesMax', 'MaxCrowds'], ['sourcesEcranMax', 'MaxScreenSources']])
  if (consts[c] !== L[k]) errors.push('limite ' + k + ' = ' + L[k] + ' mais ' + c + ' = ' + consts[c]);
// plages {n} du contrat ≤ limites C#
const rangeLen = (table, nom) => { const e = Object.entries(table).find(([, d]) => d.nom === nom); return e ? end(e[0]) - start(e[0]) + 1 : 0; };
if (rangeLen(g.digital, 'Room_Select_{n}') !== L.piecesMax) errors.push('Room_Select_{n} : plage ≠ piecesMax');
if (rangeLen(g.digital, 'Screen_Source_{n}') !== L.sourcesEcranMax) errors.push('Screen_Source_{n} : plage ≠ sourcesEcranMax');
if (rangeLen(g.analog, 'Light_{n}_Level#') !== L.circuitsMax) errors.push('Light_{n}_Level# : plage ≠ circuitsMax');
if (rangeLen(bp.digital, 'Scene_{n}') !== L.scenesMax) errors.push('bloc Scene_{n} : plage ≠ scenesMax');
if (rangeLen(bp.digital, 'Light_{n}_On') !== L.circuitsMax || rangeLen(bp.analog, 'Light_{n}_Level') !== L.circuitsMax) errors.push('bloc Light_{n} : plage ≠ circuitsMax');

// ---- capacité EISC, bloc club, séparation globaux / blocs
const EISC_CAP = 2732;
const maxGlobal = Math.max(...[...Object.keys(g.digital), ...Object.keys(g.analog)].map(end));
const me = cfg.contrat.signauxMaisonEisc || {};
const clubBase = (me.blocClub || {}).base;
if (consts.ClubBlockBase !== clubBase) errors.push('ClubBlockBase = ' + consts.ClubBlockBase + ' ≠ signauxMaisonEisc.blocClub.base = ' + clubBase);
if (!(clubBase > maxGlobal)) errors.push('bloc club : base ' + clubBase + ' ≤ dernier join global ' + maxGlobal);
if (bp.base <= clubBase + maxGlobal) errors.push('blocs salle : base ' + bp.base + ' chevauche le bloc club (' + clubBase + '..' + (clubBase + maxGlobal) + ')');
if (bp.base + L.piecesMax * bp.taille - 1 > EISC_CAP) errors.push('blocs salle : ' + L.piecesMax + ' × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP + ' (piecesMax trop grand pour le socle)');
if (bp.base + cfg.pieces.length * bp.taille - 1 > EISC_CAP) errors.push('blocs salle : ' + cfg.pieces.length + ' salles × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP);

// ---- signaux club (bloc club et _Actual) : mêmes joins que le contrat global
for (const [key, suffix] of [['digitalFb', ''], ['digitalActual', '']])
  for (const [range, name] of Object.entries(me[key] || {})) if (!Object.entries(g.digital).some(([r, d]) => r === range && d.nom === name + suffix)) errors.push('signauxMaisonEisc ' + key + ' ' + range + ' ' + name + ' ≠ signauxGlobaux');
for (const key of ['analogFb', 'analogActual'])
  for (const [range, name] of Object.entries(me[key] || {})) if (!Object.entries(g.analog).some(([r, d]) => r === range && d.nom === name + '#')) errors.push('signauxMaisonEisc ' + key + ' ' + range + ' ' + name + ' ≠ signauxGlobaux');
// un signal « ← » (jamais en sortie EISC) que le slot 2 doit connaître passe par le bloc club ou par _Actual
for (const [r, d] of Object.entries(g.analog)) if (d.sens === '←' && /^HVAC_Setpoint/.test(d.nom) && !(me.analogFb || {})[r]) errors.push(d.nom + ' calculé par le C# mais absent du bloc club (analogFb)');

// ---- salles : ids uniques, clés uniques, étages, circuits, ambiance
const ids = new Set(), keys = new Set();
const floors = new Set((cfg.etages || []).map(e => e.id));
const floorGui = new Set();
for (const e of cfg.etages || []) { if (floorGui.has(e.gui)) errors.push('étage ' + e.id + ' : index gui ' + e.gui + ' en double'); floorGui.add(e.gui); }
const club = cfg.club || {};
const sceneKeys = new Set((club.scenes || []).map(s => s.cle));
for (const p of cfg.pieces) {
  if (ids.has(p.id)) errors.push('salle id ' + p.id + ' en double'); ids.add(p.id);
  if (keys.has(p.cle)) errors.push('salle cle ' + p.cle + ' en double'); keys.add(p.cle);
  if (p.id < 1 || p.id > L.piecesMax) errors.push('salle ' + p.id + ' hors 1..' + L.piecesMax);
  if (!floors.has(p.etage)) errors.push('salle ' + p.id + ' : étage inconnu ' + p.etage);
  if (p.couleur && !/^#[0-9a-f]{6}$/i.test(p.couleur)) errors.push('salle ' + p.id + ' : couleur invalide');
  const pil = p.pilotages || {};
  const circ = (pil.eclairages && pil.eclairages.circuits) || [];
  if (circ.length > L.circuitsMax) errors.push('salle ' + p.id + ' : ' + circ.length + ' circuits > ' + L.circuitsMax);
  circ.forEach(c => { if (!c.cle) errors.push('salle ' + p.id + ' : circuit sans cle'); if (typeof c.coefficient === 'number' && c.coefficient < 0) errors.push('salle ' + p.id + ' : coefficient négatif'); });
  if (pil.eclairages && pil.eclairages.actif && !(pil.ambiance && pil.ambiance.actif)) errors.push('salle ' + p.id + ' : éclairages dérivés sans ambiance active');
  const ini = pil.ambiance && pil.ambiance.etatInitial;
  if (ini && ini.scene && !sceneKeys.has(ini.scene)) errors.push('salle ' + p.id + ' : scène initiale inconnue ' + ini.scene);
  if (ini && (ini.intensite < 0 || ini.intensite > 100)) errors.push('salle ' + p.id + ' : intensité initiale hors 0..100');
  for (const f of ['audio', 'cvc', 'climat']) if (pil[f]) errors.push('salle ' + p.id + ' : ' + f + ' n\'existe pas par salle (global club)');
}
if ((club.scenes || []).length > L.scenesMax) errors.push('scènes > ' + L.scenesMax);
for (const s of club.scenes || []) { if (s.id < 1 || s.id > L.scenesMax) errors.push('scène ' + s.cle + ' : id hors 1..' + L.scenesMax); if (typeof s.facteur !== 'number' || s.facteur < 0) errors.push('scène ' + s.cle + ' : facteur invalide'); }
if (!sceneKeys.has(club.sceneInitiale)) errors.push('sceneInitiale : scène inconnue');
if ((club.affluence || []).length > L.affluencesMax) errors.push('affluences > ' + L.affluencesMax);
for (const c of club.affluence || []) { if (c.id < 1 || c.id > L.affluencesMax) errors.push('affluence ' + c.cle + ' : id hors 1..' + L.affluencesMax); if (c.ventilation < 0 || c.ventilation > 100) errors.push('affluence ' + c.cle + ' : ventilation hors 0..100'); }
if (!(club.affluence || []).some(c => c.cle === club.affluenceInitiale)) errors.push('affluenceInitiale : affluence inconnue');
const srcs = (club.ecranDj || {}).sources || [];
if (srcs.length > L.sourcesEcranMax) errors.push('sources écran DJ > ' + L.sourcesEcranMax);
for (const s of srcs) if (s.id < 1 || s.id > L.sourcesEcranMax) errors.push('source écran ' + s.cle + ' : id hors 1..' + L.sourcesEcranMax);
if (club.ecranDj && !srcs.some(s => s.id === club.ecranDj.sourceInitiale)) errors.push('ecranDj.sourceInitiale inconnue');
for (const [k, m] of Object.entries(club.macros || {})) if (m.affluence && !(club.affluence || []).some(c => c.cle === m.affluence)) errors.push('macro ' + k + ' : affluence inconnue ' + m.affluence);
const ef = club.effets || {};
if (ef.strobeFrequenceMin > ef.strobeFrequenceMax || ef.strobeFrequenceInitiale < ef.strobeFrequenceMin || ef.strobeFrequenceInitiale > ef.strobeFrequenceMax) errors.push('effets : fréquence strobe incohérente');
if (club.navigation && !keys.has(club.navigation.salleInitiale)) errors.push('navigation.salleInitiale : salle inconnue');

if (errors.length) { console.error('Contrat INCOHÉRENT :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Contrat cohérent : ' + Object.keys(g.digital).length + ' familles digitales, ' + Object.keys(g.analog).length + ' analogiques, ' + Object.keys(g.serial).length + ' séries, bloc club ' + clubBase + '+join, blocs salle ' + bp.base + '+' + bp.taille + ' (' + cfg.pieces.length + ' × ' + bp.taille + ' → ' + (bp.base + cfg.pieces.length * bp.taille - 1) + ' ≤ ' + EISC_CAP + ') ; ' + cfg.pieces.length + ' salles sur ' + (cfg.etages || []).length + ' étages.');
