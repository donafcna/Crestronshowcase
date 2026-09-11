// Résolutions de référence pour chaque support, confirmées avec le client :
// - Dalle tactile Crestron TSW-1070 : 1280 x 800 (WXGA natif, 16:10)
// - PC Monitoring / Xpanel        : 1920 x 1080 (16:9)
// - Tablette iPad (A16) 11"         : 1180 x 820 (paysage, 2360 x 1640 px natif)
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
    // Dimensions physiques du boîtier (mm) : « Taille réelle » = 96 px CSS par pouce
    physicalW: 71.5,
    physicalH: 149.6,
    // Caractéristiques réelles affichées dans la légende du châssis
    model: "iPhone 16 Pro",
    diagonalInches: 6.3,
    nativeW: 2622,
    nativeH: 1206,
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
    // iPad (A16) — support.apple.com/en-gb/122240 : 248,6 × 179,5 × 7 mm, écran 10,86″
    // (commercialisé « 11 pouces »), 2360 × 1640 px, 264 ppi → 1180 × 820 pt.
    physicalW: 248.6,
    physicalH: 179.5,
    model: "iPad (A16)",
    diagonalInches: 11,
    nativeW: 2360,
    nativeH: 1640,
    label: "Tablette",
    screenW: 1180,
    screenH: 820,
    // Barre d'état iPadOS (24 pt) en haut, indicateur home (20 pt) en bas ; la GUI
    // (mise en page fluide) occupe exactement l'écran hors zones réservées.
    guiW: 1180,
    guiH: 776,
    safeTop: 24,
    safeBottom: 20,
    // Boîtier : écran 10,86″ en 1180 × 820 → 229,4 × 159,4 mm, donc bords de 9,6 mm
    // (49 px) sur les côtés et 10 mm (52 px) en haut / bas.
    chassisW: 1278,
    chassisH: 924,
  },
  wallpanel: {
    id: "wallpanel",
    // Dimensions physiques du boîtier (mm) : « Taille réelle » = 96 px CSS par pouce
    physicalW: 240,
    physicalH: 149,
    model: "Crestron TSW-1070",
    diagonalInches: 10.1,
    nativeW: 1920,
    nativeH: 1200,
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
    // Dimensions physiques du boîtier (mm) : « Taille réelle » = 96 px CSS par pouce
    physicalW: 240,
    physicalH: 149,
    model: "Crestron TSW-1080",
    diagonalInches: 10.1,
    nativeW: 1920,
    nativeH: 1200,
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
    model: "Xpanel",
    nativeW: 1920,
    nativeH: 1080,
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
