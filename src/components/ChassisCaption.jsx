import React from "react";
import { useTranslation } from "../context/LanguageContext";

// Légende sous le châssis : support, taille de conception, échelle appliquée,
// et sélecteur « Taille réelle / Responsive ». « Taille réelle » n'est
// proposée que si la fenêtre le permet (voir scaleRules.js).
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

export const ChassisCaption = ({
  device,
  scale,
  mode,
  requestedMode,
  realSizeAvailable,
  tooSmall,
  onChangeMode,
}) => {
  const { t } = useTranslation();
  const pct = Math.round(scale * 100);

  let status;
  if (mode === "real") status = t("scale_caption_real");
  else if (tooSmall) status = fill(t("scale_caption_too_small"), { pct });
  else if (scale > 1.005) status = fill(t("scale_caption_enlarged"), { pct });
  else if (scale < 0.995) status = fill(t("scale_caption_reduced"), { pct });
  else status = t("scale_caption_real");

  const realSelected = requestedMode === "real" && realSizeAvailable;

  return (
    <div className={`chassis-caption ${tooSmall ? "is-warning" : ""}`}>
      <p className="chassis-caption-text">
        <strong>{device.label}</strong>
        <span className="chassis-caption-sep">·</span>
        {fill(t("scale_caption_size"), { w: device.chassisW, h: device.chassisH })}
        <span className="chassis-caption-sep">·</span>
        {status}
      </p>
      <div className="chassis-scale-toggle" role="group" aria-label="Scale mode">
        <button
          type="button"
          className={`chassis-scale-btn ${realSelected ? "active" : ""}`}
          onClick={() => onChangeMode("real")}
          disabled={!realSizeAvailable}
          title={realSizeAvailable ? t("scale_real") : t("scale_real_unavailable")}
        >
          {t("scale_real")}
        </button>
        <button
          type="button"
          className={`chassis-scale-btn ${!realSelected ? "active" : ""}`}
          onClick={() => onChangeMode("auto")}
          title={t("scale_auto")}
        >
          {t("scale_auto")}
        </button>
      </div>
    </div>
  );
};
