import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const ClubEtoile = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("hvac"); // hvac, audio_limit, effects
  const [crowdDensity, setCrowdDensity] = useState("busy"); // cozy, busy, packed
  const [fanSpeed, setFanSpeed] = useState(65);
  const [targetTemp, setTargetTemp] = useState(19.0);

  const [dancefloorVolume, setDancefloorVolume] = useState(90);
  const [barVolume, setBarVolume] = useState(60);
  const [currentDb, setCurrentDb] = useState(102);
  const [limiterTripped, setLimiterTripped] = useState(false);

  const [smokeActive, setSmokeActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeFreq, setStrobeFreq] = useState(8); // Hz

  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeString(
        date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // HVAC automation based on crowd density
  useEffect(() => {
    if (crowdDensity === "cozy") {
      setFanSpeed(35);
      setTargetTemp(21.0);
    } else if (crowdDensity === "busy") {
      setFanSpeed(65);
      setTargetTemp(19.0);
    } else if (crowdDensity === "packed") {
      setFanSpeed(100);
      setTargetTemp(17.0);
    }
  }, [crowdDensity]);

  // DB sound level fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const baseDb = 10 + Math.floor(dancefloorVolume * 0.95);
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      const finalDb = baseDb + fluctuation;
      setCurrentDb(finalDb);
      setLimiterTripped(finalDb >= 105);
    }, 1000);
    return () => clearInterval(interval);
  }, [dancefloorVolume]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root club-etoile-ui ${deviceType}`}>
      {/* Background Discotheque Photo */}
      <div 
        className="club-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      {/* Dynamic flashing DMX background indicator if strobe is on */}
      <div 
        className={`ambient-bg-glow ${strobeActive ? "strobe-flashing-effect" : ""}`}
        style={{ 
          background: strobeActive 
            ? "rgba(255, 255, 255, 0.05)" 
            : "radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)",
          zIndex: 1
        }} 
      />

      {/* Header */}
      <header className="sunrise-header">
        <div className="header-left">
          {renderIcon("Music", 20, "brand-icon-sunrise")}
          <div className="brand-text-block">
            <span className="brand-title">L'ÉTOILE CLUB</span>
            <span className="brand-subtitle-room">Régie Technique</span>
          </div>
        </div>

        <div className="header-right">
          <div className={`db-widget ${limiterTripped ? "warning-db" : ""}`}>
            {renderIcon("Activity", 14)}
            <span>{currentDb} dB</span>
          </div>
          <div className="time-widget">
            <span>{timeString || "02:00"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar">
            <div className="sidebar-nav-title">Régie Club</div>
            
            <button
              onClick={() => setActiveTab("hvac")}
              className={`sidebar-nav-btn ${activeTab === "hvac" ? "active" : ""}`}
            >
              {renderIcon("Wind", 16)}
              <span>Ventilation & Clim</span>
            </button>

            <button
              onClick={() => setActiveTab("audio_limit")}
              className={`sidebar-nav-btn ${activeTab === "audio_limit" ? "active" : ""}`}
            >
              {renderIcon("VolumeX", 16)}
              <span>Limiteur Audio</span>
            </button>

            <button
              onClick={() => setActiveTab("effects")}
              className={`sidebar-nav-btn ${activeTab === "effects" ? "active" : ""}`}
            >
              {renderIcon("Zap", 16)}
              <span>Effets DMX & Fumée</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Raccourcis Régie</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  setCrowdDensity("packed");
                  setStrobeActive(true);
                  setSmokeActive(true);
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Sparkles", 12)}
                <span>Alerte Peak Affluence</span>
              </button>
              <button 
                onClick={() => {
                  setStrobeActive(false);
                  setSmokeActive(false);
                  setCrowdDensity("cozy");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Moon", 12)}
                <span>Calme / Fin Service</span>
              </button>
              <button 
                onClick={() => {
                  setStrobeActive(false);
                  setSmokeActive(false);
                  setDancefloorVolume(0);
                  setBarVolume(0);
                  setCrowdDensity("cozy");
                }} 
                className="quick-preset-btn-off"
              >
                {renderIcon("Power", 12)}
                <span>Extinction Son & Effets</span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Header Tabs */}
        {isPhone && (
          <div className="zermatt-mobile-tabs">
            <button
              onClick={() => setActiveTab("hvac")}
              className={`mobile-tab-btn ${activeTab === "hvac" ? "active" : ""}`}
            >
              {renderIcon("Wind", 14)}
              <span>HVAC</span>
            </button>
            <button
              onClick={() => setActiveTab("audio_limit")}
              className={`mobile-tab-btn ${activeTab === "audio_limit" ? "active" : ""}`}
            >
              {renderIcon("VolumeX", 14)}
              <span>Son DB</span>
            </button>
            <button
              onClick={() => setActiveTab("effects")}
              className={`mobile-tab-btn ${activeTab === "effects" ? "active" : ""}`}
            >
              {renderIcon("Zap", 14)}
              <span>DMX & Fumée</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: HVAC */}
          {activeTab === "hvac" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Wind", 18, "title-icon icon-blue")}
                <span>Régulation Climatique Intensive</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Affluence / Crowd selector */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Affluence Estimée</span>
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => setCrowdDensity("cozy")}
                      className={`zermatt-scene-btn cozy ${crowdDensity === "cozy" ? "active" : ""}`}
                    >
                      {renderIcon("Home", 14)}
                      <span>Calme (&lt;200 p.)</span>
                    </button>
                    <button
                      onClick={() => setCrowdDensity("busy")}
                      className={`zermatt-scene-btn fireplace ${crowdDensity === "busy" ? "active" : ""}`}
                    >
                      {renderIcon("Sliders", 14)}
                      <span>Normal (500 p.)</span>
                    </button>
                    <button
                      onClick={() => setCrowdDensity("packed")}
                      className={`zermatt-scene-btn dining ${crowdDensity === "packed" ? "active" : ""}`}
                    >
                      {renderIcon("Activity", 14)}
                      <span>Peak (&gt;1000 p.)</span>
                    </button>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Statut Centrales de Traitement d'Air</span>
                  <div className="geothermal-status-card">
                    <div className="status-toggle-row">
                      <span className="status-label">CTA-1 & CTA-2 (Renouvellement)</span>
                      <span className="indicator-pill text-green">
                        <span className="indicator-dot red-glow" style={{ backgroundColor: "#10b981" }} />
                        <span>En ligne</span>
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "8px" }}>
                      Température cible CVC : {targetTemp}°C (adaptée à l'affluence)
                    </div>
                  </div>
                </div>

                {/* Ventilation slider */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Vitesse d'Extraction d'Air (CTA)</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Wind", 14)}
                      <span>Ventilateurs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fanSpeed}
                      onChange={(e) => setFanSpeed(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{fanSpeed}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO LIMITERS */}
          {activeTab === "audio_limit" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("VolumeX", 18, "title-icon icon-purple")}
                <span>Limiteurs Décibels & Multi-zones</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Decibel live meter */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Capteur Acoustique Piste</span>
                  <div className="zermatt-thermostat-widget">
                    <div className={`thermostat-temp-bubble ${limiterTripped ? "warning-db-bubble" : ""}`} style={{ borderColor: limiterTripped ? "#ef4444" : "#c084fc" }}>
                      <span className="target-temp-val" style={{ color: limiterTripped ? "#ef4444" : "#c084fc", textShadow: limiterTripped ? "0 0 8px rgba(239, 68, 68, 0.4)" : "0 0 8px rgba(192, 132, 252, 0.4)" }}>{currentDb} dB</span>
                      <span className="measured-temp-val">Seuil Max: 105 dB</span>
                    </div>
                    {limiterTripped && (
                      <div className="text-red" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                        ⚠️ ALERTE : BRUIT EXCÉSIF (ATTÉNUATION ACTIVE)
                      </div>
                    )}
                  </div>
                </div>

                {/* Master Volume Sliders */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Niveaux de Puissance Sonore</span>
                  <div className="sliders-list-block">
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block" style={{ width: "100px" }}>
                        <span>Dancefloor</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dancefloorVolume}
                        onChange={(e) => setDancefloorVolume(parseInt(e.target.value))}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dancefloorVolume}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block" style={{ width: "100px" }}>
                        <span>Zone Bars</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={barVolume}
                        onChange={(e) => setBarVolume(parseInt(e.target.value))}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{barVolume}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DMX EFFECTS & SMOKE */}
          {activeTab === "effects" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Zap", 18, "title-icon icon-green")}
                <span>Effets Scéniques & Machines DMX</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Smoke machine toggle */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Effet Fumée CO2</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Machine CO2 : {smokeActive ? "Jet Actif" : "Prêt"}</span>
                    <button 
                      onClick={() => setSmokeActive(!smokeActive)} 
                      className={`tv-power-btn ${smokeActive ? "on" : "off"}`}
                      style={{ backgroundColor: smokeActive ? "#10b981" : "rgba(255,255,255,0.05)" }}
                    >
                      {renderIcon("Wind", 14)}
                      <span>{smokeActive ? "STOP JET" : "LANCER JET"}</span>
                    </button>
                  </div>
                </div>

                {/* Stroboscope control */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Stroboscope Piste</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Strobe : {strobeActive ? "Actif" : "Éteint"}</span>
                    <button 
                      onClick={() => setStrobeActive(!strobeActive)} 
                      className={`tv-power-btn ${strobeActive ? "on" : "off"}`}
                    >
                      {renderIcon("Zap", 14)}
                      <span>{strobeActive ? "STOP" : "LANCER"}</span>
                    </button>
                  </div>

                  <div className="dimmer-control-row" style={{ marginTop: "12px" }}>
                    <div className="dimmer-label-block" style={{ width: "90px" }}>
                      <span>Fréquence</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={strobeFreq}
                      onChange={(e) => setStrobeFreq(parseInt(e.target.value))}
                      className="zermatt-slider"
                      disabled={!strobeActive}
                    />
                    <span className="dimmer-percentage">{strobeFreq} Hz</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
