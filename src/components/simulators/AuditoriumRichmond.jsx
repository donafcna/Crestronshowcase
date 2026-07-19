import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const AuditoriumRichmond = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("stage_lights"); // stage_lights, ptz_cameras, audio_dante, led_wall
  const [lightsColor, setLightsColor] = useState("#39ff14"); // Neon Lime Green
  const [stageScene, setStageScene] = useState("speech"); // speech, debate, performance, off
  const [dimmers, setDimmers] = useState({
    faceSpots: 85,
    backlights: 60,
    audienceLights: 40,
  });

  const [activeCam, setActiveCam] = useState("cam1"); // cam1, cam2, cam3
  const [camZoom, setCamZoom] = useState(1);
  const [camPan, setCamPan] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(true);

  const [audioFaders, setAudioFaders] = useState({
    lecternMic: 80,
    wirelessMics: 70,
    auxInput: 50,
  });
  const [audioMutes, setAudioMutes] = useState({
    lecternMic: false,
    wirelessMics: false,
    auxInput: false,
  });

  const [ledWallSource, setLedWallSource] = useState("pc_lectern"); // pc_lectern, regie_hdmi, cam_feed, logo
  const [ledWallBrightness, setLedWallBrightness] = useState(90);

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

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleStageScene = (scene) => {
    setStageScene(scene);
    if (scene === "speech") {
      setDimmers({ faceSpots: 90, backlights: 50, audienceLights: 30 });
      setLightsColor("#ff007f"); // Neon Pink
    } else if (scene === "debate") {
      setDimmers({ faceSpots: 80, backlights: 70, audienceLights: 45 });
      setLightsColor("#00f0ff"); // Neon Cyan
    } else if (scene === "performance") {
      setDimmers({ faceSpots: 60, backlights: 90, audienceLights: 15 });
      setLightsColor("#39ff14"); // Neon Lime Green
    } else if (scene === "off") {
      setDimmers({ faceSpots: 0, backlights: 0, audienceLights: 0 });
      setLightsColor("#0f172a");
    }
  };

  const adjustCam = (direction) => {
    setCamPan((prev) => {
      let nextX = prev.x;
      let nextY = prev.y;
      if (direction === "left") nextX = Math.max(prev.x - 10, -50);
      if (direction === "right") nextX = Math.min(prev.x + 10, 50);
      if (direction === "up") nextY = Math.max(prev.y - 10, -50);
      if (direction === "down") nextY = Math.min(prev.y + 10, 50);
      return { x: nextX, y: nextY };
    });
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root auditorium-richmond-ui cyberpunk-neon-theme ${deviceType}`}>
      {/* Background Conference Room Photo */}
      <div 
        className="richmond-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
          filter: "grayscale(20%) blur(1px)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      {/* Cyber Neon Glow Effects */}
      <div 
        className="ambient-bg-glow" 
        style={{ 
          background: `radial-gradient(circle at 50% 10%, ${lightsColor}33 0%, transparent 65%)`,
          zIndex: 1
        }} 
      />

      {/* Header */}
      <header className="sunrise-header cyber-header">
        <div className="header-left">
          {renderIcon("Tv", 20, "brand-icon-cyber")}
          <div className="brand-text-block">
            <span className="brand-title cyber-text-glow">RICHMOND TECHNICAL CABIN</span>
            <span className="brand-subtitle-room cyber-sub">Auditorium Main Desk</span>
          </div>
        </div>

        <div className="header-right">
          {isRecording && (
            <div className="call-duration-indicator cyber-indicator">
              <span className="rec-dot red-glow" style={{ backgroundColor: "#ff007f" }} />
              <span style={{ color: "#ff007f" }}>BROADCAST REC</span>
            </div>
          )}
          <div className="time-widget cyber-time">
            <span>{timeString || "14:30"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar cyber-sidebar">
            <div className="sidebar-nav-title cyber-title">console maps</div>
            
            <button
              onClick={() => setActiveTab("stage_lights")}
              className={`sidebar-nav-btn cyber-btn ${activeTab === "stage_lights" ? "active" : ""}`}
            >
              {renderIcon("Sun", 16)}
              <span>Éclairage DMX</span>
            </button>

            <button
              onClick={() => setActiveTab("ptz_cameras")}
              className={`sidebar-nav-btn cyber-btn ${activeTab === "ptz_cameras" ? "active" : ""}`}
            >
              {renderIcon("Video", 16)}
              <span>Caméras PTZ</span>
            </button>

            <button
              onClick={() => setActiveTab("audio_dante")}
              className={`sidebar-nav-btn cyber-btn ${activeTab === "audio_dante" ? "active" : ""}`}
            >
              {renderIcon("Volume2", 16)}
              <span>Dante Mix</span>
            </button>

            <button
              onClick={() => setActiveTab("led_wall")}
              className={`sidebar-nav-btn cyber-btn ${activeTab === "led_wall" ? "active" : ""}`}
            >
              {renderIcon("Tv", 16)}
              <span>Mur LED 15m</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title cyber-title">console macros</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  handleStageScene("speech");
                  setLedWallSource("pc_lectern");
                  setLedWallBrightness(90);
                }} 
                className="quick-preset-btn cyber-macro"
              >
                {renderIcon("Sparkles", 12)}
                <span>Macro Conf</span>
              </button>
              <button 
                onClick={() => {
                  handleStageScene("performance");
                  setLedWallSource("cam_feed");
                  setLedWallBrightness(100);
                }} 
                className="quick-preset-btn cyber-macro"
              >
                {renderIcon("Flame", 12)}
                <span>Macro Show</span>
              </button>
              <button 
                onClick={() => {
                  handleStageScene("off");
                  setLedWallSource("logo");
                  setLedWallBrightness(10);
                  setIsRecording(false);
                }} 
                className="quick-preset-btn-off cyber-macro-off"
              >
                {renderIcon("Power", 12)}
                <span>Total Blackout</span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Header Tabs */}
        {isPhone && (
          <div className="zermatt-mobile-tabs cyber-mobile-tabs">
            <button
              onClick={() => setActiveTab("stage_lights")}
              className={`mobile-tab-btn ${activeTab === "stage_lights" ? "active" : ""}`}
            >
              {renderIcon("Sun", 14)}
              <span>DMX</span>
            </button>
            <button
              onClick={() => setActiveTab("ptz_cameras")}
              className={`mobile-tab-btn ${activeTab === "ptz_cameras" ? "active" : ""}`}
            >
              {renderIcon("Video", 14)}
              <span>PTZ</span>
            </button>
            <button
              onClick={() => setActiveTab("audio_dante")}
              className={`mobile-tab-btn ${activeTab === "audio_dante" ? "active" : ""}`}
            >
              {renderIcon("Volume2", 14)}
              <span>Dante</span>
            </button>
            <button
              onClick={() => setActiveTab("led_wall")}
              className={`mobile-tab-btn ${activeTab === "led_wall" ? "active" : ""}`}
            >
              {renderIcon("Tv", 14)}
              <span>LED</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: STAGE LIGHTS */}
          {activeTab === "stage_lights" && (
            <div className="zermatt-panel-card cyber-card fade-in">
              <h2 className="panel-title-text cyber-panel-title">
                {renderIcon("Sun", 18, "title-icon")}
                <span>Système d'Éclairage Scène</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Stage presets */}
                <div className="control-section-card glass-card cyber-sub-card">
                  <span className="section-subtitle cyber-label">Presets Scène</span>
                  <div className="scene-buttons-flex">
                    <button
                      onClick={() => handleStageScene("speech")}
                      className={`zermatt-scene-btn cozy cyber-btn-preset ${stageScene === "speech" ? "active" : ""}`}
                    >
                      {renderIcon("User", 14)}
                      <span>Discours</span>
                    </button>
                    <button
                      onClick={() => handleStageScene("debate")}
                      className={`zermatt-scene-btn fireplace cyber-btn-preset ${stageScene === "debate" ? "active" : ""}`}
                    >
                      {renderIcon("Users", 14)}
                      <span>Débat</span>
                    </button>
                    <button
                      onClick={() => handleStageScene("performance")}
                      className={`zermatt-scene-btn dining cyber-btn-preset ${stageScene === "performance" ? "active" : ""}`}
                    >
                      {renderIcon("Flame", 14)}
                      <span>Spectacle</span>
                    </button>
                    <button
                      onClick={() => handleStageScene("off")}
                      className={`zermatt-scene-btn off cyber-btn-preset ${stageScene === "off" ? "active" : ""}`}
                    >
                      {renderIcon("Power", 14)}
                      <span>Noir</span>
                    </button>
                  </div>
                </div>

                {/* Stage background DMX color selection */}
                <div className="control-section-card glass-card cyber-sub-card">
                  <span className="section-subtitle cyber-label">Teinte DMX Cyclo</span>
                  <div className="color-presets-row">
                    <button 
                      onClick={() => setLightsColor("#39ff14")} 
                      className={`color-pill ${lightsColor === "#39ff14" ? "selected" : ""}`}
                      style={{ background: "#39ff14", boxShadow: "0 0 10px #39ff14" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#ff007f")} 
                      className={`color-pill ${lightsColor === "#ff007f" ? "selected" : ""}`}
                      style={{ background: "#ff007f", boxShadow: "0 0 10px #ff007f" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#00f0ff")} 
                      className={`color-pill ${lightsColor === "#00f0ff" ? "selected" : ""}`}
                      style={{ background: "#00f0ff", boxShadow: "0 0 10px #00f0ff" }}
                    />
                    <button 
                      onClick={() => setLightsColor("#ffff00")} 
                      className={`color-pill ${lightsColor === "#ffff00" ? "selected" : ""}`}
                      style={{ background: "#ffff00", boxShadow: "0 0 10px #ffff00" }}
                    />
                  </div>
                  <div className="color-status-text" style={{ color: lightsColor, textShadow: `0 0 8px ${lightsColor}` }}>
                    Flux actif : {lightsColor}
                  </div>
                </div>

                {/* Dimmers */}
                <div className="control-section-card glass-card cyber-sub-card full-width-span">
                  <span className="section-subtitle cyber-label">Potentiomètres de Gradation</span>
                  <div className="sliders-list-block">
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Sliders", 14)}
                        <span>Projecteurs Face</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.faceSpots}
                        onChange={(e) => setDimmers({ ...dimmers, faceSpots: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                      />
                      <span className="dimmer-percentage" style={{ color: "#39ff14" }}>{dimmers.faceSpots}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Menu", 14)}
                        <span>Contre-Jour / Cyclo</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.backlights}
                        onChange={(e) => setDimmers({ ...dimmers, backlights: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                      />
                      <span className="dimmer-percentage" style={{ color: "#ff007f" }}>{dimmers.backlights}%</span>
                    </div>

                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block">
                        {renderIcon("Users", 14)}
                        <span>Éclairage Public</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmers.audienceLights}
                        onChange={(e) => setDimmers({ ...dimmers, audienceLights: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                      />
                      <span className="dimmer-percentage" style={{ color: "#00f0ff" }}>{dimmers.audienceLights}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PTZ CAMERAS */}
          {activeTab === "ptz_cameras" && (
            <div className="zermatt-panel-card cyber-card fade-in">
              <h2 className="panel-title-text cyber-panel-title">
                {renderIcon("Video", 18, "title-icon")}
                <span>Pilotage Robotique PTZ</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Camera selector and preview */}
                <div className="control-section-card glass-card cyber-sub-card">
                  <span className="section-subtitle cyber-label">Sélecteur de flux</span>
                  <div className="av-source-grid" style={{ marginBottom: "12px" }}>
                    <button 
                      onClick={() => setActiveCam("cam1")} 
                      className={`av-source-btn cyber-source-btn ${activeCam === "cam1" ? "active" : ""}`}
                    >
                      <span>Cam 1 (Orateur)</span>
                    </button>
                    <button 
                      onClick={() => setActiveCam("cam2")} 
                      className={`av-source-btn cyber-source-btn ${activeCam === "cam2" ? "active" : ""}`}
                    >
                      <span>Cam 2 (Chaire)</span>
                    </button>
                    <button 
                      onClick={() => setActiveCam("cam3")} 
                      className={`av-source-btn cyber-source-btn ${activeCam === "cam3" ? "active" : ""}`}
                    >
                      <span>Cam 3 (Public)</span>
                    </button>
                  </div>

                  <div className="cctv-viewer-container" style={{ height: "170px", position: "relative", overflow: "hidden", borderRadius: "8px", border: "1px solid #00f0ff" }}>
                    <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10 }}>
                      <span className="live-pill" style={{ background: "#ff007f", color: "#fff", boxShadow: "0 0 8px #ff007f" }}>REC FEED</span>
                    </div>
                    <div 
                      className="feed-image-wrapper"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        background: "#090c15",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ textAlign: "center", transform: `translate(${camPan.x}px, ${camPan.y}px) scale(${1 + (camZoom - 1) * 0.3})`, transition: "transform 0.3s ease" }}>
                        {renderIcon("User", 40, "cyber-text-glow")}
                        <div style={{ fontSize: "0.7rem", color: "#00f0ff", marginTop: "6px" }}>
                          STREAM FEED // {activeCam.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Joystick & Zoom */}
                <div className="control-section-card glass-card cyber-sub-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <span className="section-subtitle cyber-label">Télécommande Pan/Tilt</span>
                  <div className="joystick-pad" style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gap: "6px", margin: "10px 0" }}>
                    <div />
                    <button onClick={() => adjustCam("up")} className="av-source-btn cyber-source-btn" style={{ padding: "8px" }}>{renderIcon("ArrowUp", 14)}</button>
                    <div />
                    <button onClick={() => adjustCam("left")} className="av-source-btn cyber-source-btn" style={{ padding: "8px" }}>{renderIcon("ArrowLeft", 14)}</button>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.65rem", color: "#39ff14" }}>JOY</div>
                    <button onClick={() => adjustCam("right")} className="av-source-btn cyber-source-btn" style={{ padding: "8px" }}>{renderIcon("ArrowRight", 14)}</button>
                    <div />
                    <button onClick={() => adjustCam("down")} className="av-source-btn cyber-source-btn" style={{ padding: "8px" }}>{renderIcon("ArrowDown", 14)}</button>
                    <div />
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ fontSize: "0.8rem" }}>Zoom</span>
                    <button onClick={() => setCamZoom((z) => Math.max(z - 1, 1))} className="av-source-btn cyber-source-btn" style={{ padding: "4px 10px" }}>-</button>
                    <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#00f0ff" }}>{camZoom}x</span>
                    <button onClick={() => setCamZoom((z) => Math.min(z + 1, 4))} className="av-source-btn cyber-source-btn" style={{ padding: "4px 10px" }}>+</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DANTE AUDIO MIXING */}
          {activeTab === "audio_dante" && (
            <div className="zermatt-panel-card cyber-card fade-in">
              <h2 className="panel-title-text cyber-panel-title">
                {renderIcon("Volume2", 18, "title-icon")}
                <span>Console Mixage Dante</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Audio sliders list */}
                <div className="control-section-card glass-card cyber-sub-card full-width-span">
                  <span className="section-subtitle cyber-label">Curseurs de Volume Entrées</span>
                  <div className="sliders-list-block">
                    {/* Lectern Mic */}
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block" style={{ width: "120px" }}>
                        <span>Micro Chaire</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioMutes.lecternMic ? 0 : audioFaders.lecternMic}
                        onChange={(e) => setAudioFaders({ ...audioFaders, lecternMic: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                        disabled={audioMutes.lecternMic}
                      />
                      <button 
                        onClick={() => setAudioMutes({ ...audioMutes, lecternMic: !audioMutes.lecternMic })} 
                        className={`tv-power-btn ${audioMutes.lecternMic ? "off" : "on"}`}
                        style={{ padding: "4px 10px", width: "80px", background: audioMutes.lecternMic ? "#ff007f22" : "#39ff1422", color: audioMutes.lecternMic ? "#ff007f" : "#39ff14", border: `1px solid ${audioMutes.lecternMic ? "#ff007f" : "#39ff14"}` }}
                      >
                        {audioMutes.lecternMic ? "MUTÉ" : "ACTIF"}
                      </button>
                    </div>

                    {/* Wireless Mics */}
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block" style={{ width: "120px" }}>
                        <span>Micros Sans Fil</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioMutes.wirelessMics ? 0 : audioFaders.wirelessMics}
                        onChange={(e) => setAudioFaders({ ...audioFaders, wirelessMics: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                        disabled={audioMutes.wirelessMics}
                      />
                      <button 
                        onClick={() => setAudioMutes({ ...audioMutes, wirelessMics: !audioMutes.wirelessMics })} 
                        className={`tv-power-btn ${audioMutes.wirelessMics ? "off" : "on"}`}
                        style={{ padding: "4px 10px", width: "80px", background: audioMutes.wirelessMics ? "#ff007f22" : "#39ff1422", color: audioMutes.wirelessMics ? "#ff007f" : "#39ff14", border: `1px solid ${audioMutes.wirelessMics ? "#ff007f" : "#39ff14"}` }}
                      >
                        {audioMutes.wirelessMics ? "MUTÉ" : "ACTIF"}
                      </button>
                    </div>

                    {/* Aux Input */}
                    <div className="dimmer-control-row">
                      <div className="dimmer-label-block" style={{ width: "120px" }}>
                        <span>Entrée Régie Aux</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioMutes.auxInput ? 0 : audioFaders.auxInput}
                        onChange={(e) => setAudioFaders({ ...audioFaders, auxInput: parseInt(e.target.value) })}
                        className="zermatt-slider cyber-slider-neon"
                        disabled={audioMutes.auxInput}
                      />
                      <button 
                        onClick={() => setAudioMutes({ ...audioMutes, auxInput: !audioMutes.auxInput })} 
                        className={`tv-power-btn ${audioMutes.auxInput ? "off" : "on"}`}
                        style={{ padding: "4px 10px", width: "80px", background: audioMutes.auxInput ? "#ff007f22" : "#39ff1422", color: audioMutes.auxInput ? "#ff007f" : "#39ff14", border: `1px solid ${audioMutes.auxInput ? "#ff007f" : "#39ff14"}` }}
                      >
                        {audioMutes.auxInput ? "MUTÉ" : "ACTIF"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LED GIGANTIC WALL */}
          {activeTab === "led_wall" && (
            <div className="zermatt-panel-card cyber-card fade-in">
              <h2 className="panel-title-text cyber-panel-title">
                {renderIcon("Tv", 18, "title-icon")}
                <span>Mur LED Principal</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* LED Wall source selector */}
                <div className="control-section-card glass-card cyber-sub-card">
                  <span className="section-subtitle cyber-label">Routage flux vidéo</span>
                  <div className="av-source-grid">
                    <button 
                      onClick={() => setLedWallSource("pc_lectern")} 
                      className={`av-source-btn cyber-source-btn ${ledWallSource === "pc_lectern" ? "active" : ""}`}
                    >
                      <span>PC Pupitre</span>
                    </button>
                    <button 
                      onClick={() => setLedWallSource("regie_hdmi")} 
                      className={`av-source-btn cyber-source-btn ${ledWallSource === "regie_hdmi" ? "active" : ""}`}
                    >
                      <span>HDMI Régie</span>
                    </button>
                    <button 
                      onClick={() => setLedWallSource("cam_feed")} 
                      className={`av-source-btn cyber-source-btn ${ledWallSource === "cam_feed" ? "active" : ""}`}
                    >
                      <span>Retour Cam Live</span>
                    </button>
                    <button 
                      onClick={() => setLedWallSource("logo")} 
                      className={`av-source-btn cyber-source-btn ${ledWallSource === "logo" ? "active" : ""}`}
                    >
                      <span>Logo Uni</span>
                    </button>
                  </div>
                </div>

                {/* LED Wall brightness dimmer */}
                <div className="control-section-card glass-card cyber-sub-card">
                  <span className="section-subtitle cyber-label">Gradation Mur LED</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block" style={{ width: "90px" }}>
                      {renderIcon("Sliders", 14)}
                      <span>Luminosité</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={ledWallBrightness}
                      onChange={(e) => setLedWallBrightness(parseInt(e.target.value))}
                      className="zermatt-slider cyber-slider-neon"
                    />
                    <span className="dimmer-percentage" style={{ color: "#39ff14" }}>{ledWallBrightness}%</span>
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
