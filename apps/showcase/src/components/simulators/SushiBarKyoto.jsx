import React, { useState, useEffect } from "react";
import { Icons } from "../../icons";

export const SushiBarKyoto = ({ deviceType }) => {
  const [activeTab, setActiveTab] = useState("table_lights"); // table_lights, bar_glow, kitchen_fan, service_call
  const [tableLights, setTableLights] = useState({
    table1: 80,
    table2: 50,
    table3: 70,
    table4: 90,
  });
  const [colorAmbiance, setColorAmbiance] = useState("warm"); // warm, cool

  const [barGlowColor, setBarGlowColor] = useState("#e73c7e"); // Blossom Pink
  const [barBrightness, setBarBrightness] = useState(80);

  const [exhaustSpeed, setExhaustSpeed] = useState(45); // %

  const [activeCalls, setActiveCalls] = useState([
    { id: 1, table: "Table 2", type: "Sommelier", time: "2 min" },
    { id: 2, table: "Table 4", type: "Addition", time: "1 min" },
  ]);

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

  // Sommelier random request simulator
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCalls.length >= 4) return;
      const tables = ["Table 1", "Table 2", "Table 3", "Table 4"];
      const types = ["Service", "Sommelier", "Addition"];
      const randomTable = tables[Math.floor(Math.random() * tables.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      // Avoid duplicate active table calls
      if (activeCalls.some((c) => c.table === randomTable)) return;

      setActiveCalls((prev) => [
        ...prev,
        {
          id: Date.now(),
          table: randomTable,
          type: randomType,
          time: "0 min",
        },
      ]);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeCalls]);

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleClearCall = (id) => {
    setActiveCalls((prev) => prev.filter((call) => call.id !== id));
  };

  const isPhone = deviceType === "phone";

  return (
    <div className={`gemini-ui-root sushi-bar-kyoto-ui ${deviceType}`}>
      {/* Background Restaurant Photo */}
      <div 
        className="restaurant-bg-image" 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      {/* Dynamic Blossom Pink or Bamboo green background glow mapping sushi bar counter */}
      <div 
        className="ambient-bg-glow" 
        style={{ 
          background: `radial-gradient(circle at 50% 10%, ${barGlowColor}22 0%, transparent 60%)`
        }} 
      />

      {/* Header */}
      <header className="sunrise-header">
        <div className="header-left">
          {renderIcon("Utensils", 20, "brand-icon-sunrise")}
          <div className="brand-text-block">
            <span className="brand-title">KYOTO PREMIUM</span>
            <span className="brand-subtitle-room">Console Sommelier</span>
          </div>
        </div>

        <div className="header-right">
          {activeCalls.length > 0 && (
            <div className="call-duration-indicator" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#fca5a5" }}>
              <span className="rec-dot red-glow" style={{ backgroundColor: "#ef4444" }} />
              <span>{activeCalls.length} APPELS SERVICE</span>
            </div>
          )}
          <div className="time-widget">
            <span>{timeString || "20:00"}</span>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="sunrise-body">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isPhone && (
          <aside className="sunrise-sidebar">
            <div className="sidebar-nav-title">Kyoto Control</div>
            
            <button
              onClick={() => setActiveTab("table_lights")}
              className={`sidebar-nav-btn ${activeTab === "table_lights" ? "active" : ""}`}
            >
              {renderIcon("Lightbulb", 16)}
              <span>Éclairage Tables</span>
            </button>

            <button
              onClick={() => setActiveTab("bar_glow")}
              className={`sidebar-nav-btn ${activeTab === "bar_glow" ? "active" : ""}`}
            >
              {renderIcon("Sparkles", 16)}
              <span>Comptoir Sushi</span>
            </button>

            <button
              onClick={() => setActiveTab("kitchen_fan")}
              className={`sidebar-nav-btn ${activeTab === "kitchen_fan" ? "active" : ""}`}
            >
              {renderIcon("Wind", 16)}
              <span>Hotte Cuisine</span>
            </button>

            <button
              onClick={() => setActiveTab("service_call")}
              className={`sidebar-nav-btn ${activeTab === "service_call" ? "active" : ""}`}
            >
              {renderIcon("User", 16)}
              <span>Appels Clientèle</span>
            </button>

            {/* Quick Actions */}
            <div className="sidebar-divider" />
            <div className="sidebar-nav-title">Raccourcis Restaurant</div>
            <div className="quick-action-column">
              <button 
                onClick={() => {
                  setTableLights({ table1: 80, table2: 80, table3: 80, table4: 80 });
                  setBarGlowColor("#e73c7e");
                  setExhaustSpeed(70);
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Sparkles", 12)}
                <span>Service Actif (Soir)</span>
              </button>
              <button 
                onClick={() => {
                  setTableLights({ table1: 30, table2: 30, table3: 30, table4: 30 });
                  setBarGlowColor("#10b981");
                  setExhaustSpeed(20);
                }} 
                className="quick-preset-btn"
              >
                {renderIcon("Moon", 12)}
                <span>Mode Tamisé Cozy</span>
              </button>
              <button 
                onClick={() => {
                  setTableLights({ table1: 0, table2: 0, table3: 0, table4: 0 });
                  setBarGlowColor("#0b0f16");
                  setExhaustSpeed(0);
                  setActiveCalls([]);
                }} 
                className="quick-preset-btn-off"
              >
                {renderIcon("Power", 12)}
                <span>Fermeture Établissement</span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Header Tabs */}
        {isPhone && (
          <div className="zermatt-mobile-tabs">
            <button
              onClick={() => setActiveTab("table_lights")}
              className={`mobile-tab-btn ${activeTab === "table_lights" ? "active" : ""}`}
            >
              {renderIcon("Lightbulb", 14)}
              <span>Tables</span>
            </button>
            <button
              onClick={() => setActiveTab("bar_glow")}
              className={`mobile-tab-btn ${activeTab === "bar_glow" ? "active" : ""}`}
            >
              {renderIcon("Sparkles", 14)}
              <span>Bar</span>
            </button>
            <button
              onClick={() => setActiveTab("kitchen_fan")}
              className={`mobile-tab-btn ${activeTab === "kitchen_fan" ? "active" : ""}`}
            >
              {renderIcon("Wind", 14)}
              <span>Hotte</span>
            </button>
            <button
              onClick={() => setActiveTab("service_call")}
              className={`mobile-tab-btn ${activeTab === "service_call" ? "active" : ""}`}
            >
              {renderIcon("User", 14)}
              <span>Appels</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="sunrise-content">
          
          {/* TAB 1: INDIVIDUAL TABLE LIGHTS */}
          {activeTab === "table_lights" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Lightbulb", 18, "title-icon icon-yellow")}
                <span>Gradateurs d'Éclairage Individuel Tables</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Table ambiance mode */}
                <div className="control-section-card glass-card full-width-span" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="section-subtitle" style={{ margin: 0 }}>Ambiance de Lumière</span>
                  <div className="light-mode-toggle-group">
                    <button
                      className={`toggle-mode-btn ${colorAmbiance === "warm" ? "active" : ""}`}
                      onClick={() => setColorAmbiance("warm")}
                    >
                      Or Chaud (Tamisé)
                    </button>
                    <button
                      className={`toggle-mode-btn ${colorAmbiance === "cool" ? "active" : ""}`}
                      onClick={() => setColorAmbiance("cool")}
                    >
                      Blanc Pur (Service)
                    </button>
                  </div>
                </div>

                {/* Table sliders */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Gradation Individuelle (DALI)</span>
                  <div className="sliders-list-block">
                    {[1, 2, 3, 4].map((id) => (
                      <div key={id} className="dimmer-control-row">
                        <div className="dimmer-label-block">
                          {renderIcon("Sliders", 14)}
                          <span>Table {id}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={tableLights[`table${id}`]}
                          onChange={(e) => setTableLights({ ...tableLights, [`table${id}`]: parseInt(e.target.value) })}
                          className="zermatt-slider"
                          style={{
                            background: colorAmbiance === "warm" 
                              ? "linear-gradient(to right, rgba(251, 191, 36, 0.2), #fbbf24)" 
                              : "linear-gradient(to right, rgba(255,255,255,0.1), #fff)"
                          }}
                        />
                        <span className="dimmer-percentage" style={{ color: colorAmbiance === "warm" ? "#fbbf24" : "#fff" }}>
                          {tableLights[`table${id}`]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUSHI BAR COUNTER GLOW */}
          {activeTab === "bar_glow" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Sparkles", 18, "title-icon icon-cyan")}
                <span>Comptoir Sushi Bar LED Glow (DMX)</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Bar color selection */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Couleur LED Comptoir</span>
                  <div className="color-presets-row">
                    <button 
                      onClick={() => setBarGlowColor("#e73c7e")} 
                      className={`color-pill ${barGlowColor === "#e73c7e" ? "selected" : ""}`}
                      style={{ background: "#e73c7e" }}
                      title="Cerisier Blossom"
                    />
                    <button 
                      onClick={() => setBarGlowColor("#10b981")} 
                      className={`color-pill ${barGlowColor === "#10b981" ? "selected" : ""}`}
                      style={{ background: "#10b981" }}
                      title="Bambou Vert"
                    />
                    <button 
                      onClick={() => setBarGlowColor("#06b6d4")} 
                      className={`color-pill ${barGlowColor === "#06b6d4" ? "selected" : ""}`}
                      style={{ background: "#06b6d4" }}
                      title="Océan Bleu"
                    />
                    <button 
                      onClick={() => setBarGlowColor("#f59e0b")} 
                      className={`color-pill ${barGlowColor === "#f59e0b" ? "selected" : ""}`}
                      style={{ background: "#f59e0b" }}
                      title="Or Soleil"
                    />
                    <button 
                      onClick={() => setBarGlowColor("#0b0f16")} 
                      className={`color-pill ${barGlowColor === "#0b0f16" ? "selected" : ""}`}
                      style={{ background: "#3b4a5a" }}
                      title="Éteint"
                    />
                  </div>
                  <div className="color-status-text">
                    Glow actif : <span style={{ color: barGlowColor, fontWeight: "bold" }}>{barGlowColor}</span>
                  </div>
                </div>

                {/* Bar glow brightness dimmer */}
                <div className="control-section-card glass-card">
                  <span className="section-subtitle">Intensité LED Bar</span>
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block" style={{ width: "90px" }}>
                      {renderIcon("Sliders", 14)}
                      <span>Luminosité</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={barBrightness}
                      onChange={(e) => setBarBrightness(parseInt(e.target.value))}
                      className="zermatt-slider"
                      disabled={barGlowColor === "#0b0f16"}
                    />
                    <span className="dimmer-percentage">{barBrightness}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KITCHEN HOOD EXHAUST */}
          {activeTab === "kitchen_fan" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("Wind", 18, "title-icon icon-blue")}
                <span>Supervision Hotte d'Extraction Cuisine</span>
              </h2>

              <div className="zermatt-grid-layout">
                {/* Exhaust fan speed slider */}
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Régulateur de Vitesse d'Aspiration Cuisine</span>
                  <p className="section-explanation-text">
                    Gérez la vitesse d'extraction d'air de la hotte. Règle l'aspiration des fumées de grillade (Robata/Teppanyaki) tout en atténuant le bruit en salle.
                  </p>
                  
                  <div className="dimmer-control-row">
                    <div className="dimmer-label-block">
                      {renderIcon("Wind", 14)}
                      <span>Vitesse Hotte</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={exhaustSpeed}
                      onChange={(e) => setExhaustSpeed(parseInt(e.target.value))}
                      className="zermatt-slider"
                    />
                    <span className="dimmer-percentage">{exhaustSpeed}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOMMELIER PAGING CALLS */}
          {activeTab === "service_call" && (
            <div className="zermatt-panel-card fade-in">
              <h2 className="panel-title-text">
                {renderIcon("User", 18, "title-icon icon-purple")}
                <span>Console d'Appel Sommelier & Service</span>
              </h2>

              <div className="zermatt-grid-layout">
                <div className="control-section-card glass-card full-width-span">
                  <span className="section-subtitle">Appels en Attente de Prise en Charge</span>
                  
                  {activeCalls.length === 0 ? (
                    <div className="empty-projects-state glass-panel" style={{ padding: "30px", textAlign: "center" }}>
                      {renderIcon("Smile", 32, "icon-green")}
                      <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "#64748b" }}>Aucun appel client en cours. Tout est en ordre !</p>
                    </div>
                  ) : (
                    <div className="calls-list-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {activeCalls.map((call) => (
                        <div 
                          key={call.id} 
                          className="call-row-card glass-panel"
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.05)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <span 
                              style={{ 
                                background: call.type === "Sommelier" ? "rgba(192, 132, 252, 0.2)" : call.type === "Addition" ? "rgba(251, 191, 36, 0.2)" : "rgba(34, 211, 238, 0.2)",
                                color: call.type === "Sommelier" ? "#c084fc" : call.type === "Addition" ? "#fbbf24" : "#22d3ee",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                                fontWeight: "bold"
                              }}
                            >
                              {call.type}
                            </span>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fff" }}>{call.table}</span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Attente : {call.time}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleClearCall(call.id)}
                            className="tv-power-btn"
                            style={{ 
                              padding: "4px 10px",
                              backgroundColor: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.25)"
                            }}
                          >
                            Acquitter
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
