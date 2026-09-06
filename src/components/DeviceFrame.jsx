import React from "react";
import { getDeviceConfig } from "../data/devices";
import { useFitScale } from "../hooks/useFitScale";

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
  const { stageRef, scale: chassisScale } = useFitScale(cfg.chassisW, cfg.chassisH, { max: 1 });
  // screenW/H and guiW/H are both fixed design constants (not measured), so
  // guiScale is a plain derived number — no separate ResizeObserver needed.
  const guiScale = Math.min(cfg.screenW / cfg.guiW, cfg.screenH / cfg.guiH);
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "-");

  const cornerButton = (
    <button
      className="btn-exit-fullscreen-device-corner"
      onClick={isFullscreen ? onExitFullscreen : onEnterFullscreen}
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
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
      style={{ width: cfg.guiW, height: cfg.guiH, transform: `scale(${guiScale})` }}
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
      <div className="device-stage" ref={stageRef}>
        {deviceType === "desktop" && (
          <div className="desktop-browser-frame glass-panel" style={chassisStyle}>
            {cornerButton}
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
            {cornerButton}
            <div className="tablet-bezel">
              <div className="tablet-camera" />
              <div className="tablet-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
                {guiCanvas}
              </div>
              <div className="tablet-home-indicator" />
            </div>
          </div>
        )}

        {deviceType === "phone" && (
          <div className="phone-device-frame" style={chassisStyle}>
            {cornerButton}
            <div className="phone-bezel">
              <div className="phone-speaker" />
              <div className="phone-dynamic-island">
                <div className="island-camera" />
              </div>
              <div className="phone-screen device-screen" style={{ width: cfg.screenW, height: cfg.screenH }}>
                {guiCanvas}
              </div>
              <div className="phone-home-line" />
            </div>
          </div>
        )}

        {(deviceType === "wallpanel" || deviceType === "wallpanel_hd") && (
          <div className="crestron-panel-frame" style={chassisStyle}>
            {cornerButton}
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
    </div>
  );
};
