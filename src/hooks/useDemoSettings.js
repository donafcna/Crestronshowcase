import { useCallback } from "react";
import { useRouter } from "../router";

// Réglages de démonstration portés par l'URL (donc partageables) :
//   ?client=Nom   → nom du client affiché sur l'appareil / dans les titres
//   ?kiosk=1      → mode salon (plein écran + défilement automatique)
export const useDemoSettings = () => {
  const { query, setQuery } = useRouter();
  const clientName = (query.client || "").trim();
  const kiosk = query.kiosk === "1" || query.kiosk === "true";

  const setClientName = useCallback((name) => setQuery({ client: (name || "").trim() }), [setQuery]);
  const setKiosk = useCallback((on) => setQuery({ kiosk: on ? "1" : null }), [setQuery]);

  return { clientName, setClientName, kiosk, setKiosk };
};
