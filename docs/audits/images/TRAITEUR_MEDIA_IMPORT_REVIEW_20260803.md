# Revue import médias traiteurs — 2026-08-03

## Périmètre

- Données contrôlées : `src/data/traiteurs.ts`, `src/data/mockCatalog.ts`, `src/data/driveReimportAssets.ts`, profils partenaires.
- Médias contrôlés : `public/vendors/**`, logos, portraits, galeries Drive réimportées, vignettes produit.
- Règle appliquée : ne pas remplacer un produit par une image non prouvée ; si aucun original fiable n’existe, conserver un placeholder explicite.

## Corrections appliquées

| Zone | Avant | Après | Justification |
| --- | --- | --- | --- |
| Coco's Food | `profile.svg` injecté dans la galerie photo | Logo/profil séparé via `driveReimportLogos`, galerie uniquement photos | Évite qu’un logo apparaisse comme vignette produit ou photo de plat |
| Saveurs d'Afrique | 2 images hors catalogue dans la galerie (`IMG-20260612-WA0205`, `IMG-20260526-WA0162`) | Références retirées de la galerie publiée, fichiers conservés | Photos non corrélées au menu actuel, risque de mauvaise association plat/description |
| Gouté Mwen | Texte partenaire et prix catalogue à 2€ | Prix catalogue aligné à 2,50€ et bio mise à jour | Alignement sur le kit partenaire fourni |
| Gouté Mwen | Statut global photos à confirmer | Statut global confirmé, placeholders conservés sur produits sans original | Le kit importé couvre la marque, les produits sans photo restent signalés |
| Sweet Family | Statut global photos à confirmer | Statut global confirmé | Galerie Drive réimportée présente et utilisée |
| Traiteurs | Logo non différencié du portrait | Champ `logoImage` ajouté et affiché dans liste + fiche | Meilleure séparation logo / portrait / vitrine |

## Images encore à fournir ou valider

- Snack Savè Peyi’A : filet de poulet, crevettes riz crudités, côte d’agneau.
- Saveurs d’Afrique : Attiéké, igname jus d’œuf, spaghetti, dèguè 1L.
- Gouté Mwen : cacahuète, pistache, cho’co si une photo produit individuelle HD est fournie.
- An Tjè Coco : non publié côté public tant que les photos originales produit ne sont pas fiables.

## Contrôles ajoutés

- Existence des fichiers référencés par le catalogue.
- Séparation des logos/profils hors galeries de plats.
- Prix Gouté Mwen uniformes à 2,50€.
- Maintien de placeholders honnêtes quand l’image produit n’est pas bankable.

## À ne pas faire automatiquement

- Ne pas utiliser de photos Internet non prouvées.
- Ne pas recadrer depuis une capture ou une carte composite pour simuler une photo produit.
- Ne pas supprimer les originaux hors publication sans validation humaine.
