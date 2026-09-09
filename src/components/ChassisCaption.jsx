import React from "react";
import { useTranslation } from "../context/LanguageContext";

// Légende du châssis : support et caractéristiques réelles de l'appareil
// (modèle, diagonale, résolution native), et sélecteur « Taille réelle /
// Responsive ». L'échelle appliquée n'est plus affichée ici (elle reste dans
// le bandeau de mesures du mode Dev) ; seul l'avertissement « fenêtre trop
// petite » subsiste. « Taille réelle » n'est
// proposée que si la fenêtre le permet (voir scaleRules.js).
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

export const ChassisCaption = ({
  device,
  scale,
  requestedMode,
  realSizeAvailable,
  tooSmall,
  onChangeMode,
}) => {
  const { t, lang } = useTranslation();
  const pct = Math.round(scale * 100);
  const decimal = lang === "en" ? "." : ",";
  const inches = device.diagonalInches ? `${String(device.diagonalInches).replace(".", decimal)}″` : null;
  const resolution = fill(t("scale_caption_size"), { w: device.nativeW || device.screenW, h: device.nativeH || device.screenH });
  const warning = tooSmall ? fill(t("scale_caption_too_small"), { pct }) : null;

  const realSelected = requestedMode === "real" && realSizeAvailable;

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
        {warning && (
          <>
            <span className="chassis-caption-sep">·</span>
            {warning}
          </>
        )}
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
