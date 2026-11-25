/* ============================================================
   Frequence TV — simulation web
   Dalle Crestron (1280×800) à gauche du "=" : l'état de la maison ;
   la villa SVG réagit à chaque appui, comme le ferait le processeur.
   ============================================================ */
(() => {
"use strict";
const integrationMode = new URLSearchParams(location.search).get("mode") || "standalone";
const backgroundOnly = integrationMode === "background";
const syncId = new URLSearchParams(location.search).get("channel");
const stateKey = syncId ? "villa-stark-state:" + syncId : null;
const syncBus = syncId ? new BroadcastChannel("villa-stark:" + syncId) : null;
function publishState() {
  if (backgroundOnly || !syncBus) return;
  const snapshot = { state: S, room: roomView };
  try { sessionStorage.setItem(stateKey, JSON.stringify(snapshot)); } catch { /* Live sync remains available when storage is disabled. */ }
  syncBus.postMessage({ type: "state", snapshot });
}


/* ---------------- définition de la villa ---------------- */
const ROOMS = [
  // étage
  { id: "Living",  name: "SALON",  floor: 1, i: 0, shade: true,  tv: "swisscom", plan: [32, 30, 254, 238] },
  { id: "Dining",  name: "SALLE À MANGER",       floor: 1, i: 1, shade: true,  plan: [340, 30, 180, 238] },
  { id: "Kitchen", name: "CUISINE",      floor: 1, i: 2, shade: true,  plan: [525, 30, 193, 238] },
  { id: "Office",  name: "BUREAU",       floor: 1, i: 3, shade: true,  plan: [722, 30, 178, 238] },
  // rez
  { id: "Cinema",  name: "CINÉMA",       floor: 0, i: 0, shade: true, tv: "apple",  plan: [32, 272, 216, 256] },
  { id: "Fitness", name: "FITNESS",      floor: 0, i: 1, shade: true, plan: [252, 272, 148, 256] },
  { id: "Entry",   name: "ENTRÉE",        floor: 0, i: 2, shade: true, plan: [404, 272, 136, 256] },
  { id: "Master",  name: "SUITE PARENTALE", floor: 0, i: 3, shade: true,  plan: [544, 272, 216, 256] },
  { id: "Bedroom", name: "CHAMBRE AMIS",   floor: 0, i: 4, shade: true,  plan: [764, 272, 136, 256] },
  // extérieur
  { id: "Pool",    name: "PISCINE",         pool: true, plan: [930, 30, 160, 498] },
];
const SHADE_ROOMS = ["Living", "Dining", "Kitchen", "Office", "Cinema", "Fitness", "Entry", "Master", "Bedroom"];
const SOURCES = ["Spotify", "Radio", "TV", "AirPlay"];
const ZONES = ["PORTE D’ENTRÉE", "PORTE DU GARAGE", "BAIES TERRASSE", "DÉTECTION SALON", "DÉTECTION BUREAU", "PÉRIMÈTRE PISCINE"];
const NAV = [["home", "ACCUEIL"], ["lights", "LUMIÈRES"], ["shades", "STORES"], ["climate", "CLIMAT"], ["tv", "TV"], ["music", "MUSIQUE"], ["security", "SÉCURITÉ"], ["intercom", "INTERPHONE"]];
const COLORS = { "3000": "#FFC878", "6000": "#DCEBFF", red: "#FF4A3C", green: "#3CE07A", blue: "#3C7CFF", white: "#F2EEE6" };
const roomById = Object.fromEntries(ROOMS.map(r => [r.id, r]));
// icônes fines chauffage / climatisation (trait 1.5, remplace les emojis)
const ICO_HEAT = `<svg class="ico heat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5c.9 3.6 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.3 1-4.2 2.4-5.6.2 1.7 1.1 2.7 2.3 3C10.7 8.4 11.1 5.4 12 2.5z"/><path d="M12 21a2.6 2.6 0 0 0 2.6-2.6c0-1.6-1.4-2.4-2.6-4.2-1.2 1.8-2.6 2.6-2.6 4.2A2.6 2.6 0 0 0 12 21z"/></svg>`;
const ICO_COOL = `<svg class="ico cool" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4.2 7l15.6 10M4.2 17L19.8 7"/><path d="M12 2l-2.2 2.2M12 2l2.2 2.2M12 22l-2.2-2.2M12 22l2.2-2.2M4.2 7l3 .8M4.2 7l.8-3M19.8 17l-3-.8M19.8 17l-.8 3M4.2 17l3-.8M4.2 17l.8 3M19.8 7l-3 .8M19.8 7l-.8-3"/></svg>`;
const hvacIco = c => c.heat ? ICO_HEAT : c.ac ? ICO_COOL : "";

/* ---------------- état ---------------- */
const S = {
  page: "home", scene: null, theme: (() => { try { return localStorage.getItem("villa-stark-theme-v2") || "glacier"; } catch { return "glacier"; } })(),
  lights: {}, climate: {}, music: {}, shades: {},
  house: { gate: false, garage: false, pool: false },
  security: { mode: "disarmed", alarm: false, zones: ZONES.map(n => ({ name: n, open: false })) },
  intercom: { state: "idle", muted: false, msg: null },
  tv: { dev: null, swisscom: { power: false, ch: "", vol: 18, mute: false }, apple: { power: false, vol: 18, mute: false, app: "" } },
};
function defaults() {
  ROOMS.forEach(r => {
    S.lights[r.id] = { strip: "off", spots: "off", rgbw: "off", lv: { strip: 80, spots: 80, rgbw: 80 } };
    S.climate[r.id] = { heat: false, heatSP: 21.0, ac: false, acSpeed: 1, acSP: 24.0, temp: 20 + Math.round(Math.random() * 30) / 10 };
    S.music[r.id] = { src: null, vol: 40, mute: false };
  });
  SHADE_ROOMS.forEach(id => (S.shades[id] = { pos: 0 }));
}
defaults();

/* ---------------- utilitaires ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const fmt = t => t.toFixed(1) + "°";
const anyLight = id => { const l = S.lights[id]; return l.strip !== "off" || l.spots !== "off" || l.rgbw !== "off"; };
const anyLightHouse = () => ROOMS.some(r => anyLight(r.id));
const musicPlaying = () => ROOMS.some(r => S.music[r.id].src && !S.music[r.id].mute);
function roomLightColor(id) {
  const l = S.lights[id];
  if (l.rgbw !== "off") return { color: COLORS[l.rgbw], level: l.lv.rgbw };
  const parts = [];
  if (l.strip !== "off") parts.push({ color: COLORS[l.strip], level: l.lv.strip });
  if (l.spots !== "off") parts.push({ color: COLORS[l.spots], level: l.lv.spots });
  if (!parts.length) return { color: "#000", level: 0 };
  parts.sort((a, b) => b.level - a.level);
  return parts[0];
}

/* ---------------- la villa (photos + calques) ----------------
   Base : photo de la villa toutes lumières éteintes. Pour chaque pièce, un calque
   découpé dans la photo « lumières allumées » (clip-path sur la baie vitrée),
   dont l'opacité suit le niveau du variateur et dont la teinte suit la couleur
   choisie. Stores, portail, garage, piscine, sécurité : calques par-dessus.
   Calques recadrés sur la photographie originale 1672×941. */
const WIN = { // registered to the new 1672×941 original photograph
  Living: [304, 316, 326, 155], Dining: [698, 330, 205, 142], Kitchen: [964, 348, 239, 123], Office: [1262, 373, 166, 98],
  Cinema: [356, 516, 173, 129], Fitness: [588, 516, 189, 128], Entry: [840, 505, 174, 139], Master: [1102, 518, 253, 126], Bedroom: [1420, 517, 165, 127],
};
const PORTAIL = [237, 535, 65, 111], GARAGE = [37, 554, 164, 91];
const GARAGE_FG = "polygon(0 100%,0 100%,0 100%)";
const POOL_PTS = [[1318, 666], [1672, 671], [1672, 739], [1533, 735]];
const POOL_CLIP = "polygon(" + POOL_PTS.map(([x, y]) => `${x / 1672 * 100}% ${y / 941 * 100}%`).join(", ") + ")";
// intérieurs : zones de la baie vitrée et de l'écran TV, en % de la photo
const INT = {
 Living: { win:[0,5,43,62], tv:[70.4,21.8,17.4,20.7] },
 Dining: { win:[46,5,54,77] }, Kitchen: { win:[66,14,34,59] }, Office: { win:[77,0,23,87] },
 Cinema: { tv:[56.3,18.7,30,34.1] }, Fitness: { win:[0,3,44,92] }, Entry: { win:[86,0,14,90] },
 Master: { win:[47,8,53,68] }, Bedroom: { win:[78.5,12,18.5,55] }, Pool: {},
};
// Photographie originale, sans décalage entre la scène et ses calques.
const SCENE = { W: 1672, H: 941, ox: 0, oy: 0 };
const sx = x => (x + SCENE.ox) / SCENE.W * 100, sy = y => (y + SCENE.oy) / SCENE.H * 100;
const pct = ([x, y, w, h]) => ({ left: sx(x) + "%", top: sy(y) + "%", width: w / SCENE.W * 100 + "%", height: h / SCENE.H * 100 + "%" });
// trois circuits indépendants : ruban LED (corniche, en haut), spots (éclairage général), COULEURS (lumière d'ambiance, en bas)
const TEMP = { "3000": "#FFC878", "6000": "#D6E6FF" };
function circuits(id) {
  const l = S.lights[id];
  return {
    strip: l.strip !== "off" ? { color: TEMP[l.strip], level: l.lv.strip, cool: l.strip === "6000" } : null,
    spots: l.spots !== "off" ? { color: TEMP[l.spots], level: l.lv.spots, cool: l.spots === "6000" } : null,
    rgbw:  l.rgbw  !== "off" ? { color: COLORS[l.rgbw], level: l.lv.rgbw, white: l.rgbw === "white" } : null,
  };
}
const COOL_FILTER = "sepia(0.55) hue-rotate(178deg) saturate(0.85) brightness(1.12)";

const H = { rooms: {} };
function div(cls, style = "") { const d = document.createElement("div"); d.className = cls; d.style.cssText = style; return d; }
// calque image plein cadre, positionné pour que la zone [x,y,w,h] de la photo tombe sur l'élément parent (qui la découpe)
function fullLayer(cls, img, [x, y, w, h]) {
  return div(cls, `position:absolute;left:${-x / w * 100}%;top:${-y / h * 100}%;width:${SCENE.W / w * 100}%;height:${SCENE.H / h * 100}%;background:url(${img}) 0 0/100% 100% no-repeat`);
}
function buildHouse() {
  const stage = $("#houseStage");
  ROOMS.filter(r => !r.pool).forEach(r => {
    const p = pct(WIN[r.id]);
    const win = div("win", `left:${p.left};top:${p.top};width:${p.width};height:${p.height}`);
    win.dataset.room = r.id;
    const lit = fullLayer("win-lit", "assets/original/hero-on.webp", WIN[r.id]); const strip = div("win-strip"); const rgbw = div("win-rgbw"); const glow = div("win-glow");
    const shade = div("win-shade"); const tv = div("win-tv"); const hvac = div("win-hvac");
    if (r.id === "Cinema") Object.assign(tv.style, {left:"12%",top:"18%",width:"29%",height:"32%"});
    const chip = div("win-chip"); chip.innerHTML = `<b>${r.name}</b><span></span>`;
    const clip = div("win-clip"); clip.appendChild(lit);
    win.append(glow, clip, strip, rgbw, hvac, tv, shade, chip);
    win.addEventListener("click", () => enterRoom(r.id));
    stage.appendChild(win);
    H.rooms[r.id] = { win, lit, strip, rgbw, glow, shade, tv, hvac, chip: chip.querySelector("span") };
  });
  // piscine
  const pool = div("pool", `clip-path:${POOL_CLIP}`); pool.dataset.room = "Pool";
  const pdark = div("pool-dark"), ptint = div("pool-tint"), pcover = div("pool-cover");
  pcover.appendChild(div("pool-cover-img", "position:absolute;inset:0;background:url(assets/original/mechanical-open.webp) 0 0/100% 100% no-repeat"));
  pool.append(pdark, ptint, pcover); pool.addEventListener("click", () => enterRoom("Pool")); stage.appendChild(pool);
  H.rooms.Pool = { dark: pdark, tint: ptint, cover: pcover };
  // portail (coulissant) et garage (sectionnel)
  const g = pct(PORTAIL); const gateSlot = div("gate-slot", `left:${g.left};top:${g.top};width:${g.width};height:${g.height}`);
  const gateBg = fullLayer("gate-bg", "assets/original/mechanical-open.webp", PORTAIL);
  const gateL = div("gate-leaf gate-l"); gateL.appendChild(fullLayer("", "assets/original/hero-off.webp", PORTAIL));
  const gateR = div("gate-leaf gate-r"); gateR.appendChild(fullLayer("", "assets/original/hero-off.webp", PORTAIL));
  gateSlot.append(gateBg, gateL, gateR); stage.appendChild(gateSlot);
  const ga = pct(GARAGE); const garSlot = div("garage-slot", `left:${ga.left};top:${ga.top};width:${ga.width};height:${ga.height}`);
  const garIn = fullLayer("garage-inside", "assets/original/mechanical-open.webp", GARAGE), garDoor = div("garage-door"); garDoor.appendChild(fullLayer("", "assets/original/hero-off.webp", GARAGE));
  garDoor.appendChild(div("garage-door-edge"));
  const garFg = div("garage-fg", `clip-path:${GARAGE_FG}`); garFg.appendChild(fullLayer("", "assets/original/hero-off.webp", GARAGE));
  garSlot.append(garIn, garDoor, div("garage-lintel"), garFg); stage.appendChild(garSlot);
  H.gateL = gateL; H.gateR = gateR; H.garage = garDoor; H.garageIn = garIn;
  // sécurité, interphone
  H.beacon = $("#beacon"); H.visitor = $("#visitor");
  // bandeau des pièces
  const strip = $("#roomStrip"); H.thumbs = {};
  ROOMS.forEach(r => {
    const t = div("thumb", `background-image:url(assets/original/room-${r.id}.webp)`); t.innerHTML = `<i></i><span>${r.name}</span>`;
    t.onclick = () => (roomView === r.id ? leaveRoom() : enterRoom(r.id)); strip.appendChild(t); H.thumbs[r.id] = t;
  });
}

function renderHouse() {
  ROOMS.filter(r => !r.pool).forEach(r => {
    const h = H.rooms[r.id], c3 = circuits(r.id), on = anyLight(r.id);
    // spots : la photo « allumée » révélée, en version froide si 6000 K
    h.lit.style.opacity = c3.spots ? 0.12 + 0.88 * c3.spots.level / 100 : 0;
    h.lit.style.filter = c3.spots && c3.spots.cool ? COOL_FILTER : "none";
    // ruban LED en corniche : bande lumineuse en haut de la baie
    h.strip.style.setProperty("--c", c3.strip ? c3.strip.color : "transparent");
    h.strip.style.opacity = c3.strip ? 0.25 + 0.75 * c3.strip.level / 100 : 0;
    // COULEURS : lavage coloré depuis le bas
    h.rgbw.style.setProperty("--c", c3.rgbw ? c3.rgbw.color : "transparent");
    h.rgbw.style.opacity = c3.rgbw ? (c3.rgbw.white ? 0.35 : 0.6) + 0.4 * c3.rgbw.level / 100 : 0;
    // halo sur la façade : couleur du circuit dominant
    const dom = [c3.rgbw && !c3.rgbw.white ? { ...c3.rgbw, w: 1.2 } : null, c3.spots, c3.strip, c3.rgbw].filter(Boolean).sort((a, b) => b.level * (b.w || 1) - a.level * (a.w || 1))[0];
    const level = dom ? dom.level : 0;
    h.glow.style.boxShadow = on ? `0 0 ${18 + level * 0.5}px ${6 + level * 0.14}px ${dom.color}` : "none"; h.glow.style.opacity = on ? 0.2 + level / 250 : 0;
    const c = S.climate[r.id];
    h.chip.innerHTML = fmt(c.temp) + hvacIco(c);
    h.hvac.style.opacity = c.heat || c.ac ? 1 : 0; h.hvac.innerHTML = hvacIco(c);
    h.shade.style.transform = `scaleY(${r.shade ? S.shades[r.id].pos / 100 : 0})`;
    if (r.tv) { const tv = S.tv[r.tv]; h.tv.style.opacity = tv.power ? 1 : 0; h.tv.textContent = tv.power ? (r.tv === "swisscom" ? "CH " + (tv.ch || "1") : (tv.app || "tv")) : ""; }
  });
  // piscine
  const pl = anyLight("Pool"), { color, level } = roomLightColor("Pool"), P = H.rooms.Pool, pc = circuits("Pool");
  P.dark.style.opacity = pl ? 0.55 - 0.55 * level / 100 : 0.72;
  P.tint.style.background = color; P.tint.style.opacity = pc.rgbw && !pc.rgbw.white ? 0.45 + 0.4 * pc.rgbw.level / 100 : 0;
  P.cover.style.clipPath = S.house.pool ? "inset(0 0 0 0)" : "inset(0 100% 0 0)";
  // portail, garage
  H.gateL.style.transform = S.house.gate ? "translateX(-100%)" : "none"; H.gateR.style.transform = S.house.gate ? "translateX(100%)" : "none";
  H.garage.style.transform = S.house.garage ? "translateY(-97%)" : "none"; H.garageIn.classList.toggle("open", S.house.garage);
  // sécurité
  const sec = S.security, armed = sec.mode !== "disarmed";
  $("#houseStage").dataset.sec = sec.alarm ? "alarm" : armed ? "armed" : "off";
  $("#houseStage").classList.toggle("alarm", sec.alarm);
  // interphone
  const ic = S.intercom;
  H.visitor.classList.toggle("here", ic.state !== "idle" || !!ic.visitor);
  H.visitor.classList.toggle("ringing", ic.state === "ringing");
  ROOMS.forEach(r => { const t = H.thumbs[r.id]; t.classList.toggle("lit", anyLight(r.id)); t.classList.toggle("active", roomView === r.id); });
  renderRoomView();
  publishState();
}

/* ---------------- vue intérieure d'une pièce ---------------- */
let roomView = null;
function enterRoom(id) {
  if (backgroundOnly && !applyingSnapshot) { syncBus?.postMessage({ type: "command", action: "room", value: id }); return; }
  roomView = id;
  const r = roomById[id], v = $("#roomView");
  v.querySelector(".rv-photo").style.backgroundImage = `url(assets/original/room-${id}.webp)`;
  v.querySelector(".rv-title").textContent = r.name;
  const i = INT[id];
  const sh = v.querySelector(".rv-shade"), tv = v.querySelector(".rv-tv");
  if (i.win && r.shade) { Object.assign(sh.style, { left: i.win[0] + "%", top: i.win[1] + "%", width: i.win[2] + "%", height: i.win[3] + "%", display: "block" }); } else sh.style.display = "none";
  if (i.tv) { Object.assign(tv.style, { left: i.tv[0] + "%", top: i.tv[1] + "%", width: i.tv[2] + "%", height: i.tv[3] + "%", display: "flex" }); } else tv.style.display = "none";
  // origine du zoom : la fenêtre cliquée
  const w = id === "Pool" ? [1400, 615, 10, 10] : WIN[id];
  v.style.transformOrigin = `${sx(w[0] + w[2] / 2)}% ${sy(w[1] + w[3] / 2)}%`;
  $("#houseStage").classList.add("zoomed"); v.classList.add("open");
  go(id === "Pool" ? "light:Pool" : "light:" + id);
}
function leaveRoom() { if (backgroundOnly && !applyingSnapshot) { syncBus?.postMessage({ type: "command", action: "exterior" }); return; } roomView = null; $("#roomView").classList.remove("open"); $("#houseStage").classList.remove("zoomed"); go("lights"); }
function renderRoomView() {
  if (!roomView) return;
  const id = roomView, r = roomById[id], v = $("#roomView"), l = S.lights[id], c3 = circuits(id), on = anyLight(id);
  // spots = éclairage général de la photo ; ruban et COULEURS = calques additifs
  const floor = id === "Pool" ? 0.32 : 0.12, sp = c3.spots ? c3.spots.level / 100 : 0;
  const b = floor + (1 - floor) * sp + (!c3.spots && (c3.strip || c3.rgbw) ? 0.08 : 0);
  v.querySelector(".rv-photo").style.filter = `brightness(${b}) saturate(${on ? 1 : 0.55}) ${c3.spots && c3.spots.cool ? COOL_FILTER : ""}`;
  v.querySelector(".rv-night").style.opacity = on ? (c3.spots ? 0 : 0.3) : 0.45;
  const st = v.querySelector(".rv-strip"); st.style.setProperty("--c", c3.strip ? c3.strip.color : "transparent"); st.style.opacity = c3.strip ? 0.3 + 0.7 * c3.strip.level / 100 : 0;
  const rg = v.querySelector(".rv-rgbw"); rg.style.setProperty("--c", c3.rgbw ? c3.rgbw.color : "transparent"); rg.style.opacity = c3.rgbw ? (c3.rgbw.white ? 0.3 : 0.55) + 0.4 * c3.rgbw.level / 100 : 0;
  if (r.shade) v.querySelector(".rv-shade").style.transform = `scaleY(${S.shades[id].pos / 100})`;
  if (r.tv) { const tv = S.tv[r.tv], e = v.querySelector(".rv-tv"); e.classList.toggle("on", tv.power); e.innerHTML = tv.power ? `<span>${r.tv === "swisscom" ? "SWISSCOM TV<br>CHAINE " + (tv.ch || "1") : (tv.app || "APPLE TV").toUpperCase()}</span>` : ""; }
  const c = S.climate[id], m = S.music[id];
  v.querySelector(".rv-climate").style.display = id === "Pool" ? "none" : "flex";
  v.querySelector(".rv-climate").innerHTML = `<b>${fmt(c.temp)}</b>${hvacIco(c)}${c.heat ? "chauffage " + fmt(c.heatSP) : c.ac ? "clim " + fmt(c.acSP) + " · vitesse " + c.acSpeed : "climat en veille"}`;
  const mu = v.querySelector(".rv-music"); mu.style.opacity = m.src ? 1 : 0; mu.innerHTML = `<div class="eq-badge" style="opacity:${m.mute ? 0.3 : 1}"><i></i><i></i><i></i><i></i></div>${(m.src || "").toUpperCase()} · ${m.mute ? "MUET" : m.vol + " %"}`;
  const li = v.querySelector(".rv-lights");
  li.textContent = !on ? "éclairage éteint" : [l.strip !== "off" ? "ruban " + l.strip + "K " + l.lv.strip + " %" : "", l.spots !== "off" ? "spots " + l.spots + "K " + l.lv.spots + " %" : "", l.rgbw !== "off" ? "COULEURS " + l.rgbw.toUpperCase() + " " + l.lv.rgbw + " %" : ""].filter(Boolean).join(" · ");
}

/* ---------------- navigation de la dalle ---------------- */
function go(p) { S.page = p; render(); }
function pageTitle() {
  const p = S.page;
  if (p.startsWith("light:")) return roomById[p.slice(6)].name;
  if (p.startsWith("clim:")) return roomById[p.slice(5)].name;
  return { home: "", lights: "ÉCLAIRAGE", shades: "STORES", climate: "CLIMAT", tv: "TV", "tv:swisscom": "SWISSCOM TV", "tv:apple": "APPLE TV", music: "MUSIQUE", security: "SÉCURITÉ", intercom: "INTERPHONE" }[p] || "";
}
function navKey() { const p = S.page; return p.startsWith("light") ? "lights" : p.startsWith("clim") ? "climate" : p.startsWith("tv") ? "tv" : p; }

const THEMES = [["aurum", "Sombre — or sur nuit"], ["glacier", "Clair élégant — verre clair"], ["carbone", "Verre dépoli — graphite et cuivre"]];
function renderThemeBar() {
  const bar = $("#themeBar"); bar.querySelectorAll("button").forEach(b => b.remove());
  THEMES.forEach(([k, lbl]) => { const b = document.createElement("button"); b.className = (S.theme === k ? "sel" : ""); b.innerHTML = `<i class="d-${k}"></i>${lbl.split(" — ")[0]}`; b.title = lbl; b.onclick = () => { S.theme = k; try { localStorage.setItem("villa-stark-theme-v2", k); } catch {} render(); }; bar.appendChild(b); });
}
function render() {
  const tsw = $("#tsw"); tsw.classList.toggle("home", S.page === "home"); tsw.dataset.theme = S.theme;
  $("#hdrTitle").textContent = pageTitle();
  renderThemeBar();
  const nb = $("#navbar"); nb.innerHTML = "";
  NAV.forEach(([k, lbl]) => {
    const b = document.createElement("button"); b.className = "nav-btn" + (navKey() === k ? " sel" : "");
    b.innerHTML = `<img src="assets/Icon_${k}.png" alt="">${lbl}`; b.onclick = () => go(k); nb.appendChild(b);
  });
  const pg = $("#page"); pg.className = "page"; pg.innerHTML = "";
  const p = S.page;
  if (p === "home") renderHome(pg);
  else if (p === "lights") renderPlan(pg, "light");
  else if (p.startsWith("light:")) renderRoomLights(pg, p.slice(6));
  else if (p === "shades") renderShades(pg);
  else if (p === "climate") renderPlan(pg, "clim");
  else if (p.startsWith("clim:")) renderRoomClimate(pg, p.slice(5));
  else if (p === "tv") renderTV(pg);
  else if (p === "tv:swisscom") renderSwisscom(pg);
  else if (p === "tv:apple") renderApple(pg);
  else if (p === "music") renderMusic(pg);
  else if (p === "security") renderSecurity(pg);
  else if (p === "intercom") renderIntercom(pg);
  renderHouse();
  document.querySelectorAll(".nav-btn,.scene-btn,.theme-bar button,.btn").forEach(b => { b.setAttribute("aria-pressed", String(b.classList.contains("sel"))); });
  document.querySelectorAll(".status-tile").forEach(tile => { tile.tabIndex = 0; tile.setAttribute("role", "button"); tile.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tile.click(); } }; });
}
function btn(label, cls = "", on = null, sel = false) {
  const b = document.createElement("button"); b.className = "btn " + cls + (sel ? " sel" : ""); b.innerHTML = label;
  if (on) b.onclick = e => { on(e); render(); };
  return b;
}
function card(x, y, w, h, title) {
  const c = document.createElement("div"); c.className = "card"; c.style.cssText = `left:${x}px;top:${y}px;width:${w}px;${h ? "height:" + h + "px;" : ""}`;
  if (title) { const t = document.createElement("div"); t.className = "card-title"; t.textContent = title; c.appendChild(t); }
  return c;
}

