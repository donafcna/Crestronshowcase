import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const ChaletZermatt = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("lights"); // lights, climate, audio_video, cctv
  const [lightsColor, setLightsColor] = useState("#ff9f1c"); // Current RGB theme color
  const [ambientScene, setAmbientScene] = useState("cozy"); // cozy, fireplace, dining, off
  const [dimmers, setDimmers] = useState({
    lustre: 75,
    poutres: 40,
    cheminee: 50,
  });

  const [setpointTemp, setSetpointTemp] = useState(22.5);
  const [currentTemp, setCurrentTemp] = useState(22.1);
  const [floorHeatingActive, setFloorHeatingActive] = useState(true);
  const [fireplaceFanSpeed, setFireplaceFanSpeed] = useState(60); // 0 to 100

  const [tvPower, setTvPower] = useState(false);
  const [avSource, setAvSource] = useState("appletv"); // appletv, sat, bluray, audio_only
  const [audioVolume, setAudioVolume] = useState(45);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(28);

  const [selectedCamera, setSelectedCamera] = useState("pistes"); // pistes, entrance, jacuzzi
  const [cameraZoom, setCameraZoom] = useState(1); // 1x, 2x, 4x
  const [isRecording, setIsRecording] = useState(true);

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

  // Track progress bar animation simulation
  useEffect(() => {
    if (!isAudioPlaying) return;
    const interval = setInterval(() => {
      setTrackProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isAudioPlaying]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleSceneSelect = (scene) => {
    setAmbientScene(scene);
    if (scene === "cozy") {
      setDimmers({ lustre: 50, poutres: 60, cheminee: 30 });
      setLightsColor("#ff9f1c"); // Warm Amber
    } else if (scene === "fireplace") {
      setDimmers({ lustre: 20, poutres: 30, cheminee: 80 });
      setLightsColor("#e73c7e"); // Deep Fire Sunset
    } else if (scene === "dining") {
      setDimmers({ lustre: 80, poutres: 40, cheminee: 40 });
      setLightsColor("#4f46e5"); // Elegant Royal Blue
    } else if (scene === "off") {
      setDimmers({ lustre: 0, poutres: 0, cheminee: 0 });
      setLightsColor("#1e293b"); // Sleep Dark
    }
  };

  const isPhone = deviceType === "phone";

  const cameraFeeds = {
    pistes: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=400&q=80", // snowy mountains Zermatt
    entrance: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80", // chalet snowy door
    jacuzzi: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80", // jacuzzi with outdoor winter steam
  };

  return (
    <div className={`gemini-ui-root chalet-zermatt-ui ${deviceType}`}>
      {/* Background Chalet Photo */}
      <div 
        className="chalet-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          pointerEvents: "none",
          zIndex: 1
        }}
      />
      {/* Alpine Chalet Background Glow mapping active colors */}
      <div 
        className="ambient-bg-glow" 
        style={{ 
          background: `radial-gradient(circle at 80% 20%, ${lightsColor}33 0%, transparent 50%)`
        }} 
      />

      {/* Header */}
      <header className="zermatt-header">
        <div className="header-left">
          {renderIcon("Mountain", 20, "brand-icon-zermatt")}
          <div className="brand-text-block">
            <span className="brand-title">CHALET ZERMATT</span>
            <span className="brand-subtitle-room">Salon Lounge</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="weather-widget">
            {renderIcon("CloudSnow", 16, "icon-snow")}
            <span>Zermatt -4°C</span>
          </div>
          <div className="time-widget">
            <span>{timeString || "19:30"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="zermatt-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="zermatt-sidebar">
            <div className="sidebar-nav-title">Contrôles</div>
            <button
              onClick={() => setActiveTab("lights")}
              className={`sidebar-nav-btn ${activeTab === "lights" ? "active" : ""}`}
            >
              {renderIcon("Lightbulb", 16)}
              <span>Éclairage</span>
            </button>
            <button
              onClick={() => setActiveTab("climate")}
              className={`sidebar-nav-btn ${activeTab === "climate" ? "active" : ""}`}
            >
              {renderIcon("Thermometer", 16)}
              <span>Chauffage & CVC</span>
            </button>
            <button
              onClick={() => setActiveTab("audio_video")}
              className={`sidebar-nav-btn ${activeTab === "audio_video" ? "active" : ""}`}
            >
              {renderIcon("Tv", 16)}
              <span>Audio & Vidéo</span>
            </button>
            <button
              onClick={() => setActiveTab("cctv")}
              className={`sidebar-nav-btn ${activeTab === "cctv" ? "active" : ""}`}
            >
              {renderIcon("Camera", 16)}
              <span>Caméras CCTV</span>
            </button>

            {/* Quick Presets Section */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Raccourcis Salon</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  setTvPower(true);
                  setAvSource("appletv");
                  handleSceneSelect("cozy");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Film", 12)}
                <span>Soirée Cinéma</span>
              </button>
              <button 
                onClick={() => {
                  setTvPower(false);
                  setIsAudioPlaying(true);
                  handleSceneSelect("fireplace");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Flame", 12)}
                <span>Coin du Feu</span>
              </button>
              <button 
                onClick={() => {
                  handleSceneSelect("off");
                  setIsAudioPlaying(false);
                  setTvPower(false);
                }} 
                className="quick-preset-btn-off"
              >
                {renderIcon("Power", 12)}
                <span>Éteindre Tout</span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Header Tabs */}
        {isPhone && (
          <div className="zermatt-mobile-tabs">
            <button
              onClick={() => setActiveTab("lights")}
              className={`mobile-tab-btn ${activeTab === "lights" ? "active" : ""}`}
            >
              {renderIcon("Lightbulb", 14)}
              <span>Lumières</span>
            </button>
            <button
              onClick={() => setActiveTab("climate")}
              className={`mobile-tab-btn ${activeTab === "climate" ? "active" : ""}`}
            >
              {renderIcon("Thermometer", 14)}
              <span>Climat</span>
            </button>
            <button
              onClick={() => setActiveTab("audio_video")}
              className={`mobile-tab-btn ${activeTab === "audio_video" ? "active" : ""}`}
            >
              {renderIcon("Tv", 14)}
              <span>Multimédia</span>
            </button>
            <button
              onClick={() => setActiveTab("cctv")}
              className={`mobile-tab-btn ${activeTab === "cctv" ? "active" : ""}`}
            >
              {renderIcon("Camera", 14)}
              <span>Caméras</span>
            </button>
          </div>
        )}

        {/* Main Panel Content Area */}
        <main className="zermatt-content">
          
          {/* TAB 1: LIGHTS */}
          {activeTab === "lights" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Lightbulb", 18, "title-icon icon-yellow")}
                <span>Gestion de l'Éclairage</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Ambient Scene Presets */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Scènes d'Ambiance</span>
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => handleSceneSelect("cozy")}
                      className={`zermatt-scene-btn cozy ${ambientScene === "cozy" ? "active" : ""}`}
                    >
                      {renderIcon("Home", 14)}
                      <span>Ambiance Cozy</span>
                    </button>
                    <button
                      onClick={() => handleSceneSelect("fireplace")}
                      className={`zermatt-scene-btn fireplace ${ambientScene === "fireplace" ? "active" : ""}`}
                    >
                      {renderIcon("Flame", 14)}
                      <span>Feu de Bois</span>
                    </button>
                    <button
                      onClick={() => handleSceneSelect("dining")}
                      className={`zermatt-scene-btn dining ${ambientScene === "dining" ? "active" : ""}`}
                    >
                      {renderIcon("Utensils", 14)}
                      <span>Dîner Tamisé</span>
                    </button>
                    <button
                      onClick={() => handleSceneSelect("off")}
                      className={`zermatt-scene-btn off ${ambientScene === "off" ? "active" : ""}`}
                    >
                      {renderIcon("Power", 14)}
                      <span>Extinction</span>
                    </button>
                  </div>
                </div>

                {/* Color presets */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Scènes de Couleur LED</span>
                  <div className="color-presets-row">
                    <button 
                      onClick={() => setLightsColor("#ff9f1c")} 
                      className={`color-pill ${lightsColor === "#ff9f1c" ? "selected" : ""}`}
                      style={{ background: "#ff9f1c" }}
                      title="Warm Amber"
                    />
                    <button 
                      onClick={() => setLightsColor("#ef4444")} 
                      className={`color-pill ${lightsColor === "#ef4444" ? "selected" : ""}`}
                      style={{ background: "#ef4444" }}
                      title="Alpine Sunset Red"
                    />
                    <button 
                      onClick={() => setLightsColor("#e73c7e")} 
                      className={`color-pill ${lightsColor === "#e73c7e" ? "selected" : ""}`}
                      style={{ background: "#e73c7e" }}
                      title="Magenta Fire"
                    />
                    <button 
                      onClick={() => setLightsColor("#06b6d4")} 
                      className={`color-pill ${lightsColor === "#06b6d4" ? "selected" : ""}`}
                      style={{ background: "#06b6d4" }}
                      title="Glacier Ice Cyan"
                    />
                    <button 
                      onClick={() => setLightsColor("#10b981")} 
                      className={`color-pill ${lightsColor === "#10b981" ? "selected" : ""}`}
                      style={{ background: "#10b981" }}
                      title="Forest Pine Green"
                    />
                    <button 
                      onClick={() => setLightsColor("#4f46e5")} 
                      className={`color-pill ${lightsColor === "#4f46e5" ? "selected" : ""}`}
                      style={{ background: "#4f46e5" }}
                      title="Midnight Royal Blue"
                    />
                  </div>
                  <div className="color-status-text">
                    Teinte active : <span style={{ color: lightsColor, fontWeight: "bold" }}>{lightsColor}</span>
                  </div>
                </div>

                {/* Dimmers list */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Gradateurs Fins (KNX)</span>
                  <div className="sliders-list-block">
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Sparkles", 14)}
                        <span>Lustre en Corne</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.lustre}
                        onChange={(e) => setDimmers({ ...dimmers, lustre: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.lustre}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Menu", 14)}
                        <span>LED Poutres Bois</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.poutres}
                        onChange={(e) => setDimmers({ ...dimmers, poutres: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.poutres}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Flame", 14)}
                        <span>Appliques Cheminée</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.cheminee}
                        onChange={(e) => setDimmers({ ...dimmers, cheminee: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.cheminee}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIMATE */}
          {activeTab === "climate" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Thermometer", 18, "title-icon icon-cyan")}
                <span>Gestion HVAC & Chauffage</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Thermostat Display */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Consigne Thermostat</span>
                  <div className="zermatt-thermostat-widget">
                    <div className="thermostat-temp-bubble">
                      <span className="target-temp-val">{setpointTemp}°C</span>
                      <span className="measured-temp-val">Mesuré : {currentTemp}°C</span>
                    </div>
                    <div className="thermostat-controls">
                      <button 
                        onClick={() => setSetpointTemp((t) => parseFloat((t - 0.5).toFixed(1)))} 
                        className="temp-adjust-btn"
                      >
                        {renderIcon("Minus", 16)}
                      </button>
                      <button 
                        onClick={() => setSetpointTemp((t) => parseFloat((t + 0.5).toFixed(1)))} 
                        className="temp-adjust-btn"
                      >
                        {renderIcon("Plus", 16)}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Geothermal Floor Heating Status */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Chauffage Géothermique</span>
                  <div className="geothermal-status-card">
                    <div className="status-toggle-row">
                      <span className="status-label">Dalles Chauffantes</span>
                      <button 
                        onClick={() => setFloorHeatingActive(!floorHeatingActive)} 
                        className={`zermatt-toggle-switch ${floorHeatingActive ? "on" : "off"}`}
                      >
                        <span className="slider-knob" />
                      </button>
                    </div>
                    <div className="heating-indicators">
                      <div className="indicator-pill">
                        <span className="indicator-dot red-glow" style={{ opacity: floorHeatingActive ? 1 : 0.2 }} />
                        <span>{floorHeatingActive ? "Actif (Circulation)" : "Inactif"}</span>
                      </div>
                      <div className="indicator-pill text-grey">
                        {renderIcon("Activity", 12)}
                        <span>Flux: 3.2 L/min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cheminée Heat fan Speed */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Ventilation Récupérateur Cheminée</span>
                  <p className="section-explanation-text">
                    Régule la vitesse des ventilateurs de conduits d'air chaud pour diffuser la chaleur du poêle de masse dans le salon.
                  </p>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Wind", 14)}
                      <span>Vitesse Soufflerie</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fireplaceFanSpeed}
                      onChange={(e) => setFireplaceFanSpeed(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{fireplaceFanSpeed}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO / VIDEO */}
          {activeTab === "audio_video" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Tv", 18, "title-icon icon-purple")}
                <span>Multimédia & Sources A/V</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* TV power and sources */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Téléviseur Principal</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Statut : {tvPower ? "Allumé" : "Éteint"}</span>
                    <button 
                      onClick={() => setTvPower(!tvPower)} 
                      className={`tv-power-btn ${tvPower ? "on" : "off"}`}
                    >
                      {renderIcon("Power", 16)}
                      <span>{tvPower ? "OFF" : "ON"}</span>
                    </button>
                  </div>

                  <span className="section-subtitle" style={{ marginTop: "15px", display: "block" }}>Source active</span>
                  <div className="av-source-grid">
                    <button 
                      onClick={() => setAvSource("appletv")} 
                      className={`av-source-btn ${avSource === "appletv" ? "active" : ""}`}
                      disabled={!tvPower}
                    >
                      <span>Apple TV 4K</span>
                    </button>
                    <button 
                      onClick={() => setAvSource("sat")} 
                      className={`av-source-btn ${avSource === "sat" ? "active" : ""}`}
                      disabled={!tvPower}
                    >
                      <span>Décodeur Sat</span>
                    </button>
                    <button 
                      onClick={() => setAvSource("bluray")} 
                      className={`av-source-btn ${avSource === "bluray" ? "active" : ""}`}
                      disabled={!tvPower}
                    >
                      <span>Lecteur Blu-ray</span>
                    </button>
                    <button 
                      onClick={() => setAvSource("audio_only")} 
                      className={`av-source-btn ${avSource === "audio_only" ? "active" : ""}`}
                    >
                      <span>Audio Seul</span>
                    </button>
                  </div>
                </div>

                {/* Spotify Audio Control */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Lecteur Spotify (Sonos Zone)</span>
                  <div className="spotify-player-widget">
                    <div className="spotify-track-info">
                      <div className="album-art-square">
                        {renderIcon("Music", 28, "album-fallback-ic")}
                      </div>
                      <div className="track-details">
                        <span className="track-title-txt">Alpine Chill Lounge</span>
                        <span className="track-artist-txt">Zermatt Lounge Session</span>
                      </div>
                    </div>

                    <div className="spotify-progress-bar">
                      <span className="progress-time">0:45</span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${trackProgress}%` }} />
                      </div>
                      <span className="progress-time">3:40</span>
                    </div>

                    <div className="spotify-controls">
                      <button className="sp-btn">{renderIcon("SkipBack", 14)}</button>
                      <button 
                        onClick={() => setIsAudioPlaying(!isAudioPlaying)} 
                        className={`sp-btn play-pause ${isAudioPlaying ? "playing" : ""}`}
                      >
                        {isAudioPlaying ? renderIcon("Pause", 16) : renderIcon("Play", 16)}
                      </button>
                      <button className="sp-btn">{renderIcon("SkipForward", 14)}</button>
                    </div>
                  </div>
                </div>

                {/* Audio volume slider */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Volume Sonos Amplificateurs Salon</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Volume2", 14)}
                      <span>Puissance Sonore</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{audioVolume}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CCTV SECURITY CAMERAS */}
          {activeTab === "cctv" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Camera", 18, "title-icon icon-green")}
                <span>Système de Caméras de Surveillance</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* CCTV Selector and Live Feed View */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Caméras en Direct (H.264 HD)</span>
                  
                  <div className="cctv-main-flex-block">
                    <div className="cctv-selector-column">
                      <button
                        onClick={() => setSelectedCamera("pistes")}
                        className={`cctv-tab-btn ${selectedCamera === "pistes" ? "active" : ""}`}
                      >
                        {renderIcon("Mountain", 14)}
                        <span>Vue Pistes Ski</span>
                      </button>
                      <button
                        onClick={() => setSelectedCamera("entrance")}
                        className={`cctv-tab-btn ${selectedCamera === "entrance" ? "active" : ""}`}
                      >
                        {renderIcon("Home", 14)}
                        <span>Porte d'Entrée</span>
                      </button>
                      <button
                        onClick={() => setSelectedCamera("jacuzzi")}
                        className={`cctv-tab-btn ${selectedCamera === "jacuzzi" ? "active" : ""}`}
                      >
                        {renderIcon("Droplet", 14)}
                        <span>Terrasse Jacuzzi</span>
                      </button>

                      <div className="cctv-actions-card">
                        <span className="cctv-action-lbl">Contrôle Zoom</span>
                        <div className="zoom-buttons">
                          <button 
                            onClick={() => setCameraZoom(1)} 
                            className={`zoom-btn ${cameraZoom === 1 ? "active" : ""}`}
                          >
                            1x
                          </button>
                          <button 
                            onClick={() => setCameraZoom(2)} 
                            className={`zoom-btn ${cameraZoom === 2 ? "active" : ""}`}
                          >
                            2x
                          </button>
                          <button 
                            onClick={() => setCameraZoom(4)} 
                            className={`zoom-btn ${cameraZoom === 4 ? "active" : ""}`}
                          >
                            4x
                          </button>
                        </div>

                        <div className="recording-toggle-block" style={{ marginTop: "15px" }}>
                          <span className="cctv-action-lbl">Enregistreur NVR</span>
                          <button 
                            onClick={() => setIsRecording(!isRecording)} 
                            className={`rec-toggle-btn ${isRecording ? "on" : "off"}`}
                          >
                            <span className="rec-dot" style={{ opacity: isRecording ? 1 : 0.2 }} />
                            <span>{isRecording ? "ENR. ACTIF" : "PAUSE"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Camera Feed Viewer Screen */}
                    <div className="cctv-viewer-container">
                      {isRecording && <span className="live-pill">REC LIVE</span>}
                      
                      <div className="feed-image-wrapper">
                        <img 
                          src={cameraFeeds[selectedCamera]} 
                          alt="Camera Live Feed" 
                          className="cctv-feed-img"
                          style={{
                            transform: `scale(${cameraZoom})`,
                            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                        />
                      </div>

                      <div className="cctv-info-footer">
                        <span>CAM_{selectedCamera.toUpperCase()}</span>
                        <span>1080p // {isRecording ? "30 FPS" : "Flux Suspendu"}</span>
                      </div>
                    </div>
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
