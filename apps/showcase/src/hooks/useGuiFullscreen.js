import { useCallback, useSyncExternalStore } from "react";

// Plein écran de la GUI, demandé par l'URL (14.09.2026).
//
// Le bouton « Plein écran » de la barre d'outils est caché : il faisait doublon
// avec le bouton Scène du châssis. Le plein écran reste accessible par l'adresse,
// sur le modèle de /1 et /0 du Mode Dev :
//   <n'importe quelle adresse>/3 → la GUI occupe toute la fenêtre (ni châssis, ni
//                                  colonnes, ni barre de projets)
//   <n'importe quelle adresse>/4 → retour au Mode normal
// Le suffixe est retiré de l'adresse et le choix est mémorisé par navigateur, donc
// il survit à la navigation et au rechargement. Échappatoire clavier : Échap.
//
// Vocabulaire : « Plein écran » ici = la GUI brute seule, à ne pas confondre avec
// le Mode Scène (bouton d'angle du châssis, colonne de droite conservée).

const STORAGE_KEY = "ftv-gui-fullscreen";
const listeners = new Set();

const readStored = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* localStorage indisponible (navigation privée stricte) */
  }
  return false;
};

export const setGuiFullscreenStored = (on) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
};

// À appeler AVANT le rendu (main.jsx) : gère /3 et /4 dans l'adresse.
export const applyGuiFullscreenFromUrl = () => {
  const { pathname, search, hash } = window.location;
  const m = pathname.match(/^(.*?)\/([34])\/?$/);
  if (!m) return;
  setGuiFullscreenStored(m[2] === "3");
  window.history.replaceState(null, "", `${m[1] || "/"}${search}${hash}`);
};

const subscribe = (fn) => {
  listeners.add(fn);
  const onStorage = (e) => e.key === STORAGE_KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
};

export const useGuiFullscreen = () => {
  const guiFullscreen = useSyncExternalStore(subscribe, readStored, () => false);
  const setGuiFullscreen = useCallback((on) => setGuiFullscreenStored(!!on), []);
  return { guiFullscreen, setGuiFullscreen };
};
