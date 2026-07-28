# Audit premium marketplace DeliKreol — 2026-07-27

## Décision exécutive

Statut : **GO pré-production contrôlée / NO-GO live complet**.

Le site est publiable pour validation métier, acquisition douce et tests de commande WhatsApp. Il ne doit pas être considéré comme prêt pour une mise en production paiement live tant que les points P0 restants ne sont pas fermés : `npm audit` résiduel, test Stripe 4242 + webhook réel, vérification OAuth Google dans Supabase, validation propriétaire des images partenaires.

## Sauvegarde avant modification

- Patch de sauvegarde : `/tmp/delikreol-backups/pre-premium-audit-20260727.patch`
- Commit de départ : `134d2e4257e182d737ba274321df1f3675476201`
- Branche locale : `main`

## Benchmarks concurrents

Sources de référence utilisées pour le benchmark produit : [Uber Eats](https://www.ubereats.com/), [Deliveroo](https://deliveroo.fr/), [Just Eat](https://www.just-eat.fr/), [Too Good To Go](https://www.toogoodtogo.com/), [Glovo](https://glovoapp.com/), [Airbnb](https://www.airbnb.com/), [Amazon](https://www.amazon.fr/).

| Concurrent | Pattern fort | Gap DeliKreol constaté | Action prioritaire |
|---|---|---|---|
| Uber Eats / Deliveroo | Recherche immédiate, promesse délai, panier direct | Disponibilité encore trop humaine / WhatsApp-first | Garder WhatsApp mais afficher créneaux et statut clair |
| Just Eat / Glovo | Catalogue dense, filtres visibles, livraison rassurante | Données partenaires hétérogènes | Normaliser fiche traiteur + badges vérifiés |
| Too Good To Go | Urgence, stock limité, créneau précis | Peu de rareté/stock/anti-gaspi | Ajouter lots du jour et créneaux planifiés |
| Airbnb | Confiance par photos, profil, avis, règles | Images encore à valider manuellement | Prioriser photos authentiques HD + avis vérifiés |
| Amazon | Conversion par réassurance, avis, retours, prix clair | Paiement live non validé | Préserver Stripe test seulement, WhatsApp-first en fallback |

## Problèmes et gravité

| Gravité | Problème | Diagnostic | Cause | Correctif / statut |
|---|---|---|---|---|
| P0 | Vulnérabilités `npm audit` | `npm audit --omit=dev` retourne 10 high | `vite-plugin-pwa` via `workbox-build` et `react-router` | Partiellement corrigé via `npm audit fix`; reste à arbitrer car `--force` implique changements breaking |
| P0 | Paiement live | Non validé de bout en bout en conditions réelles | Webhook/Stripe test non rejoué depuis Dashboard dans cette session | Ne pas activer live ; conserver Stripe test + WhatsApp |
| P0 | Auth Google/OTP live | Impossible à vérifier sans clic e-mail/OAuth dashboard | Dépend de config Supabase provider/callback | Code PKCE audité ; test manuel Supabase requis |
| P1 | Canonical SEO global | Routes canonicalisaient vers `/` | Meta route non synchronisée avec chemin courant | Corrigé dans `src/services/seo.ts` |
| P1 | Cache HTML anti-prod | `no-cache/no-store` dans `index.html` | Ajout défensif ancien | Supprimé pour rétablir cache navigateur normal |
| P1 | Secret potentiel frontend | Référence `VITE_OPENAI_API_KEY` côté client | Mauvais modèle d’intégration IA | Retiré ; copilot autorisé uniquement via proxy/Edge Function |
| P1 | Accessibilité carte | Boutons imbriqués dans la carte accueil | Header interactif + bouton géoloc imbriqué | Corrigé avec `aria-expanded`, `aria-controls`, focus visible |
| P1 | Bundle carte | Leaflet pouvait être chargé trop tôt | Import statique route carte + chunking imparfait | Route carte lazy + chunk Leaflet isolé |
| P1 | Hero image lourde | PNG 1,4 Mo utilisé en LCP | Aucun format moderne préchargé | WebP 56 Ko ajouté + preload prioritaire |
| P1 | Images non bankables | Captures/flyers/IA faibles visibles sur certaines cartes | Données importées trop permissives | Filtrage éditorial conservateur + fallbacks “Photo à venir” |
| P2 | CSS global lourd | `index.css` 173 Ko | Beaucoup d’utilitaires/components globaux | À découper dans une passe dédiée design-system/CSS |
| P2 | Lighthouse performance faible | Score local 34 | JS main thread + CSS global + SPA client-side | Améliorations appliquées, mais optimisation profonde restante |

## Corrections appliquées

- SEO : canonical par route, `og:url`, `twitter:url`, JSON-LD `WebSite/SearchAction` et `FoodEstablishment`.
- Performance : preload image LCP, WebP hero, lazy loading de la carte accueil, lazy loading de routes carte/pro/partenaire, chunk Leaflet séparé, bootstrap non bloquant pour l’hydratation partenaires.
- Accessibilité : correction du bouton imbriqué de la carte, attributs ARIA, focus visible, respect `prefers-reduced-motion`.
- Sécurité : suppression d’une référence à une clé OpenAI frontend ; audit secrets OK.
- Images : tri éditorial existant conservé, avec retrait d’images non bankables des flux d’affichage sans supprimer les originaux.

## Fichiers modifiés principaux

- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/index.html`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/main.tsx`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/router.tsx`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/pages/new/HomePage.tsx`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/components/ExpandableGeoMap.tsx`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/services/seo.ts`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/src/services/adminCopilot.ts`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/vite.config.ts`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/package-lock.json`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/public/branding/hero-tropical-714.webp`
- `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL/public/branding/hero-tropical-960.webp`

## Scores vérifiés localement

Lighthouse local sur `http://127.0.0.1:4173/` avec Chromium Playwright :

| Score | Résultat |
|---|---:|
| Performance | 34 |
| Accessibilité | 92 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing | 67 |

Métriques clés :

- FCP : 3,8 s
- LCP : 6,4 s
- TBT : 3 810 ms
- CLS : 0

Interprétation : SEO et bonnes pratiques sont au niveau attendu. Performance reste **NO-GO objectif >95** tant que le bundle initial, le CSS global et le travail main-thread ne sont pas réduits.

## Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npm run typecheck` | OK |
| `npm run lint` | OK |
| `npm run test --if-present -- --maxWorkers=1` | OK — 12 fichiers, 38 tests |
| `npm run build` | OK — 67 routes SPA générées |
| `npm run audit:secrets --if-present` | OK — 0 secret détecté |
| `npm run audit:links` | OK — 22/22 pages, 0 échec, WhatsApp présent |
| `npm audit --omit=dev` | ÉCHEC — 10 high résiduels nécessitant arbitrage breaking |
| Vérification visuelle Playwright | OK — `/`, `/catalogue`, `/traiteurs`, mobile/desktop sans images cassées ni overflow |

Captures locales :

- `/tmp/mobile-home.png`
- `/tmp/desktop-home.png`
- `/tmp/mobile-catalogue.png`
- `/tmp/mobile-traiteurs.png`

## Résultat par domaine

| Domaine | Score audit | Statut |
|---|---:|---|
| UX / CRO | 82 | Bon socle, mais disponibilité/stock/devis à clarifier |
| SEO | 100 Lighthouse | OK technique local |
| Sécurité | 86 | Secrets OK, mais `npm audit` bloque le GO live |
| Accessibilité | 92 Lighthouse | Bon, corrections restantes axe/WCAG détail |
| Mobile | 88 | Aucun overflow détecté sur routes testées |
| Performance | 34 Lighthouse | NO-GO objectif premium |
| Images | 76 | Fallbacks sûrs, originaux partenaires encore à valider |
| Auth | 75 | Code cohérent, validation OAuth live requise |
| Paiement | 70 | Stripe test préparé, live interdit sans test webhook complet |

## Roadmap priorisée

### 7 jours

1. Choisir stratégie dépendances : remplacer/mettre à jour `vite-plugin-pwa`, résoudre `react-router` sans downgrade risqué.
2. Rejouer Stripe test complet : Checkout 4242, webhook Dashboard, SQL `orders.payment_status='paid'`, `order_events`.
3. Vérifier Supabase Auth : Google OAuth, OTP, callback `https://delikreol.com/auth/callback`, rôles admin/partenaire.
4. Valider manuellement les photos partenaires encore douteuses, surtout Gouté Mwen et An Tjè Coco.
5. Réduire CSS global et mesurer Lighthouse après chaque passe.

### 30 jours

1. Créer tunnel B2B “devis entreprise / buffet / livraison planifiée”.
2. Ajouter créneaux, minimum commande, zones desservies et disponibilité par partenaire.
3. Ajouter avis vérifiés et preuve sociale visible sur fiches traiteurs/produits.
4. Finaliser dashboard partenaire : édition photos, menus, horaires, commandes, statut paiement manuel.

### 60 jours

1. Lancer offres récurrentes entreprises : plateaux réunion, cantines ponctuelles, événements.
2. Ajouter promotions contrôlées, codes promo et relance panier WhatsApp.
3. Mettre en place analytics conversion par source/campagne/traiteur.

### 90 jours

1. Automatiser facturation et rapprochement paiement.
2. Industrialiser logistique légère : créneaux par commune, batch livraison, livreurs partenaires.
3. Passer Stripe live uniquement après CI verte, audit résolu, webhook réel validé et CGV/mentions finalisées.

## Conclusion

DeliKreol a maintenant une base plus propre pour pré-production : SEO local à 100, audit secrets OK, routes vérifiées, images cassées absentes sur les écrans testés, carte et hero mieux isolés. Le blocage principal n’est plus fonctionnel mais industriel : performance Lighthouse, vulnérabilités dépendances, validation auth/paiement réelle et qualité photo finale par propriétaire.
