# 50 — Usage marketing

Site public : **https://crestrongui.vercel.app**

## Cadrage (11 sept. 2026)

- **Publics** : Donatien en RDV client · les commerciaux FTV seuls · le marketing en envoi · le prospect en autonomie.
- **Supports** : iPad posé sur la table · laptop en partage d'écran · iPhone du prospect. Pas la dalle en showroom.
- **Situations** : avant-vente chez le prospect · appui de devis / appel d'offres · salon ou stand · lien de suivi après réunion.
- **Succès** : le prospect manipule lui-même · FTV gagne le lot GUI · la démarcation d'avec VT Pro est comprise · le site remplace une maquette payée par affaire.

## Utiliser la vitrine en rendez-vous

**Envoyer un lien précis** — chaque écran a son adresse :

| Ce que le client verra | Adresse |
|---|---|
| Accueil | `/` |
| Toutes les interfaces | `/interfaces` |
| Un secteur | `/interfaces/hotellerie` |
| Une interface | `/interfaces/residentiel/villa-gemini-frequencetv` |
| … sur un support | `/interfaces/residentiel/villa-gemini-frequencetv/phone` |
| Contact / demande de démo | `/contact` |

Supports en fin d'adresse : `phone`, `tablet`, `wallpanel` (TSW-1070), `wallpanel_hd` (TSW-1080), `desktop` (Xpanel).

**Personnaliser au nom du client** — bouton « Nom du client » : le nom apparaît sur l'appareil (barre d'adresse du Xpanel, titre), dans le lien, sur le QR code et sur la fiche PDF (`…/phone?client=Villa+Dupont`).

**Faire tester sur l'appareil du client** — bouton « QR code » : il scanne et ouvre la même interface, nom personnalisé compris.

**Démo automatique** (bouton « Présentation ») — sur PC elle tourne seule dès qu'une interface est affichée : un curseur presse les boutons, fait glisser les faders, change de pièce, puis passe au support et au projet suivants.
- Reprendre la main : cliquer sur l'interface (ou sur « Présentation »). Un chronomètre « Reprise de la démo dans X secondes » ; elle repart après 10 s sans action, ou immédiatement en cliquant le chronomètre.
- Sur tablette et smartphone la démo est inactive par défaut ; « Présentation » l'active.
- Tablette en libre-service (salon, showroom) : ajouter `?kiosk=1` → plein écran + démo automatique.

**Produire du contenu** — « Capture » télécharge un PNG haute définition de l'interface dans son boîtier, fond transparent (pour la Villa Crans-Montana, affichée dans un cadre isolé : passer par « Plein écran » puis la capture d'écran de l'ordinateur). « Fiche PDF » ouvre une fiche A4 (description, points clés, supports, QR code, coordonnées) à imprimer ou enregistrer. Les aperçus de liens (LinkedIn, WhatsApp, Teams) affichent `public/og-image.jpg` (1200 × 630).

**Langues** — sélecteur FR / EN / DE en haut à droite, détection automatique, forçable par `?lang=en`.

**Mode démo mobile** — `#demo` ouvre un launcher tactile et `#demo/<projectId>` l'interface en plein écran réel ; installable en PWA. La redirection automatique vers `#demo` sur mobile ne joue qu'à la racine, jamais sur un lien profond partagé ; `#site` force le site classique.

**Analytics** — le site est prêt pour Vercel Web Analytics (sans cookie, conforme RGPD) : Vercel → projet `crestrongui` → onglet Analytics → Enable. *(Reste à activer.)*

## Modifier le contenu sans être développeur

Tout l'éditorial tient dans deux fichiers : `src/data/projects.js` (secteurs, supports, projets, textes FR/EN/DE) et `src/data/company.js` (coordonnées, showrooms, horaires, réseaux). Les textes de la page Contact et de la fiche PDF sont en tête de `src/pages/Contact.jsx` et `src/pages/ProjectSheet.jsx` (bloc `TEXT = { fr, en, de }`) ; les libellés de navigation dans `src/data/uiTranslations.js`.

- **Corriger un texte** : chercher le projet par `id` ou `name` dans `projects.js`, modifier entre les backticks de la langue voulue, sans supprimer virgules ni backticks.
- **Changer un statut** : `realisation` (badge vert, mis en avant) uniquement si le client accepte d'être cité ; sinon `concept`.
- **Ajouter un projet depuis une vraie interface CH5** : copier le dossier exporté dans `public/showcases/<identifiant>/` (version smartphone nommée `iphone.html`), dupliquer le bloc de `villa-gemini-frequencetv` dans `projects.js` et adapter `id`, `name`, `status`, `client`, `sectors`, `devices`, `year`, `embedUrl`, `embedPhoneUrl`, `thumbnailUrl` et les textes FR/EN/DE.
- **Ajouter un simulateur interactif** : entrée `isInteractive: true` + composant dans `src/components/simulators/` + référencement dans les maps `SIMULATORS` de `Showcase.jsx` et `DemoMode.jsx`.
- **Ajouter un secteur** : `{ id, name, iconName }` dans `sectors`, libellés `sector_<id>_name` / `sector_<id>_desc` dans `translations.js` (fr, en, de), vidéo dans `bgVideos` et dégradé dans `bgGradients`, icône ajoutée dans `src/icons.js` (catalogue : lucide.dev/icons).
- **Photos et vidéos** : `thumbnailUrl` ≈ 600 px de large — aujourd'hui des photos Unsplash, à remplacer par de vraies photos de chantiers FTV dans `public/assets/`. Vidéos de fond par secteur dans `bgVideos` (fichiers Mixkit externes, dégradé de secours) ; pour les héberger, MP4 < 5 Mo 720p dans `public/videos/`.

## Publication

Chaque `git push` sur `main` du dépôt `donafcna/Crestronshowcase` met le site à jour automatiquement. La date affichée en bas de la barre latérale est celle du dernier build.

> ⚠ L'e-mail `info@frequence-tv.ch` dans `company.js` est une hypothèse — à confirmer avant diffusion.
