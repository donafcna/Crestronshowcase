const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync(__dirname + '/centralisation-diagnostics.js', 'utf8');
const results = [];
function harness(options = {}) {
  let time = 0, next = 0;
  const timers = new Map(), events = {}, winEvents = {}, subs = {}, counts = {}, sent = [], observers = new Set();
  const elements = {};
  function button(j) {
    return elements[j] ||= { join: j, active: false, getAttribute: key => key === 'data-join' ? String(j) : (elements[j].active ? 'true' : 'false'),
      querySelector: () => null, closest: sel => sel === 'ch5-button[data-join]' ? elements[j] : null };
  }
  function addTimer(fn, ms, interval) { const id = ++next; timers.set(id, {fn, at: time + ms, interval}); return id; }
  const document = {readyState: 'complete', hidden: false, body: {appendChild() {}},
    createElement: () => ({style: {}, textContent: ''}), addEventListener: (name, fn) => (events[name] ||= []).push(fn)};
  const context = {document, performance: {now: () => time}, PointerEvent: function () {},
    localStorage: {getItem: () => '0', setItem() {}},
    MutationObserver: class { constructor(fn) {this.fn = fn;} observe(el) {this.el = el; observers.add(this);} disconnect() {observers.delete(this);} },
    setTimeout: (fn, ms) => addTimer(fn, ms), clearTimeout: id => timers.delete(id),
    setInterval: (fn, ms) => addTimer(fn, ms, ms), clearInterval: id => timers.delete(id),
    requestAnimationFrame: fn => addTimer(fn, 16), cancelAnimationFrame: id => timers.delete(id),
    addEventListener: (name, fn) => (winEvents[name] ||= []).push(fn),
    CrComLib: {subscribeState(type, j, fn) { if (options.failOnce === j) {options.failOnce = null; throw Error('startup');}
      (subs[j] ||= []).push(fn); counts[j] = (counts[j] || 0) + 1; if (!options.unknown) fn(false); return j; },
      publishEvent: (...args) => sent.push(args)}};
  context.window = context;
  vm.runInNewContext(code, context);
  const h = {sent, counts, records: context.villaCentralisationDiagnostics.records,
    at(end) {while (true) {const due = [...timers].filter(([,t]) => t.at <= end).sort((a,b) => a[1].at - b[1].at)[0];
      if (!due) break; time = due[1].at; timers.delete(due[0]); if (due[1].interval) timers.set(due[0], {...due[1], at: time + due[1].interval}); due[1].fn();} time = end;},
    event(name, j) {for (const fn of events[name] || []) fn({target: button(j), type:name});},
    click(j) {h.event('pointerdown', j); h.event('click', j);},
    feedback(j, val, dom = true) {for (const fn of subs[j] || []) fn(val); if (dom) h.dom(j, val);},
    dom(j, val) {const el = button(j); el.active = val; for (const o of [...observers]) if (o.el === el) o.fn();},
    hidden() {document.hidden = true; for (const fn of events.visibilitychange || []) fn();},
    disconnect() {for (const fn of winEvents.DISCONNECT_WS || []) fn();}}
  h.at(1000); return h;
}
function test(name, fn) {fn(); results.push({name, status:'passed'}); console.log('PASS',name);}
test('Un retour de 20 secondes est conserve', () => {const h=harness();h.click(404);h.at(21000);h.feedback(404,true);h.at(21016);assert.equal(h.records[0].cb,20000);assert.equal(h.records[0].status,'ok');});
test('Un ancien timer ne supprime pas la mesure suivante', () => {const h=harness();h.click(404);h.at(1100);h.feedback(404,true);h.at(1116);h.feedback(404,false);h.at(45500);h.click(404);h.at(46100);h.feedback(404,true);h.at(46116);assert.equal(h.records.length,2);assert.equal(h.records[1].cb,600);});
test('Une commande deja selectionnee ne produit pas de fausse latence', () => {const h=harness();h.feedback(404,true);h.click(404);assert.equal(h.records[0].status,'already-selected');assert.equal(h.records[0].cb,undefined);h.feedback(404,false);h.at(4000);h.click(404);h.at(4100);h.feedback(404,true);h.at(4116);assert.equal(h.records[1].cb,100);});
test('Les activations superposees sont exclues, meme avec retour tardif', () => {const h=harness();h.click(404);h.at(2000);h.click(405);h.at(3000);h.feedback(404,true);h.feedback(405,true);h.at(5000);assert.equal(h.records.length,1);assert.equal(h.records[0].status,'overlap');assert.equal(h.records[0].cb,undefined);h.click(404);assert.equal(h.records[1].status,'cooldown');});
test('Un touch annule invalide la mesure sans l attribuer a un retour tardif', () => {const h=harness();h.event('pointerdown',404);h.event('pointercancel',404);h.at(21000);h.feedback(404,true);assert.equal(h.records.length,1);assert.equal(h.records[0].status,'cancelled');assert.equal(h.records[0].cb,undefined);});
test('Le retour avant relachement et click est mesure', () => {const h=harness();h.event('pointerdown',404);h.at(1050);h.feedback(404,true);h.at(1066);h.event('click',404);assert.equal(h.records.length,1);assert.equal(h.records[0].cb,50);});
test('Le callback et la modification DOM sont mesures separement', () => {const h=harness();h.click(404);h.at(1100);h.feedback(404,true,false);h.at(3000);h.dom(404,true);h.at(3016);assert.equal(h.records[0].cb,100);assert.equal(h.records[0].dom,2000);assert.equal(h.records[0].raf,2016);});
test('Un feedback sans mise a jour DOM est signale', () => {const h=harness();h.click(404);h.at(1100);h.feedback(404,true,false);h.at(46000);assert.equal(h.records[0].status,'dom-frame-timeout');assert.equal(h.records[0].cb,100);});
test('Le timeout est explicite et un retour tardif ne recree pas de mesure', () => {const h=harness();h.click(404);h.at(46000);assert.equal(h.records[0].status,'timeout');h.at(51000);h.feedback(404,true);assert.equal(h.records.length,1);});
test('L arriere-plan interrompt une mesure', () => {const h=harness();h.click(404);h.hidden();h.at(2000);h.feedback(404,true);assert.equal(h.records[0].status,'hidden');});
test('La deconnexion interrompt une mesure', () => {const h=harness();h.click(404);h.disconnect();assert.equal(h.records[0].status,'disconnected');});
test('Une reprise d abonnement partielle ne duplique pas les callbacks', () => {const h=harness({failOnce:'404'});for(const j of [401,402,403,404,405,407,408,409,410,411]) assert.equal(h.counts[j],1);});
test('Aucune latence mesuree avant un etat initial connu', () => {const h=harness({unknown:true});h.click(404);assert.equal(h.records[0].status,'state-unknown');});
test('La sonde n emet que des diagnostics courts sur le seriel 100', () => {const h=harness();h.click(404);h.at(21000);h.feedback(404,true);h.at(21016);assert.equal(h.sent.length,1);for(const [t,j,s] of h.sent){assert.equal(t,'s');assert.equal(j,'100');assert.ok(s.length<=119);assert.ok(s.startsWith('[LAT-GUI]'));}});
fs.writeFileSync(__dirname+'/unit-results.json', JSON.stringify({environment:'Node VM, horloge controlee, pas de materiel',results},null,2)+'\n');
