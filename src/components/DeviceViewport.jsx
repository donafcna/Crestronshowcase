import React from "react";

export const DeviceViewport = ({
  deviceType,
  children,
  ledStatus = "green",
  title = "Crestron GUI Showcase",
}) => {
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`device-viewport-container ${deviceType}`}>
      {deviceType === "desktop" && (
        <div className="desktop-browser-frame glass-panel">
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
          <div className="tablet-bezel">
            <div className="tablet-camera" />
            <div className="tablet-screen">{children}</div>
            <div className="tablet-home-indicator" />
          </div>
        </div>
      )}

      {deviceType === "phone" && (
        <div className="phone-device-frame">
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
