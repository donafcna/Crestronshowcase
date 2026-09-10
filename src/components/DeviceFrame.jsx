import React, { useEffect, useRef, useState } from "react";
import { getDeviceConfig } from "../data/devices";
import { useFitScale } from "../hooks/useFitScale";
import { useDevMode } from "../hooks/useDevMode";
import { DevMetrics } from "./DevMetrics";
import { ChassisCaption } from "./ChassisCaption";
import { useDemoSettings } from "../hooks/useDemoSettings";
import { SCALE_RULES, realSizeScale } from "../data/scaleRules";
import { useFrameInfo } from "../context/FrameInfoContext";
import { useScreenCalibration } from "../hooks/useScreenCalibration";
import { useTranslation } from "../context/LanguageContext";

// Barre d'état iOS (heure réelle, réseau, batterie) dessinée dans la zone
// "safe area" du haut de l'écran, comme sur un vrai iPhone / iPad. La GUI est
// placée en dessous (voir safeTop dans devices.js), exactement comme en mode
// démo plein écran où iOS réserve cette zone.
const IosStatusBar = ({ variant }) => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  return (
    <div className={`ios-status-bar ios-status-bar--${variant}`} aria-hidden="true">
      <span className="ios-status-time">{hh}:{mm}</span>
      <span className="ios-status-icons">
        <svg className="ios-status-cell" viewBox="0 0 20 12" width="18" height="11">
          <rect x="0" y="8" width="3" height="4" rx="0.8" fill="currentColor" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" />
        </svg>
        <svg className="ios-status-wifi" viewBox="0 0 16 12" width="16" height="12">
          <path d="M8 11.2 5.9 8.9a3 3 0 0 1 4.2 0L8 11.2Z" fill="currentColor" />
          <path d="M3.4 6.3a6.6 6.6 0 0 1 9.2 0l-1.5 1.5a4.5 4.5 0 0 0-6.2 0L3.4 6.3Z" fill="currentColor" />
          <path d="M.8 3.6a10.3 10.3 0 0 1 14.4 0l-1.5 1.5a8.2 8.2 0 0 0-11.4 0L.8 3.6Z" fill="currentColor" />
        </svg>
        <span className="ios-status-battery">
          <span className="ios-status-battery-level" />
        </span>
      </span>
    </div>
  );
};

