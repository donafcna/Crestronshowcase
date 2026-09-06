import React, { useEffect, useMemo, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./homeCinema.css";

// Home Cinéma privé — salle dédiée (Cologny, GE). Inspiré du showcase
// "Home Cinema" d'AVstudio : sélection de médias sans effort, tout au même
// endroit. Tout le feedback est local (état React).

const T = {
  fr: {
    room: "Salle de cinéma",
    watch: "Regarder",
    sources: "Sources",
    lights: "Lumières",
    audio: "Audio",
    seats: "Sièges",
    off: "Tout éteindre",
    nowPlaying: "En lecture",
    projector: "Projecteur",
    screen: "Écran",
    masking: "Masquage",
    lens: "Mémoire optique",
    warming: "Préchauffage…",
    ready: "Prêt",
    standby: "Veille",
    volume: "Volume",
    sub: "Caisson",
    mode: "Mode sonore",
    dimAll: "Ambiance",
    heat: "Chauffage",
    recline: "Inclinaison",
    all: "Tous",
    on: "ON",
    offShort: "OFF",
    scenePrepare: "Préparation de la salle…",
    activities: "Activités",
    playing: "Lecture",
    paused: "Pause",
    seatRow: "Rangée",
    quick: "Raccourcis",
  },
  en: {
    room: "Cinema room",
    watch: "Watch",
    sources: "Sources",
    lights: "Lights",
    audio: "Audio",
    seats: "Seats",
    off: "All off",
    nowPlaying: "Now playing",
    projector: "Projector",
    screen: "Screen",
    masking: "Masking",
    lens: "Lens memory",
    warming: "Warming up…",
    ready: "Ready",
    standby: "Standby",
    volume: "Volume",
    sub: "Subwoofer",
    mode: "Sound mode",
    dimAll: "Ambience",
    heat: "Heating",
    recline: "Recline",
    all: "All",
    on: "ON",
    offShort: "OFF",
    scenePrepare: "Preparing the room…",
    activities: "Activities",
    playing: "Playing",
    paused: "Paused",
    seatRow: "Row",
    quick: "Shortcuts",
  },
  de: {
    room: "Kinosaal",
    watch: "Ansehen",
    sources: "Quellen",
    lights: "Licht",
    audio: "Audio",
    seats: "Sitze",
    off: "Alles aus",
    nowPlaying: "Läuft gerade",
    projector: "Projektor",
    screen: "Leinwand",
    masking: "Maskierung",
    lens: "Objektivspeicher",
    warming: "Aufwärmen…",
    ready: "Bereit",
    standby: "Standby",
    volume: "Lautstärke",
    sub: "Subwoofer",
    mode: "Klangmodus",
    dimAll: "Ambiente",
    heat: "Heizung",
    recline: "Neigung",
    all: "Alle",
    on: "EIN",
    offShort: "AUS",
    scenePrepare: "Saal wird vorbereitet…",
    activities: "Aktivitäten",
    playing: "Wiedergabe",
    paused: "Pause",
    seatRow: "Reihe",
    quick: "Schnellzugriff",
  },
};

const ACTIVITIES = [
  { id: "movie", icon: "Clapperboard", label: { fr: "Film", en: "Movie", de: "Film" }, source: "kaleidescape", lights: { ambience: 5, steps: 20, sconces: 0, stars: 35 }, mode: "atmos", masking: "2.39" },
  { id: "sport", icon: "Tv", label: { fr: "Sport", en: "Sports", de: "Sport" }, source: "sky", lights: { ambience: 45, steps: 40, sconces: 30, stars: 0 }, mode: "stereo", masking: "16:9" },
  { id: "concert", icon: "Music", label: { fr: "Concert", en: "Concert", de: "Konzert" }, source: "appletv", lights: { ambience: 20, steps: 30, sconces: 15, stars: 60 }, mode: "music", masking: "16:9" },
  { id: "gaming", icon: "Gamepad2", label: { fr: "Jeux", en: "Gaming", de: "Gaming" }, source: "ps5", lights: { ambience: 30, steps: 30, sconces: 10, stars: 20 }, mode: "game", masking: "16:9" },
];

const SOURCES = [
  { id: "kaleidescape", name: "Kaleidescape", icon: "Film", title: "Dune : Deuxième partie", sub: "4K HDR · Dolby Atmos · 2h46", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=70" },
  { id: "appletv", name: "Apple TV 4K", icon: "Play", title: "Coldplay — Live in Buenos Aires", sub: "Apple TV+ · 4K · Spatial Audio", poster: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=70" },
  { id: "sky", name: "Sky Q", icon: "Tv", title: "Formula 1 — GP de Monaco", sub: "Sky Sport F1 · UHD · Direct", poster: "https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=400&q=70" },
  { id: "ps5", name: "PlayStation 5", icon: "Gamepad2", title: "Gran Turismo 7", sub: "4K 120 Hz · VRR · Tempest 3D", poster: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=70" },
];

const LIGHT_ZONES = [
  { id: "ambience", icon: "LampCeiling", label: { fr: "Plafond ambiance", en: "Ceiling ambience", de: "Deckenlicht" } },
  { id: "steps", icon: "Lightbulb", label: { fr: "Marches LED", en: "Step lights", de: "Stufenlicht" } },
  { id: "sconces", icon: "Lamp", label: { fr: "Appliques", en: "Sconces", de: "Wandleuchten" } },
  { id: "stars", icon: "Sparkles", label: { fr: "Ciel étoilé", en: "Star ceiling", de: "Sternenhimmel" } },
];

const SOUND_MODES = [
  { id: "atmos", label: "Dolby Atmos" },
  { id: "dtsx", label: "DTS:X" },
  { id: "music", label: { fr: "Musique", en: "Music", de: "Musik" } },
  { id: "game", label: { fr: "Jeu", en: "Game", de: "Spiel" } },
  { id: "stereo", label: "Stéréo" },
];

const SEATS = [
  { id: 1, row: 1, pos: 1 }, { id: 2, row: 1, pos: 2 }, { id: 3, row: 1, pos: 3 },
  { id: 4, row: 2, pos: 1 }, { id: 5, row: 2, pos: 2 }, { id: 6, row: 2, pos: 3 }, { id: 7, row: 2, pos: 4 },
];

const label = (l, lang) => (typeof l === "string" ? l : l[lang] || l.fr);

export const HomeCinemaCologny = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  const t = (k) => (T[lang] || T.fr)[k] || T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("watch");
  const [activity, setActivity] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [source, setSource] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(1240);
  const [projector, setProjector] = useState("standby"); // standby | warming | ready
  const [masking, setMasking] = useState("16:9");
  const [lights, setLights] = useState({ ambience: 70, steps: 60, sconces: 50, stars: 0 });
  const [volume, setVolume] = useState(38);
  const [sub, setSub] = useState(0);
  const [mode, setMode] = useState("atmos");
  const [muted, setMuted] = useState(false);
  const [seats, setSeats] = useState(() => SEATS.map((s) => ({ ...s, recline: 0, heat: false })));
  const [selectedSeat, setSelectedSeat] = useState(1);

  const currentSource = useMemo(() => SOURCES.find((s) => s.id === source) || null, [source]);

  // Chrono de lecture
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => (p + 1) % 9960), 1000);
    return () => clearInterval(id);
  }, [playing]);

  // Préchauffage projecteur (35 s réel → 3 s démo)
  useEffect(() => {
    if (projector !== "warming") return;
    const id = setTimeout(() => setProjector("ready"), 3000);
    return () => clearTimeout(id);
  }, [projector]);

  const fmt = (s) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const runActivity = (a) => {
    setPreparing(true);
    setActivity(a.id);
    setSource(a.source);
    setMasking(a.masking);
    setMode(a.mode);
    setProjector((p) => (p === "ready" ? "ready" : "warming"));
    setTimeout(() => {
      setLights(a.lights);
      setPlaying(true);
      setPreparing(false);
    }, 900);
  };

  const allOff = () => {
    setActivity(null);
    setPlaying(false);
    setSource(null);
    setProjector("standby");
    setLights({ ambience: 70, steps: 60, sconces: 50, stars: 0 });
    setMasking("16:9");
    setSeats((prev) => prev.map((s) => ({ ...s, recline: 0, heat: false })));
  };

  const setZone = (id, v) => setLights((l) => ({ ...l, [id]: Math.max(0, Math.min(100, v)) }));
  const updateSeat = (id, patch) => setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const Icon = ({ name, size = 18, className = "" }) => {
    const C = Icons[name] || Icons.Circle;
    return <C size={size} className={className} />;
  };

  const NAV = [
    { id: "watch", icon: "Clapperboard", label: t("watch") },
    { id: "sources", icon: "Cast", label: t("sources") },
    { id: "lights", icon: "Lightbulb", label: t("lights") },
    { id: "audio", icon: "AudioLines", label: t("audio") },
    { id: "seats", icon: "Armchair", label: t("seats") },
  ];

  const renderWatch = () => (
    <div className="hc-panel">
      <div className="hc-section-title">{t("activities")}</div>
      <div className="hc-activities">
        {ACTIVITIES.map((a) => (
          <button key={a.id} className={`hc-activity ${activity === a.id ? "active" : ""}`} onClick={() => runActivity(a)}>
            <Icon name={a.icon} size={isPhone ? 22 : 28} />
            <span>{label(a.label, lang)}</span>
          </button>
        ))}
        <button className="hc-activity hc-activity-off" onClick={allOff}>
          <Icon name="Power" size={isPhone ? 22 : 28} />
          <span>{t("off")}</span>
        </button>
      </div>

      <div className="hc-now">
        <div className="hc-poster" style={currentSource ? { backgroundImage: `url(${currentSource.poster})` } : undefined}>
          {!currentSource && <Icon name="Film" size={36} className="hc-poster-empty" />}
        </div>
        <div className="hc-now-info">
          <div className="hc-eyebrow">{preparing ? t("scenePrepare") : t("nowPlaying")}</div>
          <div className="hc-now-title">{currentSource ? currentSource.title : "—"}</div>
          <div className="hc-now-sub">{currentSource ? currentSource.sub : t("standby")}</div>
          <div className="hc-progress">
            <span>{fmt(progress)}</span>
            <div className="hc-progress-bar"><div style={{ width: `${(progress / 9960) * 100}%` }} /></div>
            <span>2:46:00</span>
          </div>
          <div className="hc-transport">
            <button onClick={() => setProgress((p) => Math.max(0, p - 30))}><Icon name="SkipBack" /></button>
            <button className="hc-play" onClick={() => setPlaying((p) => !p)} disabled={!currentSource}>
              <Icon name={playing ? "Pause" : "Play"} size={22} />
            </button>
            <button onClick={() => setProgress((p) => p + 30)}><Icon name="SkipForward" /></button>
            <span className="hc-transport-state">{currentSource ? (playing ? t("playing") : t("paused")) : ""}</span>
          </div>
        </div>
      </div>

      <div className="hc-status-row">
        <div className={`hc-status ${projector}`}>
          <Icon name="Projector" size={16} />
          <div>
            <div className="hc-status-label">{t("projector")} · JVC NZ9</div>
            <div className="hc-status-value">{projector === "ready" ? t("ready") : projector === "warming" ? t("warming") : t("standby")}</div>
          </div>
          <button className="hc-mini-toggle" onClick={() => setProjector((p) => (p === "standby" ? "warming" : "standby"))}>
            {projector === "standby" ? t("on") : t("offShort")}
          </button>
        </div>
        <div className="hc-status">
          <Icon name="Maximize2" size={16} />
          <div>
            <div className="hc-status-label">{t("screen")} · {t("masking")}</div>
            <div className="hc-status-value">{masking}</div>
          </div>
          <div className="hc-seg">
            {["16:9", "2.39"].map((m) => (
              <button key={m} className={masking === m ? "active" : ""} onClick={() => setMasking(m)}>{m}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSources = () => (
    <div className="hc-panel">
      <div className="hc-section-title">{t("sources")}</div>
      <div className="hc-sources">
        {SOURCES.map((s) => (
          <button key={s.id} className={`hc-source ${source === s.id ? "active" : ""}`} onClick={() => { setSource(s.id); setPlaying(true); if (projector === "standby") setProjector("warming"); }}>
            <div className="hc-source-poster" style={{ backgroundImage: `url(${s.poster})` }} />
            <div className="hc-source-body">
              <div className="hc-source-name"><Icon name={s.icon} size={14} /> {s.name}</div>
              <div className="hc-source-title">{s.title}</div>
              <div className="hc-source-sub">{s.sub}</div>
            </div>
            {source === s.id && <Icon name="CheckCircle" size={18} className="hc-source-check" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLights = () => (
    <div className="hc-panel">
      <div className="hc-section-title">{t("lights")}</div>
      <div className="hc-quick">
        <span>{t("quick")}</span>
        <button onClick={() => setLights({ ambience: 70, steps: 60, sconces: 50, stars: 0 })}>100 %</button>
        <button onClick={() => setLights({ ambience: 15, steps: 25, sconces: 10, stars: 40 })}>{t("dimAll")}</button>
        <button onClick={() => setLights({ ambience: 0, steps: 10, sconces: 0, stars: 30 })}>{t("watch")}</button>
        <button onClick={() => setLights({ ambience: 0, steps: 0, sconces: 0, stars: 0 })}>{t("offShort")}</button>
      </div>
      <div className="hc-zones">
        {LIGHT_ZONES.map((z) => (
          <div key={z.id} className={`hc-zone ${lights[z.id] > 0 ? "on" : ""}`}>
            <div className="hc-zone-head">
              <Icon name={z.icon} size={18} />
              <span>{label(z.label, lang)}</span>
              <strong>{lights[z.id]} %</strong>
            </div>
            <div className="hc-zone-ctrl">
              <button onClick={() => setZone(z.id, lights[z.id] - 10)}><Icon name="Minus" size={14} /></button>
              <input type="range" min="0" max="100" value={lights[z.id]} onChange={(e) => setZone(z.id, Number(e.target.value))} style={{ "--val": `${lights[z.id]}%` }} />
              <button onClick={() => setZone(z.id, lights[z.id] + 10)}><Icon name="Plus" size={14} /></button>
              <button className={`hc-zone-power ${lights[z.id] > 0 ? "on" : ""}`} onClick={() => setZone(z.id, lights[z.id] > 0 ? 0 : 60)}><Icon name="Power" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudio = () => (
    <div className="hc-panel">
      <div className="hc-section-title">{t("audio")} · Trinnov Altitude 32</div>
      <div className="hc-audio">
        <div className="hc-volume-card">
          <div className="hc-volume-dial" style={{ "--deg": `${-135 + (volume / 100) * 270}deg` }}>
            <div className="hc-volume-value">{muted ? "—" : volume}</div>
            <div className="hc-volume-unit">{t("volume")}</div>
          </div>
          <div className="hc-volume-btns">
            <button onClick={() => setVolume((v) => Math.max(0, v - 2))}><Icon name="Minus" /></button>
            <button className={muted ? "active" : ""} onClick={() => setMuted((m) => !m)}><Icon name={muted ? "VolumeX" : "Volume2"} /></button>
            <button onClick={() => setVolume((v) => Math.min(100, v + 2))}><Icon name="Plus" /></button>
          </div>
        </div>
        <div className="hc-audio-side">
          <div className="hc-section-sub">{t("mode")}</div>
          <div className="hc-modes">
            {SOUND_MODES.map((m) => (
              <button key={m.id} className={mode === m.id ? "active" : ""} onClick={() => setMode(m.id)}>{label(m.label, lang)}</button>
            ))}
          </div>
          <div className="hc-section-sub">{t("sub")} · {sub > 0 ? "+" : ""}{sub} dB</div>
          <input type="range" min="-10" max="10" value={sub} onChange={(e) => setSub(Number(e.target.value))} className="hc-sub-range" style={{ "--val": `${((sub + 10) / 20) * 100}%` }} />
          <div className="hc-vu">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ height: `${playing && !muted ? 20 + ((i * 37 + volume * 3) % 70) : 8}%`, animationDelay: `${i * 0.07}s` }} className={playing && !muted ? "live" : ""} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeats = () => {
    const seat = seats.find((s) => s.id === selectedSeat);
    return (
      <div className="hc-panel">
        <div className="hc-section-title">{t("seats")} · Cineak</div>
        <div className="hc-seat-map">
          <div className="hc-screen-line">{t("screen")}</div>
          {[1, 2].map((row) => (
            <div key={row} className="hc-seat-row">
              <span className="hc-row-label">{t("seatRow")} {row}</span>
              {seats.filter((s) => s.row === row).map((s) => (
                <button key={s.id} className={`hc-seat ${selectedSeat === s.id ? "selected" : ""} ${s.heat ? "heat" : ""}`} style={{ "--recline": s.recline }} onClick={() => setSelectedSeat(s.id)}>
                  <Icon name="Armchair" size={22} />
                  <em>{s.id}</em>
                </button>
              ))}
            </div>
          ))}
        </div>
        {seat && (
          <div className="hc-seat-ctrl">
            <div className="hc-seat-ctrl-head">{t("seats")} {seat.id} · {t("seatRow")} {seat.row}</div>
            <div className="hc-seat-ctrl-row">
              <span>{t("recline")}</span>
              <div className="hc-seg">
                {[0, 1, 2, 3].map((r) => (
                  <button key={r} className={seat.recline === r ? "active" : ""} onClick={() => updateSeat(seat.id, { recline: r })}>{r === 0 ? t("offShort") : `${r}`}</button>
                ))}
              </div>
            </div>
            <div className="hc-seat-ctrl-row">
              <span>{t("heat")}</span>
              <button className={`hc-toggle ${seat.heat ? "on" : ""}`} onClick={() => updateSeat(seat.id, { heat: !seat.heat })}><i /></button>
            </div>
            <div className="hc-seat-ctrl-row">
              <span>{t("all")}</span>
              <div className="hc-seg">
                <button onClick={() => setSeats((p) => p.map((s) => ({ ...s, recline: 2 })))}>{t("recline")} 2</button>
                <button onClick={() => setSeats((p) => p.map((s) => ({ ...s, heat: true })))}>{t("heat")} {t("on")}</button>
                <button onClick={() => setSeats((p) => p.map((s) => ({ ...s, recline: 0, heat: false })))}>{t("offShort")}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PANELS = { watch: renderWatch, sources: renderSources, lights: renderLights, audio: renderAudio, seats: renderSeats };

  return (
    <div className={`gemini-ui-root home-cinema-ui ${deviceType} ${projector === "ready" && playing ? "dimmed" : ""}`}>
      <div className="hc-bg" />
      <header className="hc-header">
        <div className="hc-brand">
          <Icon name="Film" size={isPhone ? 18 : 22} className="hc-brand-icon" />
          <div>
            <div className="hc-brand-title">{clientName || "Cologny Private Cinema"}</div>
            <div className="hc-brand-sub">{t("room")} · 7 {t("seats").toLowerCase()} · 4K Laser · Atmos 9.4.6</div>
          </div>
        </div>
        <div className="hc-header-right">
          <span className={`hc-pill ${projector}`}><i />{projector === "ready" ? t("ready") : projector === "warming" ? t("warming") : t("standby")}</span>
          {!isPhone && (
            <button className="hc-off-btn" onClick={allOff}><Icon name="Power" size={14} /> {t("off")}</button>
          )}
        </div>
      </header>

      <div className="hc-body">
        {!isPhone && (
          <nav className="hc-nav">
            {NAV.map((n) => (
              <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}>
                <Icon name={n.icon} size={18} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        )}
        <main className="hc-main">{PANELS[tab]()}</main>
      </div>

      {isPhone && (
        <nav className="hc-tabbar">
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={20} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};
