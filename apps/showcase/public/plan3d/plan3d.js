/* ===========================================================================
 * Plan3D — fond de page 3D du SITE VITRINE (crestrongui.vercel.app), à la place de la vidéo.
 * Vue d'ensemble de la villa en écorché puis zoom sur la pièce affichée par le GUI, qui tourne
 * dans son iframe et n'est PAS modifié : ce module lit ses feedbacks à travers la fenêtre de
 * l'iframe (même origine) — CrComLib, clics sur les <ch5-button data-join>, animateGroupBlinds.
 * Les actions du GUI se voient dans la pièce :
 *   - scènes / niveaux de circuits (a71-80)    -> intensité des lampes ;
 *   - source vidéo (d150-154)                  -> TV allumée / éteinte, écran par source ;
 *   - Apple TV (d151) + télécommande 211-216   -> grille d'apps sur la TV, curseur piloté ;
 *   - musique sur les haut-parleurs (d155)     -> enceintes animées ;
 *   - consigne (a31)                           -> thermostat de la climatisation.
 * Usage (site) : const api = createPlan3D({ canvas, config, names }) ; api.attach(iframe.contentWindow) ;
 * api.setWindow(rect) cadre la pièce dans la zone libre de la page ; api.dispose() à la fin.
 * =========================================================================== */
import * as THREE from './vendor/three.module.min.js';
import { createInteriors } from './interiors.js?v=2026-09-16-atlas-2';
import { buildLandscape } from './landscape.js?v=2026-09-16-atlas-2';
import { createEnvelope } from './envelope.js?v=2026-09-16-atlas-2';