/* ---------------- Home ---------------- */
function renderHome(pg) {
  pg.innerHTML = `<div class="home-bg"></div><img class="home-logo" src="/assets/logo-frequence-tv-5LGUrtbd.png" alt="Frequence TV">
    <div class="home-clock"><div class="time" id="homeTime"></div><div class="date" id="homeDate"></div></div>
    <div class="home-welcome">BIENVENUE CHEZ VOUS</div><div class="status-row" id="statusRow"></div>
    <div class="home-section" style="left:40px"><div class="label">VOTRE QUOTIDIEN</div><div class="scene-row" id="sceneRow"></div></div>
    <div class="home-section" style="left:820px"><div class="label">ACCÈS</div><div class="scene-row access-row" id="accessRow"></div></div>
    <div class="home-section home-row2" style="left:40px"><div class="label">ÉCLAIRAGE</div><div class="scene-row" id="lightRow"></div></div>
    <div class="home-section home-row2" style="left:376px"><div class="label">STORES</div><div class="scene-row" id="shadeRow"></div></div>`;
  const ic = S.intercom, living = S.climate.Living;
  const tiles = [
    ["lights", "ÉCLAIRAGE", anyLightHouse() ? "MARCHE" : "TOUT ÉTEINDRE", anyLightHouse(), "lights"],
    ["climate", "CLIMAT SALON", fmt(living.temp) + hvacIco(living), living.heat || living.ac, "clim:Living"],
    ["music", "MUSIQUE", musicPlaying() ? "EN LECTURE" : "ARRÊT", musicPlaying(), "music"],
    ["intercom", "INTERPHONE", ic.state === "ringing" ? "APPEL ENTRANT" : ic.state === "call" ? "EN LIGNE" : "AUCUN APPEL", ic.state !== "idle", "intercom"],
  ];
  const sr = $("#statusRow");
  tiles.forEach(([ico, l, v, on, dest]) => {
    const t = document.createElement("div"); t.className = "status-tile" + (on ? " on" : "") + (ico === "intercom" && ic.state === "ringing" ? " ring" : "");
    t.innerHTML = `<img src="assets/Icon_${ico}.png" alt=""><div><div class="label">${l}</div><div class="value">${v}</div></div>`;
    t.onclick = () => go(dest); sr.appendChild(t);
  });
  const scenes = [["arrival", "JE RENTRE"], ["departure", "JE PARS"], ["evening", "JE REÇOIS"], ["cinema", "MON FILM"], ["night", "BONNE NUIT"], ["alloff", "TOUT ÉTEINDRE"]];
  scenes.forEach(([k, l]) => {
    const b = document.createElement("button"); b.className = "scene-btn" + (S.scene === k ? " sel" : "");
    b.innerHTML = `<img src="assets/Icon_${k === "cinema" ? "tv" : k}.png" alt="">${l}`; b.onclick = () => { runScene(k); render(); $("#sceneRow")?.children[scenes.findIndex(s => s[0] === k)]?.classList.add("flash"); };
    $("#sceneRow").appendChild(b);
  });
  [["gate", "PORTAIL", "gate"], ["garage", "GARAGE", "garage"], ["pool", "COUVERTURE", "pool"]].forEach(([k, l, ico]) => {
    const on = S.house[k];
    const b = document.createElement("button"); b.className = "scene-btn" + (on ? " sel" : "");
    b.innerHTML = `<img src="assets/Icon_${ico}.png" alt="">${l}<span class="st">${k === "pool" ? (on ? "FERMÉE" : "OUVERTE") : (on ? "OUVERT" : "FERMÉ")}</span>`;
    b.onclick = () => { S.house[k] = !S.house[k]; render(); }; $("#accessRow").appendChild(b);
  });
  const allOn = ROOMS.every(r => anyLight(r.id)), noneOn = !anyLightHouse();
  [["lights", "TOUT ALLUMER", () => ROOMS.forEach(r => setLight(r.id, "3000", "3000", 80)), allOn], ["alloff", "TOUT ÉTEINDRE", () => allOff(), noneOn]].forEach(([ico, l, fn, sel]) => {
    const b = document.createElement("button"); b.className = "scene-btn" + (sel ? " sel" : ""); b.innerHTML = `<img src="assets/Icon_${ico}.png" alt="">${l}`; b.onclick = () => { fn(); S.scene = null; render(); }; $("#lightRow").appendChild(b);
  });
  const allUp = SHADE_ROOMS.every(id => !S.shades[id].pos), allDown = SHADE_ROOMS.every(id => S.shades[id].pos === 100);
  [["shades", "TOUT OUVRIR", 0, allUp], ["shades", "TOUT FERMER", 100, allDown]].forEach(([ico, l, pos, sel]) => {
    const b = document.createElement("button"); b.className = "scene-btn" + (sel ? " sel" : ""); b.innerHTML = `<img src="assets/Icon_${ico}.png" alt="">${l}`; b.onclick = () => { stopAllShadeMotion(); SHADE_ROOMS.forEach(id => (S.shades[id].pos = pos)); render(); }; $("#shadeRow").appendChild(b);
  });
  tickClock();
}

