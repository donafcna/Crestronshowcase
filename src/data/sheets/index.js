// Fiches détaillées par interface : chaque écran du GUI avec capture et explication
// de chaque bouton (« Fonctionnalités en détail » de la fiche PDF).
// Format d'un module : { fr: { intro, sections: [{ title, image, image2?, portrait?, text, buttons: [[label, explication], …] }] }, en: {…}, de: {…} }
import villaGeminiFrequencetv from "./villa-gemini-frequencetv";

const docs = {
  "villa-gemini-frequencetv": villaGeminiFrequencetv,
};

export const getSheetDoc = (projectId, lang) => {
  const d = docs[projectId];
  if (!d) return null;
  return d[lang] || d.fr || d.en || null;
};
