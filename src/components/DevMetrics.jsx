import React from "react";
import { useViewportMetrics } from "../hooks/useViewportMetrics";

// Bandeau de mesures affiché juste au-dessus du châssis en mode Dev :
// taille de la fenêtre, de l'écran, zone disponible (stage) et échelle
// effectivement appliquée au châssis.
export const DevMetrics = ({ device, stage, scale, fitScale, mode, realSizeAvailable }) => {
  const m = useViewportMetrics();
  const pct = Math.round(scale * 100);
  const chassisOnScreenW = Math.round(device.chassisW * scale);
  const chassisOnScreenH = Math.round(device.chassisH * scale);
  return (
    <div className="dev-metrics" role="status">
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
