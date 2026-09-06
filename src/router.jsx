import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ----------------------------------------------------------------------------
// Mini-routeur (History API) sans dépendance.
//
// Schéma d'URL public — chaque écran a une adresse partageable :
//   /                                        tableau de bord
//   /interfaces                              toutes les interfaces
//   /interfaces/:secteur                     filtre par secteur ("tous" = aucun)
//   /interfaces/:secteur/:projet             projet sélectionné
//   /interfaces/:secteur/:projet/:support    + support affiché
//                                            (phone | tablet | wallpanel |
//                                             wallpanel_hd | desktop)
//   /pourquoi-ch5                            argumentaire HTML5 / CH5
//   /contact                                 coordonnées + demande de démo
//   /fiche/:projet                           fiche projet imprimable (PDF)
//
// Paramètres de requête optionnels (conservés lors de la navigation) :
//   ?client=Villa+Dupont   personnalise le nom affiché sur l'appareil
//   ?kiosk=1               mode salon : plein écran + défilement automatique
//   ?lang=fr|en|de         force la langue
// ----------------------------------------------------------------------------

const RouterContext = createContext(undefined);

export const parsePath = (pathname) => {
  const parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { page: "dashboard" };
  const [head, a, b, c] = parts;
  switch (head) {
    case "interfaces":
      return {
        page: "showcase",
        sectorId: a && a !== "tous" ? a : null,
        projectId: b || null,
        device: c || null,
      };
    case "pourquoi-ch5":
      return { page: "why" };
    case "contact":
      return { page: "contact" };
    case "fiche":
      return { page: "sheet", projectId: a || null };
    default:
      return { page: "notfound" };
  }
};

export const buildShowcasePath = ({ sectorId, projectId, device } = {}) => {
  let p = "/interfaces";
  if (projectId) {
    p += `/${sectorId || "tous"}/${projectId}`;
    if (device) p += `/${device}`;
  } else if (sectorId) {
    p += `/${sectorId}`;
  }
  return p;
};

const readLocation = () => ({
  pathname: window.location.pathname,
  search: window.location.search,
});

export const RouterProvider = ({ children }) => {
  const [loc, setLoc] = useState(readLocation);

  useEffect(() => {
    const onPop = () => setLoc(readLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to, { replace = false, keepQuery = true } = {}) => {
    const current = readLocation();
    let target = to;
    // Conserve ?client= / ?kiosk= / ?lang= d'une page à l'autre.
    if (keepQuery && !to.includes("?") && current.search) {
      target = `${to}${current.search}`;
    }
    if (`${current.pathname}${current.search}` === target) return;
    if (replace) window.history.replaceState(null, "", target);
    else window.history.pushState(null, "", target);
    setLoc(readLocation());
    if (!replace) window.scrollTo?.(0, 0);
  }, []);

  const setQuery = useCallback((updates, { replace = true } = {}) => {
    const current = readLocation();
    const params = new URLSearchParams(current.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    const target = `${current.pathname}${qs ? `?${qs}` : ""}`;
    if (replace) window.history.replaceState(null, "", target);
    else window.history.pushState(null, "", target);
    setLoc(readLocation());
  }, []);

  const value = useMemo(() => {
    const route = parsePath(loc.pathname);
    const query = Object.fromEntries(new URLSearchParams(loc.search).entries());
    return { ...route, pathname: loc.pathname, search: loc.search, query, navigate, setQuery };
  }, [loc, navigate, setQuery]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
};

// Lien interne : <Link to="/contact">…</Link> — ouvre dans un nouvel onglet
// avec Ctrl/Cmd-clic comme un vrai lien.
export const Link = ({ to, children, className, onClick, ...rest }) => {
  const { navigate } = useRouter();
  const handle = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} className={className} onClick={handle} {...rest}>
      {children}
    </a>
  );
};
