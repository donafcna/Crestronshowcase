import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const BoutiqueHermes = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("circadian"); // circadian, scent, audio, astro
  const [circadianAuto, setCircadianAuto] = useState(true);
  const [colorTemp, setColorTemp] = useState(4000); // Kelvin: 2700 to 6500
  const [lightsBrightness, setLightsBrightness] = useState(80);

  const [scentsActive, setScentsActive] = useState(true);
  const [activeScent, setActiveScent] = useState("amber"); // amber, citrus, vanilla
  const [scentIntensity, setScentIntensity] = useState(40); // %

  const [musicVolume, setMusicVolume] = useState(30);
  const [activePlaylist, setActivePlaylist] = useState("jazz"); // jazz, ambient, lobby

  const [storefrontMode, setStorefrontMode] = useState("day"); // day, sunset, night_eco, off
  
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

  // Simulate circadian shift automatically if enabled
  useEffect(() => {
    if (!circadianAuto) return;
    // Simulate time-based kelvin selection:
    // Morning: 3500K, Noon: 5500K, Evening: 3000K
    const date = new Date();
    const hour = date.getHours();
    if (hour >= 9 && hour < 12) {
      setColorTemp(4000);
    } else if (hour >= 12 && hour < 15) {
      setColorTemp(5500);
    } else if (hour >= 15 && hour < 18) {
      setColorTemp(4500);
    } else {
      setColorTemp(3000);
    }
  }, [circadianAuto, timeString]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root boutique-hermes-ui ${deviceType}`}>
      {/* Background Boutique Photo */}
      <div 
        className="boutique-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      {/* Dynamic Tunable White background glow mapping active Kelvin temp */}
      <div 
        className="ambient-bg-glow" 
        style={{ 
          background: `radial-gradient(circle at 50% 10%, ${
            colorTemp <= 3200 
              ? "rgba(245, 158, 11, 0.12)" // Warm amber glow
              : colorTemp >= 5000 
              ? "rgba(14, 165, 233, 0.1)" // Cool blue/white glow
              : "rgba(255, 255, 255, 0.08)" // Natural white
          } 0%, transparent 60%)`
        }} 
      />

      {/* Header */}
      <header className="sunrise-header">
        <div className="header-left">
          {renderIcon("ShoppingBag", 20, "brand-icon-sunrise")}
          <div className="brand-text-block">
            <span className="brand-title">HERMÈS GENÈVE</span>
            <span className="brand-subtitle-room">Showroom Pilot</span>
          </div>
        </div>

        <div className="header-right">
          <div className="weather-widget">
            {renderIcon("Compass", 14, "icon-compass")}
            <span>DALI Broadcast</span>
          </div>
          <div className="time-widget">
            <span>{timeString || "10:30"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar">
            <div className="sidebar-nav-title">Showroom</div>
            
            <button
              onClick={() => setActiveTab("circadian")}
              className={`sidebar-nav-btn ${activeTab === "circadian" ? "active" : ""}`}
            >
              {renderIcon("Sun", 16)}
              <span>Éclairage Blanc</span>
            </button>

            <button
              onClick={() => setActiveTab("scent")}
              className={`sidebar-nav-btn ${activeTab === "scent" ? "active" : ""}`}
            >
              {renderIcon("Activity", 16)}
              <span>Ambiance Olfactive</span>
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`sidebar-nav-btn ${activeTab === "audio" ? "active" : ""}`}
            >
              {renderIcon("Music", 16)}
              <span>Musique de Fond</span>
            </button>

            <button
              onClick={() => setActiveTab("astro")}
              className={`sidebar-nav-btn ${activeTab === "astro" ? "active" : ""}`}
            >
              {renderIcon("Sliders", 16)}
              <span>Horloge Astronomique</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Presets Vitrines</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  setStorefrontMode("day");
                  setCircadianAuto(true);
                  setScentsActive(true);
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Sparkles", 12)}
                <span>Ouverture Showroom</span>
              </button>
              <button 
                onClick={() => {
                  setStorefrontMode("night_eco");
                  setCircadianAuto(false);
                  setColorTemp(2700);
                  setScentsActive(false);
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Moon", 12)}
                <span>Fermeture Éco Vitrine</span>
              </button>
              <button 
                onClick={() => {
                  setStorefrontMode("off");
                  setCircadianAuto(false);
                  setScentsActive(false);
                  setMusicVolume(0);
                }} 
                className="quick-preset-btn-off"
              >
                {renderIcon("Power", 12)}
                <span>Éteindre Système</span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Header Tabs */}
        {isPhone && (
          <div className="zermatt-mobile-tabs">
            <button
              onClick={() => setActiveTab("circadian")}
              className={`mobile-tab-btn ${activeTab === "circadian" ? "active" : ""}`}
            >
              {renderIcon("Sun", 14)}
              <span>Blanc</span>
            </button>
            <button
              onClick={() => setActiveTab("scent")}
              className={`mobile-tab-btn ${activeTab === "scent" ? "active" : ""}`}
            >
              {renderIcon("Activity", 14)}
              <span>Parfum</span>
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`mobile-tab-btn ${activeTab === "audio" ? "active" : ""}`}
            >
              {renderIcon("Music", 14)}
              <span>Musique</span>
            </button>
            <button
              onClick={() => setActiveTab("astro")}
              className={`mobile-tab-btn ${activeTab === "astro" ? "active" : ""}`}
            >
              {renderIcon("Sliders", 14)}
              <span>Horloge</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: CIRCADIAN LIGHTS */}
          {activeTab === "circadian" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Sun", 18, "title-icon icon-yellow")}
                <span>Éclairage Circadien / Tunable White</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Circadian auto mode toggle */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Cycle Solaire Circadien</span>
                  <div className="status-toggle-row">
                    <span>Synchronisation Solaire Auto</span>
                    <button 
                      onClick={() => setCircadianAuto(!circadianAuto)} 
                      className={`zermatt-toggle-switch ${circadianAuto ? "on" : "off"}`}
                    >
                      <span className="slider-knob" />
                    </button>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "8px" }}>
                    Statut : {circadianAuto ? "Blanc dynamique ajusté automatiquement" : "Mode manuel activé"}
                  </div>
                </div>

                {/* Kelvin Temperature slider */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Température de Couleur</span>
                  <div className="dimmer-control-row" style={{ flexDirection: "column", gap: "8px", alignItems: "stretch" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span>Chaud (2700K)</span>
                      <span>Froid (6500K)</span>
                    </div>
                    <input
                      type="range"
                      min="2700"
                      max="6500"
                      step="100"
                      value={colorTemp}
                      onChange={(e) => {
                        setColorTemp(parseInt(e.target.value));
                        setCircadianAuto(false);
                      }}
                      className="zermatt-slider"
                      style={{ background: "linear-gradient(to right, #f59e0b, #fff, #38bdf8)" }}
                    />
                    <div style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: "bold", color: "#34d399", marginTop: "4px" }}>
                      {colorTemp} Kelvin
                    </div>
                  </div>
                </div>

                {/* Brightness Dimmer */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Gradation Générale Showroom (DALI)</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Sliders", 14)}
                      <span>Intensité Lumineuse</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={lightsBrightness}
                      onChange={(e) => setLightsBrightness(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{lightsBrightness}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OLFACTORY DIFFUSERS */}
          {activeTab === "scent" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Activity", 18, "title-icon icon-cyan")}
                <span>Ambiance Olfactive & Senteurs</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Scent selector */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Sélection de la Fragrance</span>
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => setActiveScent("amber")}
                      className={`zermatt-scene-btn cozy ${activeScent === "amber" ? "active" : ""}`}
                    >
                      <span>Bois d'Ambre</span>
                    </button>
                    <button
                      onClick={() => setActiveScent("citrus")}
                      className={`zermatt-scene-btn fireplace ${activeScent === "citrus" ? "active" : ""}`}
                    >
                      <span>Fraîcheur Agrumes</span>
                    </button>
                    <button
                      onClick={() => setActiveScent("vanilla")}
                      className={`zermatt-scene-btn dining ${activeScent === "vanilla" ? "active" : ""}`}
                    >
                      <span>Gousse de Vanille</span>
                    </button>
                  </div>
                </div>

                {/* Diffuser power */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Contrôle Diffuseurs</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Statut : {scentsActive ? "Actif" : "Éteint"}</span>
                    <button 
                      onClick={() => setScentsActive(!scentsActive)} 
                      className={`tv-power-btn ${scentsActive ? "on" : "off"}`}
                    >
                      {renderIcon("Power", 14)}
                      <span>{scentsActive ? "STOP" : "DIFFUSER"}</span>
                    </button>
                  </div>
                </div>

                {/* Scent intensity */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Intensité de Diffusion</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Sliders", 14)}
                      <span>Débit Parfum</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scentIntensity}
                      onChange={(e) => setScentIntensity(parseInt(e.target.value))}
                      className="zermatt-slider"
                      disabled={!scentsActive}
                    />
                    <span className="dimmer-percentage">{scentIntensity}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKGROUND AUDIO */}
          {activeTab === "audio" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Music", 18, "title-icon icon-purple")}
                <span>Musique d'Ambiance Showroom</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Playlist selection */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Ambiance Sonore</span>
                  <div className="scene-buttons-flex" style={{ flexDirection: "column", gap: "6px" }}>
                    <button
                      onClick={() => setActivePlaylist("jazz")}
                      className={`zermatt-scene-btn dining ${activePlaylist === "jazz" ? "active" : ""}`}
                    >
                      {renderIcon("Music", 14)}
                      <span>Jazz & Bossa Nova</span>
                    </button>
                    <button
                      onClick={() => setActivePlaylist("ambient")}
                      className={`zermatt-scene-btn cozy ${activePlaylist === "ambient" ? "active" : ""}`}
                    >
                      {renderIcon("Sparkles", 14)}
                      <span>Lounge Minimaliste</span>
                    </button>
                    <button
                      onClick={() => setActivePlaylist("lobby")}
                      className={`zermatt-scene-btn fireplace ${activePlaylist === "lobby" ? "active" : ""}`}
                    >
                      {renderIcon("Home", 14)}
                      <span>Classique Acoustique</span>
                    </button>
                  </div>
                </div>

                {/* Scent intensity / audio volume slider */}
                <div className="control-section-card glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span className="section-subtitle">Volume Showroom</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block" style={{ width: "80px" }}>
                      {renderIcon("Volume2", 14)}
                      <span>Volume</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{musicVolume}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASTRONOMICAL SCHEDULING */}
          {activeTab === "astro" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Sliders", 18, "title-icon icon-yellow")}
                <span>Horloge Astronomique & Scénarios Vitrine</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Astro presets */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Scénarios Vitrine Automatisés</span>
                  <p className="section-explanation-text">
                    Permet d'enclencher ou de tester les presets de vitrine qui s'adaptent automatiquement par rapport à l'heure du coucher du soleil à Genève.
                  </p>
                  
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => setStorefrontMode("day")}
                      className={`zermatt-scene-btn cozy ${storefrontMode === "day" ? "active" : ""}`}
                    >
                      <span>Vitrine Jour</span>
                    </button>
                    <button
                      onClick={() => setStorefrontMode("sunset")}
                      className={`zermatt-scene-btn fireplace ${storefrontMode === "sunset" ? "active" : ""}`}
                    >
                      <span>Coucher de Soleil</span>
                    </button>
                    <button
                      onClick={() => setStorefrontMode("night_eco")}
                      className={`zermatt-scene-btn dining ${storefrontMode === "night_eco" ? "active" : ""}`}
                    >
                      <span>Nuit Éco (30% Lumière)</span>
                    </button>
                    <button
                      onClick={() => setStorefrontMode("off")}
                      className={`zermatt-scene-btn off ${storefrontMode === "off" ? "active" : ""}`}
                    >
                      <span>Vitrine Off</span>
                    </button>
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
