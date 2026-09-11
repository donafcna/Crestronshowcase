import React, { useEffect, useState } from "react";
import { Icons } from "../../icons";
import { useTranslation } from "../../context/LanguageContext";
import "./suitePalace.css";

// Suite d'hôtel multilingue — Palace de Montreux. Inspiré de "GUI Sample
// Multi-Language" et "Modern Nest" (AVstudio) : l'interface possède SON PROPRE
// sélecteur de langue (6 langues), indépendant de la langue du site, comme
// une vraie tablette de chambre. Tout est local.

const LANGS = [
  { id: "fr", flag: "🇫🇷", name: "Français" },
  { id: "en", flag: "🇬🇧", name: "English" },
  { id: "de", flag: "🇩🇪", name: "Deutsch" },
  { id: "it", flag: "🇮🇹", name: "Italiano" },
  { id: "es", flag: "🇪🇸", name: "Español" },
  { id: "ja", flag: "🇯🇵", name: "日本語" },
];

const T = {
  fr: { welcome: "Bienvenue", suite: "Suite Lac Léman · 512", home: "Accueil", climate: "Climat", light: "Lumières", curtains: "Rideaux", media: "Médias", service: "Services", language: "Langue",
    scenes: "Ambiances", wake: "Réveil", read: "Lecture", relax: "Détente", night: "Nuit", off: "Tout éteindre", dnd: "Ne pas déranger", mur: "Faire la chambre", butler: "Appeler le majordome", butlerOk: "Le majordome arrive",
    temp: "Température", setpoint: "Consigne", fan: "Ventilation", auto: "Auto", low: "Faible", high: "Forte", sheer: "Voilage", blackout: "Occultant", open: "Ouvrir", close: "Fermer", stop: "Stop",
    tv: "Télévision", music: "Musique", volume: "Volume", channels: "Chaînes", nowPlaying: "En lecture", roomService: "Room service", breakfast: "Petit-déjeuner en chambre", spa: "Spa & bien-être", book: "Réserver", booked: "Réservé", order: "Commander", ordered: "Commandé",
    time: "Heure", weather: "Montreux", checkout: "Départ", housekeeping: "Ménage", laundry: "Blanchisserie", taxi: "Taxi", requested: "Demandé", guest: "Cher hôte", massage: "Massage 60 min", pool: "Piscine", sauna: "Sauna privé", all: "Tous", ceiling: "Plafond", bedside: "Chevets", bathroom: "Salle de bain", terrace: "Terrasse", greeting: "Nous vous souhaitons un excellent séjour." },
  en: { welcome: "Welcome", suite: "Lake Geneva Suite · 512", home: "Home", climate: "Climate", light: "Lights", curtains: "Curtains", media: "Media", service: "Services", language: "Language",
    scenes: "Scenes", wake: "Wake up", read: "Reading", relax: "Relax", night: "Night", off: "All off", dnd: "Do not disturb", mur: "Make up room", butler: "Call the butler", butlerOk: "Your butler is on the way",
    temp: "Temperature", setpoint: "Setpoint", fan: "Fan", auto: "Auto", low: "Low", high: "High", sheer: "Sheer", blackout: "Blackout", open: "Open", close: "Close", stop: "Stop",
    tv: "Television", music: "Music", volume: "Volume", channels: "Channels", nowPlaying: "Now playing", roomService: "Room service", breakfast: "In-room breakfast", spa: "Spa & wellness", book: "Book", booked: "Booked", order: "Order", ordered: "Ordered",
    time: "Time", weather: "Montreux", checkout: "Check-out", housekeeping: "Housekeeping", laundry: "Laundry", taxi: "Taxi", requested: "Requested", guest: "Dear guest", massage: "60-min massage", pool: "Pool", sauna: "Private sauna", all: "All", ceiling: "Ceiling", bedside: "Bedside", bathroom: "Bathroom", terrace: "Terrace", greeting: "We wish you a wonderful stay." },
  de: { welcome: "Willkommen", suite: "Suite Genfersee · 512", home: "Start", climate: "Klima", light: "Licht", curtains: "Vorhänge", media: "Medien", service: "Service", language: "Sprache",
    scenes: "Szenen", wake: "Aufwachen", read: "Lesen", relax: "Entspannen", night: "Nacht", off: "Alles aus", dnd: "Bitte nicht stören", mur: "Zimmer aufräumen", butler: "Butler rufen", butlerOk: "Ihr Butler ist unterwegs",
    temp: "Temperatur", setpoint: "Sollwert", fan: "Lüftung", auto: "Auto", low: "Niedrig", high: "Hoch", sheer: "Store", blackout: "Verdunkelung", open: "Öffnen", close: "Schliessen", stop: "Stopp",
    tv: "Fernsehen", music: "Musik", volume: "Lautstärke", channels: "Sender", nowPlaying: "Läuft gerade", roomService: "Zimmerservice", breakfast: "Frühstück im Zimmer", spa: "Spa & Wellness", book: "Buchen", booked: "Gebucht", order: "Bestellen", ordered: "Bestellt",
    time: "Uhrzeit", weather: "Montreux", checkout: "Abreise", housekeeping: "Housekeeping", laundry: "Wäscherei", taxi: "Taxi", requested: "Angefragt", guest: "Lieber Gast", massage: "Massage 60 Min.", pool: "Pool", sauna: "Private Sauna", all: "Alle", ceiling: "Decke", bedside: "Nachttische", bathroom: "Bad", terrace: "Terrasse", greeting: "Wir wünschen Ihnen einen wunderbaren Aufenthalt." },
  it: { welcome: "Benvenuti", suite: "Suite Lago Lemano · 512", home: "Home", climate: "Clima", light: "Luci", curtains: "Tende", media: "Media", service: "Servizi", language: "Lingua",
    scenes: "Scene", wake: "Sveglia", read: "Lettura", relax: "Relax", night: "Notte", off: "Spegni tutto", dnd: "Non disturbare", mur: "Rifare la camera", butler: "Chiama il maggiordomo", butlerOk: "Il maggiordomo sta arrivando",
    temp: "Temperatura", setpoint: "Impostazione", fan: "Ventilazione", auto: "Auto", low: "Bassa", high: "Alta", sheer: "Tenda leggera", blackout: "Oscurante", open: "Apri", close: "Chiudi", stop: "Stop",
    tv: "Televisione", music: "Musica", volume: "Volume", channels: "Canali", nowPlaying: "In riproduzione", roomService: "Servizio in camera", breakfast: "Colazione in camera", spa: "Spa & benessere", book: "Prenota", booked: "Prenotato", order: "Ordina", ordered: "Ordinato",
    time: "Ora", weather: "Montreux", checkout: "Check-out", housekeeping: "Pulizie", laundry: "Lavanderia", taxi: "Taxi", requested: "Richiesto", guest: "Gentile ospite", massage: "Massaggio 60 min", pool: "Piscina", sauna: "Sauna privata", all: "Tutte", ceiling: "Soffitto", bedside: "Comodini", bathroom: "Bagno", terrace: "Terrazza", greeting: "Vi auguriamo un soggiorno meraviglioso." },
  es: { welcome: "Bienvenidos", suite: "Suite Lago Lemán · 512", home: "Inicio", climate: "Clima", light: "Luces", curtains: "Cortinas", media: "Medios", service: "Servicios", language: "Idioma",
    scenes: "Escenas", wake: "Despertar", read: "Lectura", relax: "Relax", night: "Noche", off: "Apagar todo", dnd: "No molestar", mur: "Arreglar la habitación", butler: "Llamar al mayordomo", butlerOk: "Su mayordomo está en camino",
    temp: "Temperatura", setpoint: "Consigna", fan: "Ventilación", auto: "Auto", low: "Baja", high: "Alta", sheer: "Visillo", blackout: "Opaca", open: "Abrir", close: "Cerrar", stop: "Parar",
    tv: "Televisión", music: "Música", volume: "Volumen", channels: "Canales", nowPlaying: "Reproduciendo", roomService: "Servicio de habitaciones", breakfast: "Desayuno en la habitación", spa: "Spa y bienestar", book: "Reservar", booked: "Reservado", order: "Pedir", ordered: "Pedido",
    time: "Hora", weather: "Montreux", checkout: "Salida", housekeeping: "Limpieza", laundry: "Lavandería", taxi: "Taxi", requested: "Solicitado", guest: "Estimado huésped", massage: "Masaje 60 min", pool: "Piscina", sauna: "Sauna privada", all: "Todas", ceiling: "Techo", bedside: "Mesillas", bathroom: "Baño", terrace: "Terraza", greeting: "Le deseamos una estancia maravillosa." },
  ja: { welcome: "ようこそ", suite: "レマン湖スイート · 512", home: "ホーム", climate: "空調", light: "照明", curtains: "カーテン", media: "メディア", service: "サービス", language: "言語",
    scenes: "シーン", wake: "起床", read: "読書", relax: "リラックス", night: "おやすみ", off: "すべてオフ", dnd: "起こさないで", mur: "客室清掃", butler: "バトラーを呼ぶ", butlerOk: "バトラーが向かっています",
    temp: "室温", setpoint: "設定温度", fan: "送風", auto: "自動", low: "弱", high: "強", sheer: "レース", blackout: "遮光", open: "開く", close: "閉じる", stop: "停止",
    tv: "テレビ", music: "音楽", volume: "音量", channels: "チャンネル", nowPlaying: "再生中", roomService: "ルームサービス", breakfast: "朝食（客室）", spa: "スパ＆ウェルネス", book: "予約", booked: "予約済み", order: "注文", ordered: "注文済み",
    time: "時刻", weather: "モントルー", checkout: "チェックアウト", housekeeping: "清掃", laundry: "ランドリー", taxi: "タクシー", requested: "依頼済み", guest: "お客様", massage: "マッサージ60分", pool: "プール", sauna: "プライベートサウナ", all: "すべて", ceiling: "天井", bedside: "ベッドサイド", bathroom: "バスルーム", terrace: "テラス", greeting: "素晴らしいご滞在をお祈りしております。" },
};

