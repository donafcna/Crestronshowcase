# Mémoire — Crestron GUI Showcase

Copie de la mémoire Claude sur le site vitrine (`/areas/crestron-showcase.md`), figée le 11 sept. 2026.
À lire quand il est question du showcase, de crestrongui.vercel.app ou de l'outil marketing Fréquence TV.

## Cadre

- Site vitrine d'interfaces Crestron CH5 déployé sur https://crestrongui.vercel.app/ (React + Vite, code local dans le dossier Crestronshowcase, sur un autre PC que le Lenovo lié), maîtrise complète. Repo Git : https://github.com/donafcna/Crestronshowcase
- Objectif (sept. 2026) : en faire un outil pour l'équipe Marketing de Fréquence TV.
- Supports visés : dalles Crestron TSW1070/TSW1080, Xpanel, app smartphone Crestron (iPad, iPhone, Android). Mettre en avant les possibilités graphiques HTML5/CSS/JS.
- Vitrine publique, pas un outil interne protégé.
- Le dépôt `donafcna/Crestronshowcase` n'est pas dans les sources autorisées des sessions Claude : impossible de pousser depuis une session, il faut passer par l'interface web GitHub ou par son PC. Cowork n'offre actuellement aucun moyen d'ajouter un repo aux sources d'une session (limitation produit connue).
- Projet Vercel non connecté au repo GitHub : déploiement via `npx vercel --prod` depuis le dossier sur son autre PC. Git for Windows installé et dans le PATH sur ce PC depuis le 9 sept.

## Règle des deux versions (9 sept. 2026)