export function createPlan3D(opts) {
    'use strict';
    opts = opts || {};
    var cfg = opts.config || {};
    var canvas = opts.canvas;
    if (!canvas) throw new Error('Plan3D : toile manquante');
    var vc = { pieces: [] };                // configuration du GUI (moteurs), lue a attach()
    var cleanups = [], timers = new Set(), boundDocument = null, attaching = null;
    function later(fn, ms) { var id = setTimeout(function () { timers.delete(id); if (running) fn(); }, ms); timers.add(id); return id; }

    var NIVEAU_H = 3.0;            // hauteur d'un niveau (m)
    var NIVEAU_GAP = 4.2;          // vide entre les dalles (écorché : chaque niveau reste lisible)
    var PIECES = cfg.pieces || defaultLayout();
    var ROOMS = {};                // id -> objets de la pièce

    /* ---------- Rendu ---------- */
    var renderer, scene, camera, clock = new THREE.Clock();
    try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { console.warn('[Plan3D] WebGL indisponible', e); throw e; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Deux scènes rendues l'une après l'autre avec le même tampon de profondeur :
    //  - `scene`  : extérieurs (sol, pins, montagnes, terrasse, piscine) sous une lumière du jour constante ;
    //  - `sceneR` : les pièces, dont la lumière du jour suit l'ouverture des motorisations de la pièce
    //    active (volet fermé = noir, seules les lampes des scènes éclairent) sans assombrir le paysage.
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1020, 90, 260);
    var sceneR = new THREE.Scene(); sceneR.fog = scene.fog;
    camera = new THREE.PerspectiveCamera(38, 1, 0.3, 500);
    renderer.autoClear = false;

    var hemiE = new THREE.HemisphereLight(0xe6eeff, 0x3a3326, 1.1); scene.add(hemiE);
    var sunE = new THREE.DirectionalLight(0xfff1dc, 1.8); sunE.position.set(18, 30, 10); scene.add(sunE);
    var fillE = new THREE.DirectionalLight(0x9fb8ff, 0.5); fillE.position.set(-20, 12, -14); scene.add(fillE);
    var DAY = { hemi: 0.9, sun: 1.45, fill: 0.45 };                     // lumière du jour pleine, dans les pièces
    var hemi = new THREE.HemisphereLight(0xe6eeff, 0x3a3326, DAY.hemi); sceneR.add(hemi);
    var sun = new THREE.DirectionalLight(0xfff1dc, DAY.sun); sun.position.set(18, 30, 10); sceneR.add(sun);
    sceneR.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.035;
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 50 });
    var fill = new THREE.DirectionalLight(0x9fb8ff, DAY.fill); fill.position.set(-20, 12, -14); sceneR.add(fill);
    // Lumière du jour qui entre par la fenêtre de la pièce active (intensité = ouverture des motorisations)
    var winLight = new THREE.SpotLight(0xfff6e8, 0, 14, 0.75, 0.6, 1.2); sceneR.add(winLight); sceneR.add(winLight.target);
    // Deux lampes réelles : celles de la pièce zoomée (les autres pièces n'ont que des matériaux émissifs)
    var roomLights = [new THREE.PointLight(0xffd9a3, 0, 16, 2), new THREE.PointLight(0xffe6c4, 0, 12, 2)];
    roomLights.forEach(function (l) { sceneR.add(l); });
    var dayCur = 1;                                                   // facteur jour courant (lissé) de la scène des pièces

    /* ---------- Matériaux partagés (deux palettes : 'chaleureux' bois / tissus, 'maquette' blanc et gris) ---------- */
    var STYLE = cfg.style === 'maquette' ? 'maquette' : 'chaleureux';
    var PAL = STYLE === 'maquette'
        ? { sol: 0xe6e3de, solChambre: 0xdedad4, mur: 0xfafafa, bois: 0xcfc6ba, boisClair: 0xe3dcd2, tissu: 0xf0eeea, tissuFonce: 0x9aa3ad, lit: 0xf7f6f3, coussin: 0xc9d1d9, tapis: 0xd9d4cc, dalle: 0xeeece8 }
        : { sol: 0xc9b190, solChambre: 0xb9a48a, mur: 0xf1ede6, bois: 0x8a6b4a, boisClair: 0xc8a978, tissu: 0xd8d3cb, tissuFonce: 0x4b5563, lit: 0xe8e4dc, coussin: 0x9aa9b8, tapis: 0xb08d6e, dalle: 0xd7d2ca };
    var M = {
        sol: new THREE.MeshStandardMaterial({ color: PAL.sol, roughness: 0.85 }),
        solChambre: new THREE.MeshStandardMaterial({ color: PAL.solChambre, roughness: 0.9 }),
        solExt: new THREE.MeshStandardMaterial({ color: 0x8f9a86, roughness: 1 }),
        gazon: new THREE.MeshStandardMaterial({ color: 0x5d8a48, roughness: 1 }),
        mur: new THREE.MeshStandardMaterial({ color: PAL.mur, roughness: 0.95 }),
        murSombre: new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.95 }),
        bois: new THREE.MeshStandardMaterial({ color: PAL.bois, roughness: 0.8 }),
        boisClair: new THREE.MeshStandardMaterial({ color: PAL.boisClair, roughness: 0.8 }),
        tissu: new THREE.MeshStandardMaterial({ color: PAL.tissu, roughness: 1 }),
        tissuFonce: new THREE.MeshStandardMaterial({ color: PAL.tissuFonce, roughness: 1 }),
        lit: new THREE.MeshStandardMaterial({ color: PAL.lit, roughness: 1 }),
        coussin: new THREE.MeshStandardMaterial({ color: PAL.coussin, roughness: 1 }),
        noir: new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.5, metalness: 0.3 }),
        blanc: new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 0.6 }),
        metal: new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.35, metalness: 0.8 }),
        eau: new THREE.MeshStandardMaterial({ color: 0x3fa7d6, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x0a4e70, emissiveIntensity: 0.6 }),
        plante: new THREE.MeshStandardMaterial({ color: 0x3f7d3a, roughness: 1 }),
        pot: new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 1 }),
        dalle: new THREE.MeshStandardMaterial({ color: PAL.dalle, roughness: 1 }),
        tapis: new THREE.MeshStandardMaterial({ color: PAL.tapis, roughness: 1 }),
        verre: new THREE.MeshStandardMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
        verreExt: new THREE.MeshStandardMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.35, roughness: 0.1, depthWrite: false }),
        alu: new THREE.MeshStandardMaterial({ color: 0x4a4f58, roughness: 0.4, metalness: 0.7 }),
        moteur: new THREE.MeshStandardMaterial({ color: 0x2f3440, roughness: 0.45, metalness: 0.65 }),
        ecranOff: new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.12, metalness: 0.8 })
    };
    var interiors = createInteriors(renderer, M);
    // Textures dessinées des motorisations : lames du volet, toile du store, plis des rideaux
    function mkTex(w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
    var TEX = {
        lames: mkTex(64, 64, function (g, w) { for (var i = 0; i < 4; i++) { var y = i * 16, gr = g.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, '#a3a8b0'); gr.addColorStop(0.5, '#d2d5da'); gr.addColorStop(0.85, '#8d929b'); gr.addColorStop(1, '#5c6069'); g.fillStyle = gr; g.fillRect(0, y, w, 16); } }),
        toile: mkTex(64, 64, function (g, w, h) { g.fillStyle = '#e9e0cd'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,100,70,0.14)'; for (var i = 0; i < h; i += 4) g.fillRect(0, i, w, 1); g.fillStyle = 'rgba(255,255,255,0.16)'; for (var j = 0; j < w; j += 8) g.fillRect(j, 0, 1, h); }),
        plis: mkTex(128, 64, function (g, w, h) { for (var i = 0; i < 8; i++) { var x = i * 16, gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8797ae'); gr.addColorStop(0.45, '#d9e2ee'); gr.addColorStop(1, '#75839a'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); } }),
        banne: mkTex(64, 64, function (g, w, h) { for (var i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f3efe6' : '#b9553f'; g.fillRect(i * 16, 0, 16, h); } })
    };
    var ledOn = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.3 });
    function led(x, y, z, parent) { var m = sph(0.016, ledOn.clone(), x, y, z, parent); m.geometry = new THREE.SphereGeometry(0.016, 8, 6); return m; }

    function box(w, h, d, mat, x, y, z, parent) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true;
        m.position.set(x, y, z); (parent || scene).add(m); return m;
    }
    function cyl(r, h, mat, x, y, z, parent, rt) {
        var m = new THREE.Mesh(new THREE.CylinderGeometry(rt === undefined ? r : rt, r, h, 20), mat);
        m.position.set(x, y, z); (parent || scene).add(m); return m;
    }
    function sph(r, mat, x, y, z, parent) {
        var m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
        m.position.set(x, y, z); (parent || scene).add(m); return m;
    }

    function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

    /* ---------- Écran de télévision : texture canvas 1024×576 par source ---------- */
    var APPS = ['Apple TV+', 'Netflix', 'Musique', 'Photos', 'YouTube', 'Disney+', 'Arte', 'Plans', 'Podcasts', 'Réglages'];
    var APP_COLORS = ['#1c1c1e', '#b0060f', '#fa2d48', '#f5a623', '#e02020', '#0b2a6b', '#e85d04', '#34c759', '#b150e2', '#8e8e93'];
    var APP_GLYPH = ['tv', 'N', '♪', '❀', '▶', 'D+', 'arte', '⌖', '((●))', '⚙'];
    var SKY_MENU = ['Accueil', 'Guide TV', 'Enregistrements', 'Catch Up', 'Sky Cinema', 'Sky Sports', 'Apps'];
    var SKY_TILES = ['Sky Sports F1', 'Sky Cinema', 'Sky Atlantic', 'Sky Nature', 'Sky Arts', 'Sky News'];
    var SWISS_CH = ['SRF 1', 'RTS 1', 'TF1', 'France 2', 'arte', 'RSI LA1', 'M6', 'Eurosport'];
    var IPTV_CH = [['101', 'RTS 1', 'Le 19h30'], ['102', 'RTS 2', 'Sport dimanche'], ['103', 'SRF 1', 'Tagesschau'], ['104', 'TF1', 'Journal'], ['105', 'arte', 'Karambolage'], ['106', 'Canal Alpha', 'Météo des neiges']];
    var HUES = [212, 348, 28, 140, 268, 190, 12, 52];
    function makeScreen() {
        var c = document.createElement('canvas'); c.width = 1024; c.height = 576;
        var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        var st = { source: 0, sel: 0, open: null, tick: 0, row: 0 };
        // Affiche stylisée (dégradé + formes) servant de visuel de programme
        function poster(g, x, y, w, h, hue, title, sub) {
            var gr = g.createLinearGradient(x, y, x + w, y + h);
            gr.addColorStop(0, 'hsl(' + hue + ',60%,42%)'); gr.addColorStop(1, 'hsl(' + ((hue + 40) % 360) + ',70%,18%)');
            g.save(); roundRect(g, x, y, w, h, 12); g.clip(); g.fillStyle = gr; g.fillRect(x, y, w, h);
            g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(x + w * 0.78, y + h * 0.3, h * 0.42, 0, Math.PI * 2); g.fill();
            g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.moveTo(x, y + h * 0.62); g.lineTo(x + w, y + h * 0.42); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.fill();
            if (title) { g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(h * 0.16) + 'px Arial'; g.textAlign = 'left'; g.fillText(title, x + 14, y + h - (sub ? 30 : 14)); }
            if (sub) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = Math.round(h * 0.11) + 'px Arial'; g.fillText(sub, x + 14, y + h - 12); }
            g.restore();
        }
        function topBar(g, W, brand, right) {
            g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'left'; g.fillText(brand, 40, 54);
            g.font = '20px Arial'; g.fillStyle = 'rgba(255,255,255,0.75)'; g.textAlign = 'right'; g.fillText(right, W - 40, 52);
        }
        function draw() {
            var g = c.getContext('2d'), W = c.width, H = c.height, i, gr;
            g.clearRect(0, 0, W, H);
            if (st.source === 0) {                       // éteinte : verre noir, léger reflet de la pièce
                g.fillStyle = '#05060a'; g.fillRect(0, 0, W, H);
                gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(255,255,255,0.06)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.03)');
                g.fillStyle = gr; g.fillRect(0, 0, W, H); tex.needsUpdate = true; return;
            }
            if (st.source === 1) {                       // Apple TV : bandeau à la une, rangée d'apps, « Regarder ensuite »
                gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b2f3a'); gr.addColorStop(1, '#0b0d12');
                g.fillStyle = gr; g.fillRect(0, 0, W, H);
                if (st.open !== null) {                  // app ouverte : lecteur plein écran
                    poster(g, 0, 0, W, H, HUES[st.open % HUES.length], null, null);
                    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
                    g.fillStyle = APP_COLORS[st.open]; roundRect(g, 48, 40, 96, 96, 22); g.fill();
                    g.fillStyle = '#fff'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText(APP_GLYPH[st.open], 96, 100);
                    g.textAlign = 'left'; g.font = 'bold 52px Arial'; g.fillText(APPS[st.open], 170, 92);
                    g.font = '24px Arial'; g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillText('Lecture en cours — Villa Crans-Montana', 170, 128);
                    var pr = ((st.tick * 3) % 1000) / 1000;
                    g.fillStyle = 'rgba(255,255,255,0.3)'; roundRect(g, 80, H - 70, W - 160, 8, 4); g.fill();
                    g.fillStyle = '#fff'; roundRect(g, 80, H - 70, (W - 160) * pr, 8, 4); g.fill();
                    g.beginPath(); g.arc(80 + (W - 160) * pr, H - 66, 9, 0, Math.PI * 2); g.fill();
                    g.font = '20px Arial'; g.textAlign = 'left'; g.fillText(Math.floor(pr * 96) + ' min', 80, H - 88); g.textAlign = 'right'; g.fillText('1 h 36', W - 80, H - 88);
                    g.textAlign = 'center'; g.font = '40px Arial'; g.fillText('❚❚', W / 2, H - 100); g.font = '26px Arial'; g.fillText('◀◀        ▶▶', W / 2, H - 104);
                } else {
                    poster(g, 40, 30, W - 80, 250, 205, null, null);
                    g.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(g, 40, 30, W - 80, 250, 12); g.fill();
                    g.fillStyle = '#fff'; g.font = 'bold 44px Arial'; g.textAlign = 'left'; g.fillText('Villa Crans-Montana', 72, 110);
                    g.font = '22px Arial'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText('À la une — Apple TV+ · Nouvel épisode disponible', 72, 148);
                    g.fillStyle = '#fff'; roundRect(g, 72, 190, 190, 48, 10); g.fill(); g.fillStyle = '#111'; g.font = 'bold 22px Arial'; g.fillText('▶  Regarder', 96, 222);
                    var cols = 5, tw = 168, th = 96, gap = 18, x0 = (W - (cols * tw + (cols - 1) * gap)) / 2, y0 = 316;
                    for (i = 0; i < APPS.length; i++) {
                        var cx = x0 + (i % cols) * (tw + gap), cy = y0 + Math.floor(i / cols) * (th + gap);
                        var s = (i === st.sel) ? 1.1 : 1, w = tw * s, h = th * s, ox = cx - (w - tw) / 2, oy = cy - (h - th) / 2;
                        g.fillStyle = APP_COLORS[i]; roundRect(g, ox, oy, w, h, 16); g.fill();
                        gr = g.createLinearGradient(ox, oy, ox, oy + h); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0.15)'); g.fillStyle = gr; roundRect(g, ox, oy, w, h, 16); g.fill();
                        if (i === st.sel) { g.lineWidth = 5; g.strokeStyle = '#fff'; roundRect(g, ox - 4, oy - 4, w + 8, h + 8, 20); g.stroke(); }
                        g.fillStyle = 'rgba(255,255,255,0.92)'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText(APP_GLYPH[i], cx + tw / 2, cy + th / 2 + 4);
                        g.font = (i === st.sel ? 'bold 18px' : '17px') + ' Arial'; g.fillStyle = '#fff'; g.fillText(APPS[i], cx + tw / 2, cy + th - 10);
                    }
                }
            } else if (st.source === 2) {                // Sky Q : rail de menu à gauche, tuiles de programmes, direct en haut à droite
                gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#071a3d'); gr.addColorStop(1, '#0b1226');
                g.fillStyle = gr; g.fillRect(0, 0, W, H);
                topBar(g, W, 'sky', '20:30  ·  Chaîne 101 Sky Sports');
                poster(g, W - 330, 20, 290, 160, 210, 'EN DIRECT', 'Sky Sports F1 · Grand Prix');
                for (i = 0; i < SKY_MENU.length; i++) {
                    var on = i === (st.row || 0) % SKY_MENU.length;
                    g.fillStyle = on ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.05)'; roundRect(g, 40, 100 + i * 60, 270, 50, 8); g.fill();
                    g.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.7)'; g.font = (on ? 'bold ' : '') + '24px Arial'; g.textAlign = 'left'; g.fillText(SKY_MENU[i], 62, 133 + i * 60);
                }
                for (i = 0; i < 6; i++) poster(g, 350 + (i % 3) * 224, 210 + Math.floor(i / 3) * 168, 206, 150, HUES[(i + 2) % HUES.length], SKY_TILES[i], null);
            } else if (st.source === 3) {                // Swisscom blue TV : barre de menus, grille de chaînes
                gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0c1f4b'); gr.addColorStop(1, '#101a33');
                g.fillStyle = gr; g.fillRect(0, 0, W, H);
                topBar(g, W, 'blue TV', 'Swisscom  ·  20:30');
                var menus = ['TV', 'Replay', 'Vidéothèque', 'Sport', 'Enregistrements'];
                for (i = 0; i < menus.length; i++) { g.fillStyle = i === 0 ? '#2f7cf6' : 'rgba(255,255,255,0.1)'; roundRect(g, 40 + i * 172, 78, 160, 40, 20); g.fill(); g.fillStyle = '#fff'; g.font = '20px Arial'; g.textAlign = 'center'; g.fillText(menus[i], 120 + i * 172, 105); }
                for (i = 0; i < 8; i++) {
                    var sel = i === (st.row || 0) % 8, tx = 40 + (i % 4) * 240, ty = 140 + Math.floor(i / 4) * 200;
                    poster(g, tx, ty, 222, 150, HUES[i], null, null);
                    g.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(g, tx, ty, 222, 150, 12); g.fill();
                    g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText(SWISS_CH[i], tx + 111, ty + 84);
                    if (sel) { g.lineWidth = 5; g.strokeStyle = '#5aa0ff'; roundRect(g, tx - 4, ty - 4, 230, 158, 14); g.stroke(); }
                    g.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.7)'; g.font = '18px Arial'; g.textAlign = 'left'; g.fillText('Maintenant · ' + (i % 2 ? 'Journal' : 'Film du soir'), tx + 4, ty + 178);
                }
            } else if (st.source === 4) {                // IPTV : liste des chaînes avec programme en cours et aperçu
                g.fillStyle = '#0f1216'; g.fillRect(0, 0, W, H);
                topBar(g, W, 'IPTV  ·  Chaînes', 'Villa Crans-Montana');
                for (i = 0; i < IPTV_CH.length; i++) {
                    var hl = i === (st.row || 0) % IPTV_CH.length, ry = 86 + i * 78;
                    g.fillStyle = hl ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.05)'; roundRect(g, 40, ry, 600, 66, 10); g.fill();
                    if (hl) { g.fillStyle = '#10b981'; g.fillRect(40, ry, 6, 66); }
                    g.fillStyle = hl ? '#fff' : 'rgba(255,255,255,0.85)'; g.font = 'bold 24px Arial'; g.textAlign = 'left'; g.fillText(IPTV_CH[i][0] + '   ' + IPTV_CH[i][1], 64, ry + 30);
                    g.font = '18px Arial'; g.fillStyle = 'rgba(255,255,255,0.65)'; g.fillText(IPTV_CH[i][2], 64, ry + 54);
                    g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(400, ry + 44, 220, 5); g.fillStyle = '#10b981'; g.fillRect(400, ry + 44, 220 * ((i * 37 + 20) % 100) / 100, 5);
                }
                var cur = IPTV_CH[(st.row || 0) % IPTV_CH.length];
                poster(g, 670, 86, 314, 200, HUES[((st.row || 0) + 1) % HUES.length], cur[1], cur[2]);
                g.fillStyle = 'rgba(255,255,255,0.7)'; g.font = '18px Arial'; g.textAlign = 'left'; g.fillText('Programme en cours · 20:30 – 21:45', 670, 316);
                g.fillText('Ensuite · Météo des neiges · 21:45', 670, 344);
            }
            gr = g.createLinearGradient(0, 0, W * 0.6, H * 0.5); gr.addColorStop(0, 'rgba(255,255,255,0.09)'); gr.addColorStop(1, 'rgba(255,255,255,0)');   // reflet de la vitre
            g.fillStyle = gr; g.fillRect(0, 0, W, H);
            tex.needsUpdate = true;
        }
        draw();
        return { tex: tex, st: st, draw: draw };
    }
    /* ---------- Thermostat : texture canvas ---------- */
    function makeThermo() {
        var c = document.createElement('canvas'); c.width = 512; c.height = 512;
        var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        var st = { setpoint: 21.0, chauffe: true };
        function draw() {
            var g = c.getContext('2d');
            g.setTransform(4, 0, 0, 4, 0, 0);
            g.fillStyle = '#11151c'; g.fillRect(0, 0, 128, 128);
            g.strokeStyle = st.chauffe ? '#f59e0b' : '#38bdf8'; g.lineWidth = 8;
            g.beginPath(); g.arc(64, 64, 50, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * Math.min(1, Math.max(0, (st.setpoint - 15) / 15))); g.stroke();
            g.strokeStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(64, 64, 50, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
            g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText(st.setpoint.toFixed(1) + '°', 64, 74);
            g.font = '13px Arial'; g.fillStyle = '#9ca3af'; g.fillText(st.chauffe ? 'CHAUFFAGE' : 'CLIM', 64, 104);
            tex.needsUpdate = true;
        }
        draw();
        return { tex: tex, st: st, draw: draw };
    }

    /* ---------- Construction d'une pièce ---------- */
    function buildRoom(p) {
        var g = new THREE.Group();
        var y0 = p.niveau * (NIVEAU_H + NIVEAU_GAP);
        g.position.set(p.x, y0, p.z);
        var w = p.w, d = p.d, ext = p.type === 'terrasse' || p.type === 'piscine';
        (ext ? scene : sceneR).add(g);
        var R = { id: p.id, cfg: p, group: g, lamps: [], glow: [], levels: [0, 0], sceneOff: false, tv: null, speakers: [], hvac: null, thermo: null, y0: y0, ext: ext };

        // Sol, dalle et murs du fond (nord = -z, ouest = -x) : écorché ouvert vers la caméra (+x, +z)
        box(w, 0.25, d, M.dalle, w / 2, -0.125, d / 2, g);
        box(w - 0.1, 0.02, d - 0.1, ext ? (p.type === 'terrasse' ? M.gazon : M.solExt) : (p.type === 'chambre' || p.type === 'suite' ? M.solChambre : M.sol), w / 2, 0.01, d / 2, g);
        if (!ext) {
            var wallH = NIVEAU_H, wallMat = p.type === 'cinema' ? M.murSombre : M.mur;
            var cinema = p.type === 'cinema', roomGroup = g, wallWidth = cinema ? d : w;
            if (cinema) {
                // Screen on an uninterrupted north wall; the entire window and
                // motor assembly lives on the west wall, clear of the screen.
                box(w, wallH, .15, wallMat, w / 2, wallH / 2, .075, g);
                g = new THREE.Group(); g.rotation.y = Math.PI / 2; g.position.z = d; roomGroup.add(g);
            } else box(0.15, wallH, d, wallMat, 0.075, wallH / 2, d / 2, g);
            // Mur nord percé d'une vraie fenêtre (on voit le paysage à travers) à gauche, la TV occupe le
            // centre / la droite ; bureau : fenêtre à droite, TV à gauche.
            var fw = Math.min(2.2, wallWidth * 0.34), fx = cinema ? d * .5 : p.type === 'bureau' ? w * 0.74 : w * 0.22, fy0 = 0.95, fh = 1.4, fy1 = fy0 + fh;
            box(fx - fw / 2, wallH, 0.15, wallMat, (fx - fw / 2) / 2, wallH / 2, 0.075, g);
            box(wallWidth - fx - fw / 2, wallH, 0.15, wallMat, fx + fw / 2 + (wallWidth - fx - fw / 2) / 2, wallH / 2, 0.075, g);
            box(fw, fy0, 0.15, wallMat, fx, fy0 / 2, 0.075, g);                                             // allège
            box(fw, wallH - fy1, 0.15, wallMat, fx, fy1 + (wallH - fy1) / 2, 0.075, g);                     // linteau
            box(fw + 0.1, 0.05, 0.1, M.alu, fx, fy1 + 0.025, 0.075, g); box(fw + 0.1, 0.05, 0.1, M.alu, fx, fy0 - 0.025, 0.075, g);   // cadre
            box(0.05, fh, 0.1, M.alu, fx - fw / 2 - 0.025, fy0 + fh / 2, 0.075, g); box(0.05, fh, 0.1, M.alu, fx + fw / 2 + 0.025, fy0 + fh / 2, 0.075, g);
            box(0.04, fh, 0.08, M.alu, fx, fy0 + fh / 2, 0.075, g);                                         // meneau
            var vitre = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), M.verre); vitre.position.set(fx, fy0 + fh / 2, 0.075); g.add(vitre);
            box(fw + 0.24, 0.03, 0.2, M.blanc, fx, fy0 - 0.015, 0.2, g);                                    // tablette d'appui
            // Rai de lumière du jour qui entre par la fenêtre (opacité = ouverture des motorisations)
            var shaft = new THREE.Mesh(new THREE.PlaneGeometry(fw, 2.8), new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
            shaft.position.set(fx, 0.95, 1.25); shaft.rotation.x = -1.12; g.add(shaft); R.shaft = shaft; R.win = { x: fx, y: fy0 + fh / 2, w: fw, group: g, depth: cinema ? w : d, wall: cinema ? 'west' : 'north' };

            // --- Volet roulant : tablier à lames derrière la vitre, caisson intérieur ouvert montrant l'axe,
            //     le tablier enroulé et le moteur tubulaire (tête + voyant)
            var volMat = new THREE.MeshStandardMaterial({ map: TEX.lames.clone(), roughness: 0.6, metalness: 0.35 }); volMat.map.needsUpdate = true;
            var volet = box(fw + 0.08, fh + 0.14, 0.03, volMat, fx, fy1 + 0.1, 0.02, g); volet.geometry.translate(0, -(fh + 0.14) / 2, 0); volet.scale.y = 0.02;
            var cw = fw + 0.36, ch = 0.28, cd = 0.26, cy = fy1 + 0.17, cz = 0.15 + cd / 2;
            box(cw, 0.02, cd, M.blanc, fx, cy + ch / 2, cz, g); box(0.02, ch, cd, M.blanc, fx - cw / 2, cy, cz, g); box(0.02, ch, cd, M.blanc, fx + cw / 2, cy, cz, g);
            box(cw, ch * 0.42, 0.02, M.blanc, fx, cy + ch * 0.29, cz + cd / 2, g);                            // face avant partielle : l'intérieur reste visible
            var axe = cyl(0.028, fw + 0.1, M.metal, fx, cy - 0.03, cz - 0.03, g); axe.rotation.z = Math.PI / 2;
            var rouleau = cyl(0.05, fw - 0.1, volMat, fx + 0.05, cy - 0.03, cz - 0.03, g); rouleau.rotation.z = Math.PI / 2; rouleau.userData.animated = true;
            var motV = cyl(0.036, 0.3, M.moteur, fx - fw / 2 + 0.1, cy - 0.03, cz - 0.03, g); motV.rotation.z = Math.PI / 2;
            box(0.09, 0.09, 0.09, M.noir, fx - fw / 2 - 0.06, cy - 0.03, cz - 0.03, g);                       // tête du moteur (fixation)
            box(0.012, 0.012, 0.35, M.noir, fx - fw / 2 - 0.06, cy - 0.11, cz - 0.03, g);                     // câble d'alimentation
            var ledV = led(fx - fw / 2 + 0.24, cy + 0.02, cz + 0.015, g);
            // --- Store intérieur : tube + supports, moteur tubulaire à droite, toile qui descend, barre de lest
            var stoMat = new THREE.MeshStandardMaterial({ map: TEX.toile.clone(), roughness: 1, side: THREE.DoubleSide }); stoMat.map.needsUpdate = true;
            var store = box(fw - 0.06, fh + 0.06, 0.012, stoMat, fx, fy1 + 0.04, 0.2, g); store.geometry.translate(0, -(fh + 0.06) / 2, 0); store.scale.y = 0.02;
            cyl(0.026, fw + 0.02, M.metal, fx, fy1 + 0.06, 0.2, g).rotation.z = Math.PI / 2;
            box(0.03, 0.09, 0.07, M.noir, fx - fw / 2 - 0.02, fy1 + 0.06, 0.19, g); box(0.03, 0.09, 0.07, M.noir, fx + fw / 2 + 0.02, fy1 + 0.06, 0.19, g);
            var motS = cyl(0.04, 0.18, M.moteur, fx + fw / 2 - 0.1, fy1 + 0.06, 0.2, g); motS.rotation.z = Math.PI / 2;
            var lest = box(fw - 0.06, 0.03, 0.03, M.metal, fx, fy1 + 0.04, 0.2, g); lest.userData.animated = true;
            var ledS = led(fx + fw / 2 - 0.2, fy1 + 0.06, 0.245, g);
            // --- Rideaux : tringle motorisée (moteur de rail à droite), panneaux plissés depuis les bords
            var rMat = new THREE.MeshStandardMaterial({ map: TEX.plis.clone(), roughness: 1, side: THREE.DoubleSide }); rMat.map.needsUpdate = true;
            var rw = fw / 2 + 0.2, ry = fy1 + 0.27, rz = 0.5;
            var rg = box(rw, ry - 0.3, 0.08, rMat, fx - fw / 2 - 0.15, (ry - 0.3) / 2 + 0.3, rz, g); rg.geometry.translate(rw / 2, 0, 0); rg.scale.x = 0.18;
            var rd = box(rw, ry - 0.3, 0.08, rMat, fx + fw / 2 + 0.15, (ry - 0.3) / 2 + 0.3, rz, g); rd.geometry.translate(-rw / 2, 0, 0); rd.scale.x = 0.18;
            cyl(0.02, fw + 0.9, M.metal, fx, ry + 0.06, rz, g).rotation.z = Math.PI / 2;
            box(0.05, 0.12, 0.05, M.metal, fx - fw / 2 - 0.4, ry + 0.09, rz - 0.02, g); box(0.05, 0.12, 0.05, M.metal, fx + fw / 2 + 0.4, ry + 0.09, rz - 0.02, g);   // consoles
            box(0.16, 0.11, 0.11, M.moteur, fx + fw / 2 + 0.5, ry + 0.06, rz, g);                             // moteur de rail
            var ledR = led(fx + fw / 2 + 0.5, ry + 0.06, rz + 0.06, g);
            R.shades = {
                volet: { mesh: volet, pos: 0, cible: 0, min: 0.02, led: ledV, update: function (o, sc) { volMat.map.repeat.set(1, Math.max(.02, sc * 9)); rouleau.scale.set(1 + (1 - o.pos) * 0.9, 1, 1 + (1 - o.pos) * 0.9); } },
                store: { mesh: store, pos: 0, cible: 0, min: 0.02, led: ledS, update: function (o, sc) { stoMat.map.repeat.set(2, Math.max(.02, sc * 6)); lest.position.y = fy1 + 0.04 - (fh + 0.06) * sc; } },
                rideau: { meshes: [rg, rd], pos: 0, cible: 0, min: 0.24, led: ledR, update: function () {} }
            };
            Object.keys(R.shades).forEach(function (k) { var o = R.shades[k]; o.update(o, o.min); });
            g = roomGroup;
        } else {
            box(w, 0.9, 0.12, M.verreExt, w / 2, 0.45, 0.06, g);   // garde-corps vitré
        }

        // Mobilier par type
        var tvPos = null;
        switch (p.type) {
            case 'salon':
                box(2.6, 0.45, 0.9, M.tissu, w * 0.55, 0.225, d * 0.62, g); box(0.9, 0.45, 2.0, M.tissu, w * 0.55 - 1.3 + 0.45, 0.225, d * 0.62 - 0.9 + 0.55, g);
                box(2.6, 0.35, 0.3, M.tissu, w * 0.55, 0.62, d * 0.62 + 0.3, g);
                box(1.1, 0.35, 0.6, M.boisClair, w * 0.55, 0.175, d * 0.35, g);
                box(3.2, 0.02, 2.6, M.tapis, w * 0.55, 0.02, d * 0.5, g);
                box(2.4, 0.5, 0.45, M.bois, w * 0.55, 0.25, 0.4, g);
                tvPos = { x: w * 0.55, y: 1.45, z: 0.19, size: 1.8 }; break;
            case 'repas':
                box(2.4, 0.08, 1.1, M.bois, w / 2, 0.75, d / 2, g); cyl(0.06, 0.72, M.metal, w / 2, 0.36, d / 2, g);
                for (var i = 0; i < 6; i++) box(0.42, 0.9, 0.42, M.tissuFonce, w / 2 - 0.85 + (i % 3) * 0.85, 0.45, d / 2 + (i < 3 ? -0.85 : 0.85), g);
                cyl(0.18, 0.25, M.noir, w / 2, 2.55, d / 2, g, 0.02);
                tvPos = { x: w * 0.7, y: 1.45, z: 0.19, size: 1.3 }; break;
            case 'cuisine':
                box(2.4, 0.9, 1.0, M.blanc, w / 2, 0.45, d * 0.55, g); box(2.5, 0.06, 1.1, M.metal, w / 2, 0.93, d * 0.55, g);
                box(w - 0.6, 0.9, 0.65, M.boisClair, w / 2, 0.45, 0.5, g); box(w - 0.6, 0.05, 0.7, M.metal, w / 2, 0.93, 0.5, g);
                box(w - 0.6, 0.8, 0.4, M.boisClair, w / 2, 2.1, 0.35, g);
                for (var s = 0; s < 3; s++) cyl(0.18, 0.7, M.noir, w / 2 - 0.8 + s * 0.8, 0.35, d * 0.55 + 0.8, g);
                for (var pl = 0; pl < 2; pl++) cyl(0.14, 0.2, M.noir, w / 2 - 0.5 + pl, 2.4, d * 0.55, g, 0.03);
                tvPos = { x: w - 0.9, y: 1.7, z: 0.19, size: 1.0 }; break;
            case 'chambre': case 'suite':
                var bw = p.type === 'suite' ? 2.0 : 1.7;
                box(bw, 0.35, 2.1, M.bois, w / 2, 0.175, d * 0.5, g); box(bw - 0.1, 0.25, 2.0, M.lit, w / 2, 0.47, d * 0.5, g);
                box(bw - 0.2, 0.18, 0.5, M.coussin, w / 2, 0.68, d * 0.5 - 0.75, g); box(bw, 1.1, 0.1, M.bois, w / 2, 0.55, d * 0.5 - 1.1, g);
                box(0.5, 0.5, 0.5, M.bois, w / 2 - bw / 2 - 0.4, 0.25, d * 0.5 - 0.8, g); box(0.5, 0.5, 0.5, M.bois, w / 2 + bw / 2 + 0.4, 0.25, d * 0.5 - 0.8, g);
                box(1.6, 2.2, 0.6, M.boisClair, 0.45, 1.1, d - 1.0, g);
                if (p.type === 'suite') { box(2.2, 0.02, 2.8, M.tapis, w / 2, 0.02, d * 0.5 + 0.4, g); box(1.2, 0.4, 0.7, M.tissu, w - 1.2, 0.2, d - 0.8, g); }
                tvPos = { x: w / 2, y: 1.5, z: 0.19, size: 1.3 }; break;
            case 'bureau':
                box(1.8, 0.05, 0.8, M.bois, w / 2, 0.75, 1.1, g); box(0.05, 0.72, 0.7, M.metal, w / 2 - 0.85, 0.36, 1.1, g); box(0.05, 0.72, 0.7, M.metal, w / 2 + 0.85, 0.36, 1.1, g);
                box(0.7, 0.42, 0.04, M.noir, w / 2, 1.05, 0.95, g); box(0.5, 0.95, 0.5, M.tissuFonce, w / 2, 0.5, 1.9, g);
                box(1.2, 2.2, 0.35, M.boisClair, w - 0.8, 1.1, 0.35, g); for (var sh = 0; sh < 4; sh++) box(1.1, 0.04, 0.3, M.bois, w - 0.8, 0.5 + sh * 0.5, 0.35, g);
                tvPos = { x: 1.4, y: 1.6, z: 0.19, size: 1.0 }; break;
            case 'cinema':
                for (var row = 0; row < 2; row++) for (var c = 0; c < 3; c++) box(0.8, 0.9, 0.9, M.tissuFonce, w / 2 - 1 + c, 0.45 + row * 0.15, d * 0.45 + row * 1.2, g);
                box(w, 0.02, d, M.tapis, w / 2, 0.02, d / 2, g);
                tvPos = { x: w / 2, y: 1.5, z: 0.19, size: 3.2 }; break;
            case 'terrasse':
                for (var lg = 0; lg < 2; lg++) { box(0.7, 0.25, 1.9, M.boisClair, w * 0.35 + lg * 1.0, 0.3, d * 0.5, g); box(0.7, 0.45, 0.4, M.boisClair, w * 0.35 + lg * 1.0, 0.5, d * 0.5 - 0.75, g); }
                for (var pp = 0; pp < 3; pp++) { cyl(0.28, 0.5, M.pot, 0.7 + pp * (w - 1.4) / 2, 0.25, d - 0.7, g, 0.22); sph(0.5, M.plante, 0.7 + pp * (w - 1.4) / 2, 0.85, d - 0.7, g); }
                for (var ps = 0; ps < 4; ps++) cyl(0.08, 2.6, M.bois, 0.4 + (ps % 2) * (w - 0.8), 1.3, 0.4 + Math.floor(ps / 2) * (d - 0.8), g);
                // Pergola à cadre ouvert : store de toit motorisé (toile rayée) qui se déroule d'arrière en avant,
                // tube + moteur tubulaire à droite, barre de charge, voyant — visible depuis le ciel
                box(w, 0.12, 0.16, M.bois, w / 2, 2.6, 0.4, g); box(w, 0.12, 0.16, M.bois, w / 2, 2.6, d - 0.4, g);
                box(0.16, 0.12, d, M.bois, 0.4, 2.6, d / 2, g); box(0.16, 0.12, d, M.bois, w - 0.4, 2.6, d / 2, g);
                for (var lm = 1; lm < 5; lm++) box(w - 0.8, 0.04, 0.06, M.boisClair, w / 2, 2.58, 0.4 + lm * (d - 0.8) / 5, g);   // lambourdes
                var banMat = new THREE.MeshStandardMaterial({ map: TEX.banne.clone(), roughness: 1, side: THREE.DoubleSide }); banMat.map.needsUpdate = true; banMat.map.repeat.set(Math.round((w - 1) / 0.6), 1);
                var banne = box(w - 1.0, 0.01, d - 1.0, banMat, w / 2, 2.64, 0.55, g); banne.geometry.translate(0, 0, (d - 1.0) / 2); banne.scale.z = 0.02;
                cyl(0.045, w - 0.9, M.metal, w / 2, 2.66, 0.5, g).rotation.z = Math.PI / 2;
                var motB = cyl(0.055, 0.24, M.moteur, w - 0.62, 2.66, 0.5, g); motB.rotation.z = Math.PI / 2;
                box(0.1, 0.1, 0.1, M.noir, w - 0.45, 2.66, 0.5, g);                                         // tête de fixation
                var barreB = box(w - 1.0, 0.05, 0.06, M.alu, w / 2, 2.64, 0.55, g); barreB.userData.animated = true;
                var ledB = led(w - 0.62, 2.73, 0.5, g);
                R.shades = { store: { mesh: banne, axis: 'z', pos: 0, cible: 0, min: 0.02, led: ledB, update: function (o, sc) { barreB.position.z = 0.55 + (d - 1.0) * sc; } } };
                tvPos = null; break;
            case 'piscine':
                var eauMat = M.eau.clone(); R.eau = box(w * 0.7, 0.6, d * 0.55, eauMat, w * 0.5, 0.05, d * 0.5, g);
                for (var pl2 = 0; pl2 < 3; pl2++) { var sl = sph(0.09, new THREE.MeshStandardMaterial({ color: 0xbfefff, emissive: 0x4fd1ff, emissiveIntensity: 0.4 }), w * 0.5 - w * 0.25 + pl2 * w * 0.25, 0.12, d * 0.5 + d * 0.27, g); R.lamps.push({ mesh: sl, mat: sl.material, pos: new THREE.Vector3(w * 0.5, 1.4, d * 0.5), sousMarin: true }); }
                box(w * 0.72, 0.08, 0.2, M.blanc, w * 0.5, 0.05, d * 0.5 - d * 0.275 - 0.1, g); box(w * 0.72, 0.08, 0.2, M.blanc, w * 0.5, 0.05, d * 0.5 + d * 0.275 + 0.1, g);
                for (var lo = 0; lo < 3; lo++) box(0.6, 0.3, 1.7, M.blanc, 0.7, 0.2, 0.9 + lo * 1.6, g);
                cyl(0.28, 0.5, M.pot, w - 0.6, 0.25, d - 0.6, g, 0.22); sph(0.5, M.plante, w - 0.6, 0.85, d - 0.6, g);
                tvPos = null; break;
            case 'sauna':
                box(w, NIVEAU_H, 0.12, M.bois, w / 2, NIVEAU_H / 2, 0.14, g); box(0.12, NIVEAU_H, d, M.bois, 0.14, NIVEAU_H / 2, d / 2, g);
                box(w - 0.5, 0.1, 0.7, M.boisClair, w / 2, 0.45, 0.6, g); box(w - 0.5, 0.1, 0.7, M.boisClair, w / 2, 0.95, 1.3, g);
                box(0.6, 0.8, 0.6, M.noir, w - 0.7, 0.4, d - 0.7, g); box(0.5, 0.15, 0.5, M.pot, w - 0.7, 0.87, d - 0.7, g);
                tvPos = null; break;
            case 'poolhouse':
                box(2.6, 1.0, 0.7, M.bois, w * 0.45, 0.5, 0.75, g); box(2.7, 0.06, 0.8, M.metal, w * 0.45, 1.03, 0.75, g);
                for (var st2 = 0; st2 < 3; st2++) cyl(0.18, 0.75, M.metal, w * 0.45 - 0.9 + st2 * 0.9, 0.37, 1.5, g);
                box(2.2, 0.45, 0.9, M.tissu, w * 0.6, 0.225, d - 1.0, g); box(2.2, 0.35, 0.3, M.tissu, w * 0.6, 0.62, d - 0.7, g);
                tvPos = { x: w - 1.2, y: 1.55, z: 0.19, size: 1.2 }; break;
            default:
                box(1.6, 0.45, 0.8, M.tissu, w / 2, 0.225, d / 2, g); tvPos = { x: w / 2, y: 1.5, z: 0.19, size: 1.2 };
        }

        // Éclairage : 2 circuits = plafonnier(s) + appliques / lampes d'ambiance
        var lampMat1 = new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xffd9a0, emissiveIntensity: 1 });
        var lampMat2 = new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xffe0b0, emissiveIntensity: 1 });
        var glowMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
        if (!ext) {
            var l1 = sph(p.type === 'cinema' ? .055 : .14, lampMat1, p.type === 'cinema' ? .23 : w / 2, NIVEAU_H - 0.2, p.type === 'cinema' ? d - .3 : d / 2, g);
            if (p.type !== 'cinema') cyl(0.05, 0.2, M.metal, w / 2, NIVEAU_H - 0.05, d / 2, g);
            var gl = new THREE.Mesh(new THREE.CircleGeometry(Math.min(w, d) * 0.42, 24), glowMat); gl.rotation.x = -Math.PI / 2; gl.position.set(w / 2, 0.03, d / 2); g.add(gl);
            R.lamps.push({ mesh: l1, mat: lampMat1, pos: new THREE.Vector3(w / 2, NIVEAU_H - 0.5, d / 2) }); R.glow.push(gl);
            var l2a = box(0.3, 0.16, 0.12, lampMat2, w * 0.25, 2.0, 0.2, g), l2b = box(0.3, 0.16, 0.12, lampMat2, w * 0.8, 2.0, 0.2, g);
            R.lamps.push({ mesh: l2a, mat: lampMat2, pos: new THREE.Vector3(w * 0.5, 1.9, 0.5), extra: l2b });
        } else {
            for (var lp = 0; lp < 2; lp++) { cyl(0.05, 2.2, M.metal, 0.5 + lp * (w - 1), 1.1, d * 0.2, g); var lb = sph(0.16, lp ? lampMat2 : lampMat1, 0.5 + lp * (w - 1), 2.3, d * 0.2, g); R.lamps.push({ mesh: lb, mat: lp ? lampMat2 : lampMat1, pos: new THREE.Vector3(0.5 + lp * (w - 1), 2.0, d * 0.3) }); }
            var gl2 = new THREE.Mesh(new THREE.CircleGeometry(Math.min(w, d) * 0.4, 24), glowMat.clone()); gl2.rotation.x = -Math.PI / 2; gl2.position.set(w / 2, 0.03, d / 2); g.add(gl2); R.glow.push(gl2);
        }

        // Audio / vidéo : TV murale + 2 enceintes
        if (tvPos && p.av !== false) {
            var sw = tvPos.size, shh = sw * 9 / 16;
            // Téléviseur : dalle fine à bord alu, support mural, bandeau logo, voyant de veille, barre de son
            box(sw + 0.05, shh + 0.05, 0.012, M.alu, tvPos.x, tvPos.y, tvPos.z - 0.01, g);                 // liseré arrière
            box(sw + 0.03, shh + 0.03, 0.03, M.noir, tvPos.x, tvPos.y, tvPos.z, g);                        // châssis
            box(0.4, 0.3, 0.05, M.moteur, tvPos.x, tvPos.y, tvPos.z - 0.03, g);                             // support mural
            box(0.14, 0.012, 0.008, M.alu, tvPos.x, tvPos.y - shh / 2 - 0.004, tvPos.z + 0.018, g);       // bandeau logo
            var veille = sph(0.01, new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 1.2 }), tvPos.x + sw / 2 - 0.06, tvPos.y - shh / 2 + 0.03, tvPos.z + 0.02, g);
            box(sw * 0.85, 0.07, 0.1, M.moteur, tvPos.x, tvPos.y - shh / 2 - 0.13, tvPos.z + 0.04, g);      // barre de son
            for (var sb = 0; sb < 5; sb++) cyl(0.018, 0.012, M.noir, tvPos.x - sw * 0.3 + sb * sw * 0.15, tvPos.y - shh / 2 - 0.13, tvPos.z + 0.095, g).rotation.x = Math.PI / 2;
            var scr = makeScreen();
            var scrMat = new THREE.MeshBasicMaterial({ map: scr.tex });
            var scrMesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, shh), M.ecranOff); scrMesh.position.set(tvPos.x, tvPos.y, tvPos.z + 0.02); g.add(scrMesh);
            var tvLight = new THREE.PointLight(0x9db8ff, 0, 2.2, 2); tvLight.position.set(tvPos.x, tvPos.y, tvPos.z + 0.4); g.add(tvLight);
            R.tv = { mesh: scrMesh, on: scrMat, off: M.ecranOff, screen: scr, light: tvLight, source: 0, veille: veille };
            var spkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
            [-1, 1].forEach(function (side) {
                var sx = tvPos.x + side * (sw / 2 + 0.45); if (sx < 0.35 || sx > w - 0.35) sx = tvPos.x + side * (sw / 2 + 0.2);
                var sp = box(0.26, 0.95, 0.26, spkMat, sx, 0.475, 0.4, g);
                var cone = cyl(0.09, 0.03, M.metal, sx, 0.6, 0.55, g); cone.rotation.x = Math.PI / 2;
                var cone2 = cyl(0.06, 0.03, M.metal, sx, 0.32, 0.55, g); cone2.rotation.x = Math.PI / 2;
                var ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 24), new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0, side: THREE.DoubleSide }));
                ring.position.set(sx, 0.6, 0.57); g.add(ring);
                R.speakers.push({ body: sp, ring: ring, phase: side });
            });
        }

        // Climatisation : unité murale + thermostat
        if (!ext && p.cvc !== false) {
            var unit = box(0.9, 0.28, 0.22, M.blanc, w - 0.75, NIVEAU_H - 0.45, 0.26, g);
            var flap = box(0.84, 0.03, 0.14, M.metal, w - 0.75, NIVEAU_H - 0.6, 0.34, g); flap.rotation.x = 0.5;
            var th = makeThermo();
            var thMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ map: th.tex }));
            thMesh.position.set(0.19, 1.45, d * 0.35); thMesh.rotation.y = Math.PI / 2; g.add(thMesh);
            box(0.03, 0.3, 0.3, M.noir, 0.17, 1.45, d * 0.35, g);
            var breeze = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
            breeze.position.set(w - 0.75, NIVEAU_H - 0.85, 0.6); breeze.rotation.x = -0.9; g.add(breeze);
            R.hvac = { unit: unit, flap: flap, breeze: breeze, thermo: th, mesh: thMesh };
        }

        // Étiquette de la pièce (sprite texte)
        R.label = makeLabel(p.nom || ('Pièce ' + p.id)); R.label.position.set(w / 2, NIVEAU_H + .5, 0); g.add(R.label);
        interiors.curtains(R);
        interiors.decorate(R);
        // Preserve only the meshes whose transforms or material assignments change at runtime.
        var moving = new Set([R.label, R.eau, R.shaft, R.tv && R.tv.mesh, R.hvac && R.hvac.flap, R.hvac && R.hvac.breeze]);
        R.speakers.forEach(function (s) { moving.add(s.body); moving.add(s.ring); });
        Object.values(R.shades || {}).forEach(function (s) { (s.meshes || [s.mesh]).forEach(function (m) { moving.add(m); }); });
        interiors.batch(g, moving);
        applyLevels(R);
        ROOMS[p.id] = R;
        return R;
    }

    function makeLabel(text) {
        var c = document.createElement('canvas'); c.width = 512; c.height = 128; var g = c.getContext('2d');
        g.fillStyle = 'rgba(15,23,42,0.72)'; roundRect(g, 8, 24, 496, 80, 24); g.fill();
        g.fillStyle = '#fff'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText(text.toUpperCase(), 256, 80);
        var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); sp.scale.set(2.6, 0.65, 1); sp.renderOrder = 10;
        return sp;
    }

    /* ---------- Motorisations : volets / rideaux / stores (course complète en ~4 s) ---------- */
    function animateShades(R, dt) {
        var sh = R.shades; if (!sh) return;
        Object.keys(sh).forEach(function (k) {
            var o = sh[k], moving = o.pos !== o.cible;
            if (o.led) o.led.material.emissiveIntensity = moving ? 2.2 + Math.sin(idle * 14) * 1.2 : 0.3;   // voyant du moteur
            if (!moving) return;
            if (R === activeRoom) renderer.shadowMap.needsUpdate = true;
            var step = dt / 4; o.pos = o.pos < o.cible ? Math.min(o.cible, o.pos + step) : Math.max(o.cible, o.pos - step);
            var sc = o.min + (1 - o.min) * o.pos;
            if (o.meshes) o.meshes.forEach(function (m) { m.scale.x = sc; }); else if (o.axis === 'z') o.mesh.scale.z = sc; else o.mesh.scale.y = sc;
            if (o.update) o.update(o, sc);
        });
    }
    // Lumière du jour qui entre dans la pièce : 0 (volet fermé) .. 1 (tout ouvert) ; store et rideaux tamisent
    function daylight(R) {
        var sh = R && R.shades; if (!sh || R.ext) return 1;
        var v = sh.volet ? sh.volet.pos : 0, s = sh.store ? sh.store.pos : 0, r = sh.rideau ? sh.rideau.pos : 0;
        return (1 - v) * (1 - 0.85 * s) * (1 - 0.7 * r);
    }
    function shadeCmd(R, famille, cmd) {           // cmd : 'up' (ouvrir) / 'stop' / 'down' (fermer)
        if (!R || !R.shades || !R.shades[famille]) return;
        var o = R.shades[famille];
        if (cmd === 'stop') o.cible = o.pos; else o.cible = (cmd === 'down') ? 1 : 0;
    }
    function shadeScene(R, n) {                     // scènes 201-204 : Tout ouvrir / Position été / Position hiver / Tout fermer
        if (!R || !R.shades) return;
        var t = [{ volet: 0, rideau: 0, store: 0 }, { volet: 0, rideau: 0.5, store: 1 }, { volet: 1, rideau: 1, store: 0 }, { volet: 1, rideau: 1, store: 1 }][n - 1];
        if (t) Object.keys(t).forEach(function (k) { if (R.shades[k]) R.shades[k].cible = t[k]; });
    }
    function motorFamily(R, idx) {                  // moteur 1..6 -> famille, d'après villa_config pieces[].pilotages.moteurs.liste
        var pc = (vc.pieces || []).filter(function (p) { return p.id === R.id; })[0];
        var l = pc && pc.pilotages && pc.pilotages.moteurs && pc.pilotages.moteurs.liste;
        var t = l && l[idx - 1] && String(l[idx - 1].type || l[idx - 1].nom || '').toLowerCase();
        if (!t) return ['volet', 'volet', 'rideau', 'rideau', 'store', 'store'][idx - 1];
        return t.indexOf('rideau') >= 0 ? 'rideau' : (t.indexOf('store') >= 0 ? 'store' : 'volet');
    }

    /* ---------- Application des états ---------- */
    function lightLevel(R, i) { return R.sceneOff ? 0 : (R.levels[i] ?? R.levels[0] ?? 0); }
    function applyLevels(R) {
        R.lamps.forEach(function (l, i) {
            var v = lightLevel(R, l.sousMarin ? 0 : i);
            if (l.sousMarin) { l.mat.emissiveIntensity = 0.1 + v * 2.2; return; }   // projecteurs de piscine : circuit 1
            l.mat.emissiveIntensity = v * 1.6; l.mat.color.setHex(v > 0.05 ? 0xfff4dc : 0x9a948c);
        });
        R.glow.forEach(function (gm, i) { gm.material.opacity = lightLevel(R, i) * 0.12; });
    }
    function setTv(R, src) {
        if (!R.tv) return;
        R.tv.source = src; R.tv.screen.st.source = src; R.tv.screen.st.open = null; R.tv.screen.draw();
        R.tv.mesh.material = src > 0 ? R.tv.on : R.tv.off;
        R.tv.veille.material.emissiveIntensity = src > 0 ? 0 : 1.2; R.tv.veille.material.color.setHex(src > 0 ? 0x3a0d0b : 0xff3b30);
    }

    var activeRoom = null, selectedRoom = null, tween = null, idle = 0, music = false;
    var envelope = null, shellTween = null, phase = 'overview-closed';
    // Fenêtre de la carte Sources (rect écran) : la caméra y centre la pièce et l'y fait tenir
    var win = null;
    function applyViewOffset() {
        var W = canvas.clientWidth || window.innerWidth, H = canvas.clientHeight || window.innerHeight;
        if (!win) { if (camera.view && camera.view.enabled) camera.clearViewOffset(); return; }
        camera.setViewOffset(W, H, W / 2 - (win.x + win.w / 2), H / 2 - (win.y + win.h / 2), W, H);
    }
    var camState = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), basePos: new THREE.Vector3(), baseTgt: new THREE.Vector3() };
    function villaBounds() {
        var b = new THREE.Box3(); Object.keys(ROOMS).forEach(function (k) { b.expandByObject(ROOMS[k].group); }); return b;
    }
    var overviewCache = null;
    function fitBounds(bounds, target) {
        var W = canvas.clientWidth || 1280, H = canvas.clientHeight || 800;
        var region = win || { w: W, h: H };
        var direction = new THREE.Vector3(.48, .46, 1).normalize();
        var right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
        var up = new THREE.Vector3().crossVectors(direction, right).normalize();
        var tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        var tanX = tanV * W / H * region.w / W * .91, tanY = tanV * region.h / H * .88;
        var distance = 1;
        for (var x of [bounds.min.x, bounds.max.x]) for (var y of [bounds.min.y, bounds.max.y]) for (var z of [bounds.min.z, bounds.max.z]) {
            var q = new THREE.Vector3(x, y, z).sub(target);
            distance = Math.max(distance, q.dot(direction) + Math.max(Math.abs(q.dot(right)) / tanX, Math.abs(q.dot(up)) / tanY));
        }
        return { pos: target.clone().addScaledVector(direction, distance), tgt: target };
    }
    function overviewPose() {
        if (overviewCache) return overviewCache;
        var b = villaBounds(), c = b.getCenter(new THREE.Vector3());
        overviewCache = fitBounds(b, c);
        return overviewCache;
    }
    function goOverview(immediate, onDone) { var o = overviewPose(); flyTo(o.pos.clone(), o.tgt.clone(), immediate, 1.4, onDone); }
    function flyTo(pos, tgt, immediate, dur, onDone) {
        if (immediate) { camState.basePos.copy(pos); camState.baseTgt.copy(tgt); camState.pos.copy(pos); camState.tgt.copy(tgt); tween = null; if (onDone) onDone(); return; }
        // Retarget from the displayed pose, never replay obsolete selections.
        tween = { p0: camState.pos.clone(), t0: camState.tgt.clone(), p1: pos, t1: tgt, t: 0, dur: dur || 1.35, onDone: onDone };
        camState.basePos.copy(pos); camState.baseTgt.copy(tgt);
    }
    function fadeEnvelope(to, onDone) {
        shellTween = { from: envelope.opacity, to: to, t: 0, onDone: onDone };
        if (Math.abs(shellTween.from - to) < .001) finishEnvelope();
    }
    function finishEnvelope() {
        if (!shellTween) return;
        var s = shellTween; shellTween = null; envelope.setOpacity(s.to); if (s.onDone) s.onDone();
    }
    function beginFocus(R) {
        phase = 'focusing';
        // The outgoing room stays visible throughout the camera journey.
        R.group.visible = true;
        var o = roomPose(R);
        flyTo(o.pos, o.tgt, false, 1.35, function () { showOnly(R); phase = 'room'; });
    }
    function focusRoom(R) {
        if (!R) return;
        activeRoom = R; tween = null; shellTween = null;
        if (envelope.opacity > .001) {
            phase = 'opening';
            fadeEnvelope(0, function () { beginFocus(R); });
        } else beginFocus(R);
    }
    function overview() {
        if (phase === 'overview-closed' || phase === 'overview-closing' || phase === 'overview-travel') return;
        activeRoom = null; tween = null; shellTween = null; showOnly(null);
        phase = 'overview-travel';
        goOverview(false, function () {
            phase = 'overview-closing';
            fadeEnvelope(1, function () { phase = 'overview-closed'; });
        });
    }
    function openOverview() {
        phase = 'opening'; tween = null;
        fadeEnvelope(0, function () { phase = 'overview-open'; });
    }
    // Vue pièce : seules la pièce active, les extérieurs et le décor restent visibles (écorché lisible)
    function showOnly(R) {
        Object.keys(ROOMS).forEach(function (k) { var o = ROOMS[k]; o.group.visible = !R || o === R; });
        sun.castShadow = !!R && !R.ext;
        if (R) { sun.target.position.set(R.cfg.x + R.cfg.w / 2, R.y0, R.cfg.z + R.cfg.d / 2); sun.position.copy(sun.target.position).add(new THREE.Vector3(7, 16, 6)); }
        renderer.shadowMap.needsUpdate = true;
    }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function setRoom(id) {
        id = parseInt(id, 10); var R = ROOMS[id]; if (!R) return;
        if (selectedRoom === R) return;
        var prev = activeRoom; selectedRoom = R;
        if (prev && prev.shaft) prev.shaft.material.opacity = 0;
        Object.keys(ROOMS).forEach(function (k) { ROOMS[k].label.material.opacity = ROOMS[k] === R ? 1 : 0.55; });
        focusRoom(R);
    }
    function roomPose(R) {
        var p = R.cfg;
        // Fit the occupied interior instead of the air above its label.
        var o = fitBounds(new THREE.Box3(new THREE.Vector3(p.x + .25, R.y0, p.z + .15), new THREE.Vector3(p.x + p.w - .25, R.y0 + 3, p.z + p.d - .2)), new THREE.Vector3(p.x + p.w / 2, R.y0 + 1.2, p.z + p.d * .46));
        o.pos.sub(o.tgt).multiplyScalar(.85).add(o.tgt); return o;
    }
    var raycaster = new THREE.Raycaster();
    function pickRoom(x, y) {
        raycaster.setFromCamera(new THREE.Vector2(x / canvas.clientWidth * 2 - 1, 1 - y / canvas.clientHeight * 2), camera);
        var hits = [];
        Object.values(ROOMS).forEach(function (R) {
            if (!R.group.visible) return;
            var candidates = [];
            R.group.traverse(function (o) { if (o.isMesh && o.visible && !o.material.transparent) candidates.push(o); });
            var hit = raycaster.intersectObjects(candidates, false)[0]; if (hit) hits.push({ id: R.id, distance: hit.distance });
        });
        hits.sort(function (a,b) { return a.distance - b.distance; }); return hits[0] && hits[0].id;
    }
    function clickPlan(x, y) {
        if (!win || x < win.x || x > win.x + win.w || y < win.y || y > win.y + win.h) return false;
        if (phase === 'overview-closed') { openOverview(); return true; }
        if (phase !== 'overview-open') return false;
        var id = pickRoom(x,y); if (!id) return false;
        // Use the existing GUI handler without editing the generated GUI.
        if (!boundWin || typeof boundWin.changeRoomIphone !== 'function') return false;
        boundWin.changeRoomIphone(String(id));
        if (selectedRoom === ROOMS[id] && activeRoom !== selectedRoom) focusRoom(selectedRoom);
        return true;
    }
    /* ---------- Boucle ---------- */
    function resize() {
        var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
            renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        }
    }
    var lastFrame = 0, running = true, raf = 0, frames = [], quality = 1.5, slowFrames = 0;
    function loop(ts) {
        if (!running) return;
        raf = requestAnimationFrame(loop);
        if (document.hidden) return;
        var interval = 1000 / (cfg.fpsMax || 60), elapsed = ts - lastFrame;
        if (elapsed < interval - 1) return;
        lastFrame = ts - Math.max(0, elapsed % interval - 1);
        if (elapsed > 0 && elapsed < 250) { frames.push(elapsed); if (frames.length > 180) frames.shift(); }
        if (elapsed > 25 && elapsed < 200) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
        if (slowFrames > 90 && quality > 1) { quality = Math.max(1, quality - .25); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality)); slowFrames = 0; }
        var dt = Math.min(0.25, clock.getDelta()); idle += dt;
        resize();
        if (shellTween) {
            shellTween.t += dt / .48;
            envelope.setOpacity(THREE.MathUtils.lerp(shellTween.from, shellTween.to, ease(Math.min(1, shellTween.t))));
            if (shellTween.t >= 1) finishEnvelope();
        }
        if (tween) {
            tween.t += dt / tween.dur; var k = ease(Math.min(1, tween.t));
            camState.pos.lerpVectors(tween.p0, tween.p1, k); camState.tgt.lerpVectors(tween.t0, tween.t1, k);
            if (tween.t >= 1) { var done = tween.onDone; tween = null; if (done) done(); }
        }
        // léger mouvement de vie autour de la position de base
        var sway = 0;
        camera.position.set(camState.pos.x + Math.sin(idle * 0.25) * 0.35 * sway, camState.pos.y + Math.sin(idle * 0.18) * 0.15 * sway, camState.pos.z + Math.cos(idle * 0.22) * 0.35 * sway);
        camera.lookAt(camState.tgt); applyViewOffset();
        // Lumière du jour de la scène des pièces : pleine en vue villa, sinon celle qui entre par la fenêtre
        // de la pièce active (volet / store / rideaux) ; les lampes des scènes ajoutent un rebond chaud.
        var dayT = activeRoom ? daylight(activeRoom) : 1, lampAvg = activeRoom ? (lightLevel(activeRoom, 0) + lightLevel(activeRoom, 1)) / 2 : 0;
        dayCur += (dayT - dayCur) * Math.min(1, dt * 4);
        var dayF = dayCur < .0001 ? 0 : dayCur;
        hemi.intensity = DAY.hemi * dayF + lampAvg * 0.5 * (1 - dayCur); hemi.color.setHex(dayCur > 0.5 ? 0xe6eeff : 0xffe1bd);
        sun.intensity = DAY.sun * dayF; fill.intensity = DAY.fill * dayF;
        if (activeRoom && activeRoom.win && !activeRoom.ext) {
            var wn = activeRoom.win, gw = wn.group;
            winLight.position.copy(gw.localToWorld(new THREE.Vector3(wn.x, wn.y + 1.4, -3.2)));
            winLight.target.position.copy(gw.localToWorld(new THREE.Vector3(wn.x, 0, wn.depth * 0.55)));
            winLight.intensity = 90 * dayCur; activeRoom.shaft.material.opacity = 0.16 * dayCur;
        } else winLight.intensity = 0;
        // lampes réelles sur la pièce active
        roomLights.forEach(function (l) { l.intensity = 0; });
        Object.values(ROOMS).forEach(function (R) { if (R.tv) R.tv.light.intensity = 0; });
        if (activeRoom) {
            activeRoom.lamps.forEach(function (l, i) { if (i < 2) { var wp = l.pos.clone().applyMatrix4(activeRoom.group.matrixWorld); roomLights[i].position.copy(wp); roomLights[i].intensity = lightLevel(activeRoom, i) * (i === 0 ? 55 : 30) * (l.sousMarin ? 0.3 : 1); } });
            if (activeRoom.tv) activeRoom.tv.light.intensity = activeRoom.tv.source > 0 ? .28 : 0;
            if (activeRoom.tv && activeRoom.tv.source === 1 && activeRoom.tv.screen.st.open !== null) { activeRoom.tv.screen.st.tick++; if (activeRoom.tv.screen.st.tick % 10 === 0) activeRoom.tv.screen.draw(); }
            activeRoom.speakers.forEach(function (s) {
                var on = music; var pulse = on ? 1 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.06 : 1;
                s.body.scale.set(pulse, 1, pulse); s.ring.material.opacity = on ? 0.35 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.5 : 0;
                s.ring.scale.setScalar(on ? 1 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.6 : 1);
            });
            if (activeRoom.eau) { var em = activeRoom.eau.material; em.emissiveIntensity = 0.45 + Math.sin(idle * 1.3) * 0.15 + (activeRoom.levels[0] || 0) * 0.5; activeRoom.eau.position.y = 0.05 + Math.sin(idle * 0.9) * 0.012; em.color.setHex((activeRoom.levels[0] || 0) > 0.3 ? 0x5fc8f0 : 0x3fa7d6); }
            if (activeRoom.hvac) { activeRoom.hvac.flap.rotation.x = 0.5 + Math.sin(idle * 1.5) * 0.25; activeRoom.hvac.breeze.material.opacity = (0.08 + Math.abs(Math.sin(idle * 1.5)) * 0.1) * Math.max(dayF, lampAvg); activeRoom.hvac.breeze.material.color.setHex(activeRoom.hvac.thermo.st.chauffe ? 0xffc27a : 0x9fd8ff); }
        }
        Object.values(ROOMS).forEach(function (R) { if (R.shades) animateShades(R, dt); });
        renderer.info.autoReset = false; renderer.info.reset();
        renderer.clear();
        renderer.render(scene, camera);          // extérieurs, lumière du jour constante
        renderer.render(sceneR, camera);         // pièces, même profondeur, lumière du jour de la pièce active
    }

    /* ---------- Disposition par défaut (si meta.plan3d.pieces absent) ---------- */
    function defaultLayout() {
        return [
            { id: 1, type: 'salon', niveau: 0, x: 0, z: 0, w: 7, d: 6 }, { id: 2, type: 'cuisine', niveau: 0, x: 7.3, z: 0, w: 5, d: 6 },
            { id: 3, type: 'repas', niveau: 0, x: 12.6, z: 0, w: 5, d: 6 }, { id: 8, type: 'cinema', niveau: 0, x: 0, z: 6.4, w: 7, d: 5 },
            { id: 4, type: 'suite', niveau: 1, x: 0, z: 0, w: 6, d: 6 }, { id: 5, type: 'chambre', niveau: 1, x: 6.3, z: 0, w: 5, d: 6 },
            { id: 6, type: 'chambre', niveau: 1, x: 11.6, z: 0, w: 5, d: 6 }, { id: 7, type: 'bureau', niveau: 1, x: 0, z: 6.4, w: 6, d: 5 },
            { id: 9, type: 'chambre', niveau: 2, x: 0, z: 0, w: 5.5, d: 6 }, { id: 10, type: 'suite', niveau: 2, x: 5.8, z: 0, w: 6, d: 6 },
            { id: 11, type: 'terrasse', niveau: 0, x: 19, z: 0, w: 7, d: 6 }, { id: 12, type: 'piscine', niveau: 0, x: 19, z: 6.4, w: 9, d: 7 },
            { id: 13, type: 'sauna', niveau: 0, x: 26.5, z: 0, w: 4, d: 4 }, { id: 14, type: 'poolhouse', niveau: 0, x: 28.5, z: 6.4, w: 5, d: 5 }
        ];
    }

    /* ---------- Construction ---------- */
    var noms = opts.names || {};
    PIECES.forEach(function (p) { if (!p.nom) p.nom = noms[p.id] || ('Pièce ' + p.id); buildRoom(p); });
    envelope = createEnvelope(scene, ROOMS, M);
    buildLandscape(scene, villaBounds(), interiors); sceneR.fog = scene.fog;
    goOverview(true);
    resize();
    raf = requestAnimationFrame(loop);

    /* ---------- API publique ---------- */
    var API = {
        setRoom: setRoom,
        version: '2026-09-16-atlas-2',
        overview: overview,
        click: clickPlan,
        focusSelected: function () { if (!selectedRoom || activeRoom === selectedRoom) return; focusRoom(selectedRoom); },
        navigation: function () { return { phase: phase, walls: envelope.opacity, camera: camState.pos.toArray(), target: camState.tgt.toArray(), moving: !!tween, lamps: roomLights.map(function (l) { return l.intensity; }), day: dayCur }; },
        roomPoint: function (id) { var R = ROOMS[id]; if (!R) return null; var v = R.group.localToWorld(new THREE.Vector3(R.cfg.w * .6, .1, R.cfg.d * .8)).project(camera); return { x: (v.x + 1) * canvas.clientWidth / 2, y: (1 - v.y) * canvas.clientHeight / 2 }; },
        selectedRoom: function () { return selectedRoom && selectedRoom.id; },
        metrics: function () { var sorted = frames.slice().sort(function (a,b) { return a-b; }); return { frames: frames.length, medianMs: sorted[Math.floor(sorted.length / 2)] || 0, p95Ms: sorted[Math.floor(sorted.length * .95)] || 0, pixelRatio: renderer.getPixelRatio(), drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, zone: win }; },
        setCircuit: function (roomId, idx, level) { var R = ROOMS[roomId]; if (!R) return; R.levels[idx] = Math.max(0, Math.min(1, level)); applyLevels(R); },
        setVideoSource: function (roomId, n) { var R = ROOMS[roomId]; if (R) setTv(R, n); },
        setMusic: function (on) { music = !!on; }, isMusic: function () { return music; },
        setSetpoint: function (roomId, deg) { var R = ROOMS[roomId]; if (!R || !R.hvac) return; R.hvac.thermo.st.setpoint = deg; R.hvac.thermo.draw(); },
        setHeating: function (roomId, chauffe) { var R = ROOMS[roomId]; if (!R || !R.hvac) return; R.hvac.thermo.st.chauffe = !!chauffe; R.hvac.thermo.draw(); },
        shade: function (famille, cmd) { shadeCmd(selectedRoom, famille, cmd); },
        shadePos: function (famille, pos) {            // tests : place immédiatement une motorisation de la pièce active (0 ouvert .. 1 fermé)
            var o = activeRoom && activeRoom.shades && activeRoom.shades[famille]; if (!o) return;
            o.pos = o.cible = Math.max(0, Math.min(1, pos)); var sc = o.min + (1 - o.min) * o.pos;
            if (o.meshes) o.meshes.forEach(function (m) { m.scale.x = sc; }); else if (o.axis === 'z') o.mesh.scale.z = sc; else o.mesh.scale.y = sc;
            if (o.update) o.update(o, sc);
        },
        daylight: function () { return activeRoom ? daylight(activeRoom) : 1; },
        shadeScene: function (n) { shadeScene(selectedRoom, n); },
        motor: function (idx, cmd) { if (selectedRoom) shadeCmd(selectedRoom, motorFamily(selectedRoom, idx), cmd); },
        remote: function (key) {                       // télécommande de la source affichée par la TV de la pièce active
            var R = selectedRoom; if (!R || !R.tv || !R.tv.source) return;
            var st = R.tv.screen.st, cols = 5;
            if (R.tv.source !== 1) {                   // Sky Q / Swisscom / IPTV : la ligne ou la tuile en surbrillance se déplace
                var n = R.tv.source === 3 ? 8 : (R.tv.source === 2 ? 4 : 6);
                if (key === 'down' || key === 'chdn') st.row = ((st.row || 0) + 1) % n;
                else if (key === 'up' || key === 'chup') st.row = ((st.row || 0) + n - 1) % n;
                else if (key === 'left') st.row = Math.max(0, (st.row || 0) - 1);
                else if (key === 'right') st.row = Math.min(n - 1, (st.row || 0) + 1);
                R.tv.screen.draw(); return;
            }
            if (st.open !== null) { if (key === 'menu') st.open = null; }
            else if (key === 'up') st.sel = st.sel >= cols ? st.sel - cols : st.sel;
            else if (key === 'down') st.sel = st.sel + cols < APPS.length ? st.sel + cols : st.sel;
            else if (key === 'left') st.sel = st.sel % cols > 0 ? st.sel - 1 : st.sel;
            else if (key === 'right') st.sel = st.sel % cols < cols - 1 && st.sel + 1 < APPS.length ? st.sel + 1 : st.sel;
            else if (key === 'ok') { st.open = st.sel; st.tick = 0; }
            R.tv.screen.draw();
        },
        rooms: ROOMS, activeRoom: function () { return activeRoom ? activeRoom.id : null }, scene: scene, renderer: renderer,
        setWindow: function (rect) {                   // rect écran {x,y,w,h} ou null : recadre la vue courante
            var same = (!rect && !win) || (rect && win && Math.abs(rect.x - win.x) < 2 && Math.abs(rect.y - win.y) < 2 && Math.abs(rect.w - win.w) < 2 && Math.abs(rect.h - win.h) < 2);
            if (same) return;
            var wasRoom = phase === 'room'; win = rect ? { x: rect.x, y: rect.y, w: rect.w, h: rect.h } : null; overviewCache = null;
            if (phase === 'opening') return;
            if (activeRoom) { beginFocus(activeRoom); if (wasRoom) tween.dur = .6; }
            else {
                var closing = phase === 'overview-travel';
                goOverview(false, closing ? function () { phase = 'overview-closing'; fadeEnvelope(1, function () { phase = 'overview-closed'; }); } : undefined);
            }
        },
        setNames: function (map) {                     // noms des pièces (lus dans le GUI à la liaison)
            Object.keys(ROOMS).forEach(function (k) { var R = ROOMS[k], n = map && map[k]; if (!n || R.cfg.nom === n) return; R.cfg.nom = n; var old = R.label; R.label = makeLabel(n); R.label.position.copy(old.position); R.label.material.opacity = old.material.opacity; R.group.remove(old); old.material.map.dispose(); old.material.dispose(); R.group.add(R.label); });
        },
        jump: function () {                            // tests : termine immédiatement les mouvements de caméra en attente
            for (var i = 0; i < 8 && (tween || shellTween); i++) {
                if (shellTween) finishEnvelope();
                if (tween) { camState.pos.copy(tween.p1); camState.tgt.copy(tween.t1); var d = tween.onDone; tween = null; if (d) d(); }
            }
        }
    };
    function unbind() { cleanups.splice(0).reverse().forEach(function (f) { try { f(); } catch { /* An iframe can be gone before its subscriptions. */ } }); boundWin = null; boundDocument = null; attaching = null; }
    API.dispose = function () {
        running = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers.clear(); unbind();
        document.removeEventListener('visibilitychange', onVisibility);
        var geos = new Set(), mats = new Set(), maps = new Set();
        [scene, sceneR].forEach(function (s) { s.traverse(function (o) { if (o.geometry) geos.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { mats.add(m); Object.values(m).forEach(function (v) { if (v && v.isTexture) maps.add(v); }); }); }); });
        geos.forEach(function (g) { g.dispose(); }); maps.forEach(function (t) { t.dispose(); }); mats.forEach(function (m) { m.dispose(); });
        interiors.dispose(); if (sun.shadow.map) sun.shadow.map.dispose(); renderer.dispose();
    };

    /* ---------- Liaison aux joins (feedbacks CrComLib) ---------- */
    var REMOTE = { 211: 'up', 212: 'down', 213: 'left', 214: 'right', 215: 'ok', 216: 'menu',
        500: 'up', 501: 'down', 502: 'left', 503: 'right', 504: 'ok', 515: 'chup', 516: 'chdn',          // Sky Q
        530: 'up', 531: 'down', 532: 'left', 533: 'right', 534: 'ok', 545: 'chup', 546: 'chdn',          // IPTV
        574: 'up', 575: 'down', 576: 'left', 577: 'right', 578: 'ok', 582: 'chup', 583: 'chdn' };        // Swisscom
    // Motorisations : joins globaux 61-69 (famille x up/stop/down), scènes 201-204, moteurs 81-98 (triplets)
    var SHADE_JOINS = {}; ['volet', 'rideau', 'store'].forEach(function (f, i) { ['up', 'stop', 'down'].forEach(function (c, k) { SHADE_JOINS[61 + i * 3 + k] = [f, c]; }); });
    function onJoinPress(id) {
        id = parseInt(id, 10);
        if (SHADE_JOINS[id]) { shadeCmd(selectedRoom, SHADE_JOINS[id][0], SHADE_JOINS[id][1]); return true; }
        if (id >= 201 && id <= 204) { shadeScene(selectedRoom, id - 200); return true; }
        if (id >= 81 && id <= 98) { var m = Math.floor((id - 81) / 3) + 1, c = ['up', 'stop', 'down'][(id - 81) % 3]; if (selectedRoom) shadeCmd(selectedRoom, motorFamily(selectedRoom, m), c); return true; }
        return false;
    }
    var boundWin = null;
    function bind(win) {
        if (!running) return false;
        var CrComLib = win && win.CrComLib;
        if (!CrComLib || typeof CrComLib.subscribeState !== 'function') return false;
        if (win === boundWin && win.document === boundDocument) return true;
        unbind();
        vc = win.villaConfigEmbedded || win.villaConfig || vc;
        boundWin = win; boundDocument = win.document;
        function subscribe(type, join, callback) {
            var id = CrComLib.subscribeState(type, join, function (v) { if (running && win === boundWin) callback(v); });
            cleanups.push(function () { if (CrComLib.unsubscribeState) CrComLib.unsubscribeState(type, join, id); });
        }
        var names = {}; (vc.pieces || []).forEach(function (p) { if (p && p.id && p.nom) names[p.id] = p.nom; }); API.setNames(names);
        var cur = function () { return selectedRoom ? selectedRoom.id : null; };
        function refreshRoomFeedback(id) {
            // Identical analog values are not re-emitted when changing rooms.
            // Read the completed showcase snapshot after publishRoom returns.
            later(function () {
                var V = win.Villa, R = ROOMS[id];
                if (!R || cur() !== Number(id) || win !== boundWin || !V || typeof V.get !== 'function') return;
                R.sceneOff = V.get('b', '51') === true;
                for (var i = 0; i < 2; i++) { var value = V.get('n', String(71 + i)); if (value !== undefined) R.levels[i] = Math.max(0, Math.min(1, Number(value) / 65535)); }
                applyLevels(R);
            }, 0);
        }
        subscribe('n', '10', function (v) { if (v >= 1) { setRoom(v); refreshRoomFeedback(v); } });
        subscribe('b', '51', function (v) { var R = ROOMS[cur()]; if (R) { R.sceneOff = !!v; applyLevels(R); } });
        for (var i = 0; i < 10; i++) (function (i) { subscribe('n', String(71 + i), function (v) { var id = cur(); if (id && i < 2) API.setCircuit(id, i, Number(v) / 65535); }); })(i);
        for (var s = 1; s <= 4; s++) (function (s) { subscribe('b', String(150 + s), function (v) { var id = cur(); if (!id) return; if (v) API.setVideoSource(id, s); else if (ROOMS[id].tv && ROOMS[id].tv.source === s) API.setVideoSource(id, 0); }); })(s);
        subscribe('b', '150', function (v) { var id = cur(); if (v && id) API.setVideoSource(id, 0); });
        subscribe('b', '200', function (v) { var id = cur(); if (v && id) { API.setVideoSource(id, 0); music = false; } });
        subscribe('b', '155', function (v) { music = !!v; });
        subscribe('n', '31', function (v) { var id = cur(); if (id && v > 0) API.setSetpoint(id, Number(v) / 10); });
        subscribe('s', '33', function (v) { var id = cur(); if (id) API.setHeating(id, String(v).toUpperCase().indexOf('CHAUFF') === 0); });
        // Télécommande Apple TV : on observe les appuis émis par la GUI (pont CH5), pas un feedback
        var last = {};
        function onPress(id) { var now = Date.now(); if (last[id] && now - last[id] < 120) return; last[id] = now; if (onJoinPress(id)) return; var k = REMOTE[id]; if (k) API.remote(k); }
        try {
            var P = CrComLib.Ch5SignalBridge && CrComLib.Ch5SignalBridge.prototype;
            if (P) {
                var _obj = P.sendObjectToNative, _bool = P.sendBooleanToNative;
                P.sendObjectToNative = function (id, value) { if (value && value.repeatdigital) onPress(String(id)); return _obj ? _obj.apply(this, arguments) : undefined; };
                P.sendBooleanToNative = function (id, value) { if (value === true) onPress(String(id)); return _bool ? _bool.apply(this, arguments) : undefined; };
                var ownObj = P.sendObjectToNative, ownBool = P.sendBooleanToNative;
                cleanups.push(function () { if (P.sendObjectToNative === ownObj) P.sendObjectToNative = _obj; if (P.sendBooleanToNative === ownBool) P.sendBooleanToNative = _bool; });
            }
        } catch (e) { /* pont indisponible : la télécommande ne pilote pas la TV 3D */ }
        Object.keys(REMOTE).concat(Object.keys(SHADE_JOINS), ['201', '202', '203', '204']).forEach(function (j) { subscribe('b', String(j), function (v) { if (v) onPress(j); }); });
        for (var mj = 81; mj <= 98; mj++) (function (j) { subscribe('b', String(j), function (v) { if (v) onPress(j); }); })(mj);
        // Motorisations : le GUI passe par window.animateGroupBlinds(famille, cmd) (onglet Stores et
        // presets « Tout ouvrir / Demi-ouverture / Tout fermer » de la fenêtre Stores, sans join) : on l'enveloppe.
        (function wrapBlinds(tries) {
            var f = win.animateGroupBlinds;
            if (typeof f !== 'function') { if (tries < 40 && boundWin === win) later(function () { wrapBlinds(tries + 1); }, 250); return; }
            if (f.__p3d) return;
            var w = function (famille, cmd) {
                var fam = { volets: 'volet', rideaux: 'rideau', stores: 'store' }[String(famille)] || String(famille);
                var c = String(cmd);
                var r = f.apply(this, arguments);      // d'abord le GUI (il pulse aussi un join, traité par onJoinPress)
                if (selectedRoom && selectedRoom.shades && selectedRoom.shades[fam]) {
                    if (c === 'half') selectedRoom.shades[fam].cible = 0.5;
                    else shadeCmd(selectedRoom, fam, c === 'open' ? 'up' : (c === 'close' ? 'down' : c));
                }
                return r;
            };
            w.__p3d = true; win.animateGroupBlinds = w;
            cleanups.push(function () { if (win.animateGroupBlinds === w) win.animateGroupBlinds = f; });
        })(0);
        // Voie sûre, indépendante du pont : le clic sur le <ch5-button data-join="21x"> lui-même
        var doc = win.document;
        function onClick(e) {
            var t = e.target && e.target.closest ? e.target.closest('ch5-button[data-join]') : null;
            if (t) onPress(String(t.getAttribute('data-join')));
        }
        doc.addEventListener('click', onClick, true); cleanups.push(function () { doc.removeEventListener('click', onClick, true); });
        return true;
    }
    // Liaison au GUI : la fenetre de l'iframe (meme origine). Re-appelable a chaque rechargement de l'iframe.
    API.attach = function (win) {
        if (!win || !running || (win === boundWin && win.document === boundDocument)) return true;
        if (attaching === win) return false;
        if (bind(win)) return true;
        attaching = win;
        var tries = 0; (function tryBind() { if (bind(win)) return; if (++tries < 60) later(tryBind, 250); else attaching = null; })();
        return false;
    };
    function onVisibility() { if (!document.hidden) { lastFrame = 0; clock.getDelta(); } }
    document.addEventListener('visibilitychange', onVisibility);
    return API;
}
