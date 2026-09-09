import React from "react";
import { useViewportMetrics } from "../hooks/useViewportMetrics";

// Bandeau de mesures en mode Dev (overlay = superposé à la barre des projets,
// sans prendre de place dans la mise en page) :
// taille de la fenêtre, de l'écran, zone disponible (stage) et échelle
// effectivement appliquée au châssis.
export const DevMetrics = ({ device, stage, scale, fitScale, mode, realSizeAvailable, overlay = false }) => {
  const m = useViewportMetrics();
  const pct = Math.round(scale * 100);
  const chassisOnScreenW = Math.round(device.chassisW * scale);
  const chassisOnScreenH = Math.round(device.chassisH * scale);
  return (
    <div className={`dev-metrics ${overlay ? "dev-metrics--overlay" : ""}`} role="status">
      <span className="dev-metrics-item">
        <b>Fenêtre</b> {m.windowW} × {m.windowH} px
      </span>
      <span className="dev-metrics-item">
        <b>Écran</b> {m.screenW} × {m.screenH} px · ×{m.dpr}
      </span>
      <span className="dev-metrics-item">
        <b>Zone châssis</b> {Math.round(stage.width)} × {Math.round(stage.height)} px
      </span>
      <span className="dev-metrics-item">
        <b>Mode</b> {mode === "real" ? "taille réelle" : "responsive"} · fit {Math.round((fitScale || 0) * 100)} % · réel {realSizeAvailable ? "possible" : "impossible"}
      </span>
      <span className="dev-metrics-item">
        <b>{device.label}</b> {device.chassisW} × {device.chassisH} → {pct} % ({chassisOnScreenW} × {chassisOnScreenH} px)
      </span>
    </div>
  );
};
