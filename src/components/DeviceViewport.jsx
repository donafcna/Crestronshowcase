import React from "react";

export const DeviceViewport = ({
  deviceType,
  children,
  ledStatus = "green",
  title = "Crestron GUI Showcase",
  isFullscreen = false,
  onExitFullscreen = () => {},
  onEnterFullscreen = () => {},
}) => {
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "-");

  const cornerButton = (
    <button
      className="btn-exit-fullscreen-device-corner"
      onClick={isFullscreen ? onExitFullscreen : onEnterFullscreen}
      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
    >
      {isFullscreen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className={`device-viewport-container ${deviceType}`}>
      {deviceType === "desktop" && (
        <div className="desktop-browser-frame glass-panel">
          {cornerButton}
          <div className="browser-header">
            <div className="browser-controls">
              <span className="dot close" />
              <span className="dot minimize" />
              <span className="dot maximize" />
            </div>
            <div className="browser-address-bar">
              <span className="secure-lock">🔒</span>
              <span className="address-text">
                https://xpanel.gemini.local/{normalizedTitle}
              </span>
            </div>
            <div className="browser-actions">
              <span className="action-dot" />
              <span className="action-dot" />
              <span className="action-dot" />
            </div>
          </div>
          <div className="browser-screen">{children}</div>
        </div>
      )}

      {deviceType === "tablet" && (
        <div className="tablet-device-frame">
          {cornerButton}
          <div className="tablet-bezel">
            <div className="tablet-camera" />
            <div className="tablet-screen">{children}</div>
            <div className="tablet-home-indicator" />
          </div>
        </div>
      )}

      {deviceType === "phone" && (
        <div className="phone-device-frame">
          {cornerButton}
          <div className="phone-bezel">
            <div className="phone-speaker" />
            <div className="phone-dynamic-island">
              <div className="island-camera" />
            </div>
            <div className="phone-screen">{children}</div>
            <div className="phone-home-line" />
          </div>
        </div>
      )}

      {deviceType === "wallpanel" && (
        <div className="crestron-panel-frame">
          {cornerButton}
          <div className="crestron-bezel">
            <div className="crestron-camera-sensor" />
            <div className="crestron-screen">{children}</div>
            <div className="crestron-logo">
              <span className="logo-brand">CRESTRON</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
