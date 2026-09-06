import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icons as LucideIcons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { projects, getDeviceById, getProjectText, getProjectName, getStatusLabel } from "../data/projects";
import { BackgroundVideo } from "./BackgroundVideo";
import { DeviceFrame } from "./DeviceFrame";
import { DemoToolbar } from "./DemoToolbar";
import { useRouter, buildShowcasePath } from "../router";
import { useDemoSettings } from "../hooks/useDemoSettings";

// Simulateurs chargés à la demande : seul celui du projet affiché est
// téléchargé (≈ 20–35 ko chacun), ce qui rend la première visite rapide en 4G.
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
  "home-cinema-cologny": lazyNamed(() => import("./simulators/HomeCinemaCologny"), "HomeCinemaCologny"),
  "huddle-room-nyon": lazyNamed(() => import("./simulators/HuddleRoomNyon"), "HuddleRoomNyon"),
  "suite-palace-montreux": lazyNamed(() => import("./simulators/SuitePalaceMontreux"), "SuitePalaceMontreux"),
  "appartement-eaux-vives": lazyNamed(() => import("./simulators/AppartementEauxVives"), "AppartementEauxVives"),
};

const VIEWPORT_IDS = ["phone", "tablet", "wallpanel", "wallpanel_hd", "desktop"];
const PRESENT_DEVICE_MS = 7000; // durée d'affichage d'un support en mode présentation
const KIOSK_IDLE_MS = 45000; // reprise automatique du défilement après inactivité (mode salon)

const SimulatorFallback = () => (
  <div className="simulator-loading">
    <div className="page-loader-spinner" />
  </div>
);