/* ---------------- plan (éclairage / climat) ---------------- */
function renderPlan(pg, mode) {
  const plan = document.createElement("div"); plan.className = "plan"; pg.appendChild(plan);
  ROOMS.forEach(r => {
    const [x, y, w, h] = r.plan, b = document.createElement("button"); b.className = "plan-btn";
    b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    if (mode === "light") { if (anyLight(r.id)) b.classList.add("sel"); b.title = r.name; b.setAttribute("aria-label", r.name); b.onclick = () => go("light:" + r.id); }
    else { const c = S.climate[r.id]; if (c.heat) b.classList.add("sel"); else if (c.ac) b.classList.add("cool");
      b.title = r.name; b.setAttribute("aria-label", r.name); b.innerHTML = `<span class="sub">${fmt(c.temp)}</span>`; b.onclick = () => go("clim:" + r.id); }
    const label = document.createElement("span"); label.className = "plan-room-name"; label.textContent = r.name; b.appendChild(label);
    plan.appendChild(b);
  });
}

/* ---------------- éclairage d'une pièce ---------------- */
function renderRoomLights(pg, id) {
  const l = S.lights[id];
  pg.appendChild(btn("◀&nbsp; PLAN", "back-btn", () => (S.page = "lights")));
  pg.classList.add("rl"); const g = card(40, 70, 600, null, "ENSEMBLE");
  const row = document.createElement("div"); row.className = "row";
  row.append(btn("TOUT ALLUMER", "lg", () => { l.strip = l.spots = "3000"; }, l.strip !== "off" && l.spots !== "off"), btn("TOUT ÉTEINDRE", "lg", () => { l.strip = l.spots = l.rgbw = "off"; }, !anyLight(id)));
  g.appendChild(row); pg.appendChild(g);
  const mk = (title, y, key) => {
    const c = card(40, y, 600, null, title); const r = document.createElement("div"); r.className = "row";
    [["ARRÊT", "off"], ["CHAUD", "3000"], ["FROID", "6000"]].forEach(([lab, v]) => r.appendChild(btn(lab, "", () => { l[key] = v; }, l[key] === v)));
    c.appendChild(r); pg.appendChild(c);
  };
  mk("ÉCLAIRAGE INDIRECT", 192, "strip"); mk("SPOTS", 310, "spots");
  const rg = card(40, 428, 600, null, "COULEURS"); const rr = document.createElement("div"); rr.className = "row";
  [["ARRÊT", "off", ""], ["ROUGE", "red", "#FF4A3C"], ["VERT", "green", "#3CE07A"], ["BLEU", "blue", "#3C7CFF"], ["BLANC", "white", "#F2EEE6"]].forEach(([lab, v, col]) =>
    rr.appendChild(btn((col ? `<span class="swatch" style="background:${col};color:${col}"></span>` : "") + lab, "", () => { l.rgbw = v; }, l.rgbw === v)));
  rg.appendChild(rr); pg.appendChild(rg);
  const lv = card(680, 70, 560, 462, "INTENSITÉ");
  [["INDIRECT", "strip"], ["SPOTS", "spots"], ["COULEURS", "rgbw"]].forEach(([lab, key]) => {
    const s = document.createElement("div"); s.className = "slider";
    s.innerHTML = `<span class="label">${lab}</span><input type="range" min="0" max="100" value="${l.lv[key]}" style="--p:${l.lv[key]}%"><span class="pct">${l.lv[key]} %</span>`;
    const inp = s.querySelector("input"), pct = s.querySelector(".pct"); inp.setAttribute("aria-label", lab + " — " + roomById[id].name);
    inp.oninput = () => { l.lv[key] = +inp.value; inp.style.setProperty("--p", inp.value + "%"); pct.textContent = inp.value + " %"; if (+inp.value > 0 && l[key] === "off") l[key] = key === "rgbw" ? "white" : "3000"; renderHouse(); };
    inp.onchange = () => render();
    lv.appendChild(s);
  });
  const note = document.createElement("p"); note.className = "label"; note.style.cssText = "margin-top:26px;line-height:1.7;letter-spacing:1.5px";
  note.innerHTML = "Lutron HomeWorks QSX · DALI<br>Circuits gradables 0–100 %";
  lv.appendChild(note); pg.appendChild(lv);
}

