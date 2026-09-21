import React, { useEffect, useRef, useState } from "react";
import "./DashboardFilm.css";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { projects, sectors, devices, getProjectText, getProjectName, getStatusLabel } from "../data/showcaseProjects";
import { Link, buildShowcasePath } from "../router";


// Film vitrine : grands écrans uniquement. Sur petit écran, la vidéo n'est
// pas rendue du tout (aucun téléchargement) et l'accueil garde compteurs + bandeau.
const FILM_SRC = "/videos/ftv-film-v1.mp4";
const FILM_POSTER = "/videos/ftv-film-v1-poster.jpg";
const FILM_QUERY = "(min-width: 900px)";

const useMediaQuery = (query) => {
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
};

const FeaturedFilm = ({ label, ctaTo, ctaText, ctaIcon }) => {
  const ref = useRef(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [reduced]);
  return (
    <section className="dash-film glass-panel" aria-label={label}>
      <video
        ref={ref}
        className="dash-film-video"
        src={FILM_SRC}
        poster={FILM_POSTER}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload={reduced ? "none" : "auto"}
        controls={reduced}
        aria-label={label}
      />
      <div className="dash-film-overlay">
        <Link to={ctaTo} className="btn btn-primary dash-film-cta">
          {ctaIcon}
          <span>{ctaText}</span>
        </Link>
      </div>
    </section>
  );
};

export const Dashboard = () => {
  const { t, lang } = useTranslation();

  const getProjectsCountInSector = (sectorId) => projects.filter((p) => p.sectors.includes(sectorId)).length;

  const renderIcon = (iconName, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp className={className} />;
  };

  // En vedette : la première réalisation réelle, sinon le premier projet.
  const featuredProject = projects.find((p) => p.status === "realisation") || projects[0];
  const featuredText = getProjectText(featuredProject, lang);
  const deviceKinds = new Set(devices.map((d) => d.viewport)).size;
  const showFilm = useMediaQuery(FILM_QUERY);

  return (
    <div className="dashboard-container fade-in">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-text-block">
          <span className="hero-tagline">{t("hero_tagline")}</span>
          <h1>{t("hero_title")}</h1>
          <p>{t("hero_desc")}</p>
        </div>
      </section>

      {showFilm && featuredProject ? (
        <FeaturedFilm
          label={getProjectName(featuredProject, lang)}
          ctaTo={buildShowcasePath({ sectorId: featuredProject.sectors[0], projectId: featuredProject.id })}
          ctaText={t("proj_test_live")}
          ctaIcon={renderIcon("Sliders", "w-4 h-4")}
        />
      ) : (
        <>
        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card stat-blue glass-panel">
            {renderIcon("Folder", "stat-icon icon-blue")}
            <div className="stat-info">
              <span className="stat-value">{projects.length}</span>
              <span className="stat-label">{t("stat_projects_label")}</span>
            </div>
          </div>
          <div className="stat-card stat-cyan glass-panel">
            {renderIcon("LayoutGrid", "stat-icon icon-cyan")}
            <div className="stat-info">
              <span className="stat-value">{sectors.length}</span>
              <span className="stat-label">{t("stat_sectors_label")}</span>
            </div>
          </div>
          <div className="stat-card stat-purple glass-panel">
            {renderIcon("Smartphone", "stat-icon icon-purple")}
            <div className="stat-info">
              <span className="stat-value">{deviceKinds}</span>
              <span className="stat-label">{t("stat_devices_label")}</span>
            </div>
          </div>
          <div className="stat-card stat-green glass-panel">
            {renderIcon("Code2", "stat-icon icon-green")}
            <div className="stat-info">
              <span className="stat-value">{t("stat_tech_value")}</span>
              <span className="stat-label">{t("stat_tech_label")}</span>
            </div>
          </div>
        </section>

        {/* Featured Banner */}
        {featuredProject && (
          <section className="featured-banner-wrapper">
            <div className="glass-panel featured-banner">
              <div className="featured-image-side">
                <img src={featuredProject.thumbnailUrl} alt={getProjectName(featuredProject, lang)} loading="lazy" />
                <div className={`interactive-badge status-badge status-${featuredProject.status}`}>
                  {renderIcon(featuredProject.status === "realisation" ? "BadgeCheck" : "Play", "w-3 h-3")}
                  <span>{getStatusLabel(featuredProject.status, lang)}</span>
                </div>
              </div>
              <div className="featured-content-side">
                <span className="featured-tag">{t("proj_featured_tag")}</span>
                <h2>{getProjectName(featuredProject, lang)}</h2>
                <p>{featuredText.description}</p>
                <div className="featured-features">
                  {featuredText.features.slice(0, 3).map((feat) => (
                    <span key={feat} className="feat-chip">
                      {renderIcon("Check", "w-3 h-3")}
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
                <Link
                  to={buildShowcasePath({ sectorId: featuredProject.sectors[0], projectId: featuredProject.id })}
                  className="btn btn-primary"
                >
                  {renderIcon("Sliders", "w-4 h-4")}
                  <span>{t("proj_test_live")}</span>
                </Link>
              </div>
            </div>
          </section>
        )}
        </>
      )}

      {/* Sectors Section */}
      <section className="sectors-section">
        <h2 className="section-heading">{t("dash_browse_sectors")}</h2>
        <div className="grid-3 sectors-dashboard-grid">
          {sectors.map((sector) => {
            const count = getProjectsCountInSector(sector.id);
            return (
              <Link
                key={sector.id}
                to={buildShowcasePath({ sectorId: sector.id })}
                className="glass-panel glass-panel-hover sector-card-interactive"
              >
                <div className="sector-card-icon-header">
                  <div className="sector-icon-box">{renderIcon(sector.iconName)}</div>
                  <span className="projects-count">
                    {count} {t(count > 1 ? "dash_projects_count_many" : "dash_projects_count_one")}
                  </span>
                </div>
                <h3 className="sector-card-title">{t(`sector_${sector.id}_name`)}</h3>
                <p className="sector-card-desc">{t(`sector_${sector.id}_desc`)}</p>
                <div className="sector-card-action">
                  <span>{t("dash_view_interfaces")}</span>
                  {renderIcon("ArrowRight", "arrow-icon")}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="dash-cta glass-panel">
        <div className="dash-cta-text">
          <h2>{t("dash_cta_title")}</h2>
          <p>{t("dash_cta_text")}</p>
        </div>
        <div className="dash-cta-actions">
          <Link to="/contact" className="btn btn-primary">
            {renderIcon("CalendarCheck", "w-4 h-4")}
            <span>{t("nav_cta")}</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
