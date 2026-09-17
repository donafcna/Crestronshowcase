# 20 — Interfaces du showcase

Source de vérité : `src/data/projects.js`. Liste relevée le 11 sept. 2026.

## Secteurs

Résidentiel · Hôtellerie · Salle de Réunion · Salle de Conférence · Discothèque · Yacht · Boutique · Restaurant.

## Supports (`devices`)

| id | Nom | viewport / simulatorType |
|---|---|---|
| `crestron` | TSW-1070 | wallpanel |
| `crestron_1080` | TSW-1080 | wallpanel_hd |
| `ios_tablet` | iPad | tablet |
| `android_tablet` | Tablette Android | tablet |
| `ios_phone` | iPhone | phone |
| `android_phone` | Smartphone Android | phone |
| `xpanel` | Xpanel | desktop |

## Projets

| id | Nom | Statut | Secteur(s) | Supports | Année |
|---|---|---|---|---|---|
| `villa-gemini-frequencetv` | Villa Crans-Montana | **réalisation** (interface CH5 réelle embarquée) | résidentiel | TSW-1070, iPad, iPhone | 2025 |
| `villa-gemini` | Villa Nyon | concept | résidentiel | iPhone, iPad, Xpanel, TSW-1070 | 2026 |
| `crestron-home` | **FTV Home** (id conservé pour ne pas casser les liens) | concept | résidentiel | iPhone, iPad, Xpanel, TSW-1070 | 2026 |
| `chalet-zermatt` | Chalet Zermatt | concept | résidentiel | iPhone, iPad, TSW-1070 | 2026 |
| `home-cinema-cologny` | Home Cinéma Cologny | concept | résidentiel | TSW-1070, iPad, iPhone | 2026 |
| `appartement-eaux-vives` | Appartement Eaux-Vives | concept | résidentiel | iPhone, iPad, TSW-1070, Android phone | 2026 |
| `villa-leman` | Villa Léman *(direction Obsidienne)* | concept | résidentiel | TSW-1070, iPad, iPhone | 2026 |
| `appartement-carouge` | Appartement Carouge *(direction Spectre)* | concept | résidentiel | iPhone, iPad, TSW-1070, Android phone | 2026 |
| `siege-nyon` | Siège Lakeside Nyon *(direction Atelier clair)* | concept | meeting | TSW-1070, iPad, iPhone | 2026 |
| `huddle-room-nyon` | Huddle Room Nyon | concept | meeting | TSW-1070, iPad, Xpanel, iPhone | 2026 |
| `boardroom-futureav` | Boardroom Siège | concept | meeting | TSW-1070, Xpanel | 2025 |
| `auditorium-richmond` | Auditorium 1000 places | concept | conférence | TSW-1070, Xpanel | 2024 |
| `hotel-geneva` | Palace 5* Genève | concept | hôtellerie | Xpanel, TSW-1070, iPad | 2025 |
| `suite-palace-montreux` | Suite Palace Montreux | concept | hôtellerie | iPad, TSW-1070, iPhone | 2026 |
| `yacht-monaco` | MY Sunrise | concept | yacht | iPad, Xpanel, TSW-1070 | 2026 |
| `club-etoile` | Club L'Étoile | concept | discothèque | iPad, Xpanel | 2024 |
| `boutique-hermes` | Boutique Luxe Genève | concept | boutique | TSW-1070, iPad | 2025 |
| `sushi-bar-kyoto` | Sushi Bar Kyoto | concept | restaurant, boutique | Tablette Android, TSW-1070 | 2025 |

Tous sont des simulateurs React (`isInteractive: true`) sauf la Villa Crans-Montana, qui embarque la vraie interface CH5 via `embedUrl` / `embedPhoneUrl`.

## Statuts

- `realisation` → badge vert « Réalisation Fréquence TV », mis en avant sur l'accueil. **À n'utiliser que si le client a accepté d'être cité.**
- `concept` → démonstration / étude de style. Le champ `client` reste générique pour les concepts.

## Fiches produits (`/fiche/:id`, `ProjectSheet`)

Section « Fonctionnalités en détail » alimentée par `src/data/sheets/<id>.js` (FR/EN/DE : intro, sections `{title, image, image2?, portrait?, text, buttons[[label, fonction]]}`) + captures `public/sheets/<id>/NN-nom.png` (PNG 1400 px, 256 couleurs).
Captures via Playwright sur `.device-screen` de `/interfaces/<secteur>/<id>/<support>` (helper de session `shot-helper.mjs`).
**Toute modification d'écran d'un simulateur ⇒ refaire sa capture et sa section.**
