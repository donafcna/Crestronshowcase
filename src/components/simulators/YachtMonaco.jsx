import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";
import { yachtMonacoTranslations } from "../../data/yachtMonacoTranslations";

export const YachtMonaco = ({ deviceType }) => {
  const { lang } = useTranslation();
  const [activeView, setActiveView] = useState("home");
  const [activeZone, setActiveZone] = useState("deck"); // sundeck, salon, deck
  const [lightMode, setLightMode] = useState("chromatic");
  const [volumeLevels, setVolumeLevels] = useState({
    sundeck: 65,
    musicSalon: 72,
    musicDeckAft: 80,
    masterDeckAft: 40,
    poolDeckAft: 55,
  });

  const [muteStates, setMuteStates] = useState({
    sundeck: false,
    musicSalon: false,
    musicDeckAft: false,
    masterDeckAft: false,
    poolDeckAft: false,
  });

  const [hullColors, setHullColors] = useState({
    mast: "#00ffff",
    sundeck: "#ff00ff",
    musicDeck: "#00ff00",
    musicSalon: "#ff5500",
    hull: "#005dab",
  });

  const [mastDimmer, setMastDimmer] = useState(80);
  const [isSmokeActivated, setIsSmokeActivated] = useState(false);
  const [subVolumeModal, setSubVolumeModal] = useState(null);
  const [subVolumeLevel, setSubVolumeLevel] = useState(70);

  const translate = (key) => {
    const dict = yachtMonacoTranslations[lang] || yachtMonacoTranslations.en;
    return dict[key] || yachtMonacoTranslations.en[key] || key;
  };

  const toggleMute = (channel) => {
    setMuteStates((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleColorClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const hslColor = `hsl(${Math.floor(pct * 360)}, 100%, 50%)`;

    setHullColors((prev) => {
      if (activeZone === "sundeck") return { ...prev, sundeck: hslColor };
      if (activeZone === "salon") return { ...prev, musicSalon: hslColor };
      return { ...prev, musicDeck: hslColor };
    });
  };

  const handleAllOff = () => {
    setHullColors({
      mast: "#22272c",
      sundeck: "#22272c",
      musicDeck: "#22272c",
      musicSalon: "#22272c",
      hull: "#0e1620",
    });
    setMastDimmer(0);
    setIsSmokeActivated(false);
  };

  const triggerPresetScene = (scene) => {
    if (scene === "party") {
      setHullColors({
        mast: "#ff00ff",
        sundeck: "#00ffff",
        musicDeck: "#ffff00",
        musicSalon: "#ff0000",
        hull: "#0a1c3a",
      });
      setMastDimmer(100);
      setIsSmokeActivated(true);
    } else if (scene === "chill") {
      setHullColors({
        mast: "#00ffff",
        sundeck: "#0000ff",
        musicDeck: "#00ffff",
        musicSalon: "#00008b",
        hull: "#020813",
      });
      setMastDimmer(50);
      setIsSmokeActivated(false);
    } else if (scene === "sunset") {
      setHullColors({
        mast: "#ea580c",
        sundeck: "#facc15",
        musicDeck: "#ea580c",
        musicSalon: "#f43f5e",
        hull: "#1a0f02",
      });
      setMastDimmer(75);
      setIsSmokeActivated(false);
    }
  };

  const colorSwatches = [
    { id: "red", color: "#ff0000" },
    { id: "cyan", color: "#00ffff" },
    { id: "magenta", color: "#ff00ff" },
    { id: "pink", color: "#ffc0cb" },
    { id: "yellow", color: "#ffff00" },
    { id: "orange", color: "#ff5500" },
    { id: "green", color: "#00ff00" },
    { id: "blue", color: "#0000ff" },
  ];

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  // Yacht drawing SVG component
  const YachtSVG = () => {
    return (
      <svg viewBox="0 0 800 400" className="yacht-vector-graphic">
        <rect width="800" height="400" fill="url(#skyGradient)" />
        <path d="M0 310 Q200 300 400 310 T800 310 L800 400 L0 400 Z" fill="#0c1724" opacity="0.8" />
        <path d="M0 325 Q150 315 300 325 T600 325 T800 330 L800 400 L0 400 Z" fill="#080e18" />

        {/* Yacht Hull */}
        <path
          d="M80 270 C120 280 180 300 240 312 L680 312 C710 280 735 235 745 195 C710 193 680 195 640 195 C625 210 610 220 590 220 L280 220 C180 220 120 250 80 270 Z"
          fill={hullColors.hull}
          stroke="#556c80"
          strokeWidth="2"
          className="yacht-hull-path"
        />
        <path
          d="M120 250 C180 262 250 280 320 288 L695 288 C708 270 720 245 728 225 L650 225 C635 235 620 245 600 245 L240 245 C170 245 140 248 120 250 Z"
          fill="#e2ebf0"
          opacity="0.9"
        />

        {/* Music Salon */}
        <path
          d="M260 220 L600 220 C585 190 570 165 540 165 L290 165 C275 165 268 185 260 220 Z"
          fill={hullColors.musicSalon}
          stroke="#445566"
          strokeWidth="1.5"
          className="yacht-music-salon-path"
        />
        <path d="M300 175 L525 175 L510 210 L310 210 Z" fill="rgba(255, 255, 255, 0.25)" stroke="#334455" strokeWidth="1" />
        <line x1="360" y1="175" x2="360" y2="210" stroke="#334455" />
        <line x1="420" y1="175" x2="420" y2="210" stroke="#334455" />
        <line x1="480" y1="175" x2="480" y2="210" stroke="#334455" />

        {/* Music Deck */}
        <path
          d="M285 165 L530 165 C520 135 505 115 470 115 L320 115 C300 115 292 135 285 165 Z"
          fill={hullColors.musicDeck}
          stroke="#445566"
          strokeWidth="1.5"
          className="yacht-music-deck-path"
        />
        <path d="M330 122 L455 122 L445 155 L335 155 Z" fill="rgba(255, 255, 255, 0.3)" stroke="#334455" strokeWidth="1" />

        {/* Sundeck */}
        <path
          d="M340 115 L460 115 C450 95 435 80 410 80 L355 80 C345 80 342 95 340 115 Z"
          fill={hullColors.sundeck}
          stroke="#445566"
          strokeWidth="1.5"
          className="yacht-sundeck-path"
        />

        {/* Mast */}
        <path d="M390 80 L400 80 L395 30 Z" fill={hullColors.mast} stroke="#445566" className="yacht-mast-path" />
        <rect x="375" y="42" width="40" height="4" rx="2" fill="#ffffff" stroke="#334455" />
        <rect x="382" y="32" width="26" height="3" rx="1.5" fill="#ffffff" stroke="#334455" />

        {/* Lighting glow effect beams */}
        {mastDimmer > 0 && (
          <g opacity={mastDimmer / 130} style={{ pointerEvents: "none" }}>
            <polygon
              points="395,30 200,400 600,400"
              fill={`url(#beamGradient-${hullColors.mast.replace("#", "")})`}
              opacity="0.35"
            />
            <polygon
              points="400,80 300,400 500,400"
              fill={`url(#beamGradient-${hullColors.sundeck.replace("#", "")})`}
              opacity="0.3"
            />
            <line
              x1="560"
              y1="220"
              x2="700"
              y2="400"
              stroke={hullColors.musicDeck}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.6"
              filter="blur(4px)"
            />
            <line
              x1="580"
              y1="220"
              x2="780"
              y2="350"
              stroke={hullColors.musicDeck}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.6"
              filter="blur(4px)"
            />
          </g>
        )}

        {/* Smoke particles exhaust */}
        {isSmokeActivated && (
          <g opacity="0.6" className="smoke-animation-group" style={{ pointerEvents: "none" }}>
            <circle cx="560" cy="205" r="30" fill="url(#smokeGradient)" />
            <circle cx="590" cy="190" r="45" fill="url(#smokeGradient)" />
            <circle cx="630" cy="175" r="60" fill="url(#smokeGradient)" />
            <circle cx="680" cy="170" r="75" fill="url(#smokeGradient)" />
          </g>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="60%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#2a3547" />
          </linearGradient>

          <radialGradient id="smokeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#e5e7eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d1d5db" stopOpacity="0" />
          </radialGradient>

          {Object.values(hullColors).map((color) => {
            const hex = color.replace("#", "");
            return (
              <linearGradient
                key={hex}
                id={`beamGradient-${hex}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="30%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>
      </svg>
    );
  };

  return (
    <div className={`yacht-sunrays-simulator-viewport ${deviceType}`}>
      {/* Yacht Status Bar */}
      <div className="yacht-status-bar">
        <span className="time-lbl">12:28</span>
        <div className="status-icons">
          {renderIcon("Signal", 14)}
          <div className="battery-box">
            <span>94</span>
            {renderIcon("Battery", 14, "fill-current")}
          </div>
        </div>
      </div>

      <div className="yacht-viewport-body">
        {(() => {
          switch (activeView) {
            case "audio": {
              return (
                <div className="yacht-audio-screen">
                  <div className="yacht-header-nav">
                    <button className="yacht-home-btn" onClick={() => setActiveView("home")}>
                      {renderIcon("Home", 22)}
                    </button>
                    <h2>{translate("party_mode")}</h2>
                    <div style={{ width: 44 }} />
                  </div>

                  <div className="yacht-faders-grid">
                    {/* Sundeck channel */}
                    <div className="fader-channel">
                      <span className="fader-name">{translate("sundeck")}</span>
                      <div className="vertical-slider-track">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={muteStates.sundeck ? 0 : volumeLevels.sundeck}
                          onChange={(e) =>
                            setVolumeLevels((prev) => ({ ...prev, sundeck: Number(e.target.value) }))
                          }
                          disabled={muteStates.sundeck}
                          className="yacht-fader-input"
                        />
                      </div>
                      <button
                        className={`btn-mute-glossy ${muteStates.sundeck ? "active" : ""}`}
                        onClick={() => toggleMute("sundeck")}
                      >
                        {translate("mute")}
                      </button>
                      <button className="btn-sub-control" onClick={() => setSubVolumeModal("Sundeck")}>
                        {translate("sub_control")}
                      </button>
                    </div>

                    {/* Music Salon channel */}
                    <div className="fader-channel">
                      <span className="fader-name">{translate("music_salon")}</span>
                      <div className="vertical-slider-track">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={muteStates.musicSalon ? 0 : volumeLevels.musicSalon}
                          onChange={(e) =>
                            setVolumeLevels((prev) => ({ ...prev, musicSalon: Number(e.target.value) }))
                          }
                          disabled={muteStates.musicSalon}
                          className="yacht-fader-input"
                        />
                      </div>
                      <button
                        className={`btn-mute-glossy ${muteStates.musicSalon ? "active" : ""}`}
                        onClick={() => toggleMute("musicSalon")}
                      >
                        {translate("mute")}
                      </button>
                      <div className="btn-placeholder" />
                    </div>

                    {/* Music Deck Aft channel */}
                    <div className="fader-channel">
                      <span className="fader-name">{translate("music_deck_aft")}</span>
                      <div className="vertical-slider-track">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={muteStates.musicDeckAft ? 0 : volumeLevels.musicDeckAft}
                          onChange={(e) =>
                            setVolumeLevels((prev) => ({ ...prev, musicDeckAft: Number(e.target.value) }))
                          }
                          disabled={muteStates.musicDeckAft}
                          className="yacht-fader-input"
                        />
                      </div>
                      <button
                        className={`btn-mute-glossy ${muteStates.musicDeckAft ? "active" : ""}`}
                        onClick={() => toggleMute("musicDeckAft")}
                      >
                        {translate("mute")}
                      </button>
                      <button className="btn-sub-control" onClick={() => setSubVolumeModal("Music Deck Aft")}>
                        {translate("sub_control")}
                      </button>
                    </div>

                    {/* Master Deck Aft channel */}
                    <div className="fader-channel">
                      <span className="fader-name">{translate("master_deck_aft")}</span>
                      <div className="vertical-slider-track">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={muteStates.masterDeckAft ? 0 : volumeLevels.masterDeckAft}
                          onChange={(e) =>
                            setVolumeLevels((prev) => ({ ...prev, masterDeckAft: Number(e.target.value) }))
                          }
                          disabled={muteStates.masterDeckAft}
                          className="yacht-fader-input"
                        />
                      </div>
                      <button
                        className={`btn-mute-glossy ${muteStates.masterDeckAft ? "active" : ""}`}
                        onClick={() => toggleMute("masterDeckAft")}
                      >
                        {translate("mute")}
                      </button>
                      <div className="btn-placeholder" />
                    </div>

                    {/* Pool Deck Aft channel */}
                    <div className="fader-channel">
                      <span className="fader-name">{translate("pool_deck_aft")}</span>
                      <div className="vertical-slider-track">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={muteStates.poolDeckAft ? 0 : volumeLevels.poolDeckAft}
                          onChange={(e) =>
                            setVolumeLevels((prev) => ({ ...prev, poolDeckAft: Number(e.target.value) }))
                          }
                          disabled={muteStates.poolDeckAft}
                          className="yacht-fader-input"
                        />
                      </div>
                      <button
                        className={`btn-mute-glossy ${muteStates.poolDeckAft ? "active" : ""}`}
                        onClick={() => toggleMute("poolDeckAft")}
                      >
                        {translate("mute")}
                      </button>
                      <div className="btn-placeholder" />
                    </div>
                  </div>

                  <div className="yacht-audio-bottom-bar">
                    <div className="status-indicator-glossy">
                      {Object.values(muteStates).some((v) => v) ? (
                        <span className="text-red">
                          {renderIcon("VolumeX", 14)} {translate("audio_muted")}
                        </span>
                      ) : (
                        <span className="text-green">
                          {renderIcon("Volume2", 14)} {translate("audio_unmuted")}
                        </span>
                      )}
                    </div>
                    <button className="btn-return-glossy" onClick={() => setActiveView("home")}>
                      {translate("return")}
                    </button>
                  </div>

                  {subVolumeModal && (
                    <div className="sub-volume-modal-overlay">
                      <div className="sub-volume-modal-content glass-card">
                        <h4>{subVolumeModal} - SUB</h4>
                        <div className="modal-slider-row">
                          {renderIcon("VolumeX", 18)}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={subVolumeLevel}
                            onChange={(e) => setSubVolumeLevel(Number(e.target.value))}
                            className="yacht-modal-slider"
                          />
                          {renderIcon("Volume2", 18)}
                        </div>
                        <div className="sub-val-display">{subVolumeLevel}%</div>
                        <button className="btn-close-modal-glossy" onClick={() => setSubVolumeModal(null)}>
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            case "lights": {
              return (
                <div className="yacht-lights-screen">
                  <div className="yacht-header-nav flex-row-spaced">
                    <button className="yacht-home-btn" onClick={() => setActiveView("home")}>
                      {renderIcon("Home", 22)}
                    </button>
                    <div className="light-mode-toggle-group">
                      <button
                        className={`toggle-mode-btn ${lightMode === "chromatic" ? "active" : ""}`}
                        onClick={() => setLightMode("chromatic")}
                      >
                        {translate("chromatic")}
                      </button>
                      <button
                        className={`toggle-mode-btn ${lightMode === "presets" ? "active" : ""}`}
                        onClick={() => setLightMode("presets")}
                      >
                        {translate("presets")}
                      </button>
                    </div>
                    <button className="btn-all-off-yellow" onClick={handleAllOff}>
                      {translate("all_off")}
                    </button>
                  </div>

                  {lightMode === "chromatic" ? (
                    <div className="lights-chromatic-body">
                      <div className="lights-zones-tabs">
                        <button
                          className={`zone-tab-btn ${activeZone === "deck" ? "active" : ""}`}
                          onClick={() => setActiveZone("deck")}
                        >
                          {translate("music_deck")}
                        </button>
                        <button
                          className={`zone-tab-btn ${activeZone === "salon" ? "active" : ""}`}
                          onClick={() => setActiveZone("salon")}
                        >
                          {translate("music_salon")}
                        </button>
                        <button
                          className={`zone-tab-btn ${activeZone === "sundeck" ? "active" : ""}`}
                          onClick={() => setActiveZone("sundeck")}
                        >
                          {translate("sundeck")}
                        </button>
                      </div>

                      <div className="lights-mid-controls">
                        {/* Dynamic HSL Hue colorpicker bar */}
                        <div
                          className="hsl-color-picker-track"
                          onClick={handleColorClick}
                          style={{
                            height: "28px",
                            borderRadius: "14px",
                            cursor: "pointer",
                            background:
                              "linear-gradient(to right, red 0%, #ff0 17%, line 33%, #0ff 50%, #00f 67%, #f0f 83%, red 100%)",
                            marginBottom: "15px",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
                          }}
                        />

                        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Couleur active :</span>
                          <div
                            style={{
                              width: "36px",
                              height: "20px",
                              borderRadius: "4px",
                              border: "1px solid #ffffff40",
                              background:
                                activeZone === "sundeck"
                                  ? hullColors.sundeck
                                  : activeZone === "salon"
                                  ? hullColors.musicSalon
                                  : hullColors.musicDeck,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mast-presets-section" style={{ marginTop: "15px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                          {translate("mast_presets")} :
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                          {colorSwatches.map((sw) => (
                            <button
                              key={sw.id}
                              onClick={() => setHullColors((prev) => ({ ...prev, mast: sw.color }))}
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                border: hullColors.mast === sw.color ? "2px solid #fff" : "1px solid #ffffff30",
                                backgroundColor: sw.color,
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Presets View */
                    <div className="lights-presets-grid" style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <button
                        onClick={() => triggerPresetScene("party")}
                        className="scene-action-row-btn active"
                        style={{ borderLeft: "3px solid #f43f5e" }}
                      >
                        <span>Party DMX Mode</span>
                        <span>🔥</span>
                      </button>
                      <button
                        onClick={() => triggerPresetScene("chill")}
                        className="scene-action-row-btn"
                        style={{ borderLeft: "3px solid #2563eb" }}
                      >
                        <span>Monaco Chill</span>
                        <span>🌊</span>
                      </button>
                      <button
                        onClick={() => triggerPresetScene("sunset")}
                        className="scene-action-row-btn"
                        style={{ borderLeft: "3px solid #ea580c" }}
                      >
                        <span>Sunset Warm</span>
                        <span>🌅</span>
                      </button>
                      <button
                        onClick={handleAllOff}
                        className="scene-action-row-btn"
                        style={{ borderLeft: "3px solid #64748b" }}
                      >
                        <span>Extinction totale</span>
                        <span>😴</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            case "home":
            default: {
              return (
                <div className="yacht-home-screen">
                  {/* Vector Graphic Drawing */}
                  <div className="yacht-drawing-container">
                    <YachtSVG />
                  </div>

                  {/* Dashboard controls shortcuts */}
                  <div className="yacht-home-controls-row" style={{ display: "flex", gap: "12px", padding: "16px" }}>
                    <button
                      onClick={() => setActiveView("audio")}
                      className="home-service-card"
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: "10px" }}
                    >
                      {renderIcon("Music", 22, "icon-blue")}
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <strong style={{ fontSize: "0.85rem" }}>{translate("party_mode")}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Multi-zones Volume</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveView("lights")}
                      className="home-service-card"
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: "10px" }}
                    >
                      {renderIcon("Zap", 22, "icon-yellow")}
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <strong style={{ fontSize: "0.85rem" }}>{translate("lights")}</strong>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Contrôles DMX Yacht</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsSmokeActivated(!isSmokeActivated)}
                      className={`home-service-card ${isSmokeActivated ? "off-active" : ""}`}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: "10px" }}
                    >
                      {renderIcon("Wind", 22, isSmokeActivated ? "icon-green" : "icon-blue")}
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <strong style={{ fontSize: "0.85rem" }}>Machine fumée</strong>
                        <span style={{ fontSize: "0.7rem", color: isSmokeActivated ? "#16a34a" : "#64748b", fontWeight: 600 }}>
                          {translate(isSmokeActivated ? "smoke_active" : "smoke_inactive")}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            }
          }
        })()}
      </div>
    </div>
  );
};
