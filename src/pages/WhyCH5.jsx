import React, { useEffect, useState } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { Link, buildShowcasePath } from "../router";

// Page argumentaire : ce que les technologies web (HTML5 / CSS / JS) apportent
// aux interfaces Crestron, avec des mini-démonstrations vivantes.
// Les textes sont ici, en FR / EN / DE.
const TEXT = {
  fr: {
    tagline: "Crestron CH5 · HTML5, CSS et JavaScript",
    title: "Pourquoi le CH5 change tout pour vos interfaces Crestron",
    intro:
      "Crestron HTML5 (CH5) remplace les écrans figés d'autrefois par de véritables applications web, dessinées au pixel près. Le même savoir-faire que les meilleures applications mobiles, au service de votre villa, de votre hôtel ou de votre salle de réunion.",
    compareTitle: "Avant / après : la même fonction, deux expériences",
    compareHint: "Glissez le curseur pour comparer",
    classicLabel: "Interface classique",
    ch5Label: "Interface CH5 par Fréquence TV",
    classicRoom: "SALON",
    lights: "Éclairage",
    blinds: "Stores",
    climate: "Climat",
    audio: "Audio",
    scene: "Scène",
    on: "ON",
    off: "OFF",
    room: "Salon",
    scenes: ["Soirée", "Lecture", "Cinéma"],
    featuresTitle: "Ce que le web apporte à votre installation",
    features: [
      { icon: "Palette", title: "Transparence et flou de verre", text: "Panneaux translucides, ombres douces et dégradés : une interface qui respire au lieu d'une grille de boutons gris." },
      { icon: "Zap", title: "Animations fluides", text: "Transitions, retours tactiles, curseurs qui glissent : chaque geste est confirmé visuellement, sans latence." },
      { icon: "Video", title: "Photos et vidéos en fond", text: "Votre propriété, votre yacht ou votre boutique en arrière-plan, en haute définition, avec des ambiances animées." },
      { icon: "Moon", title: "Thème clair / sombre", text: "L'interface s'adapte à l'heure ou à l'humeur : lisible en plein soleil, discrète la nuit." },
      { icon: "Languages", title: "Multilingue instantané", text: "Français, anglais, allemand… la langue change en un geste pour les invités, le personnel ou la famille." },
      { icon: "MonitorSmartphone", title: "Un design, tous les supports", text: "Dalle murale TSW-1070 / 1080, Xpanel sur PC, iPad et smartphone : une seule interface responsive, pas quatre projets." },
      { icon: "Type", title: "Polices et icônes sur mesure", text: "Vos couleurs, votre typographie, vos pictogrammes : une interface à l'image de votre projet ou de votre marque." },
      { icon: "Gauge", title: "Retour d'état en temps réel", text: "Températures, niveaux, caméras : les informations vivent à l'écran, pilotées par le processeur Crestron." },
      { icon: "RefreshCw", title: "Pérenne et évolutif", text: "Standards web ouverts, mises à jour à distance, prototypes testables avant la pose : l'interface évolue avec vous." },
    ],
    liveDemo: "Démonstration en direct",
    stepsTitle: "Comment nous travaillons",
    steps: [
      { title: "Atelier design", text: "Nous recueillons vos usages, votre charte et vos photos pour dessiner l'interface." },
      { title: "Prototype testable", text: "Vous manipulez l'interface sur ce site, sur votre iPad ou votre téléphone, avant tout câblage." },
      { title: "Déploiement", text: "Nous installons l'interface sur vos dalles Crestron, l'application mobile et le Xpanel, puis l'accompagnons dans le temps." },
    ],
    ctaTitle: "Voir les interfaces en action",
    ctaText: "Chaque projet de cette vitrine se teste en direct, dans son support réel.",
    ctaBtn: "Explorer les interfaces",
    ctaContact: "Demander une démo",
    themeLight: "Jour",
    themeDark: "Nuit",
    tempLabel: "Température",
  },
  en: {
    tagline: "Crestron CH5 · HTML5, CSS and JavaScript",
    title: "Why CH5 changes everything for your Crestron interfaces",
    intro:
      "Crestron HTML5 (CH5) replaces yesterday's static screens with real web applications, designed pixel by pixel. The same craft as the best mobile apps, serving your villa, hotel or meeting room.",
    compareTitle: "Before / after: same function, two experiences",
    compareHint: "Drag the handle to compare",
    classicLabel: "Classic interface",
    ch5Label: "CH5 interface by Fréquence TV",
    classicRoom: "LIVING ROOM",
    lights: "Lighting",
    blinds: "Blinds",
    climate: "Climate",
    audio: "Audio",
    scene: "Scene",
    on: "ON",
    off: "OFF",
    room: "Living room",
    scenes: ["Evening", "Reading", "Movie"],
    featuresTitle: "What the web brings to your installation",
    features: [
      { icon: "Palette", title: "Transparency and frosted glass", text: "Translucent panels, soft shadows and gradients: an interface that breathes instead of a grid of grey buttons." },
      { icon: "Zap", title: "Smooth animations", text: "Transitions, touch feedback, sliding controls: every gesture is confirmed visually, without lag." },
      { icon: "Video", title: "Photo and video backgrounds", text: "Your property, yacht or boutique in the background, in high definition, with animated moods." },
      { icon: "Moon", title: "Light / dark theme", text: "The interface adapts to the time of day or the mood: readable in full sun, discreet at night." },
      { icon: "Languages", title: "Instant multilingual", text: "French, English, German… the language switches in one tap for guests, staff or family." },
      { icon: "MonitorSmartphone", title: "One design, every device", text: "TSW-1070 / 1080 wall panel, Xpanel on PC, iPad and smartphone: one responsive interface, not four projects." },
      { icon: "Type", title: "Custom fonts and icons", text: "Your colours, typography and pictograms: an interface that reflects your project or brand." },
      { icon: "Gauge", title: "Real-time feedback", text: "Temperatures, levels, cameras: information lives on screen, driven by the Crestron processor." },
      { icon: "RefreshCw", title: "Future-proof and scalable", text: "Open web standards, remote updates, prototypes you can try before installation: the interface grows with you." },
    ],
    liveDemo: "Live demo",
    stepsTitle: "How we work",
    steps: [
      { title: "Design workshop", text: "We gather your habits, brand guidelines and photos to design the interface." },
      { title: "Testable prototype", text: "You try the interface on this site, your iPad or your phone, before any cabling." },
      { title: "Deployment", text: "We install the interface on your Crestron panels, mobile app and Xpanel, then support it over time." },
    ],
    ctaTitle: "See the interfaces in action",
    ctaText: "Every project in this showcase can be tried live, in its real device.",
    ctaBtn: "Explore the interfaces",
    ctaContact: "Request a demo",
    themeLight: "Day",
    themeDark: "Night",
    tempLabel: "Temperature",
  },
  de: {
    tagline: "Crestron CH5 · HTML5, CSS und JavaScript",
    title: "Warum CH5 alles für Ihre Crestron-Oberflächen verändert",
    intro:
      "Crestron HTML5 (CH5) ersetzt die starren Bildschirme von gestern durch echte Webanwendungen, pixelgenau gestaltet. Dieselbe Handwerkskunst wie bei den besten Mobile-Apps – für Ihre Villa, Ihr Hotel oder Ihr Sitzungszimmer.",
    compareTitle: "Vorher / nachher: gleiche Funktion, zwei Erlebnisse",
    compareHint: "Griff ziehen zum Vergleichen",
    classicLabel: "Klassische Oberfläche",
    ch5Label: "CH5-Oberfläche von Fréquence TV",
    classicRoom: "WOHNZIMMER",
    lights: "Licht",
    blinds: "Storen",
    climate: "Klima",
    audio: "Audio",
    scene: "Szene",
    on: "EIN",
    off: "AUS",
    room: "Wohnzimmer",
    scenes: ["Abend", "Lesen", "Kino"],
    featuresTitle: "Was das Web Ihrer Anlage bringt",
    features: [
      { icon: "Palette", title: "Transparenz und Milchglas", text: "Durchscheinende Panels, weiche Schatten und Verläufe: eine Oberfläche, die atmet, statt eines Rasters grauer Tasten." },
      { icon: "Zap", title: "Flüssige Animationen", text: "Übergänge, Touch-Feedback, gleitende Regler: jede Geste wird ohne Verzögerung visuell bestätigt." },
      { icon: "Video", title: "Fotos und Videos im Hintergrund", text: "Ihr Anwesen, Ihre Yacht oder Ihre Boutique in HD im Hintergrund, mit animierten Stimmungen." },
      { icon: "Moon", title: "Hell- / Dunkel-Thema", text: "Die Oberfläche passt sich Tageszeit und Stimmung an: lesbar in der Sonne, dezent in der Nacht." },
      { icon: "Languages", title: "Sofort mehrsprachig", text: "Französisch, Englisch, Deutsch … die Sprache wechselt mit einem Tipp – für Gäste, Personal oder Familie." },
      { icon: "MonitorSmartphone", title: "Ein Design, alle Geräte", text: "Wandpanel TSW-1070 / 1080, Xpanel am PC, iPad und Smartphone: eine responsive Oberfläche statt vier Projekte." },
      { icon: "Type", title: "Eigene Schriften und Icons", text: "Ihre Farben, Typografie und Piktogramme: eine Oberfläche im Stil Ihres Projekts oder Ihrer Marke." },
      { icon: "Gauge", title: "Rückmeldung in Echtzeit", text: "Temperaturen, Pegel, Kameras: Informationen leben auf dem Bildschirm, gesteuert vom Crestron-Prozessor." },
      { icon: "RefreshCw", title: "Zukunftssicher und skalierbar", text: "Offene Webstandards, Fern-Updates, testbare Prototypen vor der Montage: die Oberfläche wächst mit Ihnen." },
    ],
    liveDemo: "Live-Demo",
    stepsTitle: "So arbeiten wir",
    steps: [
      { title: "Design-Workshop", text: "Wir erfassen Ihre Gewohnheiten, Ihr Corporate Design und Ihre Fotos, um die Oberfläche zu gestalten." },
      { title: "Testbarer Prototyp", text: "Sie bedienen die Oberfläche auf dieser Website, Ihrem iPad oder Telefon – vor jeder Verkabelung." },
      { title: "Inbetriebnahme", text: "Wir installieren die Oberfläche auf Ihren Crestron-Panels, der Mobile-App und dem Xpanel und begleiten sie langfristig." },
    ],
    ctaTitle: "Die Oberflächen in Aktion sehen",
    ctaText: "Jedes Projekt dieser Vitrine lässt sich live im echten Gerät testen.",
    ctaBtn: "Oberflächen entdecken",
    ctaContact: "Demo anfragen",
    themeLight: "Tag",
    themeDark: "Nacht",
    tempLabel: "Temperatur",
  },
};

