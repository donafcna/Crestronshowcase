import { useCallback } from "react";
import { useRouter } from "../router";
import { SCALE_RULES } from "../data/scaleRules";

// Réglages de démonstration portés par l'URL (donc partageables) :
//   ?client=Nom   → nom du client affiché sur l'appareil / dans les titres
//   ?kiosk=1      → mode salon (plein écran + défilement automatique)
//   ?scale=real   → châssis à taille réelle (100 %) ; ?scale=auto → responsive
export const useDemoSettings = () => {
  const { query, setQuery } = useRouter();
  const clientName = (query.client || "").trim();
  const kiosk = query.kiosk === "1" || query.kiosk === "true";
  const scaleMode = query.scale === "real" || query.scale === "auto" ? query.scale : SCALE_RULES.defaultMode;

  const setClientName = useCallback((name) => setQuery({ client: (name || "").trim() }), [setQuery]);
  const setKiosk = useCallback((on) => setQuery({ kiosk: on ? "1" : null }), [setQuery]);
  const setScaleMode = useCallback(
    (mode) => setQuery({ scale: mode === SCALE_RULES.defaultMode ? null : mode }),
    [setQuery]
  );

  return { clientName, setClientName, kiosk, setKiosk, scaleMode, setScaleMode };
};
