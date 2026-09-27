#!/usr/bin/env node
// Yacht Asteria — vérifie que config/yacht-asteria_config.json (contrat) et simpl-sharp/YachtAsteria/Joins.cs
// racontent la même chose, et qu'aucun join ne se chevauche.
//   node tools/check-contract.js   → code de sortie 0 si tout est cohérent.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'yacht-asteria_config.json'), 'utf8'));
const cs = fs.readFileSync(path.join(ROOT, 'simpl-sharp', 'YachtAsteria', 'Joins.cs'), 'utf8');
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
    Scene_Cruise: 'SceneCruise', Scene_Sunset: 'SceneSunset', Scene_Dinner: 'SceneDinner', Scene_Night: 'SceneNight',
    Room_Select_All: 'RoomSelectAll', 'Room_Select_{n}': 'RoomSelectBase',
    Lights_AllOn: 'LightsAllOn', Lights_AllOff: 'LightsAllOff', 'Light_{n}_Toggle': 'LightToggleBase',
    'Color_Preset_{n}': 'ColorPresetBase', Effect_Off: 'EffectOff', Effect_BlueWave: 'EffectBlueWave', Effect_Rainbow: 'EffectRainbow', Effect_Champagne: 'EffectChampagne',
    Daylight_Day: 'DaylightDay', Daylight_Night: 'DaylightNight',
    'Music_Source_{n}': 'MusicSourceBase', Music_PlayPause: 'MusicPlayPause', Music_Mute: 'MusicMute', Config_Resync: 'ConfigResync',
  },
  analog: {
    'Room_Select#': 'RoomSelect', 'Light_{n}_Level#': 'LightLevelBase', 'Color_R#': 'ColorR', 'Color_G#': 'ColorG', 'Color_B#': 'ColorB', 'Speed#': 'Speed', 'Effect#': 'Effect', 'Scene#': 'Scene',
    'Music_Volume#': 'MusicVolume', 'Room_LightsAvg#': 'RoomLightsAvg', 'Room_LightsOn#': 'RoomLightsOn', 'Yacht_LightsOn#': 'YachtLightsOn', 'Config_ChunkAck#': 'ConfigChunkAck',
  },
  serial: {
    'Room_Name$': 'RoomName', 'Room_Subtitle$': 'RoomSubtitle', 'Scene_Name$': 'SceneName', 'Yacht_Summary$': 'YachtSummary', 'Music_Source_Name$': 'MusicSourceName', 'Color_Hex$': 'ColorHex',
    'Systeme_IpId$': 'SystemIpId', 'Systeme_CpzNom$': 'SystemCpzName', 'Systeme_CpzDate$': 'SystemCpzDate', 'Config_Json$': 'ConfigJson', 'Config_Hash$': 'ConfigHash',
  },
  roomDigital: { 'Light_{n}_On': 'Room.LightOnBase', Room_Displayed: 'Room.Displayed', Music_Playing: 'Room.MusicPlaying', Music_Muted: 'Room.MusicMuted' },
  roomAnalog: { 'Light_{n}_Level': 'Room.LightLevelBase', Music_Volume: 'Room.MusicVolume', Music_Source: 'Room.MusicSource' },
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
  const jsonConsts = new Set(Object.values(map));
  for (const c of Object.values(map)) if (!Object.values(table).some(d => map[d.nom] === c)) errors.push(label + ' : ' + c + ' (Joins.cs) absent du JSON');
  void jsonConsts;
}
const g = cfg.contrat.signauxGlobaux;
checkTable('digital', g.digital, MAP.digital);
checkTable('analog', g.analog, MAP.analog);
checkTable('serial', g.serial, MAP.serial);
const bp = cfg.contrat.blocsPieces;
checkTable('bloc digital', bp.digital, MAP.roomDigital);
checkTable('bloc analog', bp.analog, MAP.roomAnalog);
checkTable('bloc serial', bp.serial, MAP.roomSerial);
for (const t of [bp.digital, bp.analog, bp.serial]) for (const r of Object.keys(t)) if (end(r) >= bp.taille) errors.push('bloc espace : offset ' + r + ' ≥ taille ' + bp.taille);
if (consts.RoomBlockBase !== bp.base || consts.RoomBlockSize !== bp.taille) errors.push('RoomBlockBase/Size ≠ contrat.blocsPieces');
const L = cfg.contrat.limites;
for (const [k, c] of [['piecesMax', 'MaxRooms'], ['circuitsMax', 'MaxCircuits'], ['sourcesMax', 'MaxSources'], ['couleursMax', 'MaxColorPresets']])
  if (consts[c] !== L[k]) errors.push('limite ' + k + ' = ' + L[k] + ' mais ' + c + ' = ' + consts[c]);

