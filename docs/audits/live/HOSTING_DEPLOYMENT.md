# HÉBERGEMENT ET DÉPLOIEMENT

**Date:** 2026-07-15

## Cible canonique actuelle

| Élément | Valeur |
|---------|--------|
| **Hébergement** | GitHub Pages |
| **Domaine** | delikreol.com (CNAME personnalisé) |
| **Repo** | CVlad97/DELIKREOL |
| **Branche déployée** | main |
| **Workflow** | `.github/workflows/deploy.yml` |
| **Base path** | `/` (VITE_BASE_PATH=/) |
| **Node version (CI)** | 20 |
| **Build** | `npm ci --legacy-peer-deps` → `npm run build` |
| **SPA fallback** | `cp dist/index.html dist/404.html` + `.nojekyll` |
| **CNAME** | `echo "delikreol.com" > dist/CNAME` |

## Cloudflare

Aucune intégration Cloudflare active détectée. Le domaine pointe directement vers GitHub Pages via CNAME.

## Headers HTTP (production)

| Header | Présent | Limitation |
|--------|---------|------------|
| Content-Type | ✅ text/html; charset=utf-8 | — |
| Cache-Control | ✅ max-age=600 | GitHub Pages |
| X-Content-Type-Options | ❌ | Non configurable sur GitHub Pages |
| Referrer-Policy | ❌ | Non configurable sur GitHub Pages |
| Permissions-Policy | ❌ | Non configurable sur GitHub Pages |
| Content-Security-Policy | ❌ | Non configurable sur GitHub Pages |
| Strict-Transport-Security | ❌ | Non configurable sur GitHub Pages |
| X-Frame-Options | ❌ | Non configurable sur GitHub Pages |

**Note:** GitHub Pages ne permet pas de configurer des headers de sécurité personnalisés. Pour les ajouter, il faudrait un proxy Cloudflare ou similaire devant GitHub Pages.

## Variables d'environnement (CI)

| Variable | Valeur | Sensible |
|----------|-------|----------|
| VITE_BASE_PATH | / | Non |
| VITE_SUPABASE_URL | https://boihlgodmclljtckhmgz.supabase.co | Non (URL publique) |
| VITE_SUPABASE_ANON_KEY | sb_publishable_... | Non (clé publique) |
| VITE_DEMO_MODE | false | Non |
| VITE_STRIPE_PUBLISHABLE_KEY | (secret GitHub) | Oui (stocké en secret) |

**Aucune clé `service_role` Supabase exposée côté client.**
