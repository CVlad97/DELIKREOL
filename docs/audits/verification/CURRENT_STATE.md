# Audit de vérification — DELIKREOL

SHA audité : 52b564fee9a8d24656d3c654ad01619ebf80fb63
Branche : audit/verify-current-work

## 1. Ce qui est réellement terminé

### Couleurs
- `src/index.css` : ✅ Variables CSS mises à jour vers palette Créole Premium
- Contrastes primaires : ✅ Primary/primary-fg = 4,86:1 (était 3,14:1)
- 8 fichiers hardcodés : ✅ `#f97316` → `hsl(var(--primary))`

### Images
- 212 photos : ✅ Amélioration HD neutre (sans effet couleur)
- Photos originales : ✅ Restaurées (Gouté Mwen, etc.)
- Produits génériques : ✅ 51 supprimés (Sweet Family 28, Save Peyi'a 23)
- 3 nouveaux parfums Gouté Mwen : ✅ Cacahuète, Pistache, Choco

### Infrastructure
- CI workflow : ✅ `.github/workflows/playwright-images.yml` créé (branch main)
- Smoke test : ✅ `tests/e2e/images.production-smoke.spec.ts` créé
- Rapports audit : ✅ `docs/audits/colors/` créé
- .gitignore : ✅ playwright-report/, test-results/, reports/

## 2. Ce qui est PARTIEL

### Couleurs
- ⚠️ Commit couleur a modifié `PublicHomePage.tsx` **mais cette page n'est PAS routée**
  → Le routeur utilise `src/pages/new/HomePage.tsx` qui n'a PAS été modifié
  → **Les corrections couleur n'ont aucun effet visible sur le site** (sauf index.css)
- ⚠️ `src/pages/new/HomePage.tsx` et autres pages routées (CataloguePage, etc.) n'ont PAS été touchées
- ⚠️ `TraiteursPage.tsx` modifié mais PAS routé (le routeur utilise `TraiteursListPage.tsx`)

### Contrastes
- ⚠️ Success/background = 4,49:1 → **ÉCHEC AA** (seuil 4,5:1)
- ⚠️ `#f97316` sur blanc = 2,80:1 → toujours utilisé dans certains composants
- ⚠️ `#d95f2d` sur blanc = 3,73:1 → toujours utilisé
- ⚠️ Border/background = 1,31:1 → toujours insuffisant pour composants

### SmartImage
- ⚠️ **SmartImage n'est utilisé que dans 1 composant** : LocalProductCard.tsx
- ⚠️ ProductCard.tsx : ❌ Pas SmartImage, toujours `<img>` natif
- ⚠️ VendorCard.tsx : ❌ Pas SmartImage, logo en `object-cover` (incorrect)
- ⚠️ AutoCarousel.tsx : ❌ Toujours `<img loading="lazy">`
- ⚠️ HomePage.tsx : ❌ 5× `<img>` natifs
- ⚠️ CataloguePage.tsx : ❌ `<img>` natif
- ⚠️ TraiteursListPage.tsx : ❌ `<img>` natifs
- ⚠️ ProductDetailPage.tsx : ❌ `<img>` natif
- ⚠️ CartPage.tsx : ❌ `<img>` natif
- ⚠️ DemoPage.tsx : ❌ `<img>` natif

## 3. Ce qui est INCORRECT

### Audit couleur précédent
- ❌ Rapport annonçait "primary/primary-fg = 4,86:1" → ✅ C'est correct
- ❌ Rapport annonçait "success/success-fg = 4,75:1" → ✅ C'est correct
- ❌ Rapport disait "PublicHomePage.tsx modifié" → mais cette page n'est PAS routée
  → **L'audit n'a pas vérifié quelles pages sont réellement actives**
- ❌ COLOR_INVENTORY.json contient des métriques partielles, pas de matrice complète

## 4. P0 — À corriger avant tout

| # | Problème | Composant | Impact |
|:-:|:---------|:----------|:-------|
| 1 | VendorCard logo en object-cover | `VendorCard.tsx` | Logos coupés |
| 2 | ProductCard pas SmartImage | `ProductCard.tsx` | Pas de classification image |
| 3 | AutoCarousel pas SmartImage | `AutoCarousel.tsx` | Pas de fallback/alt |
| 4 | HomePage 5× img natifs | `HomePage.tsx` | Pas de fallback, lazy loading incohérent |
| 5 | Success/background 4,49:1 | `index.css` | Échec WCAG AA (0,01 près) |

## 5. P1

| # | Problème | Composant |
|:-:|:---------|:----------|
| 6 | HomePage non modifiée par commit couleur | `src/pages/new/HomePage.tsx` |
| 7 | CataloguePage non modifiée | `src/pages/new/CataloguePage.tsx` |
| 8 | TraiteursListPage non modifiée | `src/pages/new/TraiteursListPage.tsx` |
| 9 | CartPage/ProductDetailPage img natifs | Plusieurs |
| 10 | VendorCard logo incorrect | `VendorCard.tsx` |

## 6. P2

| # | Problème |
|:-:|:---------|
| 11 | Playwright test ne tourne pas en local (libglib) |
| 12 | #f97316 et #d95f2d encore présents dans le code |
| 13 | Pas de test visuel toHaveScreenshot() |

## 7. Résultats de contraste recalculés

| Paire | Ratio | AA | Statut |
|:------|:-----:|:--:|:-------|
| Foreground / Background | 15,81:1 | ✅ | ✅ |
| Primary / Primary-fg | 4,86:1 | ✅ | ✅ |
| Primary / Background | 4,59:1 | ✅ | ✅ |
| Success / Success-fg | 4,75:1 | ✅ | ✅ |
| Success / Background | **4,49:1** | ❌ | **ÉCHEC** |
| Muted-fg / Muted | 5,66:1 | ✅ | ✅ |
| Border / Background | 1,31:1 | ❌ | Composant |
| Destructive / Destructive-fg | 5,81:1 | ✅ | ✅ |
| #c2410c / blanc | 5,18:1 | ✅ | ✅ (ancien primary) |
| #f97316 / blanc | **2,80:1** | ❌ | Encore utilisé |
| #d95f2d / blanc | **3,73:1** | ❌ | Encore utilisé |

## 8. Captures actuelles

Non réalisables : Playwright ne peut pas tourner (libglib-2.0.so.0 manquant).
→ Le workflow CI dans `.github/workflows/playwright-images.yml` utilise l'image Docker officielle.

## 9. Fichiers à corriger

### Couleurs
- `src/index.css` : success → 152 60% 33% (pour passer à 4,5:1)
- `src/pages/new/HomePage.tsx` : appliquer les tokens couleur
- `src/pages/new/CataloguePage.tsx` : appliquer les tokens couleur
- `src/pages/new/TraiteursListPage.tsx` : appliquer les tokens couleur
- `src/pages/new/CartPage.tsx` : appliquer les tokens

### SmartImage
- `src/components/ProductCard.tsx` : migrer vers SmartImage
- `src/components/VendorCard.tsx` : migrer vers SmartImage + fix logo object-contain
- `src/components/AutoCarousel.tsx` : migrer vers SmartImage
- `src/pages/new/HomePage.tsx` : migrer 5× img → SmartImage
- `src/pages/new/TraiteursListPage.tsx` : migrer → SmartImage
- `src/pages/new/ProductDetailPage.tsx` : migrer → SmartImage
- `src/pages/new/CartPage.tsx` : migrer → SmartImage

## 10. Proposition A/B/C

### A → CONSERVER la palette actuelle + CORRECTIONS ciblées
**Avantages** : Déjà en place, contrastes presque OK, coût faible
**Risques** : Success/background à 4,49:1 (0,01 sous le seuil)
**Fichiers** : index.css (1 valeur), pages routées (5 fichiers)
**Coût** : ~30 min

### B → REVENIR à l'ancienne palette
**Avantages** : Aucun — l'ancienne palette avait primary 3,14:1
**Risques** : Retour des échecs WCAG
**Coût** : ~15 min

### C → NOUVELLE palette après comparaison visuelle
**Avantages** : Design cohérent de bout en bout
**Risques** : Temps de développement plus long
**Coût** : ~4h

**Proposition recommandée : A**

## 11. Fichiers créés dans cet audit

- `docs/audits/verification/CURRENT_STATE.md` (ce fichier)

## 12. Statut final

**AUDIT VALIDÉ**

J'attends la validation de Vladimir avant toute correction de production.