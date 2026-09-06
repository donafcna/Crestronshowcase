import React from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { projects, sectors, devices, getProjectText, getProjectName, getStatusLabel } from "../data/projects";
import { Link, buildShowcasePath } from "../router";

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

  return (
    <div className="dashboard-container fade-in">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-text-block">
          <span className="hero-tagline">{t("hero_tagline")}</span>
          <h1>{t("hero_title")}</h1>
          <p>{t("hero_desc")}</p>
          <div className="hero-actions">
            <Link to={buildShowcasePath()} className="btn btn-primary">
              {renderIcon("Layers", "w-4 h-4")}
              <span>{t("nav_all_uis")}</span>
            </Link>
            <Link to="/pourquoi-ch5" className="btn btn-secondary">
              {renderIcon("Sparkles", "w-4 h-4")}
              <span>{t("dash_why_btn")}</span>
            </Link>
          </div>
        </div>
      </section>

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
          <Link to="/pourquoi-ch5" className="btn btn-secondary">
            {renderIcon("Sparkles", "w-4 h-4")}
            <span>{t("dash_why_btn")}</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
