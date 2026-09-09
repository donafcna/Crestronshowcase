import React from "react";
import { useTranslation } from "../context/LanguageContext";

// Légende du châssis : support et caractéristiques réelles de l'appareil
// (modèle, diagonale, résolution native).
//
// - Page normale : le châssis est présenté à sa taille réelle → badge
//   « Taille réelle » seul, sans pourcentage ni sélecteur.
// - Plein écran : le châssis est agrandi pour occuper tout l'espace disponible
//   (proportions conservées) → la légende indique de combien (« agrandi à
//   145 % ») et propose deux boutons : « Responsive » (agrandi) et « Taille
//   réelle » (100 %, pour comparer). Voir scaleRules.js.
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

export const ChassisCaption = ({
  device,
  scale,
  mode,
  requestedMode,
  realSizeAvailable,
  tooSmall,
  onChangeMode,
  fullscreen = false,
}) => {
  const { t, lang } = useTranslation();
  const pct = Math.round(scale * 100);
  const decimal = lang === "en" ? "." : ",";
  const inches = device.diagonalInches ? `${String(device.diagonalInches).replace(".", decimal)}″` : null;
  const resolution = fill(t("scale_caption_size"), { w: device.nativeW || device.screenW, h: device.nativeH || device.screenH });

  let status = null;
  if (tooSmall) status = fill(t("scale_caption_too_small"), { pct });
  else if (fullscreen) {
    if (mode === "real" || Math.abs(scale - 1) < 0.005) status = t("scale_caption_real");
    else if (scale > 1) status = fill(t("scale_caption_enlarged"), { pct });
    else status = fill(t("scale_caption_reduced"), { pct });
  }

  const realSelected = fullscreen ? requestedMode === "real" && realSizeAvailable : true;

  return (
    <div className={`chassis-caption ${tooSmall ? "is-warning" : ""}`}>
      <p className="chassis-caption-text">
        <strong>{device.label}{device.model ? ` ${device.model}` : ""}</strong>
        {inches && (
          <>
            <span className="chassis-caption-sep">·</span>
            {inches}
          </>
        )}
        <span className="chassis-caption-sep">·</span>
        {resolution}
        {status && (
          <>
            <span className="chassis-caption-sep">·</span>
            {status}
          </>
        )}
      </p>
      {fullscreen ? (
        <div className="chassis-scale-toggle" role="group" aria-label="Scale mode">
          <button
            type="button"
            className={`chassis-scale-btn ${realSelected ? "active" : ""}`}
            onClick={() => onChangeMode?.("real")}
            disabled={!realSizeAvailable}
            title={realSizeAvailable ? t("scale_real") : t("scale_real_unavailable")}
          >
            {t("scale_real")}
          </button>
          <button
            type="button"
            className={`chassis-scale-btn ${!realSelected ? "active" : ""}`}
            onClick={() => onChangeMode?.("auto")}
            title={t("scale_auto")}
          >
            {t("scale_auto")}
          </button>
        </div>
      ) : (
        <span className="chassis-scale-toggle" aria-label={t("scale_real")}>
          <span className="chassis-scale-btn active chassis-scale-badge">{t("scale_real")}</span>
        </span>
      )}
    </div>
  );
};
