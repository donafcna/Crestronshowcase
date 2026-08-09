# Crestron GUI Showcase

Site vitrine (React 19 + Vite 8) présentant des interfaces domotiques Crestron/Lutron (CH5) par secteur — projet entrepreneurial parallèle au travail chez Fréquence TV. Contexte métier/marketing complet dans la note Obsidian `10_Travail/Dev Crestron/Crestron Showcase Website.md` (vault vault Obsidian, voir son `CLAUDE.md`).

Déployé sur Vercel : https://crestrongui.vercel.app/

## Stack

- React 19 + Vite 8, lint via `oxlint` (pas ESLint)
- `npm run dev` / `npm run build` / `npm run lint` / `npm run preview`

## Structure

- `src/data/projects.js` — source de vérité unique : `sectors` (résidentiel, hôtellerie, meeting, conférence, discothèque, yacht, boutique, chalet, restaurant), `devices` (xpanel, dalle Crestron, tablette/smartphone iOS/Android), `projects` (chaque étude de cas : sectors, devices, features, année, `isInteractive`, éventuellement `embedUrl`/`interactiveComponent`).
- `src/components/simulators/` — un composant par projet interactif (ex. `VillaGemini`, `HotelGeneva`, `CrestronHome`, `YachtMonaco`, `ChaletZermatt`, `BoardroomFutureAV`, `ClubEtoile`, `BoutiqueHermes`, `SushiBarKyoto`, `AuditoriumRichmond`) — ajouter un nouveau projet interactif = ajouter une entrée dans `projects.js` + un composant simulateur ici.
- `src/components/` — `Dashboard`, `Showcase` (orchestrateur principal), `Sidebar`, `DeviceViewport`, `BackgroundVideo`.
- `src/context/LanguageContext.jsx` + `src/data/*Translations.js` — i18n (au moins FR/EN, translations dédiées par showcase ex. `yachtMonacoTranslations.js`).
- `public/showcases/<id>/index.html` (+ `iphone.html`) — pour les projets non-interactifs qui embarquent une vraie interface CH5 réelle (ex. `villa-gemini-frequencetv`, `hotel-geneva`) via `embedUrl`/`embedPhoneUrl`.

## Convention importante

`README.md` sert de **journal daté** (entrées chronologiques des sessions de dev), pas de readme statique — continuer à ajouter des entrées plutôt que de le réécrire.

## TODO connus (issus de la note Obsidian)

- Supprimer le secteur "Chalet", le fusionner dans "Résidentiel".
- Tester le déploiement sur Apple Store / Play Store.
- Garder le projet "Gemini" créé par défaut, réintégrer "Villa Gemini".
- Possibilité future : vente de template, vidéos de démo multilingues (FR/EN/ES/DE).
