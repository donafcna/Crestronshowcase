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

export function createPlan3D(opts) {
    'use strict';
    opts = opts || {};
    var cfg = opts.config || {};
    var canvas = opts.canvas;
    if (!canvas) throw new Error('Plan3D : toile manquante');
    var vc = { pieces: [] };                // configuration du GUI (moteurs), lue a attach()

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
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1020, 90, 260);
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);

    var hemi = new THREE.HemisphereLight(0xe6eeff, 0x3a3326, 1.25); scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xfff1dc, 2.0); sun.position.set(18, 30, 10); scene.add(sun);
    var fill = new THREE.DirectionalLight(0x9fb8ff, 0.6); fill.position.set(-20, 12, -14); scene.add(fill);
    // Deux lampes réelles : celles de la pièce zoomée (les autres pièces n'ont que des matériaux émissifs)
    var roomLights = [new THREE.PointLight(0xffd9a3, 0, 14, 2), new THREE.PointLight(0xffe6c4, 0, 10, 2)];
    roomLights.forEach(function (l) { scene.add(l); });

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
        verre: new THREE.MeshStandardMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.35, roughness: 0.1 }),
        ecranOff: new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.25, metalness: 0.4 })
    };

    function box(w, h, d, mat, x, y, z, parent) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
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

    /* ---------- Écran de télévision : texture canvas par source ---------- */
    var APPS = ['Apple TV+', 'Netflix', 'Musique', 'Photos', 'YouTube', 'Disney+', 'Arte', 'Plans', 'Podcasts', 'Réglages'];
    var APP_COLORS = ['#1c1c1e', '#b0060f', '#fa2d48', '#f5a623', '#e02020', '#0b2a6b', '#e85d04', '#34c759', '#b150e2', '#8e8e93'];
    function makeScreen() {
        var c = document.createElement('canvas'); c.width = 640; c.height = 360;
        var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        var st = { source: 0, sel: 0, open: null, tick: 0, row: 0 };
        function draw() {
            var g = c.getContext('2d'), W = c.width, H = c.height;
            g.clearRect(0, 0, W, H);
            if (st.source === 0) { g.fillStyle = '#06070a'; g.fillRect(0, 0, W, H); tex.needsUpdate = true; return; }
            if (st.source === 1) {                       // Apple TV : grille d'apps
                var grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#2b2f3a'); grd.addColorStop(1, '#0d0f14');
                g.fillStyle = grd; g.fillRect(0, 0, W, H);
                if (st.open !== null) {
                    g.fillStyle = APP_COLORS[st.open]; g.fillRect(0, 0, W, H);
                    g.fillStyle = 'rgba(255,255,255,0.92)'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
                    g.fillText(APPS[st.open], W / 2, H / 2 - 6);
                    g.font = '22px Arial'; g.fillText('Lecture en cours', W / 2, H / 2 + 36);
                    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(80, H - 40, W - 160, 6);
                    g.fillStyle = '#fff'; g.fillRect(80, H - 40, ((st.tick * 7) % (W - 160)), 6);
                } else {
                    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(24, 22, W - 48, 118);
                    g.fillStyle = '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'left';
                    g.fillText('Villa Crans-Montana', 44, 70); g.font = '18px Arial'; g.fillStyle = '#cbd5e1';
                    g.fillText('À la une — Apple TV', 44, 104);
                    var cols = 5, tw = 104, th = 64, gap = 14, x0 = (W - (cols * tw + (cols - 1) * gap)) / 2, y0 = 168;
                    for (var i = 0; i < APPS.length; i++) {
                        var cx = x0 + (i % cols) * (tw + gap), cy = y0 + Math.floor(i / cols) * (th + gap);
                        var s = (i === st.sel) ? 1.12 : 1, w = tw * s, h = th * s, ox = cx - (w - tw) / 2, oy = cy - (h - th) / 2;
                        g.fillStyle = APP_COLORS[i]; roundRect(g, ox, oy, w, h, 10); g.fill();
                        if (i === st.sel) { g.lineWidth = 4; g.strokeStyle = '#fff'; roundRect(g, ox - 3, oy - 3, w + 6, h + 6, 12); g.stroke(); }
                        g.fillStyle = '#fff'; g.font = (i === st.sel ? 'bold 16px' : '14px') + ' Arial'; g.textAlign = 'center';
                        g.fillText(APPS[i], cx + tw / 2, cy + th / 2 + 5);
                    }
                }
            } else if (st.source === 2) {                // Sky Q
                g.fillStyle = '#0a1a3a'; g.fillRect(0, 0, W, H);
                g.fillStyle = '#ffffff'; g.font = 'bold 34px Arial'; g.textAlign = 'left'; g.fillText('sky', 36, 60);
                g.font = '18px Arial'; g.fillStyle = '#9fb4d8'; g.fillText('Sky Q — Chaîne 101 · Sky Sports', 36, 92);
                for (var r = 0; r < 4; r++) { g.fillStyle = r === (st.row || 0) ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'; g.fillRect(36, 122 + r * 52, W - 72, 42); }
            } else if (st.source === 3) {                // Swisscom TV
                g.fillStyle = '#0d1f45'; g.fillRect(0, 0, W, H);
                g.fillStyle = '#ffffff'; g.font = 'bold 26px Arial'; g.textAlign = 'left'; g.fillText('Swisscom blue TV', 36, 56);
                for (var k = 0; k < 8; k++) { g.fillStyle = k === (st.row || 0) ? '#2f7cf6' : 'rgba(255,255,255,0.12)'; roundRect(g, 36 + (k % 4) * 146, 90 + Math.floor(k / 4) * 120, 130, 100, 8); g.fill(); }
            } else if (st.source === 4) {                // IPTV
                g.fillStyle = '#101418'; g.fillRect(0, 0, W, H);
                g.fillStyle = '#e5e7eb'; g.font = 'bold 26px Arial'; g.textAlign = 'left'; g.fillText('IPTV — Liste des chaînes', 36, 56);
                for (var q = 0; q < 6; q++) { g.fillStyle = q === (st.row || 0) ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'; g.fillRect(36, 82 + q * 44, W - 72, 36); }
            }
            g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, 0, W, H / 3);   // reflet léger
            tex.needsUpdate = true;
        }
        draw();
        return { tex: tex, st: st, draw: draw };
    }

    /* ---------- Thermostat : texture canvas ---------- */
    function makeThermo() {
        var c = document.createElement('canvas'); c.width = 128; c.height = 128;
        var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        var st = { setpoint: 21.0, chauffe: true };
        function draw() {
            var g = c.getContext('2d');
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
        scene.add(g);
        var w = p.w, d = p.d, ext = p.type === 'terrasse' || p.type === 'piscine';
        var R = { id: p.id, cfg: p, group: g, lamps: [], glow: [], levels: [0.9, 0.6], tv: null, speakers: [], hvac: null, thermo: null, y0: y0, ext: ext };

        // Sol, dalle et murs du fond (nord = -z, ouest = -x) : écorché ouvert vers la caméra (+x, +z)
        box(w, 0.25, d, M.dalle, w / 2, -0.125, d / 2, g);
        box(w - 0.1, 0.02, d - 0.1, ext ? (p.type === 'terrasse' ? M.gazon : M.solExt) : (p.type === 'chambre' || p.type === 'suite' ? M.solChambre : M.sol), w / 2, 0.01, d / 2, g);
        if (!ext) {
            var wallH = NIVEAU_H;
            box(w, wallH, 0.15, p.type === 'cinema' ? M.murSombre : M.mur, w / 2, wallH / 2, 0.075, g);          // mur nord
            box(0.15, wallH, d, p.type === 'cinema' ? M.murSombre : M.mur, 0.075, wallH / 2, d / 2, g);          // mur ouest
            // fenêtre sur le mur nord
            // Fenêtre à gauche du mur nord (la TV occupe le centre / la droite), sauf bureau (TV à gauche)
            var fw = Math.min(1.8, w * 0.32), fx = p.type === 'bureau' ? w * 0.75 : w * 0.2;
            box(fw, 1.3, 0.06, M.verre, fx, 1.7, 0.12, g);
            // Motorisations sur la fenêtre : volet roulant extérieur (derrière la vitre), store intérieur, rideaux.
            // Chaque élément est un pavé dont l'échelle suit sa position 0 (ouvert) .. 1 (fermé).
            var volet = box(fw + 0.1, 1.4, 0.05, new THREE.MeshStandardMaterial({ color: 0x8c8f96, roughness: 0.7, metalness: 0.3 }), fx, 2.35, 0.02, g); volet.geometry.translate(0, -0.7, 0); volet.position.y = 2.35; volet.scale.y = 0.02;
            var store = box(fw - 0.05, 1.35, 0.03, new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 1 }), fx, 2.35, 0.2, g); store.geometry.translate(0, -0.675, 0); store.position.y = 2.35; store.scale.y = 0.02;
            var rMat = new THREE.MeshStandardMaterial({ color: 0xb8c4d6, roughness: 1 });
            var rg = box(fw / 2 + 0.2, 2.2, 0.08, rMat, fx - fw / 2 - 0.15, 1.35, 0.3, g); rg.geometry.translate((fw / 2 + 0.2) / 2, 0, 0); rg.scale.x = 0.18;
            var rd = box(fw / 2 + 0.2, 2.2, 0.08, rMat, fx + fw / 2 + 0.15, 1.35, 0.3, g); rd.geometry.translate(-(fw / 2 + 0.2) / 2, 0, 0); rd.scale.x = 0.18;
            cyl(0.03, fw + 0.6, M.metal, fx, 2.5, 0.3, g).rotation.z = Math.PI / 2;
            R.shades = { volet: { mesh: volet, pos: 0, cible: 0, min: 0.02 }, store: { mesh: store, pos: 0, cible: 0, min: 0.02 }, rideau: { meshes: [rg, rd], pos: 0, cible: 0, min: 0.18 } };
        } else {
            box(w, 0.9, 0.12, M.verre, w / 2, 0.45, 0.06, g);   // garde-corps vitré
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
                box(w, 0.08, d, M.bois, w / 2, 2.6, d / 2, g);
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
            var l1 = sph(0.14, lampMat1, w / 2, NIVEAU_H - 0.2, d / 2, g); cyl(0.05, 0.2, M.metal, w / 2, NIVEAU_H - 0.05, d / 2, g);
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
            box(sw + 0.08, shh + 0.08, 0.05, M.noir, tvPos.x, tvPos.y, tvPos.z, g);
            var scr = makeScreen();
            var scrMat = new THREE.MeshBasicMaterial({ map: scr.tex });
            var scrMesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, shh), M.ecranOff); scrMesh.position.set(tvPos.x, tvPos.y, tvPos.z + 0.03); g.add(scrMesh);
            var tvLight = new THREE.PointLight(0x9db8ff, 0, 5, 2); tvLight.position.set(tvPos.x, tvPos.y, tvPos.z + 0.8); g.add(tvLight);
            R.tv = { mesh: scrMesh, on: scrMat, off: M.ecranOff, screen: scr, light: tvLight, source: 0 };
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
        R.label = makeLabel(p.nom || ('Pièce ' + p.id)); R.label.position.set(w / 2, NIVEAU_H + 0.35, d / 2); g.add(R.label);
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
        ['volet', 'store', 'rideau'].forEach(function (k) {
            var o = sh[k]; if (o.pos === o.cible) return;
            var step = dt / 4; o.pos = o.pos < o.cible ? Math.min(o.cible, o.pos + step) : Math.max(o.cible, o.pos - step);
            var sc = o.min + (1 - o.min) * o.pos;
            if (o.meshes) o.meshes.forEach(function (m) { m.scale.x = sc; }); else o.mesh.scale.y = sc;
        });
    }
    var FAMILLES = { volet: 'volet', rideau: 'rideau', store: 'store' };
    function shadeCmd(R, famille, cmd) {           // cmd : 'up' (ouvrir) / 'stop' / 'down' (fermer)
        if (!R || !R.shades || !R.shades[famille]) return;
        var o = R.shades[famille];
        if (cmd === 'stop') o.cible = o.pos; else o.cible = (cmd === 'down') ? 1 : 0;
    }
    function shadeScene(R, n) {                     // scènes 201-204 : Tout ouvrir / Position été / Position hiver / Tout fermer
        if (!R || !R.shades) return;
        var t = [{ volet: 0, rideau: 0, store: 0 }, { volet: 0, rideau: 0.5, store: 1 }, { volet: 1, rideau: 1, store: 0 }, { volet: 1, rideau: 1, store: 1 }][n - 1];
        if (t) Object.keys(t).forEach(function (k) { R.shades[k].cible = t[k]; });
    }
    function motorFamily(R, idx) {                  // moteur 1..6 -> famille, d'après villa_config pieces[].pilotages.moteurs.liste
        var pc = (vc.pieces || []).filter(function (p) { return p.id === R.id; })[0];
        var l = pc && pc.pilotages && pc.pilotages.moteurs && pc.pilotages.moteurs.liste;
        var t = l && l[idx - 1] && String(l[idx - 1].type || l[idx - 1].nom || '').toLowerCase();
        if (!t) return ['volet', 'volet', 'rideau', 'rideau', 'store', 'store'][idx - 1];
        return t.indexOf('rideau') >= 0 ? 'rideau' : (t.indexOf('store') >= 0 ? 'store' : 'volet');
    }

    /* ---------- Application des états ---------- */
    function applyLevels(R) {
        R.lamps.forEach(function (l, i) {
            var v = R.levels[l.sousMarin ? 0 : i] !== undefined ? R.levels[l.sousMarin ? 0 : i] : R.levels[0];
            if (l.sousMarin) { l.mat.emissiveIntensity = 0.1 + v * 2.2; return; }   // projecteurs de piscine : circuit 1
            l.mat.emissiveIntensity = 0.05 + v * 1.6; l.mat.color.setHex(v > 0.05 ? 0xfff4dc : 0x9a948c);
        });
        R.glow.forEach(function (gm, i) { gm.material.opacity = 0.02 + (R.levels[i] || R.levels[0]) * 0.3; });
    }
    function setTv(R, src) {
        if (!R.tv) return;
        R.tv.source = src; R.tv.screen.st.source = src; R.tv.screen.st.open = null; R.tv.screen.draw();
        R.tv.mesh.material = src > 0 ? R.tv.on : R.tv.off;
    }

    var activeRoom = null, tween = null, idle = 0, music = false;
    // Fenêtre de la carte Sources (rect écran) : la caméra y centre la pièce et l'y fait tenir
    var win = null;
    function fitFactor() {
        if (!win) return 1;
        var W = canvas.clientWidth || window.innerWidth, H = canvas.clientHeight || window.innerHeight;
        return Math.max(1, H / win.h, (W / win.w) * 0.8);
    }
    function applyViewOffset() {
        var W = canvas.clientWidth || window.innerWidth, H = canvas.clientHeight || window.innerHeight;
        if (!win || !activeRoom) { if (camera.view && camera.view.enabled) camera.clearViewOffset(); return; }   // vue villa : pleine page
        camera.setViewOffset(W, H, W / 2 - (win.x + win.w / 2), H / 2 - (win.y + win.h / 2), W, H);
    }
    var camState = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), basePos: new THREE.Vector3(), baseTgt: new THREE.Vector3() };
    function villaBounds() {
        var b = new THREE.Box3(); Object.keys(ROOMS).forEach(function (k) { b.expandByObject(ROOMS[k].group); }); return b;
    }
    var overviewCache = null;
    function overviewPose() {
        if (overviewCache) return overviewCache;
        var b = villaBounds(), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
        var dist = (Math.max(s.x, s.z * 1.3, s.y * 1.1) * 1.12 + 4) * (cfg.villaFit || 1);   // vue villa : pleine page, jamais la fenêtre
        overviewCache = { pos: new THREE.Vector3(c.x + dist * 0.55, c.y + dist * 0.68, c.z + dist * 0.8), tgt: new THREE.Vector3(c.x, c.y + s.y * 0.06, c.z) };
        return overviewCache;
    }
    function goOverview(immediate) { var o = overviewPose(); flyTo(o.pos.clone(), o.tgt.clone(), immediate); }
    function goRoom(R, immediate) { var o = roomPose(R); flyTo(o.pos, o.tgt, immediate); }
    var queue = [];
    function flyTo(pos, tgt, immediate, dur, onDone) {
        if (immediate) { camState.basePos.copy(pos); camState.baseTgt.copy(tgt); camState.pos.copy(pos); camState.tgt.copy(tgt); tween = null; queue = []; return; }
        if (tween) { queue.push({ pos: pos, tgt: tgt, dur: dur, onDone: onDone }); return; }
        tween = { p0: camState.pos.clone(), t0: camState.tgt.clone(), p1: pos, t1: tgt, t: 0, dur: dur || 1.1, onDone: onDone };
        camState.basePos.copy(pos); camState.baseTgt.copy(tgt);
    }
    function nextTween() {
        var n = queue.shift(); if (n) flyTo(n.pos, n.tgt, false, n.dur, n.onDone);
    }
    // Vue pièce : seules la pièce active, les extérieurs et le décor restent visibles (écorché lisible)
    function showOnly(R) {
        Object.keys(ROOMS).forEach(function (k) { var o = ROOMS[k]; o.group.visible = !R || o === R || o.ext; });
    }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    var firstRoom = true;
    function setRoom(id) {
        id = parseInt(id, 10); var R = ROOMS[id]; if (!R) return;
        if (activeRoom === R) return;
        var prev = activeRoom; activeRoom = R;
        Object.keys(ROOMS).forEach(function (k) { ROOMS[k].label.material.opacity = ROOMS[k] === R ? 1 : 0.55; });
        queue = [];
        if (prev || firstRoom) {                       // on repasse par la villa entière, puis on zoome
            showOnly(null);
            var o = overviewPose(), hold = firstRoom ? 2.4 : 1.0; firstRoom = false;
            flyTo(o.pos.clone(), o.tgt.clone(), false, hold, function () { showOnly(R); });
            goRoomQueued(R);
        } else { showOnly(R); goRoom(R); }
    }
    function roomPose(R) { var p = R.cfg, w = p.w, d = p.d; var tgt = new THREE.Vector3(p.x + w * 0.5, R.y0 + 1.2, p.z + d * 0.42); var dist = (Math.max(w, d) * 0.85 + 1.0) * fitFactor(); return { pos: new THREE.Vector3(tgt.x + dist * 0.45, R.y0 + 1.2 + dist * 0.42, tgt.z + dist * 0.98), tgt: tgt }; }
    function goRoomQueued(R) { var o = roomPose(R); flyTo(o.pos, o.tgt, false, 1.3); }

    /* ---------- Boucle ---------- */
    function resize() {
        var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
            renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        }
    }
    var lastFrame = 0, running = true;
    function loop(ts) {
        if (!running) return;
        requestAnimationFrame(loop);
        if (document.hidden) return;
        if (ts - lastFrame < 1000 / (cfg.fpsMax || 60)) return; lastFrame = ts;
        var dt = Math.min(0.25, clock.getDelta()); idle += dt;
        resize();
        if (tween) {
            tween.t += dt / tween.dur; var k = ease(Math.min(1, tween.t));
            camState.pos.lerpVectors(tween.p0, tween.p1, k); camState.tgt.lerpVectors(tween.t0, tween.t1, k);
            if (tween.t >= 1) { var done = tween.onDone; tween = null; if (done) done(); nextTween(); }
        }
        // léger mouvement de vie autour de la position de base
        var sway = tween ? 0 : 1;
        camera.position.set(camState.pos.x + Math.sin(idle * 0.25) * 0.35 * sway, camState.pos.y + Math.sin(idle * 0.18) * 0.15 * sway, camState.pos.z + Math.cos(idle * 0.22) * 0.35 * sway);
        camera.lookAt(camState.tgt); applyViewOffset();
        // lampes réelles sur la pièce active
        if (activeRoom) {
            activeRoom.lamps.forEach(function (l, i) { if (i < 2) { var wp = l.pos.clone().applyMatrix4(activeRoom.group.matrixWorld); roomLights[i].position.copy(wp); roomLights[i].intensity = (activeRoom.levels[i] || 0) * (i === 0 ? 55 : 30) * (l.sousMarin ? 0.3 : 1); } });
            if (activeRoom.tv) activeRoom.tv.light.intensity = activeRoom.tv.source > 0 ? 6 + Math.sin(idle * 9) * 1.5 : 0;
            if (activeRoom.tv && activeRoom.tv.source === 1 && activeRoom.tv.screen.st.open !== null) { activeRoom.tv.screen.st.tick++; if (activeRoom.tv.screen.st.tick % 10 === 0) activeRoom.tv.screen.draw(); }
            activeRoom.speakers.forEach(function (s) {
                var on = music; var pulse = on ? 1 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.06 : 1;
                s.body.scale.set(pulse, 1, pulse); s.ring.material.opacity = on ? 0.35 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.5 : 0;
                s.ring.scale.setScalar(on ? 1 + Math.abs(Math.sin(idle * 6 + s.phase)) * 0.6 : 1);
            });
            if (activeRoom.shades) animateShades(activeRoom, dt);
            if (activeRoom.eau) { var em = activeRoom.eau.material; em.emissiveIntensity = 0.45 + Math.sin(idle * 1.3) * 0.15 + (activeRoom.levels[0] || 0) * 0.5; activeRoom.eau.position.y = 0.05 + Math.sin(idle * 0.9) * 0.012; em.color.setHex((activeRoom.levels[0] || 0) > 0.3 ? 0x5fc8f0 : 0x3fa7d6); }
            if (activeRoom.hvac) { activeRoom.hvac.flap.rotation.x = 0.5 + Math.sin(idle * 1.5) * 0.25; activeRoom.hvac.breeze.material.opacity = 0.08 + Math.abs(Math.sin(idle * 1.5)) * 0.1; activeRoom.hvac.breeze.material.color.setHex(activeRoom.hvac.thermo.st.chauffe ? 0xffc27a : 0x9fd8ff); }
        }
        renderer.render(scene, camera);
    }

    /* ---------- Sol et décor ---------- */
    function buildGround() {
        var b = villaBounds(); var c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
        var ground = new THREE.Mesh(new THREE.CircleGeometry(Math.max(s.x, s.z) * 1.6, 48), new THREE.MeshStandardMaterial({ color: 0x3f5a44, roughness: 1 }));
        ground.rotation.x = -Math.PI / 2; ground.position.set(c.x, -0.6, c.z); scene.add(ground);
        // pins autour de la villa (Crans-Montana)
        for (var i = 0; i < 14; i++) {
            var a = i / 14 * Math.PI * 2 + 0.3, r = Math.max(s.x, s.z) * 0.85 + (i % 3) * 1.5;
            var x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (z > c.z + s.z * 0.55 && x > c.x - s.x * 0.2) continue; // rien devant la caméra
            cyl(0.15, 1.2, M.bois, x, 0, z); var h = 3 + (i % 4);
            for (var k = 0; k < 3; k++) { var cone = new THREE.Mesh(new THREE.ConeGeometry(1.3 - k * 0.3, h * 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x2f5e3a, roughness: 1 })); cone.position.set(x, 0.6 + k * h * 0.28 + h * 0.2, z); scene.add(cone); }
        }
        // montagnes en arrière-plan
        for (var m = 0; m < 6; m++) { var mh = 16 + (m % 3) * 6, mt = new THREE.Mesh(new THREE.ConeGeometry(14 + m * 3, mh, 5), new THREE.MeshStandardMaterial({ color: 0x4b5b7a, roughness: 1, flatShading: true })); mt.position.set(c.x - 40 + m * 16, -1, c.z - 55 + (m % 2) * 8); scene.add(mt); var neige = new THREE.Mesh(new THREE.ConeGeometry((14 + m * 3) * 0.32, mh * 0.32, 5), new THREE.MeshStandardMaterial({ color: 0xf3f6fb, roughness: 1, flatShading: true })); neige.position.set(mt.position.x, -1 + mh * 0.34, mt.position.z); scene.add(neige); }
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
    buildGround();
    goOverview(true);
    resize();
    requestAnimationFrame(loop);

    /* ---------- API publique ---------- */
    var API = {
        setRoom: setRoom,
        overview: function () { activeRoom = null; showOnly(null); goOverview(); },
        setCircuit: function (roomId, idx, level) { var R = ROOMS[roomId]; if (!R) return; R.levels[idx] = Math.max(0, Math.min(1, level)); applyLevels(R); },
        setVideoSource: function (roomId, n) { var R = ROOMS[roomId]; if (R) setTv(R, n); },
        setMusic: function (on) { music = !!on; }, isMusic: function () { return music; },
        setSetpoint: function (roomId, deg) { var R = ROOMS[roomId]; if (!R || !R.hvac) return; R.hvac.thermo.st.setpoint = deg; R.hvac.thermo.draw(); },
        setHeating: function (roomId, chauffe) { var R = ROOMS[roomId]; if (!R || !R.hvac) return; R.hvac.thermo.st.chauffe = !!chauffe; R.hvac.thermo.draw(); },
        shade: function (famille, cmd) { shadeCmd(activeRoom, famille, cmd); },
        shadeScene: function (n) { shadeScene(activeRoom, n); },
        motor: function (idx, cmd) { if (activeRoom) shadeCmd(activeRoom, motorFamily(activeRoom, idx), cmd); },
        remote: function (key) {                       // télécommande de la source affichée par la TV de la pièce active
            var R = activeRoom; if (!R || !R.tv || !R.tv.source) return;
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
            var had = !!win; win = rect ? { x: rect.x, y: rect.y, w: rect.w, h: rect.h } : null; overviewCache = null;
            if (activeRoom && !tween) { var o = roomPose(activeRoom); flyTo(o.pos, o.tgt, false, had ? 0.6 : 1.0); }
            else if (!activeRoom && !tween) goOverview();
        },
        setNames: function (map) {                     // noms des pièces (lus dans le GUI à la liaison)
            Object.keys(ROOMS).forEach(function (k) { var R = ROOMS[k], n = map && map[k]; if (!n || R.cfg.nom === n) return; R.cfg.nom = n; var old = R.label; R.label = makeLabel(n); R.label.position.copy(old.position); R.label.material.opacity = old.material.opacity; R.group.remove(old); R.group.add(R.label); });
        },
        jump: function () {                            // tests : termine immédiatement les mouvements de caméra en attente
            while (tween || queue.length) { if (!tween) nextTween(); if (tween) { camState.pos.copy(tween.p1); camState.tgt.copy(tween.t1); var d = tween.onDone; tween = null; if (d) d(); } }
        }
    };
    API.dispose = function () { running = false; try { renderer.dispose(); } catch (e) {} };

    /* ---------- Liaison aux joins (feedbacks CrComLib) ---------- */
    var REMOTE = { 211: 'up', 212: 'down', 213: 'left', 214: 'right', 215: 'ok', 216: 'menu',
        500: 'up', 501: 'down', 502: 'left', 503: 'right', 504: 'ok', 515: 'chup', 516: 'chdn',          // Sky Q
        530: 'up', 531: 'down', 532: 'left', 533: 'right', 534: 'ok', 545: 'chup', 546: 'chdn',          // IPTV
        574: 'up', 575: 'down', 576: 'left', 577: 'right', 578: 'ok', 582: 'chup', 583: 'chdn' };        // Swisscom
    // Motorisations : joins globaux 61-69 (famille x up/stop/down), scènes 201-204, moteurs 81-98 (triplets)
    var SHADE_JOINS = {}; ['volet', 'rideau', 'store'].forEach(function (f, i) { ['up', 'stop', 'down'].forEach(function (c, k) { SHADE_JOINS[61 + i * 3 + k] = [f, c]; }); });
    function onJoinPress(id) {
        id = parseInt(id, 10);
        if (SHADE_JOINS[id]) { shadeCmd(activeRoom, SHADE_JOINS[id][0], SHADE_JOINS[id][1]); return true; }
        if (id >= 201 && id <= 204) { shadeScene(activeRoom, id - 200); return true; }
        if (id >= 81 && id <= 98) { var m = Math.floor((id - 81) / 3) + 1, c = ['up', 'stop', 'down'][(id - 81) % 3]; if (activeRoom) shadeCmd(activeRoom, motorFamily(activeRoom, m), c); return true; }
        return false;
    }
    var boundWin = null;
    function bind(win) {
        var CrComLib = win && win.CrComLib;
        if (!CrComLib || typeof CrComLib.subscribeState !== 'function') return false;
        vc = win.villaConfigEmbedded || win.villaConfig || vc;
        boundWin = win;
        var names = {}; (vc.pieces || []).forEach(function (p) { if (p && p.id && p.nom) names[p.id] = p.nom; }); API.setNames(names);
        var cur = function () { return activeRoom ? activeRoom.id : null; };
        CrComLib.subscribeState('n', '10', function (v) { if (v >= 1) setRoom(v); });
        for (var i = 0; i < 10; i++) (function (i) { CrComLib.subscribeState('n', String(71 + i), function (v) { var id = cur(); if (id && i < 2) API.setCircuit(id, i, Number(v) / 65535); }); })(i);
        for (var s = 1; s <= 4; s++) (function (s) { CrComLib.subscribeState('b', String(150 + s), function (v) { var id = cur(); if (!id) return; if (v) API.setVideoSource(id, s); else if (ROOMS[id].tv && ROOMS[id].tv.source === s) API.setVideoSource(id, 0); }); })(s);
        CrComLib.subscribeState('b', '150', function (v) { var id = cur(); if (v && id) API.setVideoSource(id, 0); });
        CrComLib.subscribeState('b', '200', function (v) { var id = cur(); if (v && id) { API.setVideoSource(id, 0); music = false; } });
        CrComLib.subscribeState('b', '155', function (v) { music = !!v; });
        CrComLib.subscribeState('n', '31', function (v) { var id = cur(); if (id && v > 0) API.setSetpoint(id, Number(v) / 10); });
        CrComLib.subscribeState('s', '33', function (v) { var id = cur(); if (id) API.setHeating(id, String(v).toUpperCase().indexOf('CHAUFF') === 0); });
        // Télécommande Apple TV : on observe les appuis émis par la GUI (pont CH5), pas un feedback
        var last = {};
        function onPress(id) { var now = Date.now(); if (last[id] && now - last[id] < 120) return; last[id] = now; if (onJoinPress(id)) return; var k = REMOTE[id]; if (k) API.remote(k); }
        try {
            var P = CrComLib.Ch5SignalBridge && CrComLib.Ch5SignalBridge.prototype;
            if (P) {
                var _obj = P.sendObjectToNative, _bool = P.sendBooleanToNative;
                P.sendObjectToNative = function (id, value) { if (value && value.repeatdigital) onPress(String(id)); return _obj ? _obj.apply(this, arguments) : undefined; };
                P.sendBooleanToNative = function (id, value) { if (value === true) onPress(String(id)); return _bool ? _bool.apply(this, arguments) : undefined; };
            }
        } catch (e) { /* pont indisponible : la télécommande ne pilote pas la TV 3D */ }
        Object.keys(REMOTE).concat(Object.keys(SHADE_JOINS), ['201', '202', '203', '204']).forEach(function (j) { CrComLib.subscribeState('b', String(j), function (v) { if (v) onPress(j); }); });
        for (var mj = 81; mj <= 98; mj++) (function (j) { CrComLib.subscribeState('b', String(j), function (v) { if (v) onPress(j); }); })(mj);
        // Motorisations : le GUI passe par window.animateGroupBlinds(famille, cmd) (onglet Stores et
        // presets « Tout ouvrir / Demi-ouverture / Tout fermer » de la fenêtre Stores, sans join) : on l'enveloppe.
        (function wrapBlinds(tries) {
            var f = win.animateGroupBlinds;
            if (typeof f !== 'function') { if (tries < 40 && boundWin === win) setTimeout(function () { wrapBlinds(tries + 1); }, 250); return; }
            if (f.__p3d) return;
            var w = function (famille, cmd) {
                var fam = { volets: 'volet', rideaux: 'rideau', stores: 'store' }[String(famille)] || String(famille);
                var c = String(cmd);
                var r = f.apply(this, arguments);      // d'abord le GUI (il pulse aussi un join, traité par onJoinPress)
                if (activeRoom && activeRoom.shades && activeRoom.shades[fam]) {
                    if (c === 'half') activeRoom.shades[fam].cible = 0.5;
                    else shadeCmd(activeRoom, fam, c === 'open' ? 'up' : (c === 'close' ? 'down' : c));
                }
                return r;
            };
            w.__p3d = true; win.animateGroupBlinds = w;
        })(0);
        // Voie sûre, indépendante du pont : le clic sur le <ch5-button data-join="21x"> lui-même
        win.document.addEventListener('click', function (e) {
            var t = e.target && e.target.closest ? e.target.closest('ch5-button[data-join]') : null;
            if (t) onPress(String(t.getAttribute('data-join')));
        }, true);
        return true;
    }
    // Liaison au GUI : la fenetre de l'iframe (meme origine). Re-appelable a chaque rechargement de l'iframe.
    API.attach = function (win) {
        if (!win || win === boundWin) return true;
        if (bind(win)) return true;
        var tries = 0; (function tryBind() { if (bind(win)) return; if (++tries < 60) setTimeout(tryBind, 250); })();
        return false;
    };
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { lastFrame = 0; clock.getDelta(); } });
    return API;
}
