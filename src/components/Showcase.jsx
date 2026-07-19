import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { projects, devices } from "../data/projects";
import { BackgroundVideo } from "./BackgroundVideo";
import { DeviceViewport } from "./DeviceViewport";

// Simulators
import { VillaGemini } from "./simulators/VillaGemini";
import { HotelGeneva } from "./simulators/HotelGeneva";
import { CrestronHome } from "./simulators/CrestronHome";
import { YachtMonaco } from "./simulators/YachtMonaco";

export const Showcase = ({ initialSectorId, initialProjectId }) => {
  const { t } = useTranslation();
  const [selectedSectorId, setSelectedSectorId] = useState(initialSectorId);
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [viewportDevice, setViewportDevice] = useState("tablet");
  const [ledStatus] = useState("green");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [sentenceIndex, setSentenceIndex] = useState(0);

  useEffect(() => {
    if (initialSectorId !== undefined) {
      setSelectedSectorId(initialSectorId);
      const sectorProjects = projects.filter(
        (p) => !initialSectorId || p.sectors.includes(initialSectorId)
      );
      if (sectorProjects.length > 0) {
        const isCurrentInSector = activeProject && sectorProjects.some((p) => p.id === activeProject.id);
        if (!isCurrentInSector) {
          setActiveProject(sectorProjects[0]);
          setDefaultDeviceForProject(sectorProjects[0]);
          setExpandedProjectId(null);
        }
      }
    }
  }, [initialSectorId, activeProject]);

  useEffect(() => {
    if (initialProjectId) {
      const proj = projects.find((p) => p.id === initialProjectId);
      if (proj) {
        setActiveProject(proj);
        setDefaultDeviceForProject(proj);
        setExpandedProjectId(null);
      }
    }
  }, [initialProjectId]);

  const setDefaultDeviceForProject = (proj) => {
    if (proj.devices.includes("ios_tablet") || proj.devices.includes("android_tablet")) {
      setViewportDevice("tablet");
    } else if (proj.devices.includes("crestron")) {
      setViewportDevice("wallpanel");
    } else if (proj.devices.includes("ios_phone") || proj.devices.includes("android_phone")) {
      setViewportDevice("phone");
    } else {
      setViewportDevice("desktop");
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("workspace-maximized");
    } else {
      document.body.classList.remove("workspace-maximized");
    }
    return () => {
      document.body.classList.remove("workspace-maximized");
    };
  }, [isFullscreen]);

  // Sentence cycler effect for expanded details
  useEffect(() => {
    if (!expandedProjectId) return;
    const descriptionText = t(`proj_${getProjectKeyPrefix(activeProject.id)}_details`);
    const sentences = descriptionText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSentenceIndex(0);

    if (sentences.length <= 1) return;

    const interval = setInterval(() => {
      setSentenceIndex((prev) => (prev + 1) % sentences.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeProject.id, expandedProjectId]);

  const getDeviceViewportType = (dId) => {
    if (dId === "xpanel") return "desktop";
    if (dId === "crestron") return "wallpanel";
    if (dId === "tablet" || dId === "ios_tablet" || dId === "android_tablet") return "tablet";
    return "phone";
  };

  const getDeviceLabel = (dId) => {
    if (dId === "xpanel") return "PC Monitoring";
    if (dId === "crestron") return "Dalle tactile";
    if (dId === "tablet" || dId === "ios_tablet" || dId === "android_tablet") return "Tablette";
    return "Smartphone";
  };

  const getDeviceIconName = (dId) => {
    if (dId === "xpanel") return "Monitor";
    if (dId === "crestron") return "LayoutGrid";
    if (dId === "tablet" || dId === "ios_tablet" || dId === "android_tablet") return "Tablet";
    return "Smartphone";
  };

  const getProjectKeyPrefix = (projectId) => {
    let key = projectId.replace(/-/g, "_");
    if (key.includes("frequencetv")) {
      key = key.replace("frequencetv", "freq");
    }
    return key;
  };

  const renderIcon = (iconName, size = 14, className = "") => {
    const IconComp = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComp size={size} className={className} />;
  };

  const handleToggleProjectDetails = (e, projId) => {
    e.stopPropagation();
    if (expandedProjectId === projId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projId);
      const proj = projects.find((p) => p.id === projId);
      if (proj) {
        setActiveProject(proj);
        setDefaultDeviceForProject(proj);
      }
    }
  };

  const handleProjectClick = (proj) => {
    setActiveProject(proj);
    setDefaultDeviceForProject(proj);
  };

  // Filter projects only by active sector
  const filteredProjects = projects.filter((p) => {
    return !selectedSectorId || p.sectors.includes(selectedSectorId);
  });

  // Split description text into sentences for cycler
  const descriptionText = t(`proj_${getProjectKeyPrefix(activeProject.id)}_details`);
  const sentences = descriptionText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const currentSentence = sentences[sentenceIndex] || sentences[0] || "";

  return (
    <div className={`showcase-container fade-in sector-${selectedSectorId || "all"} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Background Video */}
      <BackgroundVideo sectionId={selectedSectorId || activeProject.sectors[0]} />

      {/* Main Workspace Container */}
      <div className={`main-workspace-container transparent-workspace ${isFullscreen ? "fullscreen-mode" : ""}`}>
        
        {/* 1. Projects Horizontal List (compact card style, no client description line) */}
        {!isFullscreen && (
          <section className="projects-horizontal-list-bar compact-header compact-cards-version">
            {filteredProjects.length === 0 ? (
              <div className="empty-projects-state glass-panel">
                {renderIcon("FolderOpen", 26, "empty-icon")}
                <p>{t("showcase_empty_projects")}</p>
              </div>
            ) : expandedProjectId ? (
              /* Morph to single project card with description details */
              <div className="project-expanded-layout fade-in compact-cards-expanded">
                <div className="project-list-card horizontal-card selected expanded-state compact-row-card">
                  <img
                    src={activeProject.thumbnailUrl}
                    alt={activeProject.name}
                    className="card-thumb-compact"
                  />
                  <div className="card-info-block-compact">
                    <span className="proj-name-compact">{activeProject.name}</span>
                    <button
                      onClick={(e) => handleToggleProjectDetails(e, activeProject.id)}
                      className="card-plus-btn-compact active"
                      title="Back to list"
                    >
                      {renderIcon("X", 10)}
                    </button>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="expanded-vertical-divider" />

                {/* Animated sentence cycler */}
                <div className="expanded-info-details">
                  <div className="description-cycler-container">
                    <p key={sentenceIndex} className="cycler-sentence-text fade-in-sentence">
                      {currentSentence}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal horizontal scrollbar view with compact single-row cards (no client description) */
              <div className="projects-horizontal-scroll-wrapper compact-cards-row">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleProjectClick(proj)}
                    className={`project-list-card horizontal-card glass-panel compact-row-card ${
                      activeProject.id === proj.id ? "selected" : "glass-panel-hover"
                    }`}
                  >
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.name}
                      className="card-thumb-compact"
                    />
                    <div className="card-info-block-compact">
                      <span className="proj-name-compact">{proj.name}</span>
                      <button
                        onClick={(e) => handleToggleProjectDetails(e, proj.id)}
                        className="card-plus-btn-compact"
                        title={t("showcase_details_tooltip") || "Plus d'infos"}
                      >
                        {renderIcon("Plus", 10)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fullscreen Overlay Header Row (only Frequence TV logo and Exit button in top right) */}
        {isFullscreen && (
          <div className="fullscreen-overlay-header">
            {/* Top Left is now empty */}
            <div className="fullscreen-overlay-header-left" />

            {/* Top Right contains Frequence TV logo pill + Close button */}
            <div className="fullscreen-overlay-header-right">
              <div className="fullscreen-frequencetv-logo-card">
                <img
                  src="/assets/logo-frequence-tv-5LGUrtbd.png"
                  alt="Frequence TV"
                  className="frequencetv-logo-img-fs"
                />
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="btn-workspace-maximize-fs"
                title="Exit Fullscreen"
              >
                {renderIcon("Minimize2", 18)}
              </button>
            </div>
          </div>
        )}

        {/* Row holding Simulator (left) and Vertical Device Selector (right) */}
        <div className="workspace-main-content-row">
          {/* Device Viewport Frame */}
          <main className="project-workspace">
            <div className="device-display-workspace">
              {!isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="btn-workspace-maximize"
                  title="Fullscreen Preview"
                >
                  {renderIcon("Maximize2", 16)}
                </button>
              )}

              <DeviceViewport
                deviceType={viewportDevice}
                ledStatus={ledStatus}
                title={activeProject.name}
              >
                {activeProject.isInteractive ? (
                  activeProject.id === "hotel-geneva" ? (
                    <HotelGeneva deviceType={viewportDevice} />
                  ) : activeProject.id === "crestron-home" ? (
                    <CrestronHome deviceType={viewportDevice} />
                  ) : activeProject.id === "yacht-monaco" ? (
                    <YachtMonaco deviceType={viewportDevice} />
                  ) : (
                    <VillaGemini deviceType={viewportDevice} />
                  )
                ) : activeProject.embedUrl ? (
                  <iframe
                    src={
                      viewportDevice === "phone" && activeProject.embedPhoneUrl
                        ? activeProject.embedPhoneUrl
                        : activeProject.embedUrl
                    }
                    title={activeProject.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      backgroundColor: "#080b11",
                    }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="static-mockup-wrapper">
                    <div className="static-overlay">
                      {renderIcon("Lock", 40, "lock-illustration")}
                      <h2>{t("showcase_static_mode")}</h2>
                      <p>
                        {t("showcase_ready_ch5")}{" "}
                        (<strong>{activeProject.name}</strong> - {viewportDevice.toUpperCase()})
                      </p>
                      <div className="spec-bullets">
                        <div className="spec-card glass-panel">
                          <span className="spec-name">{t("showcase_resolution")}</span>
                          <span className="spec-val">
                            {viewportDevice === "desktop" && "1920 x 1080 (HD)"}
                            {viewportDevice === "tablet" && "2048 x 1536 (Retina)"}
                            {viewportDevice === "wallpanel" && "1280 x 800 (TS1070)"}
                            {viewportDevice === "phone" && "1170 x 2532 (Super Retina)"}
                          </span>
                        </div>
                        <div className="spec-card glass-panel">
                          <span className="spec-name">{t("showcase_integration")}</span>
                          <span className="spec-val">Crestron HTML5 / CH5</span>
                        </div>
                      </div>
                    </div>

                    <div className="static-screen-design">
                      <div className="mock-grid">
                        <div className="mock-widget glass-panel">
                          {renderIcon("Lightbulb", 24, "mock-ic")}
                          <span>Lights Zone</span>
                        </div>
                        <div className="mock-widget glass-panel">
                          {renderIcon("Layers", 24, "mock-ic")}
                          <span>Scenes</span>
                        </div>
                        <div className="mock-widget glass-panel">
                          {renderIcon("VolumeX", 24, "mock-ic")}
                          <span>Mute Audio</span>
                        </div>
                        <div className="mock-widget glass-panel">
                          {renderIcon("Menu", 24, "mock-ic")}
                          <span>Blinds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DeviceViewport>
            </div>
          </main>

          {/* Vertical Device Selector (Transparent sidebar, title label removed, icons added) */}
          <aside className="workspace-device-sidebar">
            <div className="device-buttons-column">
              {activeProject.devices.map((dId) => {
                const dev = devices.find((d) => d.id === dId);
                if (!dev) return null;
                const type = getDeviceViewportType(dId);
                return (
                  <button
                    key={dId}
                    onClick={() => setViewportDevice(type)}
                    className={`device-vertical-btn ${viewportDevice === type ? "active" : ""}`}
                  >
                    <div className="vertical-btn-inner">
                      {renderIcon(getDeviceIconName(dId), 14, "btn-device-icon")}
                      <span>{getDeviceLabel(dId)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