/* ---------------- stores ---------------- */
let shadeTimers = {};
function stopAllShadeMotion() {
  Object.values(shadeTimers).forEach(clearInterval);
  SHADE_ROOMS.forEach(id => delete S.shades[id].target);
}
function moveShade(id, dir) {
  clearInterval(shadeTimers[id]);
  document.querySelectorAll('.win-shade,.rv-shade,.shade-vis .blind').forEach(el => el.style.transition = 'none');
  if (dir === "stop") { delete S.shades[id].target; renderHouse(); refreshShadeVis(); return; }
  const target = dir === "down" ? 100 : 0, from = S.shades[id].pos, started = performance.now();
  S.shades[id].target = target;
  shadeTimers[id] = setInterval(() => {
    const progress = Math.min(1, (performance.now() - started) / 2400);
    S.shades[id].pos = Math.round(from + (target - from) * progress);
    renderHouse(); refreshShadeVis();
    if (progress === 1) { clearInterval(shadeTimers[id]); delete S.shades[id].target; }
  }, 40);
}
function refreshShadeVis() { document.querySelectorAll(".shade-card").forEach(c => { const id = c.dataset.id, pos = S.shades[id].pos; c.querySelector(".blind").style.transform = `scaleY(${pos / 100})`; c.querySelector(".pos").textContent = pos === 0 ? "OUVERT" : pos === 100 ? "FERMÉ" : pos + " %"; }); }
function renderShades(pg) {
  const grid = document.createElement("div"); grid.className = "shade-grid";
  SHADE_ROOMS.forEach(id => {
    const c = document.createElement("div"); c.className = "card shade-card"; c.style.position = "relative"; c.dataset.id = id;
    c.innerHTML = `<div class="card-title">${roomById[id].name}</div><div class="col"></div><div class="shade-vis"><div class="blind" style="transform:scaleY(${S.shades[id].pos / 100})"></div></div><div class="pos">${S.shades[id].pos ? "FERMÉ" : "OUVERT"}</div>`;
    const col = c.querySelector(".col");
    [["▲&nbsp; OUVRIR", "up"], ["■&nbsp; ARRÊTER", "stop"], ["▼&nbsp; FERMER", "down"]].forEach(([lab, d]) => { const b = document.createElement("button"); b.className = "btn"; b.innerHTML = lab; b.onclick = () => moveShade(id, d); col.appendChild(b); });
    grid.appendChild(c);
  });
  pg.appendChild(grid);
}

