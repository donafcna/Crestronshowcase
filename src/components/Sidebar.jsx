import React from "react";
import { Icons } from "../icons";
import { useTranslation } from "../context/LanguageContext";
import { sectors } from "../data/projects";
import { Link, useRouter, buildShowcasePath } from "../router";

// Asset paths
const logoFrequenceTv = "/assets/logo-frequence-tv-5LGUrtbd.png";
const logoCrestron = "/assets/logo-crestron-CSWzrfLt.png";

// Date de build injectée par vite.config.js (define) — remplace la date
// saisie à la main dans les traductions.
const BUILD_DATE = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : "";

const formatDate = (iso, lang) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : lang === "de" ? "de-CH" : "fr-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const Sidebar = () => {
  const { t, lang } = useTranslation();
  const route = useRouter();
  const currentPage = route.page;
  const selectedSector = route.page === "showcase" ? route.sectorId : undefined;

  const renderIcon = (iconName, size = 18) => {
    const IconComp = Icons[iconName] || Icons.HelpCircle;
    return <IconComp size={size} />;
  };

  const navClass = (active, extra = "") => `nav-btn ${extra} ${active ? "active" : ""}`;

  return (
    <nav className="glass-panel sidebar-nav">
      {/* Brand Header */}
      <div className="brand-header">
        <Link to="/" className="brand-logo-container" aria-label="Accueil">
          <img src={logoCrestron} alt="Crestron" className="crestron-logo-img" />
        </Link>
        <span className="brand-subtitle">{t("brand_subtitle")}</span>
        <div className="brand-by-logo">
          <div className="frequencetv-logo-wrapper">
            <img src={logoFrequenceTv} alt="Fréquence TV" className="frequencetv-logo-img" />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        <h3 className="nav-section-title">{t("nav_title")}</h3>
        <ul className="nav-list">
          <li>
            <Link to="/" className={navClass(currentPage === "dashboard")}>
              {renderIcon("LayoutDashboard", 18)}
              <span>{t("nav_dashboard")}</span>
            </Link>
          </li>
          <li>
            <Link
              to={buildShowcasePath()}
              className={navClass(currentPage === "showcase" && !selectedSector)}
            >
              {renderIcon("Layers", 18)}
              <span>{t("nav_all_uis")}</span>
            </Link>
          </li>
          <li>
            <Link to="/pourquoi-ch5" className={navClass(currentPage === "why")}>
              {renderIcon("Sparkles", 18)}
              <span>{t("nav_why_ch5")}</span>
            </Link>
          </li>
          <li>
            <Link to="/contact" className={navClass(currentPage === "contact")}>
              {renderIcon("MessageSquare", 18)}
              <span>{t("nav_contact")}</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Business Sectors Navigation */}
      <div className="nav-section sectors-nav-section">
        <h3 className="nav-section-title">{t("nav_sectors")}</h3>
        <ul className="nav-list scrolling-list">
          {sectors.map((sector) => (
            <li key={sector.id}>
              <Link
                to={buildShowcasePath({ sectorId: sector.id })}
                className={navClass(currentPage === "showcase" && selectedSector === sector.id, "sector-btn")}
              >
                <span className="icon-wrapper">{renderIcon(sector.iconName, 18)}</span>
                <span className="sector-name">{t(`sector_${sector.id}_name`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Nav Footer : appel à l'action + date de mise à jour */}
      <div className="nav-footer">
        <Link to="/contact" className="btn btn-primary sidebar-cta">
          {renderIcon("CalendarCheck", 16)}
          <span>{t("nav_cta")}</span>
        </Link>
        {BUILD_DATE && (
          <div className="status-indicator">
            <span className="status-dot" />
            <span>
              {t("nav_updated")} {formatDate(BUILD_DATE, lang)}
            </span>
          </div>
        )}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        <Link to="/" className={`tab-item ${currentPage === "dashboard" ? "active" : ""}`}>
          {renderIcon("LayoutDashboard", 20)}
          <span>{t("nav_dashboard")}</span>
        </Link>
        <Link
          to={buildShowcasePath()}
          className={`tab-item ${currentPage === "showcase" ? "active" : ""}`}
        >
          {renderIcon("Layers", 20)}
          <span>{t("nav_all_uis")}</span>
        </Link>
        <Link to="/pourquoi-ch5" className={`tab-item ${currentPage === "why" ? "active" : ""}`}>
          {renderIcon("Sparkles", 20)}
          <span>CH5</span>
        </Link>
        <Link to="/contact" className={`tab-item ${currentPage === "contact" ? "active" : ""}`}>
          {renderIcon("MessageSquare", 20)}
          <span>{t("nav_contact")}</span>
        </Link>
      </div>
    </nav>
  );
};
