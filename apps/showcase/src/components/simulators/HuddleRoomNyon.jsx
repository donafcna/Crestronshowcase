import React, { useEffect, useMemo, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./huddleRoom.css";

// Huddle room "one-touch" — Nyon Innovation Hub. Inspiré de "Bright
// Conference Space" (AVstudio) : thème clair, un geste pour rejoindre la
// réunion, partage sans fil, caméra à cadrage automatique. Tout est local.

const T = {
  fr: {
    free: "Libre", busy: "Occupée", until: "jusqu'à", meeting: "Réunion", present: "Présenter", av: "Caméra & son", room: "Salle",
    join: "Rejoindre", joinNow: "Rejoindre maintenant", inCall: "En réunion", leave: "Quitter", next: "Prochaine réunion", agenda: "Agenda du jour",
    startsIn: "commence dans", min: "min", now: "en cours", adhoc: "Réunion instantanée", book: "Réserver la salle", booked: "Réservée", extend: "Prolonger",
    wireless: "Partage sans fil", code: "Code de session", connect: "Connectez-vous à", presenting: "Présentation en cours", stop: "Arrêter", hdmi: "HDMI table", airmedia: "AirMedia",
    display: "Écran", camera: "Caméra", autoframe: "Cadrage automatique", preset: "Préréglage", wide: "Large", presenter: "Présentateur", table: "Table", mic: "Micro", mute: "Couper", unmute: "Activer", volume: "Volume",
    occupancy: "Occupation", people: "personnes", temp: "Température", air: "Qualité de l'air", good: "Bonne", light: "Éclairage", blinds: "Stores", open: "Ouverts", closed: "Fermés",
    on: "Allumé", off: "Éteint", scene: "Ambiance", sceneMeeting: "Réunion", sceneVideo: "Visio", sceneOff: "Éteint", help: "Assistance", report: "Signaler un problème", reported: "Ticket envoyé au support IT",
    freeAll: "Libre tout l'après-midi", organizer: "Organisateur",
  },
  en: {
    free: "Available", busy: "In use", until: "until", meeting: "Meeting", present: "Present", av: "Camera & audio", room: "Room",
    join: "Join", joinNow: "Join now", inCall: "In meeting", leave: "Leave", next: "Next meeting", agenda: "Today's agenda",
    startsIn: "starts in", min: "min", now: "in progress", adhoc: "Instant meeting", book: "Book the room", booked: "Booked", extend: "Extend",
    wireless: "Wireless presenting", code: "Session code", connect: "Connect to", presenting: "Presenting", stop: "Stop", hdmi: "Table HDMI", airmedia: "AirMedia",
    display: "Display", camera: "Camera", autoframe: "Auto framing", preset: "Preset", wide: "Wide", presenter: "Presenter", table: "Table", mic: "Microphone", mute: "Mute", unmute: "Unmute", volume: "Volume",
    occupancy: "Occupancy", people: "people", temp: "Temperature", air: "Air quality", good: "Good", light: "Lighting", blinds: "Blinds", open: "Open", closed: "Closed",
    on: "On", off: "Off", scene: "Scene", sceneMeeting: "Meeting", sceneVideo: "Video call", sceneOff: "Off", help: "Support", report: "Report an issue", reported: "Ticket sent to IT support",
    freeAll: "Free all afternoon", organizer: "Organiser",
  },
  de: {
    free: "Frei", busy: "Belegt", until: "bis", meeting: "Meeting", present: "Präsentieren", av: "Kamera & Ton", room: "Raum",
    join: "Beitreten", joinNow: "Jetzt beitreten", inCall: "Im Meeting", leave: "Verlassen", next: "Nächstes Meeting", agenda: "Heutige Agenda",
    startsIn: "beginnt in", min: "Min.", now: "läuft", adhoc: "Sofort-Meeting", book: "Raum buchen", booked: "Gebucht", extend: "Verlängern",
    wireless: "Drahtlos präsentieren", code: "Sitzungscode", connect: "Verbinden mit", presenting: "Präsentation läuft", stop: "Beenden", hdmi: "HDMI Tisch", airmedia: "AirMedia",
    display: "Display", camera: "Kamera", autoframe: "Auto-Framing", preset: "Voreinstellung", wide: "Weit", presenter: "Referent", table: "Tisch", mic: "Mikrofon", mute: "Stumm", unmute: "Ton an", volume: "Lautstärke",
    occupancy: "Belegung", people: "Personen", temp: "Temperatur", air: "Luftqualität", good: "Gut", light: "Beleuchtung", blinds: "Jalousien", open: "Offen", closed: "Geschlossen",
    on: "Ein", off: "Aus", scene: "Szene", sceneMeeting: "Meeting", sceneVideo: "Videocall", sceneOff: "Aus", help: "Support", report: "Problem melden", reported: "Ticket an IT-Support gesendet",
    freeAll: "Ganzen Nachmittag frei", organizer: "Organisator",
  },
};

const PLATFORMS = { teams: { name: "Microsoft Teams", color: "#5b5fc7" }, zoom: { name: "Zoom", color: "#0b5cff" }, meet: { name: "Google Meet", color: "#00897b" } };

export const HuddleRoomNyon = ({ deviceType, clientName }) => {
  const { lang } = useTranslation();
  const t = (k) => (T[lang] || T.fr)[k] || T.fr[k];
  const isPhone = deviceType === "phone";

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  // Agenda simulé, calé sur l'heure réelle : une réunion démarre dans 7 min.
  const meetings = useMemo(() => {
    const base = new Date(now);
    base.setSeconds(0, 0);
    const mk = (offsetMin, dur, title, platform, org) => {
      const s = new Date(base.getTime() + offsetMin * 60000);
      return { id: `${offsetMin}`, start: s, end: new Date(s.getTime() + dur * 60000), title, platform, org };
    };
    return [
      mk(-90, 45, { fr: "Point produit hebdo", en: "Weekly product sync", de: "Wöchentlicher Produkt-Sync" }, "teams", "S. Martin"),
      mk(7, 30, { fr: "Revue design — app mobile", en: "Design review — mobile app", de: "Design-Review — Mobile App" }, "teams", "A. Rossi"),
      mk(60, 45, { fr: "Entretien candidat (Zoom)", en: "Candidate interview (Zoom)", de: "Bewerbungsgespräch (Zoom)" }, "zoom", "L. Dubois"),
      mk(150, 30, { fr: "Sync partenaires", en: "Partner sync", de: "Partner-Sync" }, "meet", "K. Weber"),
    ];
  }, [now]);

  const [tab, setTab] = useState("meeting");
  const [call, setCall] = useState(null); // meeting id | "adhoc"
  const [callSec, setCallSec] = useState(0);
  const [presenting, setPresenting] = useState(null); // "airmedia" | "hdmi"
  const [code] = useState(() => String(1000 + Math.floor(Math.random() * 9000)));
  const [display, setDisplay] = useState(true);
  const [autoFrame, setAutoFrame] = useState(true);
  const [preset, setPreset] = useState("wide");
  const [micMuted, setMicMuted] = useState(false);
  const [volume, setVolume] = useState(55);
  const [scene, setScene] = useState("meeting");
  const [blinds, setBlinds] = useState("open");
  const [booked, setBooked] = useState(null); // minutes
  const [reported, setReported] = useState(false);
  const [people, setPeople] = useState(3);

  useEffect(() => {
    if (!call) { setCallSec(0); return; }
    const id = setInterval(() => setCallSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [call]);

  useEffect(() => {
    const id = setInterval(() => setPeople((p) => Math.max(1, Math.min(6, p + (Math.random() > 0.5 ? 1 : -1)))), 12000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = (d) => d.toLocaleTimeString(lang === "en" ? "en-GB" : lang === "de" ? "de-CH" : "fr-CH", { hour: "2-digit", minute: "2-digit" });
  const fmtDur = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const minutesTo = (d) => Math.round((d - now) / 60000);
  const next = meetings.find((m) => m.end > now);
  const current = meetings.find((m) => m.start <= now && m.end > now);
  const inCall = !!call;
  const roomBusy = inCall || !!current || !!booked;
  const busyUntil = call && call !== "adhoc" ? meetings.find((m) => m.id === call)?.end : booked ? new Date(now.getTime() + booked * 60000) : current?.end;

  const joinMeeting = (id) => {
    setCall(id);
    setDisplay(true);
    setScene("video");
    setTab("meeting");
  };
  const leave = () => { setCall(null); setPresenting(null); setScene("meeting"); };

  const Icon = ({ name, size = 18, className = "" }) => {
    const C = Icons[name] || Icons.Circle;
    return <C size={size} className={className} />;
  };

  const NAV = [
    { id: "meeting", icon: "Video", label: t("meeting") },
    { id: "present", icon: "ScreenShare", label: t("present") },
    { id: "av", icon: "Camera", label: t("av") },
    { id: "room", icon: "SunMedium", label: t("room") },
  ];

  const renderMeeting = () => (
    <div className="hr-panel">
      {inCall ? (
        <div className="hr-hero hr-hero-call">
          <div className="hr-hero-left">
            <span className="hr-live"><i />{t("inCall")} · {fmtDur(callSec)}</span>
            <h2>{call === "adhoc" ? t("adhoc") : meetings.find((m) => m.id === call)?.title[lang]}</h2>
            <p>{call === "adhoc" ? "Microsoft Teams" : PLATFORMS[meetings.find((m) => m.id === call)?.platform]?.name} · Crestron Flex · Logitech Rally Bar</p>
            <div className="hr-call-actions">
              <button className={micMuted ? "danger" : ""} onClick={() => setMicMuted((m) => !m)}><Icon name={micMuted ? "MicOff" : "Mic"} /> {micMuted ? t("unmute") : t("mute")}</button>
              <button onClick={() => setAutoFrame((a) => !a)}><Icon name="Video" /> {t("autoframe")} {autoFrame ? "✓" : ""}</button>
              <button className="leave" onClick={leave}><Icon name="PhoneOff" /> {t("leave")}</button>
            </div>
          </div>
          <div className="hr-call-preview">
            <div className="hr-tile main"><Icon name="Users" size={28} /></div>
            <div className="hr-tile"><Icon name="User" size={18} /></div>
            <div className="hr-tile"><Icon name="User" size={18} /></div>
            <div className={`hr-tile self ${micMuted ? "muted" : ""}`}><Icon name={micMuted ? "MicOff" : "Mic"} size={14} /></div>
          </div>
        </div>
      ) : next ? (
        <div className="hr-hero">
          <div className="hr-hero-left">
            <span className="hr-eyebrow" style={{ color: PLATFORMS[next.platform].color }}>{PLATFORMS[next.platform].name} · {current ? t("now") : `${t("startsIn")} ${minutesTo(next.start)} ${t("min")}`}</span>
            <h2>{next.title[lang]}</h2>
            <p>{fmtTime(next.start)} – {fmtTime(next.end)} · {t("organizer")} : {next.org}</p>
          </div>
          <button className="hr-join" onClick={() => joinMeeting(next.id)}>
            <Icon name="Video" size={isPhone ? 24 : 30} />
            <span>{t("joinNow")}</span>
          </button>
        </div>
      ) : null}

      <div className="hr-grid-2">
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="Calendar" size={16} /> {t("agenda")}</div>
          <div className="hr-agenda">
            {meetings.map((m) => {
              const past = m.end <= now;
              const live = m.start <= now && m.end > now;
              return (
                <div key={m.id} className={`hr-meeting ${past ? "past" : ""} ${live ? "live" : ""}`}>
                  <div className="hr-meeting-time">{fmtTime(m.start)}<small>{fmtTime(m.end)}</small></div>
                  <div className="hr-meeting-body">
                    <div className="hr-meeting-title">{m.title[lang]}</div>
                    <div className="hr-meeting-sub"><i style={{ background: PLATFORMS[m.platform].color }} />{PLATFORMS[m.platform].name} · {m.org}</div>
                  </div>
                  {!past && call !== m.id && <button className="hr-small-join" onClick={() => joinMeeting(m.id)}>{t("join")}</button>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="CalendarPlus" size={16} /> {t("book")}</div>
          <div className="hr-book">
            {[15, 30, 60].map((m) => (
              <button key={m} className={booked === m ? "active" : ""} onClick={() => setBooked(booked === m ? null : m)}>+{m} {t("min")}</button>
            ))}
          </div>
          <button className="hr-adhoc" onClick={() => joinMeeting("adhoc")} disabled={inCall}><Icon name="Zap" size={16} /> {t("adhoc")}</button>
          <div className="hr-card-title" style={{ marginTop: 14 }}><Icon name="HelpCircle" size={16} /> {t("help")}</div>
          <button className={`hr-report ${reported ? "done" : ""}`} onClick={() => setReported(true)}>
            <Icon name={reported ? "CheckCircle" : "AlertTriangle"} size={16} /> {reported ? t("reported") : t("report")}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPresent = () => (
    <div className="hr-panel">
      <div className="hr-grid-2">
        <div className={`hr-card hr-share ${presenting === "airmedia" ? "active" : ""}`}>
          <div className="hr-card-title"><Icon name="Cast" size={16} /> {t("wireless")} · {t("airmedia")}</div>
          <div className="hr-code-label">{t("connect")} <strong>airmedia-nyon-01.local</strong></div>
          <div className="hr-code">{code.split("").map((c, i) => <span key={i}>{c}</span>)}</div>
          <div className="hr-code-label">{t("code")}</div>
          <button className="hr-primary" onClick={() => setPresenting(presenting === "airmedia" ? null : "airmedia")}>
            <Icon name={presenting === "airmedia" ? "Square" : "ScreenShare"} size={16} /> {presenting === "airmedia" ? t("stop") : t("present")}
          </button>
        </div>
        <div className={`hr-card hr-share ${presenting === "hdmi" ? "active" : ""}`}>
          <div className="hr-card-title"><Icon name="Plug" size={16} /> {t("hdmi")}</div>
          <div className="hr-hdmi-visual"><Icon name="Monitor" size={40} /><span>4K · 60 Hz</span></div>
          <button className="hr-primary ghost" onClick={() => setPresenting(presenting === "hdmi" ? null : "hdmi")}>
            <Icon name={presenting === "hdmi" ? "Square" : "Play"} size={16} /> {presenting === "hdmi" ? t("stop") : t("present")}
          </button>
        </div>
      </div>
      <div className="hr-card hr-display-card">
        <div className="hr-display-preview">
          <div className={`hr-display-screen ${display ? "on" : "off"}`}>
            {display ? (presenting ? <><Icon name="ScreenShare" size={26} /><span>{t("presenting")} · {presenting === "hdmi" ? t("hdmi") : t("airmedia")}</span></> : <span className="hr-idle">Nyon Innovation Hub · {fmtTime(now)}</span>) : <span className="hr-idle">{t("off")}</span>}
          </div>
        </div>
        <div className="hr-display-side">
          <div className="hr-card-title"><Icon name="Monitor" size={16} /> {t("display")} · Samsung 75"</div>
          <div className="hr-seg">
            <button className={display ? "active" : ""} onClick={() => setDisplay(true)}>{t("on")}</button>
            <button className={!display ? "active" : ""} onClick={() => setDisplay(false)}>{t("off")}</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAV = () => (
    <div className="hr-panel">
      <div className="hr-grid-2">
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="Camera" size={16} /> {t("camera")} · Rally Bar</div>
          <div className="hr-cam-preview">
            <div className={`hr-cam-frame ${preset} ${autoFrame ? "auto" : ""}`}>
              <div className="hr-cam-people"><Icon name="Users" size={22} /></div>
              <div className="hr-cam-box" />
            </div>
          </div>
          <div className="hr-row">
            <span>{t("autoframe")}</span>
            <button className={`hr-toggle ${autoFrame ? "on" : ""}`} onClick={() => setAutoFrame((a) => !a)}><i /></button>
          </div>
          <div className="hr-row">
            <span>{t("preset")}</span>
            <div className="hr-seg">
              {[["wide", t("wide")], ["presenter", t("presenter")], ["table", t("table")]].map(([id, l]) => (
                <button key={id} className={preset === id && !autoFrame ? "active" : ""} onClick={() => { setPreset(id); setAutoFrame(false); }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="Mic" size={16} /> {t("mic")} · Shure MXA920</div>
          <button className={`hr-mute ${micMuted ? "muted" : ""}`} onClick={() => setMicMuted((m) => !m)}>
            <Icon name={micMuted ? "MicOff" : "Mic"} size={30} />
            <span>{micMuted ? t("unmute") : t("mute")}</span>
          </button>
          <div className="hr-card-title" style={{ marginTop: 16 }}><Icon name="Volume2" size={16} /> {t("volume")} · {volume}</div>
          <div className="hr-volume">
            <button onClick={() => setVolume((v) => Math.max(0, v - 5))}><Icon name="Minus" size={16} /></button>
            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ "--val": `${volume}%` }} />
            <button onClick={() => setVolume((v) => Math.min(100, v + 5))}><Icon name="Plus" size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoom = () => (
    <div className="hr-panel">
      <div className="hr-stats">
        <div className="hr-stat"><Icon name="Users" /><div><b>{people}</b><span>{t("occupancy")} · {t("people")}</span></div></div>
        <div className="hr-stat"><Icon name="Thermometer" /><div><b>21.5 °C</b><span>{t("temp")}</span></div></div>
        <div className="hr-stat"><Icon name="Leaf" /><div><b>612 ppm</b><span>{t("air")} · {t("good")}</span></div></div>
      </div>
      <div className="hr-grid-2">
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="Lightbulb" size={16} /> {t("light")} · {t("scene")}</div>
          <div className="hr-scenes">
            {[["meeting", "SunMedium", t("sceneMeeting")], ["video", "Video", t("sceneVideo")], ["off", "Power", t("sceneOff")]].map(([id, ic, l]) => (
              <button key={id} className={scene === id ? "active" : ""} onClick={() => setScene(id)}><Icon name={ic} size={20} /><span>{l}</span></button>
            ))}
          </div>
        </div>
        <div className="hr-card">
          <div className="hr-card-title"><Icon name="Blinds" size={16} /> {t("blinds")}</div>
          <div className="hr-blinds">
            <div className={`hr-blind-visual ${blinds}`}>{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div>
            <div className="hr-seg vertical">
              <button className={blinds === "open" ? "active" : ""} onClick={() => setBlinds("open")}><Icon name="ChevronUp" size={16} /> {t("open")}</button>
              <button className={blinds === "closed" ? "active" : ""} onClick={() => setBlinds("closed")}><Icon name="ChevronDown" size={16} /> {t("closed")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PANELS = { meeting: renderMeeting, present: renderPresent, av: renderAV, room: renderRoom };

  return (
    <div className={`gemini-ui-root huddle-room-ui ${deviceType} scene-${scene}`}>
      <header className="hr-header">
        <div className="hr-room-id">
          <div className={`hr-status-dot ${roomBusy ? "busy" : "free"}`} />
          <div>
            <div className="hr-room-name">{clientName || "Nyon Innovation Hub"} · {t("room")} Léman</div>
            <div className="hr-room-state">{roomBusy ? t("busy") : t("free")} {busyUntil ? `${t("until")} ${fmtTime(busyUntil)}` : `· ${t("freeAll")}`}</div>
          </div>
        </div>
        <div className="hr-header-right">
          {micMuted && <span className="hr-chip danger"><Icon name="MicOff" size={12} /> {t("mute")}</span>}
          {presenting && <span className="hr-chip"><Icon name="ScreenShare" size={12} /> {t("presenting")}</span>}
          <span className="hr-clock">{fmtTime(now)}</span>
        </div>
      </header>

      <div className="hr-body">
        {!isPhone && (
          <nav className="hr-nav">
            {NAV.map((n) => (
              <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>
            ))}
          </nav>
        )}
        <main className="hr-main">{PANELS[tab]()}</main>
      </div>

      {isPhone && (
        <nav className="hr-tabbar">
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={20} /><span>{n.label}</span></button>
          ))}
        </nav>
      )}
    </div>
  );
};
