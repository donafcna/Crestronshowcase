import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validateConfig } from './validate-config.mjs';
import { stageCh5 } from './stage-ch5.mjs';
import { repoRoot, profilePath, validateRuntimeCompatibility, verifyRuntimeSources, sha256 } from './runtime-compatibility.mjs';

// Aucun appel à un équipement, aucun binaire historique recopié comme candidat.
export function prepareProject({ configFile, simplInput, out, development = false }) {
  configFile = path.resolve(configFile); simplInput = path.resolve(simplInput); out = path.resolve(out);
  if (fs.existsSync(out)) throw new Error('La sortie doit être un dossier neuf');
  const raw = fs.readFileSync(configFile), config = JSON.parse(raw);
  const profileRaw = fs.readFileSync(profilePath), profile = JSON.parse(profileRaw);
  const structural = validateConfig(config, { release: !development });
  if (structural.some(i => i.severity === 'error')) throw new Error(JSON.stringify(structural));
  const issues = [...validateRuntimeCompatibility(config, profile), ...verifyRuntimeSources(repoRoot, profile)];
  if (issues.length) throw new Error(JSON.stringify(issues));
  const simplOriginal = fs.readFileSync(simplInput);
  const generator = path.join(repoRoot, 'projects/villa-crans/simpl/contract/generate_slot2.js');
  const generatorHash = sha256(fs.readFileSync(generator));
  const ch5 = path.join(out, 'ch5');
  stageCh5({ source: path.join(repoRoot, 'projects/villa-crans/ch5/src'), configFile, out: ch5, development });
  try {
    fs.mkdirSync(path.join(out, 'simpl'));
    const smw = path.join(out, 'simpl/Project_Slot2.smw');
    const log = execFileSync(process.execPath, [generator, '--config', path.join(ch5, 'villa_config.json'), '--input', simplInput, '--output', smw], { encoding: 'utf8' });
    fs.writeFileSync(path.join(out, 'simpl/generation.log'), log);
    if (sha256(fs.readFileSync(simplInput)) !== sha256(simplOriginal) || !fs.readFileSync(configFile).equals(raw) || !fs.readFileSync(profilePath).equals(profileRaw) || verifyRuntimeSources(repoRoot, profile).length || sha256(fs.readFileSync(generator)) !== generatorHash) throw new Error('Sources modifiées pendant la préparation');
    const normalizedConfig = fs.readFileSync(path.join(ch5, 'villa_config.json'));
    const manifest = {
      toolVersion: '0.2.0', createdAt: new Date().toISOString(), runtime: profile.id,
      status: 'sources-prepared-not-qualified', development, hardwareReady: false,
      config: { inputSha256: sha256(raw), stagedSha256: sha256(normalizedConfig) },
      simpl: { inputSha256: sha256(simplOriginal), outputSha256: sha256(fs.readFileSync(smw)), generatorSha256: generatorHash },
      runtimeProfileSha256: sha256(profileRaw), sourceFiles: profile.files,
      artifacts: { CH5Z: 'not-built', CPZ: 'not-built', LPZ: 'not-built', hardware: 'not-tested' },
      limitations: ['Le SMW conserve les câblages existants : vérifier les anciens signaux avant compilation', 'Compatibilité statique du profil, pas qualification de tous les comportements', 'Compilation des trois archives et recette multi-écrans requises'],
    };
    fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(out, 'LIRE.md'), '# Projet préparé — ' + config.meta.projet + '\n\n**Sources préparées, non qualifiées pour installation.**\n\nLa même configuration alimente le CH5 et la génération SIMPL. Les joins et contraintes connues sont comparés au socle versionné ; les sources sont contrôlées par empreinte. La génération conserve le câblage existant : le programmeur doit vérifier les anciens signaux et raccorder les drivers. Aucun CPZ ou LPZ ancien ne constitue une compilation de ce projet.\n\nCompiler CH5Z, CPZ et LPZ, puis effectuer la recette du banc Alexandre avant toute mise en service. Aucun matériel contacté.\n');
    return manifest;
  } catch (error) {
    fs.writeFileSync(path.join(out, 'ECHEC.txt'), 'Préparation incomplète, ne pas installer.\n' + error.message);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = key => { const i = process.argv.indexOf(key); return i < 0 ? null : process.argv[i + 1]; };
  try {
    if (!arg('--config') || !arg('--simpl-input') || !arg('--out')) throw new Error('Usage : node prepare-project.mjs --config <config.json> --simpl-input <base.smw> --out <nouveau dossier> [--development]');
    const result = prepareProject({ configFile: arg('--config'), simplInput: arg('--simpl-input'), out: arg('--out'), development: process.argv.includes('--development') });
    console.log(JSON.stringify({ out: path.resolve(arg('--out')), status: result.status, runtime: result.runtime, hardwareReady: result.hardwareReady }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
