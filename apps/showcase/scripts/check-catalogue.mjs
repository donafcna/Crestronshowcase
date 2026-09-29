import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allProjects, projects, sectors, devices } from '../src/data/showcaseProjects.js';
import { RETIRED_PROJECT_IDS } from '../src/data/retiredProjects.js';
import { SIMULATORS, validateSimulatorRegistry } from '../src/components/simulatorRegistry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Les projets en retrait restent valides (simulateur, fichiers) pour pouvoir être ressortis tels quels.
const errors = validateSimulatorRegistry(allProjects);
for (const id of RETIRED_PROJECT_IDS) if (!allProjects.some(p => p.id === id)) errors.push(`Projet en retrait inconnu : ${id}`);
for (const project of allProjects) {
  for (const id of project.sectors) if (!sectors.some(s => s.id === id)) errors.push(`${project.id} : secteur inconnu ${id}`);
  for (const id of project.devices) if (!devices.some(d => d.id === id)) errors.push(`${project.id} : support inconnu ${id}`);
  for (const key of ['embedUrl', 'embedPhoneUrl']) if (project[key]?.startsWith('/')) {
    const filename = path.join(root, 'public', project[key].split(/[?#]/)[0]);
    if (!fs.existsSync(filename)) errors.push(`${project.id} : fichier embarqué absent (${key})`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Catalogue valide : ${projects.length} projets publics (${RETIRED_PROJECT_IDS.length} en retrait), ${Object.keys(SIMULATORS).length} simulateurs, ${sectors.length} secteurs.`);
