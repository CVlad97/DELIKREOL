# DELIKREOL — Rapport d'audit images originales

Date : 2026-07-20  
Branche : `prep/an-tje-coco-import-20260720`  
Base auditée : `5c1f248dde1886236ff4234546a5c66fbd4450f2`

## Périmètre

- Source de cadrage : Google Doc `OPENCLAW — Import An Tjè Coco dans DELIKREOL`.
- Partenaires contrôlés en priorité : An Tjè Coco et Coco's Food.
- Mode appliqué : audit avant modification, aucune génération IA, aucune photo Internet aléatoire, aucune écriture Supabase.
- Dépôt local audité : `public/vendors/an-tje-coco`, `public/vendors/coco`, `src/data`, `src/services`, `src/pages`, `supabase`.

## Statut synthétique

| Contrôle | Statut | Résultat |
|---|---:|---|
| Branche dédiée créée | PASS | `prep/an-tje-coco-import-20260720` |
| An Tjè Coco caché côté frontend public | PASS | `PUBLIC_HIDDEN_TRAITEURS` contient `An Tjè Coco` |
| Produits An Tjè Coco cachés côté frontend public | PASS | `PUBLIC_HIDDEN_PRODUCT_TRAITEURS` contient `An Tjè Coco` |
| Séparation An Tjè Coco / Coco's Food dans les données statiques | PASS | Vendors, slugs et images restent distincts |
| Images locales An Tjè Coco prêtes HD | BLOCKED | uniquement 800×800 JPG et WebP 688×620/700×650 ; source droits/original non prouvée |
| URLs Supabase An Tjè Coco valides | FAIL | `hero.jpg` et `portrait.jpg` renvoient 404 |
| URLs Supabase Coco's Food valides | FAIL | `hero.jpg` et `portrait.jpg` renvoient 404 |
| Produits Supabase An/Coco | PASS | aucun produit Supabase trouvé, pas de risque produit public depuis Supabase |
| Media assets Supabase An/Coco | PASS | aucun `media_assets` trouvé |
| Storage policies | BLOCKED | `product-photos` autorise un insert public anon/authenticated ; à durcir avant import public |

## Inventaire An Tjè Coco

| Fichier actuel | Dimensions | Poids | Ratio | État | Original trouvé | Source | Action proposée |
|---|---:|---:|---:|---|---|---|---|
| `public/vendors/an-tje-coco/gallery-01.jpg` | 800×800 | 121256 B | 1:1 | insuffisant hero/card HD | non | dépôt actuel | garder caché, demander original partenaire |
| `public/vendors/an-tje-coco/gallery-02.jpg` | 800×800 | 95577 B | 1:1 | insuffisant hero/card HD | non | dépôt actuel | garder caché, demander original partenaire |
| `public/vendors/an-tje-coco/gallery-03.jpg` | 800×800 | 88135 B | 1:1 | insuffisant hero/card HD | non | dépôt actuel | garder caché, demander original partenaire |
| `public/vendors/an-tje-coco/gallery-04.jpg` | 800×800 | 157177 B | 1:1 | insuffisant hero/card HD | non | dépôt actuel | garder caché, demander original partenaire |
| `public/vendors/an-tje-coco/gallery-05.jpg` | 800×800 | 98388 B | 1:1 | insuffisant hero/card HD | non | dépôt actuel | garder caché, demander original partenaire |
| `public/vendors/an-tje-coco/clean/hero-clean.webp` | 700×650 | 93124 B | 1.08:1 | trop petit pour hero | non | dépôt actuel | ne pas publier comme hero |
| `public/vendors/an-tje-coco/clean/gallery-*.webp` | 688×620 | 38–78 KB | 1.11:1 | dérivé basse définition | non | dépôt actuel | ne pas utiliser comme source |
| `public/vendors/an-tje-coco/hero.jpg` | absent | absent | absent | cassée | non | ancienne référence Git/Supabase | ne pas référencer |
| `public/vendors/an-tje-coco/portrait.jpg` | absent | absent | absent | cassée | non | ancienne référence Git/Supabase | ne pas référencer |

## Inventaire Coco's Food

| Fichier actuel | Dimensions | Poids | Ratio | État | Original trouvé | Source | Action proposée |
|---|---:|---:|---:|---|---|---|---|
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg` | 1600×873 | 191840 B | 1.83:1 | exploitable hero/gallery | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg` | 3840×2160 | 927799 B | 16:9 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg` | 3840×2160 | 819153 B | 16:9 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0074.jpg` | 2136×2577 | 427467 B | portrait | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg` | 3282×2053 | 543375 B | 1.60:1 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0080.jpg` | 3376×2013 | 447114 B | 1.68:1 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg` | 3770×1981 | 537467 B | 1.90:1 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/drive-reimport/IMG-20260526-WA0082.jpg` | 3244×1894 | 519228 B | 1.71:1 | HD | oui | WhatsApp/Drive propriétaire | conserver |
| `public/vendors/coco/hero.jpg` | absent local actuel / 404 prod | absent | absent | cassée si référencée | ancien Git seulement | ancienne référence | remplacer par `drive-reimport` ou supprimer référence |
| `public/vendors/coco/portrait.jpg` | absent local actuel / 404 prod | absent | absent | cassée si référencée | ancien Git seulement | ancienne référence | remplacer par `drive-reimport` ou supprimer référence |

