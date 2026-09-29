// Projets maquettes mis en retrait (29.09.2026, demande de Donatien) : retirés du site public
// (catalogue, secteurs, démo, fiches, sitemap) mais conservés intacts dans le dépôt : entrée de
// projects.js, simulateur, fiche et captures. Pour les ressortir (« ressort les projets maquettes
// mis en retrait ») : retirer leur identifiant de cette liste, puis build + recette habituelle.
export const RETIRED_PROJECT_IDS = Object.freeze([
  'villa-gemini',            // Villa Nyon
  'appartement-carouge',     // Appartement Carouge
  'appartement-eaux-vives',  // Appartement Eaux-Vives
]);
export const isRetiredProject = (id) => RETIRED_PROJECT_IDS.includes(id);
