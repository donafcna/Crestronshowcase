import React, { useEffect, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./appartementCarouge.css";

// Appartement Carouge — thème « Spectre » : fond anthracite, une couleur par
// système (médias cyan, éclairage ambre, climat ardoise, stores rose, accès
// violet, sécurité vert, routines indigo). Tuiles larges, pilules d'actions.
// Tout le feedback est local (état React).

const T = {
  fr: { home: "Accueil", media: "Médias", lights: "Éclairage", climate: "Climat", shades: "Stores", access: "Accès", routines: "Routines",
    subtitle: "Appartement familial · 4 pièces", outside: "dehors", morning: "Bonjour", evening: "Soirée", away: "Absent", night: "Nuit", kids: "Enfants",
    playing: "En lecture", paused: "En pause", track: "Piste", of: "sur", rooms: "Pièces", allRooms: "Toutes les pièces", scene: "Scène", scenes: "Scènes", all: "Tout", off: "Éteint", on: "Allumé",
    setpoint: "Consigne", heating: "Chauffage", cooling: "Froid", auto: "Auto", ecoMode: "Éco", comfort: "Confort", humidity: "Humidité", open: "Ouverts", closed: "Fermés", partial: "Mi-ouverts", opening: "Ouvrir", stop: "Stop", close: "Fermer",
    locked: "Verrouillé", unlocked: "Déverrouillé", gate: "Portail", door: "Porte d'entrée", garage: "Garage", cellar: "Cave", intercom: "Interphone", ring: "Sonnerie", answer: "Répondre", openDoor: "Ouvrir la porte", armed: "Alarme armée", disarmed: "Alarme désarmée", presence: "Présence", arm: "Armer", disarm: "Désarmer",
    routine: "Routine", run: "Lancer", running: "Active", schedule: "Planifiée", sources: "Sources", volume: "Volume", zones: "Zones", homework: "Devoirs", bedtime: "Coucher", weekend: "Week-end", dinner: "Dîner", movie: "Film", wake: "Réveil",
    energy: "Énergie", today: "Aujourd'hui", allOff: "Tout éteindre", filtering: "Filtration", bath: "Bain" },
  en: { home: "Home", media: "Media", lights: "Lighting", climate: "Climate", shades: "Shades", access: "Access", routines: "Routines",
    subtitle: "Family apartment · 4 rooms", outside: "outside", morning: "Morning", evening: "Evening", away: "Away", night: "Night", kids: "Kids",
    playing: "Playing", paused: "Paused", track: "Track", of: "of", rooms: "Rooms", allRooms: "All rooms", scene: "Scene", scenes: "Scenes", all: "All", off: "Off", on: "On",
    setpoint: "Setpoint", heating: "Heating", cooling: "Cooling", auto: "Auto", ecoMode: "Eco", comfort: "Comfort", humidity: "Humidity", open: "Open", closed: "Closed", partial: "Half open", opening: "Open", stop: "Stop", close: "Close",
    locked: "Locked", unlocked: "Unlocked", gate: "Gate", door: "Front door", garage: "Garage", cellar: "Cellar", intercom: "Intercom", ring: "Ringing", answer: "Answer", openDoor: "Open door", armed: "Alarm armed", disarmed: "Alarm off", presence: "Stay", arm: "Arm", disarm: "Disarm",
    routine: "Routine", run: "Run", running: "Active", schedule: "Scheduled", sources: "Sources", volume: "Volume", zones: "Zones", homework: "Homework", bedtime: "Bedtime", weekend: "Weekend", dinner: "Dinner", movie: "Movie", wake: "Wake up",
    energy: "Energy", today: "Today", allOff: "All off", filtering: "Filtering", bath: "Bath" },
  de: { home: "Start", media: "Medien", lights: "Licht", climate: "Klima", shades: "Storen", access: "Zugang", routines: "Routinen",
    subtitle: "Familienwohnung · 4 Zimmer", outside: "draussen", morning: "Morgen", evening: "Abend", away: "Abwesend", night: "Nacht", kids: "Kinder",
    playing: "Wiedergabe", paused: "Pause", track: "Titel", of: "von", rooms: "Räume", allRooms: "Alle Räume", scene: "Szene", scenes: "Szenen", all: "Alle", off: "Aus", on: "An",
    setpoint: "Sollwert", heating: "Heizen", cooling: "Kühlen", auto: "Auto", ecoMode: "Eco", comfort: "Komfort", humidity: "Feuchte", open: "Offen", closed: "Geschlossen", partial: "Halb offen", opening: "Öffnen", stop: "Stopp", close: "Schliessen",
    locked: "Verriegelt", unlocked: "Entriegelt", gate: "Tor", door: "Haustür", garage: "Garage", cellar: "Keller", intercom: "Gegensprechanlage", ring: "Klingelt", answer: "Antworten", openDoor: "Tür öffnen", armed: "Alarm scharf", disarmed: "Alarm aus", presence: "Anwesend", arm: "Scharf", disarm: "Unscharf",
    routine: "Routine", run: "Starten", running: "Aktiv", schedule: "Geplant", sources: "Quellen", volume: "Lautstärke", zones: "Zonen", homework: "Hausaufgaben", bedtime: "Schlafenszeit", weekend: "Wochenende", dinner: "Abendessen", movie: "Film", wake: "Aufstehen",
    energy: "Energie", today: "Heute", allOff: "Alles aus", filtering: "Filterung", bath: "Bad" },
};

const ROOMS = [
  { id: "salon", name: { fr: "Salon", en: "Living room", de: "Wohnzimmer" }, light: 60, temp: 21.5, set: 22, shade: 0, audio: true },
  { id: "cuisine", name: { fr: "Cuisine", en: "Kitchen", de: "Küche" }, light: 90, temp: 22.4, set: 21, shade: 0, audio: false },
  { id: "parents", name: { fr: "Chambre parents", en: "Parents' room", de: "Elternzimmer" }, light: 0, temp: 19.8, set: 19.5, shade: 100, audio: false },
  { id: "enfants", name: { fr: "Chambre enfants", en: "Kids' room", de: "Kinderzimmer" }, light: 20, temp: 20.4, set: 20, shade: 70, audio: true },
  { id: "sdb", name: { fr: "Salle de bain", en: "Bathroom", de: "Bad" }, light: 0, temp: 23, set: 23, shade: 100, audio: false },
  { id: "bureau", name: { fr: "Bureau", en: "Office", de: "Büro" }, light: 40, temp: 21, set: 21, shade: 30, audio: false },
];

const SOURCES = [
  { id: "spotify", label: "Spotify", icon: "Music", track: "Playlist du soir", sub: "Piste 4 / 18 · 2:41" },
  { id: "radio", label: "Radio", icon: "Radio", track: "Couleur 3", sub: "FM 98.4" },
  { id: "tv", label: "TV", icon: "Tv", track: "RTS 1", sub: "Le 19h30" },
  { id: "kids", label: "Enfants", icon: "Smile", track: "Histoires du soir", sub: "Épisode 12" },
];

const ROUTINES = [
  { id: "wake", icon: "Sunrise", time: "06:45", on: true },
  { id: "homework", icon: "FileText", time: "16:30", on: true },
  { id: "dinner", icon: "Utensils", time: "19:00", on: true },
  { id: "bedtime", icon: "MoonStar", time: "20:30", on: true },
  { id: "movie", icon: "Film", time: null, on: false },
  { id: "weekend", icon: "Smile", time: "08:30", on: false },
];

const ACCESS = [
  { id: "door", key: "door", locked: true },
  { id: "gate", key: "gate", locked: true },
  { id: "garage", key: "garage", locked: false },
  { id: "cellar", key: "cellar", locked: true },
];

// Polices Google chargées à la volée (un échec réseau n'empêche pas l'interface
// de s'afficher : les polices de secours prennent le relais).
const FONT_URL = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=Rubik:wght@300;400;500&display=swap";
const useFonts = () => {
  useEffect(() => {
    if (document.getElementById("ac-fonts")) return;
    const link = document.createElement("link");
    link.id = "ac-fonts";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const AppartementCarouge = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  useFonts();
  const t = (k) => (T[lang] || T.fr)[k] ?? T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("home");
  const [rooms, setRooms] = useState(ROOMS);
  const [selected, setSelected] = useState("salon");
  const [action, setAction] = useState("evening");
  const [source, setSource] = useState("spotify");
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(40);
  const [mode, setMode] = useState("auto");
  const [access, setAccess] = useState(ACCESS);
  const [armed, setArmed] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [routines, setRoutines] = useState(ROUTINES);
  const [activeRoutine, setActiveRoutine] = useState("dinner");

  const room = rooms.find((r) => r.id === selected);
  const name = (r) => r.name[lang] || r.name.fr;
  const patch = (id, p) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const patchAll = (fn) => setRooms((rs) => rs.map((r) => ({ ...r, ...fn(r) })));
  const litCount = rooms.filter((r) => r.light > 0).length;
  const avgLight = Math.round(rooms.reduce((a, r) => a + r.light, 0) / rooms.length);
  const shadeState = rooms.every((r) => r.shade === 0) ? t("open") : rooms.every((r) => r.shade === 100) ? t("closed") : t("partial");
  const src = SOURCES.find((s) => s.id === source);
  const clock = new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-CH", { hour: "2-digit", minute: "2-digit" });
  const dateLong = new Date().toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-GB" : "fr-CH", { weekday: "long", day: "numeric", month: "long" });

  const runAction = (id) => {
    setAction(id);
    if (id === "morning") { patchAll(() => ({ light: 70, shade: 0 })); setSource("radio"); setPlaying(true); }
    if (id === "evening") { patchAll((r) => ({ light: r.id.includes("parents") ? 0 : 55, shade: 100 })); setSource("spotify"); setPlaying(true); }
    if (id === "away") { patchAll(() => ({ light: 0, shade: 100 })); setPlaying(false); setArmed(true); setAccess((a) => a.map((x) => ({ ...x, locked: true }))); }
    if (id === "night") { patchAll((r) => ({ light: r.id === "enfants" ? 5 : 0, shade: 100 })); setPlaying(false); setAccess((a) => a.map((x) => ({ ...x, locked: true }))); }
  };
  const runRoutine = (r) => {
    setActiveRoutine(r.id);
    if (r.id === "wake") runAction("morning");
    if (r.id === "homework") { patch("enfants", { light: 90, shade: 0 }); patch("bureau", { light: 80 }); setPlaying(false); }
    if (r.id === "dinner") { patch("cuisine", { light: 100 }); patch("salon", { light: 45 }); setSource("spotify"); setPlaying(true); }
    if (r.id === "bedtime") { patch("enfants", { light: 10, shade: 100 }); setSource("kids"); setPlaying(true); setVolume(25); }
    if (r.id === "movie") { patch("salon", { light: 8, shade: 100 }); setSource("tv"); setPlaying(true); }
    if (r.id === "weekend") runAction("morning");
  };

  const Icon = ({ name: n, size = 18 }) => { const C = Icons[n] || Icons.Circle; return <C size={size} />; };
  const NAV = [
    { id: "home", icon: "Home", label: t("home") },
    { id: "media", icon: "Music", label: t("media") },
    { id: "lights", icon: "Lightbulb", label: t("lights") },
    { id: "climate", icon: "Thermometer", label: t("climate") },
    { id: "shades", icon: "Blinds", label: t("shades") },
    { id: "access", icon: "Lock", label: t("access") },
    { id: "routines", icon: "Sparkles", label: t("routines") },
  ];

  const Header = ({ title, sub }) => (
    <header className="ac-head">
      <div><b>{title}</b><span>{sub}</span></div>
      <div className="ac-pills">{[["morning", t("morning")], ["evening", t("evening")], ["away", t("away")], ["night", t("night")]].map(([id, l]) => <button key={id} className={action === id ? "active" : ""} onClick={() => runAction(id)}>{l}</button>)}</div>
    </header>
  );
  const RoomsBar = () => (
    <div className="ac-rooms" data-demo-nav>
      <span>{t("rooms")}</span>
      <div>{rooms.map((r) => <button key={r.id} className={selected === r.id ? "active" : ""} onClick={() => setSelected(r.id)}>{name(r)}</button>)}</div>
    </div>
  );
  const Transport = ({ big }) => (
    <div className={`ac-transport ${big ? "big" : ""}`}>
      <div className="ac-tbtns">
        <button onClick={() => setSource(SOURCES[(SOURCES.findIndex((s) => s.id === source) + 3) % 4].id)}><Icon name="SkipBack" size={big ? 22 : 18} /></button>
        <button className="ac-play" onClick={() => setPlaying((p) => !p)}><Icon name={playing ? "Pause" : "Play"} size={big ? 26 : 20} /></button>
        <button onClick={() => setSource(SOURCES[(SOURCES.findIndex((s) => s.id === source) + 1) % 4].id)}><Icon name="SkipForward" size={big ? 22 : 18} /></button>
      </div>
      <div className="ac-vol"><Icon name="Volume2" size={16} /><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ "--val": `${volume}%` }} /><b>{volume}</b></div>
    </div>
  );

  const renderHome = () => (
    <div className="ac-page">
      <Header title={clientName || "Appartement Carouge"} sub={`${dateLong} · ${clock} · 12° ${t("outside")}`} />
      <div className="ac-tiles">
        <div role="button" tabIndex={0} className="ac-tile media wide" onClick={() => setTab("media")}>
          <div className="ac-tile-head"><span><Icon name="Music" size={20} /> {t("media")}</span><em>{room ? name(room) : ""} · {src.label}</em></div>
          <div className="ac-tile-body"><b>{src.track}</b><span>{playing ? t("playing") : t("paused")} · {src.sub}</span></div>
          <div className="ac-tile-foot" onClick={(e) => e.stopPropagation()}><Transport /></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile lights" onClick={() => setTab("lights")}>
          <div className="ac-tile-head"><span><Icon name="Lightbulb" size={20} /> {t("lights")}</span></div>
          <div className="ac-tile-body"><b>{avgLight} %</b><span>{t("scene")} {t(action)} · {litCount} {t("rooms").toLowerCase()}</span></div>
          <div className="ac-bar"><i style={{ width: `${avgLight}%` }} /></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile climate" onClick={() => setTab("climate")}>
          <div className="ac-tile-head"><span><Icon name="Thermometer" size={20} /> {t("climate")}</span></div>
          <div className="ac-tile-body"><b>{room?.temp.toFixed(1).replace(".", ",")}°</b><span className="ac-arrow">→ {room?.set.toFixed(1).replace(".", ",")}° · {t(mode === "auto" ? "auto" : mode === "heat" ? "heating" : "ecoMode")}</span></div>
          <div className="ac-tile-foot" onClick={(e) => e.stopPropagation()}><div className="ac-pm"><button onClick={() => patch(room.id, { set: clamp(room.set - 0.5, 16, 26) })}>−</button><button onClick={() => patch(room.id, { set: clamp(room.set + 0.5, 16, 26) })}>+</button></div></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile shades" onClick={() => setTab("shades")}>
          <div className="ac-tile-head"><span><Icon name="Blinds" size={20} /> {t("shades")}</span></div>
          <div className="ac-tile-body"><b>{shadeState}</b></div>
          <div className="ac-tile-foot" onClick={(e) => e.stopPropagation()}><div className="ac-pm three"><button onClick={() => patchAll(() => ({ shade: 0 }))}>{t("opening")}</button><button onClick={() => patchAll(() => ({ shade: 50 }))}>{t("stop")}</button><button onClick={() => patchAll(() => ({ shade: 100 }))}>{t("close")}</button></div></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile security" onClick={() => setTab("access")}>
          <div className="ac-tile-head"><span><Icon name="Shield" size={20} /> {t("access")}</span></div>
          <div className="ac-tile-body"><b>{armed ? t("armed") : t("disarmed")}</b><span>{access.filter((a) => a.locked).length} / {access.length} {t("locked").toLowerCase()}</span></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile access" onClick={() => setTab("access")}>
          <div className="ac-tile-head"><span><Icon name="Lock" size={20} /> {t("intercom")}</span></div>
          <div className="ac-tile-body"><b>{ringing ? t("ring") : t("door")}</b><span>{access.find((a) => a.id === "door")?.locked ? t("locked") : t("unlocked")}</span></div>
          <div className="ac-tile-foot" onClick={(e) => e.stopPropagation()}><div className="ac-pm three"><button onClick={() => setRinging((r) => !r)}>{t("ring")}</button><button onClick={() => { setAccess((a) => a.map((x) => (x.id === "door" ? { ...x, locked: false } : x))); setRinging(false); }}>{t("openDoor")}</button></div></div>
        </div>
        <div role="button" tabIndex={0} className="ac-tile routines" onClick={() => setTab("routines")}>
          <div className="ac-tile-head"><span><Icon name="Sparkles" size={20} /> {t("routines")}</span></div>
          <div className="ac-tile-body"><b>{t(activeRoutine)}</b><span>{t("running")} · {routines.find((r) => r.id === activeRoutine)?.time || "—"}</span></div>
        </div>
      </div>
      <RoomsBar />
    </div>
  );

  const renderMedia = () => (
    <div className="ac-page">
      <Header title={t("media")} sub={room ? name(room) : ""} />
      <div className="ac-split">
        <div className="ac-panel media">
          <div className="ac-tile-head"><span><Icon name="Music" size={20} /> {src.label}</span><em>{playing ? t("playing") : t("paused")}</em></div>
          <div className="ac-now"><b>{src.track}</b><span>{src.sub}</span></div>
          <Transport big />
        </div>
        <div className="ac-stack">
          <div className="ac-panel dark"><span className="ac-label">{t("sources")}</span>
            <div className="ac-src">{SOURCES.map((s) => <button key={s.id} className={source === s.id ? "active" : ""} onClick={() => { setSource(s.id); setPlaying(true); }}><Icon name={s.icon} size={20} /><b>{s.label}</b><em>{s.track}</em></button>)}</div></div>
          <div className="ac-panel dark"><span className="ac-label">{t("zones")}</span>
            <div className="ac-zones">{rooms.map((r) => <button key={r.id} className={r.audio ? "on" : ""} onClick={() => patch(r.id, { audio: !r.audio })}>{name(r)}<i /></button>)}</div></div>
        </div>
      </div>
    </div>
  );

  const renderLights = () => (
    <div className="ac-page">
      <Header title={t("lights")} sub={`${litCount} ${t("rooms").toLowerCase()} · ${avgLight} %`} />
      <div className="ac-light-grid">
        {rooms.map((r) => (
          <div key={r.id} className={`ac-panel lights-card ${r.light > 0 ? "on" : ""}`}>
            <div className="ac-tile-head"><span>{name(r)}</span><em>{r.light} %</em></div>
            <input type="range" min="0" max="100" value={r.light} onChange={(e) => patch(r.id, { light: Number(e.target.value) })} style={{ "--val": `${r.light}%` }} className="amber" />
            <div className="ac-pm three">{[[0, t("off")], [40, "40 %"], [100, "100 %"]].map(([v, l]) => <button key={v} className={r.light === v ? "active" : ""} onClick={() => patch(r.id, { light: v })}>{l}</button>)}</div>
          </div>
        ))}
      </div>
      <div className="ac-panel dark row"><span className="ac-label">{t("scenes")}</span><div className="ac-pm three">{[["morning", 70], ["dinner", 45], ["movie", 8], ["off", 0]].map(([id, v]) => <button key={id} onClick={() => patchAll(() => ({ light: v }))}>{t(id)}</button>)}<button onClick={() => patchAll(() => ({ light: 0 }))}>{t("allOff")}</button></div></div>
    </div>
  );

  const renderClimate = () => (
    <div className="ac-page">
      <Header title={t("climate")} sub={`${t("humidity")} 44 % · 12° ${t("outside")}`} />
      <div className="ac-panel dark row"><span className="ac-label">Mode</span><div className="ac-pm three">{[["auto", t("auto")], ["heat", t("heating")], ["eco", t("ecoMode")], ["off", t("off")]].map(([id, l]) => <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>{l}</button>)}</div></div>
      <div className="ac-climate-grid">
        {rooms.map((r) => (
          <div key={r.id} className="ac-panel climate-card">
            <div className="ac-tile-head"><span>{name(r)}</span><em>{t("humidity")} {40 + (r.id.length % 7)} %</em></div>
            <div className="ac-temp"><b>{r.temp.toFixed(1).replace(".", ",")}°</b><span className="ac-arrow">→ {r.set.toFixed(1).replace(".", ",")}°</span></div>
            <div className="ac-range"><i style={{ left: `${((r.set - 16) / 10) * 100}%` }} /><b style={{ left: `${((r.temp - 16) / 10) * 100}%` }} /></div>
            <div className="ac-pm"><button onClick={() => patch(r.id, { set: clamp(r.set - 0.5, 16, 26) })}>−</button><button onClick={() => patch(r.id, { set: clamp(r.set + 0.5, 16, 26) })}>+</button></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShades = () => (
    <div className="ac-page">
      <Header title={t("shades")} sub={shadeState} />
      <div className="ac-panel dark row"><span className="ac-label">{t("allRooms")}</span><div className="ac-pm three"><button onClick={() => patchAll(() => ({ shade: 0 }))}><Icon name="ChevronUp" size={16} /> {t("opening")}</button><button onClick={() => patchAll(() => ({ shade: 50 }))}>{t("stop")}</button><button onClick={() => patchAll(() => ({ shade: 100 }))}><Icon name="ChevronDown" size={16} /> {t("close")}</button></div></div>
      <div className="ac-shade-grid">
        {rooms.map((r) => (
          <div key={r.id} className="ac-panel shade-card">
            <div className="ac-shade-visual"><div style={{ height: `${r.shade}%` }}>{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div></div>
            <div className="ac-shade-side">
              <b>{name(r)}</b><em>{r.shade === 0 ? t("open") : r.shade === 100 ? t("closed") : `${r.shade} %`}</em>
              <input type="range" min="0" max="100" value={r.shade} onChange={(e) => patch(r.id, { shade: Number(e.target.value) })} style={{ "--val": `${r.shade}%` }} className="rose" />
              <div className="ac-pm"><button onClick={() => patch(r.id, { shade: 0 })}><Icon name="ChevronUp" size={16} /></button><button onClick={() => patch(r.id, { shade: 100 })}><Icon name="ChevronDown" size={16} /></button></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccess = () => (
    <div className="ac-page">
      <Header title={t("access")} sub={armed ? t("armed") : t("disarmed")} />
      <div className="ac-split">
        <div className="ac-stack">
          <div className={`ac-panel access ${ringing ? "ringing" : ""}`}>
            <div className="ac-tile-head"><span><Icon name="Phone" size={20} /> {t("intercom")}</span><em>{ringing ? t("ring") : t("door")}</em></div>
            <div className="ac-cam"><span>{t("door")} · {t("gate")}</span>{ringing && <i />}</div>
            <div className="ac-pm three"><button onClick={() => setRinging((x) => !x)}><Icon name="Bell" size={16} /> {ringing ? t("stop") : t("ring")}</button><button onClick={() => setRinging(false)}><Icon name="PhoneCall" size={16} /> {t("answer")}</button><button className="active" onClick={() => { setAccess((a) => a.map((x) => (x.id === "door" ? { ...x, locked: false } : x))); setRinging(false); }}><Icon name="Unlock" size={16} /> {t("openDoor")}</button></div>
          </div>
          <div className="ac-panel security">
            <div className="ac-tile-head"><span><Icon name="Shield" size={20} /> {armed ? t("armed") : t("disarmed")}</span><em>{t("presence")}</em></div>
            <div className="ac-pm"><button className={armed ? "active" : ""} onClick={() => setArmed(true)}>{t("arm")}</button><button className={!armed ? "active" : ""} onClick={() => setArmed(false)}>{t("disarm")}</button></div>
          </div>
        </div>
        <div className="ac-panel dark"><span className="ac-label">{t("access")}</span>
          <div className="ac-locks">{access.map((a) => (
            <div key={a.id} className={`ac-lock ${a.locked ? "locked" : ""}`}>
              <Icon name={a.locked ? "Lock" : "Unlock"} size={20} /><div><b>{t(a.key)}</b><em>{a.locked ? t("locked") : t("unlocked")}</em></div>
              <button className={`ac-switch ${a.locked ? "on" : ""}`} onClick={() => setAccess((as) => as.map((x) => (x.id === a.id ? { ...x, locked: !x.locked } : x)))}><i /></button>
            </div>))}</div>
        </div>
      </div>
    </div>
  );

  const renderRoutines = () => (
    <div className="ac-page">
      <Header title={t("routines")} sub={`${t("running")} · ${t(activeRoutine)}`} />
      <div className="ac-routine-grid">
        {routines.map((r) => (
          <div key={r.id} className={`ac-panel routine-card ${activeRoutine === r.id ? "active" : ""} ${r.on ? "" : "off"}`}>
            <div className="ac-tile-head"><span><Icon name={r.icon} size={20} /> {t(r.id)}</span><em>{r.time ? `${t("schedule")} ${r.time}` : t("routine")}</em></div>
            <div className="ac-routine-foot">
              <button className="ac-run" onClick={() => runRoutine(r)}><Icon name="Play" size={14} /> {activeRoutine === r.id ? t("running") : t("run")}</button>
              {r.time && <button className={`ac-switch ${r.on ? "on" : ""}`} onClick={() => setRoutines((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))}><i /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PAGES = { home: renderHome, media: renderMedia, lights: renderLights, climate: renderClimate, shades: renderShades, access: renderAccess, routines: renderRoutines };

  return (
    <div className={`gemini-ui-root carouge-ui ${deviceType}`}>
      {!isPhone && <nav className="ac-nav">{NAV.map((n) => <button key={n.id} className={`${n.id} ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}><Icon name={n.icon} size={18} /><span>{n.label}</span></button>)}</nav>}
      <main className="ac-main">{PAGES[tab]()}</main>
      {isPhone && <nav className="ac-tabbar">{NAV.filter((n) => n.id !== "routines").map((n) => <button key={n.id} className={`${n.id} ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>)}</nav>}
    </div>
  );
};
