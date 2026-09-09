import React from "react";
import { useTranslation } from "../context/LanguageContext";

// Légende du châssis : support et caractéristiques réelles de l'appareil
// (modèle, diagonale, résolution native) et badge « Taille réelle » (le
// sélecteur Taille réelle / Responsive a été retiré à la demande de Donatien,
// 09.09.2026 : le châssis est présenté comme l'appareil réel). L'échelle appliquée n'est plus affichée ici (elle reste dans
// le bandeau de mesures du mode Dev) ; seul l'avertissement « fenêtre trop
// petite » subsiste. « Taille réelle » n'est
// proposée que si la fenêtre le permet (voir scaleRules.js).
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

export const ChassisCaption = ({
  device,
  scale,
  tooSmall,
}) => {
  const { t, lang } = useTranslation();
  const pct = Math.round(scale * 100);
  const decimal = lang === "en" ? "." : ",";
  const inches = device.diagonalInches ? `${String(device.diagonalInches).replace(".", decimal)}″` : null;
  const resolution = fill(t("scale_caption_size"), { w: device.nativeW || device.screenW, h: device.nativeH || device.screenH });
  const warning = tooSmall ? fill(t("scale_caption_too_small"), { pct }) : null;

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
      <span className="chassis-scale-toggle" aria-label={t("scale_real")}>
        <span className="chassis-scale-btn active chassis-scale-badge">{t("scale_real")}</span>
      </span>
    </div>
  );
};