// Renders a device chassis at a FIXED design resolution (from devices.js)
// and fits it into the available space with a single transform:scale —
// never by reflowing the chassis or the GUI it contains. The chassis is
// therefore always the identical size (in its own design px) regardless of
// which project/section is showing it; only the on-screen scale changes.
export const DeviceFrame = ({
  deviceType,
  children,
  title = "Crestron GUI Showcase",
  isFullscreen = false,
  onExitFullscreen = () => {},
  onEnterFullscreen = () => {},
}) => {
  const cfg = getDeviceConfig(deviceType);
  // fitScale = plus grande échelle qui fait tenir le châssis (marge comprise)
  // dans la zone disponible, SANS plafond. Les règles (scaleRules.js)
  // décident ensuite de l'échelle réellement appliquée.
  const { stageRef, scale: fitScale, stageSize } = useFitScale(cfg.chassisW, cfg.chassisH, {
    // plein écran : marge minimale, le châssis doit occuper tout l'espace
    margin: isFullscreen ? SCALE_RULES.fullscreenMargin : SCALE_RULES.margin,
  });
  const { devMode } = useDevMode();
  const { scaleMode, setScaleMode } = useDemoSettings();
  // « Taille réelle » = dimensions physiques de l'appareil (mm → px CSS), pas 100 % des px de conception.
  const { pxPerMm } = useScreenCalibration();
  const realScale = realSizeScale(cfg, pxPerMm);
  // realSizeAvailable = la taille réelle tient dans la zone ; sinon elle est quand même
  // appliquée (le châssis dépasse) et la légende le signale — F11 donne plus de place.
  const realSizeAvailable = fitScale >= realScale * SCALE_RULES.realSizeTolerance;
  // RÈGLE GÉNÉRALE (tous les projets, tous les supports) — voir scaleRules.js :
  //  - Mode normal : châssis ajusté à la page sans dépasser la taille réelle (calibrée) ;
  //    légende « Taille réelle » si atteinte, sinon « réduit à N % » (pas de sélecteur) ;
  //  - Mode Scène : « Taille réelle » = dimensions physiques calibrées (rognées si trop grandes,
  //    légende → F11) ; « Responsive » = remplit l'espace sans plafond.
  const effectiveMode = isFullscreen && scaleMode === "real" ? "real" : "auto";
  // Plein écran : le châssis occupe tout l'espace disponible (proportions conservées), sans plafond.
  // Mode normal : jamais plus grand que la taille réelle (10.09.2026 : la légende annonce alors
  // « Taille réelle » à juste titre, sinon « réduit à N % »).
  const upscaleCap = isFullscreen ? Infinity : Math.min(SCALE_RULES.maxUpscale, realScale || SCALE_RULES.maxUpscale);
  const chassisScale =
    effectiveMode === "real"
      ? realScale
      : Math.max(SCALE_RULES.minDownscale, Math.min(fitScale, upscaleCap));
  // Échelle de la page normale, mémorisée pour indiquer en plein écran l'agrandissement obtenu.
  const pageScaleRef = useRef(null);
  if (!isFullscreen && effectiveMode === "auto") pageScaleRef.current = chassisScale;
  const pageScale = pageScaleRef.current;
  const tooSmall = effectiveMode === "auto" && fitScale < SCALE_RULES.minDownscale;
  // screenW/H and guiW/H are both fixed design constants (not measured), so
  // guiScale is a plain derived number — no separate ResizeObserver needed.
  const guiScale = Math.min(cfg.screenW / cfg.guiW, cfg.screenH / cfg.guiH);
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "-");

  // Page Showcase : les bandeaux (mesures Dev, légende d'échelle) sont rendus
  // par la page, au-dessus de la barre des projets et sur la ligne des outils.
  const frameInfo = useFrameInfo();
  const setFrameInfo = frameInfo?.setInfo;
  useEffect(() => {
    if (!setFrameInfo) return;
    setFrameInfo({
      device: cfg,
      stage: stageSize,
      scale: chassisScale,
      pageScale,
      realScale,
      fitScale,
      mode: effectiveMode,
      requestedMode: scaleMode,
      realSizeAvailable,
      tooSmall,
      onChangeMode: setScaleMode,
      isFullscreen,
    });
  }, [setFrameInfo, cfg, stageSize, chassisScale, pageScale, realScale, fitScale, effectiveMode, scaleMode, realSizeAvailable, tooSmall, setScaleMode, isFullscreen]);
  useEffect(() => () => setFrameInfo?.(null), [setFrameInfo]);
  const inlineBanners = !frameInfo;

  // VOCABULAIRE (fixé par Donatien le 10.09.2026, à respecter partout) — 4 modes d'affichage :
  //  1. « Mode normal » : la page du site (menu, bandeau des projets, barre d'outils, châssis, supports).
  //  2. « Plein écran » : bouton de la barre d'outils → la GUI brute dans un nouvel onglet, sans châssis
  //     (dalle et tablette uniquement, jamais smartphone).
  //  3. « Mode Scène » : ce bouton d'angle du châssis → le châssis seul, agrandi au maximum dans la fenêtre
  //     du site, avec la colonne de droite (logo, supports, légende). isFullscreen = mode Scène dans le code.
  //  4. « Plein écran navigateur F11 » : indépendant du site.
  const { t } = useTranslation();
  // Mode normal : le bouton Scène est posé en haut à droite de la scène, à taille fixe (il n'est pas
  // réduit avec le châssis — 10.09.2026). Mode Scène : à l'angle du châssis comme avant.
  const cornerButton = (
    <button
      className={`btn-exit-fullscreen-device-corner ${isFullscreen ? "" : "btn-exit-fullscreen-device-corner--stage"}`}
      style={
        isFullscreen
          ? undefined
          : {
              // à l'angle supérieur droit du châssis (centré dans la scène), sans jamais sortir de la scène
              "--corner-right": `max(4px, calc(50% - ${Math.round((cfg.chassisW * chassisScale) / 2)}px - 42px))`,
              "--corner-top": `max(4px, calc(50% - ${Math.round((cfg.chassisH * chassisScale) / 2)}px))`,
            }
      }
      onClick={isFullscreen ? onExitFullscreen : onEnterFullscreen}
      title={isFullscreen ? t("stage_mode_exit") : t("stage_mode_enter")}
      aria-label={isFullscreen ? t("stage_mode_exit") : t("stage_mode_enter")}
    >
      {isFullscreen ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      )}
    </button>
  );

  const guiCanvas = (
    <div
      className="gui-canvas"
      style={{ width: cfg.guiW, height: cfg.guiH, top: cfg.safeTop || 0, transform: `scale(${guiScale})` }}
    >
      {children}
    </div>
  );

  // Les dimensions passent aussi en variables CSS : le stylesheet du stage
  // les impose en !important (aucun padding / max-width hérité ne peut
  // agrandir le boîtier au-delà de sa taille de conception).
  const chassisStyle = {
    "--chassis-w": `${cfg.chassisW}px`,
    "--chassis-h": `${cfg.chassisH}px`,
    width: cfg.chassisW,
    height: cfg.chassisH,
    transform: `translate(-50%, -50%) scale(${chassisScale})`,
  };

  return (
    <div className="device-viewport-container">
      {inlineBanners && devMode && (
        <DevMetrics device={cfg} stage={stageSize} scale={chassisScale} fitScale={fitScale} mode={effectiveMode} realSizeAvailable={realSizeAvailable} />
      )}
      <div className="device-stage" ref={stageRef}>
        {!isFullscreen && cornerButton}
        {deviceType === "desktop" && (
          <div className="desktop-browser-frame glass-panel" style={chassisStyle}>
            {isFullscreen && cornerButton}
            <div className="browser-header">
              <div className="browser-controls">
                <span className="dot close" />
                <span className="dot minimize" />
                <span className="dot maximize" />
              </div>
              <div className="browser-address-bar">
                <span className="secure-lock">🔒</span>
                <span className="address-text">https://xpanel.frequence-tv.local/{normalizedTitle}</span>
              </div>
              <div className="browser-actions">
                <span className="action-dot" />
                <span className="action-dot" />
                <span className="action-dot" />
              </div>
            </div>
            <div className="browser-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
              {guiCanvas}
            </div>
          </div>
        )}

        {deviceType === "tablet" && (
          <div className="tablet-device-frame" style={chassisStyle}>
            {isFullscreen && cornerButton}
            <div className="tablet-bezel">
              <div className="tablet-camera" />
              <div className="tablet-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
                <IosStatusBar variant="tablet" />
                {guiCanvas}
                <div className="ios-home-indicator" aria-hidden="true" />
              </div>
              <div className="tablet-home-indicator" />
            </div>
          </div>
        )}

        {deviceType === "phone" && (
          <div className="phone-device-frame" style={chassisStyle}>
            {isFullscreen && cornerButton}
            <div className="phone-bezel">
              <div className="phone-speaker" />
              <div className="phone-dynamic-island">
                <div className="island-camera" />
              </div>
              <div className="phone-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
                <IosStatusBar variant="phone" />
                {guiCanvas}
                <div className="ios-home-indicator" aria-hidden="true" />
              </div>
              <div className="phone-home-line" />
            </div>
          </div>
        )}

        {(deviceType === "wallpanel" || deviceType === "wallpanel_hd") && (
          <div className="crestron-panel-frame" style={chassisStyle}>
            {isFullscreen && cornerButton}
            <div className="crestron-bezel">
              <div className="crestron-camera-sensor" />
              <div className="crestron-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
                {guiCanvas}
              </div>
              <div className="crestron-logo">
                <span className="logo-brand">CRESTRON</span>
                <span className="logo-model">{deviceType === "wallpanel_hd" ? "TSW-1080" : "TSW-1070"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {inlineBanners && (
        <ChassisCaption
          fullscreen={isFullscreen}
          device={cfg}
          scale={chassisScale}
          mode={effectiveMode}
          requestedMode={scaleMode}
          realSizeAvailable={realSizeAvailable}
          tooSmall={tooSmall}
          onChangeMode={setScaleMode}
        />
      )}
    </div>
  );
};
