import { useCallback, useSyncExternalStore } from "react";

// Onglet « Vue 3D » des GUI Boutique et Yacht, demandé par l'URL (27.09.2026).
//
// La maquette 3D embarquée dans le châssis n'est pas encore au point : l'onglet
// est masqué par défaut et gardé de côté, sur le modèle de /3 et /4 du plein écran :
//   <n'importe quelle adresse>/5 → l'onglet Vue 3D revient dans les GUI
//   <n'importe quelle adresse>/6 → l'onglet disparaît à nouveau
// Le suffixe est retiré de l'adresse et le choix est mémorisé par navigateur.
// Le modèle 3D de fond du site n'est pas concerné.

const STORAGE_KEY = "ftv-gui-3d-tab";
const listeners = new Set();

export const readGui3dTab = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* localStorage indisponible */
  }
  return false;
};

export const setGui3dTabStored = (on) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
};

// À appeler AVANT le rendu (main.jsx) : gère /5 et /6 dans l'adresse.
export const applyGui3dTabFromUrl = () => {
  const { pathname, search, hash } = window.location;
  const m = pathname.match(/^(.*?)\/([56])\/?$/);
  if (!m) return;
  setGui3dTabStored(m[2] === "5");
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

export const useGui3dTab = () => {
  const gui3dTab = useSyncExternalStore(subscribe, readGui3dTab, () => false);
  const setGui3dTab = useCallback((on) => setGui3dTabStored(!!on), []);
  return { gui3dTab, setGui3dTab };
};