const Icon = ({ name, size = 18, className }) => {
  const C = Icons[name] || Icons.Circle;
  return <C size={size} className={className} />;
};

// --- Comparateur avant / après ------------------------------------------------
const CompareWidget = ({ tx }) => {
  const [pos, setPos] = useState(55);
  const [level, setLevel] = useState(70);
  const [scene, setScene] = useState(0);

  return (
    <div className="why-compare">
      <div className="why-compare-stage">
        {/* Côté CH5 (dessous, pleine largeur) */}
        <div className="why-compare-pane why-ch5" aria-label={tx.ch5Label}>
          <div className="why-ch5-bg" />
          <div className="why-ch5-card">
            <div className="why-ch5-head">
              <span className="why-ch5-room">{tx.room}</span>
              <span className="why-ch5-temp">21,5°</span>
            </div>
            <div className="why-ch5-row">
              <span className="why-ch5-label">
                <Icon name="Lightbulb" size={16} /> {tx.lights}
              </span>
              <span className="why-ch5-value">{level}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="why-ch5-slider"
              style={{ "--pct": `${level}%` }}
              aria-label={tx.lights}
            />
            <div className="why-ch5-scenes">
              {tx.scenes.map((s, i) => (
                <button key={s} type="button" className={`why-ch5-scene ${scene === i ? "active" : ""}`} onClick={() => setScene(i)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="why-ch5-tiles">
              {[
                ["Blinds", tx.blinds],
                ["Thermometer", tx.climate],
                ["Volume2", tx.audio],
              ].map(([ic, label]) => (
                <div key={ic} className="why-ch5-tile">
                  <Icon name={ic} size={16} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Côté classique (dessus, rogné) */}
        <div className="why-compare-pane why-classic" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-label={tx.classicLabel}>
          <div className="why-classic-title">{tx.classicRoom}</div>
          <div className="why-classic-grid">
            {[tx.lights, tx.blinds, tx.climate, tx.audio, tx.scene, "TV"].map((l) => (
              <div key={l} className="why-classic-btn">
                {l}
              </div>
            ))}
          </div>
          <div className="why-classic-footer">
            <div className="why-classic-btn small">{tx.on}</div>
            <div className="why-classic-btn small">{tx.off}</div>
          </div>
        </div>

        <div className="why-compare-handle" style={{ left: `${pos}%` }}>
          <span>
            <Icon name="MoveHorizontal" size={16} />
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="why-compare-range"
          aria-label={tx.compareHint}
        />
      </div>
      <div className="why-compare-legend">
        <span>{tx.classicLabel}</span>
        <span className="why-compare-hint">{tx.compareHint}</span>
        <span>{tx.ch5Label}</span>
      </div>
    </div>
  );
};

// --- Mini-démos par fonctionnalité -------------------------------------------
const GlassDemo = () => (
  <div className="why-demo why-demo-glass">
    <div className="why-demo-glass-card">
      <Icon name="Lightbulb" size={14} />
      <span>Cuisine</span>
      <em>65%</em>
    </div>
  </div>
);

const AnimDemo = () => {
  const [on, setOn] = useState(true);
  return (
    <div className="why-demo">
      <button type="button" className={`why-toggle ${on ? "on" : ""}`} onClick={() => setOn(!on)} aria-pressed={on}>
        <span className="why-toggle-knob" />
      </button>
    </div>
  );
};

const VideoDemo = () => <div className="why-demo why-demo-video" />;

const ThemeDemo = ({ tx }) => {
  const [dark, setDark] = useState(false);
  return (
    <div className={`why-demo why-demo-theme ${dark ? "dark" : ""}`} onClick={() => setDark(!dark)} role="button" tabIndex={0}>
      <Icon name={dark ? "Moon" : "Sun"} size={16} />
      <span>{dark ? tx.themeDark : tx.themeLight}</span>
    </div>
  );
};

const LangDemo = () => {
  const words = ["Bonjour", "Hello", "Guten Tag", "Buongiorno"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 1600);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <div className="why-demo why-demo-lang">
      <span key={i} className="why-lang-word">
        {words[i]}
      </span>
    </div>
  );
};

const DevicesDemo = () => (
  <div className="why-demo why-demo-devices">
    <Icon name="LayoutGrid" size={18} />
    <Icon name="Monitor" size={18} />
    <Icon name="Tablet" size={18} />
    <Icon name="Smartphone" size={18} />
  </div>
);

const FontDemo = () => (
  <div className="why-demo why-demo-font">
    <span className="f1">Aa</span>
    <span className="f2">Aa</span>
    <span className="f3">Aa</span>
  </div>
);

const GaugeDemo = ({ tx }) => {
  const [v, setV] = useState(21.4);
  useEffect(() => {
    const id = setInterval(() => setV((x) => Math.round((x + (Math.random() - 0.5) * 0.4) * 10) / 10), 1200);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(100, Math.max(0, ((v - 15) / 15) * 100));
  return (
    <div className="why-demo why-demo-gauge">
      <div className="why-gauge-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="why-gauge-val">
        {tx.tempLabel} {v.toFixed(1)}°
      </span>
    </div>
  );
};

const UpdateDemo = () => (
  <div className="why-demo why-demo-update">
    <Icon name="RefreshCw" size={18} className="spin-slow" />
    <span>v2.4 → v2.5</span>
  </div>
);

const DEMOS = [GlassDemo, AnimDemo, VideoDemo, ThemeDemo, LangDemo, DevicesDemo, FontDemo, GaugeDemo, UpdateDemo];

// --- Page ---------------------------------------------------------------------
export default function WhyCH5() {
  const { lang } = useTranslation();
  const tx = TEXT[lang] || TEXT.fr;

  return (
    <div className="dashboard-container page-why fade-in">
      <section className="dashboard-hero">
        <div className="hero-text-block wide">
          <span className="hero-tagline">{tx.tagline}</span>
          <h1>{tx.title}</h1>
          <p>{tx.intro}</p>
        </div>
      </section>

      <section>
        <h2 className="section-heading">{tx.compareTitle}</h2>
        <CompareWidget tx={tx} />
      </section>

      <section>
        <h2 className="section-heading">{tx.featuresTitle}</h2>
        <div className="why-features-grid">
          {tx.features.map((f, i) => {
            const Demo = DEMOS[i];
            return (
              <article key={f.title} className="glass-panel why-feature">
                <div className="why-feature-demo">{Demo ? <Demo tx={tx} /> : null}</div>
                <div className="why-feature-body">
                  <div className="why-feature-icon">
                    <Icon name={f.icon} size={18} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-heading">{tx.stepsTitle}</h2>
        <div className="why-steps">
          {tx.steps.map((s, i) => (
            <div key={s.title} className="glass-panel why-step">
              <span className="why-step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dash-cta glass-panel">
        <div className="dash-cta-text">
          <h2>{tx.ctaTitle}</h2>
          <p>{tx.ctaText}</p>
        </div>
        <div className="dash-cta-actions">
          <Link to={buildShowcasePath()} className="btn btn-primary">
            <Icon name="Layers" size={16} />
            <span>{tx.ctaBtn}</span>
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            <Icon name="CalendarCheck" size={16} />
            <span>{tx.ctaContact}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
