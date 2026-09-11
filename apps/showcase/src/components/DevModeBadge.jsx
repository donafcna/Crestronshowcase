import React from "react";
import { useDevMode } from "../hooks/useDevMode";

// Étiquette « MODE DEV » en haut à gauche, au premier plan (par-dessus le
// logo Crestron de la barre latérale et le bandeau plein écran).
// Un clic la masque ; Ctrl + Alt + D la réaffiche.
export const DevModeBadge = () => {
  const { devMode, toggle } = useDevMode();
  if (!devMode) return null;
  return (
    <button
      type="button"
      className="dev-mode-badge"
      onClick={toggle}
      title="Mode Dev actif — clic pour masquer (Ctrl+Alt+D pour réafficher)"
    >
      <span className="dev-mode-badge-dot" />
      MODE DEV
    </button>
  );
};
