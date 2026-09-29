// Parité C# slot 1 ↔ js/local-feedback.js : même séquence, mêmes retours attendus sur l'écran.
// Usage (depuis projects/showroom-ftv-nyon) : node tools/parity/parity.js   — prérequis : SDK .NET 8 (csc + Newtonsoft du SDK).
// Compile le C# du slot 1 avec des stubs de l'API Crestron (tools/parity/Stubs.cs, jamais livrés), le pilote comme la dalle
// (IP-ID 03) et compare, séquence par séquence, les retours obtenus à ceux de ch5/src/js/local-feedback.js (vitrine).
const fs = require('fs'), vm = require('vm'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const P = path.resolve(__dirname, '..', '..');
const W0 = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-'));
const sdk = execFileSync('dotnet', ['--list-sdks']).toString().trim().split('\n').pop().match(/^(\S+) \[(.+)\]/);
const SDK = path.join(sdk[2], sdk[1]);
const refDir = fs.readdirSync(path.join(SDK, '..', '..', 'packs', 'Microsoft.NETCore.App.Ref')).map(v => path.join(SDK, '..', '..', 'packs', 'Microsoft.NETCore.App.Ref', v, 'ref')).map(d => path.join(d, fs.readdirSync(d)[0])).pop();
const refs = fs.readdirSync(refDir).filter(f => f.endsWith('.dll')).map(f => '-r:' + path.join(refDir, f));
const cs = fs.readdirSync(path.join(P, 'simpl-sharp', 'ShowroomNyon')).filter(f => f.endsWith('.cs')).map(f => path.join(P, 'simpl-sharp', 'ShowroomNyon', f));
fs.copyFileSync(path.join(SDK, 'Newtonsoft.Json.dll'), path.join(W0, 'Newtonsoft.Json.dll'));
execFileSync('dotnet', [path.join(SDK, 'Roslyn', 'bincore', 'csc.dll'), '-nologo', '-nowarn:67,169,414', '-langversion:7.3', '-target:exe', '-out:' + path.join(W0, 'h.dll'), ...refs, '-r:' + path.join(W0, 'Newtonsoft.Json.dll'), path.join(__dirname, 'Stubs.cs'), path.join(__dirname, 'Harness.cs'), ...cs]);
fs.writeFileSync(path.join(W0, 'h.runtimeconfig.json'), '{"runtimeOptions":{"tfm":"net8.0","framework":{"name":"Microsoft.NETCore.App","version":"8.0.0"}}}');
// Le programme lit /user/showroom_config.json comme sur le CP4
try { fs.mkdirSync('/user', { recursive: true }); fs.copyFileSync(path.join(P, 'showroom_config.json'), '/user/showroom_config.json'); } catch (e) { console.error('Impossible d\'écrire /user/showroom_config.json (Linux / WSL requis) : ' + e.message); process.exit(2); }
const SRC = path.join(P, 'ch5', 'src', 'js') + path.sep;
const cfg = JSON.parse(fs.readFileSync(path.join(P, 'showroom_config.json'), 'utf8'));
cfg.meta.mode = 'showcase';
const timers = [];
const ctx = { window: {}, console, setTimeout: (f) => timers.push(f), setInterval: () => 0, Math, JSON };
ctx.window.showroomConfig = cfg; ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['bus.js', 'local-feedback.js']) vm.runInContext(fs.readFileSync(SRC + f, 'utf8').replace(/\(function \(\) \{/, '(function () { var window = this.window;').replace(/\}\)\(\);\s*$/, '}).call(this);'), ctx);
const W = ctx.window, J = (n, i) => W.Joins.of(n, i);
const seqs = {
  lights: [['b', J('Room_Select_{n}', 5)], ['b', J('Light_Scene_{n}', 2)], ['n', J('Light_{n}_Level#', 3), 30000], ['b', J('Light_{n}_Toggle', 1)], ['b', J('Lights_DimUp')], ['b', J('Light_{n}_Toggle', 1)], ['b', J('Lights_DimDown')]],
  actions: [['b', J('Room_Select_{n}', 1)], ['b', J('Room_Action_{n}', 2)], ['b', J('Room_Action_{n}', 1)], ['b', J('Music_Next')], ['b', J('Music_Like')], ['b', J('Music_Shuffle')], ['n', J('Music_Volume#'), 55], ['b', J('Music_Mute')]],
  house: [['b', J('Room_Select_{n}', 4)], ['b', J('House_Action_{n}', 1)], ['b', J('House_Action_{n}', 3)], ['b', J('Room_Select_{n}', 5)], ['b', J('Video_Source_{n}', 1)], ['n', J('Video_Volume#'), 42]],
  off: [['b', J('Room_Select_{n}', 5)], ['b', J('House_Action_{n}', 3)], ['b', J('Room_Off')], ['b', J('Room_Select_{n}', 1)], ['b', J('Music_Service_{n}', 2)], ['b', J('Music_Fav_{n}', 3)], ['b', J('Music_Browse_{n}', 4)], ['b', J('Music_SleepTimer_Toggle')], ['n', J('Music_SleepTimer#'), 75], ['b', J('Camera_Select_{n}', 1)], ['b', J('House_Lights_AllOff')]],
  appletv: [['b', J('Room_Select_{n}', 2)], ['b', J('Music_Service_{n}', 2)], ['b', J('Music_PlayPause')], ['b', J('Music_Off')], ['b', J('Music_PlayPause')], ['b', J('House_AllOff')]],
};
const skip = new Set(); for (let i = 1; i <= 8; i++) { skip.add('b' + J('House_Action_{n}', i)); skip.add('b' + J('Room_Action_{n}', i)); }
['Systeme_IpId$', 'Systeme_CpzNom$', 'Systeme_CpzDate$'].forEach(n => skip.add('s' + J(n)));
let bad = 0;
for (const [name, seq] of Object.entries(seqs)) {
  // état neuf des deux côtés
  const ctx2 = { window: { showroomConfig: JSON.parse(JSON.stringify(cfg)) }, console, setTimeout: () => 0, setInterval: () => 0, Math, JSON };
  ctx2.window.window = ctx2.window; vm.createContext(ctx2);
  for (const f of ['bus.js', 'local-feedback.js']) vm.runInContext(fs.readFileSync(SRC + f, 'utf8').replace(/\(function \(\) \{/, '(function () { var window = this.window;').replace(/\}\)\(\);\s*$/, '}).call(this);'), ctx2);
  const B = ctx2.window.Bus, got = {};
  for (const [t, j, v] of seq) { if (t === 'b') { B.press(j); } else B.analog(j, v); }
  // valeurs finales vues par le GUI
  for (const t of ['b', 'n', 's']) for (const e of ctx2.window.Joins.table[t]) for (let j = e.start; j <= e.end; j++) { const v = B.get(t, j); if (v !== undefined) got[t + j] = t === 'b' ? (v ? 1 : 0) : String(v); }
  fs.writeFileSync(path.join(W0, 'seq.txt'), seq.map(s => s.join(' ')).join('\n'));
  const cs = {}; execFileSync('dotnet', [path.join(W0, 'h.dll'), path.join(W0, 'seq.txt')]).toString().trim().split('\n').forEach(l => { const [t, j, ...v] = l.split(' '); cs[t + j] = t === 'b' ? +v[0] : v.join(' '); });
  const keys = new Set([...Object.keys(cs), ...Object.keys(got)]);
  let diffs = [];
  for (const k of keys) {
    if (skip.has(k) || +k.slice(1) >= 1000) continue;
    const def = k[0] === 'b' ? 0 : k[0] === 'n' ? '0' : '';
    const a = cs[k] === undefined ? def : cs[k], b = got[k] === undefined ? def : got[k];
    if (String(a) !== String(b)) diffs.push(`${k}: C#=${a} JS=${b}`);
  }
  console.log(name + ' : ' + (diffs.length ? 'ÉCARTS ' + diffs.join(' ; ') : 'identique (' + keys.size + ' joins)'));
  bad += diffs.length;
}
process.exit(bad ? 1 : 0);
