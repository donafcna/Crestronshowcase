# Asteria — coque, cycle jour/nuit et circuits extérieurs

## Contexte de reprise — 21 septembre 2026

Demande Donatien : corriger l'eau visible à travers la coque, reprendre les timings de Villa Crans et créer un éclairage extérieur spectaculaire et pilotable. Travail isolé sur `codex/asteria-exterior-20260921`, base `04ec427a6c509fe34e622dff14cbc3014a7aa440`. Les fichiers locaux non poussés de `C:/dev/crestron` ne sont pas accessibles à cette session. Aucun changement de la branche principale, de l'installation CH5, C# ou SIMPL ; aucune publication de production.

Les images générées jour/nuit servent uniquement de direction artistique : elles ne constituent pas des captures du modèle modifié.

## Implémentation

Le modèle procédural original `models/yacht.html` reste la source du bateau. `model-bridge.js` charge le cœur de commande puis l'adaptateur `yacht-exterior.js`, seulement pour Asteria, après le script classique de construction et avant `model-ready`. L'adaptateur réutilise les objets de la scène existante : pas de deuxième renderer, caméra ou boucle requestAnimationFrame. Une topologie de coque inconnue provoque une erreur explicite.

La limite supérieure de la coque est refermée sous les ponts existants. Les faces d'extrémité sont réorientées pour être cohérentes avec les flancs ; matériau opaque et tampon de profondeur conservé. La mer exclut aussi les fragments à l'intérieur des sections réelles de la coque, en tenant compte de l'étrave inclinée et des hauteurs de vague. Aucun dessin forcé au-dessus des obstacles et aucune boîte grossière superposée au yacht.

Le cœur publie 40 circuits distincts : trois enseignes ASTERIA, quatre groupes sous-marins, contours des ponts et du toit, huit groupes de passage, escaliers, jacuzzi et piscine, mât, pont avant, garde-corps supérieur, terrasses, bar et trois groupes de soirée. Palette champagne pour l'architecture, cyan pour l'eau, bleu/lavande pour la fête. Quatre lyres sans stroboscope ni audio. Les mouvements sont figés lorsque `prefers-reduced-motion` est actif.

Les sources sous-marines et les nappes lumineuses utilisent des approximations artistiques de diffusion/réflexion, pas un moteur de simulation optique navale. Six lumières ponctuelles supplémentaires éclairent physiquement les zones clés ; les nombreux petits luminaires sont émissifs et conservent le test de profondeur. L'export glTF historique ne représente pas tous ces effets procéduraux : la scène WebGL interactive est la référence.

## Horloge et commandes

Référence : `public/plan3d/plan3d.js`, `updateEnvironment`. Jour 30 s, crépuscule 10 s, nuit 30 s, aube 10 s, boucle de 80 s. L'arrière-plan partage l'horloge de présentation de Villa Crans quand elle est disponible. Une scène lumineuse ne change ni l'heure, ni le ciel.

Auto est activé initialement : les 40 circuits montent avec la nuit, puis diminuent à l'aube. Un réglage manuel ou un preset volontaire reste prioritaire jusqu'au retour explicite en Auto. La restauration de l'ancien GUI au chargement ne désactive pas ce mode.

Bouton `Extérieur · 40 circuits` dans l'onglet Lumière : familles de circuits, pagination, curseurs, Tout allumer, Tout éteindre et Auto. Les supports sans WebGL affichent une simulation de commande explicitement identifiée. Les canaux intérieurs historiques restent distincts. Échanges `ftv-luxury/v1` avec validation de l'origine, de la fenêtre source, des identifiants et des valeurs numériques.

## Recette et limites de livraison

`node --test scripts/test-yacht-exterior.mjs` vérifie dix contrats : catalogue, timings, automatisme, priorité manuelle, validation, indépendance de l'heure, fermeture et orientation de la coque réelle, absence de triangles dégénérés, sections de flottaison et refus d'une topologie inconnue.

Le workflow `Asteria exterior review` construit et contrôle le code, puis teste réellement la scène avec Chromium/Playwright : phases, commandes, shaders, angles d'inspection et neuf combinaisons de support/thème. Il conserve captures et rapport pendant sept jours. Consulter les résultats du workflow ; ne pas assimiler un test ajouté à un test réussi.

Commandes depuis `apps/showcase` :

```sh
node --test scripts/test-yacht-exterior.mjs
npm ci
npm run build
npm run lint
# Dans un environnement disposant de Playwright/Chromium :
npm run preview -- --host 127.0.0.1 --port 4173
node scripts/test-yacht-browser.mjs
```

Ce lot reste une proposition de revue tant que ses captures réelles n'ont pas été examinées. Vérifications complémentaires avant publication : aspect des jonctions coque/mer, intégration physique des nouveaux équipements, contraste sur chaque thème, fluidité sur le laptop cible, site complet en Mode normal et Mode Scène. Ces éclairages ne constituent pas une conception de feux réglementaires ou un dimensionnement électrique naval.
