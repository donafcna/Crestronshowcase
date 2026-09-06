import React, { Suspense, lazy, useState, useEffect, useCallback } from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { projects, getProjectName } from "../data/projects";
import "../demo.css";

// Simulateurs chargés à la demande (même stratégie que Showcase.jsx).
const lazyNamed = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const SIMULATORS = {
  "villa-gemini": lazyNamed(() => import("./simulators/VillaGemini"), "VillaGemini"),
  "hotel-geneva": lazyNamed(() => import("./simulators/HotelGeneva"), "HotelGeneva"),
  "crestron-home": lazyNamed(() => import("./simulators/CrestronHome"), "CrestronHome"),
  "yacht-monaco": lazyNamed(() => import("./simulators/YachtMonaco"), "YachtMonaco"),
  "chalet-zermatt": lazyNamed(() => import("./simulators/ChaletZermatt"), "ChaletZermatt"),
  "boardroom-futureav": lazyNamed(() => import("./simulators/BoardroomFutureAV"), "BoardroomFutureAV"),
  "club-etoile": lazyNamed(() => import("./simulators/ClubEtoile"), "ClubEtoile"),
  "boutique-hermes": lazyNamed(() => import("./simulators/BoutiqueHermes"), "BoutiqueHermes"),
  "sushi-bar-kyoto": lazyNamed(() => import("./simulators/SushiBarKyoto"), "SushiBarKyoto"),
  "auditorium-richmond": lazyNamed(() => import("./simulators/AuditoriumRichmond"), "AuditoriumRichmond"),
};

const SimulatorFallback = () => (
  <div className="simulator-loading">
    <div className="page-loader-spinner" />
  </div>
);

// Détection du véritable appareil sur lequel tourne la démo.
export const detectDeviceType = () => {
  const ua = navigator.userAgent || "";
  // Les iPad récents s'annoncent comme MacIntel avec support tactile
  const isIPad =
    /iPad/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIPad) return "tablet";
  if (/iPhone|iPod/.test(ua)) return "phone";
  if (/Android/.test(ua)) {
    return /Mobile/.test(ua) ? "phone" : "tablet";
  }
  // Repli sur la taille du viewport (plus petit côté)
  const smallest = Math.min(window.innerWidth, window.innerHeight);
  return smallest < 500 ? "phone" : "tablet";
};