/* ---------------- climat d'une pièce ---------------- */
function renderRoomClimate(pg, id) {
  const c = S.climate[id];
  pg.appendChild(btn("◀&nbsp; PLAN", "back-btn", () => (S.page = "climate")));
  const gw = document.createElement("div"); gw.className = "gauge-wrap";
  const angle = -125 + (Math.min(30, Math.max(14, c.temp)) - 14) / 16 * 250;
  gw.innerHTML = `<div class="gauge"><div class="needle" style="transform:rotate(${angle + 180}deg)"></div><div class="cur"><div class="label">TEMPÉRATURE</div><div class="value">${fmt(c.temp)}</div></div><span class="min">14°</span><span class="mid">22°</span><span class="max">30°</span></div>`;
  pg.appendChild(gw);
  const h = card(470, 40, 380, 262, "CHAUFFAGE"); const hr = document.createElement("div"); hr.className = "row";
  hr.append(btn("MARCHE", "", () => { c.heat = true; c.ac = false; }, c.heat), btn("ARRÊT", "", () => { c.heat = false; }, !c.heat)); h.appendChild(hr);
  const hs = document.createElement("div"); hs.className = "sp-row";
  hs.innerHTML = `<div><div class="label">CONSIGNE</div><div class="value">${fmt(c.heatSP)}</div></div>`;
  const hc = document.createElement("div"); hc.className = "ctrl"; hc.append(btn("−", "sq", () => { c.heatSP = Math.max(14, c.heatSP - 0.5); }), btn("+", "sq", () => { c.heatSP = Math.min(30, c.heatSP + 0.5); })); hs.appendChild(hc); h.appendChild(hs); pg.appendChild(h);
  const a = card(870, 40, 380, 262, "CLIMATISATION"); const ar = document.createElement("div"); ar.className = "row";
  ar.append(btn("MARCHE", "", () => { c.ac = true; c.heat = false; }, c.ac), btn("ARRÊT", "", () => { c.ac = false; }, !c.ac)); a.appendChild(ar);
  const as = document.createElement("div"); as.className = "sp-row";
  as.innerHTML = `<div><div class="label">CONSIGNE</div><div class="value">${fmt(c.acSP)}</div></div>`;
  const ac = document.createElement("div"); ac.className = "ctrl"; ac.append(btn("−", "sq", () => { c.acSP = Math.max(16, c.acSP - 0.5); }), btn("+", "sq", () => { c.acSP = Math.min(30, c.acSP + 0.5); })); as.appendChild(ac); a.appendChild(as); pg.appendChild(a);
  const f = card(470, 330, 780, null, "VENTILATION"); const fr = document.createElement("div"); fr.className = "row";
  [1, 2, 3].forEach(n => fr.appendChild(btn("VITESSE " + n, "", () => { c.acSpeed = n; c.ac = true; c.heat = false; }, c.ac && c.acSpeed === n))); f.appendChild(fr); pg.appendChild(f);
}

