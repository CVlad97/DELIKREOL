# Tri éditorial images bankables — 2026-07-26

Objectif : retirer de l’affichage public les médias qui dégradent la conversion avant mise en avant commerciale.

## Règle appliquée

- Pas de suppression physique des originaux : les fichiers restent dans `public/vendors/**` pour traçabilité et restauration.
- Suppression côté affichage : les références sont retirées des galeries statiques, des images produit ou filtrées lors de la fusion Supabase/statique.
- Fallback utilisé : les produits sans photo fiable affichent `photo à confirmer`.

## Critères de rejet

- Capture d’écran mobile ou navigateur.
- Flyer/menu/QR non prévu comme visuel produit.
- Image trop saturée, brûlée, floue ou avec cadre artificiel non maîtrisé.
- Produit isolé sur fond noir/détouré grossier, ratio trop étroit ou rendu non premium.
- Doublon contexte/logistique utilisé comme photo produit.

## Photos retirées de l’affichage public

| Partenaire | Fichier | Dimensions | Motif |
| --- | --- | ---: | --- |
| An Tjè Coco | `public/vendors/an-tje-coco/gallery-01.jpg` | 800x800 | Saturation extrême, cadre artificiel rose, rendu non vendable. |
| An Tjè Coco | `public/vendors/an-tje-coco/gallery-02.jpg` | 800x800 | Surexposition forte, plat brûlé visuellement. |
| An Tjè Coco | `public/vendors/an-tje-coco/gallery-03.jpg` | 800x800 | Image IA/surdosée, incohérente comme photo traiteur réelle. |
| An Tjè Coco | `public/vendors/an-tje-coco/gallery-04.jpg` | 800x800 | Saturation et contraste excessifs. |
| An Tjè Coco | `public/vendors/an-tje-coco/gallery-05.jpg` | 800x800 | Cadre artificiel et rendu trop publicitaire/non naturel. |
| Gouté Mwen | `public/vendors/goute-mwen/import-20260722/goute-mwen-ananas.jpg` | 324x1600 | Détourage noir, ratio trop étroit, non bankable en carte produit. |
| Gouté Mwen | `public/vendors/goute-mwen/import-20260722/goute-mwen-prune-de-cythere.jpg` | 319x1600 | Détourage noir, ratio trop étroit, non bankable en carte produit. |
| Gouté Mwen | `public/vendors/goute-mwen/import-20260722/goute-mwen-prune-maracuja.jpg` | 356x1397 | Détourage noir, ratio trop étroit, non bankable en carte produit. |
| Gouté Mwen | `public/vendors/goute-mwen/import-20260722/goute-mwen-avocat-basilic.jpg` | 277x1407 | Détourage noir, ratio trop étroit, non bankable en carte produit. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-assortiment-nappe-ai.jpg` | 1168x1600 | Photo d’assortiment redondante, faible valeur produit. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-assortiment-serviette-ai.jpg` | 1168x1600 | Doublon d’assortiment, support textile non premium. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-glaciere-nappe-ai.jpg` | 1167x1600 | Image logistique, pas une photo de vente produit. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-glaciere-sable-ai.jpg` | 1168x1600 | Image logistique, pas une photo de vente produit. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-assortiment-sable-ai.jpg` | 1167x1600 | Assortiment contexte sable, redondant et moins premium. |
| Gouté Mwen | `public/vendors/goute-mwen/supplied-ai-20260722/goute-mwen-kit-bio.jpg` | 1080x1350 | Kit texte/brief, pas une photo catalogue. |
| Coco’s Food | `public/vendors/coco/drive-reimport/IMG-20260521-WA0091.jpg` | 738x1600 | Capture d’écran événement. |
| Coco’s Food | `public/vendors/coco/drive-reimport/IMG-20260521-WA0092.jpg` | 738x1600 | Capture d’écran événement. |
| Coco’s Food | `public/vendors/coco/drive-reimport/IMG-20260601-WA0244.jpg` | 1080x1435 | QR Instagram, pas une photo produit. |
| Les Délices de Ninice | `public/vendors/ninice/drive-reimport/IMG-20260521-WA0091.jpg` | 738x1600 | Capture d’écran événement. |
| Les Délices de Ninice | `public/vendors/ninice/drive-reimport/IMG-20260521-WA0092.jpg` | 738x1600 | Capture d’écran événement. |
| Les Délices de Ninice | `public/vendors/ninice/drive-reimport/IMG-20260521-WA0238.jpg` | 1024x1536 | Flyer événement, pas photo de plat. |
| Les Délices de Ninice | `public/vendors/ninice/drive-reimport/IMG-20260526-WA0069.jpg` | 738x1600 | Capture navigateur/réseaux sociaux. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg` | 1280x1280 | Carte visuelle/flyer utilisé comme photo produit. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg` | 1280x1280 | Carte visuelle/flyer utilisé comme photo produit. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260710-WA0007.jpg` | 1280x1280 | Flyer menu utilisé comme photo produit. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260521-WA0091.jpg` | 738x1600 | Capture d’écran événement. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260521-WA0092.jpg` | 738x1600 | Capture d’écran événement. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260710-WA0040.jpg` | 900x1600 | Menu vertical, pas photo catalogue. |
| Snack Savè Peyi’A | `public/vendors/save-peyia/drive-reimport/IMG-20260710-WA0041.jpg` | 1024x1536 | Menu boissons, pas photo catalogue. |
| Saveurs d’Afrique | `public/vendors/saveurs-afrique/drive-reimport/IMG-20260525-WA0106.jpg` | 738x1600 | Capture d’écran site. |
| Saveurs d’Afrique | `public/vendors/saveurs-afrique/drive-reimport/IMG-20260525-WA0181.jpg` | 1131x1600 | Menu/flyer, pas photo produit. |
| Saveurs d’Afrique | `public/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0201.jpg` | 738x1600 | Capture d’écran catalogue. |
| Saveurs d’Afrique | `public/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0202.jpg` | 738x1600 | Capture d’écran catalogue. |
| Saveurs d’Afrique | `public/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0203.jpg` | 738x1600 | Capture d’écran catalogue. |

## Changements appliqués

- Galeries statiques curées dans `src/data/driveReimportAssets.ts`.
- An Tjè Coco neutralisé côté médias statiques dans `src/data/partnerAssets.ts` et `src/data/traiteurs.ts`.
- Produits Snack Savè Peyi’A sans photo produit fiable basculés sur `photo à confirmer` dans `src/data/mockCatalog.ts`.
- Vignette accueil Snack Savè Peyi’A remplacée par une photo réelle dans `src/pages/new/HomePage.tsx`.
- Produits Gouté Mwen dont la seule image est un détourage noir basculés sur `photo à confirmer` dans `src/data/mockCatalog.ts`.
- Fusion Supabase/statique durcie dans `src/services/vendorsService.ts` pour ignorer ces mêmes chemins si Supabase les renvoie encore.
- Test d’inventaire mis à jour dans `src/data/driveReimportAssets.spec.ts` avec les comptes curés publiables.

## À fournir manuellement

- An Tjè Coco : photos originales non saturées, sans cadre rose, idéalement plats réels ou portrait partenaire.
- Snack Savè Peyi’A : photos réelles pour côte de porc, crevettes et côte d’agneau.
- Gouté Mwen : photos produit naturelles pour ananas, prune de cythère, prune-maracuja et avocat-basilic.