export const isMobileDevice = () => {
  const ua = navigator.userAgent || "";
  return (
    /iPhone|iPod|iPad|Android/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const renderIcon = (iconName, size = 16, className = "") => {
  const IconComp = Icons[iconName] || Icons.HelpCircle;
  return <IconComp size={size} className={className} />;
};

/* ------------------------------------------------------------------ */
/* Lecteur plein écran : une interface, plein cadre, sur le vrai      */
/* appareil (aucun boîtier simulé).                                   */
/* ------------------------------------------------------------------ */
const DemoPlayer = ({ project, deviceType, onBack, onToggleDevice }) => {
  const { lang } = useTranslation();
  const [controlsVisible, setControlsVisible] = useState(true);

  // Masquage automatique des contrôles flottants
  useEffect(() => {
    if (!controlsVisible) return;
    const timer = setTimeout(() => setControlsVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [controlsVisible]);

  const showControls = useCallback(() => setControlsVisible(true), []);

  const Simulator = project.isInteractive
    ? SIMULATORS[project.id] || SIMULATORS["villa-gemini"]
    : null;

  const embedSrc =
    deviceType === "phone" && project.embedPhoneUrl
      ? project.embedPhoneUrl
      : project.embedUrl;

  return (
    <div className="demo-player" onPointerDown={showControls}>
      <div className="demo-player-screen">
        {Simulator ? (
          <Suspense fallback={<SimulatorFallback />}>
            <Simulator deviceType={deviceType} />
          </Suspense>
        ) : embedSrc ? (
          <iframe
            src={embedSrc}
            title={getProjectName(project, lang)}
            className="demo-player-iframe"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : null}
      </div>

      {/* Contrôles flottants */}
      <div
        className={`demo-player-controls ${controlsVisible ? "visible" : "hidden"}`}
      >
        <button className="demo-ctrl-btn" onClick={onBack} aria-label="Retour">
          {renderIcon("ChevronLeft", 20)}
        </button>
        <span className="demo-ctrl-title">{getProjectName(project, lang)}</span>
        <button
          className="demo-ctrl-btn"
          onClick={onToggleDevice}
          aria-label="Basculer téléphone / tablette"
        >
          {renderIcon(deviceType === "phone" ? "Smartphone" : "Tablet", 18)}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Launcher : liste tactile de toutes les interfaces                   */
/* ------------------------------------------------------------------ */
const DemoLauncher = ({ onOpenProject, onExitDemo }) => {
  const { t, lang, changeLanguage, supportedLangs } = useTranslation();
  const [isStandalone] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
  );

  const sectorName = (sectorId) => t(`sector_${sectorId}_name`);

  return (
    <div className="demo-launcher">
      <header className="demo-launcher-header">
        <div className="demo-header-brand">
          <img
            src="/assets/logo-frequence-tv-5LGUrtbd.png"
            alt="Frequence TV"
            className="demo-brand-logo"
          />
          <div className="demo-brand-text">
            <h1>{t("demo_title")}</h1>
            <p>{t("demo_subtitle")}</p>
          </div>
        </div>
        <div className="demo-header-actions">
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="demo-lang-select"
            aria-label="Langue"
          >
            {supportedLangs.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </header>

      {!isStandalone && (
        <div className="demo-install-hint">
          {renderIcon("Share2", 18, "hint-icon")}
          <span>{t("demo_install_hint")}</span>
        </div>
      )}

      <main className="demo-project-grid">
        {projects.map((proj) => (
          <button
            key={proj.id}
            className="demo-project-card"
            onClick={() => onOpenProject(proj.id)}
          >
            <div className="demo-card-thumb-wrap">
              <img
                src={proj.thumbnailUrl}
                alt={getProjectName(proj, lang)}
                className="demo-card-thumb"
                loading="lazy"
              />
              <span className="demo-card-badge">
                {proj.isInteractive
                  ? t("demo_badge_interactive")
                  : t("demo_badge_ch5")}
              </span>
            </div>
            <div className="demo-card-body">
              <span className="demo-card-name">{getProjectName(proj, lang)}</span>
              <span className="demo-card-sectors">
                {proj.sectors
                  .map((sId) => sectorName(sId))
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <div className="demo-card-open">{renderIcon("Play", 16)}</div>
          </button>
        ))}
      </main>

      <footer className="demo-launcher-footer">
        <button className="demo-exit-link" onClick={onExitDemo}>
          {renderIcon("Monitor", 14)}
          <span>{t("demo_full_site")}</span>
        </button>
        <span className="demo-footer-credit">
          Crestron CH5 · HTML5 / CSS / JS — Frequence TV
        </span>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Racine du mode démo : lit la route hash                             */
/* ------------------------------------------------------------------ */
export const DemoMode = ({ route, onNavigate, onExitDemo }) => {
  const [deviceType, setDeviceType] = useState(detectDeviceType);

  // Resynchronisation à la rotation / au redimensionnement (hors iOS/Android
  // où la détection par user-agent est stable)
  useEffect(() => {
    const onResize = () =>
      setDeviceType((prev) => {
        const ua = navigator.userAgent || "";
        if (/iPhone|iPod|iPad|Android/.test(ua)) return prev;
        const smallest = Math.min(window.innerWidth, window.innerHeight);
        return smallest < 500 ? "phone" : "tablet";
      });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const projectId = route.startsWith("demo/") ? route.slice(5) : null;
  const project = projectId ? projects.find((p) => p.id === projectId) : null;

  if (project) {
    return (
      <DemoPlayer
        project={project}
        deviceType={deviceType}
        onBack={() => onNavigate("demo")}
        onToggleDevice={() =>
          setDeviceType((d) => (d === "phone" ? "tablet" : "phone"))
        }
      />
    );
  }

  return (
    <DemoLauncher
      onOpenProject={(id) => onNavigate(`demo/${id}`)}
      onExitDemo={onExitDemo}
    />
  );
};
