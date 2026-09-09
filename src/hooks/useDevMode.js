import { useCallback, useEffect } from "react";
import { useRouter } from "../router";
import { DEV_MODE_DEFAULT } from "../data/devConfig";

// Mode Dev : badge « MODE DEV » + mesures d'écran au-dessus du châssis.
// Source de vérité : DEV_MODE_DEFAULT (src/data/devConfig.js), surchargé par
// ?dev=1 / ?dev=0 dans l'URL (donc partageable et conservé de page en page).
export const useDevMode = () => {
  const { query, setQuery } = useRouter();
  const param = query.dev;
  const devMode =
    param === undefined ? DEV_MODE_DEFAULT : param === "1" || param === "true";

  const setDevMode = useCallback(
    (on) => setQuery({ dev: on === DEV_MODE_DEFAULT ? null : on ? "1" : "0" }),
    [setQuery]
  );
  const toggle = useCallback(() => setDevMode(!devMode), [devMode, setDevMode]);

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
