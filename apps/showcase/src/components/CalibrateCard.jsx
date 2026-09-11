import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";
import { useScreenCalibration, CSS_PX_PER_MM } from "../hooks/useScreenCalibration";

// Calibrage de l'écran avec une carte bancaire (format ISO/IEC 7810 ID-1 : 85,60 × 53,98 mm).
// Le visiteur pose sa carte sur l'écran et ajuste le curseur jusqu'à ce que le cadre
// coïncide ; le résultat (px CSS par mm) est mémorisé dans son navigateur et sert à
// tous les châssis « Taille réelle ».
const CARD_W = 85.6;
const CARD_H = 53.98;

export const CalibrateCard = ({ onClose }) => {
  const { t } = useTranslation();
  const { pxPerMm, calibrated, setPxPerMm, reset, min, max } = useScreenCalibration();
  const [value, setValue] = useState(pxPerMm);
  const w = CARD_W * value;
  const h = CARD_H * value;
  const step = (d) => setValue((v) => Math.min(max, Math.max(min, Math.round((v + d) * 1000) / 1000)));

  return (
    <div className="calib-backdrop" role="dialog" aria-modal="true" aria-label={t("calib_title")}>
      <div className="calib-panel">
        <h2>{t("calib_title")}</h2>
        <p>{t("calib_hint")}</p>
        <div className="calib-stage">
          <div className="calib-card" style={{ width: `${w}px`, height: `${h}px` }}>
            <span>85,6 × 54 mm</span>
          </div>
        </div>
        <div className="calib-controls">
          <button type="button" className="calib-step" onClick={() => step(-0.05)} aria-label="−">−</button>
          <input
            type="range"
            min={min}
            max={max}
            step="0.01"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            aria-label={t("calib_title")}
          />
          <button type="button" className="calib-step" onClick={() => step(0.05)} aria-label="+">+</button>
          <span className="calib-value">{value.toFixed(2)} px/mm</span>
        </div>
        <div className="calib-actions">
          <button type="button" className="btn btn-primary" onClick={() => { setPxPerMm(value); onClose(); }}>
            {t("calib_apply")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { reset(); setValue(CSS_PX_PER_MM); }}
            disabled={!calibrated && Math.abs(value - CSS_PX_PER_MM) < 0.001}
            title={t("calib_reset_hint")}
          >
            {t("calib_reset")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};
