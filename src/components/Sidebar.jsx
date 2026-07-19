import React from "react";
import * as Icons from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { sectors } from "../data/projects";

// Asset paths
const logoFrequenceTv = "/assets/logo-frequence-tv-5LGUrtbd.png";
const logoCrestron = "/assets/logo-crestron-CSWzrfLt.png";

export const Sidebar = ({ currentPage, selectedSector, onPageChange, onSectorSelect }) => {
  const { t } = useTranslation();

  const handleSectorClick = (sectorId) => {
    onSectorSelect(sectorId);
    onPageChange("showcase");
  };

  const renderIcon = (iconName, size = 18) => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} />;
  };

  return (
    <nav className="glass-panel sidebar-nav">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-container">
          <img src={logoCrestron} alt="Crestron" className="crestron-logo-img" />
        </div>
        <span className="brand-subtitle">{t("brand_subtitle")}</span>
        <div className="brand-by-logo">
          <div className="frequencetv-logo-wrapper">
            <img
              src={logoFrequenceTv}
              alt="Frequence TV"
              className="frequencetv-logo-img"
            />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        <h3 className="nav-section-title">{t("nav_title")}</h3>
        <ul className="nav-list">
          <li>
            <button
              onClick={() => onPageChange("dashboard")}
              className={`nav-btn ${currentPage === "dashboard" ? "active" : ""}`}
            >
              {renderIcon("LayoutDashboard", 18)}
              <span>{t("nav_dashboard")}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectorClick(null)}
              className={`nav-btn ${
                currentPage === "showcase" && selectedSector === null ? "active" : ""
              }`}
            >
              {renderIcon("Layers", 18)}
              <span>{t("nav_all_uis")}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Business Sectors Navigation */}
      <div className="nav-section sectors-nav-section">
        <h3 className="nav-section-title">{t("nav_sectors")}</h3>
        <ul className="nav-list scrolling-list">
          {sectors.map((sector) => (
            <li key={sector.id}>
              <button
                onClick={() => handleSectorClick(sector.id)}
                className={`nav-btn sector-btn ${
                  currentPage === "showcase" && selectedSector === sector.id ? "active" : ""
                }`}
              >
                <span className="icon-wrapper">{renderIcon(sector.iconName, 18)}</span>
                <span className="sector-name">{t(`sector_${sector.id}_name`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Nav Footer */}
      <div className="nav-footer">
        <div className="status-indicator">
          <span className="status-dot" />
          <span>{t("nav_ready")}</span>
        </div>
        <div className="version-tag">v1.0.0 (Capacitor)</div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        <button
          onClick={() => onPageChange("dashboard")}
          className={`tab-item ${currentPage === "dashboard" ? "active" : ""}`}
        >
          {renderIcon("LayoutDashboard", 20)}
          <span>{t("nav_dashboard")}</span>
        </button>
        <button
          onClick={() => handleSectorClick(null)}
          className={`tab-item ${
            currentPage === "showcase" && selectedSector === null ? "active" : ""
          }`}
        >
          {renderIcon("Layers", 20)}
          <span>{t("nav_all_uis")}</span>
        </button>
        <button
          onClick={() => handleSectorClick("residentiel")}
          className={`tab-item ${
            currentPage === "showcase" && selectedSector === "residentiel" ? "active" : ""
          }`}
        >
          {renderIcon("Home", 20)}
          <span>{t("sector_residentiel_name")}</span>
        </button>
        <button
          onClick={() => handleSectorClick("yacht")}
          className={`tab-item ${
            currentPage === "showcase" && selectedSector === "yacht" ? "active" : ""
          }`}
        >
          {renderIcon("Ship", 20)}
          <span>{t("sector_yacht_name")}</span>
        </button>
        <button
          onClick={() => handleSectorClick("hotellerie")}
          className={`tab-item ${
            currentPage === "showcase" &&
            selectedSector !== null &&
            selectedSector !== "residentiel" &&
            selectedSector !== "yacht"
              ? "active"
              : ""
          }`}
        >
          {renderIcon("LayoutGrid", 20)}
          <span>{t("nav_sectors")}</span>
        </button>
      </div>
    </nav>
  );
};
