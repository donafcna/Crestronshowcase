# Premier commit 19/7/2026 13h00

Perte de toutes les données la veille et première reconstitution des fichiers. 

Premiers tests sur Ecrans 21.5': dimensionnement des périphériques OK pour tous les projets et secteurs d'activités. 

Refaire les mêmes tests en mode plein écran

Refaire les mêmes tests sur écran 14.5'


# maj 19/7/2026 20h51

Ajout GUI pour tous les projets listés

Ajout photos dans les background de tous les GUI

Beaucoup de temps passé avec le bouton "Plein écran", encore à peaufiner

Résumé: suppréssion de presque toutes les grosses "incohérences graphiques", à part quelques petits détails: photos chalet, amérliorer les contrastes des textes sur certains GUI (Salle de conférence, ...)


# maj 5/9/2026 — Mode Démo Mobile iPhone/iPad (outil marketing)

Objectif : transformer le showcase en outil de démonstration pour l'équipe Marketing de Frequence TV, utilisable directement sur iPhone et iPad.

Nouveautés :

- **Mode démo mobile** : sur iPhone/iPad, le site ouvre automatiquement un launcher tactile (`/#demo`) listant les 11 interfaces. Chaque interface s'ouvre en **plein écran réel** (`/#demo/<id>`), sans cadre simulé — la version phone sur iPhone, la version tablette sur iPad (détection automatique, bascule manuelle possible via la pilule flottante qui se masque toute seule).
- Les projets CH5 réels (Villa Crans Montana) utilisent automatiquement `iphone.html` sur smartphone et `index.html` sur tablette.
- **PWA installable** : manifest + icônes + service worker. Sur iPad/iPhone : Partager → « Sur l'écran d'accueil » → l'outil se lance en plein écran comme une vraie app Crestron (icône « FTV Demos »).
- Corrections responsive : grille Boutique Hermès en 1 colonne sur smartphone, en-tête Chalet Zermatt compact, safe areas iOS (encoche / barre home), en-tête du launcher sur petits écrans.
- Le site desktop classique est inchangé (accessible via « Ouvrir le site complet » ou `/#site`).

Fichiers ajoutés : `src/components/DemoMode.jsx`, `src/demo.css`, `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`. Modifiés : `App.jsx`, `main.jsx`, `index.html`, `index.css`, `translations.js` (clés `demo_*` FR/EN).

À tester sur les vrais appareils : installation PWA, rotation iPad, Villa Crans Montana en portrait iPad (l'en-tête CH5 d'origine est un peu serré en portrait — prévoir la démo en paysage).


# maj 5/9/2026 (soir) — Fusion v2 marketing + mode démo mobile

Réparation du conflit entre les deux livraisons du jour (v2 « outil marketing » avec routeur/pages, et mode démo mobile iPhone/iPad) : le déploiement de l'après-midi plantait (« useRouter must be used within RouterProvider ») car `App.jsx`/`main.jsx` du mode démo avaient écrasé ceux de la v2.

- `App.jsx`, `main.jsx` et `index.html` reconstruits : RouterProvider + pages v2 (`/interfaces/...`, `/pourquoi-ch5`, `/contact`, `/fiche/:projet`, kiosque, toolbar QR/PDF) **et** mode démo mobile (`#demo`, `#demo/<id>`) + PWA + SEO/OG.
- `DemoMode.jsx` adapté à la v2 : icônes nommées (`src/icons.js`), simulateurs lazy-loadés, noms de projets multilingues (`getProjectName`), langues FR/EN/DE.
- Le `#demo` reste en hash-routing : compatible avec les rewrites Vercel, et la redirection mobile automatique ne s'applique qu'à la racine du site (les liens profonds partagés `/interfaces/...` ne sont pas détournés).
- Clés `demo_*` ajoutées en DE ; page 404 ajoutée.
- Vérifié par captures : desktop (accueil, showcase + toolbar, pourquoi-ch5, contact, fiche), iPhone (launcher démo, simulateurs, lien profond préservé). Build OK, bundle principal ~360 kB (code splitting v2 conservé).
- À surveiller : l'affichage du simulateur de la page `/interfaces` sur très petit écran (le mode démo `#demo` est la voie prévue sur mobile).
