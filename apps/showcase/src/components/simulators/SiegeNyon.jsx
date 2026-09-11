import React, { useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./siegeNyon.css";

// Siège Lakeside (Nyon) — thème « Atelier clair » : cartes blanches sur gris
// chaud, accent dégradé, tout le bâtiment lisible sur un seul écran.
// Salles de réunion : réservation, présentation, visioconférence, confort.
// Tout le feedback est local (état React).

const T = {
  fr: { home: "Accueil", rooms: "Salles", present: "Présentation", visio: "Visio", agenda: "Agenda",
    building: "Siège Lakeside", city: "Nyon", freeRooms: "salles libres", inMeeting: "en réunion", nextMeeting: "Prochaine réunion", now: "En cours", free: "Libre", busy: "Occupée", until: "jusqu'à", at: "à", people: "pers.",
    climate: "Climat", lights: "Éclairage", shades: "Stores", screen: "Écran", audio: "Audio", camera: "Caméra", sources: "Sources", volume: "Volume", mute: "Muet",
    laptop: "PC portable", wireless: "Sans fil", teams: "Teams", appletv: "Apple TV", none: "Aucune source", start: "Démarrer", stop: "Arrêter", off: "Éteint", on: "Allumé",
    heat: "Chaud", cool: "Froid", auto: "Auto", setpoint: "Consigne", occupied: "Occupation", scene: "Scène", meeting: "Réunion", presentation: "Présentation", videoconf: "Visioconférence", cleaning: "Nettoyage", allOff: "Tout éteindre",
    open: "Ouvrir", close: "Fermer", stopShort: "Stop", sunset: "Coucher du soleil à", clear: "Ciel dégagé", weather: "Nyon, ciel dégagé",
    book: "Réserver", bookNow: "Réserver maintenant", release: "Libérer", extend: "Prolonger 30 min", endMeeting: "Terminer", joinCall: "Rejoindre l'appel", endCall: "Raccrocher", inCall: "Appel en cours", noCall: "Aucun appel", participants: "participants", micOff: "Micro coupé", micOn: "Micro actif", camOff: "Caméra coupée", camOn: "Caméra active", presets: "Positions caméra", wide: "Large", speaker: "Orateur", table: "Table", board: "Tableau",
    today: "Aujourd'hui", roomSelect: "Salle", capacity: "Places", equipment: "Équipement", quickBook: "Réservation rapide", min30: "30 min", min60: "1 h", min90: "1 h 30",
    m1: "Comité de direction", m2: "Point projet Lausanne", m3: "Entretien candidat", m4: "Revue trimestrielle", m5: "Formation sécurité", m6: "Client Genève — visio", organizer: "Organisateur" },
  en: { home: "Home", rooms: "Rooms", present: "Present", visio: "Video call", agenda: "Agenda",
    building: "Lakeside HQ", city: "Nyon", freeRooms: "rooms free", inMeeting: "in meeting", nextMeeting: "Next meeting", now: "Now", free: "Free", busy: "Busy", until: "until", at: "at", people: "people",
    climate: "Climate", lights: "Lighting", shades: "Shades", screen: "Display", audio: "Audio", camera: "Camera", sources: "Sources", volume: "Volume", mute: "Mute",
    laptop: "Laptop", wireless: "Wireless", teams: "Teams", appletv: "Apple TV", none: "No source", start: "Start", stop: "Stop", off: "Off", on: "On",
    heat: "Heat", cool: "Cool", auto: "Auto", setpoint: "Setpoint", occupied: "Occupancy", scene: "Scene", meeting: "Meeting", presentation: "Presentation", videoconf: "Video call", cleaning: "Cleaning", allOff: "All off",
    open: "Open", close: "Close", stopShort: "Stop", sunset: "Sunset at", clear: "Clear sky", weather: "Nyon, clear sky",
    book: "Book", bookNow: "Book now", release: "Release", extend: "Extend 30 min", endMeeting: "End", joinCall: "Join call", endCall: "Hang up", inCall: "Call in progress", noCall: "No call", participants: "participants", micOff: "Mic muted", micOn: "Mic on", camOff: "Camera off", camOn: "Camera on", presets: "Camera presets", wide: "Wide", speaker: "Speaker", table: "Table", board: "Whiteboard",
    today: "Today", roomSelect: "Room", capacity: "Seats", equipment: "Equipment", quickBook: "Quick booking", min30: "30 min", min60: "1 h", min90: "1 h 30",
    m1: "Executive committee", m2: "Lausanne project sync", m3: "Candidate interview", m4: "Quarterly review", m5: "Safety training", m6: "Geneva client — call", organizer: "Organiser" },
  de: { home: "Start", rooms: "Räume", present: "Präsentation", visio: "Videocall", agenda: "Agenda",
    building: "Hauptsitz Lakeside", city: "Nyon", freeRooms: "Räume frei", inMeeting: "in Besprechung", nextMeeting: "Nächste Besprechung", now: "Jetzt", free: "Frei", busy: "Belegt", until: "bis", at: "um", people: "Pers.",
    climate: "Klima", lights: "Licht", shades: "Storen", screen: "Display", audio: "Audio", camera: "Kamera", sources: "Quellen", volume: "Lautstärke", mute: "Stumm",
    laptop: "Laptop", wireless: "Kabellos", teams: "Teams", appletv: "Apple TV", none: "Keine Quelle", start: "Starten", stop: "Stoppen", off: "Aus", on: "An",
    heat: "Warm", cool: "Kalt", auto: "Auto", setpoint: "Sollwert", occupied: "Belegung", scene: "Szene", meeting: "Besprechung", presentation: "Präsentation", videoconf: "Videocall", cleaning: "Reinigung", allOff: "Alles aus",
    open: "Öffnen", close: "Schliessen", stopShort: "Stopp", sunset: "Sonnenuntergang um", clear: "Klarer Himmel", weather: "Nyon, klarer Himmel",
    book: "Buchen", bookNow: "Jetzt buchen", release: "Freigeben", extend: "30 Min. verlängern", endMeeting: "Beenden", joinCall: "Anruf beitreten", endCall: "Auflegen", inCall: "Anruf läuft", noCall: "Kein Anruf", participants: "Teilnehmer", micOff: "Mikrofon aus", micOn: "Mikrofon an", camOff: "Kamera aus", camOn: "Kamera an", presets: "Kamerapositionen", wide: "Weit", speaker: "Sprecher", table: "Tisch", board: "Whiteboard",
    today: "Heute", roomSelect: "Raum", capacity: "Plätze", equipment: "Ausstattung", quickBook: "Schnellbuchung", min30: "30 Min.", min60: "1 Std.", min90: "1,5 Std.",
    m1: "Geschäftsleitung", m2: "Projekt Lausanne", m3: "Bewerbungsgespräch", m4: "Quartalsreview", m5: "Sicherheitsschulung", m6: "Kunde Genf — Videocall", organizer: "Organisator" },
};

const ROOMS = [
  { id: "leman", name: "Léman", seats: 14, busy: true, meeting: "m1", until: "11:30", temp: 21.2, set: 21.5, light: 70, shade: 30, eq: ["Tv", "Video", "Mic"] },
  { id: "jura", name: "Jura", seats: 8, busy: false, meeting: "m2", at: "13:00", temp: 20.8, set: 21, light: 0, shade: 0, eq: ["Tv", "Video"] },
  { id: "saleve", name: "Salève", seats: 6, busy: true, meeting: "m3", until: "10:45", temp: 22.1, set: 21.5, light: 55, shade: 60, eq: ["Tv"] },
  { id: "dole", name: "Dôle", seats: 20, busy: false, meeting: "m4", at: "14:30", temp: 20.5, set: 21, light: 0, shade: 0, eq: ["Projector", "Video", "Mic"] },
  { id: "mont-blanc", name: "Mont-Blanc", seats: 4, busy: false, meeting: null, temp: 21.6, set: 21, light: 0, shade: 100, eq: ["Tv"] },
  { id: "rhone", name: "Rhône", seats: 10, busy: true, meeting: "m6", until: "12:00", temp: 21.9, set: 21.5, light: 60, shade: 40, eq: ["Tv", "Video", "Mic"] },
];

const SOURCES = [
  { id: "laptop", key: "laptop", icon: "Monitor" },
  { id: "wireless", key: "wireless", icon: "Cast" },
  { id: "teams", key: "teams", icon: "Video" },
  { id: "appletv", key: "appletv", icon: "Tv" },
];

const AGENDA = [
  { room: "leman", key: "m1", from: "09:00", to: "11:30", who: "C. Ferrand", n: 9 },
  { room: "saleve", key: "m3", from: "10:00", to: "10:45", who: "RH", n: 3 },
  { room: "rhone", key: "m6", from: "10:30", to: "12:00", who: "M. Aubert", n: 6 },
  { room: "jura", key: "m2", from: "13:00", to: "14:00", who: "Équipe projet", n: 5 },
  { room: "dole", key: "m4", from: "14:30", to: "16:30", who: "Direction", n: 18 },
  { room: "leman", key: "m5", from: "16:00", to: "17:30", who: "Sécurité", n: 12 },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const SiegeNyon = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  const t = (k) => (T[lang] || T.fr)[k] ?? T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("home");
  const [rooms, setRooms] = useState(ROOMS);
  const [selected, setSelected] = useState("leman");
  const [source, setSource] = useState("laptop");
  const [screenOn, setScreenOn] = useState(true);
  const [volume, setVolume] = useState(45);
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState("meeting");
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [preset, setPreset] = useState("wide");
  const [agenda, setAgenda] = useState(AGENDA);

  const room = rooms.find((r) => r.id === selected);
  const patch = (id, p) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const freeCount = rooms.filter((r) => !r.busy).length;
  const clock = new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-CH", { hour: "2-digit", minute: "2-digit" });
  const dateLong = new Date().toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-GB" : "fr-CH", { weekday: "long", day: "numeric", month: "long" });

  const Icon = ({ name: n, size = 18 }) => { const C = Icons[n] || Icons.Circle; return <C size={size} />; };
  const NAV = [
    { id: "home", icon: "LayoutDashboard", label: t("home") },
    { id: "rooms", icon: "Building", label: t("rooms") },
    { id: "present", icon: "Presentation", label: t("present") },
    { id: "visio", icon: "Video", label: t("visio") },
    { id: "agenda", icon: "Calendar", label: t("agenda") },
  ];

  const applyScene = (id) => {
    setScene(id);
    if (!room) return;
    if (id === "meeting") patch(room.id, { light: 70, shade: 30 });
    if (id === "presentation") { patch(room.id, { light: 30, shade: 100 }); setScreenOn(true); }
    if (id === "videoconf") { patch(room.id, { light: 80, shade: 70 }); setScreenOn(true); setSource("teams"); }
    if (id === "cleaning") patch(room.id, { light: 100, shade: 0 });
  };
  const allOff = () => { if (room) patch(room.id, { light: 0, shade: 0, busy: false }); setScreenOn(false); setInCall(false); setSource(null); };

  const Dial = ({ value, set, size = 150 }) => {
    const r = size * 0.41, c = size / 2, start = 135, span = 270;
    const pol = (deg) => { const a = ((deg - 90) * Math.PI) / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
    const arc = (from, to) => { const [x1, y1] = pol(from), [x2, y2] = pol(to); return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
    const pct = clamp((set - 16) / 10, 0, 1);
    const [kx, ky] = pol(start + span * pct);
    const gid = `sn-grad-${size}`;
    return (
      <div className="sn-dial" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs><linearGradient id={gid} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#3B7DF0" /><stop offset="1" stopColor="#E8567C" /></linearGradient></defs>
          <path d={arc(start, start + span)} fill="none" stroke="#EEF0F3" strokeWidth={size * 0.055} strokeLinecap="round" />
          <path d={arc(start, start + span * pct)} fill="none" stroke={`url(#${gid})`} strokeWidth={size * 0.055} strokeLinecap="round" />
          <circle cx={kx} cy={ky} r={size * 0.035} fill="#fff" stroke="#3B7DF0" strokeWidth="2" />
        </svg>
        <div className="sn-dial-center"><b>{value.toFixed(1).replace(".", ",")}°</b><span>{set > value ? t("heat") : t("cool")} → {set.toFixed(1).replace(".", ",")}°</span></div>
      </div>
    );
  };

  const RoomStatus = ({ r }) => (
    <button className={`sn-room ${r.busy ? "busy" : "free"} ${selected === r.id ? "selected" : ""}`} onClick={() => setSelected(r.id)}>
      <div className="sn-room-top"><b>{r.name}</b><span className="sn-pill">{r.busy ? t("busy") : t("free")}</span></div>
      <em>{r.seats} {t("people")} · {r.eq.map((e) => <Icon key={e} name={e} size={13} />)}</em>
      <span className="sn-room-next">{r.busy ? `${t(r.meeting)} · ${t("until")} ${r.until}` : r.meeting ? `${t("nextMeeting")} ${t("at")} ${r.at}` : t("free")}</span>
    </button>
  );

  const renderHome = () => (
    <div className="sn-page">
      <div className="sn-grid sn-grid-home">
        <div className="sn-card sn-hero">
          <div className="sn-hero-top"><span>12° · {t("weather")}</span><span className="sn-photo">Photo · {clientName || t("building")}</span></div>
          <div className="sn-hero-clock"><b>{clock}</b><span>{dateLong}</span></div>
          <span>{freeCount} {t("freeRooms")} · {rooms.length - freeCount} {t("inMeeting")}</span>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("climate")}</b><span>{room?.name}</span></div>
          <div className="sn-center"><Dial value={room?.temp ?? 21} set={room?.set ?? 21} size={isPhone ? 160 : 148} /></div>
          <div className="sn-stepper">
            <button onClick={() => patch(room.id, { set: clamp(room.set - 0.5, 16, 26) })}><Icon name="Minus" size={16} /></button>
            <span>{t("setpoint")} <b>{room?.set.toFixed(1).replace(".", ",")}°</b></span>
            <button onClick={() => patch(room.id, { set: clamp(room.set + 0.5, 16, 26) })}><Icon name="Plus" size={16} /></button>
          </div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{room?.name}</b><span className={`sn-pill ${room?.busy ? "busy" : "free"}`}>{room?.busy ? t("busy") : t("free")}</span></div>
          <div className="sn-meeting">
            <em>{room?.busy ? t("now") : t("nextMeeting")}</em>
            <b>{room?.meeting ? t(room.meeting) : t("free")}</b>
            <span>{room?.busy ? `${t("until")} ${room.until}` : room?.meeting ? `${t("at")} ${room.at}` : ""}</span>
          </div>
          <div className="sn-btn-row">
            {room?.busy ? <><button className="sn-btn" onClick={() => patch(room.id, { until: "12:00" })}>{t("extend")}</button><button className="sn-btn ghost" onClick={() => patch(room.id, { busy: false, meeting: null })}>{t("endMeeting")}</button></>
              : <button className="sn-btn primary" onClick={() => { patch(room.id, { busy: true, meeting: room.meeting || "m2", until: "+ 30 min" }); }}>{t("bookNow")}</button>}
          </div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("lights")}</b><span className="sn-accent">{t("scene")} · {t(scene)}</span></div>
          <div className="sn-slider-row">
            <Icon name="Sun" size={16} />
            <input type="range" min="0" max="100" value={room?.light ?? 0} onChange={(e) => patch(room.id, { light: Number(e.target.value) })} style={{ "--val": `${room?.light ?? 0}%` }} className="warm" />
            <span className="sn-num">{room?.light} %</span>
          </div>
          <div className="sn-chips">{["meeting", "presentation", "videoconf", "cleaning"].map((s) => <button key={s} className={scene === s ? "active" : ""} onClick={() => applyScene(s)}>{t(s)}</button>)}</div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("shades")}</b><span>{room?.shade === 0 ? t("open") : room?.shade === 100 ? t("close") : `${room?.shade} %`}</span></div>
          <div className="sn-shade-btns">
            <button onClick={() => patch(room.id, { shade: 0 })}><Icon name="ChevronUp" size={26} /></button>
            <button onClick={() => patch(room.id, { shade: 50 })}><Icon name="Square" size={16} /></button>
            <button onClick={() => patch(room.id, { shade: 100 })}><Icon name="ChevronDown" size={26} /></button>
          </div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("screen")}</b><span>{screenOn ? (source ? t(source) : t("none")) : t("off")}</span></div>
          <div className="sn-source-mini">{SOURCES.map((s) => <button key={s.id} className={source === s.id && screenOn ? "active" : ""} onClick={() => { setSource(s.id); setScreenOn(true); }}><Icon name={s.icon} size={18} /><span>{t(s.key)}</span></button>)}</div>
          <div className="sn-slider-row"><button className="sn-icon-btn" onClick={() => setMuted((m) => !m)}><Icon name={muted ? "VolumeX" : "Volume2"} size={16} /></button><input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }} style={{ "--val": `${muted ? 0 : volume}%` }} /><span className="sn-num">{muted ? 0 : volume}</span></div>
        </div>
      </div>
      <div className="sn-rooms-strip" data-demo-nav>
        <span className="sn-strip-label">{t("rooms")}</span>
        <div className="sn-strip">{rooms.map((r) => <button key={r.id} className={`${selected === r.id ? "active" : ""} ${r.busy ? "busy" : ""}`} onClick={() => setSelected(r.id)}>{r.name}<i /></button>)}</div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="sn-page">
      <div className="sn-head"><h2>{t("rooms")}</h2><span>{freeCount} {t("freeRooms")}</span></div>
      <div className="sn-room-grid">{rooms.map((r) => <RoomStatus key={r.id} r={r} />)}</div>
      {room && (
        <div className="sn-card sn-room-detail">
          <div className="sn-card-head"><b>{room.name} · {room.seats} {t("capacity").toLowerCase()}</b><span className={`sn-pill ${room.busy ? "busy" : "free"}`}>{room.busy ? t("busy") : t("free")}</span></div>
          <div className="sn-detail-cols">
            <div><em>{t("equipment")}</em><div className="sn-eq">{room.eq.map((e) => <span key={e}><Icon name={e} size={16} /> {e === "Tv" ? t("screen") : e === "Video" ? t("camera") : e === "Mic" ? t("audio") : "Projecteur"}</span>)}</div></div>
            <div><em>{t("quickBook")}</em><div className="sn-btn-row">{[["min30", "+ 30 min"], ["min60", "+ 1 h"], ["min90", "+ 1 h 30"]].map(([k, u]) => <button key={k} className={`sn-btn ${room.busy ? "ghost" : "primary"}`} onClick={() => patch(room.id, { busy: true, meeting: room.meeting || "m2", until: u })}>{t(k)}</button>)}</div></div>
            <div><em>{t("climate")} · {t("lights")}</em><div className="sn-kv"><span>{room.temp.toFixed(1).replace(".", ",")}° → {room.set.toFixed(1).replace(".", ",")}°</span><span>{room.light} %</span><span>{t("shades")} {room.shade} %</span></div></div>
          </div>
          {room.busy && <button className="sn-btn ghost self-end" onClick={() => patch(room.id, { busy: false, meeting: null })}>{t("release")}</button>}
        </div>
      )}
    </div>
  );

  const renderPresent = () => (
    <div className="sn-page">
      <div className="sn-head"><h2>{t("present")}</h2><span>{room?.name}</span></div>
      <div className="sn-grid sn-grid-present">
        <div className="sn-card sn-span2">
          <div className="sn-card-head"><b>{t("sources")}</b><span>{screenOn ? t("on") : t("off")}</span></div>
          <div className="sn-sources">{SOURCES.map((s) => <button key={s.id} className={source === s.id && screenOn ? "active" : ""} onClick={() => { setSource(s.id); setScreenOn(true); }}><Icon name={s.icon} size={28} /><b>{t(s.key)}</b><em>{s.id === "wireless" ? "AirMedia · code 4821" : s.id === "laptop" ? "HDMI · USB-C" : s.id === "teams" ? "Teams Rooms" : "AirPlay"}</em></button>)}</div>
          <div className="sn-btn-row"><button className={`sn-btn ${screenOn ? "ghost" : "primary"}`} onClick={() => setScreenOn((s) => !s)}><Icon name="Power" size={14} /> {screenOn ? t("stop") : t("start")}</button><button className="sn-btn ghost" onClick={allOff}>{t("allOff")}</button></div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("volume")}</b><span className="sn-num">{muted ? 0 : volume}</span></div>
          <div className="sn-vol-big">
            <button onClick={() => setVolume((v) => clamp(v - 5, 0, 100))}><Icon name="Minus" size={20} /></button>
            <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }} style={{ "--val": `${muted ? 0 : volume}%` }} />
            <button onClick={() => setVolume((v) => clamp(v + 5, 0, 100))}><Icon name="Plus" size={20} /></button>
          </div>
          <button className={`sn-btn ${muted ? "primary" : "ghost"}`} onClick={() => setMuted((m) => !m)}><Icon name={muted ? "VolumeX" : "Volume2"} size={14} /> {t("mute")}</button>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("lights")}</b><span className="sn-accent">{t(scene)}</span></div>
          <div className="sn-chips col">{["meeting", "presentation", "videoconf", "cleaning"].map((s) => <button key={s} className={scene === s ? "active" : ""} onClick={() => applyScene(s)}>{t(s)}</button>)}</div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("shades")}</b><span>{room?.shade} %</span></div>
          <div className="sn-shade-btns tall"><button onClick={() => patch(room.id, { shade: 0 })}><Icon name="ChevronUp" size={26} /><span>{t("open")}</span></button><button onClick={() => patch(room.id, { shade: 100 })}><Icon name="ChevronDown" size={26} /><span>{t("close")}</span></button></div>
        </div>
      </div>
    </div>
  );

  const renderVisio = () => (
    <div className="sn-page">
      <div className="sn-head"><h2>{t("visio")}</h2><span className={inCall ? "sn-live" : ""}>{inCall ? `${t("inCall")} · 6 ${t("participants")}` : t("noCall")}</span></div>
      <div className="sn-grid sn-grid-visio">
        <div className="sn-card sn-call">
          <div className={`sn-call-view ${inCall ? "live" : ""}`}>
            {inCall ? <div className="sn-call-grid">{["C. Ferrand", "M. Aubert", "Genève", "Lausanne", "A. Roux", "Zurich"].map((n) => <div key={n}><span>{n}</span></div>)}</div> : <div className="sn-call-idle"><Icon name="Video" size={36} /><span>{t("m6")}</span><em>10:30 – 12:00 · Teams</em></div>}
            <div className="sn-self"><span>{room?.name}</span></div>
          </div>
          <div className="sn-call-bar">
            <button className={micOn ? "" : "off"} onClick={() => setMicOn((m) => !m)}><Icon name={micOn ? "Mic" : "MicOff"} size={20} /><span>{micOn ? t("micOn") : t("micOff")}</span></button>
            <button className={camOn ? "" : "off"} onClick={() => setCamOn((c) => !c)}><Icon name={camOn ? "Video" : "Camera"} size={20} /><span>{camOn ? t("camOn") : t("camOff")}</span></button>
            <button className="share" onClick={() => { setSource("laptop"); setScreenOn(true); }}><Icon name="ScreenShare" size={20} /><span>{t("laptop")}</span></button>
            <button className={inCall ? "end" : "join"} onClick={() => { setInCall((c) => !c); if (!inCall) applyScene("videoconf"); }}><Icon name={inCall ? "PhoneOff" : "PhoneCall"} size={20} /><span>{inCall ? t("endCall") : t("joinCall")}</span></button>
          </div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("camera")}</b><span>PTZ</span></div>
          <div className="sn-ptz">
            <button onClick={() => setPreset("manual")} className="up"><Icon name="ChevronUp" size={20} /></button>
            <button onClick={() => setPreset("manual")} className="left"><Icon name="ChevronLeft" size={20} /></button>
            <button onClick={() => setPreset("wide")} className="mid"><Icon name="Home" size={16} /></button>
            <button onClick={() => setPreset("manual")} className="right"><Icon name="ChevronRight" size={20} /></button>
            <button onClick={() => setPreset("manual")} className="down"><Icon name="ChevronDown" size={20} /></button>
          </div>
          <em className="sn-sub">{t("presets")}</em>
          <div className="sn-chips">{["wide", "speaker", "table", "board"].map((p) => <button key={p} className={preset === p ? "active" : ""} onClick={() => setPreset(p)}>{t(p)}</button>)}</div>
        </div>
        <div className="sn-card">
          <div className="sn-card-head"><b>{t("audio")}</b><span className="sn-num">{muted ? 0 : volume}</span></div>
          <div className="sn-slider-row"><button className="sn-icon-btn" onClick={() => setMuted((m) => !m)}><Icon name={muted ? "VolumeX" : "Volume2"} size={16} /></button><input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }} style={{ "--val": `${muted ? 0 : volume}%` }} /></div>
          <em className="sn-sub">{t("lights")}</em>
          <div className="sn-chips">{["meeting", "videoconf"].map((s) => <button key={s} className={scene === s ? "active" : ""} onClick={() => applyScene(s)}>{t(s)}</button>)}</div>
        </div>
      </div>
    </div>
  );

  const renderAgenda = () => (
    <div className="sn-page">
      <div className="sn-head"><h2>{t("agenda")}</h2><span>{t("today")} · {dateLong}</span></div>
      <div className="sn-agenda">
        {agenda.map((a, i) => {
          const r = rooms.find((x) => x.id === a.room);
          const live = r?.busy && r.meeting === a.key;
          return (
            <div key={i} className={`sn-slot ${live ? "live" : ""}`}>
              <div className="sn-slot-time"><b>{a.from}</b><span>{a.to}</span></div>
              <div className="sn-slot-body"><b>{t(a.key)}</b><span>{r?.name} · {a.n} {t("people")} · {t("organizer")} {a.who}</span></div>
              {live ? <span className="sn-pill busy">{t("now")}</span> : <button className="sn-btn ghost small" onClick={() => setAgenda((ag) => ag.filter((_, j) => j !== i))}>{t("release")}</button>}
            </div>
          );
        })}
        <button className="sn-slot add" onClick={() => setAgenda((ag) => [...ag, { room: selected, key: "m2", from: "17:30", to: "18:00", who: clientName || "—", n: 4 }])}><Icon name="CalendarPlus" size={18} /> {t("book")} · {room?.name} · 17:30</button>
      </div>
    </div>
  );

  const PAGES = { home: renderHome, rooms: renderRooms, present: renderPresent, visio: renderVisio, agenda: renderAgenda };

  return (
    <div className={`gemini-ui-root siege-nyon-ui ${deviceType}`}>
      <header className="sn-topbar">
        {!isPhone && <nav className="sn-nav">{NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={16} /><span>{n.label}</span></button>)}</nav>}
        <div className="sn-title"><b>{clientName || t("building")}</b><span>{t("city")}</span></div>
        <div className="sn-clock">{clock}</div>
      </header>
      <main className="sn-main">{PAGES[tab]()}</main>
      {isPhone && <nav className="sn-tabbar">{NAV.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>)}</nav>}
    </div>
  );
};
