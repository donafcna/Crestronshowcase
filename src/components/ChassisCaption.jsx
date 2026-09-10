import React from "react";
import { useTranslation } from "../context/LanguageContext";

// Légende du châssis : support et caractéristiques réelles de l'appareil
// (modèle, diagonale, résolution native).
//
// Mode normal : badge « Taille réelle » seul (l'affichage de la page est la référence).
// Mode Scène : sélecteur « Taille réelle » (dimensions physiques calibrées) /
// « Responsive » (remplit l'espace ; la légende indique ×k par rapport à la page).
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

export const ChassisCaption = ({
  device,
  scale,
  pageScale,
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
  else if (fullscreen && mode === "real") {
    status = realSizeAvailable ? t("scale_real") : `${t("scale_real")} · ${t("scale_real_overflow")}`;
  } else if (fullscreen && pageScale) {
    // Facteur d'agrandissement obtenu par rapport à l'affichage de la page (ex. ×1,18)
    const k = (Math.round((scale / pageScale) * 100) / 100).toFixed(2).replace(/0$/, "").replace(".", decimal);
    status = `×${k}`;
  }
  const realSelected = fullscreen ? requestedMode === "real" : true;
  const warning = tooSmall || (fullscreen && mode === "real" && !realSizeAvailable);

  return (
    <div className={`chassis-caption ${warning ? "is-warning" : ""}`}>
      <p className="chassis-caption-text">
        <strong className="chassis-caption-name">{device.label}{device.model ? ` ${device.model}` : ""}</strong>
        <span className="chassis-caption-sep chassis-caption-sep--name">·</span>
        <span className="chassis-caption-specs">
          {inches && (
            <>
              {inches}
              <span className="chassis-caption-sep">·</span>
            </>
          )}
          {resolution}
          {status && (
            <>
              <span className="chassis-caption-sep">·</span>
              {status}
            </>
          )}
        </span>
      </p>
      {fullscreen ? (
        <div className="chassis-scale-toggle" role="group" aria-label="Scale mode">
          <button
            type="button"
            className={`chassis-scale-btn ${realSelected ? "active" : ""}`}
            onClick={() => onChangeMode?.("real")}
            title={realSizeAvailable ? t("scale_real") : t("scale_real_overflow")}
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
