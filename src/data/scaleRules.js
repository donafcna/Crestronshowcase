// ===== Règles d'affichage des châssis (Taille réelle / Responsive) =====
// Toutes les règles de dimensionnement se pilotent ICI — un seul fichier.
//
// Le châssis est dessiné à sa taille de conception (devices.js : 1 px CSS =
// 1 px de l'écran réel, donc 100 % = « taille réelle ») puis mis à l'échelle
// une seule fois (transform: scale) pour tenir dans la zone disponible.
// Échelle « Taille réelle » d'un appareil : ses dimensions physiques (mm) converties en px CSS
// avec le calibrage de l'écran (useScreenCalibration : px CSS par mm, déduit de la diagonale de
// l'écran réglée en mode Dev) rapportées à la taille de conception du châssis. Sans dimensions
// physiques (Xpanel), 1 px de conception = 1 px d'écran.
export const realSizeScale = (device, pxPerMm = 96 / 25.4) =>
  device.physicalW ? (device.physicalW * pxPerMm) / device.chassisW : 1;

export const SCALE_RULES = {
  // Air conservé autour du châssis (0.03 = 3 % de chaque côté) : ombres,
  // bouton plein écran, coins arrondis.
  margin: 0.03,
  // Idem en plein écran : quasi nulle, l'objectif est d'agrandir le châssis au maximum.
  fullscreenMargin: 0.005,

  // Mode Responsive : agrandissement maximal autorisé au-delà de 100 %
  // (1.6 = 160 %). Au-delà, les photos et vidéos de fond commencent à se
  // dégrader. Mettre 1 pour interdire tout agrandissement.
  maxUpscale: 1.6,

  // Mode Responsive : rétrécissement minimal. En dessous, on considère que
  // l'écran est trop petit (information affichée dans la légende).
  minDownscale: 0.25,

  // « Taille réelle » n'est proposée que si le châssis à 100 % tient dans la
  // zone disponible, marge comprise. Tolérance : 0.97 = accepté si au moins
  // 97 % tiendrait (évite de refuser pour quelques pixels) — le châssis est
  // alors affiché à 100 % exactement, légèrement rogné dans la marge.
  realSizeTolerance: 0.97,

  // Mode par défaut à l'ouverture d'une page : "auto" (Responsive) ou "real".
  defaultMode: "auto",
};
