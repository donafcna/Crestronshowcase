// Fiches détaillées par interface : chaque écran du GUI avec capture et explication
// de chaque bouton (« Fonctionnalités en détail » de la fiche PDF).
// Format d'un module : { fr: { intro, sections: [{ title, image, image2?, portrait?, text, buttons: [[label, explication], …] }] }, en: {…}, de: {…} }
import appartementCarouge from "./appartement-carouge";
import appartementEauxVives from "./appartement-eaux-vives";
import auditoriumRichmond from "./auditorium-richmond";
import boardroomFutureav from "./boardroom-futureav";
import boutiqueHermes from "./boutique-hermes";
import chaletZermatt from "./chalet-zermatt";
import clubEtoile from "./club-etoile";
import crestronHome from "./crestron-home";
import homeCinemaCologny from "./home-cinema-cologny";
import hotelGeneva from "./hotel-geneva";
import huddleRoomNyon from "./huddle-room-nyon";
import siegeNyon from "./siege-nyon";
import suitePalaceMontreux from "./suite-palace-montreux";
import sushiBarKyoto from "./sushi-bar-kyoto";
import villaGeminiFrequencetv from "./villa-gemini-frequencetv";
import villaGemini from "./villa-gemini";
import villaLeman from "./villa-leman";
import yachtMonaco from "./yacht-monaco";

const docs = {
  "appartement-carouge": appartementCarouge,
  "appartement-eaux-vives": appartementEauxVives,
  "auditorium-richmond": auditoriumRichmond,
  "boardroom-futureav": boardroomFutureav,
  "boutique-hermes": boutiqueHermes,
  "chalet-zermatt": chaletZermatt,
  "club-etoile": clubEtoile,
  "crestron-home": crestronHome,
  "home-cinema-cologny": homeCinemaCologny,
  "hotel-geneva": hotelGeneva,
  "huddle-room-nyon": huddleRoomNyon,
  "siege-nyon": siegeNyon,
  "suite-palace-montreux": suitePalaceMontreux,
  "sushi-bar-kyoto": sushiBarKyoto,
  "villa-gemini-frequencetv": villaGeminiFrequencetv,
  "villa-gemini": villaGemini,
  "villa-leman": villaLeman,
  "yacht-monaco": yachtMonaco,
};

export const getSheetDoc = (projectId, lang) => {
  const d = docs[projectId];
  if (!d) return null;
  return d[lang] || d.fr || d.en || null;
};
