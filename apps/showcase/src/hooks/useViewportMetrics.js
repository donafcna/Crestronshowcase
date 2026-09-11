import { useEffect, useState } from "react";

// Mesures de l'écran physique et de la fenêtre du navigateur, rafraîchies
// au redimensionnement / changement de zoom / rotation.
const read = () => ({
  windowW: window.innerWidth,
  windowH: window.innerHeight,
  screenW: window.screen?.width || 0,
  screenH: window.screen?.height || 0,
  dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
});

export const useViewportMetrics = () => {
  const [m, setM] = useState(read);
  useEffect(() => {
    const update = () => setM(read());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);
  return m;
};