## Anomalies de données

| Zone | Fichier / source | Anomalie | Risque | Correction proposée |
|---|---|---|---|---|
| Frontend | `src/data/partnerAssets.ts` | An Tjè Coco utilise `gallery-05.jpg` comme hero et galerie unique | publication non HD si le hide est retiré | laisser caché jusqu'à original HD |
| Frontend | `src/data/traiteurs.ts` | An Tjè Coco possède un profil buildable malgré le hide | OK tant que le hide reste actif | ne pas retirer du hide avant médias validés |
| Frontend | `src/data/mockCatalog.ts` | Produits An Tjè Coco existent avec fallback `photo-a-confirmer.svg` | OK tant que produits cachés | garder caché, ne pas publier sans prix/allergènes/photos confirmés |
| Supabase | `public.vendors` | An Tjè Coco `is_public=true` + `photo_status=confirmée` alors que hero/portrait cassés | exposition publique via service Supabase possible | passer An en non-public/draft avant import |
| Supabase | `public.vendors` | Coco's Food `hero.jpg`/`portrait.jpg` cassés | fiche distante avec 404 si Supabase prioritaire | aligner vers `drive-reimport` ou retirer hero/portrait cassés |
| Supabase | `storage.objects` policies | `product_photos_public_insert` autorise `anon` sur `product-photos` | upload public trop permissif | limiter aux admins/partenaires authentifiés propriétaires |
| SQL repo | `supabase/seed.partners.sql` | An et Coco référencent `hero.jpg`/`portrait.jpg` inexistants | réintroduction de 404 lors d'une seed | corriger avant toute exécution |
| SQL repo | `supabase/migrations/20260716000001_hydrate_public_vendor_profiles.sql` | An et Coco référencent `hero.jpg`/`portrait.jpg` inexistants | réintroduction de 404 lors d'une migration/rejeu | ajouter migration corrective idempotente |

## Contrôles URL production

| URL | HTTP | Type | Statut |
|---|---:|---|---|
| `https://delikreol.com/vendors/an-tje-coco/hero.jpg` | 404 | text/html | FAIL |
| `https://delikreol.com/vendors/an-tje-coco/portrait.jpg` | 404 | text/html | FAIL |
| `https://delikreol.com/vendors/an-tje-coco/gallery-01.jpg` | 200 | image/jpeg | PASS mais non HD |
| `https://delikreol.com/vendors/an-tje-coco/gallery-05.jpg` | 200 | image/jpeg | PASS mais non HD |
| `https://delikreol.com/vendors/coco/hero.jpg` | 404 | text/html | FAIL |
| `https://delikreol.com/vendors/coco/portrait.jpg` | 404 | text/html | FAIL |
| `https://delikreol.com/vendors/coco/gallery-01.jpg` | 200 | image/jpeg | PASS |
| `https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg` | 200 | image/jpeg | PASS |

## Décision avant modifications

| Décision | Statut | Raison |
|---|---:|---|
| Publier An Tjè Coco maintenant | BLOCKED | aucune preuve d'original HD exploitable ; Supabase a des URLs cassées |
| Réimporter An Tjè Coco depuis Facebook | BLOCKED_MEDIA_RIGHTS | URL publique exacte et droits non fournis |
| Corriger Supabase An Tjè Coco en production | ACTION MANUELLE | recommandé, mais écriture prod interdite avant validation humaine |
| Corriger Supabase Coco's Food hero/portrait | ACTION MANUELLE | recommandé, car les URLs 404 sont confirmées |
| Modifier Coco's Food frontend | NON REQUIS | frontend actuel utilise `drive-reimport` HD et reste séparé |

## Prochaine correction proposée

1. Créer une migration idempotente qui met An Tjè Coco en non-public/draft dans Supabase tant que les médias HD ne sont pas validés.
2. Corriger les références Supabase Coco's Food vers les fichiers `drive-reimport` valides ou vider les champs hero/portrait cassés.
3. Corriger les seeds/migrations locales qui référencent encore `hero.jpg`/`portrait.jpg`.
4. Ajouter un test anti-régression : aucune fiche publique ne doit référencer `vendors/an-tje-coco` tant que `PUBLIC_HIDDEN_TRAITEURS` contient An Tjè Coco.
5. Ajouter un test Supabase/image URL : interdire les images 404 dans `vendors.hero_image`, `portrait_image` et `gallery_images`.

## Statut final

`BLOCKED` pour publication An Tjè Coco.  
`ACTION MANUELLE` requise pour fournir les originaux HD ou une URL publique avec droits vérifiés.  
`ACTION TECHNIQUE` recommandée pour corriger les références Supabase cassées avant toute réactivation publique.
