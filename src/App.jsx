import React, { Suspense, lazy, useEffect, useState } from "react";
import { Icons } from "./icons";
import { useTranslation } from "./context/LanguageContext";
import { useRouter, Link } from "./router";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Showcase } from "./components/Showcase";
import { DemoMode, isMobileDevice } from "./components/DemoMode";

// Pages secondaires chargées à la demande (perf. première visite)
const WhyCH5 = lazy(() => import("./pages/WhyCH5"));
const Contact = lazy(() => import("./pages/Contact"));
const ProjectSheet = lazy(() => import("./pages/ProjectSheet"));

const PageLoader = () => (
  <div className="simulator-loading">
    <div className="page-loader-spinner" />
  </div>
);

const LANG_FLAGS = { fr: "🇫🇷", en: "🇬🇧", de: "🇩🇪" };

const readHashRoute = () => window.location.hash.replace(/^#\/?/, "");

function App() {
  const route = useRouter();
  const { lang, changeLanguage, supportedLangs } = useTranslation();
  const [hashRoute, setHashRoute] = useState(readHashRoute);

  // Mode démo mobile (#demo, #demo/<projectId>) — indépendant du routeur
  // History API pour rester compatible avec tous les rewrites Vercel.
  useEffect(() => {
    const onHashChange = () => setHashRoute(readHashRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Sur un vrai téléphone / tablette arrivant sur la racine du site (sans
  // lien profond partagé ni paramètres), ouvrir l'outil de démo marketing.
  useEffect(() => {
    if (
      window.location.pathname === "/" &&
      !window.location.hash &&
      !window.location.search &&
      isMobileDevice()
    ) {
      window.location.replace("#demo");
    }
  }, []);

  if (hashRoute === "demo" || hashRoute.startsWith("demo/")) {
    return (
      <DemoMode
        route={hashRoute}
        onNavigate={(r) => {
          window.location.hash = r ? `#${r}` : "";
        }}
        onExitDemo={() => {
          window.location.hash = "#site";
        }}
      />
    );
  }

  // Fiche projet imprimable : page autonome, sans navigation.
  if (route.page === "sheet") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProjectSheet projectId={route.projectId} />
      </Suspense>
    );
  }

  return (
    <React.Fragment>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Workspace Area */}
      <div className="app-workspace-view">
        {/* Global Language Selector */}
        <div className="global-lang-selector">
          <Icons.Globe size={16} style={{ opacity: 0.8 }} />
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            className="global-lang-select"
            aria-label="Langue"
          >
            {supportedLangs.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()} {LANG_FLAGS[l] || ""}
              </option>
            ))}
          </select>
        </div>

        {/* Page Switcher */}
        {route.page === "dashboard" ? (
          <Dashboard />
        ) : route.page === "showcase" ? (
          <Showcase
            sectorId={route.sectorId}
            projectId={route.projectId}
            device={route.device}
          />
        ) : route.page === "why" ? (
          <Suspense fallback={<PageLoader />}>
            <WhyCH5 />
          </Suspense>
        ) : route.page === "contact" ? (
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        ) : (
          <div className="notfound-page fade-in">
            <h1>404</h1>
            <p>Page introuvable / Page not found</p>
            <Link to="/" className="btn btn-primary">
              <Icons.Home size={16} />
              <span>Accueil</span>
            </Link>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default App;