Distinguer le GUI « Crestronshowcase » (site : feedbacks 100 % frontend, curseur de démo automatique) du GUI « déploiement » (équipe programmation Fréquence TV, chez les clients : feedback par le backend C# + SIMPL, jamais de curseur).
Drapeau de mode dans le JSON de config : `meta.mode = deploiement | showcase`. Chaque modification est répercutée dans les deux versions.
Workflow : développer dans VillaCrans/src → tester en déploiement → `sync-villa-crans.py` → site.
Le `villa_config.json` de développement (Lenovo) contient des noms de test inappropriés pour le site public : le script de sync remplace toujours pièces / scènes / sources par des noms de démo.

## Vocabulaire des modes d'affichage (fixé les 10 sept. 2026)

- **Mode normal** : la page du site. L'affichage du châssis sur son écran est LA taille réelle de référence → badge « Taille réelle » seul, ou « réduit à N % ». Pas de bouton Responsive.
- **Plein écran** : bouton de la barre d'outils, GUI brute dans un nouvel onglet (dalle et tablette seulement, jamais smartphone).
- **Mode Scène** : bouton d'angle du châssis (« bouton Scène », flèches diagonales), châssis agrandi au maximum, colonne de droite conservée. Seul mode où existe le sélecteur Taille réelle / Responsive.
- **Plein écran navigateur F11**.
- Taille réelle = dimensions physiques calibrées ; Responsive = remplit l'espace.
- Il vérifie la « Taille réelle » en comparant avec l'appareil physique qu'il a sous la main (règle 100 mm de calibrage dans le bandeau Dev).

## Châssis et calibrage

- Châssis avec caractéristiques réelles : TSW-1070 10,1″ 1920×1200, iPad (A16) 11″ (à la place de l'iPad Pro 13″), iPhone 16 Pro.
- « Taille réelle » doit donner les vraies dimensions physiques quel que soit l'écran du visiteur. Solution acceptée (un navigateur ne connaît pas la taille physique de l'écran) : convention CSS 96 dpi par défaut + calibrage en un geste avec une carte bancaire (lien « Calibrer l'écran » en Mode Scène), mémorisé par navigateur.
- Bouton « Copier le lien » retiré de la barre d'outils (inutile).
- Dimensionnements validés le 10 sept. sur son moniteur 1920 × 1080, facteur d'échelle 1,1, sans calibrage (convention CSS 3,78 px/mm = 96 dpi, ce qui correspond à son moniteur).
- Sur le Lenovo perso (écran ≈ 1163 × 570 px CSS à 165 %), en Mode normal : les 4 outils de démo (QR code, Présentation, Fiche PDF, Plein écran) empilés au-dessus des boutons de support dans la colonne de droite, légende sur 2 lignes au-dessus de ces boutons, châssis agrandi d'autant.
- Légende sans pourcentage de conception (×k par rapport à la page) ; légende châssis sur la ligne des outils ; bandeau de mesures dev au-dessus de la barre des projets.

## Règles de qualité permanentes

- Aucun problème de contraste nulle part, sur aucune interface ni dans aucun thème. Outil `check_contrast_dom.mjs` (3 thèmes × page + fenêtres × états dynamiques, dalle et smartphone, seuil 4:1) livré dans les deux dépôts.
- Chaque thème reste cohérent sur TOUTES les pages et fenêtres (pas de fond sombre résiduel en thème Clair élégant), textes au contraste franc.
- Icônes nettes en SVG (engrenages compris), plus d'emoji. Aucun son dans le GUI.
- Jeux et Animation retirés du menu Villa Crans (code conservé). Thème Cyberpunk supprimé.
- Fiches produits détaillées (captures + explication de chaque bouton, FR/EN/DE) pour les 18 interfaces — format validé.
- Règles consignées dans CLAUDE.md du dépôt et CONTEXTE-CLAUDE.md de VillaCrans pour économiser les tokens.

## Historique des livraisons

- **5 sept. 2026** — portage iPhone/iPad de toutes les interfaces comme outil de démo marketing : livré et déployé en production (mode démo mobile `#demo` + PWA, doc projet `claude/demo-mobile-marketing.md`).
- **Sept. 2026** — toutes les améliorations proposées livrées dans le dossier local (liens partageables, QR, présentation, fiche PDF, page Pourquoi CH5, contact, statut réalisation/concept, FR/EN/DE, SEO/PWA), à committer/pousser par lui.
- **6 sept. 2026** — veille références UI (page de revue artefact `1c5a03b1-7e1f-40db-b52f-ac322c3e3e30`, avis stockés dans la collection `avis`) : cherche surtout des images d'interfaces, pas de la doc technique ; n'aime pas les interfaces « old school » style VT Pro. Inspirations retenues : shots Dribbble de Marc Caldwell (Intuitiv UI, Lighting Page, CH5 UI, Cable Remote, Marine UI, Global Locks, Intercom, Room Grouping), démo Tahoe d'Intuitiv, Digital Automation (vidéos YouTube), AVstudio showcase — à reproduire avec des modifications pour éviter le plagiat. Crestron Home OS jugé intéressant, veut plus d'images.
- **6 sept. 2026** — 3 maquettes de directions validées (Obsidienne / Atelier clair / Spectre, canevas artefact `3ba508cf…`) → 3 simulateurs distincts livrés dans le dossier local (non committés) : villa-leman (Obsidienne, résidentiel), siege-nyon (Atelier clair, salle de réunion), appartement-carouge (Spectre, résidentiel). Fichiers `src/components/simulators/{VillaLeman,SiegeNyon,AppartementCarouge}.jsx` + css, entrées dans `projects.js`, `Showcase.jsx`, `DemoMode.jsx`.
- **7 sept. 2026** — 67 captures de l'app Crestron Home OS 4.11.4 (iPhone + iPad) fournies pour refondre le simulateur `crestron-home`. Choix : réinterprétation aux couleurs Fréquence TV plutôt qu'une copie fidèle ; le GUI tablette sert aussi la section Dalle TSW-1070 ; projet renommé **« FTV Home »** (identifiant `crestron-home` conservé pour ne pas casser les liens partagés). Livré et fusionné en production via la PR #1.
- **7 sept. 2026** — mise à jour de la Villa Crans-Montana du showcase avec les dernières modifs de VillaCrans (v1.0.165, contrat v2) sans casser le curseur de démo ni les châssis iPad/iPhone : script `scripts/sync-villa-crans.py` + `local-feedback.js` v2.
- **9 sept. 2026** — retours d'Antoine Dändliker sur la Villa Crans-Montana du showcase (la copie en ligne était restée en v1.0.149, la sync v1.0.165 n'ayant jamais été poussée) : appliqués dans VillaCrans (Lenovo) et en copie showcase (branche `retours-direction-0909`), bundle rebasé déposé dans `VillaCrans\Claude outputs`, poussé par lui le soir même (fast-forward 9267c9a→0f61164 sur `main`), déploiement Vercel vérifié en ligne (bandeau « État de la villa » présent).
- **9 sept. 2026 (soir)** — demandes GUI Villa Crans, dans les deux versions : télécommandes complètes Apple TV (Siri Remote), Sky Q / box IPTV (LIVE, DVR, GUIDE, INFO, LAST, BACK, MENU, EXIT, D-pad, PG±, CH±, transport, couleurs) et Swisscom TV (toutes les touches de la télécommande physique) ; sources vidéo en interlock mais la Musique doit pouvoir jouer sur les haut-parleurs en gardant la vidéo à l'écran (badge égaliseur déplacé sur Musique avec cadre blanc, confirmation « garder la musique / audio de la vidéo » quand on rappuie) ; curseur de démo qui n'appuie jamais sur un bouton déjà actif. Livré (bundle 4 commits, C# pas encore compilé par lui).
- **10 sept. 2026** — fenêtre Système de sécurité agrandie comme Caméras et Contrôle global (3 % des bords), contenu proportionné, touches du clavier parfaitement rondes ; widget météo du GUI regroupé en haut (Réglages + météo + version) à toutes les largeurs, dalle comprise.
- **11 sept. 2026** — protocole anti-allers-retours demandé (auto-vérification bloquante avant livraison, planche-contact, retours groupés via `retours.json`, contrat d'acceptation) et réorganisation du contexte du projet Cowork. Docs créés : `claude/00-etat-actuel.md` (doc d'entrée qui fait foi), `10-architecture-et-pieges.md`, `20-interfaces.md`, `21-directions-graphiques.md`, `30-protocole-travail.md`, `31-instructions-projet.md`, `40-references-ui.md`, `journal/` pour les comptes rendus datés.

## Usage marketing (cadré le 11 sept. 2026, doc `claude/50-usage-marketing.md`)

- Publics : lui en RDV client, les commerciaux FTV seuls, le marketing en envoi, le prospect en autonomie.
- Supports : iPad posé sur la table, laptop en partage d'écran, iPhone du prospect (pas la dalle en showroom).
- Situations : avant-vente chez le prospect, appui de devis / appel d'offres, salon ou stand, lien de suivi après réunion.
- Succès : le prospect manipule lui-même, FTV gagne le lot GUI, la démarcation d'avec VT Pro est comprise, le site remplace une maquette payée par affaire.
