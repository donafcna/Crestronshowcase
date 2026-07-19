import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export const BoardroomFutureAV = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("video_matrix"); // video_matrix, conference, mics, shades
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callSource, setCallSource] = useState("teams"); // teams, zoom, local
  
  const [videoRouting, setVideoRouting] = useState({
    mainScreen: "clickshare", // clickshare, wall_hdmi, pc_codec, off
    sideScreen: "pc_codec",
    lecternFeed: "off",
  });

  const [micTracking, setMicTracking] = useState("auto"); // auto, manual, mute_all
  const [activeSpeaker, setActiveSpeaker] = useState(1); // mic id
  const [micMuted, setMicMuted] = useState(false);

  const [projectorScreen, setProjectorScreen] = useState("up"); // up, down
  const [blackoutShades, setBlackoutShades] = useState("open"); // open, closed
  
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

  // Call timer simulation
  useEffect(() => {
    if (!isCallActive) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Active speaker random tracking simulation
  useEffect(() => {
    if (micTracking !== "auto") return;
    const interval = setInterval(() => {
      setActiveSpeaker(Math.floor(Math.random() * 4) + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [micTracking]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const formatDuration = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root boardroom-futureav-ui ${deviceType}`}>
      {/* Background Boardroom Photo */}
      <div 
        className="boardroom-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      {/* Header */}
      <header className="sunrise-header">
        <div className="header-left">
          {renderIcon("Briefcase", 20, "brand-icon-sunrise")}
          <div className="brand-text-block">
            <span className="brand-title">FUTURE AV HQ</span>
            <span className="brand-subtitle-room">Boardroom Executive</span>
          </div>
        </div>

        <div className="header-right">
          {isCallActive && (
            <div className="call-duration-indicator">
              <span className="rec-dot red-glow" />
              <span>CONF: {formatDuration(callDuration)}</span>
            </div>
          )}
          <div className="time-widget">
            <span>{timeString || "14:00"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar">
            <div className="sidebar-nav-title">Régie Salle</div>
            
            <button
              onClick={() => setActiveTab("video_matrix")}
              className={`sidebar-nav-btn ${activeTab === "video_matrix" ? "active" : ""}`}
            >
              {renderIcon("Tv", 16)}
              <span>Matrice Vidéo</span>
            </button>

            <button
              onClick={() => setActiveTab("conference")}
              className={`sidebar-nav-btn ${activeTab === "conference" ? "active" : ""}`}
            >
              {renderIcon("Video", 16)}
              <span>Visioconférence</span>
            </button>

            <button
              onClick={() => setActiveTab("mics")}
              className={`sidebar-nav-btn ${activeTab === "mics" ? "active" : ""}`}
            >
              {renderIcon("Volume2", 16)}
              <span>Micros Shure</span>
            </button>

            <button
              onClick={() => setActiveTab("shades")}
              className={`sidebar-nav-btn ${activeTab === "shades" ? "active" : ""}`}
            >
              {renderIcon("Sliders", 16)}
              <span>Occultation & Stores</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Raccourcis Réunion</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  setIsCallActive(true);
                  setCallSource("teams");
                  setVideoRouting({ mainScreen: "pc_codec", sideScreen: "clickshare", lecternFeed: "off" });
                  setProjectorScreen("down");
                  setBlackoutShades("closed");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Video", 12)}
                <span>Démarrer Teams Call</span>
              </button>
              <button 
                onClick={() => {
                  setIsCallActive(false);
                  setVideoRouting({ mainScreen: "clickshare", sideScreen: "off", lecternFeed: "off" });
                  setProjectorScreen("up");
                  setBlackoutShades("open");
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Sun", 12)}
                <span>Présentation Locale</span>
              </button>
              <button 
                onClick={() => {
                  setIsCallActive(false);
                  setVideoRouting({ mainScreen: "off", sideScreen: "off", lecternFeed: "off" });
                  setProjectorScreen("up");
                  setBlackoutShades("open");
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
              onClick={() => setActiveTab("video_matrix")}
              className={`mobile-tab-btn ${activeTab === "video_matrix" ? "active" : ""}`}
            >
              {renderIcon("Tv", 14)}
              <span>Matrice</span>
            </button>
            <button
              onClick={() => setActiveTab("conference")}
              className={`mobile-tab-btn ${activeTab === "conference" ? "active" : ""}`}
            >
              {renderIcon("Video", 14)}
              <span>Visio</span>
            </button>
            <button
              onClick={() => setActiveTab("mics")}
              className={`mobile-tab-btn ${activeTab === "mics" ? "active" : ""}`}
            >
              {renderIcon("Volume2", 14)}
              <span>Micros</span>
            </button>
            <button
              onClick={() => setActiveTab("shades")}
              className={`mobile-tab-btn ${activeTab === "shades" ? "active" : ""}`}
            >
              {renderIcon("Sliders", 14)}
              <span>Stores</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: VIDEO MATRIX */}
          {activeTab === "video_matrix" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Tv", 18, "title-icon icon-blue")}
                <span>Routage Vidéo DM-NVX</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Main Screen Source selection */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Projecteur Principal</span>
                  <div className="av-source-grid">
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, mainScreen: "clickshare" })} 
                      className={`av-source-btn ${videoRouting.mainScreen === "clickshare" ? "active" : ""}`}
                    >
                      <span>Barco ClickShare</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, mainScreen: "wall_hdmi" })} 
                      className={`av-source-btn ${videoRouting.mainScreen === "wall_hdmi" ? "active" : ""}`}
                    >
                      <span>HDMI Mural</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, mainScreen: "pc_codec" })} 
                      className={`av-source-btn ${videoRouting.mainScreen === "pc_codec" ? "active" : ""}`}
                    >
                      <span>Codec Visioconf</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, mainScreen: "off" })} 
                      className={`av-source-btn ${videoRouting.mainScreen === "off" ? "active" : ""}`}
                    >
                      <span>Éteint</span>
                    </button>
                  </div>
                </div>

                {/* Side display Source selection */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Dalle Latérale</span>
                  <div className="av-source-grid">
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, sideScreen: "clickshare" })} 
                      className={`av-source-btn ${videoRouting.sideScreen === "clickshare" ? "active" : ""}`}
                    >
                      <span>Barco ClickShare</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, sideScreen: "wall_hdmi" })} 
                      className={`av-source-btn ${videoRouting.sideScreen === "wall_hdmi" ? "active" : ""}`}
                    >
                      <span>HDMI Mural</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, sideScreen: "pc_codec" })} 
                      className={`av-source-btn ${videoRouting.sideScreen === "pc_codec" ? "active" : ""}`}
                    >
                      <span>Codec Visioconf</span>
                    </button>
                    <button 
                      onClick={() => setVideoRouting({ ...videoRouting, sideScreen: "off" })} 
                      className={`av-source-btn ${videoRouting.sideScreen === "off" ? "active" : ""}`}
                    >
                      <span>Éteint</span>
                    </button>
                  </div>
                </div>

                {/* Matrix state status */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Rapport d'État Matriciel</span>
                  <div className="heating-indicators">
                    <div className="indicator-pill">
                      <span className="indicator-dot red-glow" />
                      <span>DM-NVX : Résolution 4K UHD @ 60Hz</span>
                    </div>
                    <div className="indicator-pill text-grey">
                      <span>Latence : &lt;1 image (zéro latence)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEOCONFERENCE */}
          {activeTab === "conference" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Video", 18, "title-icon icon-purple")}
                <span>Module de Visioconférence</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Conference activation card */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Lancement d'Appel</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Codec : {isCallActive ? "Connecté" : "Veille"}</span>
                    <button 
                      onClick={() => setIsCallActive(!isCallActive)} 
                      className={`tv-power-btn ${isCallActive ? "on" : "off"}`}
                    >
                      {renderIcon("PhoneCall", 14)}
                      <span>{isCallActive ? "Raccrocher" : "Appeler"}</span>
                    </button>
                  </div>

                  <div className="av-source-grid" style={{ marginTop: "12px" }}>
                    <button 
                      onClick={() => setCallSource("teams")} 
                      className={`av-source-btn ${callSource === "teams" ? "active" : ""}`}
                    >
                      <span>Microsoft Teams</span>
                    </button>
                    <button 
                      onClick={() => setCallSource("zoom")} 
                      className={`av-source-btn ${callSource === "zoom" ? "active" : ""}`}
                    >
                      <span>Zoom Rooms</span>
                    </button>
                  </div>
                </div>

                {/* Call stats or camera control */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Caméra Automatique PTZ</span>
                  <div className="cctv-actions-card" style={{ height: "100%", justifyContent: "center" }}>
                    <span className="cctv-action-lbl">Tracking Orateur</span>
                    <div className="status-toggle-row">
                      <span>Cadrage Intelligent (Auto Framing)</span>
                      <button 
                        onClick={() => setMicTracking(micTracking === "auto" ? "manual" : "auto")} 
                        className={`zermatt-toggle-switch ${micTracking === "auto" ? "on" : "off"}`}
                      >
                        <span className="slider-knob" />
                      </button>
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "#64748b" }}>
                      Statut : {micTracking === "auto" ? "Caméra suit le speaker actif" : "Contrôle manuel activé"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHURE MICS */}
          {activeTab === "mics" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Volume2", 18, "title-icon icon-green")}
                <span>Gestion Micros de Table Shure</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Master Mute */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Mute Général</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">État micro : {micMuted ? "Sourdine" : "Actif"}</span>
                    <button 
                      onClick={() => setMicMuted(!micMuted)} 
                      className={`tv-power-btn ${micMuted ? "on" : "off"}`}
                    >
                      {renderIcon(micMuted ? "VolumeX" : "Volume2", 14)}
                      <span>{micMuted ? "DÉMUTER" : "MUTER"}</span>
                    </button>
                  </div>
                </div>

                {/* Active speaker status indicator array */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Tracking de Faisceau MXA920</span>
                  <div className="mics-tracking-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[1, 2, 3, 4].map((id) => (
                      <div 
                        key={id} 
                        className={`mic-status-pill ${activeSpeaker === id ? "active" : ""}`}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          background: activeSpeaker === id ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)",
                          border: activeSpeaker === id ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.72rem"
                        }}
                      >
                        <span className={`rec-dot ${activeSpeaker === id ? "red-glow" : ""}`} style={{ backgroundColor: activeSpeaker === id ? "#10b981" : "#64748b" }} />
                        <span>Micro Zone {id} {activeSpeaker === id ? "(Speaker)" : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHADES & MOTORIZATIONS */}
          {activeTab === "shades" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Sliders", 18, "title-icon icon-yellow")}
                <span>Stores Occultants & Écran Projecteur</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Projector Screen */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Écran Motorisé</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Écran : {projectorScreen === "down" ? "Descendu" : "Monté"}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => setProjectorScreen("up")} 
                        className={`av-source-btn ${projectorScreen === "up" ? "active" : ""}`}
                        style={{ padding: "6px 12px" }}
                      >
                        {renderIcon("ArrowUp", 14)}
                      </button>
                      <button 
                        onClick={() => setProjectorScreen("down")} 
                        className={`av-source-btn ${projectorScreen === "down" ? "active" : ""}`}
                        style={{ padding: "6px 12px" }}
                      >
                        {renderIcon("ArrowDown", 14)}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shades */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Stores Blackout</span>
                  <div className="tv-power-row">
                    <span className="tv-status-txt">Stores : {blackoutShades === "closed" ? "Fermés" : "Ouverts"}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => setBlackoutShades("open")} 
                        className={`av-source-btn ${blackoutShades === "open" ? "active" : ""}`}
                        style={{ padding: "6px 12px" }}
                      >
                        {renderIcon("Sun", 14)}
                      </button>
                      <button 
                        onClick={() => setBlackoutShades("closed")} 
                        className={`av-source-btn ${blackoutShades === "closed" ? "active" : ""}`}
                        style={{ padding: "6px 12px" }}
                      >
                        {renderIcon("Moon", 14)}
                      </button>
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