// ---- capacité EISC et séparation globaux / blocs
const EISC_CAP = 2732;
const maxGlobal = Math.max(...[...Object.keys(g.digital), ...Object.keys(g.analog)].map(end));
if (bp.base <= maxGlobal) errors.push('blocs espace : base ' + bp.base + ' ≤ dernier join global ' + maxGlobal);
if (bp.base + L.piecesMax * bp.taille - 1 > EISC_CAP) errors.push('blocs espace : ' + L.piecesMax + ' × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP + ' (piecesMax trop grand pour le socle)');
if (bp.base + cfg.pieces.length * bp.taille - 1 > EISC_CAP) errors.push('blocs espace : ' + cfg.pieces.length + ' espaces × ' + bp.taille + ' depuis ' + bp.base + ' dépasse ' + EISC_CAP);

// ---- signaux yacht renvoyés par le slot 2 : mêmes joins que le contrat global
const me = cfg.contrat.signauxMaisonEisc || {};
for (const [range, name] of Object.entries(me.digitalActual || {})) if (!Object.entries(g.digital).some(([r, d]) => r === range && d.nom === name)) errors.push('signauxMaisonEisc digital ' + range + ' ' + name + ' ≠ signauxGlobaux');
for (const [range, name] of Object.entries(me.analogActual || {})) if (!Object.entries(g.analog).some(([r, d]) => r === range && d.nom === name + '#')) errors.push('signauxMaisonEisc analog ' + range + ' ' + name + ' ≠ signauxGlobaux');

// ---- espaces : ids uniques, clés uniques, dimensions dans les limites, circuits cohérents
const ids = new Set(), keys = new Set();
const floors = new Set((cfg.etages || []).map(e => e.id));
const circuitKeys = new Set();
for (const p of cfg.pieces) {
  if (ids.has(p.id)) errors.push('espace id ' + p.id + ' en double'); ids.add(p.id);
  if (keys.has(p.cle)) errors.push('espace cle ' + p.cle + ' en double'); keys.add(p.cle);
  if (p.id < 1 || p.id > L.piecesMax) errors.push('espace ' + p.id + ' hors 1..' + L.piecesMax);
  if (String(p.id - 1) !== String(p.cle)) errors.push('espace ' + p.id + ' : cle ' + p.cle + ' ≠ id − 1 (convention GUI showcase)');
  if (!floors.has(p.etage)) errors.push('espace ' + p.id + ' : pont inconnu ' + p.etage);
  const circ = (p.pilotages && p.pilotages.eclairages && p.pilotages.eclairages.circuits) || [];
  if (circ.length > L.circuitsMax) errors.push('espace ' + p.id + ' : ' + circ.length + ' circuits > ' + L.circuitsMax);
  circ.forEach(c => { if (!c.cle) errors.push('espace ' + p.id + ' : circuit sans cle'); circuitKeys.add(c.cle); });
  const src = p.pilotages && p.pilotages.audio && p.pilotages.audio.etatInitial ? p.pilotages.audio.etatInitial.source : 1;
  if (src !== undefined && (src < 1 || src > (cfg.yacht.musique.sources || []).length)) errors.push('espace ' + p.id + ' : source initiale ' + src + ' inconnue');
}
for (const s of cfg.yacht.scenes || []) {
  if (s.id < 1 || s.id > 4) errors.push('scène ' + s.cle + ' : id ' + s.id + ' hors 1..4 (Scene_Cruise..Scene_Night)');
  for (const k of Object.keys(s.niveaux || {})) if (!circuitKeys.has(k)) errors.push('scène ' + s.cle + ' : clé de circuit inconnue ' + k);
}
for (const c of (cfg.yacht.couleurs || {}).presets || []) if (!/^#[0-9a-f]{6}$/i.test(c.hex)) errors.push('couleur ' + c.nom + ' : hex invalide');
for (const e of (cfg.yacht.effets || {}).liste || []) { if (e.id < 1 || e.id > 3) errors.push('effet ' + e.cle + ' : id hors 1..3'); for (const h of e.couleurs || []) if (!/^#[0-9a-f]{6}$/i.test(h)) errors.push('effet ' + e.cle + ' : couleur invalide ' + h); }
for (const k of ['jour', 'nuit']) if (!(cfg.yacht.scenes || []).some(s => s.cle === cfg.yacht.cycleJourNuit[k])) errors.push('cycleJourNuit.' + k + ' : scène inconnue');
if (!(cfg.yacht.scenes || []).some(s => s.cle === cfg.yacht.sceneInitiale)) errors.push('sceneInitiale : scène inconnue');
if ((cfg.yacht.musique.sources || []).length > L.sourcesMax) errors.push('sources > ' + L.sourcesMax);

if (errors.length) { console.error('Contrat INCOHÉRENT :\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Contrat cohérent : ' + Object.keys(g.digital).length + ' familles digitales, ' + Object.keys(g.analog).length + ' analogiques, ' + Object.keys(g.serial).length + ' séries, blocs espace ' + bp.base + '+' + bp.taille + ' (' + cfg.pieces.length + ' × ' + bp.taille + ' → ' + (bp.base + cfg.pieces.length * bp.taille - 1) + ' ≤ ' + EISC_CAP + ') ; ' + cfg.pieces.length + ' espaces sur ' + (cfg.etages || []).length + ' ponts.');
