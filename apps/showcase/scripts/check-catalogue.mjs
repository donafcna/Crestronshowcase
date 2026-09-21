import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, sectors, devices } from '../src/data/showcaseProjects.js';
import { SIMULATORS, validateSimulatorRegistry } from '../src/components/simulatorRegistry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = validateSimulatorRegistry(projects);
for (const project of projects) {
  for (const id of project.sectors) if (!sectors.some(s => s.id === id)) errors.push(`${project.id} : secteur inconnu ${id}`);
  for (const id of project.devices) if (!devices.some(d => d.id === id)) errors.push(`${project.id} : support inconnu ${id}`);
  for (const key of ['embedUrl', 'embedPhoneUrl']) if (project[key]?.startsWith('/')) {
    const filename = path.join(root, 'public', project[key].split(/[?#]/)[0]);
    if (!fs.existsSync(filename)) errors.push(`${project.id} : fichier embarqué absent (${key})`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Catalogue valide : ${projects.length} projets, ${Object.keys(SIMULATORS).length} simulateurs, ${sectors.length} secteurs.`);
