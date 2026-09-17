import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { expandSignals } from './validate-config.mjs';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const sha256 = data => createHash('sha256').update(data).digest('hex');
export const sourceHash = data => sha256(data.toString('utf8').replaceAll('\r\n', '\n'));
export const profilePath = path.join(repoRoot, 'tools/quality/runtime-v4.json');
export const readRuntimeProfile = () => JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).filter(k => !['description', 'note', 'notes'].includes(k)).sort().map(k => [k, normalize(value[k])])) : value;
const same = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

// La numérotation fait partie du socle. Les noms de pièces, médias et adresses de
// panneaux n'en font pas partie. Modifier un join exige une nouvelle version du socle.
export function contractShape(config) {
  const c = config.contrat;
  const signals = (list, start, range) => expandSignals(list, start, range).map(s => ({
    type: s.type, join: s.join,
    direction: s.direction === 'entree/sortie' ? 'bidirectionnel' : s.direction,
    ...(s.eiscJoin !== undefined ? { eiscJoin: s.eiscJoin } : {}),
    ...(s.eiscJoinDebut !== undefined ? { eiscJoinDebut: s.eiscJoinDebut } : {}),
  })).sort((a, b) => a.type.localeCompare(b.type) || a.join - b.join);
  return normalize({
    version: c.version.split(' ')[0],
    globals: signals(c.signauxGlobaux, 'join', 'joinDebut'),
    room: { baseFormule: c.blocsPieces.baseFormule, tailleBloc: c.blocsPieces.tailleBloc, offsets: signals(c.blocsPieces.offsets, 'offset', 'offsetDebut') },
    gui: { actif: c.blocsPiecesGui.actif, tailleBloc: c.blocsPiecesGui.tailleBloc, baseFormule: c.blocsPiecesGui.baseFormule, pieceMax: c.blocsPiecesGui.pieceMax, mapping: c.blocsPiecesGui.mapping },
    cvcEtendu: c.cvcEtendu, wellness: c.wellness,
    eisc: { actif: c.eisc?.actif, ipid: c.eisc?.ipid?.toUpperCase(), adresseIp: c.eisc?.adresseIp, slotCible: c.eisc?.slotCible },
  });
}

export function validateRuntimeCompatibility(config, profile = readRuntimeProfile()) {
  const issues = [];
  const add = (path, message) => issues.push({ path, message, severity: 'error' });
  if (!same(contractShape(config), profile.contract)) add('contrat', 'Le contrat diffère du socle ' + profile.id + ' ; ne pas modifier les joins dans un profil de projet');
  if (config.meta.version !== profile.sourceVersion) add('meta.version', 'Version différente du socle source ' + profile.sourceVersion);
  const ids = config.pieces.map(r => r.id).sort((a,b) => a-b);
  if (ids.some((id,index) => id !== index + 1)) add('pieces', 'Le téléphone actuel attend des identifiants continus de 1 à N ; garder les pièces désactivées dans la liste');
  if (!same(config.valeursParDefaut?.cvc, profile.hvacDefaults)) add('valeursParDefaut.cvc', 'Le C# actuel impose 16–28 °C et un pas de 0,5 °C');
  for (const [i, room] of config.pieces.entries()) {
    const cvc = room.pilotages?.cvc, w = room.pilotages?.wellness;
    if (cvc?.actif !== false && cvc && !same(cvc.consigne, { min: 16, max: 28, pas: 0.5 })) add(`pieces[${i}].pilotages.cvc.consigne`, 'Plage non prise en charge par le C# actuel : 16–28 °C, pas 0,5');
    if (!w) continue;
    if (w.sauna?.actif !== w.hammam?.actif) add(`pieces[${i}].pilotages.wellness`, 'Ce socle active sauna et hammam ensemble ; un équipement seul nécessite une évolution du socle');
    for (const [kind, max] of [['sauna', 150], ['hammam', 100]]) {
      const r = w[kind];
      if (!r?.actif) continue;
      if (r.pas !== 1 || ![r.min, r.max, r.consigne].every(Number.isInteger) || r.min < 0 || r.max > max) add(`pieces[${i}].pilotages.wellness.${kind}`, 'Le runtime exige des entiers, un pas de 1 et des bornes représentables dans ses mesures');
    }
  }
  return issues;
}

export function verifyRuntimeSources(root = repoRoot, profile = readRuntimeProfile()) {
  return profile.files.flatMap(file => {
    const full = path.resolve(root, file.path);
    if (!full.startsWith(path.resolve(root) + path.sep)) throw new Error('Chemin de profil hors dépôt');
    return fs.existsSync(full) && sourceHash(fs.readFileSync(full)) === file.sha256 ? [] : [{ path: file.path, severity: 'error', message: 'Source différente du socle examiné ; réviser le profil et ses tests avant préparation' }];
  });
}
