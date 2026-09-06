import React, { useEffect, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./villaLeman.css";

// Villa Léman (Cologny) — thème « Obsidienne » : anthracite, un seul accent
// cyan, capitales condensées, cadran circulaire, photos de pièces en fond.
// Rail vertical sur dalle / tablette, barre d'onglets sur smartphone.
// Tout le feedback est local (état React).

const T = {
  fr: { home: "Accueil", rooms: "Pièces", lights: "Éclairage", climate: "Climat", media: "Médias", security: "Sécurité",
    greetingEve: "Bonsoir", greetingDay: "Bonjour", status: "Toutes les portes sont verrouillées", litRooms: "pièces éclairées", pool: "Piscine à",
    quick: "Actions rapides", morning: "Bonjour", evening: "Soirée", away: "Absent", night: "Nuit", ground: "Rez-de-chaussée", floor: "Étage", outside: "Extérieur",
    setpoint: "Consigne", heating: "Chauffage", cooling: "Rafraîchissement", auto: "Auto", off: "Éteint", lit: "Éclairée", music: "Musique", movie: "Film en cours", quiet: "Calme",
    photo: "Photo", allOff: "Tout éteindre", floorOff: "Étage éteint", on: "ON", offShort: "OFF", turnOn: "Allumer", turnOff: "Éteindre",
    audio: "Audio", video: "Vidéo", shades: "Stores", open: "Ouvert", closed: "Fermé", stop: "Stop", close: "Fermer", opening: "Ouvrir", armed: "Armée", disarmed: "Désarmée · prête",
    source: "Source", volume: "Volume", playing: "En lecture", paused: "En pause", nowPlaying: "Lecture en cours", sources: "Sources", zones: "Zones audio",
    locks: "Serrures", frontDoor: "Porte d'entrée", garage: "Garage", gate: "Portail", terrace: "Baie terrasse", locked: "Verrouillée", unlocked: "Déverrouillée", enterCode: "Saisir le code", arm: "Armer", disarm: "Désarmer", presence: "Présence", cameras: "Caméras",
    clear: "Ciel dégagé", mode: "Mode", fan: "Ventilation", schedule: "Programme", hold: "Manuel", humidity: "Humidité", scene: "Scène", scenes: "Scènes d'éclairage", dim: "Tamisé", full: "Plein", reading: "Lecture", dinner: "Dîner" },
  en: { home: "Home", rooms: "Rooms", lights: "Lighting", climate: "Climate", media: "Media", security: "Security",
    greetingEve: "Good evening", greetingDay: "Good morning", status: "All doors are locked", litRooms: "rooms lit", pool: "Pool at",
    quick: "Quick actions", morning: "Morning", evening: "Evening", away: "Away", night: "Night", ground: "Ground floor", floor: "Upstairs", outside: "Outdoors",
    setpoint: "Setpoint", heating: "Heating", cooling: "Cooling", auto: "Auto", off: "Off", lit: "Lit", music: "Music", movie: "Movie playing", quiet: "Quiet",
    photo: "Photo", allOff: "All off", floorOff: "Floor off", on: "ON", offShort: "OFF", turnOn: "Turn on", turnOff: "Turn off",
    audio: "Audio", video: "Video", shades: "Shades", open: "Open", closed: "Closed", stop: "Stop", close: "Close", opening: "Open", armed: "Armed", disarmed: "Disarmed · ready",
    source: "Source", volume: "Volume", playing: "Playing", paused: "Paused", nowPlaying: "Now playing", sources: "Sources", zones: "Audio zones",
    locks: "Locks", frontDoor: "Front door", garage: "Garage", gate: "Gate", terrace: "Terrace door", locked: "Locked", unlocked: "Unlocked", enterCode: "Enter code", arm: "Arm", disarm: "Disarm", presence: "Stay", cameras: "Cameras",
    clear: "Clear sky", mode: "Mode", fan: "Fan", schedule: "Schedule", hold: "Hold", humidity: "Humidity", scene: "Scene", scenes: "Lighting scenes", dim: "Dim", full: "Full", reading: "Reading", dinner: "Dinner" },
  de: { home: "Start", rooms: "Räume", lights: "Licht", climate: "Klima", media: "Medien", security: "Sicherheit",
    greetingEve: "Guten Abend", greetingDay: "Guten Morgen", status: "Alle Türen sind verriegelt", litRooms: "Räume beleuchtet", pool: "Pool bei",
    quick: "Schnellaktionen", morning: "Morgen", evening: "Abend", away: "Abwesend", night: "Nacht", ground: "Erdgeschoss", floor: "Obergeschoss", outside: "Aussen",
    setpoint: "Sollwert", heating: "Heizen", cooling: "Kühlen", auto: "Auto", off: "Aus", lit: "Beleuchtet", music: "Musik", movie: "Film läuft", quiet: "Ruhig",
    photo: "Foto", allOff: "Alles aus", floorOff: "Etage aus", on: "AN", offShort: "AUS", turnOn: "Einschalten", turnOff: "Ausschalten",
    audio: "Audio", video: "Video", shades: "Storen", open: "Offen", closed: "Geschlossen", stop: "Stopp", close: "Schliessen", opening: "Öffnen", armed: "Scharf", disarmed: "Unscharf · bereit",
    source: "Quelle", volume: "Lautstärke", playing: "Wiedergabe", paused: "Pause", nowPlaying: "Aktuell", sources: "Quellen", zones: "Audiozonen",
    locks: "Schlösser", frontDoor: "Haustür", garage: "Garage", gate: "Tor", terrace: "Terrassentür", locked: "Verriegelt", unlocked: "Entriegelt", enterCode: "Code eingeben", arm: "Scharf", disarm: "Unscharf", presence: "Anwesend", cameras: "Kameras",
    clear: "Klarer Himmel", mode: "Modus", fan: "Lüftung", schedule: "Programm", hold: "Manuell", humidity: "Feuchte", scene: "Szene", scenes: "Lichtszenen", dim: "Gedimmt", full: "Voll", reading: "Lesen", dinner: "Abendessen" },
};

const ROOMS = [
  { id: "salon", floor: "ground", name: { fr: "Salon", en: "Living room", de: "Wohnzimmer" }, tint: "#2B3A47", temp: 21.5, set: 22, light: 60, shade: 0, source: "spotify" },
  { id: "cuisine", floor: "ground", name: { fr: "Cuisine", en: "Kitchen", de: "Küche" }, tint: "#3A3129", temp: 22, set: 21.5, light: 80, shade: 0, source: null },
  { id: "bureau", floor: "ground", name: { fr: "Bureau", en: "Office", de: "Büro" }, tint: "#23303A", temp: 20, set: 20.5, light: 0, shade: 40, source: null },
  { id: "cinema", floor: "ground", name: { fr: "Home cinéma", en: "Home cinema", de: "Heimkino" }, tint: "#1A1F2A", temp: 19, set: 20, light: 8, shade: 100, source: "appletv" },
  { id: "suite", floor: "floor", name: { fr: "Suite parentale", en: "Master suite", de: "Elternsuite" }, tint: "#34303B", temp: 20.5, set: 20, light: 0, shade: 100, source: null },
  { id: "enfants", floor: "floor", name: { fr: "Chambre enfants", en: "Kids' room", de: "Kinderzimmer" }, tint: "#2C3640", temp: 20, set: 20, light: 15, shade: 100, source: null },
  { id: "sdb", floor: "floor", name: { fr: "Salle de bain", en: "Bathroom", de: "Bad" }, tint: "#2A3A3D", temp: 23, set: 23, light: 0, shade: 80, source: null },
  { id: "terrasse", floor: "outside", name: { fr: "Terrasse", en: "Terrace", de: "Terrasse" }, tint: "#243342", temp: 14, set: null, light: 30, shade: null, source: "spotify" },
  { id: "piscine", floor: "outside", name: { fr: "Piscine", en: "Pool", de: "Pool" }, tint: "#1E3A45", temp: 27, set: 27, light: 40, shade: null, source: null },
];

const SOURCES = [
  { id: "spotify", label: "Spotify", icon: "Music", track: "Playlist du soir", artist: "Jazz · Piste 4 / 18" },
  { id: "appletv", label: "Apple TV", icon: "Tv", track: "Dune : deuxième partie", artist: "1 h 12 restantes" },
  { id: "radio", label: "Radio", icon: "Radio", track: "Couleur 3", artist: "FM 98.4" },
  { id: "vinyl", label: "Platine", icon: "Disc3", track: "Kind of Blue", artist: "Miles Davis · Face A" },
];

const LOCKS = [
  { id: "front", key: "frontDoor", locked: true },
  { id: "garage", key: "garage", locked: true },
  { id: "gate", key: "gate", locked: true },
  { id: "terrace", key: "terrace", locked: false },
];

// Polices Google chargées à la volée (un échec réseau n'empêche pas l'interface
// de s'afficher : les polices de secours prennent le relais).
const FONT_URL = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600&family=Barlow:wght@300;400;500&display=swap";
const useFonts = () => {
  useEffect(() => {
    if (document.getElementById("vl-fonts")) return;
    const link = document.createElement("link");
    link.id = "vl-fonts";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const VillaLeman = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  useFonts();
  const t = (k) => (T[lang] || T.fr)[k] ?? T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("home");
  const [rooms, setRooms] = useState(ROOMS);
  const [selected, setSelected] = useState("salon");
  const [floor, setFloor] = useState("ground");
  const [action, setAction] = useState("evening");
  const [mode, setMode] = useState("auto");
  const [source, setSource] = useState("spotify");
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(38);
  const [locks, setLocks] = useState(LOCKS);
  const [armed, setArmed] = useState(true);
  const [code, setCode] = useState("");

  const room = rooms.find((r) => r.id === selected);
  const patch = (id, p) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const name = (r) => r.name[lang] || r.name.fr;
  const litCount = rooms.filter((r) => r.light > 0).length;
  const hour = new Date().getHours();
  const greeting = hour >= 18 || hour < 5 ? t("greetingEve") : t("greetingDay");
  const clock = new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-CH", { hour: "2-digit", minute: "2-digit" });
  const dateShort = new Date().toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-GB" : "fr-CH", { weekday: "short", day: "2-digit" });

  const runAction = (id) => {
    setAction(id);
    if (id === "morning") setRooms((rs) => rs.map((r) => ({ ...r, light: r.floor === "outside" ? 0 : 70, shade: r.shade == null ? null : 0 })));
    if (id === "evening") setRooms((rs) => rs.map((r) => ({ ...r, light: r.id === "cinema" ? 8 : r.floor === "floor" ? 0 : 55, shade: r.shade == null ? null : 100 })));
    if (id === "away") { setRooms((rs) => rs.map((r) => ({ ...r, light: 0, shade: r.shade == null ? null : 100 }))); setArmed(true); setLocks((ls) => ls.map((l) => ({ ...l, locked: true }))); }
    if (id === "night") { setRooms((rs) => rs.map((r) => ({ ...r, light: r.id === "sdb" ? 10 : 0, shade: r.shade == null ? null : 100 }))); setLocks((ls) => ls.map((l) => ({ ...l, locked: true }))); }
  };

  const Icon = ({ name: n, size = 18 }) => { const C = Icons[n] || Icons.Circle; return <C size={size} />; };
  const NAV = [
    { id: "home", icon: "Home", label: t("home") },
    { id: "rooms", icon: "LayoutGrid", label: t("rooms") },
    { id: "lights", icon: "Lightbulb", label: t("lights") },
    { id: "climate", icon: "Thermometer", label: t("climate") },
    { id: "media", icon: "Music", label: t("media") },
    { id: "security", icon: "Shield", label: t("security") },
  ];
  const FLOORS = [["ground", t("ground")], ["floor", t("floor")], ["outside", t("outside")]];

  // Cadran circulaire (arc de 270°)
  const Dial = ({ value, set, size = 150, onMinus, onPlus }) => {
    const r = size * 0.42, c = size / 2;
    const pol = (deg) => { const a = ((deg - 90) * Math.PI) / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
    const start = 135, span = 270;
    const arc = (from, to) => { const [x1, y1] = pol(from), [x2, y2] = pol(to); return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
    const pct = clamp(((set ?? value) - 15) / 15, 0, 1);
    const [kx, ky] = pol(start + span * pct);
    return (
      <div className="vl-dial" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={arc(start, start + span)} fill="none" stroke="var(--vl-line)" strokeWidth={size * 0.05} strokeLinecap="round" />
          <path d={arc(start, start + span * pct)} fill="none" stroke="var(--vl-accent)" strokeWidth={size * 0.05} strokeLinecap="round" />
          <circle cx={kx} cy={ky} r={size * 0.04} fill="var(--vl-bg)" stroke="var(--vl-accent)" strokeWidth="2" />
        </svg>
        <div className="vl-dial-center">
          <b>{value.toFixed(1).replace(".", ",")}°</b>
          {set != null && <span>{t("setpoint")} {set.toFixed(1).replace(".", ",")}°</span>}
        </div>
        {onMinus && <button className="vl-dial-btn minus" onClick={onMinus} aria-label="-"><Icon name="Minus" size={16} /></button>}
        {onPlus && <button className="vl-dial-btn plus" onClick={onPlus} aria-label="+"><Icon name="Plus" size={16} /></button>}
      </div>
    );
  };

  const RoomTile = ({ r, compact }) => (
    <button className={`vl-tile ${selected === r.id ? "selected" : ""} ${compact ? "compact" : ""}`} style={{ "--tint": r.tint }} onClick={() => { setSelected(r.id); setTab("rooms"); }}>
      <span className="vl-tile-photo">{t("photo")} · {name(r)}</span>
      {r.light > 0 && <span className="vl-tile-dot" />}
      <span className="vl-tile-name">{name(r)}</span>
      <span className="vl-tile-meta">{r.temp.toFixed(1).replace(".", ",")}° · {r.source ? (r.source === "appletv" ? t("movie") : t("music")) : r.light > 0 ? t("lit") : t("quiet")}</span>
    </button>
  );

  const renderHome = () => (
    <div className="vl-page vl-home">
      <header className="vl-hero">
        <div>
          <span className="vl-eyebrow">{clientName || "Villa Léman"} · Cologny</span>
          <h1>{greeting}</h1>
          <p>{t("status")} · {litCount} {t("litRooms")} · {t("pool")} 27°</p>
        </div>
        <div className="vl-weather"><Icon name="Sun" size={26} /><div><b>14°</b><span>{t("clear")}</span></div></div>
      </header>
      <div className="vl-home-row">
        <div className="vl-card vl-climate-mini">
          <Dial value={room?.temp ?? 21.5} set={room?.set ?? 22} size={isPhone ? 118 : 112} />
          <div className="vl-mini-text"><span className="vl-label">{t("climate")}</span><b>{room ? name(room) : ""}</b><em>{mode === "auto" ? t("auto") : mode === "heat" ? t("heating") : t("cooling")}</em></div>
        </div>
        <div className="vl-actions">
          <span className="vl-label">{t("quick")}</span>
          <div className="vl-action-grid">
            {[["morning", t("morning")], ["evening", t("evening")], ["away", t("away")], ["night", t("night")]].map(([id, l]) => (
              <button key={id} className={`vl-action ${action === id ? "active" : ""}`} onClick={() => runAction(id)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="vl-floors" data-demo-nav>
        {FLOORS.map(([id, l]) => <button key={id} className={floor === id ? "active" : ""} onClick={() => setFloor(id)}>{l}</button>)}
      </div>
      <div className="vl-tiles">{rooms.filter((r) => r.floor === floor).map((r) => <RoomTile key={r.id} r={r} />)}</div>
    </div>
  );

  const renderRooms = () => (
    <div className="vl-page vl-rooms">
      <div className="vl-room-list" data-demo-nav>
        {rooms.map((r) => <button key={r.id} className={selected === r.id ? "active" : ""} onClick={() => setSelected(r.id)}>{name(r)}{r.light > 0 && <i />}</button>)}
      </div>
      {room && (
        <div className="vl-room-detail" style={{ "--tint": room.tint }}>
          <div className="vl-room-head"><span className="vl-eyebrow">{FLOORS.find((f) => f[0] === room.floor)?.[1]}</span><h2>{name(room)}</h2>
            <button className="vl-ghost" onClick={() => patch(room.id, { light: 0, source: null })}><Icon name="Power" size={14} /> {t("off")}</button></div>
          <div className="vl-room-grid">
            <div className="vl-card">
              <span className="vl-label"><Icon name="Lightbulb" size={14} /> {t("lights")}</span>
              <b className="vl-big">{room.light} %</b>
              <input type="range" min="0" max="100" value={room.light} onChange={(e) => patch(room.id, { light: Number(e.target.value) })} style={{ "--val": `${room.light}%` }} />
              <div className="vl-seg">{[[0, t("off")], [30, t("dim")], [100, t("full")]].map(([v, l]) => <button key={v} className={room.light === v ? "active" : ""} onClick={() => patch(room.id, { light: v })}>{l}</button>)}</div>
            </div>
            <div className="vl-card vl-card-dial">
              <span className="vl-label"><Icon name="Thermometer" size={14} /> {t("climate")}</span>
              {room.set != null ? <Dial value={room.temp} set={room.set} size={isPhone ? 150 : 140} onMinus={() => patch(room.id, { set: clamp(room.set - 0.5, 15, 30) })} onPlus={() => patch(room.id, { set: clamp(room.set + 0.5, 15, 30) })} /> : <b className="vl-big">{room.temp}°</b>}
            </div>
            <div className="vl-card">
              <span className="vl-label"><Icon name="Music" size={14} /> {t("audio")}</span>
              <b className="vl-big small">{room.source ? SOURCES.find((s) => s.id === room.source)?.label : "—"}</b>
              <div className="vl-seg">{SOURCES.slice(0, 3).map((s) => <button key={s.id} className={room.source === s.id ? "active" : ""} onClick={() => patch(room.id, { source: room.source === s.id ? null : s.id })}>{s.label}</button>)}</div>
            </div>
            {room.shade != null && (
              <div className="vl-card">
                <span className="vl-label"><Icon name="Blinds" size={14} /> {t("shades")}</span>
                <b className="vl-big small">{room.shade === 0 ? t("open") : room.shade === 100 ? t("closed") : `${room.shade} %`}</b>
                <div className="vl-seg">
                  <button onClick={() => patch(room.id, { shade: 0 })}><Icon name="ChevronUp" size={14} /> {t("opening")}</button>
                  <button onClick={() => patch(room.id, { shade: 50 })}>{t("stop")}</button>
                  <button onClick={() => patch(room.id, { shade: 100 })}><Icon name="ChevronDown" size={14} /> {t("close")}</button>
                </div>
              </div>
            )}
            <div className="vl-card">
              <span className="vl-label"><Icon name="Shield" size={14} /> {t("security")}</span>
              <b className={`vl-big small ${armed ? "" : "ok"}`}>{armed ? t("armed") : t("disarmed")}</b>
              <div className="vl-seg"><button className={armed ? "active" : ""} onClick={() => setArmed(true)}>{t("arm")}</button><button className={!armed ? "active" : ""} onClick={() => setArmed(false)}>{t("disarm")}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLights = () => (
    <div className="vl-page">
      <div className="vl-page-head"><h2>{t("lights")}</h2>
        <div className="vl-head-btns"><button className="vl-ghost" onClick={() => setRooms((rs) => rs.map((r) => (r.floor === floor ? { ...r, light: 0 } : r)))}>{t("floorOff")}</button><button className="vl-ghost" onClick={() => setRooms((rs) => rs.map((r) => ({ ...r, light: 0 })))}>{t("allOff")}</button></div></div>
      <div className="vl-floors" data-demo-nav>{FLOORS.map(([id, l]) => <button key={id} className={floor === id ? "active" : ""} onClick={() => setFloor(id)}>{l}</button>)}</div>
      <div className="vl-light-list">
        {rooms.filter((r) => r.floor === floor).map((r) => (
          <div key={r.id} className={`vl-light-row ${r.light > 0 ? "on" : ""}`}>
            <span className="vl-badge">{r.light > 0 ? t("on") : t("offShort")}</span>
            <b>{name(r)}</b>
            <input type="range" min="0" max="100" value={r.light} onChange={(e) => patch(r.id, { light: Number(e.target.value) })} style={{ "--val": `${r.light}%` }} />
            <span className="vl-pct">{r.light} %</span>
            <button className={`vl-switch ${r.light > 0 ? "on" : ""}`} onClick={() => patch(r.id, { light: r.light > 0 ? 0 : 70 })} aria-label={r.light > 0 ? t("turnOff") : t("turnOn")}><i /></button>
          </div>
        ))}
      </div>
      <div className="vl-card vl-scenes">
        <span className="vl-label"><Icon name="Sparkles" size={14} /> {t("scenes")}</span>
        <div className="vl-seg">{[["dim", 25], ["reading", 70], ["dinner", 45], ["full", 100]].map(([id, v]) => <button key={id} onClick={() => setRooms((rs) => rs.map((r) => (r.floor === floor ? { ...r, light: v } : r)))}>{t(id)}</button>)}</div>
      </div>
    </div>
  );

  const renderClimate = () => (
    <div className="vl-page">
      <div className="vl-page-head"><h2>{t("climate")}</h2>
        <div className="vl-seg inline">{[["auto", t("auto")], ["heat", t("heating")], ["cool", t("cooling")], ["off", t("off")]].map(([id, l]) => <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>{l}</button>)}</div></div>
      <div className="vl-climate-grid">
        {rooms.filter((r) => r.set != null && r.floor !== "outside").map((r) => (
          <div key={r.id} className={`vl-card vl-card-dial ${selected === r.id ? "selected" : ""}`} onClick={() => setSelected(r.id)}>
            <span className="vl-label">{name(r)} <em>{t("humidity")} {40 + (r.id.length % 6)} %</em></span>
            <Dial value={r.temp} set={r.set} size={isPhone ? 140 : 124} onMinus={() => patch(r.id, { set: clamp(r.set - 0.5, 15, 30) })} onPlus={() => patch(r.id, { set: clamp(r.set + 0.5, 15, 30) })} />
          </div>
        ))}
      </div>
    </div>
  );

  const src = SOURCES.find((s) => s.id === source);
  const renderMedia = () => (
    <div className="vl-page">
      <div className="vl-page-head"><h2>{t("media")}</h2><span className="vl-eyebrow">{room ? name(room) : ""}</span></div>
      <div className="vl-media">
        <div className="vl-card vl-now" style={{ "--tint": room?.tint || "#23303A" }}>
          <span className="vl-label">{playing ? t("playing") : t("paused")} · {src.label}</span>
          <b className="vl-track">{src.track}</b>
          <em>{src.artist}</em>
          <div className="vl-transport">
            <button onClick={() => setSource(SOURCES[(SOURCES.findIndex((s) => s.id === source) + SOURCES.length - 1) % SOURCES.length].id)}><Icon name="SkipBack" size={20} /></button>
            <button className="vl-play" onClick={() => setPlaying((p) => !p)}><Icon name={playing ? "Pause" : "Play"} size={24} /></button>
            <button onClick={() => setSource(SOURCES[(SOURCES.findIndex((s) => s.id === source) + 1) % SOURCES.length].id)}><Icon name="SkipForward" size={20} /></button>
          </div>
          <div className="vl-volume">
            <button onClick={() => setVolume((v) => clamp(v - 5, 0, 100))}><Icon name="VolumeX" size={16} /></button>
            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ "--val": `${volume}%` }} />
            <button onClick={() => setVolume((v) => clamp(v + 5, 0, 100))}><Icon name="Volume2" size={16} /></button>
            <span className="vl-pct">{volume}</span>
          </div>
        </div>
        <div className="vl-media-side">
          <div className="vl-card"><span className="vl-label">{t("sources")}</span>
            <div className="vl-source-list">{SOURCES.map((s) => <button key={s.id} className={source === s.id ? "active" : ""} onClick={() => { setSource(s.id); setPlaying(true); }}><Icon name={s.icon} size={18} /><b>{s.label}</b><em>{s.track}</em></button>)}</div></div>
          <div className="vl-card"><span className="vl-label">{t("zones")}</span>
            <div className="vl-zone-list">{rooms.filter((r) => r.id !== "sdb").map((r) => <button key={r.id} className={r.source ? "on" : ""} onClick={() => patch(r.id, { source: r.source ? null : source })}>{name(r)}<i /></button>)}</div></div>
        </div>
      </div>
    </div>
  );

  const pressKey = (k) => {
    if (k === "del") return setCode((c) => c.slice(0, -1));
    if (k === "ok") { if (code.length >= 4) { setArmed((a) => !a); } setCode(""); return; }
    setCode((c) => (c + k).slice(0, 6));
  };
  const renderSecurity = () => (
    <div className="vl-page">
      <div className="vl-page-head"><h2>{t("security")}</h2><span className={`vl-state ${armed ? "armed" : "ok"}`}><Icon name={armed ? "ShieldCheck" : "Shield"} size={14} /> {armed ? `${t("armed")} · ${t("presence")}` : t("disarmed")}</span></div>
      <div className="vl-security">
        <div className="vl-card vl-keypad-card">
          <span className="vl-label">{t("enterCode")}</span>
          <div className="vl-code">{[0, 1, 2, 3].map((i) => <i key={i} className={code.length > i ? "on" : ""} />)}</div>
          <div className="vl-keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map((k) => (
              <button key={k} className={k === "ok" ? "ok" : k === "del" ? "del" : ""} onClick={() => pressKey(k)} data-demo-ignore={k === "ok" ? "" : undefined}>
                {k === "del" ? <Icon name="ArrowLeft" size={18} /> : k === "ok" ? <Icon name="Check" size={20} /> : k}
              </button>
            ))}
          </div>
        </div>
        <div className="vl-card">
          <span className="vl-label"><Icon name="Lock" size={14} /> {t("locks")}</span>
          <div className="vl-lock-list">
            {locks.map((l) => (
              <div key={l.id} className={`vl-lock ${l.locked ? "locked" : ""}`}>
                <b>{t(l.key)}</b><em>{l.locked ? t("locked") : t("unlocked")}</em>
                <button className={l.locked ? "" : "active"} onClick={() => setLocks((ls) => ls.map((x) => (x.id === l.id ? { ...x, locked: false } : x)))}><Icon name="Unlock" size={16} /></button>
                <button className={l.locked ? "active" : ""} onClick={() => setLocks((ls) => ls.map((x) => (x.id === l.id ? { ...x, locked: true } : x)))}><Icon name="Lock" size={16} /></button>
              </div>
            ))}
          </div>
          <span className="vl-label" style={{ marginTop: 8 }}><Icon name="Camera" size={14} /> {t("cameras")}</span>
          <div className="vl-cams">{[t("gate"), t("frontDoor"), t("terrace"), t("garage")].map((c) => <div key={c} className="vl-cam"><span>{c}</span><i /></div>)}</div>
        </div>
      </div>
    </div>
  );

  const PAGES = { home: renderHome, rooms: renderRooms, lights: renderLights, climate: renderClimate, media: renderMedia, security: renderSecurity };

  return (
    <div className={`gemini-ui-root villa-leman-ui ${deviceType}`}>
      <div className="vl-backdrop" style={{ "--tint": room?.tint || "#1C2630" }} />
      {!isPhone && (
        <nav className="vl-rail">
          <div className="vl-rail-mark"><i /></div>
          <div className="vl-rail-items">
            {NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={22} /><span>{n.label}</span></button>)}
          </div>
          <div className="vl-rail-clock"><span>{dateShort}</span><b>{clock}</b></div>
        </nav>
      )}
      <main className="vl-main">{PAGES[tab]()}</main>
      {isPhone && (
        <nav className="vl-tabbar">
          {NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>)}
        </nav>
      )}
    </div>
  );
};