const SCENES = [
  { id: "wake", icon: "Sunrise", lights: { ceiling: 70, bedside: 40, bathroom: 60, terrace: 0 }, sheer: 100, blackout: 100, temp: 21.5 },
  { id: "read", icon: "Lamp", lights: { ceiling: 20, bedside: 85, bathroom: 0, terrace: 0 }, sheer: 40, blackout: 100, temp: 22 },
  { id: "relax", icon: "Wine", lights: { ceiling: 35, bedside: 50, bathroom: 30, terrace: 60 }, sheer: 70, blackout: 100, temp: 22.5 },
  { id: "night", icon: "MoonStar", lights: { ceiling: 0, bedside: 8, bathroom: 10, terrace: 0 }, sheer: 0, blackout: 0, temp: 20 },
];
const CHANNELS = ["RTS 1", "BBC One", "ARD", "Rai 1", "CNN", "Eurosport", "NHK World", "Sky News"];
const PLAYLISTS = { fr: "Jazz au bord du lac", en: "Lakeside jazz", de: "Jazz am See", it: "Jazz sul lago", es: "Jazz junto al lago", ja: "レイクサイド・ジャズ" };

export const SuitePalaceMontreux = ({ deviceType, clientName }) => {
  const { lang: siteLang } = useTranslation();
  const [lang, setLang] = useState(LANGS.some((l) => l.id === siteLang) ? siteLang : "fr");
  const t = (k) => (T[lang] || T.fr)[k] || T.fr[k];
  const isPhone = deviceType === "phone";

  const [tab, setTab] = useState("home");
  const [scene, setScene] = useState("relax");
  const [lights, setLights] = useState({ ceiling: 35, bedside: 50, bathroom: 30, terrace: 60 });
  const [sheer, setSheer] = useState(70);
  const [blackout, setBlackout] = useState(100);
  const [moving, setMoving] = useState(null);
  const [setpoint, setSetpoint] = useState(22.5);
  const [fan, setFan] = useState("auto");
  const [dnd, setDnd] = useState(false);
  const [mur, setMur] = useState(false);
  const [butler, setButler] = useState(false);
  const [tvOn, setTvOn] = useState(false);
  const [channel, setChannel] = useState(0);
  const [musicOn, setMusicOn] = useState(true);
  const [volume, setVolume] = useState(28);
  const [orders, setOrders] = useState({});
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!butler) return;
    const id = setTimeout(() => setButler(false), 6000);
    return () => clearTimeout(id);
  }, [butler]);

  const applyScene = (s) => {
    setScene(s.id);
    setLights(s.lights);
    setSheer(s.sheer);
    setBlackout(s.blackout);
    setSetpoint(s.temp);
    setMoving("scene");
    setTimeout(() => setMoving(null), 1200);
  };
  const allOff = () => {
    setScene(null);
    setLights({ ceiling: 0, bedside: 0, bathroom: 0, terrace: 0 });
    setTvOn(false);
    setMusicOn(false);
  };
  const setLight = (k, v) => { setLights((l) => ({ ...l, [k]: Math.max(0, Math.min(100, v)) })); setScene(null); };
  const driveCurtain = (which, target) => {
    setMoving(which);
    (which === "sheer" ? setSheer : setBlackout)(target);
    setTimeout(() => setMoving(null), 1500);
  };
  const toggleOrder = (k) => setOrders((o) => ({ ...o, [k]: !o[k] }));

  const Icon = ({ name, size = 18, className = "" }) => {
    const C = Icons[name] || Icons.Circle;
    return <C size={size} className={className} />;
  };
  const fmtTime = now.toLocaleTimeString(lang === "en" ? "en-GB" : lang === "ja" ? "ja-JP" : `${lang}-CH`, { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString(lang === "en" ? "en-GB" : lang === "ja" ? "ja-JP" : `${lang}-CH`, { weekday: "long", day: "numeric", month: "long" });

  const NAV = [
    { id: "home", icon: "Home", label: t("home") },
    { id: "climate", icon: "Thermometer", label: t("climate") },
    { id: "light", icon: "Lightbulb", label: t("light") },
    { id: "curtains", icon: "Blinds", label: t("curtains") },
    { id: "media", icon: "Tv", label: t("media") },
    { id: "service", icon: "ConciergeBell", label: t("service") },
  ];

  const LangPicker = () => (
    <div className="sp-langs">
      {LANGS.map((l) => (
        <button key={l.id} className={lang === l.id ? "active" : ""} onClick={() => setLang(l.id)} title={l.name}><span>{l.flag}</span>{!isPhone && <em>{l.id.toUpperCase()}</em>}</button>
      ))}
    </div>
  );

  const renderHome = () => (
    <div className="sp-panel">
      <div className="sp-welcome">
        <div>
          <div className="sp-eyebrow">{t("suite")}</div>
          <h2>{t("welcome")}, {clientName || (lang === "ja" ? "田中様" : "M. & Mme Laurent")}</h2>
          <p>{t("greeting")}</p>
        </div>
        <div className="sp-clock">
          <b>{fmtTime}</b>
          <span>{dateStr}</span>
          <span className="sp-weather"><Icon name="Sun" size={14} /> {t("weather")} · 24 °C</span>
        </div>
      </div>
      <div className="sp-section-title">{t("scenes")}</div>
      <div className="sp-scenes">
        {SCENES.map((s) => (
          <button key={s.id} className={scene === s.id ? "active" : ""} onClick={() => applyScene(s)}><Icon name={s.icon} size={isPhone ? 20 : 26} /><span>{t(s.id)}</span></button>
        ))}
        <button className="sp-off" onClick={allOff}><Icon name="Power" size={isPhone ? 20 : 26} /><span>{t("off")}</span></button>
      </div>
      <div className="sp-service-row">
        <button className={`sp-service-btn dnd ${dnd ? "active" : ""}`} onClick={() => { setDnd((d) => !d); if (!dnd) setMur(false); }}><Icon name="MoonStar" size={20} /><span>{t("dnd")}</span></button>
        <button className={`sp-service-btn mur ${mur ? "active" : ""}`} onClick={() => { setMur((m) => !m); if (!mur) setDnd(false); }}><Icon name="Sparkles" size={20} /><span>{t("mur")}</span></button>
        <button className={`sp-service-btn butler ${butler ? "active" : ""}`} onClick={() => setButler(true)}><Icon name="ConciergeBell" size={20} /><span>{butler ? t("butlerOk") : t("butler")}</span></button>
      </div>
      <div className="sp-quick-grid">
        <div className="sp-quick"><Icon name="Thermometer" size={16} /><b>{setpoint.toFixed(1)} °C</b><span>{t("setpoint")}</span></div>
        <div className="sp-quick"><Icon name="Lightbulb" size={16} /><b>{Math.round((lights.ceiling + lights.bedside + lights.bathroom + lights.terrace) / 4)} %</b><span>{t("light")}</span></div>
        <div className="sp-quick"><Icon name="Blinds" size={16} /><b>{sheer} %</b><span>{t("sheer")}</span></div>
        <div className="sp-quick"><Icon name="Music" size={16} /><b>{musicOn ? volume : "—"}</b><span>{t("music")}</span></div>
      </div>
    </div>
  );

  const renderClimate = () => (
    <div className="sp-panel">
      <div className="sp-section-title">{t("climate")}</div>
      <div className="sp-climate">
        <div className="sp-thermo">
          <button onClick={() => setSetpoint((s) => Math.max(17, s - 0.5))}><Icon name="Minus" size={22} /></button>
          <div className="sp-thermo-dial" style={{ "--p": `${((setpoint - 17) / 11) * 100}%` }}>
            <b>{setpoint.toFixed(1)}</b><span>°C · {t("setpoint")}</span>
            <small>{t("temp")} 22.1 °C</small>
          </div>
          <button onClick={() => setSetpoint((s) => Math.min(28, s + 0.5))}><Icon name="Plus" size={22} /></button>
        </div>
        <div className="sp-card">
          <div className="sp-card-title"><Icon name="Fan" size={16} /> {t("fan")}</div>
          <div className="sp-seg">
            {[["auto", t("auto")], ["low", t("low")], ["high", t("high")]].map(([id, l]) => (
              <button key={id} className={fan === id ? "active" : ""} onClick={() => setFan(id)}>{l}</button>
            ))}
          </div>
          <div className={`sp-fan-visual ${fan}`}><Icon name="Fan" size={44} /></div>
        </div>
      </div>
    </div>
  );

  const renderLight = () => (
    <div className="sp-panel">
      <div className="sp-section-title">{t("light")}</div>
      <div className="sp-lights">
        {[["ceiling", "LampCeiling"], ["bedside", "Lamp"], ["bathroom", "Bath"], ["terrace", "Sun"]].map(([k, ic]) => (
          <div key={k} className={`sp-light ${lights[k] > 0 ? "on" : ""}`}>
            <div className="sp-light-head"><Icon name={ic} size={18} /><span>{t(k)}</span><strong>{lights[k]} %</strong></div>
            <div className="sp-light-ctrl">
              <input type="range" min="0" max="100" value={lights[k]} onChange={(e) => setLight(k, Number(e.target.value))} style={{ "--val": `${lights[k]}%` }} />
              <button className={lights[k] > 0 ? "on" : ""} onClick={() => setLight(k, lights[k] > 0 ? 0 : 60)}><Icon name="Power" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="sp-seg wide">
        <button onClick={() => setLights({ ceiling: 100, bedside: 100, bathroom: 100, terrace: 100 })}>{t("all")} 100 %</button>
        <button onClick={() => setLights({ ceiling: 30, bedside: 30, bathroom: 30, terrace: 30 })}>{t("all")} 30 %</button>
        <button onClick={() => setLights({ ceiling: 0, bedside: 0, bathroom: 0, terrace: 0 })}>{t("off")}</button>
      </div>
    </div>
  );

  const renderCurtains = () => (
    <div className="sp-panel">
      <div className="sp-section-title">{t("curtains")}</div>
      <div className="sp-curtains">
        {[["sheer", sheer], ["blackout", blackout]].map(([k, v]) => (
          <div key={k} className="sp-card sp-curtain">
            <div className="sp-card-title"><Icon name="Blinds" size={16} /> {t(k)} · {v} %</div>
            <div className="sp-window">
              <div className="sp-window-view" />
              <div className={`sp-curtain-fabric ${k}`} style={{ width: `${100 - v}%` }} />
              <div className={`sp-curtain-fabric ${k} right`} style={{ width: `${100 - v}%` }} />
            </div>
            <div className="sp-seg">
              <button onClick={() => driveCurtain(k, 100)}><Icon name="ChevronUp" size={16} /> {t("open")}</button>
              <button onClick={() => setMoving(null)}><Icon name="Square" size={14} /> {t("stop")}</button>
              <button onClick={() => driveCurtain(k, 0)}><Icon name="ChevronDown" size={16} /> {t("close")}</button>
            </div>
            <input type="range" min="0" max="100" value={v} onChange={(e) => (k === "sheer" ? setSheer : setBlackout)(Number(e.target.value))} style={{ "--val": `${v}%` }} />
          </div>
        ))}
      </div>
      {moving && <div className="sp-moving"><Icon name="RefreshCw" size={14} className="spin" /> …</div>}
    </div>
  );

  const renderMedia = () => (
    <div className="sp-panel">
      <div className="sp-media">
        <div className="sp-card">
          <div className="sp-card-title"><Icon name="Tv" size={16} /> {t("tv")} · Samsung 65"</div>
          <div className={`sp-tv ${tvOn ? "on" : ""}`}>{tvOn ? <><Icon name="Tv" size={22} /><b>{CHANNELS[channel]}</b></> : <span>{t("off")}</span>}</div>
          <div className="sp-tv-ctrl">
            <button className={`sp-power ${tvOn ? "on" : ""}`} onClick={() => setTvOn((o) => !o)}><Icon name="Power" size={18} /></button>
            <button onClick={() => setChannel((c) => (c + CHANNELS.length - 1) % CHANNELS.length)} disabled={!tvOn}><Icon name="ChevronLeft" size={18} /></button>
            <span>{t("channels")}</span>
            <button onClick={() => setChannel((c) => (c + 1) % CHANNELS.length)} disabled={!tvOn}><Icon name="ChevronRight" size={18} /></button>
          </div>
          <div className="sp-channels">
            {CHANNELS.map((c, i) => <button key={c} className={tvOn && channel === i ? "active" : ""} onClick={() => { setTvOn(true); setChannel(i); }}>{c}</button>)}
          </div>
        </div>
        <div className="sp-card">
          <div className="sp-card-title"><Icon name="Music" size={16} /> {t("music")} · Bang & Olufsen</div>
          <div className={`sp-music ${musicOn ? "on" : ""}`}>
            <div className="sp-music-art"><Icon name="Disc3" size={30} className={musicOn ? "spin-slow" : ""} /></div>
            <div><div className="sp-eyebrow">{t("nowPlaying")}</div><b>{PLAYLISTS[lang]}</b><span>Nils Frahm — Says</span></div>
            <button className={`sp-power ${musicOn ? "on" : ""}`} onClick={() => setMusicOn((m) => !m)}><Icon name={musicOn ? "Pause" : "Play"} size={18} /></button>
          </div>
          <div className="sp-card-title" style={{ marginTop: 10 }}><Icon name="Volume2" size={16} /> {t("volume")} · {volume}</div>
          <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ "--val": `${volume}%` }} />
        </div>
      </div>
    </div>
  );

  const renderService = () => (
    <div className="sp-panel">
      <div className="sp-section-title">{t("service")}</div>
      <div className="sp-services">
        {[
          ["breakfast", "Croissant", t("breakfast"), "07:30 – 10:30", t("order"), t("ordered")],
          ["roomService", "UtensilsCrossed", t("roomService"), "24 h / 24", t("order"), t("ordered")],
          ["massage", "Waves", t("massage"), t("spa"), t("book"), t("booked")],
          ["sauna", "Flame", t("sauna"), t("spa") + " · 45 min", t("book"), t("booked")],
          ["housekeeping", "Sparkles", t("housekeeping"), "", t("book"), t("requested")],
          ["laundry", "Sparkles", t("laundry"), "", t("book"), t("requested")],
          ["taxi", "Key", t("taxi"), "", t("book"), t("requested")],
          ["checkout", "LogIn", t("checkout"), "12:00", t("book"), t("requested")],
        ].map(([k, ic, title, sub, cta, done]) => (
          <button key={k} className={`sp-service-card ${orders[k] ? "done" : ""}`} onClick={() => toggleOrder(k)}>
            <Icon name={ic} size={22} />
            <div><b>{title}</b>{sub && <span>{sub}</span>}</div>
            <em>{orders[k] ? <><Icon name="Check" size={12} /> {done}</> : cta}</em>
          </button>
        ))}
      </div>
    </div>
  );

  const PANELS = { home: renderHome, climate: renderClimate, light: renderLight, curtains: renderCurtains, media: renderMedia, service: renderService };

  return (
    <div className={`gemini-ui-root suite-palace-ui ${deviceType} ${dnd ? "dnd" : ""}`}>
      <header className="sp-header">
        <div className="sp-brand">
          <div className="sp-monogram">MP</div>
          <div><div className="sp-brand-title">Montreux Palace</div><div className="sp-brand-sub">{t("suite")}</div></div>
        </div>
        <div className="sp-header-right">
          {dnd && <span className="sp-chip dnd"><Icon name="MoonStar" size={12} /> {t("dnd")}</span>}
          {mur && <span className="sp-chip mur"><Icon name="Sparkles" size={12} /> {t("mur")}</span>}
          <LangPicker />
        </div>
      </header>
      <div className="sp-body">
        {!isPhone && (
          <nav className="sp-nav">
            {NAV.map((n) => (
              <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={18} /><span>{n.label}</span></button>
            ))}
          </nav>
        )}
        <main className="sp-main">{PANELS[tab]()}</main>
      </div>
      {isPhone && (
        <nav className="sp-tabbar">
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}><Icon name={n.icon} size={19} /><span>{n.label}</span></button>
          ))}
        </nav>
      )}
    </div>
  );
};
