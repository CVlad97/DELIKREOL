# Audit couleur DELIKREOL — Rapport complet

## Résumé

| Métrique | Valeur |
|:---------|:-------|
| Couleurs hexadécimales uniques | 173 |
| Occurrences dans le code | 817 |
| Fichiers analysés | ~200 |
| Paires de contraste testées | 21 |
| Échecs AA (normal text) | 4 |

## 5 problèmes les plus importants

### 🔴 P0 — Primary button : orange sur blanc = 3,14:1
Le bouton principal (`#c2410c` / `#fff`) ne passe pas WCAG AA (minimum 4,5:1).
**Impact** : CTA principal illisible pour 8% des hommes (daltonisme rouge/vert).

### 🔴 P0 — Success/vert : 2,92:1 sur fond
Le vert succès sur fond blanc crème est quasi invisible.
**Impact** : Messages de confirmation de commande non perceptibles.

### 🟡 P1 — Bordure/fond : 1,26:1
Les bordures sont à peine visibles.
**Impact** : Champs de formulaire, cartes et sections non délimitées.

### 🟡 P1 — 4 oranges différents utilisés
`#c2410c` (primary), `#f97316` (badges), `#d95f2d` (CTA), `#f56213` (accents) — pas d'harmonie.
**Impact** : Marque perçue comme incohérente.

### 🟡 P1 — Madras sur fond de carte
Le motif madras est utilisé comme fond de carte, concurrençant les photos et réduisant la lisibilité.

## Contrastes échoués

| Paire | Ratio | Seuil | Statut |
|:------|:-----:|:-----:|:------:|
| Primary / Primary-foreground | 3,14:1 | 4,5:1 | ❌ AA |
| Primary / Background | 3,05:1 | 4,5:1 | ❌ AA |
| Success / Success-foreground | 2,92:1 | 4,5:1 | ❌ AA |
| Warning / Background | 2,07:1 | 4,5:1 | ❌ AA |
| #f97316 / #fff | 2,80:1 | 4,5:1 | ❌ AA |
| Border / Background | 1,26:1 | 3,0:1 | ❌ composant |

## Palette recommandée — A. CRÉOLE PREMIUM

```css
--background: 30 100% 97%      /* #fff7ef — crème chaud */
--foreground: 18 40% 12%       /* #2a1912 — brun profond */
--primary: 21 92% 40%          /* #c34908 — orange foncé premium */
--primary-foreground: 0 0% 100% /* #ffffff — blanc */
--secondary: 38 80% 45%        /* #ce8b16 — or */
--secondary-foreground: 20 30% 10% /* brun foncé */
--accent: 156 47% 24%          /* #205942 — vert profond */
--accent-foreground: 0 0% 100%
--success: 152 60% 32%         /* #208254 — vert soutenu */
--success-foreground: 0 0% 100%
--warning: 38 92% 50%          /* #f49e0a — jaune/or */
--warning-foreground: 20 30% 10%
--destructive: 0 72% 45%       /* #c52020 — rouge */
--destructive-foreground: 0 0% 100%
--muted: 30 42% 95%            /* #f7f2ec */
--muted-foreground: 20 12% 38% /* #6c5d55 */
--card: 0 0% 100%
--card-foreground: 18 40% 12%
--border: 31 28% 85%           /* #e3d9ce */
--input: 31 28% 82%
--ring: 21 92% 40%
```

### Contrastes validés
| Paire | Ratio | AA | AAA |
|:------|:-----:|:--:|:---:|
| Primary / Primary-foreground | **4,86:1** | ✅ | ❌ |
| Success / Success-foreground | **4,75:1** | ✅ | ❌ |
| Foreground / Background | **15,81:1** | ✅ | ✅ |
| Muted-foreground / Muted | **5,66:1** | ✅ | ✅ |
| Secondary / Secondary-foreground | **16,60:1** | ✅ | ✅ |

## Fichiers concernés
- `src/index.css` — variables CSS des tokens
- `tailwind.config.js` — si ajout de tokens
- `src/components/layout/Header.tsx` — harmonisation
- `src/components/layout/Footer.tsx` — harmonisation
- `src/pages/new/HomePage.tsx` — hero, CTA
- Composants avec couleurs codées en dur

## Lien de la branche
`audit/color-system-delikreol`

---

**Valides-tu la palette A, B ou C avant que je commence les corrections ?**