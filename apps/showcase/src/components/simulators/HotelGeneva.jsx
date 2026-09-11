import React, { useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";

const localTranslations = {
  fr: {
    monitor: "Supervision",
    spaces: "Espaces",
    summaries: "Résumé des pièces",
    alerts: "Alertes",
    share: "Partager",
    settings: "Configuration",
    guestRooms: "Chambres d'hôtes",
    searchPlaceholder: "Rechercher un numéro de chambre...",
    status: "Statut",
    refresh: "Actualiser",
    refreshed: "Mis à jour à 9:58 AM",
    room: "Chambre",
    temp: "Température",
    hvac: "Statut CVC & Consigne",
    fan: "Ventilation",
    humidity: "Humidité",
    roomStatus: "État Chambre",
    deviceControl: "Contrôle Équipements",
    roomControl: "Contrôle Chambre",
    lights: "Éclairages",
    shades: "Stores",
    others: "Autres",
    scenes: "Scénarios",
    upgradeFirmware: "Mettre à jour",
    firmware: "Firmware",
    systemList: "Liste des Systèmes",
    back: "Retour",
    occupiedRented: "Occupée (Louée)",
    occupiedNotRented: "Occupée (Non Louée)",
    drapes: "Rideaux",
    advanced: "Fonctionnalité Avancée"
  },
  en: {
    monitor: "System Monitor",
    spaces: "Spaces",
    summaries: "Room Summaries",
    alerts: "Alertes / Alerts",
    share: "Share",
    settings: "Place Settings",
    guestRooms: "Guest Rooms",
    searchPlaceholder: "Search room numbers...",
    status: "Room Status",
    refresh: "Refresh",
    refreshed: "Last Refreshed 9:58 AM",
    room: "Room",
    temp: "Current Temperature",
    hvac: "HVAC State & Setpoint",
    fan: "Fan State",
    humidity: "Humidity",
    roomStatus: "Room Status",
    deviceControl: "Device Control",
    roomControl: "Room Control",
    lights: "Lights",
    shades: "Shades",
    others: "Others",
    scenes: "Scenes",
    upgradeFirmware: "Upgrade Firmware",
    firmware: "Firmware",
    systemList: "System List",
    back: "Back",
    occupiedRented: "Occupied (Rented)",
    occupiedNotRented: "Occupied (Not Rented)",
    drapes: "Drapes",
    advanced: "Advanced Feature"
  },
  de: {
    monitor: "Systemüberwachung",
    spaces: "Räume",
    summaries: "Zimmerübersicht",
    alerts: "Meldungen",
    share: "Teilen",
    settings: "Einstellungen",
    guestRooms: "Gästezimmer",
    searchPlaceholder: "Zimmer suchen...",
    status: "Zimmerstatus",
    refresh: "Aktualisieren",
    refreshed: "Aktualisiert um 9:58 Uhr",
    room: "Zimmer",
    temp: "Temperatur",
    hvac: "Klima & Sollwert",
    fan: "Lüfterstufe",
    humidity: "Feuchtigkeit",
    roomStatus: "Belegung",
    deviceControl: "Gerätesteuerung",
    roomControl: "Raumsteuerung",
    lights: "Licht",
    shades: "Beschattung",
    others: "Andere",
    scenes: "Szenen",
    upgradeFirmware: "Firmware-Update",
    firmware: "Firmware",
    systemList: "Systemliste",
    back: "Zurück",
    occupiedRented: "Belegt (Vermietet)",
    occupiedNotRented: "Belegt (Nicht vermietet)",
    drapes: "Vorhänge",
    advanced: "Erweiterte Funktion"
  },
  es: {
    monitor: "Monitor de Sistema",
    spaces: "Espacios",
    summaries: "Resumen de Habitaciones",
    alerts: "Alertas",
    share: "Compartir",
    settings: "Configuración",
    guestRooms: "Habitaciones",
    searchPlaceholder: "Buscar habitaciones...",
    status: "Estado",
    refresh: "Actualizar",
    refreshed: "Actualizado a las 9:58 AM",
    room: "Habitación",
    temp: "Temperatura",
    hvac: "Estado Clima y consigna",
    fan: "Ventilación",
    humidity: "Humedad",
    roomStatus: "Ocupación",
    deviceControl: "Control de Equipos",
    roomControl: "Control de Habitación",
    lights: "Luces",
    shades: "Persianas",
    others: "Otros",
    scenes: "Escenas",
    upgradeFirmware: "Actualizar",
    firmware: "Firmware",
    systemList: "Lista de Sistemas",
    back: "Atrás",
    occupiedRented: "Ocupada (Alquilada)",
    occupiedNotRented: "Ocupada (No alquilada)",
    drapes: "Cortinas",
    advanced: "Función Avanzada"
  },
  ru: {
    monitor: "Монитор системы",
    spaces: "Помещения",
    summaries: "Сводка по номерам",
    alerts: "Предупреждения",
    share: "Поделиться",
    settings: "Настройки",
    guestRooms: "Номера гостей",
    searchPlaceholder: "Поиск номеров...",
    status: "Статус номеров",
    refresh: "Обновить",
    refreshed: "Обновлено в 9:58",
    room: "Номер",
    temp: "Температура",
    hvac: "Климат и уставка",
    fan: "Вентилятор",
    humidity: "Влажность",
    roomStatus: "Статус",
    deviceControl: "Управление устройствами",
    roomControl: "Сценарии номера",
    lights: "Свет",
    shades: "Шторы",
    others: "Другое",
    scenes: "Сценарии",
    upgradeFirmware: "Обновить ПО",
    firmware: "Прошивка",
    systemList: "Список систем",
    back: "Назад",
    occupiedRented: "Занят (Сдан)",
    occupiedNotRented: "Занят (Не сдан)",
    drapes: "Портьеры",
    advanced: "Доп. функции"
  },
  ar: {
    monitor: "مراقبة النظام",
    spaces: "المساحات",
    summaries: "خلاصة الغرف",
    alerts: "التنبيهات",
    share: "مشاركة",
    settings: "الإعدادات",
    guestRooms: "غرف النزلاء",
    searchPlaceholder: "البحث عن الغرف...",
    status: "حالة الغرفة",
    refresh: "تحديث",
    refreshed: "آخر تحديث 9:58 ص",
    room: "الغرفة",
    temp: "الحرارة الحالية",
    hvac: "حالة التكييف والضبط",
    fan: "المروحة",
    humidity: "الرطوبة",
    roomStatus: "حالة الحجز",
    deviceControl: "التحكم بالأجهزة",
    roomControl: "تحكم الغرفة",
    lights: "الإضاءة",
    shades: "الستائر",
    others: "أخرى",
    scenes: "السيناريوهات",
    upgradeFirmware: "تحديث النظام",
    firmware: "البرمجيات",
    systemList: "قائمة الأنظمة",
    back: "رجوع",
    occupiedRented: "محجوزة (مؤجرة)",
    occupiedNotRented: "محجوزة (غير مؤجرة)",
    drapes: "الستائر الثقيلة",
    advanced: "ميزة متقدمة"
  },
  zh: {
    monitor: "系统监控",
    spaces: "区域空间",
    summaries: "客房列表",
    alerts: "告警中心",
    share: "分享报告",
    settings: "位置设置",
    guestRooms: "客房状态",
    searchPlaceholder: "输入房间号搜索...",
    status: "房间状态",
    refresh: "刷新数据",
    refreshed: "上次更新: 9:58 AM",
    room: "房间号",
    temp: "当前温度",
    hvac: "空调状态与设定值",
    fan: "风机速度",
    humidity: "湿度",
    roomStatus: "客房状态",
    deviceControl: "终端设备调控",
    roomControl: "场景模式控制",
    lights: "照明调光",
    shades: "电动遮阳",
    others: "其他控制",
    scenes: "客房场景",
    upgradeFirmware: "升级固件",
    firmware: "固件版本",
    systemList: "硬件系统列表",
    back: "返回列表",
    occupiedRented: "已入住 (已登记)",
    occupiedNotRented: "已入住 (未登记)",
    drapes: "电动布帘",
    advanced: "高级管理员选项"
  }
};

export const HotelGeneva = ({ deviceType }) => {
  const { lang } = useTranslation();
  const [activeSection, setActiveSection] = useState("rooms");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lights, setLights] = useState([
    { id: "C7", name: "C7 Right Bedside Lamp", level: 60, isOn: true },
    { id: "C9", name: "C9 5amp Wall/floor sockets", level: 55, isOn: true },
    { id: "C11", name: "C11 Ceiling spots", level: 70, isOn: true },
    { id: "C1", name: "C1 Ceiling spots", level: 45, isOn: true },
    { id: "C2", name: "C2 Mirror", level: 40, isOn: true },
    { id: "C3", name: "C3 Power provision points", level: 75, isOn: true },
    { id: "C4", name: "C4 Nightlight", level: 40, isOn: true },
    { id: "C5", name: "C5 Niche downlight", level: 45, isOn: true },
    { id: "C8", name: "C8 Corniche WC", level: 60, isOn: true },
  ]);

  const [shadeValue, setShadeValue] = useState(35);
  const [activeControlTab, setActiveControlTab] = useState("lights");

  const [roomsData] = useState([
    { number: "400", temp: 22.5, hvacState: "heat", setpoint: 22, fanState: "High", status: "Occupied (Rented)", humidity: "44%" },
    { number: "401", temp: 21.5, hvacState: "cool", setpoint: 20.5, fanState: "High", status: "Occupied (Rented)", humidity: "45%" },
    { number: "402", temp: 21.5, hvacState: "off", setpoint: 21, fanState: "Off", status: "Occupied (Rented)", humidity: "42%" },
    { number: "404", temp: 21.5, hvacState: "cool", setpoint: 21, fanState: "Low", status: "Occupied (Rented)", humidity: "46%" },
    { number: "500", temp: 19.5, hvacState: "cool", setpoint: 18, fanState: "Medium", status: "Occupied (Rented)", humidity: "41%" },
    { number: "501", temp: 21.5, hvacState: "cool", setpoint: 21, fanState: "Medium", status: "Occupied (Not Rented)", humidity: "43%" },
    { number: "502", temp: 21, hvacState: "cool", setpoint: 20.5, fanState: "Low", status: "Occupied (Not Rented)", humidity: "45%" },
    { number: "504", temp: 21.5, hvacState: "cool", setpoint: 21, fanState: "Low", status: "Occupied (Rented)", humidity: "44%" },
  ]);

  const [systemsList] = useState([
    { name: "200", type: "TS-1070", status: "Online", version: "v1.002.0089" },
    { name: "201", type: "TS-1070", status: "Online", version: "v1.002.0089" },
    { name: "202", type: "TS-1070", status: "Online", version: "v1.002.0089" },
    { name: "203-205", type: "MC4-R", status: "Online", version: "v2.004.0124" },
    { name: "204", type: "TS-1070", status: "Online", version: "v1.002.0089" },
    { name: "220-222", type: "MC4-R", status: "Online", version: "v2.004.0124" },
    { name: "300", type: "TS-1070", status: "Online", version: "v1.002.0088" },
  ]);

  const translate = (key) => {
    const dict = localTranslations[lang] || localTranslations.en;
    return dict[key] || localTranslations.en[key] || key;
  };

  const handleLightToggle = (id) => {
    setLights((prev) =>
      prev.map((light) =>
        light.id === id ? { ...light, isOn: !light.isOn } : light
      )
    );
  };

  const adjustLightLevel = (id, delta) => {
    setLights((prev) =>
      prev.map((light) => {
        if (light.id === id) {
          const newLevel = Math.max(0, Math.min(100, light.level + delta));
          return { ...light, level: newLevel, isOn: newLevel > 0 };
        }
        return light;
      })
    );
  };

  const renderIcon = (iconName, size = 16, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const filteredRooms = roomsData.filter((r) =>
    r.number.includes(searchQuery)
  );

  const selectedRoomDetails = roomsData.find((r) => r.number === selectedRoomNumber);

  return (
    <div className="hotel-geneva-dashboard font-sans">
      {/* Header */}
      <header className="hotel-header">
        <div className="header-left">
          {renderIcon("Building", 20, "connect-logo-icon")}
          <span className="connect-brand-title">
            CONNECT <strong className="dashboard-text">DASHBOARD</strong>
          </span>
        </div>
        <div className="header-right">
          <button className="btn-admin-pill">
            {renderIcon("User", 14, "user-icon")}
            <span>Administrator</span>
          </button>
          {renderIcon("Bell", 18, "header-tool-icon")}
          {renderIcon("Settings", 18, "header-tool-icon")}
          <div className="user-avatar-circle">DP</div>
        </div>
      </header>

      {/* Main Body */}
      <div className="hotel-layout-body">
        {/* Sidebar */}
        <aside className="hotel-sidebar">
          <div className="hotel-property-selector">
            {renderIcon("Hotel", 20, "property-icon")}
            <div className="property-details">
              <span className="back-arrow-hotel">‹</span>
              <span className="property-name">Palace Genève</span>
            </div>
          </div>

          <div className="sidebar-group">
            <span className="sidebar-group-title">Monitor & Manage</span>
            <ul className="sidebar-nav-list">
              <li>
                <button
                  onClick={() => {
                    setSelectedRoomNumber(null);
                    setActiveSection("system");
                  }}
                  className={`sidebar-nav-item ${
                    activeSection === "system" && !selectedRoomNumber ? "active" : ""
                  }`}
                >
                  {renderIcon("Activity", 16)}
                  <span>{translate("monitor")}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedRoomNumber(null);
                    setActiveSection("rooms");
                  }}
                  className={`sidebar-nav-item ${
                    activeSection === "rooms" && !selectedRoomNumber ? "active" : ""
                  }`}
                >
                  {renderIcon("Layout", 16)}
                  <span>{translate("spaces")}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedRoomNumber(null);
                    setActiveSection("rooms");
                  }}
                  className="sidebar-nav-item"
                >
                  {renderIcon("Grid", 16)}
                  <span>{translate("summaries")}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedRoomNumber(null);
                    setActiveSection("alerts");
                  }}
                  className={`sidebar-nav-item ${
                    activeSection === "alerts" && !selectedRoomNumber ? "active" : ""
                  }`}
                >
                  {renderIcon("AlertTriangle", 16)}
                  <span>{translate("alerts")}</span>
                  <span className="badge-alerts-count">61</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar-footer-links">
            <button className="sidebar-nav-item-flat">
              {renderIcon("Share2", 16)}
              <span>{translate("share")}</span>
            </button>
            <button className="sidebar-nav-item-flat">
              {renderIcon("Settings", 16)}
              <span>{translate("settings")}</span>
            </button>
          </div>
        </aside>

        {/* Content area */}
        <main className="hotel-main-content">
          {selectedRoomNumber ? (
            /* Selected Room Control View */
            <div className="room-control-details-view fade-in">
              <div className="room-detail-header-row">
                <button onClick={() => setSelectedRoomNumber(null)} className="btn-back-to-list">
                  {renderIcon("ArrowLeft", 16)}
                  <span>{translate("back")}</span>
                </button>
                <h3>
                  {translate("room")} {selectedRoomNumber} - {translate("deviceControl")}
                </h3>
              </div>

              <div className="room-detail-grid">
                <div className="detail-panel-card device-control-card">
                  {/* Card control tabs */}
                  <div className="card-header-tabs">
                    <button
                      onClick={() => setActiveControlTab("lights")}
                      className={`tab-link ${activeControlTab === "lights" ? "active" : ""}`}
                    >
                      {renderIcon("Lightbulb", 14)}
                      <span>{translate("lights")}</span>
                    </button>
                    <button
                      onClick={() => setActiveControlTab("shades")}
                      className={`tab-link ${activeControlTab === "shades" ? "active" : ""}`}
                    >
                      {renderIcon("SlidersHorizontal", 14)}
                      <span>{translate("shades")}</span>
                    </button>
                    <button
                      onClick={() => setActiveControlTab("others")}
                      className={`tab-link ${activeControlTab === "others" ? "active" : ""}`}
                    >
                      {renderIcon("Grid", 14)}
                      <span>{translate("others")}</span>
                    </button>
                  </div>

                  {/* Card Tab pane contents */}
                  <div className="tab-pane-content">
                    {activeControlTab === "lights" && (
                      <div className="lights-dimmer-grid">
                        {lights.map((l) => (
                          <div key={l.id} className={`light-widget ${l.isOn ? "on" : ""}`}>
                            <div className="widget-header-row">
                              <span className="light-id">{l.id}</span>
                              <button
                                onClick={() => handleLightToggle(l.id)}
                                className={`light-power-btn ${l.isOn ? "active" : ""}`}
                              >
                                {renderIcon("Power", 10)}
                              </button>
                            </div>
                            <span className="light-name-text">{l.name}</span>
                            <span className="light-percentage-value">
                              {l.isOn ? `${l.level}%` : "OFF"}
                            </span>
                            <div className="widget-slider-controls">
                              <button
                                onClick={() => adjustLightLevel(l.id, -5)}
                                className="btn-level-adjust"
                              >
                                -
                              </button>
                              <div className="progress-bar-container">
                                <div
                                  className="progress-bar-fill"
                                  style={{ width: l.isOn ? `${l.level}%` : "0%" }}
                                />
                              </div>
                              <button
                                onClick={() => adjustLightLevel(l.id, 5)}
                                className="btn-level-adjust"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeControlTab === "shades" && (
                      <div className="shades-control-widget">
                        <div className="shade-card">
                          <div className="shade-card-header">
                            {renderIcon("SlidersHorizontal", 24, "icon-shades")}
                            <div className="shade-meta">
                              <span className="shade-title">{translate("drapes")}</span>
                              <span className="shade-status-text">
                                {shadeValue === 100
                                  ? "Ouvert"
                                  : shadeValue === 0
                                  ? "Fermé"
                                  : `Ouvert à ${shadeValue}%`}
                              </span>
                            </div>
                          </div>
                          <div className="shades-sliders-buttons">
                            <button onClick={() => setShadeValue(0)} className="btn-adjust-shade">
                              Close
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={shadeValue}
                              onChange={(e) => setShadeValue(parseInt(e.target.value))}
                              className="slider"
                              style={{ flex: 1 }}
                            />
                            <button onClick={() => setShadeValue(100)} className="btn-adjust-shade">
                              Open
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeControlTab === "others" && (
                      <div className="others-tab-pane">
                        <div className="empty-others-panel">
                          {renderIcon("AlertTriangle", 32)}
                          <span>{translate("advanced")}</span>
                          <button className="btn-upgrade-firmware">
                            {translate("upgradeFirmware")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info card in control view */}
                {selectedRoomDetails && (
                  <div className="detail-panel-card room-meta-panel" style={{ padding: "20px" }}>
                    <h4 style={{ marginBottom: "15px", borderBottom: "1px solid #f1f9", paddingBottom: "10px" }}>
                      Statut Chambre
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: "#64748b" }}>Température CVC</strong>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selectedRoomDetails.temp}°C</div>
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: "#64748b" }}>Consigne Target</strong>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selectedRoomDetails.setpoint}°C</div>
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: "#64748b" }}>Ventilation</strong>
                        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{selectedRoomDetails.fanState}</div>
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.8rem", color: "#64748b" }}>Belegung</strong>
                        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{selectedRoomDetails.status}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* General Sections */
            <div className="guest-rooms-list-view">
              {activeSection === "rooms" && (
                <>
                  <div className="view-header-title-bar">
                    <h2 className="title-text-hotel">{translate("guestRooms")}</h2>
                    <div className="actions-cluster">
                      <button className="btn-refresh-dashboard">
                        {renderIcon("RefreshCw", 12)}
                        <span>{translate("refresh")}</span>
                      </button>
                      <span className="timestamp-refresh">{translate("refreshed")}</span>
                    </div>
                  </div>

                  <div className="rooms-search-filters-row">
                    <div className="search-input-wrapper-hotel">
                      {renderIcon("Search", 14, "search-ic")}
                      <input
                        type="text"
                        placeholder={translate("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="hotel-search-box-input"
                      />
                    </div>
                  </div>

                  <div className="table-responsive-hotel">
                    <table className="rooms-data-table">
                      <thead>
                        <tr>
                          <th>{translate("room")}</th>
                          <th>{translate("temp")}</th>
                          <th>{translate("hvac")}</th>
                          <th>{translate("fan")}</th>
                          <th>{translate("roomStatus")}</th>
                          <th>{translate("humidity")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((room) => (
                          <tr
                            key={room.number}
                            onClick={() => {
                              setSelectedRoomNumber(room.number);
                              // Shuffle light states slightly on select for interactivity
                              setLights((prev) =>
                                prev.map((l) => ({
                                  ...l,
                                  isOn: Math.random() > 0.3,
                                  level: Math.floor(Math.random() * 60) + 40,
                                }))
                              );
                            }}
                            className="clickable-room-row"
                          >
                            <td className="room-number-cell">{room.number}</td>
                            <td>{room.temp}°C</td>
                            <td className="hvac-status-cell">
                              <span
                                className={`hvac-icon ${
                                  room.hvacState === "cool"
                                    ? "cool"
                                    : room.hvacState === "heat"
                                    ? "heat"
                                    : "off"
                                }`}
                              >
                                {room.hvacState === "cool" && renderIcon("Snowflake", 12)}
                                {room.hvacState === "heat" && renderIcon("Flame", 12)}
                                {room.hvacState === "off" && renderIcon("Power", 12)}
                              </span>
                              <span>
                                {room.hvacState.toUpperCase()} // Set: {room.setpoint}°C
                              </span>
                            </td>
                            <td>{room.fanState}</td>
                            <td>
                              <span className="dot-occupied" />
                              {room.status.includes("Not Rented")
                                ? translate("occupiedNotRented")
                                : translate("occupiedRented")}
                            </td>
                            <td>{room.humidity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeSection === "system" && (
                <>
                  <h2 className="title-text-hotel">{translate("systemList")}</h2>
                  <div className="table-responsive-hotel" style={{ marginTop: "15px" }}>
                    <table className="rooms-data-table">
                      <thead>
                        <tr>
                          <th>Nom Équipement</th>
                          <th>Modèle</th>
                          <th>Version Micrologiciel</th>
                          <th>État Connexion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemsList.map((sys, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>{sys.name}</td>
                            <td>{sys.type}</td>
                            <td>{sys.version}</td>
                            <td style={{ color: "#10b981", fontWeight: 600 }}>
                              <span className="online-status-pill">● Online</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeSection === "alerts" && (
                <div className="alerts-empty-view">
                  {renderIcon("CheckCircle", 48, "text-green")}
                  <h3>Aucune Alerte en cours</h3>
                  <p>Tous les processeurs Crestron et écrans tactiles TS-1070 fonctionnent normalement.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
