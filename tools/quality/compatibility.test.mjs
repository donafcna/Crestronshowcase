import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateRuntimeCompatibility, verifyRuntimeSources, readRuntimeProfile, repoRoot, sourceHash } from './runtime-compatibility.mjs';
import { prepareProject } from './prepare-project.mjs';
import { supportsDemoDevice, nextDemoDevice } from '../../apps/showcase/src/components/demoCapabilities.js';
import { projects } from '../../apps/showcase/src/data/projects.js';

const fixture = () => { const c = JSON.parse(fs.readFileSync(path.join(repoRoot, 'projects/villa-crans/ch5/villa_config.json'))); c.contrat.alarme.codeParDefaut = ''; return c; };
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ftv-quality-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('ftv-quality-'));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

test('socle examiné et configuration actuelle compatibles', () => {
  assert.deepEqual(validateRuntimeCompatibility(fixture()), []);
  assert.deepEqual(verifyRuntimeSources(), []);
});
test('noms, ordre des déclarations, description et profil de projet configurables', () => {
  const c = fixture(); c.meta.projet = 'Villa pilote'; c.pieces[0].nom = 'Bibliothèque';
  c.contrat.notes = 'Documentation projet'; c.contrat.signauxGlobaux.reverse();
  assert.deepEqual(validateRuntimeCompatibility(c), []);
});
for (const [label, mutate] of [
  ['mapping de commande', c => c.contrat.blocsPiecesGui.mapping.digital[51] = 22],
  ['direction de signal', c => c.contrat.signauxGlobaux[0].direction = 'sortie'],
  ['nouveau signal', c => c.contrat.signauxGlobaux.push({type:'digital',join:998,direction:'entree'})],
  ['base des pièces', c => c.contrat.blocsPieces.baseFormule = '2000 + (pieceId - 1) * 100'],
  ['join HVAC étendu', c => c.contrat.cvcEtendu.commandes.marche = 619],
  ['adresse EISC différente', c => c.contrat.eisc.adresseIp = '127.0.0.3'],
  ['autre version GUI', c => c.meta.version = '9.9.9'],
  ['identifiants de pièces discontinus', c => c.pieces[0].id = 30],
  ['plage HVAC globale', c => c.valeursParDefaut.cvc.consigneMinC = 5],
  ['plage HVAC par pièce', c => {c.pieces[0].pilotages.cvc.actif = true;c.pieces[0].pilotages.cvc.consigne.min=5;}],
  ['sauna sans hammam', c => c.pieces.find(p=>p.pilotages.wellness).pilotages.wellness.hammam.actif = false],
  ['pas wellness non pris en charge', c => c.pieces.find(p=>p.pilotages.wellness).pilotages.wellness.sauna.pas = 2],
  ['consigne fractionnaire tronquée par C#', c => c.pieces.find(p=>p.pilotages.wellness).pilotages.wellness.sauna.consigne = 80.5],
]) test('compatibilité refuse ' + label, () => {const c=fixture();mutate(c);assert.ok(validateRuntimeCompatibility(c).length);});
test('empreintes insensibles aux fins de ligne mais sensibles au code', t => {
  const dir = temp(t); fs.writeFileSync(path.join(dir,'source.cs'), 'line\r\n');
  const profile = {files:[{path:'source.cs',sha256:sourceHash(Buffer.from('line\n'))}]};
  assert.deepEqual(verifyRuntimeSources(dir,profile), []);
  fs.appendFileSync(path.join(dir,'source.cs'), 'changed');
  assert.equal(verifyRuntimeSources(dir,profile).length,1);
});
test('configuration refusée avant toute copie de sources', t => {
  const dir=temp(t), c=fixture();c.contrat.blocsPiecesGui.mapping.digital[51]=22;
  const configFile=path.join(dir,'config.json'),out=path.join(dir,'candidate');
  fs.writeFileSync(configFile, JSON.stringify(c));
  assert.throws(()=>prepareProject({configFile,out,simplInput:'unused.smw'}),/contrat/);
  assert.equal(fs.existsSync(out),false);
});

test('SIMPL utilise le profil fourni et conserve le fichier de travail', t => {
  const dir=temp(t), c=fixture();
  const room=structuredClone(c.pieces[0]);room.id=16;room.pilotages.cvc.actif=true;delete room.pilotages.wellness;c.pieces=[room];
  const configFile=path.join(dir,'config.json'),output=path.join(dir,'project.smw');
  fs.writeFileSync(configFile,JSON.stringify(c));
  // Fixture du symbole, volontairement indépendante du câblage local non commité.
  // Ce test ne compile pas un programme SIMPL.
  const input=path.join(dir,'symbol-fixture.smw');
  fs.writeFileSync(input,'[\nObjTp=Sm\nH=21\nSmC=1160\nn1I=2732\nn2I=2733\nn1O=2732\nmI=5465\nmO=5464\ntO=8016\n]\n[\nObjTp=Sg\nH=1\nNm=Preserved_Custom\n]\n');
  const before=fs.readFileSync(input);
  const generator=path.join(repoRoot,'projects/villa-crans/simpl/contract/generate_slot2.js');
  execFileSync(process.execPath,[generator,'--config',configFile,'--input',input,'--output',output]);
  const first=fs.readFileSync(output);
  assert.match(first.toString('latin1'),/Nm=R16_HVAC_On_Actual/);
  assert.ok(fs.readFileSync(input).equals(before));
  assert.throws(()=>execFileSync(process.execPath,[generator,'--config',configFile,'--input',input,'--output',output],{stdio:'pipe'}),/fichier neuf/);
  const second=path.join(dir,'second.smw');
  execFileSync(process.execPath,[generator,'--config',configFile,'--input',output,'--output',second]);
  assert.ok(fs.readFileSync(second).equals(first),'génération répétée idempotente');
  assert.throws(()=>execFileSync(process.execPath,[generator,'--config',path.join(dir,'missing.json'),'--input',input,'--output',path.join(dir,'missing.smw')],{stdio:'pipe'}));
  assert.equal(fs.existsSync(path.join(dir,'missing.smw')),false);
  c.pieces[0].id=30;fs.writeFileSync(configFile,JSON.stringify(c));
  assert.throws(()=>execFileSync(process.execPath,[generator,'--config',configFile,'--input',input,'--output',path.join(dir,'too-large.smw')],{stdio:'pipe'}),/Capacite EISC insuffisante/);
  assert.equal(fs.existsSync(path.join(dir,'too-large.smw')),false);
});

test('téléphone/tablette limités au catalogue, dalle seule exclue', () => {
  for (const project of projects) for (const type of ['phone','tablet']) {
    const ids=type==='phone'?['ios_phone','android_phone']:['ios_tablet','android_tablet'];
    assert.equal(supportsDemoDevice(project,type),project.devices.some(id=>ids.includes(id)));
    const next=nextDemoDevice(project,type);assert.ok(next===type||supportsDemoDevice(project,next));
  }
});
test('aucune GUI tablette chargée implicitement à la place du téléphone', () => {
  const c={devices:['ios_phone','ios_tablet'],isInteractive:false,embedUrl:'/tablet.html'};
  assert.equal(supportsDemoDevice(c,'phone'),false);
  assert.equal(supportsDemoDevice(c,'tablet'),true);
  assert.equal(nextDemoDevice(c,'tablet'),'tablet');
  assert.equal(supportsDemoDevice(null,'phone'),false);
});
