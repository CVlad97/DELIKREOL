# FINAL COLOR GAP — APRÈS CORRECTION

SHA initial audité : `e65745cd0ff10f23db8a4c419f3cf4dd42580e70`
Branche : `fix/final-color-system`

## Palette finale (source unique — src/index.css :root)

| Token | HSL | HEX |
|:------|:----|:----|
| primary | 21 94% 37% | #b74305 |
| success | 152 55% 30% | #22764f |
| accent | 156 47% 24% | #205942 |
| secondary | 38 80% 45% | #ce8b16 |
| warning | 38 92% 50% | #f49e0a |
| destructive | 0 72% 45% | #c52020 |
| foreground | 18 40% 12% | #2a1912 |
| background | 30 100% 97% | #fff7ef |
| muted-foreground | 20 12% 38% | #6c5d55 |
| border-subtle | 31 28% 85% | #e3d9ce |
| border-strong | 27 19% 54% | #9f8773 |
| ring | 21 94% 37% | #b74305 |

## Matrice de contraste finale (14 paires)

| Paire | Ratio | Seuil | Statut |
|:------|:-----:|:-----:|:------:|
| primary / primary-fg | 5,47:1 | 4,5 | ✅ |
| primary / background | 5,17:1 | 4,5 | ✅ |
| foreground / background | 15,81:1 | 4,5 | ✅ |
| secondary / secondary-fg | 6,15:1 | 4,5 | ✅ |
| accent / accent-fg | 8,06:1 | 4,5 | ✅ |
| success / success-fg | 5,52:1 | 4,5 | ✅ |
| success / background | 5,22:1 | 4,5 | ✅ |
| warning / warning-fg | 8,21:1 | 4,5 | ✅ |
| muted-fg / background | 5,94:1 | 4,5 | ✅ |
| muted-fg / muted | 5,66:1 | 4,5 | ✅ |
| destructive / destructive-fg | 5,81:1 | 4,5 | ✅ |
| border-strong / card | 3,37:1 | 3,0 | ✅ |
| border-strong / background | 3,18:1 | 3,0 | ✅ |
| ring / background | 5,17:1 | 3,0 | ✅ |

**14/14 conformes WCAG 2.2 AA.**

## Gaps corrigés dans cette session

| Zone | Correction |
|:-----|:-----------|
| index.css | border-strong 55% → 54% (marge 3:1 sur les deux fonds) |
| HomePage cartes traiteurs | Suppression `mix-blend-overlay opacity-60` (altérait les vraies photos) → overlay noir séparé + `text-foreground` |
| HomePage étoiles avis | `fill-yellow-400`/`text-gray-200` → `fill-secondary`/`text-border-strong` + `role="img"` + `aria-label` + libellé `{rating}/5` |
| ReviewSection étoiles | idem + aria-hidden sur chaque étoile |
| QuickFilters | `text-orange-600` → `text-primary` |
| Footer bannière | `from-stone-950 via-emerald-950 to-orange-700` → `from-foreground via-accent to-primary` |
| Footer CTA | `bg-orange-500 hover:bg-orange-600 text-white` → `bg-primary hover:bg-primary/90 text-primary-foreground` |

## État hérité de la branche (déjà corrigé par commits antérieurs)

- Source unique `--primary`/`--ring` : ✅ une seule définition (index.css)
- Aucune redéfinition dans bankable-fixes.css : ✅
- Classes Tailwind invalides (bg-primary/8, text-success/700-950, border-success100, from-success600, bg-white/72, opacity-32) : ✅ 0 restante
- tailwind.config expose border-subtle + border-strong : ✅
- BackBar (text-gray-400/600, hover:orange) : ✅ propre
- Règle globale `input,select,textarea { border-color: #a48a78 }` : ✅ absente

## Info non transmise uniquement par la couleur

- Étoiles : `role="img"` + `aria-label="Note : N sur 5"` + libellé texte `{rating}/5`
- Étoiles inactives perceptibles : `text-border-strong` (3:1+)

## Tests

- Typecheck : ✅ 0 erreur
- Build : ✅ OK (368 entrées précache)
- Playwright local : ⚠️ NON exécutable dans le conteneur (libglib-2.0 absent) → délégué au workflow CI Playwright

## Problèmes restants (P2)

- Tests visuels Playwright : à exécuter dans l'environnement CI (pas localement)
- Pages secondaires non routées (PublicHomePage, TraiteursPage) : contiennent encore des couleurs héritées mais **ne sont pas servies** — dette technique non bloquante
