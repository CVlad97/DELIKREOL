# GAP AUDIT BEFORE — Images DELIKREOL

Date : 2026-07-11
SHA : 3456237
Branch : fix/image-gap-validation

## Synthèse des gaps

| Catégorie | Statut | Gap |
|:----------|:------:|:----|
| SmartImage | ⚠️ PARTIEL | Existe mais ne gère pas `kind`, `priority`, `srcSet`, `sizes`, normalized accents |
| ProductCard | ❌ NON CORRIGÉ | Utilise encore `<img>` avec `object-cover` systématique |
| VendorCard | ❌ NON CORRIGÉ | Utilise `object-cover` pour `logo_url` |
| LocalProductCard | ✅ OK | Migré vers SmartImage |
| TraiteursListPage | ✅ OK | Logos `contain`, portraits `center` |
| HomePage | ❌ NON CORRIGÉ | Utilise encore `<img>` avec `object-cover` |
| CataloguePage | ❌ NON CORRIGÉ | Utilise encore `<img>` avec `object-cover` |
| TraiteurDetailPage | ⚠️ PARTIEL | Gouté Mwen `contain`, reste `object-cover` |
| CartPage | ❌ NON CORRIGÉ | `<img>` avec `object-cover` |
| ProductDetailPage | ❌ NON CORRIGÉ | `<img>` avec `object-cover` |
| Playwright tests | ❌ ABSENT | Fichier existe mais ne s'exécute pas |
| Playwright CI | ❌ ABSENT | Pas de workflow |
| Lighthouse | ❌ ABSENT | Non exécuté |
| IMAGE_INVENTORY.json | ⚠️ PARTIEL | Existe dans `reports/` mais pas dans `docs/audits/images/` |
| images.visual.spec.ts | ❌ NON FONCTIONNEL | Échoue (libglib manquant), pas de `toHaveScreenshot()` |

## Composants à vérifier

À inspecter : ProductCard.tsx, VendorCard.tsx, RestaurantCard.tsx, AutoCarousel.tsx,
HeroSection.tsx, HomePage.tsx, CataloguePage.tsx, CartPage.tsx, ProductDetailPage.tsx

## Fichiers modifiés par la mission images

- src/components/SmartImage.tsx
- src/components/LocalProductCard.tsx
- src/pages/new/TraiteursListPage.tsx
- tests/e2e/images.visual.spec.ts
- reports/IMAGE_AUDIT.md
- reports/IMAGE_INVENTORY.json
- reports/IMAGE_BEFORE_AFTER.md