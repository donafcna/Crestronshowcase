import { HotelBrassusBackground } from './HotelBrassusBackground';
import { RestaurantBackground } from './RestaurantBackground';
import React, { useEffect, useRef, useState } from "react";
import { BackgroundVideo } from "./BackgroundVideo";
import { LuxuryBackground } from "../ftv-luxury/LuxuryBackground";
import { LUXURY_MODELS } from "../ftv-luxury/modelProjects";
import { createVillaEntry } from '../utils/villaEntry';

import { VenueBackground } from '../venues/VenueBackground';
import { VENUE_PROJECTS } from '../venues/state';

// A deployment changes the module URL, including its dependent assets.
const PLAN3D_VERSION = "2026-09-17-journey-1";

// Fond de page 3D (Three.js) à la place de la vidéo, pour les projets qui ont un plan 3D
// (public/plan3d/<id>.json). Le GUI tourne dans son iframe et n'est pas modifié : le module
// public/plan3d/plan3d.js lit ses feedbacks à travers la fenêtre de l'iframe (même origine).
export const PLAN3D_PROJECTS = {
  "villa-gemini-frequencetv": "/plan3d/villa-crans.json",
};

// Quand la 3D remplace la vidéo : une règle par cas (support affiché + largeur de fenêtre).
// Ailleurs, la vidéo de fond reste. Cas validés par Donatien au fil des tests (16/9/2026) :
// portable 14" -> smartphone seulement. Ajouter une ligne par cas ; bornes en px, optionnelles.
export const PLAN3D_RULES = [
  { device: "phone" },                       // smartphone : toujours
];
export const plan3dEnabled = (projectId, device, windowW) =>
  !!(projectId === 'hotel-brassus' || projectId === 'sushi-bar-kyoto' || PLAN3D_PROJECTS[projectId] || LUXURY_MODELS[projectId] || VENUE_PROJECTS[projectId]) &&
  PLAN3D_RULES.some((r) => (!r.device || r.device === device) &&
    (r.minWidth === undefined || windowW >= r.minWidth) && (r.maxWidth === undefined || windowW <= r.maxWidth));

export const Plan3DBackground = (props) => props.projectId === 'hotel-brassus' ? <HotelBrassusBackground {...props} /> : props.projectId === 'sushi-bar-kyoto' ? <RestaurantBackground {...props} /> : VENUE_PROJECTS[props.projectId]
  ? <VenueBackground {...props} />
  : LUXURY_MODELS[props.projectId]
  ? <LuxuryBackground {...props} />
  : <VillaPlan3DBackground {...props} />;

// Measure the same free-space viewport for startup and subsequent navigation.
const villaViewport = (canvas, frame, stage) => {
  if (!canvas || !frame) return null;
  const c = canvas.getBoundingClientRect(), s = (frame.closest('.phone-device-frame') || frame).getBoundingClientRect();
  if (c.width < 40 || c.height < 40 || s.width < 20 || s.height < 20) return null;
  const side = stage?.querySelector('.workspace-device-sidebar');
  const limitR = side ? side.getBoundingClientRect().left - 24 : c.right - 16;
  const topEdge = Math.max(70, s.top - c.top + 8);
  const right = { x: s.right - c.left + 24, y: topEdge, w: limitR - s.right - 24, h: Math.min(c.height - topEdge - 24, s.height - 16) };
  const top = { x: 0, y: 70, w: Math.min(c.width, limitR - c.left), h: s.top - c.top - 86 };
  const zone = right.w >= 260 ? right : (top.h >= 220 ? top : null);
  const rect = zone && zone.w > 40 && zone.h > 40 ? zone : null;
  return { rect, signature: [c.width, c.height, ...(rect ? Object.values(rect) : [0, 0, 0, 0])].map(v => v.toFixed(1)).join(':') };
};

