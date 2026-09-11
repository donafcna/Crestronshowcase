import React, { useEffect, useMemo, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./appartement.css";

// Appartement Eaux-Vives (Genève) — scènes & planning. Inspiré de "Elegant
// Home Scene Control" et du template rooms / HVAC / planning / stores
// motorisés (AVstudio). Tout le feedback est local (état React).

const T = {
  fr: { rooms: "Pièces", scenes: "Scènes", schedule: "Planning", climate: "Climat", blinds: "Stores", energy: "Énergie", home: "Appartement", away: "Absent", present: "Présent",
    lights: "Lumières", temp: "Température", setpoint: "Consigne", position: "Position", tilt: "Orientation", open: "Ouvrir", close: "Fermer", stop: "Stop", allBlinds: "Tous les stores",
    run: "Activer", running: "Activée", edit: "Modifier", weekly: "Programme hebdomadaire", days: ["L", "M", "M", "J", "V", "S", "D"], at: "à", enabled: "Actif", disabled: "Inactif",
    consumption: "Consommation", solar: "Production solaire", today: "Aujourd'hui", grid: "Réseau", battery: "Batterie", ev: "Voiture", heatpump: "Pompe à chaleur", selfUse: "Autoconsommation",
    mode: "Mode", heat: "Chauffage", cool: "Rafraîchissement", off: "Arrêt", eco: "Éco", comfort: "Confort", auto: "Auto", hum: "Humidité", nextChange: "Prochain changement", allOff: "Tout éteindre", occupied: "Occupée", empty: "Vide",
    lightsOn: "allumées", morning: "Réveil", leave: "Départ", back: "Retour", evening: "Soirée", night: "Nuit", cinema: "Cinéma", guests: "Invités",
  },
  en: { rooms: "Rooms", scenes: "Scenes", schedule: "Schedule", climate: "Climate", blinds: "Blinds", energy: "Energy", home: "Apartment", away: "Away", present: "Home",
    lights: "Lights", temp: "Temperature", setpoint: "Setpoint", position: "Position", tilt: "Tilt", open: "Open", close: "Close", stop: "Stop", allBlinds: "All blinds",
    run: "Activate", running: "Active", edit: "Edit", weekly: "Weekly programme", days: ["M", "T", "W", "T", "F", "S", "S"], at: "at", enabled: "Enabled", disabled: "Disabled",
    consumption: "Consumption", solar: "Solar production", today: "Today", grid: "Grid", battery: "Battery", ev: "Car", heatpump: "Heat pump", selfUse: "Self-consumption",
    mode: "Mode", heat: "Heating", cool: "Cooling", off: "Off", eco: "Eco", comfort: "Comfort", auto: "Auto", hum: "Humidity", nextChange: "Next change", allOff: "All off", occupied: "Occupied", empty: "Empty",
    lightsOn: "on", morning: "Wake up", leave: "Leave", back: "Back home", evening: "Evening", night: "Night", cinema: "Movie", guests: "Guests",
  },
  de: { rooms: "Räume", scenes: "Szenen", schedule: "Zeitplan", climate: "Klima", blinds: "Storen", energy: "Energie", home: "Wohnung", away: "Abwesend", present: "Zuhause",
    lights: "Licht", temp: "Temperatur", setpoint: "Sollwert", position: "Position", tilt: "Lamellen", open: "Öffnen", close: "Schliessen", stop: "Stopp", allBlinds: "Alle Storen",
    run: "Aktivieren", running: "Aktiv", edit: "Bearbeiten", weekly: "Wochenprogramm", days: ["M", "D", "M", "D", "F", "S", "S"], at: "um", enabled: "Aktiv", disabled: "Inaktiv",
    consumption: "Verbrauch", solar: "Solarproduktion", today: "Heute", grid: "Netz", battery: "Batterie", ev: "Auto", heatpump: "Wärmepumpe", selfUse: "Eigenverbrauch",
    mode: "Modus", heat: "Heizen", cool: "Kühlen", off: "Aus", eco: "Eco", comfort: "Komfort", auto: "Auto", hum: "Feuchte", nextChange: "Nächste Änderung", allOff: "Alles aus", occupied: "Belegt", empty: "Leer",
    lightsOn: "an", morning: "Aufstehen", leave: "Verlassen", back: "Zurück", evening: "Abend", night: "Nacht", cinema: "Kino", guests: "Gäste",
  },
};

const ROOMS = [
  { id: "salon", icon: "Sofa", name: { fr: "Salon", en: "Living room", de: "Wohnzimmer" }, lights: 65, temp: 21.8, set: 22, blind: 30, tilt: 45, occ: true },
  { id: "cuisine", icon: "Utensils", name: { fr: "Cuisine", en: "Kitchen", de: "Küche" }, lights: 90, temp: 22.4, set: 21, blind: 0, tilt: 0, occ: true },
  { id: "chambre", icon: "Bed", name: { fr: "Chambre", en: "Bedroom", de: "Schlafzimmer" }, lights: 0, temp: 19.6, set: 19, blind: 80, tilt: 90, occ: false },
  { id: "bureau", icon: "Monitor", name: { fr: "Bureau", en: "Office", de: "Büro" }, lights: 40, temp: 21.1, set: 21, blind: 20, tilt: 30, occ: false },
  { id: "sdb", icon: "Bath", name: { fr: "Salle de bain", en: "Bathroom", de: "Bad" }, lights: 0, temp: 23.0, set: 23, blind: 100, tilt: 0, occ: false },
  { id: "enfant", icon: "Star", name: { fr: "Chambre enfant", en: "Kids' room", de: "Kinderzimmer" }, lights: 15, temp: 20.2, set: 20, blind: 60, tilt: 60, occ: false },
];

const SCENES = [
  { id: "morning", icon: "Sunrise", color: "#f59e0b", lights: { salon: 50, cuisine: 90, chambre: 30, bureau: 0, sdb: 80, enfant: 30 }, blinds: 0, set: 21.5, time: "06:45", days: [1, 1, 1, 1, 1, 0, 0], on: true },
  { id: "leave", icon: "LogIn", color: "#64748b", lights: { salon: 0, cuisine: 0, chambre: 0, bureau: 0, sdb: 0, enfant: 0 }, blinds: 40, set: 18.5, time: "08:15", days: [1, 1, 1, 1, 1, 0, 0], on: true },
  { id: "back", icon: "Home", color: "#0ea5e9", lights: { salon: 60, cuisine: 70, chambre: 0, bureau: 30, sdb: 30, enfant: 40 }, blinds: 20, set: 21.5, time: "18:30", days: [1, 1, 1, 1, 1, 0, 0], on: true },
  { id: "evening", icon: "Wine", color: "#a855f7", lights: { salon: 35, cuisine: 20, chambre: 20, bureau: 0, sdb: 20, enfant: 10 }, blinds: 100, set: 21, time: "20:30", days: [1, 1, 1, 1, 1, 1, 1], on: true },
  { id: "cinema", icon: "Clapperboard", color: "#ef4444", lights: { salon: 8, cuisine: 0, chambre: 0, bureau: 0, sdb: 0, enfant: 0 }, blinds: 100, set: 21, time: "—", days: [0, 0, 0, 0, 0, 0, 0], on: false },
  { id: "night", icon: "MoonStar", color: "#1e293b", lights: { salon: 0, cuisine: 0, chambre: 0, bureau: 0, sdb: 5, enfant: 5 }, blinds: 100, set: 19, time: "23:00", days: [1, 1, 1, 1, 1, 1, 1], on: true },
  { id: "guests", icon: "Users", color: "#10b981", lights: { salon: 80, cuisine: 85, chambre: 0, bureau: 0, sdb: 60, enfant: 0 }, blinds: 30, set: 22, time: "—", days: [0, 0, 0, 0, 0, 0, 0], on: false },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const AppartementEauxVives = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  const t = (k) => (T[lang] || T.fr)[k] || T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState(ROOMS);
  const [selected, setSelected] = useState("salon");
  const [scenes, setScenes] = useState(SCENES);
  const [activeScene, setActiveScene] = useState("back");
  const [editing, setEditing] = useState(null);
  const [presence, setPresence] = useState(true);
  const [mode, setMode] = useState("auto");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 4000);
    return () => clearInterval(id);
  }, []);

  // Énergie simulée (varie doucement)
  const energy = useMemo(() => {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    const sun = clamp(Math.sin(((h - 6) / 14) * Math.PI), 0, 1);
    const solar = +(4.8 * sun + Math.sin(tick) * 0.15).toFixed(1);
    const use = +(1.4 + rooms.reduce((a, r) => a + r.lights, 0) / 600 + (mode === "off" ? 0 : 0.9) + Math.cos(tick / 2) * 0.1).toFixed(1);
    return { solar: Math.max(0, solar), use, grid: +(use - solar).toFixed(1), battery: 68 + Math.round(Math.sin(tick / 3) * 4), selfUse: Math.round(clamp((Math.min(solar, use) / (solar || 1)) * 100, 0, 100)) };
  }, [tick, rooms, mode]);

  const room = rooms.find((r) => r.id === selected);
  const patchRoom = (id, p) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const patchScene = (id, p) => setScenes((ss) => ss.map((s) => (s.id === id ? { ...s, ...p } : s)));

  const runScene = (s) => {
    setActiveScene(s.id);
    setRooms((rs) => rs.map((r) => ({ ...r, lights: s.lights[r.id] ?? r.lights, blind: s.blinds, set: s.set })));
    if (s.id === "leave") setPresence(false);
    if (s.id === "back" || s.id === "morning") setPresence(true);
  };
  const shiftTime = (s, delta) => {
    if (s.time === "—") return;
    const [h, m] = s.time.split(":").map(Number);
    let total = (h * 60 + m + delta + 1440) % 1440;
    patchScene(s.id, { time: `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}` });
  };
  const toggleDay = (s, i) => patchScene(s.id, { days: s.days.map((d, j) => (j === i ? (d ? 0 : 1) : d)) });

  const nextScene = useMemo(() => {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const day = (new Date().getDay() + 6) % 7;
    const list = scenes.filter((s) => s.on && s.time !== "—" && s.days[day]).map((s) => ({ s, m: Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3)) })).sort((a, b) => a.m - b.m);
    return (list.find((x) => x.m > nowMin) || list[0])?.s;
  }, [scenes]);

  const Icon = ({ name, size = 18, className = "" }) => {
    const C = Icons[name] || Icons.Circle;
    return <C size={size} className={className} />;
  };
  const NAV = [
    { id: "rooms", icon: "LayoutGrid", label: t("rooms") },
    { id: "scenes", icon: "Sparkles", label: t("scenes") },
    { id: "climate", icon: "Thermometer", label: t("climate") },
    { id: "blinds", icon: "Blinds", label: t("blinds") },
    { id: "energy", icon: "Zap", label: t("energy") },
  ];
  const lightsOnCount = rooms.filter((r) => r.lights > 0).length;

  const renderRooms = () => (
    <div className="ap-panel">
      <div className="ap-rooms">
        {rooms.map((r) => (
          <button key={r.id} className={`ap-room ${selected === r.id ? "selected" : ""} ${r.lights > 0 ? "lit" : ""}`} onClick={() => setSelected(r.id)}>
            <div className="ap-room-head"><Icon name={r.icon} size={20} /><span className={`ap-occ ${r.occ ? "on" : ""}`} title={r.occ ? t("occupied") : t("empty")} /></div>
            <b>{r.name[lang] || r.name.fr}</b>
            <div className="ap-room-meta"><span><Icon name="Lightbulb" size={12} /> {r.lights} %</span><span><Icon name="Thermometer" size={12} /> {r.temp.toFixed(1)}°</span><span><Icon name="Blinds" size={12} /> {r.blind} %</span></div>
          </button>
        ))}
      </div>
      {room && (
        <div className="ap-card ap-room-detail">
          <div className="ap-card-title"><Icon name={room.icon} size={16} /> {room.name[lang] || room.name.fr}</div>
          <div className="ap-detail-grid">
            <div className="ap-ctrl">
              <div className="ap-ctrl-head"><Icon name="Lightbulb" size={16} /> {t("lights")} <strong>{room.lights} %</strong></div>
              <input type="range" min="0" max="100" value={room.lights} onChange={(e) => patchRoom(room.id, { lights: Number(e.target.value) })} style={{ "--val": `${room.lights}%` }} />
              <div className="ap-seg"><button onClick={() => patchRoom(room.id, { lights: 0 })}>{t("off")}</button><button onClick={() => patchRoom(room.id, { lights: 40 })}>40 %</button><button onClick={() => patchRoom(room.id, { lights: 100 })}>100 %</button></div>
            </div>
            <div className="ap-ctrl">
              <div className="ap-ctrl-head"><Icon name="Thermometer" size={16} /> {t("setpoint")} <strong>{room.set.toFixed(1)} °C</strong></div>
              <div className="ap-stepper">
                <button onClick={() => patchRoom(room.id, { set: clamp(room.set - 0.5, 16, 26) })}><Icon name="Minus" size={16} /></button>
                <div><b>{room.set.toFixed(1)}</b><span>{t("temp")} {room.temp.toFixed(1)} °C</span></div>
                <button onClick={() => patchRoom(room.id, { set: clamp(room.set + 0.5, 16, 26) })}><Icon name="Plus" size={16} /></button>
              </div>
            </div>
            <div className="ap-ctrl">
              <div className="ap-ctrl-head"><Icon name="Blinds" size={16} /> {t("blinds")} <strong>{room.blind} %</strong></div>
              <input type="range" min="0" max="100" value={room.blind} onChange={(e) => patchRoom(room.id, { blind: Number(e.target.value) })} style={{ "--val": `${room.blind}%` }} />
              <div className="ap-seg"><button onClick={() => patchRoom(room.id, { blind: 0 })}><Icon name="ChevronUp" size={14} /> {t("open")}</button><button onClick={() => patchRoom(room.id, { blind: 100 })}><Icon name="ChevronDown" size={14} /> {t("close")}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderScenes = () => (
    <div className="ap-panel">
      <div className="ap-scene-grid">
        {scenes.map((s) => (
          <div key={s.id} className={`ap-scene ${activeScene === s.id ? "active" : ""}`} style={{ "--c": s.color }}>
            <button className="ap-scene-main" onClick={() => runScene(s)}>
              <span className="ap-scene-icon"><Icon name={s.icon} size={20} /></span>
              <b>{t(s.id)}</b>
              <em>{activeScene === s.id ? t("running") : s.time !== "—" ? `${s.time}` : t("run")}</em>
            </button>
            <button className="ap-scene-edit" onClick={() => setEditing(editing === s.id ? null : s.id)} title={t("edit")}><Icon name="Clock" size={14} /></button>
          </div>
        ))}
      </div>
      <div className="ap-card">
        <div className="ap-card-title"><Icon name="CalendarClock" size={16} /> {t("weekly")} {nextScene && <span className="ap-next">· {t("nextChange")} : {t(nextScene.id)} {nextScene.time}</span>}</div>
        <div className="ap-timeline">
          {scenes.filter((s) => s.time !== "—").sort((a, b) => a.time.localeCompare(b.time)).map((s) => (
            <div key={s.id} className={`ap-tl-row ${editing === s.id ? "editing" : ""} ${s.on ? "" : "disabled"}`} style={{ "--c": s.color }}>
              <span className="ap-tl-dot" />
              <div className="ap-tl-time">
                {editing === s.id ? (
                  <><button onClick={() => shiftTime(s, -15)}><Icon name="Minus" size={12} /></button><b>{s.time}</b><button onClick={() => shiftTime(s, 15)}><Icon name="Plus" size={12} /></button></>
                ) : <b>{s.time}</b>}
              </div>
              <div className="ap-tl-name"><Icon name={s.icon} size={14} /> {t(s.id)}</div>
              <div className="ap-days">
                {s.days.map((d, i) => <button key={i} className={d ? "on" : ""} onClick={() => editing === s.id && toggleDay(s, i)} disabled={editing !== s.id}>{t("days")[i]}</button>)}
              </div>
              <button className={`ap-switch ${s.on ? "on" : ""}`} onClick={() => patchScene(s.id, { on: !s.on })}><i /></button>
              <button className="ap-tl-edit" onClick={() => setEditing(editing === s.id ? null : s.id)}>{editing === s.id ? <Icon name="Check" size={14} /> : t("edit")}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClimate = () => (
    <div className="ap-panel">
      <div className="ap-card">
        <div className="ap-card-title"><Icon name="Thermometer" size={16} /> {t("mode")} · {t("heatpump")}</div>
        <div className="ap-seg wide">
          {[["auto", t("auto")], ["heat", t("heat")], ["cool", t("cool")], ["eco", t("eco")], ["off", t("off")]].map(([id, l]) => <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>{l}</button>)}
        </div>
      </div>
      <div className="ap-zones">
        {rooms.map((r) => (
          <div key={r.id} className="ap-zone">
            <div className="ap-zone-head"><Icon name={r.icon} size={16} /><span>{r.name[lang] || r.name.fr}</span><em>{t("hum")} {42 + (r.id.length % 5)} %</em></div>
            <div className="ap-zone-body">
              <div className="ap-zone-temp"><b>{r.temp.toFixed(1)}</b><span>°C</span></div>
              <div className="ap-zone-bar"><i style={{ width: `${((r.set - 16) / 10) * 100}%` }} /><b style={{ left: `${((r.temp - 16) / 10) * 100}%` }} /></div>
              <div className="ap-stepper small">
                <button onClick={() => patchRoom(r.id, { set: clamp(r.set - 0.5, 16, 26) })}><Icon name="Minus" size={14} /></button>
                <b>{r.set.toFixed(1)}</b>
                <button onClick={() => patchRoom(r.id, { set: clamp(r.set + 0.5, 16, 26) })}><Icon name="Plus" size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBlinds = () => (
    <div className="ap-panel">
      <div className="ap-card ap-blinds-all">
        <div className="ap-card-title"><Icon name="Blinds" size={16} /> {t("allBlinds")}</div>
        <div className="ap-seg">
          <button onClick={() => setRooms((rs) => rs.map((r) => ({ ...r, blind: 0 })))}><Icon name="ChevronUp" size={14} /> {t("open")}</button>
          <button onClick={() => setRooms((rs) => rs.map((r) => ({ ...r, blind: 50, tilt: 45 })))}>50 %</button>
          <button onClick={() => setRooms((rs) => rs.map((r) => ({ ...r, blind: 100 })))}><Icon name="ChevronDown" size={14} /> {t("close")}</button>
        </div>
      </div>
      <div className="ap-blinds">
        {rooms.map((r) => (
          <div key={r.id} className="ap-blind">
            <div className="ap-blind-visual">
              <div className="ap-blind-slats" style={{ height: `${r.blind}%` }}>
                {Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ transform: `rotateX(${r.tilt * 0.8}deg)` }} />)}
              </div>
            </div>
            <div className="ap-blind-ctrl">
              <b><Icon name={r.icon} size={14} /> {r.name[lang] || r.name.fr}</b>
              <label>{t("position")} · {r.blind} %</label>
              <input type="range" min="0" max="100" value={r.blind} onChange={(e) => patchRoom(r.id, { blind: Number(e.target.value) })} style={{ "--val": `${r.blind}%` }} />
              <label>{t("tilt")} · {r.tilt}°</label>
              <input type="range" min="0" max="90" value={r.tilt} onChange={(e) => patchRoom(r.id, { tilt: Number(e.target.value) })} style={{ "--val": `${(r.tilt / 90) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnergy = () => (
    <div className="ap-panel">
      <div className="ap-energy-flow">
        <div className="ap-node solar"><Icon name="Sun" size={22} /><b>{energy.solar} kW</b><span>{t("solar")}</span></div>
        <div className="ap-node home"><Icon name="Home" size={22} /><b>{energy.use} kW</b><span>{t("consumption")}</span></div>
        <div className="ap-node grid"><Icon name="Plug" size={22} /><b>{energy.grid > 0 ? "+" : ""}{energy.grid} kW</b><span>{t("grid")}</span></div>
        <div className="ap-node battery"><Icon name="BatteryCharging" size={22} /><b>{energy.battery} %</b><span>{t("battery")}</span></div>
        <div className="ap-flow-line" />
      </div>
      <div className="ap-grid-2">
        <div className="ap-card">
          <div className="ap-card-title"><Icon name="Activity" size={16} /> {t("today")}</div>
          <div className="ap-bars">
            {Array.from({ length: 24 }).map((_, h) => {
              const sun = clamp(Math.sin(((h - 6) / 14) * Math.PI), 0, 1);
              return <div key={h} className="ap-bar"><i className="s" style={{ height: `${sun * 90}%` }} /><i className="u" style={{ height: `${25 + ((h * 7) % 40) + (h > 17 && h < 23 ? 25 : 0)}%` }} /></div>;
            })}
          </div>
          <div className="ap-legend"><span><i className="s" /> {t("solar")}</span><span><i className="u" /> {t("consumption")}</span></div>
        </div>
        <div className="ap-card">
          <div className="ap-card-title"><Icon name="Leaf" size={16} /> {t("selfUse")}</div>
          <div className="ap-ring" style={{ "--p": `${energy.selfUse}%` }}><b>{energy.selfUse} %</b></div>
          <div className="ap-kv"><span><Icon name="Flame" size={14} /> {t("heatpump")}</span><b>{mode === "off" ? "0.0" : "0.9"} kW</b></div>
          <div className="ap-kv"><span><Icon name="Zap" size={14} /> {t("ev")}</span><b>{presence ? "3.6" : "0.0"} kW</b></div>
        </div>
      </div>
    </div>
  );

  const PANELS = { rooms: renderRooms, scenes: renderScenes, climate: renderClimate, blinds: renderBlinds, energy: renderEnergy };

  return (
    <div className={`gemini-ui-root appartement-ui ${deviceType} ${presence ? "" : "away"}`}>
      <header className="ap-header">
        <div className="ap-brand">
          <div className="ap-brand-mark"><Icon name="Home" size={18} /></div>
          <div><div className="ap-brand-title">{clientName || "Eaux-Vives 12"}</div><div className="ap-brand-sub">{t("home")} · 124 m² · {lightsOnCount} {t("lights").toLowerCase()} {t("lightsOn")}</div></div>
        </div>
        <div className="ap-header-right">
          <button className={`ap-presence ${presence ? "home" : "away"}`} onClick={() => setPresence((p) => !p)}><Icon name={presence ? "Home" : "LogIn"} size={14} /> {presence ? t("present") : t("away")}</button>
          {!isPhone && <button className="ap-alloff" onClick={() => runScene(scenes.find((s) => s.id === "leave"))}><Icon name="Power" size={14} /> {t("allOff")}</button>}
        </div>
      </header>
      <div className="ap-body">
        {!isPhone && (
          <nav className="ap-nav">
            {NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={18} /><span>{n.label}</span></button>)}
          </nav>
        )}
        <main className="ap-main">{PANELS[tab]()}</main>
      </div>
      {isPhone && (
        <nav className="ap-tabbar">
          {NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>)}
        </nav>
      )}
    </div>
  );
};
