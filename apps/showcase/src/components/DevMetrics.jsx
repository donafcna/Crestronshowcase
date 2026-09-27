import React from "react";
import { useViewportMetrics } from "../hooks/useViewportMetrics";
import { useScreenCalibration } from "../hooks/useScreenCalibration";

// Bandeau de mesures en mode Dev (overlay = superposé à la barre des projets,
// sans prendre de place dans la mise en page) :
// taille de la fenêtre, de l'écran, zone disponible (stage) et échelle
// effectivement appliquée au châssis.
// Sans châssis (page d'accueil) : seules les mesures d'écran et le calibrage s'affichent.
export const DevMetrics = ({ device, stage, scale = 1, fitScale, mode, realSizeAvailable, overlay = false, fullscreen = false, onCalibrate }) => {
  const m = useViewportMetrics();
  const { pxPerMm, calibrated } = useScreenCalibration();
  const pct = Math.round(scale * 100);
  const chassisOnScreenW = device ? Math.round(device.chassisW * scale) : 0;
  const chassisOnScreenH = device ? Math.round(device.chassisH * scale) : 0;
  return (
    <div className={`dev-metrics ${overlay ? "dev-metrics--overlay" : ""} ${fullscreen ? "dev-metrics--fs" : ""}`} role="status">
      <span className="dev-metrics-item">
        <b>Fenêtre</b> {m.windowW} × {m.windowH} px
      </span>
      <span className="dev-metrics-item">
        <b>Écran</b> {m.screenW} × {m.screenH} px · ×{m.dpr} · {pxPerMm.toFixed(2)} px/mm {calibrated ? "(calibré)" : "(96 dpi)"}
        <span className="dev-ruler" style={{ width: `${pxPerMm * 100}px` }} title="Règle de contrôle : doit mesurer 100 mm sur l'écran">
          100 mm
        </span>
        {onCalibrate && (
          <button type="button" className="dev-metrics-btn" onClick={onCalibrate}>
            Calibrer
          </button>
        )}
      </span>
      {stage && (
        <span className="dev-metrics-item">
          <b>Zone châssis</b> {Math.round(stage.width)} × {Math.round(stage.height)} px
        </span>
      )}
      {mode && (
        <span className="dev-metrics-item">
          <b>Mode</b> {mode === "real" ? "taille réelle" : "responsive"} · fit {Math.round((fitScale || 0) * 100)} % · réel {realSizeAvailable ? "possible" : "impossible"}
        </span>
      )}
      {device && (
        <span className="dev-metrics-item">
          <b>{device.label}</b> {device.chassisW} × {device.chassisH} → {pct} % ({chassisOnScreenW} × {chassisOnScreenH} px)
        </span>
      )}
    </div>
  );
};
