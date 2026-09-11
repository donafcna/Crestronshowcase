import { useCallback, useEffect, useSyncExternalStore } from "react";
import { DEV_MODE_DEFAULT } from "../data/devConfig";

// Mode Dev : badge « MODE DEV » + mesures d'écran au-dessus du châssis.
//
// Le choix est mémorisé dans le navigateur (localStorage), donc il survit à
// la navigation et aux rechargements — aucun push git nécessaire :
//   <n'importe quelle adresse>/1 → active, <adresse>/0 → désactive (le suffixe est retiré,
//   on reste sur la page) — ex. crestrongui.vercel.app/interfaces/residentiel/villa-gemini-frequencetv/wallpanel/1
//   ?dev=1 / ?dev=0 sur n'importe quelle page → même effet
//   Ctrl + Alt + D → bascule ; clic sur le badge → désactive
// Sans choix mémorisé, c'est DEV_MODE_DEFAULT (src/data/devConfig.js) qui
// s'applique. Le réglage est propre à chaque navigateur / appareil.

const STORAGE_KEY = "ftv-dev-mode";
const listeners = new Set();

const readStored = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    /* localStorage indisponible (navigation privée stricte) */
  }
  return DEV_MODE_DEFAULT;
};

export const setDevModeStored = (on) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
};

// À appeler AVANT le rendu (main.jsx) : gère /1, /0 et ?dev=… dans l'URL.
export const applyDevModeFromUrl = () => {
  const { pathname, search, hash } = window.location;
  // « /1 » ou « /0 » ajouté à N'IMPORTE QUELLE adresse (racine, /interfaces/…, /fiche/…) :
  // active / désactive, puis retire le suffixe et reste sur la page courante.
  const m = pathname.match(/^(.*?)\/([01])\/?$/);
  if (m) {
    setDevModeStored(m[2] === "1");
    window.history.replaceState(null, "", `${m[1] || "/"}${search}${hash}`);
    return;
  }
  const dev = new URLSearchParams(search).get("dev");
  if (dev === "1" || dev === "true") setDevModeStored(true);
  else if (dev === "0" || dev === "false") setDevModeStored(false);
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

export const useDevMode = () => {
  const devMode = useSyncExternalStore(subscribe, readStored, () => DEV_MODE_DEFAULT);
  const setDevMode = useCallback((on) => setDevModeStored(!!on), []);
  const toggle = useCallback(() => setDevModeStored(!readStored()), []);
  return { devMode, setDevMode, toggle };
};

// Raccourci clavier Ctrl + Alt + D (à monter une seule fois, dans App).
export const useDevModeShortcut = () => {
  const { toggle } = useDevMode();
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.altKey && !e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);
};
