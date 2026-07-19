import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const VillaGemini = ({ deviceType }) => {
  const [activeRoom, setActiveRoom] = useState("salon");
  const [activeTab, setActiveTab] = useState("lights");
  const [dimmers, setDimmers] = useState({
    salon_main: 80,
    salon_led: 50,
    salon_spot: 0,
    chambre_main: 40,
    chambre_reading: 20,
    cuisine_main: 90,
    cuisine_bar: 60,
    spa_pool: 100,
    spa_ambient: 70,
  });

  const [temperatures, setTemperatures] = useState({
    salon: 21.5,
    chambre: 20.0,
    cuisine: 21.0,
    spa: 28.5,
  });

  const roomCurrentTemp = {
    salon: 21.3,
    chambre: 19.8,
    cuisine: 21.4,
    spa: 28.1,
  };

  const [hvacMode, setHvacMode] = useState("heat");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState("spotify");
  const [audioTrack, setAudioTrack] = useState({
    title: "Monaco Sunset",
    artist: "Lounge Cafe",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80",
  });

  const [securityState, setSecurityState] = useState("disarmed");
  const [activeCamera, setActiveCamera] = useState("jardin");
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeString(date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerGlobalScene = (scene) => {
    if (scene === "cinema") {
      setDimmers((prev) => ({
        ...prev,
        salon_main: 15,
        salon_led: 10,
        salon_spot: 0,
      }));
      setIsAudioPlaying(true);
      setAudioTrack({
        title: "Sci-Fi Cinematic Intro",
        artist: "Hans Zimmer Tribute",
        cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150&q=80",
      });
      setTemperatures((prev) => ({ ...prev, salon: 21.0 }));
    } else if (scene === "party") {
      setDimmers((prev) => ({
        ...prev,
        salon_main: 0,
        salon_led: 100,
        salon_spot: 70,
        spa_pool: 100,
        spa_ambient: 100,
      }));
      setIsAudioPlaying(true);
      setAudioTrack({
        title: "Deep House Summer Session",
        artist: "Ibiza Club Mix",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80",
      });
      setTemperatures((prev) => ({ ...prev, salon: 20.0 }));
    } else if (scene === "night") {
      setDimmers((prev) => ({
        ...prev,
        salon_main: 0,
        salon_led: 0,
        salon_spot: 0,
        chambre_main: 0,
        chambre_reading: 10,
        cuisine_main: 0,
        cuisine_bar: 0,
      }));
      setIsAudioPlaying(false);
      setSecurityState("armed_home");
    } else if (scene === "off") {
      setDimmers({
        salon_main: 0,
        salon_led: 0,
        salon_spot: 0,
        chambre_main: 0,
        chambre_reading: 0,
        cuisine_main: 0,
        cuisine_bar: 0,
        spa_pool: 0,
        spa_ambient: 0,
      });
      setIsAudioPlaying(false);
      setSecurityState("armed_away");
    }
  };

  const adjustDimmer = (key, value) => {
    setDimmers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const adjustSetpoint = (diff) => {
    setTemperatures((prev) => ({
      ...prev,
      [activeRoom]: parseFloat((prev[activeRoom] + diff).toFixed(1)),
    }));
  };

  const roomNames = {
    salon: "Salon Lounge",
    chambre: "Suite Parentale",
    cuisine: "Cuisine Américaine",
    spa: "Spa & Wellness",
  };

  const cameraFeeds = {
    jardin: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    piscine: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&q=80",
    entree: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=400&q=80",
  };

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root ${deviceType}`}>
      {/* Header */}
      <header className="gemini-ui-header">
        <div className="header-brand">
          {renderIcon("Zap", 22, "brand-symbol")}
          <span className="brand-txt">VILLA GEMINI</span>
        </div>
        <div className="header-status">
          <span className="room-label">{roomNames[activeRoom]}</span>
          <div className="time-weather">
            <span className="weather">
              {renderIcon("Sun", 14)} 24°C
            </span>
            <span className="time">
              {timeString.split(" ")[1]?.substring(0, 5) || "15:30"}
            </span>
          </div>
        </div>
      </header>

      {/* Body Layout */}
      <div className="gemini-ui-body">
        {/* Sidebar Nav (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="room-sidebar">
            <div className="sidebar-group-title">Espaces</div>
            <ul className="room-list">
              {Object.keys(roomNames).map((roomKey) => (
                <li key={roomKey}>
                  <button
                    onClick={() => setActiveRoom(roomKey)}
                    className={`room-select-btn ${activeRoom === roomKey ? "active" : ""}`}
                  >
                    {roomKey === "salon" && renderIcon("Tv", 16)}
                    {roomKey === "chambre" && renderIcon("Bed", 16)}
                    {roomKey === "cuisine" && renderIcon("Soup", 16)}
                    {roomKey === "spa" && renderIcon("Droplet", 16)}
                    <span>{roomNames[roomKey]}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="sidebar-group-title" style={{ marginTop: "20px" }}>
              Scénarios Globaux
            </div>
            <div className="scenes-grid-sidebar">
              <button onClick={() => triggerGlobalScene("cinema")} className="scene-btn cinema">
                {renderIcon("Film", 14)} Cinema
              </button>
              <button onClick={() => triggerGlobalScene("party")} className="scene-btn party">
                {renderIcon("Music", 14)} Soirée
              </button>
              <button onClick={() => triggerGlobalScene("night")} className="scene-btn night">
                {renderIcon("Moon", 14)} Nuit
              </button>
              <button onClick={() => triggerGlobalScene("off")} className="scene-btn off">
                {renderIcon("Power", 14)} Éteindre
              </button>
            </div>
          </aside>
        )}

        {/* Main Controls Section */}
        <main className="controls-main">
          {isPhone && (
            <>
              {/* Room Tab Bar (Mobile) */}
              <div className="phone-rooms-scroll">
                {Object.keys(roomNames).map((roomKey) => (
                  <button
                    key={roomKey}
                    onClick={() => setActiveRoom(roomKey)}
                    className={`phone-room-tab ${activeRoom === roomKey ? "active" : ""}`}
                  >
                    {roomNames[roomKey].split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Mobile Services Tabs */}
              <div className="led-state-toggles" style={{ marginBottom: "15px", width: "100%" }}>
                <button
                  onClick={() => setActiveTab("lights")}
                  className={`led-btn ${activeTab === "lights" ? "active green-btn" : ""}`}
                  style={{ flex: 1 }}
                >
                  Lumières
                </button>
                <button
                  onClick={() => setActiveTab("hvac")}
                  className={`led-btn ${activeTab === "hvac" ? "active green-btn" : ""}`}
                  style={{ flex: 1 }}
                >
                  Climat
                </button>
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`led-btn ${activeTab === "audio" ? "active green-btn" : ""}`}
                  style={{ flex: 1 }}
                >
                  Audio
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`led-btn ${activeTab === "security" ? "active green-btn" : ""}`}
                  style={{ flex: 1 }}
                >
                  Sécurité
                </button>
              </div>
            </>
          )}

          {/* Grid Layout of Cards */}
          <div className="widgets-container">
            {/* Lights Card */}
            {(!isPhone || activeTab === "lights") && (
              <section className="control-card glass-panel fade-in">
                <div className="card-header">
                  <div className="card-title">
                    {renderIcon("Lightbulb", 16, "title-icon icon-yellow")}
                    <span>Éclairage</span>
                  </div>
                </div>
                <div className="card-content lights-list">
                  {activeRoom === "salon" && (
                    <>
                      <div className="light-row">
                        <span className="light-label">Lustre Principal</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.salon_main}
                          onChange={(e) => adjustDimmer("salon_main", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.salon_main}%</span>
                      </div>
                      <div className="light-row">
                        <span className="light-label">Ruban LED RGB</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.salon_led}
                          onChange={(e) => adjustDimmer("salon_led", parseInt(e.target.value))}
                          className="slider rgb-slider"
                        />
                        <span className="value-label">{dimmers.salon_led}%</span>
                      </div>
                      <div className="light-row">
                        <span className="light-label">Spots Lectures</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.salon_spot}
                          onChange={(e) => adjustDimmer("salon_spot", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.salon_spot}%</span>
                      </div>
                    </>
                  )}
                  {activeRoom === "chambre" && (
                    <>
                      <div className="light-row">
                        <span className="light-label">Plafonnier</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.chambre_main}
                          onChange={(e) => adjustDimmer("chambre_main", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.chambre_main}%</span>
                      </div>
                      <div className="light-row">
                        <span className="light-label">Lampes de chevet</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.chambre_reading}
                          onChange={(e) => adjustDimmer("chambre_reading", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.chambre_reading}%</span>
                      </div>
                    </>
                  )}
                  {activeRoom === "cuisine" && (
                    <>
                      <div className="light-row">
                        <span className="light-label">Général</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.cuisine_main}
                          onChange={(e) => adjustDimmer("cuisine_main", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.cuisine_main}%</span>
                      </div>
                      <div className="light-row">
                        <span className="light-label">Suspensions Bar</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.cuisine_bar}
                          onChange={(e) => adjustDimmer("cuisine_bar", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.cuisine_bar}%</span>
                      </div>
                    </>
                  )}
                  {activeRoom === "spa" && (
                    <>
                      <div className="light-row">
                        <span className="light-label">Piscine (Subaquatique)</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.spa_pool}
                          onChange={(e) => adjustDimmer("spa_pool", parseInt(e.target.value))}
                          className="slider color-pool-slider"
                        />
                        <span className="value-label">{dimmers.spa_pool}%</span>
                      </div>
                      <div className="light-row">
                        <span className="light-label">Plafond Étoilé LED</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={dimmers.spa_ambient}
                          onChange={(e) => adjustDimmer("spa_ambient", parseInt(e.target.value))}
                          className="slider"
                        />
                        <span className="value-label">{dimmers.spa_ambient}%</span>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Climate/Thermostat Card */}
            {(!isPhone || activeTab === "hvac") && (
              <section className="control-card glass-panel fade-in">
                <div className="card-header">
                  <div className="card-title">
                    {renderIcon("Thermometer", 16, "title-icon icon-cyan")}
                    <span>Climatisation</span>
                  </div>
                  <span className="badge">Thermostat</span>
                </div>
                <div className="card-content thermostat-flex">
                  <div className="temp-display-circle">
                    <span className="target-num">{temperatures[activeRoom]}°C</span>
                    <span className="current-num">Mesuré: {roomCurrentTemp[activeRoom]}°C</span>
                  </div>

                  <div className="temp-adjust-buttons">
                    <button onClick={() => adjustSetpoint(-0.5)} className="temp-btn">
                      {renderIcon("Minus", 16)}
                    </button>
                    <button onClick={() => adjustSetpoint(0.5)} className="temp-btn">
                      {renderIcon("Plus", 16)}
                    </button>
                  </div>

                  <div className="hvac-modes">
                    <button
                      onClick={() => setHvacMode("cool")}
                      className={`mode-btn ${hvacMode === "cool" ? "active cool" : ""}`}
                    >
                      {renderIcon("Snowflake", 12)} Clim
                    </button>
                    <button
                      onClick={() => setHvacMode("heat")}
                      className={`mode-btn ${hvacMode === "heat" ? "active heat" : ""}`}
                    >
                      {renderIcon("Flame", 12)} Chaud
                    </button>
                    <button
                      onClick={() => setHvacMode("off")}
                      className={`mode-btn ${hvacMode === "off" ? "active off" : ""}`}
                    >
                      {renderIcon("Power", 12)} Off
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Audio Card */}
            {(!isPhone || activeTab === "audio") && (
              <section className="control-card glass-panel fade-in">
                <div className="card-header">
                  <div className="card-title">
                    {renderIcon("Music", 16, "title-icon icon-purple")}
                    <span>Sonorisation</span>
                  </div>
                </div>
                <div className="card-content audio-player">
                  <div className="audio-sources">
                    <button
                      onClick={() => setAudioSource("spotify")}
                      className={`source-btn ${audioSource === "spotify" ? "active" : ""}`}
                    >
                      Spotify
                    </button>
                    <button
                      onClick={() => setAudioSource("airplay")}
                      className={`source-btn ${audioSource === "airplay" ? "active" : ""}`}
                    >
                      AirPlay 2
                    </button>
                    <button
                      onClick={() => setAudioSource("sonos")}
                      className={`source-btn ${audioSource === "sonos" ? "active" : ""}`}
                    >
                      Sonos
                    </button>
                  </div>

                  <div className="track-info-block">
                    <img src={audioTrack.cover} alt="Album Art" className="album-art" />
                    <div className="track-text">
                      <span className="track-title">{audioTrack.title}</span>
                      <span className="track-artist">{audioTrack.artist}</span>
                    </div>
                  </div>

                  <div className="player-progress">
                    <span className="time-lbl">0:24</span>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: isAudioPlaying ? "35%" : "0%" }}
                      />
                    </div>
                    <span className="time-lbl">3:15</span>
                  </div>

                  <div className="player-controls">
                    <button className="play-control-btn">{renderIcon("SkipBack", 16)}</button>
                    <button
                      onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                      className={`play-pause-btn ${isAudioPlaying ? "playing" : ""}`}
                    >
                      {isAudioPlaying ? renderIcon("Pause", 18) : renderIcon("Play", 18)}
                    </button>
                    <button className="play-control-btn">{renderIcon("SkipForward", 16)}</button>
                  </div>

                  <div className="volume-control-row">
                    {renderIcon("Volume2", 14, "vol-icon")}
                    <input type="range" className="slider volume-slider" defaultValue="65" />
                    <span className="vol-label">65%</span>
                  </div>
                </div>
              </section>
            )}

            {/* Security Card */}
            {(!isPhone || activeTab === "security") && (
              <section className="control-card glass-panel fade-in">
                <div className="card-header">
                  <div className="card-title">
                    {renderIcon("Shield", 16, "title-icon icon-green")}
                    <span>Sécurité</span>
                  </div>
                </div>
                <div className="card-content security-layout">
                  <div className="alarm-status-panel">
                    <div
                      className={`alarm-shield ${
                        securityState === "disarmed"
                          ? "disarmed"
                          : securityState === "armed_home"
                          ? "armed_home"
                          : "armed_away"
                      }`}
                    >
                      {renderIcon("ShieldCheck", 18)}
                      <span className="alarm-state-text">
                        {securityState === "disarmed" && "Système désarmé"}
                        {securityState === "armed_home" && "Armé partiel (Nuit)"}
                        {securityState === "armed_away" && "Armé total (Absent)"}
                      </span>
                    </div>
                    <div className="alarm-actions">
                      <button
                        onClick={() => setSecurityState("disarmed")}
                        className={`alarm-btn ${securityState === "disarmed" ? "active" : ""}`}
                      >
                        Off
                      </button>
                      <button
                        onClick={() => setSecurityState("armed_home")}
                        className={`alarm-btn ${securityState === "armed_home" ? "active" : ""}`}
                      >
                        Home
                      </button>
                      <button
                        onClick={() => setSecurityState("armed_away")}
                        className={`alarm-btn ${securityState === "armed_away" ? "active" : ""}`}
                      >
                        Away
                      </button>
                    </div>
                  </div>

                  <div className="camera-feed-block">
                    <div className="cam-selector-tabs">
                      <button
                        onClick={() => setActiveCamera("jardin")}
                        className={`cam-tab ${activeCamera === "jardin" ? "active" : ""}`}
                      >
                        Jardin
                      </button>
                      <button
                        onClick={() => setActiveCamera("piscine")}
                        className={`cam-tab ${activeCamera === "piscine" ? "active" : ""}`}
                      >
                        Piscine
                      </button>
                      <button
                        onClick={() => setActiveCamera("entree")}
                        className={`cam-tab ${activeCamera === "entree" ? "active" : ""}`}
                      >
                        Entrée
                      </button>
                    </div>

                    <div className="cam-feed-viewer">
                      <span className="live-rec-dot">REC</span>
                      <img
                        src={cameraFeeds[activeCamera]}
                        alt="Camera Feed"
                        className="cam-image"
                      />
                      <div className="cam-overlay-info">
                        <span>CAM_{activeCamera.toUpperCase()}</span>
                        <span>H.264 // 1080p // 30 FPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
