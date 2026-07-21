import React, { useState, useEffect } from "react";

export const ChaletZermatt = ({ deviceType }) => {
  // Device render mode (xpanel, ts1070, mobile) synced with deviceType prop
  const [deviceMode, setDeviceMode] = useState(() => {
    if (deviceType === "phone") return "mobile";
    if (deviceType === "tablet") return "ts1070";
    return "xpanel";
  });

  // Keep deviceMode updated if parent deviceType prop changes
  useEffect(() => {
    if (deviceType === "phone") setDeviceMode("mobile");
    else if (deviceType === "tablet") setDeviceMode("ts1070");
    else setDeviceMode("xpanel");
  }, [deviceType]);

  // View Navigation
  const [activeView, setActiveView] = useState("dashboard");

  // Clock
  const [clockTime, setClockTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString("fr-FR"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Crestron Joins State
  const [activeScene, setActiveScene] = useState("welcome");
  const [activeLightsCount, setActiveLightsCount] = useState(8);
  const [alarmArmed, setAlarmArmed] = useState(false);
  const [gateMessage, setGateMessage] = useState(null);

  // Lighting
  const [lightSalon, setLightSalon] = useState(true);
  const [dimSalon, setDimSalon] = useState(75);
  const [lightSuite, setLightSuite] = useState(true);
  const [dimSuite, setDimSuite] = useState(50);
  const [lightTerrasse, setLightTerrasse] = useState(true);
  const [dimTerrasse, setDimTerrasse] = useState(40);
  const [rgbColor, setRgbColor] = useState("#00e5ff");

  // HVAC
  const [tempMaster, setTempMaster] = useState(22);
  const [tempSpa, setTempSpa] = useState(24);

  // Audio / Video
  const [avSource, setAvSource] = useState("Apple TV 4K");
  const [avVolume, setAvVolume] = useState(65);
  const [isMuted, setIsMuted] = useState(false);

  // Spa
  const [spaJets, setSpaJets] = useState(true);
  const [saunaActive, setSaunaActive] = useState(false);

  // Crestron Join Monitor Logs
  const [joinLogs, setJoinLogs] = useState([
    { time: new Date().toLocaleTimeString("fr-FR"), type: "system", join: 0, val: "Initialisation du Moteur Crestron Join - IP: 192.168.1.50 (CP4)" },
    { time: new Date().toLocaleTimeString("fr-FR"), type: "digital", join: 1, val: "HIGH (1) - System Power" },
    { time: new Date().toLocaleTimeString("fr-FR"), type: "digital", join: 10, val: "HIGH (1) - Scene: Welcome Active" },
    { time: new Date().toLocaleTimeString("fr-FR"), type: "analog", join: 1, val: "75 - Salon Lighting Dimmer (%)" },
    { time: new Date().toLocaleTimeString("fr-FR"), type: "analog", join: 10, val: "22°C - Master HVAC Setpoint" },
    { time: new Date().toLocaleTimeString("fr-FR"), type: "serial", join: 2, val: `"Source: Hans Zimmer - Interstellar OST"` },
  ]);

  const addLog = (type, join, val) => {
    const timeStr = new Date().toLocaleTimeString("fr-FR");
    setJoinLogs((prev) => [{ time: timeStr, type, join, val }, ...prev.slice(0, 49)]);
  };

  // Trigger Scene
  const handleTriggerScene = (sceneKey, joinNum) => {
    setActiveScene(sceneKey);
    addLog("digital", joinNum, `HIGH (1) - Scene ${sceneKey.toUpperCase()} Triggered`);

    if (sceneKey === "welcome") {
      setDimSalon(70);
      setTempMaster(22);
      setAvSource("Apple TV 4K");
      addLog("analog", 1, "70 (%)");
      addLog("analog", 10, "22 (°C)");
    } else if (sceneKey === "cinema") {
      setDimSalon(15);
      setAvSource("Apple TV 4K (Dolby Atmos)");
      addLog("analog", 1, "15 (%)");
      addLog("digital", 303, "HIGH (1) - Closing Blinds");
    } else if (sceneKey === "party") {
      setRgbColor("#a855f7");
      setAvVolume(80);
      setTempSpa(38);
      addLog("serial", 15, `Couleur DMX RGB = #a855f7`);
      addLog("analog", 30, "80 (%)");
    } else if (sceneKey === "night") {
      setDimSalon(0);
      setDimSuite(0);
      setAlarmArmed(true);
      addLog("analog", 1, "0 (%)");
      addLog("analog", 2, "0 (%)");
      addLog("digital", 20, "HIGH (1) - Alarm Armed");
    }
  };

  // Lighting handlers
  const handleDimmerChange = (joinNum, value, setDimmerFn, label) => {
    const val = parseInt(value, 10);
    setDimmerFn(val);
    addLog("analog", joinNum, `${val}% - ${label}`);
  };

  const handleToggleLight = (joinNum, currentState, setToggleFn, label) => {
    const next = !currentState;
    setToggleFn(next);
    addLog("digital", joinNum, `${next ? "HIGH (1)" : "LOW (0)"} - ${label}`);
    setActiveLightsCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
  };

  // HVAC handlers
  const handleChangeTemp = (joinNum, currentVal, setTempFn, delta, label) => {
    const nextVal = Math.max(16, Math.min(30, currentVal + delta));
    setTempFn(nextVal);
    addLog("analog", joinNum, `${nextVal}°C - ${label}`);
  };

  // AV Source
  const handleSelectAVSource = (sourceName, joinNum) => {
    setAvSource(sourceName);
    addLog("digital", joinNum, `HIGH (1) - Selected ${sourceName}`);
    addLog("serial", 2, `"Source: ${sourceName}"`);
  };

  // Gate Unlock
  const handleTriggerGate = () => {
    addLog("digital", 40, "HIGH (1) - Pulse 3s Gate Unlock");
    setGateMessage("🔑 Signal Crestron Join #40 envoyé: Ouverture du Portail Principal (Pulse 3s)");
    setTimeout(() => {
      setGateMessage(null);
      addLog("digital", 40, "LOW (0) - Gate Pulse Completed");
    }, 3500);
  };

  // Alarm Toggle
  const handleToggleAlarm = () => {
    const next = !alarmArmed;
    setAlarmArmed(next);
    addLog("digital", 20, `${next ? "HIGH (1) - ARMÉE" : "LOW (0) - DÉSARMÉE"}`);
  };

  return (
    <div className={`gemini-ui-root chalet-zermatt-ui mode-${deviceMode}`}>
      {/* Top Floating Device Preview Switcher (Pill Dropdown Overlay) */}
      <div className="device-controls-bar">
        <i className="fa-solid fa-globe" style={{ fontSize: "0.95rem", color: "#1e293b" }}></i>
        <select
          value={deviceMode}
          onChange={(e) => setDeviceMode(e.target.value)}
          className="device-mode-select"
        >
          <option value="xpanel">XPanel (Desktop)</option>
          <option value="ipad">iPad (Tablette)</option>
          <option value="ts1070">Crestron TS-1070</option>
          <option value="mobile">Smartphone</option>
        </select>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.75rem", color: "#475569", pointerEvents: "none" }}></i>
      </div>

      {/* Application Top Bar */}
      <header className="top-header">
        <div className="brand-section">
          <div className="crestron-logo">
            <span className="logo-badge">CRESTRON</span>
          </div>
          <div>
            <h1 className="project-title">CHALET ZERMATT</h1>
            <p className="project-subtitle">Zermatt Alpine Luxury Suite • Touch Panel & XPanel</p>
          </div>
        </div>

        <div className="header-status-group">
          <div className="status-indicator">
            <span className="dot" id="conn-dot"></span>
            <span id="conn-text" style={{ fontWeight: 600 }}>CP4-ONLINE (192.168.1.50)</span>
          </div>
          <div className="weather-widget">
            <i className="fa-solid fa-snowflake" style={{ color: "#00e5ff" }}></i>
            <span>Zermatt: -2°C Neige</span>
          </div>
          <div className="time-display">{clockTime || "08:30:00"}</div>
        </div>
      </header>

      {/* Gate Signal Alert Banner */}
      {gateMessage && (
        <div
          style={{
            position: "absolute",
            top: "74px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 229, 255, 0.95)",
            color: "#000",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: "0 4px 20px rgba(0,229,255,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <i className="fa-solid fa-key"></i>
          {gateMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="app-container">
        {/* Navigation Sidebar */}
        <nav className="sidebar">
          <div
            className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <i className="fa-solid fa-house"></i>
            <span>Tableau de Bord</span>
          </div>
          <div
            className={`nav-item ${activeView === "lighting" ? "active" : ""}`}
            onClick={() => setActiveView("lighting")}
          >
            <i className="fa-solid fa-lightbulb"></i>
            <span>Éclairages & DMX</span>
          </div>
          <div
            className={`nav-item ${activeView === "hvac" ? "active" : ""}`}
            onClick={() => setActiveView("hvac")}
          >
            <i className="fa-solid fa-temperature-half"></i>
            <span>Climatisation</span>
          </div>
          <div
            className={`nav-item ${activeView === "avmatrix" ? "active" : ""}`}
            onClick={() => setActiveView("avmatrix")}
          >
            <i className="fa-solid fa-tv"></i>
            <span>Audio / Vidéo</span>
          </div>
          <div
            className={`nav-item ${activeView === "shades" ? "active" : ""}`}
            onClick={() => setActiveView("shades")}
          >
            <i className="fa-solid fa-blinds"></i>
            <span>Volets & Ombrage</span>
          </div>
          <div
            className={`nav-item ${activeView === "security" ? "active" : ""}`}
            onClick={() => setActiveView("security")}
          >
            <i className="fa-solid fa-shield-halved"></i>
            <span>Sécurité & Caméras</span>
          </div>
          <div
            className={`nav-item ${activeView === "spa" ? "active" : ""}`}
            onClick={() => setActiveView("spa")}
          >
            <i className="fa-solid fa-hot-tub-person"></i>
            <span>Spa & Wellness</span>
          </div>
        </nav>

        {/* Main Interactive Content Views */}
        <main className="main-content">
          {/* VIEW 1: DASHBOARD */}
          <section className={`view-section ${activeView === "dashboard" ? "active" : ""}`}>
            <div className="hero-banner">
              <img src="/assets/villa_hero.jpg" alt="Chalet Zermatt" />
              <div className="hero-overlay-text">
                <h1>Bienvenue au Chalet Zermatt</h1>
                <p><i className="fa-solid fa-location-dot"></i> Zermatt, Suisse • Domotique Crestron Active</p>
              </div>
            </div>

            <div className="section-title-bar">
              <h2>Scènes Rapides</h2>
              <span className="section-subtitle">Activation 1-Touch Crestron Digital Joins</span>
            </div>

            <div className="grid-4" style={{ marginBottom: "20px" }}>
              <div
                className={`scene-card ${activeScene === "welcome" ? "active" : ""}`}
                onClick={() => handleTriggerScene("welcome", 10)}
              >
                <div className="scene-icon"><i className="fa-solid fa-key"></i></div>
                <div className="scene-name">Accueil</div>
                <div className="scene-desc">Lumières 70%, HVAC 22°C, Musique Douce</div>
              </div>

              <div
                className={`scene-card ${activeScene === "cinema" ? "active" : ""}`}
                onClick={() => handleTriggerScene("cinema", 11)}
              >
                <div className="scene-icon"><i className="fa-solid fa-film"></i></div>
                <div className="scene-name">Cinéma</div>
                <div className="scene-desc">Volets fermés, Éclairage tamisé, Apple TV</div>
              </div>

              <div
                className={`scene-card ${activeScene === "party" ? "active" : ""}`}
                onClick={() => handleTriggerScene("party", 12)}
              >
                <div className="scene-icon"><i className="fa-solid fa-champagne-glasses"></i></div>
                <div className="scene-name">Soirée</div>
                <div className="scene-desc">Ambiance RGB, Multi-room 80%, Jacuzzi 38°C</div>
              </div>

              <div
                className={`scene-card ${activeScene === "night" ? "active" : ""}`}
                onClick={() => handleTriggerScene("night", 13)}
              >
                <div className="scene-icon"><i className="fa-solid fa-moon"></i></div>
                <div className="scene-name">Nuit & Départ</div>
                <div className="scene-desc">Extinction générale, Alarme armée</div>
              </div>
            </div>

            <div className="grid-3">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-bolt"></i> Statut Résidence</span>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Éclairages actifs: <b style={{ color: "var(--text-main)" }}>{activeLightsCount}/14 Zones</b>
                </p>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Thermostat moyen: <b style={{ color: "var(--crestron-blue)" }}>{tempMaster}.0 °C</b>
                </p>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  Alarme:{" "}
                  <b style={{ color: alarmArmed ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                    {alarmArmed ? "ARMÉE (TOTAL)" : "Désarmée (Normal)"}
                  </b>
                </p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-music"></i> Audio Multi-room</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Zone: <b>Salon Panoramique</b>
                </p>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--crestron-blue)", marginBottom: "10px" }}>
                  {avSource === "Apple TV 4K" ? "Hans Zimmer - Interstellar OST" : avSource}
                </p>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Volume Zone</span>
                    <span className="slider-value">{avVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={avVolume}
                    onChange={(e) => handleDimmerChange(30, e.target.value, setAvVolume, "Volume Multi-room")}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-video"></i> Surveillance Portail</span>
                </div>
                <div className="cctv-container">
                  <img src="/assets/cctv_entrance.jpg" alt="Entrée Chalet" />
                  <div className="cctv-overlay">
                    <span className="rec-dot"></span> EN DIRECT • CAM-01
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* VIEW 2: LIGHTING */}
          <section className={`view-section ${activeView === "lighting" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Gestion des Éclairages</h2>
              <span className="section-subtitle">Variateurs Analogiques & Presets DMX</span>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-lightbulb"></i> Salon & Séjour</span>
                  <button
                    className={`btn-control ${lightSalon ? "active" : ""}`}
                    onClick={() => handleToggleLight(101, lightSalon, setLightSalon, "Salon Light Toggle")}
                  >
                    ON / OFF
                  </button>
                </div>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Intensité Lumineuse (Join #1)</span>
                    <span className="slider-value">{dimSalon}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimSalon}
                    onChange={(e) => handleDimmerChange(1, e.target.value, setDimSalon, "Salon Dimmer")}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-bed"></i> Suite Royale</span>
                  <button
                    className={`btn-control ${lightSuite ? "active" : ""}`}
                    onClick={() => handleToggleLight(102, lightSuite, setLightSuite, "Suite Light Toggle")}
                  >
                    ON / OFF
                  </button>
                </div>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Intensité Lumineuse (Join #2)</span>
                    <span className="slider-value">{dimSuite}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimSuite}
                    onChange={(e) => handleDimmerChange(2, e.target.value, setDimSuite, "Suite Dimmer")}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-umbrella-beach"></i> Terrasse Alpine</span>
                  <button
                    className={`btn-control ${lightTerrasse ? "active" : ""}`}
                    onClick={() => handleToggleLight(103, lightTerrasse, setLightTerrasse, "Terrasse Light Toggle")}
                  >
                    ON / OFF
                  </button>
                </div>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Intensité Lumineuse (Join #3)</span>
                    <span className="slider-value">{dimTerrasse}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimTerrasse}
                    onChange={(e) => handleDimmerChange(3, e.target.value, setDimTerrasse, "Terrasse Dimmer")}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-palette"></i> Éclairage Ambiance RGBW</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                  Sélecteur de Couleur Architecturale DMX (Couleur active: <b style={{ color: rgbColor }}>{rgbColor}</b>)
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["#00e5ff", "#a855f7", "#f5b041", "#10b981", "#f43f5e"].map((c) => (
                    <button
                      key={c}
                      className="btn-circle"
                      style={{ background: c, border: rgbColor === c ? "2px solid #fff" : "1px solid var(--border-card)" }}
                      onClick={() => {
                        setRgbColor(c);
                        addLog("serial", 15, `Couleur DMX RGB = ${c}`);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* VIEW 3: HVAC */}
          <section className={`view-section ${activeView === "hvac" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Climatisation & Thermostats</h2>
              <span className="section-subtitle">Régulation Multi-zone Crestron HVAC</span>
            </div>

            <div className="grid-2">
              <div className="card thermostat-widget">
                <span className="card-title" style={{ marginBottom: "12px" }}>
                  <i className="fa-solid fa-temperature-arrow-up"></i> Suite Royale
                </span>
                <div className="temp-dial">
                  <div className="temp-display">
                    {tempMaster}<span className="temp-unit">°C</span>
                  </div>
                  <div className="temp-target">Consigne Active</div>
                </div>
                <div className="temp-btn-row">
                  <button
                    className="btn-circle"
                    onClick={() => handleChangeTemp(10, tempMaster, setTempMaster, -1, "Suite Temp Decreased")}
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <button
                    className="btn-circle"
                    onClick={() => handleChangeTemp(10, tempMaster, setTempMaster, 1, "Suite Temp Increased")}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>

              <div className="card thermostat-widget">
                <span className="card-title" style={{ marginBottom: "12px" }}>
                  <i className="fa-solid fa-hot-tub-person"></i> Espace Spa & Wellness
                </span>
                <div className="temp-dial" style={{ borderColor: "rgba(245, 176, 65, 0.5)" }}>
                  <div className="temp-display">
                    {tempSpa}<span className="temp-unit">°C</span>
                  </div>
                  <div className="temp-target">Consigne Chauffée</div>
                </div>
                <div className="temp-btn-row">
                  <button
                    className="btn-circle"
                    onClick={() => handleChangeTemp(11, tempSpa, setTempSpa, -1, "Spa Temp Decreased")}
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <button
                    className="btn-circle"
                    onClick={() => handleChangeTemp(11, tempSpa, setTempSpa, 1, "Spa Temp Increased")}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VIEW 4: AUDIO / VIDEO */}
          <section className={`view-section ${activeView === "avmatrix" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Matrice Audio & Vidéo Multi-Room</h2>
              <span className="section-subtitle">Routage Crestron NVX & Sources Streamers</span>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-sliders"></i> Sélection de la Source</span>
                </div>
                <div className="grid-2">
                  <button
                    className={`btn-control ${avSource === "Apple TV 4K" ? "active" : ""}`}
                    onClick={() => handleSelectAVSource("Apple TV 4K", 201)}
                  >
                    <i className="fa-brands fa-apple"></i> Apple TV
                  </button>
                  <button
                    className={`btn-control ${avSource === "Spotify Connect" ? "active" : ""}`}
                    onClick={() => handleSelectAVSource("Spotify Connect", 202)}
                  >
                    <i className="fa-brands fa-spotify"></i> Spotify
                  </button>
                  <button
                    className={`btn-control ${avSource === "Kaleidescape Movie Server" ? "active" : ""}`}
                    onClick={() => handleSelectAVSource("Kaleidescape Movie Server", 203)}
                  >
                    <i className="fa-solid fa-clapperboard"></i> Kaleidescape
                  </button>
                  <button
                    className={`btn-control ${avSource === "Décodeur Satellite HD" ? "active" : ""}`}
                    onClick={() => handleSelectAVSource("Décodeur Satellite HD", 204)}
                  >
                    <i className="fa-solid fa-satellite-dish"></i> TV Satellite
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-volume-high"></i> Volume Home Cinéma</span>
                </div>
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>Volume Amplificateur DM NVX</span>
                    <span className="slider-value">{isMuted ? "MUTE" : `${avVolume}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : avVolume}
                    disabled={isMuted}
                    onChange={(e) => handleDimmerChange(30, e.target.value, setAvVolume, "Volume Ampli NVX")}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 210, "HIGH (1) - Play Transport Signal")}
                  >
                    <i className="fa-solid fa-play"></i> Play
                  </button>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 211, "HIGH (1) - Pause Transport Signal")}
                  >
                    <i className="fa-solid fa-pause"></i> Pause
                  </button>
                  <button
                    className={`btn-control ${isMuted ? "btn-danger active" : "btn-danger"}`}
                    onClick={() => {
                      const next = !isMuted;
                      setIsMuted(next);
                      addLog("digital", 215, `${next ? "HIGH (1) - MUTE ON" : "LOW (0) - MUTE OFF"}`);
                    }}
                  >
                    <i className="fa-solid fa-volume-xmark"></i> {isMuted ? "Muted" : "Mute"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VIEW 5: SHADES */}
          <section className={`view-section ${activeView === "shades" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Volets & Stores Motorisés</h2>
              <span className="section-subtitle">Moteurs Crestron Somfy RTS / Shade Bus</span>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-sun"></i> Salon Panoramique</span>
                </div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 301, "HIGH (1) - Ouvrir Volets Salon")}
                  >
                    <i className="fa-solid fa-arrow-up"></i> Ouvrir
                  </button>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 302, "HIGH (1) - Stop Volets Salon")}
                  >
                    <i className="fa-solid fa-hand"></i> Stop
                  </button>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 303, "HIGH (1) - Fermer Volets Salon")}
                  >
                    <i className="fa-solid fa-arrow-down"></i> Fermer
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-moon"></i> Suite Royale</span>
                </div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 304, "HIGH (1) - Ouvrir Volets Suite")}
                  >
                    <i className="fa-solid fa-arrow-up"></i> Ouvrir
                  </button>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 305, "HIGH (1) - Stop Volets Suite")}
                  >
                    <i className="fa-solid fa-hand"></i> Stop
                  </button>
                  <button
                    className="btn-control"
                    onClick={() => addLog("digital", 306, "HIGH (1) - Fermer Volets Suite")}
                  >
                    <i className="fa-solid fa-arrow-down"></i> Fermer
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VIEW 6: SECURITY */}
          <section className={`view-section ${activeView === "security" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Sécurité & Contrôle d'Accès</h2>
              <span className="section-subtitle">Alarme & Caméras de Surveillance</span>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-door-open"></i> Portail & Entrée</span>
                </div>
                <button
                  className="btn-control"
                  style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
                  onClick={handleTriggerGate}
                >
                  <i className="fa-solid fa-unlock"></i> Déverrouiller le Portail Principal (Digital Join #40)
                </button>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-shield-cat"></i> Système d'Alarme</span>
                </div>
                <p style={{ marginBottom: "10px", fontSize: "0.88rem" }}>
                  Statut:{" "}
                  <b style={{ color: alarmArmed ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                    {alarmArmed ? "ARMÉE (TOTAL)" : "DÉSARMÉE"}
                  </b>
                </p>
                <button
                  className={`btn-control ${alarmArmed ? "btn-danger active" : "btn-danger"}`}
                  style={{ width: "100%", padding: "12px" }}
                  onClick={handleToggleAlarm}
                >
                  <i className="fa-solid fa-shield"></i> Armer / Désarmer l'Alarme (Digital Join #20)
                </button>
              </div>
            </div>
          </section>

          {/* VIEW 7: SPA */}
          <section className={`view-section ${activeView === "spa" ? "active" : ""}`}>
            <div className="section-title-bar">
              <h2>Espace Spa & Wellness</h2>
              <span className="section-subtitle">Piscine Chauffée, Sauna & Jacuzzi</span>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-water"></i> Jacuzzi Hydro-massage</span>
                  <button
                    className={`btn-control ${spaJets ? "active" : ""}`}
                    onClick={() => {
                      const next = !spaJets;
                      setSpaJets(next);
                      addLog("digital", 30, `${next ? "HIGH (1) - Jacuzzi Jets On" : "LOW (0) - Jacuzzi Jets Off"}`);
                    }}
                  >
                    Activer Jets
                  </button>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Température eau: <b>38.5 °C</b>
                </p>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><i className="fa-solid fa-temperature-high"></i> Sauna Nordique</span>
                  <button
                    className={`btn-control ${saunaActive ? "active" : ""}`}
                    onClick={() => {
                      const next = !saunaActive;
                      setSaunaActive(next);
                      addLog("digital", 31, `${next ? "HIGH (1) - Sauna Heating On" : "LOW (0) - Sauna Off"}`);
                    }}
                  >
                    Chauffe Sauna
                  </button>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Température cible: <b>85 °C</b>
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
