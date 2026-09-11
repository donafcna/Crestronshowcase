import { useCallback, useSyncExternalStore } from "react";

// Calibrage « Taille réelle » : un navigateur ne connaît pas la taille physique de
// l'écran (aucune API). Par défaut on applique la convention CSS (96 px par pouce,
// juste sur un écran de bureau classique, trop petit sur un portable haute densité).
// Le visiteur peut calibrer en un geste avec une carte bancaire (CalibrateCard) :
// le nombre de px CSS par millimètre est alors mémorisé dans ce navigateur.
const STORAGE_KEY = "ftv-px-per-mm";
export const CSS_PX_PER_MM = 96 / 25.4; // 3,78 px/mm
const MIN = 1.5;
const MAX = 12;
const listeners = new Set();

const readStored = () => {
  try {
    const v = parseFloat(window.localStorage.getItem(STORAGE_KEY));
    if (v >= MIN && v <= MAX) return v;
  } catch {
    /* localStorage indisponible */
  }
  return null; // non calibré → convention CSS
};

const notify = () => listeners.forEach((l) => l());

export const setPxPerMmStored = (v) => {
  try {
    if (v === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
    /* ignoré */
  }
  notify();
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useScreenCalibration = () => {
  const stored = useSyncExternalStore(subscribe, readStored, () => null);
  const setPxPerMm = useCallback((v) => {
    const n = parseFloat(v);
    if (n >= MIN && n <= MAX) setPxPerMmStored(Math.round(n * 1000) / 1000);
  }, []);
  const reset = useCallback(() => setPxPerMmStored(null), []);
  return { pxPerMm: stored ?? CSS_PX_PER_MM, calibrated: stored !== null, setPxPerMm, reset, min: MIN, max: MAX };
};