/* ---------------- TV ---------------- */
function renderTV(pg) {
  const d = document.createElement("div"); d.className = "tv-choice";
  d.append(btn(`<img src="assets/Icon_tv.png" alt="">SWISSCOM TV`, "", () => (S.page = "tv:swisscom"), S.tv.swisscom.power), btn(`<img src="assets/Icon_tv.png" alt="">APPLE TV`, "", () => (S.page = "tv:apple"), S.tv.apple.power));
  pg.appendChild(d);
}
function renderSwisscom(pg) {
  const t = S.tv.swisscom;
  pg.appendChild(btn("◀&nbsp; TV", "back-btn", () => (S.page = "tv")));
  const np = card(40, 76, 380, 420, "CHAINES"); const grid = document.createElement("div"); grid.className = "numpad";
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "◀", "0", "ⓘ"].forEach(k => grid.appendChild(btn(k, "", () => { if (/\d/.test(k)) { t.ch = (t.ch.length >= 2 ? "" : t.ch) + k; t.power = true; } else if (k === "◀") t.ch = ""; })));
  np.appendChild(grid); const st = document.createElement("div"); st.className = "tv-status"; st.innerHTML = `CHAINE <b>${t.ch || "—"}</b>`; np.appendChild(st); pg.appendChild(np);
  const nv = card(450, 76, 380, 420, "NAVIGATION"); const dp = document.createElement("div"); dp.className = "dpad";
  [["▲", "u"], ["▼", "d"], ["◀", "l"], ["▶", "r"], ["OK", "c"]].forEach(([k, cl]) => dp.appendChild(btn(k, cl, () => {}))); nv.appendChild(dp);
  const r2 = document.createElement("div"); r2.className = "row"; r2.style.marginTop = "30px"; r2.append(btn("MENU", "", () => {}), btn("▶ ❚❚", "", () => {})); nv.appendChild(r2); pg.appendChild(nv);
  const vc = card(860, 76, 380, 420, "CHAINE / VOLUME"); const cols = document.createElement("div"); cols.className = "row";
  const c1 = document.createElement("div"); c1.style.cssText = "flex:1;display:flex;flex-direction:column;gap:10px;align-items:center";
  c1.append(btn("CH ▲", "", () => { t.ch = String(Math.min(99, (+t.ch || 0) + 1)); t.power = true; }), Object.assign(document.createElement("div"), { className: "label", textContent: "CHAINE" }), btn("CH ▼", "", () => { t.ch = String(Math.max(1, (+t.ch || 1) - 1)); t.power = true; }));
  const c2 = document.createElement("div"); c2.style.cssText = "flex:1;display:flex;flex-direction:column;gap:10px;align-items:center";
  c2.append(btn("VOL +", "", () => { t.vol = Math.min(100, t.vol + 5); }), Object.assign(document.createElement("div"), { className: "label", textContent: "VOLUME  " + t.vol }), btn("VOL −", "", () => { t.vol = Math.max(0, t.vol - 5); }));
  [...c1.querySelectorAll(".btn"), ...c2.querySelectorAll(".btn")].forEach(b => (b.style.cssText = "width:150px;height:60px;flex:none"));
  cols.append(c1, c2); vc.appendChild(cols);
  const r3 = document.createElement("div"); r3.className = "row"; r3.style.marginTop = "24px";
  r3.append(btn("🔇 MUET", "", () => { t.mute = !t.mute; }, t.mute), btn("⏻ " + (t.power ? "MARCHE" : "ARRÊT"), t.power ? "green" : "red", () => { t.power = !t.power; }, t.power)); vc.appendChild(r3); pg.appendChild(vc);
}
function renderApple(pg) {
  const t = S.tv.apple;
  pg.appendChild(btn("◀&nbsp; TV", "back-btn", () => (S.page = "tv")));
  const nv = card(250, 60, 380, 520, "APPLE TV"); const dp = document.createElement("div"); dp.className = "dpad";
  [["▲", "u"], ["▼", "d"], ["◀", "l"], ["▶", "r"], ["OK", "c"]].forEach(([k, cl]) => dp.appendChild(btn(k, cl, () => { if (cl === "c") { t.power = true; t.app = ["Netflix", "Apple TV+", "Disney+", "YouTube"][Math.floor(Math.random() * 4)]; } }))); nv.appendChild(dp);
  const r2 = document.createElement("div"); r2.className = "row"; r2.style.marginTop = "30px"; r2.append(btn("MENU", "", () => { t.app = ""; }), btn("▶ ❚❚", "", () => {}), btn("TV", "", () => { t.app = "Apple TV"; t.power = true; })); nv.appendChild(r2);
  const st = document.createElement("div"); st.className = "tv-status"; st.innerHTML = `APP <b>${t.app || "—"}</b>`; nv.appendChild(st); pg.appendChild(nv);
  const vc = card(660, 60, 370, 520, "VOLUME"); const col = document.createElement("div"); col.style.cssText = "display:flex;flex-direction:column;gap:12px";
  col.append(btn("VOL +", "", () => { t.vol = Math.min(100, t.vol + 5); }), Object.assign(document.createElement("div"), { className: "value", textContent: t.vol + " %", style: "text-align:center;font-size:36px" }), btn("VOL −", "", () => { t.vol = Math.max(0, t.vol - 5); }), btn("🔇 MUET", "", () => { t.mute = !t.mute; }, t.mute), btn("⏻ " + (t.power ? "MARCHE" : "ARRÊT"), t.power ? "green" : "red", () => { t.power = !t.power; if (!t.power) t.app = ""; }, t.power));
  vc.appendChild(col); pg.appendChild(vc);
}

/* ---------------- musique ---------------- */
function renderMusic(pg) {
  const tbl = document.createElement("table"); tbl.className = "music-table";
  tbl.innerHTML = `<thead><tr><th>PIÈCE</th>${SOURCES.map(s => `<th>${s.toUpperCase()}</th>`).join("")}<th>VOLUME</th></tr></thead><tbody></tbody>`;
  const tb = tbl.querySelector("tbody");
  ROOMS.forEach(r => {
    const m = S.music[r.id], tr = document.createElement("tr");
    const td0 = document.createElement("td"); td0.textContent = r.name; tr.appendChild(td0);
    SOURCES.forEach(s => { const td = document.createElement("td"); td.appendChild(btn(m.src === s ? "✓ " + s.toUpperCase() : s.toUpperCase(), "", () => { m.src = m.src === s ? null : s; }, m.src === s)); tr.appendChild(td); });
    const tv = document.createElement("td"); const v = document.createElement("div"); v.className = "vol";
    v.append(btn("−", "", () => { m.vol = Math.max(0, m.vol - 5); }), Object.assign(document.createElement("span"), { className: "lvl", textContent: !m.src ? "ARRÊT" : m.mute ? "MUET" : m.vol + " %" }), btn("+", "", () => { m.vol = Math.min(100, m.vol + 5); }), btn("🔇", "mute", () => { m.mute = !m.mute; }, m.mute));
    tv.appendChild(v); tr.appendChild(tv); tb.appendChild(tr);
  });
  pg.appendChild(tbl);
}

