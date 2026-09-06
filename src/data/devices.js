// Résolutions de référence pour chaque support, confirmées avec le client :
// - Dalle tactile Crestron TSW-1070 : 1280 x 800 (WXGA natif, 16:10)
// - PC Monitoring / Xpanel        : 1920 x 1080 (16:9)
// - Tablette iPad Pro 13"          : 1376 x 1032 (paysage, 4:3)
// - Smartphone iPhone 15/16 Pro    : 402 x 874 (portrait)
//
// screenW/H = résolution native de l'écran (ce que la GUI doit remplir).
// guiW/H = résolution de conception du canvas GUI. Egale à screenW/H pour
// l'instant (guiScale = 1), mais gardée distincte pour pouvoir un jour
// dessiner une GUI à une résolution différente de l'écran qui l'affiche
// sans toucher au reste de l'architecture.
// chassisW/H = boîtier complet (écran + bezel décoratif), taille de
// conception FIXE — jamais recalculée depuis le contenu ou le viewport.
export const DEVICES = {
  phone: {
    id: "phone",
    label: "Smartphone",
    screenW: 402,
    screenH: 874,
    // La GUI occupe l'écran hors zones réservées par iOS (barre d'état avec
    // Dynamic Island : 59 pt en haut, indicateur home : 34 pt en bas), comme
    // en mode démo plein écran sur un vrai iPhone.
    guiW: 402,
    guiH: 781,
    safeTop: 59,
    safeBottom: 34,
    // Boîtier aux proportions d'un iPhone 16 Pro : bords de 24 px sur les
    // côtés, 33 px en haut / bas (149,6 x 71,5 mm pour un écran de 402 x 874 pt).
    chassisW: 450,
    chassisH: 940,
  },
  tablet: {
    id: "tablet",
    label: "Tablette",
    screenW: 1376,
    screenH: 1032,
    // Barre d'état iPadOS (24 pt) en haut, indicateur home (20 pt) en bas.
    guiW: 1376,
    guiH: 988,
    safeTop: 24,
    safeBottom: 20,
    // Boîtier aux proportions d'un iPad Pro 13" : bords uniformes de 45 px
    // (281,6 x 215,5 mm pour un écran de 1376 x 1032 pt).
    chassisW: 1466,
    chassisH: 1122,
  },
  wallpanel: {
    id: "wallpanel",
    label: "Dalle tactile",
    screenW: 1280,
    screenH: 800,
    guiW: 1280,
    guiH: 800,
    chassisW: 1340,
    chassisH: 890,
  },
  // Crestron TSW-1080 : 10,1" WUXGA 1920 x 1200 (16:10). La GUI est dessinée
  // à la résolution du TSW-1070 (1280 x 800) et affichée à l'échelle 1,5 :
  // même rapport 16:10, aucune reprise de design nécessaire.
  wallpanel_hd: {
    id: "wallpanel_hd",
    label: "Dalle tactile TSW-1080",
    screenW: 1920,
    screenH: 1200,
    guiW: 1280,
    guiH: 800,
    chassisW: 2010,
    chassisH: 1335,
  },
  desktop: {
    id: "desktop",
    label: "PC Monitoring",
    screenW: 1920,
    screenH: 1080,
    guiW: 1920,
    guiH: 1080,
    chassisW: 1922,
    chassisH: 1126,
  },
};

export const getDeviceConfig = (deviceType) => DEVICES[deviceType] || DEVICES.wallpanel;
