# GAPS RESTANTS

**Date:** 2026-07-15  
**SHA:** après corrections

## P2 — Améliorations futures

1. **Code mort** — `App.tsx`, `MarketingAbout.tsx`, `MarketingHome.tsx`, `ClientAccountPage.tsx` ne sont pas importés par le routeur actif. À archiver ou supprimer dans un cleanup futur.

2. **Status 404 sur routes SPA** — GitHub Pages retourne 404 pour toutes les routes sauf `/`. Le HTML est bien servi (SPA fallback fonctionne), mais le status code n'est pas idéal pour le SEO. Mitigation possible via Cloudflare Workers ou migration vers un hébergement avec routing serveur.

3. **Headers de sécurité** — Non configurables sur GitHub Pages. Cloudflare en proxy permettrait d'ajouter CSP, HSTS, X-Content-Type-Options, etc.

4. **Lighthouse** — Non mesuré localement (Playwright/libglib indisponible). La CI GitHub Actions exécute les tests visuels. Pour des scores Lighthouse complets, utiliser PageSpeed Insights ou ajouter Lighthouse CI au workflow.

5. **PWA cache versioning** — Le service worker utilise `autoUpdate` avec Workbox. Le `skipWaiting` est géré par Workbox mais une notification UI "Nouvelle version disponible" avec bouton "Mettre à jour" améliorerait l'UX.

6. **`bg-white` → `bg-card`** — Quelques occurrences de `bg-white` subsistent dans `HomePage.tsx` pour des cartes. Migration vers `bg-card` possible mais nécessite vérification visuelle au cas par cas.

## P3 — Futur

7. **Tests E2E complets** — Les tests Playwright tournent en CI mais ne couvrent pas tous les viewports demandés (320, 360, 390, 430, 768, 1440, 1920). À étendre.

8. **OG image dédiée** — Actuellement `hero-tropical.png` sert d'OG image. Une image OG dédiée 1200×630 optimisée pour les réseaux sociaux serait préférable.

9. **JSON-LD** — Le schema `LocalBusiness` est présent mais pourrait être enrichi avec `Menu`, `Offer`, `Review` (quand les données seront réelles).