export const Showcase = ({ sectorId, projectId, device }) => {
  const { t, lang } = useTranslation();
  const { navigate } = useRouter();
  const { clientName, kiosk } = useDemoSettings();

  // ---- Projets visibles pour le secteur courant --------------------------
  const filteredProjects = useMemo(
    () => projects.filter((p) => !sectorId || p.sectors.includes(sectorId)),
    [sectorId]
  );

  const activeProject = useMemo(() => {
    const fromUrl = projectId && projects.find((p) => p.id === projectId);
    return fromUrl || filteredProjects[0] || projects[0];
  }, [projectId, filteredProjects]);

  // Supports proposés pour ce projet (dédoublonnés par gabarit physique).
  const projectViewports = useMemo(() => {
    const seen = new Map();
    activeProject.devices.forEach((dId) => {
      const dev = getDeviceById(dId);
      if (dev && !seen.has(dev.viewport)) seen.set(dev.viewport, dev);
    });
    return Array.from(seen.values());
  }, [activeProject]);

  const defaultViewport = projectViewports[0]?.viewport || "wallpanel";
  const viewportDevice =
    device && VIEWPORT_IDS.includes(device) && projectViewports.some((d) => d.viewport === device)
      ? device
      : defaultViewport;

  // URL canonique : on complète l'adresse (projet + support) pour qu'elle
  // soit toujours copiable telle quelle.
  useEffect(() => {
    const canonical = buildShowcasePath({ sectorId, projectId: activeProject.id, device: viewportDevice });
    if (window.location.pathname !== canonical) navigate(canonical, { replace: true });
  }, [sectorId, activeProject.id, viewportDevice, navigate]);

  const goTo = useCallback(
    (proj, vp, { replace = false } = {}) =>
      navigate(buildShowcasePath({ sectorId, projectId: proj.id, device: vp }), { replace }),
    [navigate, sectorId]
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [captureNotice, setCaptureNotice] = useState("");
  const stageRef = useRef(null);

  // ---- Plein écran ---------------------------------------------------------
  useEffect(() => {
    document.body.classList.toggle("workspace-maximized", isFullscreen);
    return () => document.body.classList.remove("workspace-maximized");
  }, [isFullscreen]);

  // ---- Mode présentation : supports puis projets, en boucle ---------------
  const advance = useCallback(() => {
    const vps = projectViewports.map((d) => d.viewport);
    const idx = vps.indexOf(viewportDevice);
    if (idx < vps.length - 1) {
      goTo(activeProject, vps[idx + 1], { replace: true });
      return;
    }
    const pIdx = filteredProjects.findIndex((p) => p.id === activeProject.id);
    const next = filteredProjects[(pIdx + 1) % filteredProjects.length] || activeProject;
    const nextDev = getDeviceById(next.devices[0])?.viewport;
    goTo(next, nextDev, { replace: true });
  }, [projectViewports, viewportDevice, activeProject, filteredProjects, goTo]);

  useEffect(() => {
    if (!presenting) return;
    const id = setInterval(advance, PRESENT_DEVICE_MS);
    return () => clearInterval(id);
  }, [presenting, advance]);

  const startPresentation = useCallback(() => {
    setExpandedProjectId(null);
    setIsFullscreen(true);
    setPresenting(true);
  }, []);
  const stopPresentation = useCallback(() => {
    setPresenting(false);
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (presenting) stopPresentation();
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, isFullscreen, stopPresentation]);

  // Mode salon (?kiosk=1) : démarre la présentation et la relance après
  // inactivité, pour une tablette ou un écran laissé en libre-service.
  useEffect(() => {
    if (!kiosk) return;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(startPresentation, KIOSK_IDLE_MS);
    };
    const onActivity = () => {
      setPresenting(false);
      arm();
    };
    startPresentation();
    ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.addEventListener(ev, onActivity));
    arm();
    return () => {
      clearTimeout(timer);
      ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [kiosk, startPresentation]);

  // ---- Défilement des phrases de description --------------------------------
  const projectText = getProjectText(activeProject, lang);
  const sentences = useMemo(
    () =>
      (projectText.details || "")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [projectText.details]
  );

  useEffect(() => {
    if (!expandedProjectId) return;
    setSentenceIndex(0);
    if (sentences.length <= 1) return;
    const interval = setInterval(() => setSentenceIndex((prev) => (prev + 1) % sentences.length), 5000);
    return () => clearInterval(interval);
  }, [activeProject.id, expandedProjectId, sentences.length]);

  const currentSentence = sentences[sentenceIndex] || sentences[0] || "";

  // ---- Capture d'écran de l'appareil (PNG) -----------------------------------
  const handleCapture = async () => {
    if (capturing) return;
    if (!activeProject.isInteractive) {
      setCaptureNotice(t("tool_capture_iframe"));
      setTimeout(() => setCaptureNotice(""), 6000);
      return;
    }
    const el = stageRef.current?.querySelector(".device-stage");
    if (!el) return;
    setCapturing(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, { backgroundColor: null, useCORS: true, scale: 2, logging: false });
      const a = document.createElement("a");
      const safe = `${activeProject.id}-${viewportDevice}`.replace(/[^a-z0-9-]/gi, "_");
      a.download = `frequence-tv-${safe}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (err) {
      console.warn("Capture failed", err);
    } finally {
      setCapturing(false);
    }
  };

  // ---- Rendu ---------------------------------------------------------------
  const renderIcon = (iconName, size = 14, className = "") => {
    const IconComp = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleToggleProjectDetails = (e, projId) => {
    e.preventDefault();
    e.stopPropagation();
    if (expandedProjectId === projId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projId);
      const proj = projects.find((p) => p.id === projId);
      if (proj && proj.id !== activeProject.id) goTo(proj, getDeviceById(proj.devices[0])?.viewport);
    }
  };

  const shareUrl = `${buildShowcasePath({ sectorId, projectId: activeProject.id, device: viewportDevice })}${
    clientName ? `?client=${encodeURIComponent(clientName)}` : ""
  }`;
  const sheetUrl = `/fiche/${activeProject.id}${clientName ? `?client=${encodeURIComponent(clientName)}` : ""}`;
  const embedSrc =
    !activeProject.isInteractive && activeProject.embedUrl
      ? viewportDevice === "phone" && activeProject.embedPhoneUrl
        ? activeProject.embedPhoneUrl
        : activeProject.embedUrl
      : null;
  const displayTitle = clientName || getProjectName(activeProject, lang);
  const Simulator = SIMULATORS[activeProject.id] || SIMULATORS["villa-gemini"];
  const simulatorType = viewportDevice === "wallpanel_hd" ? "wallpanel" : viewportDevice;

  return (
    <div
      className={`showcase-container fade-in sector-${sectorId || "all"} ${isFullscreen ? "fullscreen-mode" : ""}`}
      ref={stageRef}
    >
      <BackgroundVideo sectionId={sectorId || activeProject.sectors[0]} />

      <div className={`main-workspace-container transparent-workspace ${isFullscreen ? "fullscreen-mode" : ""}`}>
        {/* 1. Liste horizontale des projets */}
        {!isFullscreen && (
          <section className="projects-horizontal-list-bar compact-header compact-cards-version">
            {filteredProjects.length === 0 ? (
              <div className="empty-projects-state glass-panel">
                {renderIcon("FolderOpen", 26, "empty-icon")}
                <p>{t("showcase_empty_projects")}</p>
              </div>
            ) : expandedProjectId ? (
              <div className="project-expanded-layout fade-in compact-cards-expanded">
                <div className="project-list-card horizontal-card selected expanded-state compact-row-card">
                  <img src={activeProject.thumbnailUrl} alt="" className="card-thumb-compact" />
                  <div className="card-info-block-compact">
                    <span className="proj-name-compact">{getProjectName(activeProject, lang)}</span>
                    <button
                      onClick={(e) => handleToggleProjectDetails(e, activeProject.id)}
                      className="card-plus-btn-compact active"
                      title="Back to list"
                    >
                      {renderIcon("X", 10)}
                    </button>
                  </div>
                </div>
                <div className="expanded-vertical-divider" />
                <div className="expanded-info-details">
                  <div className="expanded-meta-row">
                    <span className={`status-pill status-${activeProject.status}`}>
                      {renderIcon(activeProject.status === "realisation" ? "BadgeCheck" : "Sparkles", 12)}
                      {getStatusLabel(activeProject.status, lang)}
                    </span>
                    <span className="meta-pill">{activeProject.client}</span>
                    <span className="meta-pill">{activeProject.year}</span>
                  </div>
                  <div className="description-cycler-container">
                    <p key={sentenceIndex} className="cycler-sentence-text fade-in-sentence">
                      {currentSentence}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="projects-horizontal-scroll-wrapper compact-cards-row">
                {filteredProjects.map((proj) => (
                  <a
                    key={proj.id}
                    href={buildShowcasePath({ sectorId, projectId: proj.id })}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) return;
                      e.preventDefault();
                      goTo(proj, getDeviceById(proj.devices[0])?.viewport);
                    }}
                    className={`project-list-card horizontal-card glass-panel compact-row-card ${
                      activeProject.id === proj.id ? "selected" : "glass-panel-hover"
                    }`}
                  >
                    <img src={proj.thumbnailUrl} alt="" className="card-thumb-compact" loading="lazy" />
                    <div className="card-info-block-compact">
                      <span className="proj-name-compact">
                        {proj.status === "realisation" && renderIcon("BadgeCheck", 12, "realisation-mark")}
                        {getProjectName(proj, lang)}
                      </span>
                      <button
                        onClick={(e) => handleToggleProjectDetails(e, proj.id)}
                        className="card-plus-btn-compact"
                        title={t("showcase_details_tooltip")}
                      >
                        {renderIcon("Plus", 10)}
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. Barre d'outils de démo */}
        {!isFullscreen && (
          <DemoToolbar
            project={activeProject}
            shareUrl={shareUrl}
            sheetUrl={sheetUrl}
            embedUrl={embedSrc}
            presenting={presenting}
            onTogglePresentation={presenting ? stopPresentation : startPresentation}
            onCapture={handleCapture}
            capturing={capturing}
          />
        )}
        {captureNotice && <div className="demo-notice glass-panel">{captureNotice}</div>}

        {/* Bandeau plein écran */}
        {isFullscreen && (
          <div className="fullscreen-overlay-header">
            <div className="fullscreen-overlay-header-left">
              {presenting && (
                <div className="present-hint glass-panel">
                  {renderIcon("Presentation", 14)}
                  <span>
                    {getProjectName(activeProject, lang)} · {t("present_hint")}
                  </span>
                </div>
              )}
            </div>
            <div className="fullscreen-overlay-header-right">
              <div className="fullscreen-frequencetv-logo-card">
                <img src="/assets/logo-frequence-tv-5LGUrtbd.png" alt="Fréquence TV" className="frequencetv-logo-img-fs" />
              </div>
            </div>
          </div>
        )}

        {/* 3. Appareil + sélecteur de support */}
        <div className="workspace-main-content-row">
          <main className="project-workspace">
            <div className={`device-display-workspace ${isFullscreen ? "fullscreen-mode" : ""}`}>
              <DeviceFrame
                deviceType={viewportDevice}
                title={displayTitle}
                isFullscreen={isFullscreen}
                onExitFullscreen={() => (presenting ? stopPresentation() : setIsFullscreen(false))}
                onEnterFullscreen={() => setIsFullscreen(true)}
              >
                {activeProject.isInteractive ? (
                  <Suspense fallback={<SimulatorFallback />}>
                    <Simulator deviceType={simulatorType} clientName={clientName} />
                  </Suspense>
                ) : embedSrc ? (
                  <iframe
                    src={embedSrc}
                    title={displayTitle}
                    style={{ width: "100%", height: "100%", border: "none", backgroundColor: "#080b11" }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : null}
              </DeviceFrame>
            </div>
          </main>

          <aside className="workspace-device-sidebar">
            <div className="device-buttons-column">
              {projectViewports.map((dev) => (
                <button
                  key={dev.viewport}
                  onClick={() => goTo(activeProject, dev.viewport, { replace: true })}
                  className={`device-vertical-btn ${viewportDevice === dev.viewport ? "active" : ""}`}
                >
                  <div className="vertical-btn-inner">
                    {renderIcon(dev.iconName, 14, "btn-device-icon")}
                    <span>{dev.label[lang] || dev.label.fr}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
