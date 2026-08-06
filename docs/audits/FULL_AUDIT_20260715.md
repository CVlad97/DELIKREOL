# AUDIT COMPLET DELIKREOL — 2026-07-15

## ÉTAT GÉNÉRAL

| Élément | Valeur |
|---------|--------|
| SHA main | `661d894` |
| Site live | https://delikreol.com |
| Build | ✅ OK (68 routes SPA) |
| Typecheck | ✅ 0 erreur |
| Lint | ✅ 0 erreur |
| Tests | ✅ 63 tests passent |
| CI | ✅ Verte (PR #51 mergée) |
| Playwright | ✅ Vert |

## PHOTOS & DESCRIPTIONS (Audit vision)

### Corrections appliquées

| Produit | Problème | Correction |
|---------|----------|-----------|
| ninice-colombo | Photo WA0070 montrait du riz sauté (pas un colombo) | Échangé avec WA0071 |
| ninice-moksi-vegetarien | Photo WA0071 montrait un ragoût de poulet (pas végétarien) | Échangé avec WA0070 |
| goute-mwen-abricot-pays | Image IA avec filigrane, montrait une poche de jus | Remplacé par placeholder `photo-a-confirmer` |
| bao-buns bœuf (×2) | Photo montrait du poulet, utilisée pour produits "bœuf" | Remplacé par placeholder pour les 2 produits bœuf |

### Constats restants

- 18 produits sans photo réelle (placeholder) — à collecter
- 397 fichiers orphelins dans public/vendors/ (78% poids mort) — à nettoyer
- Alt texts présents et contextuels ✅
- 0 lien cassé ✅

## PAIEMENT & SÉCURITÉ

### Flux sécurisé (chemin A) ✅
- `checkout-order` Edge Function : recalcul serveur, idempotency_key, rate-limit
- Stripe désactivé par défaut (bouton masqué)
- Providers manuels : qonto_transfer, revolut_transfer, cash_on_delivery

### Flux non sécurisé (chemin B) ❌ — P0 CRITIQUE
- `CheckoutModal`, `PublicHomePage`, `PartnerTerminalPage` insèrent directement en base via `ordersService.create()` / `supabase.from('orders').insert()`
- Le client fournit `unit_price`, `subtotal`, `total_amount` → **falsification de prix possible**
- Policy RLS `orders_insert_anon` toujours active → insertion anonyme à montant arbitraire
- Pas d'idempotency_key, pas de recalcul serveur, pas de rate-limit

### Facturation électronique ❌
- Tables `invoices`/`invoice_lines` existent mais vides
- `AdminInvoices.tsx` est un stub
- PDF généré (`orderPdf.ts`) non conforme (pas de TVA, pas de SIRET, pas de numérotation)
- Aucun lien commande↔facture

### Suivi commande ❌
- `OrderStatusPage` lit localStorage, jamais Supabase → suivi cassé pour vraies commandes
- `AdminCommandes` lit localStorage au lieu de la base → admin aveugle
- `tracking_token` généré mais non exploité côté front

## PERFORMANCE & SEO

### Production vérifiée

| Check | État |
|-------|------|
| HTTP / | ✅ 200 |
| Routes SPA | ✅ 301→200 (redirection GitHub Pages) |
| Tokens CSS | ✅ primary 21 94% 37%, success 152 55% 30% |
| Manifest | ✅ start_url /, theme_color #b74406 |
| Sitemap | ✅ 18 routes, 0 page utilitaire |
| robots.txt | ✅ delikreol.com |
| OG image | ✅ hero-tropical.png 200 |
| SW | ✅ 200, 139 entrées précache |
| fetchPriority hero | ✅ présent |
| PWAUpdatePrompt | ✅ intégré |
| noindex panier/connexion | ✅ |

### Bundle

| Chunk | Taille | Gzip |
|-------|--------|------|
| app-vendor | 404 KB | 115 KB |
| index | 211 KB | 59 KB |
| map-vendor | 156 KB | 46 KB |
| HomePage | 48 KB | 12 KB |

### Headers de sécurité manquants (limite GitHub Pages)
- CSP, HSTS, X-Content-Type-Options, Referrer-Policy → nécessitent Cloudflare proxy

## RECOMMANDATIONS PRIORISÉES

### P0 — Critiques (avant go-live)

| # | Action | Effort |
|---|--------|--------|
| 1 | **Fermer le chemin B** : CheckoutModal/PartnerTerminal → checkout-order Edge Function | 2h |
| 2 | **Supprimer policy RLS `orders_insert_anon`** | 30min |
| 3 | **Brancher OrderStatusPage sur Supabase** (tracking_token) | 1h |
| 4 | **Réécrire AdminCommandes** pour lire Supabase | 1h |

### P1 — Importants

| # | Action | Effort |
|---|--------|--------|
| 5 | Facturation électronique conforme (Edge Function + PDF) | 1 jour |
| 6 | Rendre l'idempotence atomique (ON CONFLICT) | 30min |
| 7 | Nettoyer 397 fichiers orphelins | 30min |
| 8 | Collecter photos pour 18 produits sans image | dépend Vladimir |

### P2 — Améliorations

| # | Action | Effort |
|---|--------|--------|
| 9 | Lighthouse CI en workflow | 1h |
| 10 | Cloudflare proxy pour headers sécurité | 2h |
| 11 | Tests E2E parcours checkout complet | 2h |
| 12 | Synchro Qonto automatique | 1 jour |
