import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";
import { crestronHomeTranslations } from "../../data/crestronHomeTranslations";

export const CrestronHome = ({ deviceType }) => {
  const { lang } = useTranslation();
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [selectedRoomId, setSelectedRoomId] = useState("master");
  const [activeCategory, setActiveCategory] = useState("tous");

  const [lightStates, setLightStates] = useState({
    dining: true,
    kitchen: true,
    living: true,
    bedroom: false,
    master: true,
  });

  const [shadeStates, setShadeStates] = useState({
    dining: true,
    kitchen: true,
    living: true,
    bedroom: false,
    master: true,
  });

  const [roomTemperatures, setRoomTemperatures] = useState({
    bedroom: 74,
    living: 72,
    master: 75,
  });

  const [garageDoorState, setGarageDoorState] = useState("open");
  const [isPoolActivated, setIsPoolActivated] = useState(true);
  const [isSpaActivated, setIsSpaActivated] = useState(true);
  const [isAlarmArmed, setIsAlarmArmed] = useState(true);
  const [alarmMode, setAlarmMode] = useState("armed-stay");
  const [keypadInput, setKeypadInput] = useState("");
  const [isKeypadError, setIsKeypadError] = useState(false);

  const translate = (key) => {
    const dict = crestronHomeTranslations[lang] || crestronHomeTranslations.en;
    return dict[key] || crestronHomeTranslations.en[key] || key;
  };

  const toggleGarageDoor = () => {
    if (garageDoorState === "open") {
      setGarageDoorState("closing");
      setTimeout(() => {
        setGarageDoorState("closed");
      }, 2000);
    } else if (garageDoorState === "closed") {
      setGarageDoorState("open");
    }
  };

  const toggleRoomLight = (roomId) => {
    setLightStates((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const handleKeypadPress = (val) => {
    setIsKeypadError(false);
    if (val === "clear") {
      setKeypadInput("");
    } else if (val === "enter") {
      if (keypadInput === "1234") {
        if (alarmMode === "armed-stay") {
          setAlarmMode("disarmed");
          setIsAlarmArmed(false);
        } else {
          setAlarmMode("armed-stay");
          setIsAlarmArmed(true);
        }
        setKeypadInput("");
      } else {
        setIsKeypadError(true);
        setKeypadInput("");
        setTimeout(() => setIsKeypadError(false), 2000);
      }
    } else {
      if (keypadInput.length < 4) {
        setKeypadInput((prev) => prev + val);
      }
    }
  };

  const roomImages = {
    dining: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=400&q=80",
    kitchen: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
    living: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
    bedroom: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
    master: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80",
  };

  const getRoomName = (roomId) => {
    if (roomId === "dining") return translate("dining_room");
    if (roomId === "kitchen") return translate("kitchen");
    if (roomId === "living") return translate("living_room");
    if (roomId === "bedroom") return translate("bedroom");
    if (roomId === "master") return translate("master_bedroom");
    return roomId;
  };

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  return (
    <div className={`crestron-home-simulator-viewport ${deviceType}`}>
      {/* Time & Battery Status Bar */}
      <div className="home-simulator-status-bar">
        <span className="time-lbl">11:04</span>
        <div className="status-icons-right">
          {renderIcon("Wifi", 14)}
          <div className="battery-box">
            <span>82</span>
            {renderIcon("Battery", 14)}
          </div>
        </div>
      </div>

      {/* Main Body content screen */}
      <div className="home-simulator-body">
        {(() => {
          switch (activeScreen) {
            case "room-detail": {
              const bgImg = roomImages[selectedRoomId];
              const lightOn = lightStates[selectedRoomId];
              const shadeOpen = shadeStates[selectedRoomId];
              return (
                <div className="home-detail-screen">
                  <div className="home-room-hero" style={{ backgroundImage: `url(${bgImg})` }}>
                    <div className="hero-overlay">
                      <button className="btn-home-back" onClick={() => setActiveScreen("rooms")}>
                        {renderIcon("ChevronLeft", 20)}
                      </button>
                      <button className="btn-home-more">{renderIcon("MoreVertical", 20)}</button>
                      <div className="hero-text">
                        <h2>{getRoomName(selectedRoomId)}</h2>
                        <p className="hero-temp">
                          {selectedRoomId === "living"
                            ? `${roomTemperatures.living}°`
                            : selectedRoomId === "bedroom"
                            ? `${roomTemperatures.bedroom}°`
                            : selectedRoomId === "master"
                            ? `${roomTemperatures.master}°`
                            : "72°"}{" "}
                          — Froid à{" "}
                          {selectedRoomId === "living"
                            ? `${roomTemperatures.living}°`
                            : selectedRoomId === "bedroom"
                            ? `${roomTemperatures.bedroom}°`
                            : selectedRoomId === "master"
                            ? `${roomTemperatures.master}°`
                            : "72°"}
                        </p>
                        <p className="hero-lights-status">
                          {translate(lightOn ? "lights_on" : "lights_off")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="home-section-container">
                    <h3>{translate("actions")}</h3>
                    <div className="home-grid-row">
                      <button
                        className={`home-service-card compact ${lightOn ? "" : "off-active"}`}
                        onClick={() =>
                          setLightStates((prev) => ({ ...prev, [selectedRoomId]: false }))
                        }
                      >
                        {renderIcon("Power", 20, "icon-yellow")}
                        <span>{translate("room_off")}</span>
                      </button>
                    </div>
                  </div>

                  <div className="home-section-container">
                    <h3>{translate("services")}</h3>
                    <div className="home-services-grid">
                      <div className="home-service-control-card">
                        <span className="card-title">{translate("lights")}</span>
                        <div className="button-group-row">
                          <button
                            className={`service-btn-round ${!lightOn ? "active" : ""}`}
                            onClick={() => toggleRoomLight(selectedRoomId)}
                          >
                            {renderIcon("Power", 16)}
                          </button>
                          <button
                            className={`service-btn-round yellow-theme ${lightOn ? "active" : ""}`}
                            onClick={() => toggleRoomLight(selectedRoomId)}
                          >
                            {renderIcon("Lightbulb", 16)}
                          </button>
                        </div>
                      </div>

                      <div className="home-service-control-card" onClick={() => setActiveScreen("shades")}>
                        <span className="card-title">{translate("shades")}</span>
                        <div className="button-group-row">
                          <button
                            className={`service-btn-round ${!shadeOpen ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShadeStates((prev) => ({ ...prev, [selectedRoomId]: !prev[selectedRoomId] }));
                            }}
                          >
                            {renderIcon("ChevronDown", 16)}
                          </button>
                          <button
                            className={`service-btn-round blue-theme ${shadeOpen ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShadeStates((prev) => ({ ...prev, [selectedRoomId]: !prev[selectedRoomId] }));
                            }}
                          >
                            {renderIcon("ChevronUp", 16)}
                          </button>
                        </div>
                      </div>

                      <div
                        className="home-service-control-card span-full"
                        onClick={() => setActiveScreen("thermostat")}
                      >
                        <div className="thermo-card-left">
                          <span className="card-title">{translate("thermostat")}</span>
                          <span className="card-sub-info">
                            FROID, F.H. EN MARCHE (75°F)
                          </span>
                        </div>
                        <div className="thermo-card-right">
                          <div className="thermo-ring-indicator">
                            <span className="thermo-ring-val">
                              {roomTemperatures[selectedRoomId] || 72}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            case "thermostat": {
              return (
                <div className="home-sub-view-screen">
                  <div className="home-screen-header">
                    <button className="btn-home-back" onClick={() => setActiveScreen("dashboard")}>
                      {renderIcon("ChevronLeft", 20)}
                    </button>
                    <h2>{translate("title_thermostat")}</h2>
                    <div style={{ width: 24 }} />
                  </div>

                  <div className="home-thermo-list">
                    {Object.keys(roomTemperatures).map((zoneId) => (
                      <div key={zoneId} className="thermo-row-card">
                        <div className="thermo-row-top">
                          <div className="thermo-row-title">
                            <span className="zone-name">{zoneId.toUpperCase()}</span>
                            <span className="zone-status">FROID, F.H. EN MARCHE (75°F)</span>
                          </div>
                          <div className="thermo-mini-dial">
                            <span className="dial-val">{roomTemperatures[zoneId]}</span>
                          </div>
                        </div>
                        <div className="thermo-row-controls">
                          <button
                            className="btn-temp-adjust"
                            onClick={() =>
                              setRoomTemperatures((prev) => ({ ...prev, [zoneId]: prev[zoneId] - 1 }))
                            }
                          >
                            {renderIcon("Minus", 18)}
                          </button>
                          <div className="consigne-val">
                            <strong>{roomTemperatures[zoneId]}°</strong>
                            <span>{translate("consigne")}</span>
                          </div>
                          <button
                            className="btn-temp-adjust"
                            onClick={() =>
                              setRoomTemperatures((prev) => ({ ...prev, [zoneId]: prev[zoneId] + 1 }))
                            }
                          >
                            {renderIcon("Plus", 18)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            case "shades": {
              return (
                <div className="home-sub-view-screen">
                  <div className="home-screen-header">
                    <button className="btn-home-back" onClick={() => setActiveScreen("dashboard")}>
                      {renderIcon("ChevronLeft", 20)}
                    </button>
                    <h2>{translate("title_shades")}</h2>
                    <div style={{ width: 24 }} />
                  </div>
                  <div className="shades-tab-bar">
                    <button className="shade-tab-btn active">{translate("salles")}</button>
                    <button className="shade-tab-btn">{translate("scenes")}</button>
                  </div>
                  <div className="home-thermo-list" style={{ padding: "16px" }}>
                    {Object.keys(shadeStates).map((shId) => (
                      <div
                        key={shId}
                        className="thermo-row-card"
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "16px",
                          marginBottom: "12px",
                        }}
                      >
                        <span style={{ fontWeight: 700, textTransform: "capitalize" }}>
                          {getRoomName(shId)}
                        </span>
                        <div className="button-group-row" style={{ marginTop: 0 }}>
                          <button
                            onClick={() => setShadeStates((prev) => ({ ...prev, [shId]: false }))}
                            className={`service-btn-round ${!shadeStates[shId] ? "active" : ""}`}
                          >
                            {renderIcon("ChevronDown", 16)}
                          </button>
                          <button
                            onClick={() => setShadeStates((prev) => ({ ...prev, [shId]: true }))}
                            className={`service-btn-round blue-theme ${shadeStates[shId] ? "active" : ""}`}
                          >
                            {renderIcon("ChevronUp", 16)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            case "security": {
              return (
                <div className="home-sub-view-screen">
                  <div className="home-screen-header">
                    <button className="btn-home-back" onClick={() => setActiveScreen("dashboard")}>
                      {renderIcon("ChevronLeft", 20)}
                    </button>
                    <h2>{translate("title_security")}</h2>
                    <div style={{ width: 24 }} />
                  </div>

                  <div className="security-keypad-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      className={`alarm-shield ${
                        alarmMode === "disarmed" ? "disarmed" : "armed_away"
                      }`}
                      style={{ fontSize: "1.1rem", marginBottom: "15px", gap: "10px", display: "flex", alignItems: "center" }}
                    >
                      {renderIcon(alarmMode === "disarmed" ? "ShieldAlert" : "ShieldCheck", 22)}
                      <span>
                        {alarmMode === "disarmed" ? translate("disarmed") : translate("armed_stay")}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#0003",
                        padding: "15px",
                        borderRadius: "10px",
                        width: "100%",
                        maxWidth: "260px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: 700,
                          letterSpacing: "5px",
                          height: "38px",
                          color: isKeypadError ? "#ef4444" : "#fff",
                        }}
                      >
                        {isKeypadError
                          ? translate("code_error")
                          : keypadInput
                          ? "*".repeat(keypadInput.length)
                          : translate("enter_code")}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "10px",
                          marginTop: "20px",
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleKeypadPress(num.toString())}
                            className="temp-btn"
                            style={{ width: "50px", height: "50px", fontSize: "1.2rem", margin: "auto" }}
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={() => handleKeypadPress("clear")}
                          className="temp-btn"
                          style={{ width: "50px", height: "50px", fontSize: "0.85rem", margin: "auto", color: "#ea580c" }}
                        >
                          CLR
                        </button>
                        <button
                          onClick={() => handleKeypadPress("0")}
                          className="temp-btn"
                          style={{ width: "50px", height: "50px", fontSize: "1.2rem", margin: "auto" }}
                        >
                          0
                        </button>
                        <button
                          onClick={() => handleKeypadPress("enter")}
                          className="temp-btn"
                          style={{ width: "50px", height: "50px", fontSize: "0.85rem", margin: "auto", color: "#16a34a" }}
                        >
                          ENT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            case "rooms":
            default: {
              // Dashboard home view
              return (
                <div className="home-dashboard-screen animate-fadeIn">
                  <div className="home-screen-header centered">
                    <h2>{translate("my_beach_house")}</h2>
                    <button className="btn-home-menu">{renderIcon("Menu", 18)}</button>
                  </div>

                  <div className="home-dashboard-grid">
                    {/* Shades widget */}
                    <div className="home-widget-square" onClick={() => setActiveScreen("shades")}>
                      {renderIcon("SlidersHorizontal", 24, "icon-blue")}
                      <div className="widget-bottom">
                        <h4>{translate("title_shades")}</h4>
                        <p>{translate("open")}</p>
                      </div>
                    </div>

                    {/* Security widget */}
                    <div
                      className={`home-widget-square ${isAlarmArmed ? "armed-bg" : ""}`}
                      onClick={() => setActiveScreen("security")}
                    >
                      {renderIcon("Shield", 24, isAlarmArmed ? "icon-white animate-pulse" : "icon-purple")}
                      <div className="widget-bottom">
                        <h4>{translate("main_house")}</h4>
                        <p className={isAlarmArmed ? "text-white" : ""}>
                          {translate(isAlarmArmed ? "armed" : "disarmed")}
                        </p>
                      </div>
                    </div>

                    {/* Garage wide widget */}
                    <div className="home-widget-wide">
                      <div className="widget-wide-top">
                        {renderIcon("Key", 18, "icon-red")}
                        <h4>{translate("garage")}</h4>
                      </div>
                      <div className="widget-wide-buttons">
                        <button className="wide-action-btn">
                          {renderIcon("Lock", 16)}
                          <span>{translate("lock_all")}</span>
                        </button>
                        <button
                          className={`wide-action-btn highlighted ${
                            garageDoorState === "closing" ? "spinning-action" : ""
                          }`}
                          onClick={toggleGarageDoor}
                          disabled={garageDoorState === "closing"}
                        >
                          {garageDoorState === "closing" ? (
                            renderIcon("Loader2", 16, "spin-icon animate-spin")
                          ) : garageDoorState === "closed" ? (
                            renderIcon("Unlock", 16)
                          ) : (
                            renderIcon("Lock", 16)
                          )}
                          <span>
                            {translate(
                              garageDoorState === "closing"
                                ? "garage_closing"
                                : garageDoorState === "closed"
                                ? "garage_closed"
                                : "garage_btn"
                            )}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Thermostat widget */}
                    <div className="home-widget-square" onClick={() => setActiveScreen("thermostat")}>
                      {renderIcon("Thermometer", 24, "icon-blue")}
                      <div className="widget-bottom">
                        <h4>{translate("thermostat")}</h4>
                        <p>{roomTemperatures.master}°F</p>
                      </div>
                    </div>

                    {/* Pool widget */}
                    <div
                      className={`home-widget-square ${isPoolActivated ? "active-bg" : ""}`}
                      onClick={() => setIsPoolActivated(!isPoolActivated)}
                    >
                      {renderIcon("Droplet", 24, isPoolActivated ? "icon-white" : "icon-blue")}
                      <div className="widget-bottom">
                        <h4>{translate("pool")} 1</h4>
                        <p className={isPoolActivated ? "text-white" : ""}>
                          {translate(isPoolActivated ? "activated" : "deactivated")}
                        </p>
                      </div>
                    </div>

                    {/* Spa widget */}
                    <div
                      className={`home-widget-square ${isSpaActivated ? "active-bg" : ""}`}
                      onClick={() => setIsSpaActivated(!isSpaActivated)}
                    >
                      {renderIcon("Sparkles", 24, isSpaActivated ? "icon-white" : "icon-green")}
                      <div className="widget-bottom">
                        <h4>{translate("spa")} 1</h4>
                        <p className={isSpaActivated ? "text-white" : ""}>
                          {translate(isSpaActivated ? "activated" : "deactivated")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rooms list scroll container in Crestron Home */}
                  <div className="home-section-container" style={{ marginTop: "24px" }}>
                    <h3 style={{ textTransform: "uppercase", color: "#8c8f94", fontSize: "0.75rem", fontWeight: 800, marginBottom: "10px" }}>
                      Salles
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {Object.keys(roomImages).map((roomId) => (
                        <div
                          key={roomId}
                          onClick={() => {
                            setSelectedRoomId(roomId);
                            setActiveScreen("room-detail");
                          }}
                          className="home-service-control-card"
                          style={{
                            minHeight: "75px",
                            cursor: "pointer",
                            backgroundImage: `linear-gradient(#0004, #0009), url(${roomImages[roomId]})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            padding: "10px",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{getRoomName(roomId)}</span>
                          <span style={{ fontSize: "0.65rem", opacity: 0.85 }}>
                            {lightStates[roomId] ? "Lumières allumées" : "Éteint"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
          }
        })()}
      </div>

      {/* Bottom Simulator tabs in Crestron Home */}
      <div className="home-simulator-bottom-tabs">
        <button
          className={`tab-btn-item ${activeScreen === "dashboard" || activeScreen === "rooms" ? "active" : ""}`}
          onClick={() => setActiveScreen("dashboard")}
        >
          {renderIcon("Home", 22)}
        </button>
        <button
          className={`tab-btn-item ${activeScreen === "room-detail" ? "active" : ""}`}
          onClick={() => {
            setSelectedRoomId("master");
            setActiveScreen("room-detail");
          }}
        >
          {renderIcon("Grid", 22)}
        </button>
        <button
          className={`tab-btn-item ${activeScreen === "thermostat" ? "active" : ""}`}
          onClick={() => setActiveScreen("thermostat")}
        >
          {renderIcon("Thermometer", 22)}
        </button>
        <button
          className={`tab-btn-item ${activeScreen === "security" ? "active" : ""}`}
          onClick={() => setActiveScreen("security")}
        >
          {renderIcon("Shield", 22)}
        </button>
      </div>
    </div>
  );
};
