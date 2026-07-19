import React from "react";
import * as Icons from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { projects, sectors, devices } from "../data/projects";

export const Dashboard = ({ onNavigateToSector, onNavigateToProject }) => {
  const { t } = useTranslation();

  const getProjectsCountInSector = (sectorId) => {
    return projects.filter((p) => p.sectors.includes(sectorId)).length;
  };

  const getProjectKeyPrefix = (projectId) => {
    let key = projectId.replace(/-/g, "_");
    if (key.includes("frequencetv")) {
      key = key.replace("frequencetv", "freq");
    }
    return `proj_${key}`;
  };

  const renderIcon = (iconName, className = "") => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp className={className} />;
  };

  // Find the featured interactive project
  const featuredProject = projects.find((p) => p.isInteractive) || projects[0];

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
            <span className="stat-value">{devices.length}</span>
            <span className="stat-label">{t("stat_devices_label")}</span>
          </div>
        </div>
        <div className="stat-card stat-green glass-panel">
          {renderIcon("Activity", "stat-icon icon-green")}
          <div className="stat-info">
            <span className="stat-value">{t("stat_live")}</span>
            <span className="stat-label">{t("stat_sim_label")}</span>
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      {featuredProject && (
        <section className="featured-banner-wrapper">
          <div className="glass-panel featured-banner">
            <div className="featured-image-side">
              <img src={featuredProject.thumbnailUrl} alt={featuredProject.name} />
              <div className="interactive-badge">
                {renderIcon("Play", "w-3 h-3")}
                <span>Simulateur Live</span>
              </div>
            </div>
            <div className="featured-content-side">
              <span className="featured-tag">{t("proj_featured_tag")}</span>
              <h2>{featuredProject.name}</h2>
              <p>{t(`${getProjectKeyPrefix(featuredProject.id)}_desc`)}</p>
              <div className="featured-features">
                {featuredProject.features.slice(0, 3).map((feat, idx) => (
                  <span key={idx} className="feat-chip">
                    {renderIcon("Check", "w-3 h-3")}
                    <span>{t(`${getProjectKeyPrefix(featuredProject.id)}_f${idx + 1}`)}</span>
                  </span>
                ))}
              </div>
              <button
                onClick={() => onNavigateToProject(featuredProject.id)}
                className="btn btn-primary"
              >
                {renderIcon("Sliders", "w-4 h-4")}
                <span>{t("proj_test_live")}</span>
              </button>
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
              <div
                key={sector.id}
                onClick={() => onNavigateToSector(sector.id)}
                className="glass-panel glass-panel-hover sector-card-interactive"
              >
                <div className="sector-card-icon-header">
                  <div className="sector-icon-box">
                    {renderIcon(sector.iconName)}
                  </div>
                  <span className="projects-count">
                    {count}{" "}
                    {t(count > 1 ? "dash_projects_count_many" : "dash_projects_count_one")}
                  </span>
                </div>
                <h3 className="sector-card-title">{t(`sector_${sector.id}_name`)}</h3>
                <p className="sector-card-desc">{t(`sector_${sector.id}_desc`)}</p>
                <div className="sector-card-action">
                  <span>{t("dash_view_interfaces")}</span>
                  {renderIcon("ArrowRight", "arrow-icon")}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