/* ---------------- sécurité ---------------- */
function renderSecurity(pg) {
  const s = S.security;
  const st = document.createElement("div"); st.className = "card sec-status" + (s.alarm ? " alarm" : s.mode !== "disarmed" ? " armed" : "");
  st.innerHTML = `<div class="label">ÉTAT</div><div class="value">${s.alarm ? "ALARME" : s.mode === "away" ? "ARMÉ — ABSENCE" : s.mode === "night" ? "ARMÉ — NUIT" : "DÉSARMÉ"}</div>`;
  pg.appendChild(st);
  const bt = document.createElement("div"); bt.className = "sec-btns";
  bt.append(btn("ARMER ABSENCE", "", () => arm("away"), s.mode === "away"), btn("ARMER NUIT", "", () => arm("night"), s.mode === "night"), btn("DÉSARMER", "green", () => arm("disarmed"), s.mode === "disarmed"));
  pg.appendChild(bt);
  const z = document.createElement("div"); z.className = "zones";
  z.innerHTML = `<div class="card-title">ZONES</div>`;
  s.zones.forEach(zn => { const d = document.createElement("div"); d.className = "zone" + (zn.open ? " open" : ""); d.innerHTML = `<span>${zn.name}</span><span class="zs">${zn.open ? "OUVERT" : "FERMÉ"}<span class="dot"></span></span>`; z.appendChild(d); });
  pg.appendChild(z);
}
function arm(mode) {
  S.security.mode = mode;
  if (mode === "disarmed") { S.security.alarm = false; S.security.zones.forEach(z => (z.open = false)); }
}

/* ---------------- interphone ---------------- */
function cameraHTML() {
  const ic = S.intercom, v = ic.state !== "idle" || ic.visitor;
  return `${v ? '<div class="camera-visitor">' + $("#visitor svg").outerHTML + '</div>' : ""}<div class="cam-photo" style="background-image:url(assets/original/camera-gate.webp)"></div>${ic.state === "ringing" ? '<div class="cam-ring">🔔 APPEL ENTRANT</div>' : ""}`;
}
function renderIntercom(pg) {
  const ic = S.intercom;
  const vid = document.createElement("div"); vid.className = "ic-video"; vid.innerHTML = cameraHTML() + `<div class="osd"><span class="rec"></span>PORTAIL · ${new Date().toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>`; pg.appendChild(vid);
  const side = document.createElement("div"); side.className = "ic-side";
  const st = document.createElement("div"); st.className = "ic-status" + (ic.state === "ringing" ? " ring" : ic.state === "call" ? " call" : "");
  st.textContent = ic.msg || (ic.state === "ringing" ? "APPEL ENTRANT - PORTE D’ENTRÉE" : ic.state === "call" ? (ic.muted ? "MICRO COUPÉ" : "EN LIGNE - PORTE D’ENTRÉE") : "AUCUN APPEL"); side.appendChild(st);
  const r1 = document.createElement("div"); r1.className = "row";
  r1.append(btn("📞 RÉPONDRE", "green", () => { if (ic.state === "ringing") ic.state = "call"; else { ic.state = "call"; ic.visitor = true; } }, ic.state === "call"), btn("RACCROCHER", "red", () => hangup())); side.appendChild(r1);
  side.append(btn("🎤 COUPER LE MICRO", "", () => { ic.muted = !ic.muted; }, ic.muted), btn("OUVRIR LA PORTE", "", () => flashMsg("PORTE OUVERTE")), btn("OUVRIR LE PORTAIL", "", () => { S.house.gate = true; flashMsg("PORTAIL OUVERT"); if (ic.state !== "idle") setTimeout(() => { hangup(); render(); }, 2500); setTimeout(() => { S.house.gate = false; render(); }, 9000); }));
  pg.appendChild(side);
}
function flashMsg(m) { S.intercom.msg = m; setTimeout(() => { S.intercom.msg = null; render(); }, 3000); }
function hangup() { const ic = S.intercom; ic.state = "idle"; ic.muted = false; ic.visitor = false; clearTimeout(ringTimer); }
let ringTimer;
function visitorRings() {
  const ic = S.intercom; if (ic.state !== "idle") return;
  ic.state = "ringing"; ic.visitor = true; render();
  clearTimeout(ringTimer); ringTimer = setTimeout(() => { if (S.intercom.state === "ringing") { hangup(); render(); } }, 30000);
}

/* ---------------- scénarios ---------------- */
function setLight(id, strip, spots, lvl, rgbw = "off") { const l = S.lights[id]; l.strip = strip; l.spots = spots; l.rgbw = rgbw; if (lvl != null) l.lv.strip = l.lv.spots = lvl; }
function allOff() { ROOMS.forEach(r => setLight(r.id, "off", "off", null)); }
const sceneHelp = {
 arrival: "Bienvenue : lumières d’accueil, stores ouverts et accès temporaires.",
 departure: "Départ : lumières et médias arrêtés, stores fermés, alarme armée.",
 evening: "Réception : lumière chaude à 40 %, musique et piscine bleue.",
 cinema: "Cinéma : stores fermés, éclairage tamisé et Apple TV allumée.",
 night: "Nuit : balisage doux, stores fermés et protection nocturne.",
 alloff: "Tous les éclairages sont éteints."
};
function announce(text) { const el = $("#feedback"); el.textContent = text; clearTimeout(announce.timer); el.classList.add("visible"); announce.timer = setTimeout(() => el.classList.remove("visible"), 5500); }
function runScene(k) {
  stopAllShadeMotion();
  document.querySelectorAll(".win-shade,.rv-shade,.shade-vis .blind").forEach(el => el.style.transition = "");
  announce(sceneHelp[k] || "Ambiance appliquée");
  if (k === "cinema") { allOff(); setLight("Cinema", "3000", "off", 12); SHADE_ROOMS.forEach(id => (S.shades[id].pos = 100)); S.tv.apple.power = true; S.tv.apple.app = "Apple TV"; ROOMS.forEach(r => (S.music[r.id].src = null)); }

  S.scene = k;
  if (k === "arrival") { allOff(); ["Entry", "Living", "Kitchen", "Dining"].forEach(id => setLight(id, "3000", "3000", 85)); setLight("Pool", "off", "off", null, "white");
    SHADE_ROOMS.forEach(id => (S.shades[id].pos = 0)); S.house.gate = true; S.house.garage = true; arm("disarmed"); setTimeout(() => { S.house.gate = false; S.house.garage = false; render(); }, 12000); }
  if (k === "departure") { allOff(); SHADE_ROOMS.forEach(id => (S.shades[id].pos = 100)); S.house.gate = false; S.house.garage = false; ROOMS.forEach(r => (S.music[r.id].src = null)); S.tv.swisscom.power = S.tv.apple.power = false; arm("away"); }
  if (k === "evening") { allOff(); ["Living", "Dining", "Kitchen", "Master"].forEach(id => setLight(id, "3000", "3000", 40)); setLight("Pool", "off", "off", null, "blue"); S.lights.Pool.lv.rgbw = 60;
    ["Master", "Bedroom"].forEach(id => (S.shades[id].pos = 100)); S.music.Living.src = "Spotify"; S.music.Living.vol = 30; S.music.Living.mute = false; S.music.Dining.src = "Spotify"; S.music.Dining.vol = 25; S.music.Dining.mute = false; }
  if (k === "night") { allOff(); setLight("Entry", "3000", "off", 12); setLight("Master", "3000", "off", 8); SHADE_ROOMS.forEach(id => (S.shades[id].pos = 100)); ROOMS.forEach(r => (S.music[r.id].src = null)); S.tv.swisscom.power = S.tv.apple.power = false; arm("night"); }
  if (k === "alloff") { allOff(); }
}

