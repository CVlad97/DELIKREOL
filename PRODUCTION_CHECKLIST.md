# PRODUCTION CHECKLIST — DELIKREOL V1.0

## ✅ Vérifié — Prêt

- [x] Build React + Vite réussi
- [x] TypeScript strict — 0 erreurs
- [x] ESLint — 0 erreurs
- [x] BrowserRouter configuré avec basename `/DELIKREOL/`
- [x] SPA fallback (404.html) avec redirect script
- [x] Robots.txt pointant vers le sitemap
- [x] Sitemap.xml complet (22 URLs)
- [x] Meta OG/Twitter/Schema.org dans le head
- [x] PWA manifest.json avec start_url et scope
- [x] Couleurs du thème (theme-color, apple-mobile-web-app)
- [x] ErrorBoundary avec bouton Recharger et Accueil
- [x] Toast notifications
- [x] Mode démo fonctionnel sans Supabase
- [x] Mode production sans fuite de secrets
- [x] Supabase RLS sur toutes les tables
- [x] Storage bucket sécurisé
- [x] Stripe webhook avec idempotence
- [x] Webhook signature vérifiée
- [x] Recalcul serveur du montant (anti-fraude)
- [x] Route `/connexion` accessible
- [x] Footer avec tous les liens légaux
- [x] Header avec navigation
- [x] BackBar sur toutes les pages (bouton retour)
- [x] WhatsApp Business intégré (support client)
- [x] 34 communes Martinique dans les listes
- [x] Geolocalisation navigateur pour tri par distance
- [x] Filtres catalogue (catégorie, commune, budget, santé, livraison spéciale)
- [x] ScrollCarousel et AutoCarousel pour mise en avant des produits
- [x] CI/CD GitHub Actions (lint, typecheck, build, e2e, deploy)
- [x] Dossier `/branding/` présent dans dist
- [x] `.env.example` documenté

## ⚠️ À vérifier avant mise en production

- [ ] **Lighthouse Desktop** — score > 95 (performance, accessibility, SEO, best practices)
- [ ] **Lighthouse Mobile** — score > 95
- [ ] **Tests E2E Playwright** — passage complet sur les 3 spec files
- [ ] **Tests manuels responsive** — Samsung Galaxy S23, iPhone, iPad, desktop
- [ ] **Vérification des images traiteurs** — photos réelles, pas de placeholder
- [ ] **Vérification des prix** — pas de prix inventés
- [ ] **Parcours client complet** — accueil → catalogue → ajout panier → connexion → commander → confirmer
- [ ] **Parcours traiteur** — devenir partenaire → soumission → validation admin
- [ ] **Parcours livreur** — devenir livreur → soumission → validation
- [ ] **Parcours paiement Stripe** — création PaymentIntent → paiement → webhook → confirmation
- [ ] **Dashboard admin** — accès, navigation, données
- [ ] **Stripe Connect** — onboarding partenaire → reversement
- [ ] **Webhook Stripe** — réception des événements Stripe
- [ ] **Google OAuth** — connexion avec Google (placeholder actuellement)
- [ ] **Blink payments** — si activé (VITE_BLINK_*)

## 🔧 À faire (P1)

- [ ] Ajouter `setPageMeta()` sur les 15+ pages manquantes
- [ ] Ajouter icônes PNG (192x192, 512x512) au PWA manifest
- [ ] Ajouter apple-touch-icon PNG
- [ ] Intégrer Google Identity Services (GIS) pour l'OAuth réel
- [ ] Tester tous les liens du footer (5 liens légaux)
- [ ] Vérifier tous les liens WhatsApp (6+ occurrences du numéro)

## 🔧 À faire (P2)

- [ ] Implémenter service worker avec `vite-plugin-pwa`
- [ ] Supprimer fichiers morts : `main.ts`, `counter.ts`, `style.css`, `vite-env.d.ts`
- [ ] Étendre les tests Playwright (panier, checkout, admin, responsive)
- [ ] Ajouter des tests unitaires Vitest (services, contexts)
- [ ] Ajouter CSP headers sur GitHub Pages (si possible)
- [ ] Mettre en place monitoring Supabase (rate limits, backups)

## 📊 Métriques cibles

| Métrique | Cible | Actuel (estimation) |
|---|---|---|
| Lighthouse Performance | > 95 | ~85-90 (estimation, à confirmer) |
| Lighthouse Accessibility | > 95 | ~92-96 |
| Lighthouse SEO | > 95 | ~95+ |
| Lighthouse Best Practices | > 95 | ~90-95 |
| Bundle size (index) | < 300 KB gzip | ~95 KB gzip ✅ |
| Bundle size (react-vendor) | < 50 KB gzip | ~45 KB gzip ✅ |
| Temps de build | < 30s | ~7s ✅ |
| TypeScript errors | 0 | 0 ✅ |
| ESLint errors | 0 | 0 ✅ |
| Pages totales | 30+ | ~45 pages ✅ |
| Tests Vitest | > 10 | 1 test ❌ |
| Tests Playwright | > 20 scenarios | 2 spec files ⚠️ |

## 🚀 Déploiement

```bash
export PATH="/home/hermeswebui/.hermes/home/.nvm/versions/node/v22.22.3/bin:$PATH"
cd /workspace/DELIKREOL

# Build de production
npm run build

# Vérifier le dist
ls -la dist/404.html dist/robots.txt dist/sitemap.xml dist/manifest.json

# Déploiement GitHub Pages (via CI)
git add .
git commit -m "chore: production v1.0 fixes"
git push origin main
```

Le workflow GitHub Actions s'occupe automatiquement de :
1. `npm ci --legacy-peer-deps`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build` (avec VITE_BASE_PATH=/DELIKREOL/)
5. Copie `index.html → 404.html` + `.nojekyll`
6. Upload artifact
7. Deploy to GitHub Pages