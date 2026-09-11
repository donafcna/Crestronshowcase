import React, { useCallback, useMemo, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import { chText } from "../../data/crestronHomeUi";
import "./crestronHome.css";

// ---------------------------------------------------------------------------
// Crestron Home — réinterprétation Fréquence TV
//
// Reprend la structure et les parcours de l'application Crestron Home OS
// (accueil « scènes + contrôles », liste des pièces filtrée par étage, détail
// de pièce en « services », feuilles de pilotage) avec l'identité graphique
// du showcase : violet de marque, cyan d'appui, ambre pour l'éclairage.
//
// Un seul composant sert les quatre gabarits. `deviceType` vaut :
//   phone      iPhone      402 x 781   colonne unique, barre d'onglets basse
//   tablet     iPad        1376 x 988  grilles larges, feuilles centrées
//   wallpanel  TSW-1070    1280 x 800  idem tablette, rythme resserré et
//                                      cibles élargies (pilotage mural)
//   desktop    Xpanel      1920 x 1080 idem tablette, grilles plus larges
// ---------------------------------------------------------------------------

const PHOTO = (id, w) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const HOUSE_IMG = PHOTO("photo-1613977257363-707ba9348227", 1400);

const FLOORS = [
  { id: "ground", key: "floor_ground" },
  { id: "outside", key: "floor_outside" },
  { id: "upper", key: "floor_upper" },
];

// Une pièce déclare les services qu'elle expose — exactement la logique du
// fichier de configuration d'un vrai projet : ce qui n'est pas déclaré n'est
// pas affiché.
const ROOMS = [
  {
    id: "living",
    key: "room_living",
    floor: "ground",
    img: PHOTO("photo-1600210492486-724fe5c67fb0", 640),
    lights: [
      { id: "spots", label: "Spots plafond", dim: true },
      { id: "cove", label: "Corniche LED", dim: true },
      { id: "reading", label: "Liseuses", dim: false },
    ],
    shades: [
      { id: "s1", label: "Baie vitrée" },
      { id: "s2", label: "Rideaux" },
    ],
    climate: true,
    video: true,
    audio: true,
    lock: true,
  },
  {
    id: "kitchen",
    key: "room_kitchen",
    floor: "ground",
    img: PHOTO("photo-1556911220-e15b29be8c8f", 640),
    lights: [
      { id: "ceiling", label: "Plafonnier", dim: true },
      { id: "cabinet", label: "Sous-meubles", dim: false },
    ],
    shades: [{ id: "s1", label: "Store cuisine" }],
    climate: false,
    video: false,
    audio: true,
    lock: false,
  },
  {
    id: "dining",
    key: "room_dining",
    floor: "ground",
    img: PHOTO("photo-1616486886892-ff366aa67ba4", 640),
    lights: [
      { id: "pendant", label: "Suspension", dim: true },
      { id: "wall", label: "Appliques", dim: true },
    ],
    shades: [{ id: "s1", label: "Voilage" }],
    climate: true,
    video: false,
    audio: true,
    lock: false,
  },
  {
    id: "cinema",
    key: "room_cinema",
    floor: "ground",
    img: PHOTO("photo-1489599849927-2ee91cede3ba", 640),
    lights: [
      { id: "steps", label: "Balisage marches", dim: true },
      { id: "cove", label: "Corniche", dim: true },
    ],
    shades: [{ id: "s1", label: "Écran occultant" }],
    climate: true,
    video: true,
    audio: true,
    lock: false,
  },
  {
    id: "terrace",
    key: "room_terrace",
    floor: "outside",
    img: PHOTO("photo-1600607687939-ce8a6c25118c", 640),
    lights: [{ id: "path", label: "Balisage", dim: true }],
    shades: [{ id: "s1", label: "Pergola bioclimatique" }],
    climate: false,
    video: false,
    audio: true,
    lock: false,
  },
  {
    id: "pool",
    key: "room_pool",
    floor: "outside",
    img: PHOTO("photo-1571902943202-507ec2618e8f", 640),
    lights: [{ id: "under", label: "Éclairage immergé", dim: true }],
    shades: [],
    climate: false,
    video: false,
    audio: true,
    lock: false,
  },
  {
    id: "master",
    key: "room_master",
    floor: "upper",
    img: PHOTO("photo-1616594039964-ae9021a400a0", 640),
    lights: [
      { id: "ceiling", label: "Plafonnier", dim: true },
      { id: "bed", label: "Chevets", dim: true },
    ],
    shades: [
      { id: "s1", label: "Volet" },
      { id: "s2", label: "Rideau occultant" },
    ],
    climate: true,
    video: true,
    audio: true,
    lock: false,
  },
  {
    id: "guest",
    key: "room_guest",
    floor: "upper",
    img: PHOTO("photo-1590490360182-c33d57733427", 640),
    lights: [{ id: "ceiling", label: "Plafonnier", dim: true }],
    shades: [{ id: "s1", label: "Volet" }],
    climate: true,
    video: false,
    audio: false,
    lock: false,
  },
];

const SCENES = [
  { id: "arrive", key: "scene_arrive", icon: "LogIn" },
  { id: "morning", key: "scene_morning", icon: "Sunrise" },
  { id: "night", key: "scene_night", icon: "MoonStar" },
  { id: "leave", key: "scene_leave", icon: "Sunset" },
];

const DISPLAYS = [
  { id: "d1", label: "Séjour — écran principal" },
  { id: "d2", label: "Séjour — au-dessus de la cheminée" },
  { id: "d3", label: "Home cinéma — projecteur" },
  { id: "d4", label: "Chambre parentale" },
];

const SOURCES = [
  { id: "tv", label: "TV / IPTV", icon: "Tv" },
  { id: "stream", label: "Box streaming", icon: "Cast" },
  { id: "bluray", label: "Lecteur Blu-ray", icon: "Disc" },
  { id: "pc", label: "PC / Présentation", icon: "Monitor" },
  { id: "cam", label: "Vidéosurveillance", icon: "Camera" },
];

const CHANNELS = [
  { n: "201", label: "RTS 1" },
  { n: "202", label: "RTS 2" },
  { n: "203", label: "Léman Bleu" },
  { n: "204", label: "Info" },
  { n: "205", label: "Sport" },
  { n: "206", label: "Cinéma" },
  { n: "207", label: "Docs" },
  { n: "208", label: "Musique" },
];

const MUSIC_SERVICES = [
  { id: "multi", label: "Multiroom", icon: "AudioLines" },
  { id: "radio", label: "Radio", icon: "Radio" },
  { id: "stream", label: "Streaming", icon: "Disc3" },
  { id: "library", label: "Bibliothèque", icon: "Music" },
  { id: "line", label: "Entrée ligne", icon: "Plug" },
];

const MUSIC_FAVS = [
  { id: "f1", title: "Couleur 3", sub: "Radio", tint: "#6d3bf5" },
  { id: "f2", title: "Jazz du soir", sub: "Streaming", tint: "#1ea7d6" },
  { id: "f3", title: "Playlist Terrasse", sub: "Multiroom", tint: "#e8a317" },
  { id: "f4", title: "Classique", sub: "Bibliothèque", tint: "#2fa877" },
  { id: "f5", title: "Option Musique", sub: "Radio", tint: "#e2624f" },
  { id: "f6", title: "Deep Focus", sub: "Streaming", tint: "#3d4a5c" },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Cadran de thermostat : arc dégradé cyan → corail, curseur sur la consigne.
const Dial = ({ value, min = 16, max = 30, mode, size = 210 }) => {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const ratio = clamp((value - min) / (max - min), 0, 1);
  const angle = -220 + ratio * 260;
  const cx = size / 2;
  const cy = size / 2;
  const rad = (angle * Math.PI) / 180;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id="chDialGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1ea7d6" />
          <stop offset="55%" stopColor="#9d7bff" />
          <stop offset="100%" stopColor="#e2624f" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#chDialGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${c * 0.86} ${c}`}
        transform={`rotate(-220 ${cx} ${cy})`}
        opacity={mode === "off" ? 0.25 : 1}
      />
      <circle
        cx={cx + r * Math.cos(rad)}
        cy={cy + r * Math.sin(rad)}
        r="6"
        fill="var(--ch-surface)"
        stroke={mode === "heat" ? "#e2624f" : "#1ea7d6"}
        strokeWidth="3"
      />
    </svg>
  );
};

export const CrestronHome = ({ deviceType = "tablet", clientName }) => {
  const { lang } = useTranslation();
  const t = useCallback(
    (key) => (chText[lang] && chText[lang][key]) || chText.fr[key] || key,
    [lang]
  );

  const compact = deviceType === "phone";
  const wall = deviceType === "wallpanel" || deviceType === "desktop";

  // ---- État simulé -------------------------------------------------------
  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState("home");
  const [openRoom, setOpenRoom] = useState(null);
  const [sheet, setSheet] = useState(null); // { type, roomId }
  const [filter, setFilter] = useState("all");
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [firedScene, setFiredScene] = useState(null);

  const [levels, setLevels] = useState({
    "living.spots": 70,
    "living.cove": 35,
    "living.reading": 0,
    "kitchen.ceiling": 100,
    "kitchen.cabinet": 100,
    "dining.pendant": 55,
    "dining.wall": 0,
    "cinema.steps": 20,
    "cinema.cove": 0,
    "terrace.path": 0,
    "pool.under": 0,
    "master.ceiling": 0,
    "master.bed": 40,
    "guest.ceiling": 0,
  });

  const [shadePos, setShadePos] = useState({
    "living.s1": 100,
    "living.s2": 60,
    "kitchen.s1": 100,
    "dining.s1": 100,
    "cinema.s1": 0,
    "terrace.s1": 45,
    "master.s1": 0,
    "master.s2": 0,
    "guest.s1": 100,
  });

  const [climate, setClimate] = useState({
    living: { temp: 22.4, set: 21.5, mode: "cool", fan: "auto", hold: false, hum: 44, humCtrl: true },
    dining: { temp: 21.8, set: 21, mode: "auto", fan: "auto", hold: false, hum: 42, humCtrl: false },
    cinema: { temp: 20.9, set: 20.5, mode: "cool", fan: "on", hold: true, hum: 40, humCtrl: false },
    master: { temp: 20.2, set: 19.5, mode: "heat", fan: "auto", hold: false, hum: 46, humCtrl: true },
    guest: { temp: 19.4, set: 18, mode: "heat", fan: "auto", hold: true, hum: 45, humCtrl: false },
  });

  const [locks, setLocks] = useState({ door: true, gate: true, garage: "closed" });
  const [pool, setPool] = useState(true);
  const [spa, setSpa] = useState(false);
  const [favs, setFavs] = useState(() => new Set(["living", "pool", "master"]));

  const [displays, setDisplays] = useState({
    d1: { on: true, source: "tv" },
    d2: { on: false, source: null },
    d3: { on: false, source: null },
    d4: { on: false, source: null },
  });
  const [channel, setChannel] = useState("201");
  const [videoTarget, setVideoTarget] = useState("d1");

  const [music, setMusic] = useState({
    playing: true,
    title: "Couleur 3",
    sub: "Radio · Séjour",
    tint: "#6d3bf5",
    volume: 32,
  });

  const [showControls, setShowControls] = useState({
    lights: true,
    shades: true,
    climate: true,
    media: true,
    access: true,
    pool: true,
  });

  // ---- Dérivés ------------------------------------------------------------
  const roomName = useCallback((room) => t(room.key), [t]);

  const lightsOnIn = useCallback(
    (room) => room.lights.filter((l) => (levels[`${room.id}.${l.id}`] || 0) > 0).length,
    [levels]
  );
  const shadesOpenIn = useCallback(
    (room) => room.shades.filter((s) => (shadePos[`${room.id}.${s.id}`] || 0) > 5).length,
    [shadePos]
  );

  const houseLightsOn = useMemo(
    () => Object.values(levels).filter((v) => v > 0).length,
    [levels]
  );
  const houseShadesOpen = useMemo(
    () => Object.values(shadePos).filter((v) => v > 5).length,
    [shadePos]
  );

  const roomSubtitle = useCallback(
    (room) => {
      const n = lightsOnIn(room);
      if (n === 0) return t("all_lights_off");
      return `${n} ${n > 1 ? t("lights_on_count_p") : t("lights_on_count")}`;
    },
    [lightsOnIn, t]
  );

  const visibleRooms = useMemo(() => {
    if (filter === "fav") return ROOMS.filter((r) => favs.has(r.id));
    if (filter === "all") return ROOMS;
    return ROOMS.filter((r) => r.floor === filter);
  }, [filter, favs]);

  // ---- Actions ------------------------------------------------------------
  const icon = (name, size = 20, cls = "") => {
    const C = Icons[name] || Icons.HelpCircle;
    return <C size={size} className={cls} strokeWidth={1.9} />;
  };

  const setLevel = (roomId, loadId, v) =>
    setLevels((p) => ({ ...p, [`${roomId}.${loadId}`]: clamp(Math.round(v), 0, 100) }));

  const setShade = (roomId, shadeId, v) =>
    setShadePos((p) => ({ ...p, [`${roomId}.${shadeId}`]: clamp(Math.round(v), 0, 100) }));

  const allLights = (room, on) =>
    setLevels((p) => {
      const next = { ...p };
      room.lights.forEach((l) => {
        next[`${room.id}.${l.id}`] = on ? 100 : 0;
      });
      return next;
    });

  const allShades = (room, open) =>
    setShadePos((p) => {
      const next = { ...p };
      room.shades.forEach((s) => {
        next[`${room.id}.${s.id}`] = open ? 100 : 0;
      });
      return next;
    });

  const runScene = (id) => {
    setFiredScene(id);
    setTimeout(() => setFiredScene(null), 1400);
    setLevels((p) => {
      const next = { ...p };
      Object.keys(next).forEach((k) => {
        if (id === "leave" || id === "night") next[k] = 0;
        if (id === "arrive") next[k] = k.startsWith("living") || k.startsWith("kitchen") ? 65 : 0;
        if (id === "morning") next[k] = k.startsWith("kitchen") || k.startsWith("dining") ? 85 : 0;
      });
      return next;
    });
    setShadePos((p) => {
      const next = { ...p };
      Object.keys(next).forEach((k) => {
        next[k] = id === "night" ? 0 : id === "morning" ? 100 : next[k];
      });
      return next;
    });
    if (id === "leave" || id === "night") {
      setLocks((l) => ({ ...l, door: true, gate: true, garage: "closed" }));
      setMusic((m) => ({ ...m, playing: false }));
    }
  };

  const roomOff = (room) => {
    allLights(room, false);
    if (room.audio) setMusic((m) => ({ ...m, playing: false }));
    setDisplays((d) => {
      const next = { ...d };
      Object.keys(next).forEach((k) => {
        next[k] = { on: false, source: null };
      });
      return next;
    });
  };

  const cycleGarage = () => {
    if (locks.garage === "closed") {
      setLocks((l) => ({ ...l, garage: "open" }));
    } else {
      setLocks((l) => ({ ...l, garage: "closing" }));
      setTimeout(() => setLocks((l) => ({ ...l, garage: "closed" })), 1800);
    }
  };

  const toggleFav = (id) =>
    setFavs((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFloor = (id) =>
    setCollapsed((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patchClimate = (roomId, patch) =>
    setClimate((p) => ({ ...p, [roomId]: { ...p[roomId], ...patch } }));

  const openSheet = (type, roomId = null) => setSheet({ type, roomId });
  const closeSheet = () => setSheet(null);

  const sheetRoom = sheet?.roomId ? ROOMS.find((r) => r.id === sheet.roomId) : null;
  const currentRoom = openRoom ? ROOMS.find((r) => r.id === openRoom) : null;

  // =========================================================================
  // Vues
  // =========================================================================
  const renderHome = () => (
    <div className="ch-fadein">
      <div className="ch-hero" style={{ backgroundImage: `url(${HOUSE_IMG})` }}>
        <div className="ch-hero-text">
          <h1>{clientName || t("home_name")}</h1>
          <p>{t("house_status")}</p>
        </div>
      </div>

      <div className="ch-section">
        <h3>{t("actions")}</h3>
        <div className="ch-scene-row">
          {SCENES.map((s) => (
            <button
              key={s.id}
              className={`ch-scene ${firedScene === s.id ? "fired" : ""}`}
              onClick={() => runScene(s.id)}
            >
              <span className="ch-scene-icon">{icon(s.icon, 22)}</span>
              <span>{firedScene === s.id ? t("scene_applied") : t(s.key)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ch-section">
        <h3>{t("controls")}</h3>
        <div className="ch-tile-grid">
          {showControls.lights && (
            <button className={`ch-tile ${houseLightsOn ? "on" : ""}`} onClick={() => openSheet("lights", "living")}>
              {icon("Lightbulb", 24, houseLightsOn ? "ch-ic-amber" : "ch-ic-muted")}
              <span>
                <span className="ch-tile-name">{t("lights")}</span>
                <span className="ch-tile-state">
                  {houseLightsOn
                    ? `${houseLightsOn} ${houseLightsOn > 1 ? t("lights_on_count_p") : t("lights_on_count")}`
                    : t("all_lights_off")}
                </span>
              </span>
            </button>
          )}
          {showControls.media && (
            <button className={`ch-tile ${music.playing ? "on" : ""}`} onClick={() => openSheet("music")}>
              {icon("Music", 24, music.playing ? "ch-ic-violet" : "ch-ic-muted")}
              <span>
                <span className="ch-tile-name">{t("music")}</span>
                <span className="ch-tile-state">{music.playing ? music.title : t("not_playing")}</span>
              </span>
            </button>
          )}
          {showControls.shades && (
            <button className={`ch-tile ${houseShadesOpen ? "on" : ""}`} onClick={() => openSheet("shades", "living")}>
              {icon("Blinds", 24, houseShadesOpen ? "ch-ic-cyan" : "ch-ic-muted")}
              <span>
                <span className="ch-tile-name">{t("shades")}</span>
                <span className="ch-tile-state">{houseShadesOpen ? t("open") : t("closed")}</span>
              </span>
            </button>
          )}
          {showControls.climate && (
            <button className="ch-tile on" onClick={() => openSheet("climate", "living")}>
              {icon("Thermometer", 24, "ch-ic-cyan")}
              <span>
                <span className="ch-tile-name">{t("climate")}</span>
                <span className="ch-tile-state">{climate.living.temp.toFixed(1)} °C</span>
              </span>
            </button>
          )}

          {showControls.access && (
            <div className="ch-tile wide">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {icon(locks.door && locks.gate ? "Lock" : "Unlock", 22, locks.door && locks.gate ? "ch-ic-violet" : "ch-ic-coral")}
                <span className="ch-tile-name">{t("access")}</span>
              </div>
              <div className="ch-access-row">
                <button
                  className={`ch-access-btn ${locks.door ? "done" : ""}`}
                  onClick={() => setLocks((l) => ({ ...l, door: !l.door }))}
                >
                  {icon(locks.door ? "Lock" : "Unlock", 18)}
                  {t("front_door")}
                </button>
                <button
                  className={`ch-access-btn ${locks.gate ? "done" : ""}`}
                  onClick={() => setLocks((l) => ({ ...l, gate: !l.gate }))}
                >
                  {icon("MoveHorizontal", 18)}
                  {t("gate")}
                </button>
                <button
                  className={`ch-access-btn ${
                    locks.garage === "closing" ? "busy" : locks.garage === "closed" ? "done" : ""
                  }`}
                  onClick={cycleGarage}
                >
                  {icon(locks.garage === "open" ? "ArrowUp" : "ArrowDown", 18)}
                  {locks.garage === "closing" ? t("closing") : t("garage")}
                </button>
              </div>
            </div>
          )}

          {showControls.pool && (
            <>
              <button className={`ch-tile ${pool ? "on" : ""}`} onClick={() => setPool((v) => !v)}>
                {icon("Waves", 24, pool ? "ch-ic-cyan" : "ch-ic-muted")}
                <span>
                  <span className="ch-tile-name">{t("pool")}</span>
                  <span className="ch-tile-state">{pool ? t("active") : t("inactive")}</span>
                </span>
              </button>
              <button className={`ch-tile ${spa ? "on" : ""}`} onClick={() => setSpa((v) => !v)}>
                {icon("Bath", 24, spa ? "ch-ic-coral" : "ch-ic-muted")}
                <span>
                  <span className="ch-tile-name">{t("spa")}</span>
                  <span className="ch-tile-state">{spa ? t("active") : t("inactive")}</span>
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="ch-fadein">
      <div className="ch-filters">
        <button className={`ch-chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
          {t("filter_all")}
        </button>
        <button className={`ch-chip ${filter === "fav" ? "on" : ""}`} onClick={() => setFilter("fav")}>
          {t("filter_fav")}
        </button>
        {FLOORS.map((f) => (
          <button key={f.id} className={`ch-chip ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)}>
            {t(f.key)}
          </button>
        ))}
      </div>

      {FLOORS.map((f) => {
        const rooms = visibleRooms.filter((r) => r.floor === f.id);
        if (!rooms.length) return null;
        const isCollapsed = collapsed.has(f.id);
        return (
          <div className="ch-floor" key={f.id}>
            <button
              className={`ch-floor-head ${isCollapsed ? "collapsed" : ""}`}
              onClick={() => toggleFloor(f.id)}
            >
              {t(f.key)}
              {icon("ChevronUp", 15)}
            </button>
            {!isCollapsed && (
              <div className="ch-room-grid">
                {rooms.map((r) => {
                  const on = lightsOnIn(r);
                  const sh = shadesOpenIn(r);
                  return (
                    <div
                      key={r.id}
                      className="ch-room-card"
                      style={{ backgroundImage: `url(${r.img})` }}
                      onClick={() => {
                        setOpenRoom(r.id);
                        setTab("rooms");
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setOpenRoom(r.id)}
                    >
                      <button
                        className={`ch-fav ${favs.has(r.id) ? "on" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(r.id);
                        }}
                        aria-label="favori"
                      >
                        {icon("Star", 13)}
                      </button>
                      <div className="ch-room-body">
                        <h4>{roomName(r)}</h4>
                        <p>{roomSubtitle(r)}</p>
                        <div className="ch-room-badges">
                          {on > 0 && icon("Lightbulb", 14, "ch-ic-amber")}
                          {sh > 0 && icon("Blinds", 14, "ch-ic-cyan")}
                          {r.climate && icon("Thermometer", 14, "ch-ic-cyan")}
                          {r.lock && !locks.door && icon("Unlock", 14, "ch-ic-coral")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderRoomDetail = (room) => {
    const cl = climate[room.id];
    const on = lightsOnIn(room);
    const sh = shadesOpenIn(room);
    return (
      <div className="ch-fadein">
        <div className="ch-hero" style={{ backgroundImage: `url(${room.img})` }}>
          <div className="ch-hero-text">
            <h1>{roomName(room)}</h1>
            <p>
              {roomSubtitle(room)}
              {room.shades.length ? ` · ${sh > 0 ? t("shades_open_s") : t("shades_closed_s")}` : ""}
              {cl ? ` · ${cl.temp.toFixed(1)} °C` : ""}
            </p>
          </div>
        </div>

        <div className="ch-section">
          <h3>{t("actions")}</h3>
          <div className="ch-scene-row">
            <button className="ch-scene" onClick={() => roomOff(room)}>
              <span className="ch-scene-icon">{icon("Power", 22)}</span>
              <span>{t("room_off")}</span>
            </button>
          </div>
        </div>

        <div className="ch-section">
          <h3>{t("services")}</h3>
          <div className="ch-svc-grid">
            {room.lights.length > 0 && (
              <div className="ch-svc">
                <div className="ch-svc-head">
                  <div>
                    <h4>{t("lights")}</h4>
                    <span className="ch-svc-state">
                      {on > 0 ? `${on} ${on > 1 ? t("lights_on_count_p") : t("lights_on_count")}` : t("off")}
                    </span>
                  </div>
                  <button className="ch-iconbtn ghost" onClick={() => openSheet("lights", room.id)} aria-label={t("lights")}>
                    {icon("Sliders", 17)}
                  </button>
                </div>
                <div className="ch-pair">
                  <button
                    className={`ch-round ${on === 0 ? "on violet" : ""}`}
                    onClick={() => allLights(room, false)}
                    aria-label={t("off")}
                  >
                    {icon("Power", 18)}
                  </button>
                  <button
                    className={`ch-round ${on > 0 ? "on amber" : ""}`}
                    onClick={() => allLights(room, true)}
                    aria-label={t("on")}
                  >
                    {icon("Lightbulb", 18)}
                  </button>
                </div>
              </div>
            )}

            {room.shades.length > 0 && (
              <div className="ch-svc">
                <div className="ch-svc-head">
                  <div>
                    <h4>{t("shades")}</h4>
                    <span className="ch-svc-state">{sh > 0 ? t("open") : t("closed")}</span>
                  </div>
                  <button className="ch-iconbtn ghost" onClick={() => openSheet("shades", room.id)} aria-label={t("shades")}>
                    {icon("Sliders", 17)}
                  </button>
                </div>
                <div className="ch-pair">
                  <button
                    className={`ch-round ${sh === 0 ? "on cyan" : ""}`}
                    onClick={() => allShades(room, false)}
                    aria-label={t("closed")}
                  >
                    {icon("Square", 18)}
                  </button>
                  <button
                    className={`ch-round ${sh > 0 ? "on cyan" : ""}`}
                    onClick={() => allShades(room, true)}
                    aria-label={t("open")}
                  >
                    {icon("Blinds", 18)}
                  </button>
                </div>
              </div>
            )}

            {room.climate && cl && (
              <div className="ch-thermo-card span2">
                <button
                  className="ch-thermo-top"
                  onClick={() => openSheet("climate", room.id)}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <span className="ch-dial-mini">
                    <Dial value={cl.set} mode={cl.mode} size={54} />
                    <b>{cl.temp.toFixed(0)}</b>
                  </span>
                  <span style={{ flex: 1 }}>
                    <h4>{t("climate")}</h4>
                    <p>
                      {cl.mode === "heat" ? t("mode_heat") : cl.mode === "cool" ? t("mode_cool") : t("mode_auto")} ·{" "}
                      {cl.hold ? t("sched_hold") : t("sched_running")}
                    </p>
                  </span>
                </button>
                <div className="ch-thermo-adjust">
                  <button className="ch-step" onClick={() => patchClimate(room.id, { set: clamp(cl.set - 0.5, 16, 30) })}>
                    {icon("Minus", 20)}
                  </button>
                  <div className="ch-sp">
                    <b>{cl.set.toFixed(1)} °C</b>
                    <span>{t("setpoint")}</span>
                  </div>
                  <button className="ch-step" onClick={() => patchClimate(room.id, { set: clamp(cl.set + 0.5, 16, 30) })}>
                    {icon("Plus", 20)}
                  </button>
                </div>
              </div>
            )}

            {room.lock && (
              <div className="ch-svc">
                <div className="ch-svc-head">
                  <div>
                    <h4>{t("lock")}</h4>
                    <span className={`ch-svc-state ${locks.door ? "" : "alert"}`}>
                      {locks.door ? t("locked") : t("unlocked")}
                    </span>
                  </div>
                </div>
                <div className="ch-pair">
                  <button
                    className={`ch-round ${locks.door ? "on violet" : ""}`}
                    onClick={() => setLocks((l) => ({ ...l, door: true }))}
                    aria-label={t("locked")}
                  >
                    {icon("Lock", 18)}
                  </button>
                  <button
                    className={`ch-round ${!locks.door ? "on coral" : ""}`}
                    onClick={() => setLocks((l) => ({ ...l, door: false }))}
                    aria-label={t("unlocked")}
                  >
                    {icon("Unlock", 18)}
                  </button>
                </div>
              </div>
            )}

            {room.audio && (
              <button className="ch-svc" onClick={() => openSheet("music")}>
                <div className="ch-svc-head">
                  <div>
                    <h4>{t("music")}</h4>
                    <span className="ch-svc-state">{music.playing ? music.title : t("not_playing")}</span>
                  </div>
                  {icon("Music", 20, music.playing ? "ch-ic-violet" : "ch-ic-muted")}
                </div>
                {music.playing && (
                  <div className="ch-eq">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
              </button>
            )}

            {room.video && (
              <button className="ch-svc" onClick={() => openSheet("video", room.id)}>
                <div className="ch-svc-head">
                  <div>
                    <h4>{t("video")}</h4>
                    <span className="ch-svc-state">
                      {Object.values(displays).some((d) => d.on) ? t("active") : t("inactive")}
                    </span>
                  </div>
                  {icon("Tv", 20, Object.values(displays).some((d) => d.on) ? "ch-ic-cyan" : "ch-ic-muted")}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---- Feuilles -----------------------------------------------------------
  const sheetHeader = (title, sub) => (
    <div className="ch-sheet-head">
      <div className="ch-sheet-title">
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      <button className="ch-iconbtn" onClick={closeSheet} aria-label={t("close")}>
        {icon("X", 18)}
      </button>
    </div>
  );

  const renderLightsSheet = (room) => {
    const on = lightsOnIn(room);
    return (
      <>
        {sheetHeader(t("lights"), roomName(room))}
        <div className="ch-sheet-body">
          <div className="ch-segment">
            <button className={`ch-seg-btn ${on === 0 ? "on amber" : ""}`} onClick={() => allLights(room, false)}>
              {icon("Power", 20)}
            </button>
            <button className={`ch-seg-btn ${on > 0 ? "on amber" : ""}`} onClick={() => allLights(room, true)}>
              {icon("Lightbulb", 20)}
            </button>
          </div>

          <div className="ch-eyebrow">{t("all_lights")}</div>
          <div className="ch-master-row">
            <button
              onClick={() =>
                setLevels((p) => {
                  const next = { ...p };
                  room.lights.forEach((l) => {
                    const k = `${room.id}.${l.id}`;
                    next[k] = clamp((next[k] || 0) - 20, 0, 100);
                  });
                  return next;
                })
              }
              aria-label={t("dim_down")}
            >
              {icon("SunMedium", 20)}
            </button>
            <button
              onClick={() =>
                setLevels((p) => {
                  const next = { ...p };
                  room.lights.forEach((l) => {
                    const k = `${room.id}.${l.id}`;
                    next[k] = clamp((next[k] || 0) + 20, 0, 100);
                  });
                  return next;
                })
              }
              aria-label={t("dim_up")}
            >
              {icon("Sun", 22)}
            </button>
          </div>

          <div className="ch-load-grid">
            {room.lights.map((l) => {
              const k = `${room.id}.${l.id}`;
              const v = levels[k] || 0;
              return (
                <div className="ch-load" key={l.id}>
                  <div className="ch-load-top">
                    <b>{l.label}</b>
                    {l.dim ? (
                      <span className={v > 0 ? "on" : ""}>{v}%</span>
                    ) : (
                      <button
                        className={`ch-switch amber ${v > 0 ? "on" : ""}`}
                        onClick={() => setLevel(room.id, l.id, v > 0 ? 0 : 100)}
                        aria-label={l.label}
                      />
                    )}
                  </div>
                  {l.dim && (
                    <input
                      className="ch-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={v}
                      onChange={(e) => setLevel(room.id, l.id, Number(e.target.value))}
                      style={{
                        background: `linear-gradient(90deg, var(--ch-amber) ${v}%, var(--ch-surface-2) ${v}%)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderShadesSheet = (room) => {
    const sh = shadesOpenIn(room);
    return (
      <>
        {sheetHeader(t("shades"), roomName(room))}
        <div className="ch-sheet-body">
          <div className="ch-segment">
            <button className={`ch-seg-btn ${sh === 0 ? "on cyan" : ""}`} onClick={() => allShades(room, false)}>
              {icon("Square", 20)}
            </button>
            <button className={`ch-seg-btn ${sh > 0 ? "on cyan" : ""}`} onClick={() => allShades(room, true)}>
              {icon("Blinds", 20)}
            </button>
          </div>

          <div className="ch-eyebrow">{t("all_shades")}</div>
          <div className="ch-load-grid">
            {room.shades.map((s) => {
              const k = `${room.id}.${s.id}`;
              const v = shadePos[k] ?? 0;
              return (
                <div className="ch-load" key={s.id}>
                  <div className="ch-load-top">
                    <b>{s.label}</b>
                    <span>{v === 0 ? t("closed") : v === 100 ? t("open") : `${v}%`}</span>
                  </div>
                  <input
                    className="ch-slider cyan"
                    type="range"
                    min="0"
                    max="100"
                    value={v}
                    onChange={(e) => setShade(room.id, s.id, Number(e.target.value))}
                    style={{
                      background: `linear-gradient(90deg, var(--ch-cyan) ${v}%, var(--ch-surface-2) ${v}%)`,
                    }}
                  />
                  <div className="ch-shade-ctrl">
                    <button onClick={() => setShade(room.id, s.id, 100)}>
                      {icon("ArrowUp", 16)} {t("up")}
                    </button>
                    <button onClick={() => setShade(room.id, s.id, 50)}>{t("stop")}</button>
                    <button onClick={() => setShade(room.id, s.id, 0)}>
                      {icon("ArrowDown", 16)} {t("down")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const renderClimateSheet = (room) => {
    const cl = climate[room.id];
    if (!cl) return null;
    const modeLabel = cl.mode === "heat" ? t("mode_heat") : cl.mode === "cool" ? t("mode_cool") : t("mode_auto");
    return (
      <>
        {sheetHeader(t("climate"), roomName(room))}
        <div className="ch-sheet-body">
          <div className="ch-eyebrow">{t("climate_controls")}</div>

          <div className="ch-dial-wrap">
            <div className="ch-dial" style={{ width: wall ? 186 : 210, height: wall ? 186 : 210 }}>
              <Dial value={cl.set} mode={cl.mode} size={wall ? 186 : 210} />
              <div className="ch-dial-mode">
                {icon(cl.mode === "heat" ? "Flame" : "Snowflake", 20, cl.mode === "heat" ? "ch-ic-coral" : "ch-ic-cyan")}
              </div>
              <div className="ch-dial-val">
                <b>{cl.temp.toFixed(1)}</b>
                <small>{t("current")} °C</small>
              </div>
              <div className="ch-dial-fan">{icon("Fan", 18)}</div>
            </div>
          </div>

          <div className="ch-setrow">
            <button className="ch-step" onClick={() => patchClimate(room.id, { set: clamp(cl.set - 0.5, 16, 30) })}>
              {icon("Minus", 22)}
            </button>
            <div className="ch-sp">
              <b>{cl.set.toFixed(1)} °C</b>
              <span>{cl.mode === "heat" ? t("heat_to") : t("cool_to")}</span>
            </div>
            <button className="ch-step" onClick={() => patchClimate(room.id, { set: clamp(cl.set + 0.5, 16, 30) })}>
              {icon("Plus", 22)}
            </button>
          </div>

          <div className="ch-modes">
            <button
              onClick={() =>
                patchClimate(room.id, { mode: cl.mode === "heat" ? "cool" : cl.mode === "cool" ? "auto" : "heat" })
              }
            >
              <b>{modeLabel}</b>
              <span>{t("mode")}</span>
            </button>
            <button onClick={() => patchClimate(room.id, { fan: cl.fan === "auto" ? "on" : "auto" })}>
              <b>{cl.fan === "auto" ? t("fan_auto") : t("fan_on")}</b>
              <span>{t("fan")}</span>
            </button>
            <button onClick={() => patchClimate(room.id, { hold: !cl.hold })}>
              <b>{cl.hold ? t("sched_hold") : t("sched_running")}</b>
              <span>{t("schedule")}</span>
            </button>
          </div>

          <div className="ch-hum">
            {icon("Droplet", 20, "ch-ic-cyan")}
            <b>{t("humidity")}</b>
            <span className="ch-hum-val">{cl.hum}%</span>
            <button
              className={`ch-switch ${cl.humCtrl ? "on" : ""}`}
              onClick={() => patchClimate(room.id, { humCtrl: !cl.humCtrl })}
              aria-label={t("humidity_ctrl")}
            />
          </div>
        </div>
      </>
    );
  };

  const renderVideoSheet = () => {
    const target = displays[videoTarget];
    return (
      <>
        {sheetHeader(t("video"), t("screens"))}
        <div className="ch-sheet-body">
          <div className="ch-list" style={{ marginBottom: 18 }}>
            {DISPLAYS.map((d) => {
              const st = displays[d.id];
              const src = SOURCES.find((s) => s.id === st.source);
              return (
                <button
                  key={d.id}
                  className={`ch-row ${st.on ? "on" : ""}`}
                  onClick={() => setVideoTarget(d.id)}
                >
                  {icon("Tv", 20, st.on ? "ch-ic-violet" : "ch-ic-muted")}
                  <span className="ch-row-txt">
                    <b>{d.label}</b>
                    <span>{st.on && src ? src.label : t("inactive")}</span>
                  </span>
                  <span
                    className={`ch-row-power ${st.on ? "on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisplays((p) => ({
                        ...p,
                        [d.id]: p[d.id].on ? { on: false, source: null } : { on: true, source: "tv" },
                      }));
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => {}}
                  >
                    {icon("Power", 17)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ch-eyebrow">{t("source_select")}</div>
          <div className="ch-list" style={{ marginBottom: 18 }}>
            {SOURCES.map((s) => (
              <button
                key={s.id}
                className={`ch-row ${target.source === s.id ? "on" : ""}`}
                onClick={() => setDisplays((p) => ({ ...p, [videoTarget]: { on: true, source: s.id } }))}
              >
                {icon(s.icon, 20, target.source === s.id ? "ch-ic-violet" : "ch-ic-muted")}
                <span className="ch-row-txt">
                  <b>{s.label}</b>
                </span>
                {target.source === s.id && icon("Check", 18, "ch-ic-violet")}
              </button>
            ))}
          </div>

          {target.on && target.source === "tv" && (
            <>
              <div className="ch-eyebrow">{t("channels")}</div>
              <div className="ch-ch-grid">
                {CHANNELS.map((c) => (
                  <button
                    key={c.n}
                    className={`ch-ch ${channel === c.n ? "on" : ""}`}
                    onClick={() => setChannel(c.n)}
                  >
                    <b>{c.label}</b>
                    <span>{c.n}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderMusicSheet = () => (
    <>
      {sheetHeader(t("select_music"), t("music"))}
      <div className="ch-sheet-body">
        <div className="ch-eyebrow">{t("music_services")}</div>
        <div className="ch-services">
          {MUSIC_SERVICES.map((s) => (
            <button
              key={s.id}
              className={`ch-service ${music.sub.startsWith(s.label) ? "on" : ""}`}
              onClick={() => setMusic((m) => ({ ...m, sub: `${s.label} · ${t("room_living")}`, playing: true }))}
            >
              <i>{icon(s.icon, 24)}</i>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="ch-eyebrow">{t("favorites")}</div>
        <div className="ch-fav-grid" style={{ marginBottom: 20 }}>
          {MUSIC_FAVS.map((f) => (
            <button
              key={f.id}
              className="ch-fav-card"
              onClick={() =>
                setMusic((m) => ({
                  ...m,
                  playing: true,
                  title: f.title,
                  sub: `${f.sub} · ${t("room_living")}`,
                  tint: f.tint,
                }))
              }
            >
              <span className="ch-art" style={{ background: f.tint }}>
                {f.title.charAt(0)}
              </span>
              <span>
                <b>{f.title}</b>
                <span>{f.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="ch-eyebrow">{t("now_playing")}</div>
        <div className="ch-player">
          <div className="ch-player-art" style={{ background: music.tint }}>
            {music.title.charAt(0)}
          </div>
          <div className="ch-player-meta">
            <h4>{music.title}</h4>
            <p>{music.sub}</p>
            <div className="ch-transport">
              <button className="ch-iconbtn ghost">{icon("SkipBack", 22)}</button>
              <button className="ch-play" onClick={() => setMusic((m) => ({ ...m, playing: !m.playing }))}>
                {icon(music.playing ? "Pause" : "Play", 24)}
              </button>
              <button className="ch-iconbtn ghost">{icon("SkipForward", 22)}</button>
            </div>
          </div>
        </div>

        <div className="ch-volrow">
          <button onClick={() => setMusic((m) => ({ ...m, volume: 0 }))} aria-label={t("volume")}>
            {icon(music.volume === 0 ? "VolumeX" : "Volume2", 20, "ch-ic-muted")}
          </button>
          <input
            className="ch-slider"
            type="range"
            min="0"
            max="100"
            value={music.volume}
            onChange={(e) => setMusic((m) => ({ ...m, volume: Number(e.target.value) }))}
            style={{
              background: `linear-gradient(90deg, var(--ch-violet) ${music.volume}%, var(--ch-surface-2) ${music.volume}%)`,
            }}
          />
          <b style={{ minWidth: 34, textAlign: "right", fontSize: "0.85rem" }}>{music.volume}</b>
        </div>
      </div>
    </>
  );

  const renderSettingsSheet = () => (
    <>
      {sheetHeader(t("manage"), clientName || t("home_name"))}
      <div className="ch-sheet-body">
        <div className="ch-eyebrow">{t("appearance")}</div>
        <div className="ch-list" style={{ marginBottom: 18 }}>
          <div className="ch-row">
            {icon(theme === "dark" ? "Moon" : "Sun", 20, "ch-ic-violet")}
            <span className="ch-row-txt">
              <b>{theme === "dark" ? t("theme_dark") : t("theme_light")}</b>
            </span>
            <button
              className={`ch-switch ${theme === "dark" ? "on" : ""}`}
              onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
              aria-label={t("appearance")}
            />
          </div>
        </div>

        <div className="ch-eyebrow">{t("show_controls")}</div>
        <div className="ch-list" style={{ marginBottom: 18 }}>
          {[
            ["lights", "lights", "Lightbulb"],
            ["shades", "shades", "Blinds"],
            ["climate", "climate", "Thermometer"],
            ["media", "music", "Music"],
            ["access", "access", "Lock"],
            ["pool", "pool", "Waves"],
          ].map(([id, key, ic]) => (
            <div className="ch-row" key={id}>
              {icon(ic, 20, "ch-ic-muted")}
              <span className="ch-row-txt">
                <b>{t(key)}</b>
              </span>
              <button
                className={`ch-switch ${showControls[id] ? "on" : ""}`}
                onClick={() => setShowControls((p) => ({ ...p, [id]: !p[id] }))}
                aria-label={t(key)}
              />
            </div>
          ))}
        </div>

        <div className="ch-eyebrow">{t("show_rooms")}</div>
        <div className="ch-list">
          {ROOMS.map((r) => (
            <div className="ch-row" key={r.id}>
              <span className="ch-row-txt">
                <b>{roomName(r)}</b>
                <span>{t(FLOORS.find((f) => f.id === r.floor).key)}</span>
              </span>
              <button
                className={`ch-switch ${favs.has(r.id) ? "on" : ""}`}
                onClick={() => toggleFav(r.id)}
                aria-label={roomName(r)}
              />
            </div>
          ))}
        </div>

        <p className="ch-note">{t("demo_note")}</p>
      </div>
    </>
  );

  const renderSheet = () => {
    if (!sheet) return null;
    let content = null;
    if (sheet.type === "lights" && sheetRoom) content = renderLightsSheet(sheetRoom);
    else if (sheet.type === "shades" && sheetRoom) content = renderShadesSheet(sheetRoom);
    else if (sheet.type === "climate" && sheetRoom) content = renderClimateSheet(sheetRoom);
    else if (sheet.type === "video") content = renderVideoSheet();
    else if (sheet.type === "music") content = renderMusicSheet();
    else if (sheet.type === "settings") content = renderSettingsSheet();
    if (!content) return null;
    return (
      <div className="ch-scrim" onClick={closeSheet}>
        <div className="ch-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="ch-grabber" />
          {content}
        </div>
      </div>
    );
  };

  // ---- Titre et bouton gauche de la barre ---------------------------------
  const inRoomDetail = tab === "rooms" && currentRoom;
  const title = inRoomDetail ? roomName(currentRoom) : tab === "home" ? clientName || t("home_name") : t("nav_rooms");

  return (
    <div className={`ch-home ${deviceType} ${theme}`}>
      {/* Barre d'état iOS (téléphone / tablette) */}
      <div className="ch-statusbar">
        <span>9:41</span>
        <span className="ch-sb-right">
          {icon("Wifi", 13)}
          <span className="ch-battery">86</span>
        </span>
      </div>

      {/* Bandeau propre à la dalle murale */}
      <div className="ch-panelbar">
        <strong>9:41</strong>
        <span>{clientName || t("home_name")}</span>
        <span className="ch-panelbar-sep" />
        <span>TSW-1070</span>
      </div>

      <div className="ch-topbar">
        {inRoomDetail ? (
          <button className="ch-iconbtn" onClick={() => setOpenRoom(null)} aria-label={t("back")}>
            {icon("ChevronLeft", 20)}
          </button>
        ) : (
          <span className="ch-iconbtn spacer" />
        )}
        <h2>{title}</h2>
        <button className="ch-iconbtn" onClick={() => openSheet("settings")} aria-label={t("settings")}>
          {icon("Settings", 18)}
        </button>
      </div>

      <div className="ch-body">
        {tab === "home" && renderHome()}
        {tab === "rooms" && !currentRoom && renderRooms()}
        {inRoomDetail && renderRoomDetail(currentRoom)}
      </div>

      {music.playing && (
        <button className="ch-miniplayer" onClick={() => openSheet("music")}>
          {icon("ChevronUp", 16, "ch-ic-muted")}
          <span>
            {music.title} — {music.sub}
          </span>
          <span className="ch-eq">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      )}

      <div className="ch-tabbar">
        <button
          className={`ch-tab ${tab === "home" ? "on" : ""}`}
          onClick={() => {
            setTab("home");
            setOpenRoom(null);
          }}
        >
          {icon("Home", compact ? 20 : 22)}
          {!compact && t("nav_home")}
        </button>
        <button
          className={`ch-tab ${tab === "rooms" ? "on" : ""}`}
          onClick={() => {
            setTab("rooms");
            setOpenRoom(null);
          }}
        >
          {icon("LayoutGrid", compact ? 20 : 22)}
          {!compact && t("nav_rooms")}
        </button>
      </div>

      {renderSheet()}
    </div>
  );
};

export default CrestronHome;
