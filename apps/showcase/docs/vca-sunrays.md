# Intégration VCA / Sunrays — 20 septembre 2026

Les deux modèles approuvés sont intégrés aux GUI du showcase, avec support iPhone. Les identifiants `boutique-hermes` et `yacht-monaco` sont conservés. Les noms affichés sont Boutique VCA Genève et M/Y Sunrays. Les concepts ne correspondent pas à des installations connectées.

## Sources et fonctionnement

Les deux simulateurs React utilisent `src/ftv-luxury/LuxuryControl.jsx`. Les ressources sont sous `public/ftv-luxury/`, dont les deux modèles et Three.js r160 avec sa licence. Tout est servi depuis le site, sans CDN de modèle. Aucun changement de la source GUI Villa Crans ni des programmes matériels.

La boutique possède un hall et 14 salons sur deux niveaux ; le yacht, 37 espaces sur cinq ponts. La sélection est bidirectionnelle et les circuits d’éclairage sont réglables par espace. Les scènes globales, la couleur et les changements de niveau modifient la vue 3D. Les réglages audio/parfum sont simulés ; aucun son n’est diffusé.

Trois thèmes Sombre/Clair/Verre, commandes paginées et navigation tactile. Sur iPhone, les Circuits peuvent défiler et la vue 3D possède sa page dédiée. Le rendu masqué est suspendu ; les dimensions nulles sont exclues des calculs de caméra. Le parcours automatique visite trois espaces ; un geste dans la 3D interrompt la démonstration.

`ftv:control` transmet projet, commande, valeur et espace. Les messages entre iframes vérifient origine, fenêtre émettrice et projet. Aucun join matériel n’est inventé. Les réglages globaux sont hérités par les espaces non encore réglés individuellement.

Le catalogue, les fiches FR/EN/DE et les captures sont actualisés. Les ressources `/ftv-luxury/` échappent à la réécriture SPA et utilisent une stratégie de cache réseau prioritaire.

## Validation et publication

Build/lint réussis ; 117 états d’interface, 33 contrôles d’intégration et 11 contrôles de parcours automatique réussis. Aucun débordement de page, contraste du texte ≥4:1 et aucune exception JavaScript dans les parcours testés. Chromium avec rendu logiciel, cinq dimensions ; Safari et iPhone physique non testés.

Les tests généraux du contrat passent 39/43 ; quatre échecs de version avec le socle 1.0.196 sont préexistants et les fichiers concernés ne sont pas modifiés. La CI du commit de départ était déjà en échec. Détails et comparaison : `docs/verification/2026-09-20-vca-sunrays/` à la racine.

Le flux de publication est main → Vercel. Les preuves locales ne constituent pas une vérification publique ou une recette matérielle. Les anciennes notes de continuité sont conservées sans modification ; ce document rassemble la nouvelle entrée de suivi.
