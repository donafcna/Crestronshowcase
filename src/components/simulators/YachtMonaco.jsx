import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const YachtMonaco = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("ambient_lights"); // ambient_lights, disco_lights, audio
  const [lightsColor, setLightsColor] = useState("#00ffff"); // Default color: Cyan
  const [ambientScene, setAmbientScene] = useState("cozy"); // cozy, sunset, dining, off
  const [dimmers, setDimmers] = useState({
    mainDeckCeiling: 80,
    ledStripAft: 50,
    underwaterGlow: 70,
  });

  const [discoPreset, setDiscoPreset] = useState("off"); // off, strobe, blue_wave, rainbow, laser
  const [discoSpeed, setDiscoSpeed] = useState(50); // Lyres rotation speed

  const [audioPreset, setAudioPreset] = useState("lounge"); // lounge, club, chill, vip, mute
  const [audioVolume, setAudioVolume] = useState(55);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(15);
  
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
    }, 1200);
    return () => clearInterval(interval);
  }, [isAudioPlaying]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleAmbientScene = (scene) => {
    setAmbientScene(scene);
    if (scene === "cozy") {
      setDimmers({ mainDeckCeiling: 50, ledStripAft: 40, underwaterGlow: 30 });
      setLightsColor("#ff9f1c"); // Warm Gold
    } else if (scene === "sunset") {
      setDimmers({ mainDeckCeiling: 70, ledStripAft: 80, underwaterGlow: 90 });
      setLightsColor("#f43f5e"); // Sunset Red/Rose
    } else if (scene === "dining") {
      setDimmers({ mainDeckCeiling: 85, ledStripAft: 50, underwaterGlow: 40 });
      setLightsColor("#4f46e5"); // Royal Indigo
    } else if (scene === "off") {
      setDimmers({ mainDeckCeiling: 0, ledStripAft: 0, underwaterGlow: 0 });
      setLightsColor("#0f172a"); // Dark slate
    }
  };

  const handleDiscoPreset = (preset) => {
    setDiscoPreset(preset);
    if (preset === "strobe") {
      setLightsColor("#ffffff");
      setDiscoSpeed(95);
    } else if (preset === "blue_wave") {
      setLightsColor("#06b6d4");
      setDiscoSpeed(40);
    } else if (preset === "rainbow") {
      setLightsColor("#a855f7");
      setDiscoSpeed(65);
    } else if (preset === "laser") {
      setLightsColor("#10b981");
      setDiscoSpeed(80);
    } else if (preset === "off") {
      setDiscoSpeed(0);
    }
  };

  const handleAudioPreset = (preset) => {
    setAudioPreset(preset);
    if (preset === "lounge") {
      setAudioVolume(40);
      setIsAudioPlaying(true);
    } else if (preset === "club") {
      setAudioVolume(85);
      setIsAudioPlaying(true);
    } else if (preset === "chill") {
      setAudioVolume(55);
      setIsAudioPlaying(true);
    } else if (preset === "vip") {
      setAudioVolume(30);
      setIsAudioPlaying(false);
    } else if (preset === "mute") {
      setAudioVolume(0);
    }
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root yacht-sunrise-ui ${deviceType}`}>
      {/* Background Yacht Photo */}
      <div 
        className="yacht-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      {/* Dynamic ocean-dmx ambient background glow */}
      <div 
        className="ambient-bg-glow" 
        style={{ 
          background: `radial-gradient(circle at 50% 10%, ${lightsColor}26 0%, transparent 60%)`
        }} 
      />

      {/* Header */}
      <header className="sunrise-header">
        <div className="header-left">
          {renderIcon("Ship", 20, "brand-icon-sunrise")}
          <div className="brand-text-block">
            <span className="brand-title">MY SUNRISE</span>
            <span className="brand-subtitle-room">Main Deck Control</span>
          </div>
        </div>

        <div className="header-right">
          <div className="yacht-speed-widget">
            {renderIcon("Compass", 14, "icon-compass")}
            <span>14.5 KTS</span>
          </div>
          <div className="time-widget">
            <span>{timeString || "12:00"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar">
            <div className="sidebar-nav-title">Secteurs Main Deck</div>
            
            <button
              onClick={() => setActiveTab("ambient_lights")}
              className={`sidebar-nav-btn ${activeTab === "ambient_lights" ? "active" : ""}`}
            >
              {renderIcon("Sun", 16)}
              <span>Éclairage Ambiance</span>
            </button>

            <button
              onClick={() => setActiveTab("disco_lights")}
              className={`sidebar-nav-btn ${activeTab === "disco_lights" ? "active" : ""}`}
            >
              {renderIcon("Zap", 16)}
              <span>Éclairage Discothèque</span>
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`sidebar-nav-btn ${activeTab === "audio" ? "active" : ""}`}
            >
              {renderIcon("Music", 16)}
              <span>Système Audio</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Raccourcis Pont</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  handleAmbientScene("sunset");
                  handleAudioPreset("lounge");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Sparkles", 12)}
                <span>Ambiance Sunset</span>
              </button>
              <button 
                onClick={() => {
                  handleDiscoPreset("rainbow");
                  handleAudioPreset("club");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Disc", 12)}
                <span>Mode Clubbing</span>
              </button>
              <button 
                onClick={() => {
                  handleAmbientScene("off");
                  handleDiscoPreset("off");
                  handleAudioPreset("mute");
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
              onClick={() => setActiveTab("ambient_lights")}
              className={`mobile-tab-btn ${activeTab === "ambient_lights" ? "active" : ""}`}
            >
              {renderIcon("Sun", 14)}
              <span>Ambiance</span>
            </button>
            <button
              onClick={() => setActiveTab("disco_lights")}
              className={`mobile-tab-btn ${activeTab === "disco_lights" ? "active" : ""}`}
            >
              {renderIcon("Zap", 14)}
              <span>Disco DMX</span>
            </button>
            <button
              onClick={() => setActiveTab("audio")}
              className={`mobile-tab-btn ${activeTab === "audio" ? "active" : ""}`}
            >
              {renderIcon("Music", 14)}
              <span>Audio</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: AMBIENT LIGHTS */}
          {activeTab === "ambient_lights" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Sun", 18, "title-icon icon-yellow")}
                <span>Système d'Éclairage d'Ambiance</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Scene Selector */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Scènes d'Ambiance</span>
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => handleAmbientScene("cozy")}
                      className={`zermatt-scene-btn cozy ${ambientScene === "cozy" ? "active" : ""}`}
                    >
                      {renderIcon("Sunset", 14)}
                      <span>Cozy Yacht</span>
                    </button>
                    <button
                      onClick={() => handleAmbientScene("sunset")}
                      className={`zermatt-scene-btn fireplace ${ambientScene === "sunset" ? "active" : ""}`}
                    >
                      {renderIcon("Sun", 14)}
                      <span>Sunset Glow</span>
                    </button>
                    <button
                      onClick={() => handleAmbientScene("dining")}
                      className={`zermatt-scene-btn dining ${ambientScene === "dining" ? "active" : ""}`}
                    >
                      {renderIcon("Utensils", 14)}
                      <span>Dîner Pont</span>
                    </button>
                    <button
                      onClick={() => handleAmbientScene("off")}
                      className={`zermatt-scene-btn off ${ambientScene === "off" ? "active" : ""}`}
                    >
                      {renderIcon("Power", 14)}
                      <span>Éteint</span>
                    </button>
                  </div>
                </div>

                {/* HSL Color Palette */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Teinte Personnalisée Pont</span>
                  <div className="color-presets-row">
                    <button 
                      onClick={() => setLightsColor("#ff9f1c")} 
                      className={`color-pill ${lightsColor === "#ff9f1c" ? "selected" : ""}`}
                      style={{ background: "#ff9f1c" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#ef4444")} 
                      className={`color-pill ${lightsColor === "#ef4444" ? "selected" : ""}`}
                      style={{ background: "#ef4444" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#e73c7e")} 
                      className={`color-pill ${lightsColor === "#e73c7e" ? "selected" : ""}`}
                      style={{ background: "#e73c7e" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#00ffff")} 
                      className={`color-pill ${lightsColor === "#00ffff" ? "selected" : ""}`}
                      style={{ background: "#00ffff" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#3b82f6")} 
                      className={`color-pill ${lightsColor === "#3b82f6" ? "selected" : ""}`}
                      style={{ background: "#3b82f6" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#10b981")} 
                      className={`color-pill ${lightsColor === "#10b981" ? "selected" : ""}`}
                      style={{ background: "#10b981" }}
                    />
                  </div>
                  <div className="color-status-text">
                    Teinte active : <span style={{ color: lightsColor, fontWeight: "bold" }}>{lightsColor}</span>
                  </div>
                </div>

                {/* Dimmers */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Gradation des zones du Main Deck</span>
                  <div className="sliders-list-block">
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Sliders", 14)}
                        <span>Plafonnier Salon</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.mainDeckCeiling}
                        onChange={(e) => setDimmers({ ...dimmers, mainDeckCeiling: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.mainDeckCeiling}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Menu", 14)}
                        <span>Bandeaux LED Aft</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.ledStripAft}
                        onChange={(e) => setDimmers({ ...dimmers, ledStripAft: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.ledStripAft}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Sparkles", 14)}
                        <span>LED Sous-Marines</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.underwaterGlow}
                        onChange={(e) => setDimmers({ ...dimmers, underwaterGlow: parseInt(e.target.value) })}
                        className="zermatt-slider"
                      />
                      <span className="dimmer-percentage">{dimmers.underwaterGlow}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISCO LIGHTS */}
          {activeTab === "disco_lights" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Zap", 18, "title-icon icon-cyan")}
                <span>Éclairage Discothèque & DMX Presets</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Lyres & Gobos Presets */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Presets de Lyres Asservies & Gobos</span>
                  <p className="section-explanation-text">
                    Déclenchez les configurations de mouvements de lyres motorisées et de projection de gobos disco pour animer la piste.
                  </p>
                  
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => handleDiscoPreset("strobe")}
                      className={`zermatt-scene-btn cozy ${discoPreset === "strobe" ? "active" : ""}`}
                    >
                      {renderIcon("Activity", 14)}
                      <span>Stroboscope Gobo</span>
                    </button>
                    
                    <button
                      onClick={() => handleDiscoPreset("blue_wave")}
                      className={`zermatt-scene-btn fireplace ${discoPreset === "blue_wave" ? "active" : ""}`}
                    >
                      {renderIcon("Wind", 14)}
                      <span>Lyres Blue Wave</span>
                    </button>
                    
                    <button
                      onClick={() => handleDiscoPreset("rainbow")}
                      className={`zermatt-scene-btn dining ${discoPreset === "rainbow" ? "active" : ""}`}
                    >
                      {renderIcon("Radio", 14)}
                      <span>Rainbow Chase</span>
                    </button>
                    
                    <button
                      onClick={() => handleDiscoPreset("laser")}
                      className={`zermatt-scene-btn cozy ${discoPreset === "laser" ? "active" : ""}`}
                    >
                      {renderIcon("Sparkles", 14)}
                      <span>Show Laser RGB</span>
                    </button>

                    <button
                      onClick={() => handleDiscoPreset("off")}
                      className={`zermatt-scene-btn off full-width-span ${discoPreset === "off" ? "active" : ""}`}
                    >
                      {renderIcon("Power", 14)}
                      <span>Désactiver Effets Disco</span>
                    </button>
                  </div>
                </div>

                {/* Lyre speed controller */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Vitesse de Balayage des Lyres</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Compass", 14)}
                      <span>Vitesse Rotation</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={discoSpeed}
                      onChange={(e) => setDiscoSpeed(parseInt(e.target.value))}
                      className="zermatt-slider"
                      disabled={discoPreset === "off"}
                    />
                    <span className="dimmer-percentage">{discoSpeed}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO & PRESETS */}
          {activeTab === "audio" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Music", 18, "title-icon icon-purple")}
                <span>Système de Gestion Audio</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Audio Presets */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Presets de Gradation Acoustique</span>
                  <div className="scenes-grid-sidebar" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
                    <button 
                      onClick={() => handleAudioPreset("lounge")} 
                      className={`scene-btn cinema ${audioPreset === "lounge" ? "active" : ""}`}
                    >
                      {renderIcon("Sparkles", 12)} Ambiance Lounge
                    </button>
                    <button 
                      onClick={() => handleAudioPreset("club")} 
                      className={`scene-btn party ${audioPreset === "club" ? "active" : ""}`}
                    >
                      {renderIcon("Disc", 12)} Club Dance (Fort)
                    </button>
                    <button 
                      onClick={() => handleAudioPreset("chill")} 
                      className={`scene-btn night ${audioPreset === "chill" ? "active" : ""}`}
                    >
                      {renderIcon("Sun", 12)} Chill Out Beats
                    </button>
                    <button 
                      onClick={() => handleAudioPreset("vip")} 
                      className={`scene-btn off ${audioPreset === "vip" ? "active" : ""}`}
                    >
                      {renderIcon("Radio", 12)} Discours VIP
                    </button>
                    <button 
                      onClick={() => handleAudioPreset("mute")} 
                      className={`quick-preset-btn-off ${audioPreset === "mute" ? "active" : ""}`}
                      style={{ justifyContent: "center" }}
                    >
                      {renderIcon("VolumeX", 12)} Sourdine (Mute)
                    </button>
                  </div>
                </div>

                {/* Spotify / Airplay widget */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Lecteur Actif (Zone Main Deck)</span>
                  <div className="spotify-player-widget">
                    <div className="spotify-track-info">
                      <div className="album-art-square" style={{ background: "linear-gradient(135deg, #c084fc 0%, #581c87 100%)" }}>
                        {renderIcon("Music", 28, "album-fallback-ic")}
                      </div>
                      <div className="track-details">
                        <span className="track-title-txt">Yacht Horizon Lounge</span>
                        <span className="track-artist-txt">Sunrise Deep Session</span>
                      </div>
                    </div>

                    <div className="spotify-progress-bar">
                      <span className="progress-time">0:18</span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${trackProgress}%`, backgroundColor: "#c084fc" }} />
                      </div>
                      <span className="progress-time">4:05</span>
                    </div>

                    <div className="spotify-controls">
                      <button className="sp-btn">{renderIcon("SkipBack", 14)}</button>
                      <button 
                        onClick={() => setIsAudioPlaying(!isAudioPlaying)} 
                        className={`sp-btn play-pause ${isAudioPlaying ? "playing" : ""}`}
                        style={{ backgroundColor: isAudioPlaying ? "#c084fc" : "#fff" }}
                      >
                        {isAudioPlaying ? renderIcon("Pause", 16) : renderIcon("Play", 16)}
                      </button>
                      <button className="sp-btn">{renderIcon("SkipForward", 14)}</button>
                    </div>
                  </div>
                </div>

                {/* Volume slider */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Réglage Volume Multi-Zones Main Deck</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Volume2", 14)}
                      <span>Volume Pont</span>
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

        </main>
      </div>
    </div>
  );
};