/* ---------------- événements extérieurs ---------------- */
function intrusion() {
  const z = S.security.zones.find(z => z.name === "BAIES TERRASSE"); z.open = true;
  if (S.security.mode !== "disarmed") { S.security.alarm = true; ROOMS.filter(r => !r.pool).forEach(r => setLight(r.id, "6000", "6000", 100)); }
  else setTimeout(() => { z.open = false; render(); }, 6000);
  render();
}
function resetAll() { Object.values(shadeTimers).forEach(clearInterval); clearTimeout(announce.timer); $("#feedback").classList.remove("visible"); $("#feedback").textContent = ""; defaults(); S.house = { gate: false, garage: false, pool: false }; S.security = { mode: "disarmed", alarm: false, zones: ZONES.map(n => ({ name: n, open: false })) }; hangup(); S.tv.dev = null; S.tv.swisscom.power = S.tv.apple.power = false; S.scene = null; S.page = "home"; render(); }

/* ---------------- horloge & simulation thermique ---------------- */
function tickClock() {
  const d = new Date(), hm = d.toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" });
  $("#hdrClock").textContent = hm;
  const t = $("#homeTime"); if (t) { t.textContent = hm; $("#homeDate").textContent = d.toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" }); }
}
if (!backgroundOnly) setInterval(tickClock, 1000);
if (!backgroundOnly) setInterval(() => {
  let changed = false;
  ROOMS.forEach(r => { const c = S.climate[r.id]; const target = c.heat ? c.heatSP : c.ac ? c.acSP : 20; const step = c.ac ? 0.1 * c.acSpeed : 0.1;
    if (Math.abs(c.temp - target) > 0.05) { c.temp = Math.round((c.temp + Math.sign(target - c.temp) * Math.min(step, Math.abs(target - c.temp))) * 10) / 10; changed = true; } });
  if (changed) { renderHouse(); if (S.page === "home" || S.page.startsWith("clim")) { const g = $(".gauge .cur .value"); if (g) g.textContent = fmt(S.climate[S.page.slice(5)].temp); else if (S.page === "home") { const value = document.querySelectorAll(".status-tile .value")[1]; if (value) value.innerHTML = fmt(S.climate.Living.temp) + hvacIco(S.climate.Living); } } }
}, 3000);

/* ---------------- mise à l'échelle de la dalle ---------------- */
function scale() { const sc = $(".tsw-screen"); $("#tsw").style.transform = `scale(${sc.clientWidth / 1280}, ${sc.clientHeight / 800})`; }
window.addEventListener("resize", scale);
// Parent measures the actual visible chassis and tools; fit every room between them.
window.addEventListener("message", event => {
  if (!backgroundOnly || event.source !== parent || event.origin !== location.origin || event.data?.type !== "villa-stark-layout") return;
  const r = event.data.rect;
  if (!r || ![r.x, r.y, r.width, r.height].every(Number.isFinite) || r.width <= 0 || r.height <= 0) return;
  const house = $(".house-wrap"), fit = Math.min(r.width / 1780, r.height / 600);
  // New room bays occupy x=304..1585, y=316..645; include the gables and pool in the crop.
  house.style.cssText = `position:absolute;left:${r.x + r.width / 2 - 836 * fit}px;top:${r.y + r.height / 2 - 480 * fit}px;width:${SCENE.W * fit}px;height:${SCENE.H * fit}px;transform:none;`;
  const view = $("#roomView");
  const vw = Math.min(r.width, r.height * 16 / 9), vh = vw * 9 / 16;
  // roomView is inside the transformed photo canvas, so convert the clear area back to local pixels.
  view.style.cssText = `position:absolute;left:${(r.x + (r.width - vw) / 2) - (r.x + r.width / 2 - 836 * fit)}px;top:${(r.y + (r.height - vh) / 2) - (r.y + r.height / 2 - 480 * fit)}px;width:${vw}px;height:${vh}px;right:auto;bottom:auto;`;
});

/* ---------------- shared state between GUI and animated backdrop ---------------- */
let applyingSnapshot = false;
function applySnapshot(snapshot) {
  if (!snapshot?.state?.lights?.Living || !snapshot.state.shades?.Living) return;
  applyingSnapshot = true;
  Object.assign(S, snapshot.state);
  if (snapshot.room && roomById[snapshot.room] && snapshot.room !== roomView) enterRoom(snapshot.room);
  else if (!snapshot.room && roomView) leaveRoom();
  if (backgroundOnly) {
    document.querySelectorAll(".win").forEach(win => { win.querySelector(".win-shade").style.transition = S.shades[win.dataset.room]?.target != null ? "none" : ""; });
    renderHouse();
  } else render();
  applyingSnapshot = false;
}
if (syncBus) {
  syncBus.onmessage = ({ data }) => {
    if (backgroundOnly) { if (data?.type === "state") applySnapshot(data.snapshot); return; }
    if (data?.type === "request-state") { publishState(); return; }
    if (data?.type !== "command") return;
    if (data.action === "visitor") visitorRings();
    else if (data.action === "intrusion") intrusion();
    else if (data.action === "reset") { if (roomView) leaveRoom(); resetAll(); }
    else if (data.action === "exterior") leaveRoom();
    else if (data.action === "room" && roomById[data.value]) enterRoom(data.value);
    else if (data.action === "shade" && roomView && S.shades[roomView]) { S.shades[roomView].pos = S.shades[roomView].pos ? 0 : 100; render(); }
    else if (data.action === "theme" && THEMES.some(([key]) => key === data.value)) { S.theme = data.value; try { localStorage.setItem("villa-stark-theme-v2", data.value); } catch {} render(); }
  };
}
window.addEventListener("pagehide", () => { syncBus?.close(); Object.values(shadeTimers).forEach(clearInterval); });

/* ---------------- démarrage ---------------- */
buildHouse();
$("#zoomControls").onclick = () => { const on = document.body.classList.toggle("panel-focus"); $("#zoomControls").textContent = on ? "Voir la villa et les commandes" : "Agrandir les commandes"; $("#zoomControls").setAttribute("aria-pressed", String(on)); requestAnimationFrame(scale); };
document.querySelectorAll(".win,.thumb").forEach((el, i) => { el.tabIndex = 0; el.setAttribute("role", "button"); el.setAttribute("aria-label", "Entrer dans " + ROOMS[i % ROOMS.length].name); el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } }; });

$("#evVisitor").onclick = visitorRings;
$("#evIntrusion").onclick = intrusion;
$("#evReset").onclick = () => { if (roomView) leaveRoom(); resetAll(); };
$("#rvBack").onclick = leaveRoom;
$("#roomView").addEventListener("click", e => { if (backgroundOnly && e.target.closest(".rv-shade")) { syncBus?.postMessage({ type: "command", action: "shade" }); return; } if (e.target.closest(".rv-shade") && roomById[roomView].shade) { S.shades[roomView].pos = S.shades[roomView].pos ? 0 : 100; render(); } });
// état de départ : une ambiance de soirée pour que la villa ne soit pas éteinte
setLight("Living", "3000", "3000", 70); setLight("Kitchen", "3000", "off", 60); setLight("Entry", "3000", "off", 50); S.climate.Living.heat = true; S.climate.Living.temp = 21.5;
if (stateKey) { try { const saved = JSON.parse(sessionStorage.getItem(stateKey)); if (saved) applySnapshot(saved); } catch {} }
if (!backgroundOnly) SHADE_ROOMS.forEach(id => { const shade = S.shades[id]; if (shade.target != null && shade.target !== shade.pos) moveShade(id, shade.target > shade.pos ? "down" : "up"); });
render(); scale();
if (backgroundOnly) syncBus?.postMessage({ type: "request-state" });
})();
