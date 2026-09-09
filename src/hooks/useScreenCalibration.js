import { useCallback, useSyncExternalStore } from "react";

// Calibrage « Taille réelle » : un navigateur ne connaît pas la taille physique de
// l'écran. On part de sa diagonale (pouces, réglable dans le bandeau du mode Dev,
// mémorisée dans ce navigateur) et de sa résolution en px CSS pour obtenir le
// nombre de px CSS par millimètre ; les châssis « Taille réelle » sont alors
// affichés à leurs dimensions physiques (devices.js : physicalW / physicalH en mm).
// Sans réglage : 15,6″ (écran d'ordinateur portable courant).
const STORAGE_KEY = "ftv-screen-diagonal";
export const DEFAULT_DIAGONAL_INCHES = 15.6;
const listeners = new Set();

const readStored = () => {
  try {
    const v = parseFloat(window.localStorage.getItem(STORAGE_KEY));
    if (v >= 4 && v <= 120) return v;
  } catch {
    /* localStorage indisponible */
  }
  return DEFAULT_DIAGONAL_INCHES;
};

export const setScreenDiagonalStored = (inches) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(inches));
  } catch {
    /* ignoré */
  }
  listeners.forEach((l) => l());
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// px CSS par mm pour une diagonale donnée (résolution CSS de l'écran, pas de la fenêtre)
export const pxPerMmFor = (inches) => {
  if (typeof window === "undefined" || !window.screen) return 96 / 25.4;
  const w = window.screen.width || 1920;
  const h = window.screen.height || 1080;
  const diagPx = Math.sqrt(w * w + h * h);
  return diagPx / (inches * 25.4);
};

export const useScreenCalibration = () => {
  const diagonal = useSyncExternalStore(subscribe, readStored, () => DEFAULT_DIAGONAL_INCHES);
  const setDiagonal = useCallback((v) => {
    const n = parseFloat(v);
    if (n >= 4 && n <= 120) setScreenDiagonalStored(n);
  }, []);
  return { diagonal, setDiagonal, pxPerMm: pxPerMmFor(diagonal) };
};
