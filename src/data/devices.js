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
    guiW: 402,
    guiH: 874,
    chassisW: 422,
    chassisH: 894,
  },
  tablet: {
    id: "tablet",
    label: "Tablette",
    screenW: 1376,
    screenH: 1032,
    guiW: 1376,
    guiH: 1032,
    chassisW: 1408,
    chassisH: 1064,
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
