import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useTranslation } from "./context/LanguageContext";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Showcase } from "./components/Showcase";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { lang, changeLanguage } = useTranslation();

  const handleNavigateToSector = (sectorId) => {
    setSelectedSector(sectorId);
    setSelectedProject(null);
    setCurrentPage("showcase");
  };

  const handleNavigateToProject = (projectId) => {
    setSelectedProject(projectId);
    setSelectedSector(null);
    setCurrentPage("showcase");
  };

  return (
    <React.Fragment>
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        selectedSector={selectedSector}
        onPageChange={setCurrentPage}
        onSectorSelect={setSelectedSector}
      />

      {/* Workspace Area */}
      <div className="app-workspace-view">
        {/* Global Language Selector */}
        <div className="global-lang-selector">
          <Icons.Globe size={16} style={{ opacity: 0.8 }} />
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="global-lang-select"
          >
            <option value="fr">FR 🇫🇷</option>
            <option value="en">EN 🇬🇧</option>
            <option value="de">DE 🇩🇪</option>
            <option value="es">ES 🇪🇸</option>
            <option value="ru">RU 🇷🇺</option>
            <option value="ar">AR 🇸🇦</option>
            <option value="zh">ZH 🇨🇳</option>
          </select>
        </div>

        {/* Page Switcher */}
        {currentPage === "dashboard" ? (
          <Dashboard
            onNavigateToSector={handleNavigateToSector}
            onNavigateToProject={handleNavigateToProject}
          />
        ) : (
          <Showcase
            initialSectorId={selectedSector}
            initialProjectId={selectedProject}
          />
        )}
      </div>
    </React.Fragment>
  );
}

export default App;
