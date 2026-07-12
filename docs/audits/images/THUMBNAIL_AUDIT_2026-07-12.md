# Audit des vignettes — 12 juillet 2026

## Périmètre

Pages publiques actives vérifiées dans le code :

- accueil ;
- catalogue ;
- cartes produits réutilisables ;
- fiche produit ;
- fiche partenaire ;
- carrousels produits ;
- produits locaux.

## Gaps constatés avant correction

### P0

1. `SmartImage` déclarait `fallbackSrc` mais ne l'utilisait jamais. Une URL cassée affichait seulement « Image non disponible ».
2. `CataloguePage` utilisait une balise `<img>` native et un bloc vide avec icône pour les produits sans photo.
3. `ProductDetailPage` affichait un bloc « Photo à confirmer » sans reprendre le visuel du partenaire.
4. `TraiteurDetailPage` affichait des cartes sans vignette lorsque `item.image` était absent.
5. Les produits issus des menus partenaires conservaient `image: undefined`, même lorsqu'un hero ou une galerie partenaire existait.

### P1

1. Les vignettes de remplacement n'indiquaient pas clairement si elles représentaient le produit ou seulement le partenaire.
2. Plusieurs vues reproduisaient leur propre logique `object-cover` / `object-contain`.
3. Les packagings et flyers pouvaient être recadrés comme des plats.
4. Les URLs cassées et les champs vides n'utilisaient pas la même stratégie de secours.
5. Les fiches produit issues des menus pouvaient être introuvables car leur identifiant dérivé n'était pas recalculé de façon cohérente.

## Règle de vérité retenue

Aucune fausse photo de plat n'est créée.

Ordre d'affichage :

1. photo réelle du produit ;
2. visuel réel du partenaire, avec badge **« Visuel du partenaire »** ;
3. vignette neutre DeliKreol, avec badge **« Photo à venir »**.

Cette règle évite de présenter une image trompeuse tout en supprimant les cartes vides.

## Corrections intégrées

- création de `catalogImageResolver.ts` ;
- création de `ProductThumbnail.tsx` ;
- activation réelle de `fallbackSrc` et d'un deuxième niveau de fallback dans `SmartImage` ;
- création d'une vignette locale neutre `public/vignettes/photo-prochainement.svg` ;
- migration du catalogue public ;
- migration des cartes `ProductCard` et `LocalProductCard` ;
- migration du carrousel d'accueil ;
- migration des fiches produit ;
- migration des catalogues partenaires ;
- ajout de `data-thumbnail-source="product|partner|placeholder"` pour l'audit automatique ;
- ajout de tests Playwright bloquants sur les images cassées et les cartes sans vignette.

## Ajustement automatique du cadrage

- plats et photos d'ambiance : `cover` ;
- packagings, glaces, bouteilles, bocaux et sauces : `contain` ;
- flyers et menus Save Peyi'a : `contain` ;
- logos : `contain` ;
- vignette DeliKreol : `contain`.

## Validation attendue

Les tests doivent prouver :

- autant de vignettes que de cartes produit ;
- aucune image avec `naturalWidth === 0` ;
- badge visible pour chaque fallback partenaire ou placeholder ;
- aucun débordement horizontal ;
- tests catalogue desktop et fiches partenaires mobile.

Les nombres réels `product / partner / placeholder` sont imprimés par `tests/e2e/thumbnails.spec.ts` dans les logs CI.
