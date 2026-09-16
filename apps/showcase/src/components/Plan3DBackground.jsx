import React, { useEffect, useRef } from "react";

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
  !!PLAN3D_PROJECTS[projectId] &&
  PLAN3D_RULES.some((r) => (!r.device || r.device === device) &&
    (r.minWidth === undefined || windowW >= r.minWidth) && (r.maxWidth === undefined || windowW <= r.maxWidth));

export const Plan3DBackground = ({ projectId, stageRef, guiFrameRef }) => {
  const canvasRef = useRef(null);
  const apiRef = useRef(null);

  // 1. Scène : chargée une fois par projet, disposée depuis le JSON
  useEffect(() => {
    let alive = true;
    const url = PLAN3D_PROJECTS[projectId];
    if (!url || !canvasRef.current) return undefined;
    (async () => {
      try {
        const [config, mod] = await Promise.all([
          fetch(url).then((r) => r.json()),
          import(/* @vite-ignore */ "/plan3d/plan3d.js"),
        ]);
        if (!alive) return;
        apiRef.current = mod.createPlan3D({ canvas: canvasRef.current, config });
        window.__plan3d = apiRef.current;   // point d'accès pour les tests Playwright et la console
      } catch (e) {
        console.warn("[Plan3D] scène indisponible", e);
      }
    })();
    return () => {
      alive = false;
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
    };
  }, [projectId]);

  // 2. Liaison au GUI (iframe rechargée à chaque pièce / support) + cadrage dans la zone libre
  useEffect(() => {
    const tick = () => {
      const api = apiRef.current;
      if (!api) return;
      const frame = guiFrameRef?.current;
      const win = frame && frame.contentWindow;
      if (win) api.attach(win);
      // Zone libre : à droite du châssis (colonne des supports), sinon au-dessus ; sinon pas de fenêtre
      const canvas = canvasRef.current;
      if (!canvas || !frame) { api.setWindow(null); return; }
      const c = canvas.getBoundingClientRect(), s = frame.getBoundingClientRect();   // emprise visible du GUI (châssis mis à l'échelle)
      // Zone libre : entre le châssis et la colonne des boutons (QR code, fiche, supports), jamais derrière elle
      const side = stageRef?.current?.querySelector(".workspace-device-sidebar");
      const limitR = side ? side.getBoundingClientRect().left - 24 : c.right - 16;
      const right = { x: s.right - c.left + 32, y: s.top - c.top, w: limitR - s.right - 32, h: s.height };
      const top = { x: 0, y: 70, w: Math.min(c.width, limitR - c.left), h: s.top - c.top - 86 };
      const zone = right.w >= 260 ? right : (top.h >= 220 ? top : null);
      api.setWindow(zone && zone.w > 40 && zone.h > 40 ? zone : null);
    };
    tick();
    const id = setInterval(tick, 1000);
    window.addEventListener("resize", tick);
    return () => { clearInterval(id); window.removeEventListener("resize", tick); };
  }, [projectId, stageRef, guiFrameRef]);

  return (
    <div className="plan3d-bg-container" aria-hidden="true">
      <canvas ref={canvasRef} className="plan3d-bg-canvas" />
    </div>
  );
};
