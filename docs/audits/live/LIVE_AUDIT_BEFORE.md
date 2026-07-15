# LIVE AUDIT — État avant corrections

**Date:** 2026-07-15  
**SHA initial:** `88c1c9b8e971e1db16ad6db093a2655c737e46e9`  
**Branche:** `fix/live-bankable-audit-20260715`

## PRs précédentes — Statut

| PR | Description | Statut |
|----|-------------|--------|
| #21 | Finalisation palette accessible | ✅ FAIT ET VALIDÉ |
| #22 | Migration 45 fichiers vers tokens sémantiques | ✅ FAIT ET VALIDÉ |
| #23 | Pages légales + teal/green résiduel | ✅ FAIT ET VALIDÉ |
| #24 | Panier par partenaire + WhatsApp groupé | ✅ FAIT ET VALIDÉ |

## Gaps identifiés

### P0 — Critiques

1. **`bankable-fixes.css`** : alias `.bg-white\/72` résiduel avec `!important` — contournait Tailwind au lieu d'utiliser `bg-white/[0.84]`
2. **`BackBar.tsx`** : pas de `focus-visible:ring` ni `min-h-10` — navigation clavier inaccesssible
3. **`PartnerAccessPage.tsx`** : `text-gray-400` (contrast < 4.5:1 sur blanc) sur texte informatif — échec WCAG AA
4. **`CartPage.tsx`** : `handleWhatsAppClick` ne déclenchait jamais `window.open()` — WhatsApp ne s'ouvrait pas réellement
5. **`sitemap.xml`** : toutes les URLs pointaient vers `cvlad97.github.io/DELIKREOL/` au lieu de `delikreol.com`
6. **`robots.txt`** : sitemap URL pointait vers `cvlad97.github.io/DELIKREOL/sitemap.xml`
7. **OG image** : `og-image.jpg` 404 — fichier inexistant

### P1 — Importants

8. **`PartnerAccessPage.tsx`** : `text-gray-500/600/700`, `border-gray-200`, `bg-white` non sémantiques
9. **`public/404.html`** : canonical et og:url pointaient vers `cvlad97.github.io/DELIKREOL/`
10. **`public/404.html`** : script SPA hardcodait `/DELIKREOL/` comme base path

### P2 — Améliorations

11. **`ClientAccountPage.tsx`** : `text-gray-*` non sémantiques (page non routée — code mort)
12. **`MarketingAbout.tsx`** : idem (page non routée — code mort)
13. **`App.tsx`** : fichier mort (non importé par `main.tsx`)
14. **Headers de sécurité** : manquants (X-Content-Type-Options, Referrer-Policy, etc.) — limitation GitHub Pages

## Routes testées (live)

| Route | HTTP | Body servi | Statut |
|-------|------|------------|--------|
| `/` | 200 | SPA HTML | ✅ |
| `/catalogue` | 404 | SPA HTML (fallback) | ⚠️ Status 404, HTML OK |
| `/traiteurs` | 404 | SPA HTML (fallback) | ⚠️ |
| `/panier` | 404 | SPA HTML (fallback) | ⚠️ |
| `/devis` | 404 | SPA HTML (fallback) | ⚠️ |
| `/connexion` | 404 | SPA HTML (fallback) | ⚠️ |
| `/contact` | 404 | SPA HTML (fallback) | ⚠️ |
| `/devenir-partenaire` | 404 | SPA HTML (fallback) | ⚠️ |
| `/mentions-legales` | 404 | SPA HTML (fallback) | ⚠️ |
| `/page-inexistante` | 404 | SPA HTML (fallback) | ⚠️ |

**Note:** Le status 404 est le comportement attendu de GitHub Pages pour les routes SPA. Le body HTML servi est une copie complète de index.html (via `cp dist/index.html dist/404.html` dans le CI), donc le routing côté client fonctionne en navigateur.
