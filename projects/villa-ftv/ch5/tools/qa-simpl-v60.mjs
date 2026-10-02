#!/usr/bin/env node
/** v6.0 — pont SIMPL (meta.backend = simpl) : pour la dalle (index.html, 1920×1200) et l'iPhone (iphone.html, 402×874),
 *  pièces 1, 7 et 15 :
 *   1. émission : chaque join logique du contrat S publié par le GUI sort sur le join physique de la pièce affichée ;
 *   2. réception : un retour physique de la pièce affichée arrive sous son join logique, celui d'une autre pièce est retenu ;
 *   3. changement de pièce : les retours mémorisés de la nouvelle pièce sont rejoués (et remis à zéro s'il n'y en a pas) ;
 *   4. joins globaux (alarme 41, centralisation 401) : jamais traduits ; télécommande 211 : analogique 241 = pièce d'abord ;
 *   5. appui long scène (série 421 JSON) : impulsion sur le join « Mémoriser scène N » de la pièce ;
 *   6. iPhone : vrais clics DOM (scène, moteur, lamelles) -> joins physiques ; 0 erreur console.
 *  Usage : node tools/qa-simpl-v60.mjs <dossier> [--base URL] */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
const [, , OUT = "qa-simpl", ...rest] = process.argv;
const arg = (n, d) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : d; };
const BASE = arg("--base", "http://localhost:4190");
mkdirSync(OUT, { recursive: true });
const bench = /panelInstance\.initialize|favicon|ERR_|\[WXP\]|Failed to load resource/;
const rows = [];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [kind, f, vp] of [["dalle", "index", { width: 1920, height: 1200 }], ["iphone", "iphone", { width: 402, height: 874 }]]) {
  const p = await b.newPage({ viewport: vp });
  const errs = [];
  p.on("console", m => { if (m.type() === "error" && !bench.test(m.text() + (m.location().url || ""))) errs.push(m.text().slice(0, 100)); });
  p.on("pageerror", e => { if (!bench.test(e.message)) errs.push("pageerror " + e.message.slice(0, 120)); });
  await p.addInitScript(() => { window.__sent = []; const push = t => (j, v) => window.__sent.push([t, String(j), v]); window.JSInterface = { bridgeSendBooleanToNative: push("b"), bridgeSendIntegerToNative: push("n"), bridgeSendStringToNative: push("s"), bridgeSendObjectToNative() {}, bridgeSendArrayToNative() {} }; });
  await p.goto(`${BASE}/${f}.html`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  for (const room of [1, 7, 15]) {
    const r = await p.evaluate(async ({ room, kind }) => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const sd = (window.villaConfig || window.villaConfigEmbedded).contrat.simplDirect;
      const ph = (t, j, rr) => String(sd.baseBloc + (rr - 1) * sd.tailleBloc + { b: sd.mapping.digital, n: sd.mapping.analog, s: sd.mapping.serial }[t][j]);
      if (kind === "dalle") window.changeRoomUI(room); else window.changeRoomIphone(String(room));
      await w(500);
      const pb = [];
      if (!VillaJoins.pontSimpl) pb.push("pont inactif");
      if (VillaJoins.room !== room) pb.push("pièce du pont " + VillaJoins.room + " ≠ " + room);
      // 1. émission : tous les joins du contrat
      for (const [t, key] of [["b", "digital"], ["n", "analog"]]) {
        for (const L of Object.keys(sd.mapping[key])) {
          window.__sent.length = 0;
          CrComLib.publishEvent(t, L, t === "b" ? true : 123);
          const s = window.__sent.find(x => x[0] === t);
          if (!s || s[1] !== ph(t, L, room)) pb.push("émission " + t + L + " -> " + (s ? s[1] : "rien") + " (attendu " + ph(t, L, room) + ")");
          if (t === "b") CrComLib.publishEvent("b", L, false);
        }
      }
      // 4. globaux
      window.__sent.length = 0; CrComLib.publishEvent("b", "41", true); CrComLib.publishEvent("b", "401", true); CrComLib.publishEvent("b", "211", true);
      const g = window.__sent.map(x => x[0] + x[1]);
      if (!g.includes("b41") || !g.includes("b401")) pb.push("globaux traduits : " + g.join(","));
      const i241 = window.__sent.findIndex(x => x[0] === "n" && x[1] === "241"), i211 = window.__sent.findIndex(x => x[1] === "211");
      if (i241 < 0 || i241 > i211 || window.__sent[i241][2] !== room) pb.push("télécommande : " + JSON.stringify(window.__sent));
      // 5. appui long
      window.__sent.length = 0; CrComLib.publishEvent("s", "421", JSON.stringify({ p: room, s: 3, c: [1] })); await w(250);
      const sv = window.__sent.filter(x => x[0] === "b").map(x => x[1] + "=" + x[2]);
      if (sv.join() !== [ph("b", "433", room) + "=true", ph("b", "433", room) + "=false"].join()) pb.push("mémoriser scène 3 : " + sv.join());
      if (window.__sent.some(x => x[0] === "s" && x[1] === "421")) pb.push("le JSON 421 part encore au processeur");
      // 2. réception
      const autre = 3;
      window.bridgeReceiveBooleanFromNative(ph("b", "52", room), true);
      window.bridgeReceiveIntegerFromNative(ph("n", "72", room), 4321);
      window.bridgeReceiveBooleanFromNative(ph("b", "53", autre), true);
      window.bridgeReceiveStringFromNative(ph("s", "32", room), "22.5");
      await w(100);
      const gb = j => CrComLib.getBooleanSignalValue(j), gn = j => CrComLib.getNumericSignalValue(j), gs = j => CrComLib.getStringSignalValue(j);
      if (gb("52") !== true) pb.push("retour scène 2 non reçu");
      if (gn("72") !== 4321) pb.push("retour circuit 2 non reçu : " + gn("72"));
      if (gb("53") === true) pb.push("retour d'une autre pièce livré");
      if (gs("32") !== "22.5") pb.push("retour série 32 : " + gs("32"));
      // 3. changement de pièce puis retour
      if (kind === "dalle") window.changeRoomUI(autre); else window.changeRoomIphone(String(autre));
      await w(600);
      if (gb("53") !== true) pb.push("rejeu : scène 3 de la pièce " + autre + " absente");
      if (gb("52") !== false) pb.push("rejeu : scène 2 de la pièce " + room + " restée");
      if (kind === "dalle") window.changeRoomUI(room); else window.changeRoomIphone(String(room));
      await w(600);
      if (gb("52") !== true || gn("72") !== 4321) pb.push("rejeu retour pièce " + room + " : " + gb("52") + "/" + gn("72"));
      // 6. clics DOM iPhone
      if (kind === "iphone") {
        window.openMotorsModal && window.openMotorsModal(); await w(500);
        window.__sent.length = 0;
        const card = document.querySelector('.mc-card[data-motor="1"]');
        if (card) { card.querySelector(".mc-move [data-join]").click(); const s = card.querySelector(".mc-slats [data-join]"); if (s) s.click(); }
        const sc = document.getElementById("scene-btn-51") || document.querySelector('.scene-btn-mobile[id^="scene-btn-"]');
        if (sc) sc.click();
        await w(300);
        const got = window.__sent.filter(x => x[0] === "b" && x[2] === true).map(x => x[1]);
        (card ? [ph("b", "81", room)] : []).concat(card && card.querySelector(".mc-slats") ? [ph("b", "111", room)] : []).concat(sc ? [ph("b", "51", room)] : [])
          .forEach(j => { if (!got.includes(j)) pb.push("clic DOM : join " + j + " non émis (" + got.join(",") + ")"); });
        window.closeMotorsModal && window.closeMotorsModal();
      }
      return pb;
    }, { room, kind });
    const e = errs.splice(0);
    rows.push({ ctx: `${kind}/pièce ${room}`, pb: r, errs: e, ok: !r.length && !e.length });
  }
  await p.close();
}
await b.close();
const ko = rows.filter(r => !r.ok);
let md = `# QA v6.0 — pont SIMPL (contrat S)\n\n| Contexte | Résultat | Détail |\n|---|---|---|\n`;
rows.forEach(r => { md += `| ${r.ctx} | ${r.ok ? "vert" : "ROUGE"} | ${r.ok ? "" : JSON.stringify({ pb: r.pb.slice(0, 8), errs: r.errs }).slice(0, 500)} |\n`; });
md += `\n**${rows.length - ko.length}/${rows.length} verts**\n`;
writeFileSync(`${OUT}/rapport.md`, md);
console.log(md);