const VillaPlan3DBackground = ({ projectId, stageRef, guiFrameRef, tourSessionRef }) => {
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const entryRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // 1. Scène : chargée une fois par projet, disposée depuis le JSON
  useEffect(() => {
    let alive = true;
    setReady(false);
    const url = PLAN3D_PROJECTS[projectId];
    if (!url || !canvasRef.current) return undefined;
    (async () => {
      try {
        const [config, mod] = await Promise.all([
          fetch(`${url}?v=${PLAN3D_VERSION}`).then((r) => { if (!r.ok) throw new Error(`Plan ${r.status}`); return r.json(); }),
          import(/* @vite-ignore */ `/plan3d/plan3d.js?v=${PLAN3D_VERSION}`),
        ]);
        if (!alive) return;
        const api = mod.createPlan3D({ canvas: canvasRef.current, config, startOverview: tourSessionRef?.current.overview !== false, environmentTime: () => tourSessionRef?.current.seconds() });
        apiRef.current = api;
        const entry = createVillaEntry({
          api,
          measure: () => villaViewport(canvasRef.current, guiFrameRef?.current, stageRef?.current),
          isOverview: () => tourSessionRef?.current.overview !== false,
          onReady: () => {
            if (!alive || apiRef.current !== api) return;
            // Publish readiness only after the correctly framed image has really
            // rendered, so the tour's overview timer cannot expire during loading.
            window.__plan3d = api;
            setReady(true);
            window.dispatchEvent(new Event('plan3d-ready'));
          },
        });
        api.entry = entry;
        entryRef.current = entry;
        entry.start();
      } catch (e) {
        console.warn('[Plan3D] scène indisponible', e);
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
      entryRef.current?.dispose(); entryRef.current = null;
      if (apiRef.current) { apiRef.current.dispose(); if (window.__plan3d === apiRef.current) delete window.__plan3d; apiRef.current = null; }
    };
  }, [projectId, tourSessionRef, guiFrameRef, stageRef]);

  // 2. Liaison au GUI + cadrage. Only the initial presentation is instantaneous.
  useEffect(() => {
    const tick = () => {
      const api = apiRef.current;
      if (!api) return;
      if (!tourSessionRef?.current.overview) api.holdOverview(false);
      const frame = guiFrameRef?.current;
      const win = frame && frame.contentWindow;
      if (win) api.attach(win);
      if (entryRef.current && !entryRef.current.ready) { entryRef.current.update(); return; }
      const layout = villaViewport(canvasRef.current, frame, stageRef?.current);
      api.setWindow(layout?.rect || null);
    };
    tick();
    const id = setInterval(tick, 500);
    let lastWheel = 0, accumulated = 0, direction = 0;
    const wheel = (e) => {
      if (e.ctrlKey || e.metaKey || !apiRef.current || e.target.closest("iframe,button,a,input,select,textarea,.workspace-device-sidebar,.phone-device-frame,.projects-strip")) return;
      const sign = Math.sign(e.deltaY);
      if (!sign || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (sign !== direction) accumulated = 0;
      direction = sign;
      accumulated += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      e.preventDefault();
      if (Math.abs(accumulated) < 36 || performance.now() - lastWheel < 650) return;
      lastWheel = performance.now(); accumulated = 0;
      if (sign > 0) apiRef.current.overview(); else apiRef.current.focusSelected();
    };
    const stage = stageRef?.current;
    const click = (e) => {
      if (e.ctrlKey || e.metaKey || e.button !== 0 || e.target.closest("iframe,button,a,input,select,textarea,.workspace-device-sidebar,.phone-device-frame,.projects-strip")) return;
      const canvas = canvasRef.current;
      if (!canvas || !apiRef.current) return;
      const rect = canvas.getBoundingClientRect();
      apiRef.current.click(e.clientX - rect.left, e.clientY - rect.top);
    };
    stage?.addEventListener('wheel', wheel, { passive: false });
    stage?.addEventListener('click', click);
    window.addEventListener('resize', tick);
    window.addEventListener('plan3d-ready', tick);
    return () => { clearInterval(id); window.removeEventListener('resize', tick); window.removeEventListener('plan3d-ready', tick); stage?.removeEventListener('wheel', wheel); stage?.removeEventListener('click', click); };
  }, [projectId, stageRef, guiFrameRef, tourSessionRef]);

  if (failed) return <BackgroundVideo />;
  return (
    <div className="plan3d-bg-container villa-entry-background" data-ready={ready} aria-hidden="true">
      <canvas ref={canvasRef} className="plan3d-bg-canvas" style={{ opacity: ready ? 1 : 0 }} />
      {!ready && <span className="luxury-background-loading">Chargement de la 3D…</span>}
    </div>
  );
};
