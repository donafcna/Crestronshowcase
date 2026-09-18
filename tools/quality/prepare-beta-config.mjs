import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateConfig } from './validate-config.mjs';

// Profil de banc distinct : conserver les identifiants, capacités et activations
// physiques tout en retirant les libellés de test de la configuration de travail.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.argv[2];
if (!out || fs.existsSync(out)) throw new Error('Indiquer un fichier de sortie neuf');
const config = JSON.parse(fs.readFileSync(path.join(repo, 'projects/villa-crans/ch5/villa_config.json'), 'utf8'));
const labels = JSON.parse(fs.readFileSync(path.join(repo, 'apps/showcase/public/showcases/villa-gemini-frequencetv/villa_config.json'), 'utf8'));
config.meta.projet = 'Villa Crans-Montana — bêta Alexandre';
config.meta.mode = 'deploiement';
config.meta.tracesConsole = false;
config.meta.dateModification = new Date().toISOString().slice(0, 10);
config.meta.profil = 'banc-beta-alexandre';
config.meta.aide = ['Profil de banc : identifiants et activations hérités de la configuration physique, libellés de démonstration.', 'Ne pas installer sur un projet client avant recette CH5Z/CPZ/LPZ et vérification des appareils.'];
config.valeursParDefaut = structuredClone(labels.valeursParDefaut);
config.sourcesAudioVideo = structuredClone(labels.sourcesAudioVideo);
config.traductions = structuredClone(labels.traductions);
config.contrat.alarme.codeParDefaut = '';
for (const room of config.pieces) {
  const label = labels.pieces.find(p => p.id === room.id);
  if (!label) throw new Error('Pièce sans libellé de référence : ' + room.id);
  room.nom = label.nom; room.icone = label.icone;
  const e = room.pilotages.eclairages;
  if (e) {
    e.scenes.noms = Array.from({ length: e.scenes.nombre }, (_, i) => labels.valeursParDefaut.scenesEclairage[i] || `Scène ${i + 1}`);
    e.circuits.noms = Array.from({ length: e.circuits.nombre }, (_, i) => label.pilotages.eclairages?.circuits?.noms?.[i] || `Circuit ${i + 1}`);
  }
}
const issues = validateConfig(config, { release: true });
if (issues.some(i => i.severity === 'error')) throw new Error(JSON.stringify(issues));
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: path.resolve(out), rooms: config.pieces.length, activeRooms: config.pieces.filter(r => r.actif !== false).length, version: config.meta.version, warnings: issues }));
