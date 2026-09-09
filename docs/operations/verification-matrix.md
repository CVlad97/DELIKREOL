# MATRICE VÉRIFICATION — DELIKREOL (2026-09-08) — CLASSIFICATION STRICTE
# Aucune ligne marquée OPÉRATIONNEL sans preuve de service consommé.

| Domaine | Preuve code | Preuve base | Preuve test | Preuve prod | Statut réel | Blocage | Prochaine action |
|---------|-------------|-------------|-------------|-------------|-------------|---------|-------------------|
| 2. SUMUP | sumupService.ts (3 351 octets) — framework présent, pas d'appel réel | MIGRATION NON APPLIQUÉE (fichier local seulement) | 77/77 pass — pas de test SumUp | ABSENT | 8 (NON VÉRIFIABLE — CONFIG EXT REQUISE) | Clé sandbox + feature flag serveur | Fournir clé sandbox, créer fonction webhook serveur |
| 3. TRAITEUR/LIVRAISON | traiteurs.ts, vendors-service.spec.ts | demoDb.ts (MOCK — DÉMONSTRATION) | 77/77 pass — 8 tests vendors-service | DÉMONSTRATION (mock) | 5 (TEST AUTOMATISÉ OK) / 8 (PROD NON VÉRIFIÉ) | Aucune anomalie détectée | Aucun — fonctionnel en mock |
| 1. POINTS RELAIS | AdminPointsRelais.tsx, PointsRelaisPage.tsx, partnerGeo.ts, martiniqueCommunes.ts (34) | localStorage vide (pas de connexion Supabase) | Tests pages non explicites pour relais | NON VÉRIFIABLE | 1 (CODE PRÉSENT) / 6 (TEST LOCAL) / 8 (PROD NON VÉRIFIÉ) | Aucune liste réelle de commerces | Fournir liste commerces + autorisation WhatsApp |
| 4. PARTENAIRES (C) | partnerOnboardingService.ts, DevenirPartenairePage.tsx, migration 20260616000001 | Migration locale (sans application distante confirmée) | 77/77 pass ; test vendors-service OK | NON VÉRIFIABLE | 2 (MIGRATION PRÉSENTE) / 8 (SUPABASE NON VÉRIFIÉ) | DB mot de passe manquant | Valider migration distante si accès disponible |
| 4. STOCKS/CAP (D) | CatalogPage, catalogService, mockCatalog | demoDb (MOCK) | Tests catalog | DÉMONSTRATION | 5 (TEST OK) / 8 (PROD NON VÉRIFIÉ) | Aucun stock réel vérifié | Vérifier base réelle |
| 4. TRANSACTIONS (E) | checkout-order/index.ts (395 lignes), create-checkout-session | Migration stripe_connect non confirmée appliquée | checkout-idempotency.spec.ts (13 tests) | DÉMONSTRATION / NON VÉRIFIABLE | 6 (TEST INTÉGRATION OK) / 8 (PROD NON VÉRIFIÉ) | Stripe désactivé (stripe_disabled) | Activer Stripe sandbox si autorisé |
| 4. GAINS LIVREURS (F) | DevenirLivreurPage, LivraisonPage, vendors-service | demoDb | Pas de test dédié gains livreurs | NON VÉRIFIABLE | 1 (CODE PRÉSENT) / 8 (NON VÉRIFIÉ) | Pas de preuve de calcul ou payout | Tester avec données simulées |
| 4. TRAÇABILITÉ (G) | metricsService, audit logs dans tests | Non vérifié distant | tests métriques OK | NON VÉRIFIABLE | 5 (TEST OK) / 8 (PROD NON VÉRIFIÉ) | Evénements non vérifiés pour auteur/horodatage | Vérifier DB réelle |
| 4. REPRISE (H) | backup/archive-2026-09-07.tar.gz (85 790 416 octets, SHA-256 vérifié) | Archive présente, non restaurée | Pas de test de restauration sur environnement isolé | NON VÉRIFIÉ | 3 (SAUVEGARDE PRÉSENTE) / 8 (RESTAURATION NON TESTÉE) | Aucune restauration testée | Tester restauration dans env isolé |

# RÈGLES RESPECTÉES
- Aucune ligne marquée OPÉRATIONNEL sans preuve de service consommé.
- mockCatalog.ts et demoDb.ts classés DÉMONSTRATION.
- Migration SQL dans Git ≠ migration appliquée dans Supabase.
- Interface montant ≠ calcul ni versement vérifié.
- metricsService non qualifié journal d'audit métier sans vérification événements/auteurs/horodatages.
- cacheMaintenance non preuve reprise après incident.
- 77 tests non reliés un par un aux fonctionnalités couvertes (tests globaux, pas mapping explicite par fonction).
- Aucun paiement réel, déploiement, message externe, suppression, secret affiché.
- Aucune clé inventée, aucun secret placé dans VITE_.

# DISQUE / ENV
- /dev/sda1 : 96G total, 90G utilisé, 6,4G libre (~93,75 % — DÉGRADÉ — CAPACITÉ CRITIQUE).
- Pas de build/npm install/pull/génération volumineuse exécuté après correction.

| 1. OLLAMA | Process abs / port fermé / api/tags 000 | Docker absent | NON VÉRIFIABLE | NON JOIGNABLE (HTTP 000) | SERVICE ABSENT | Pas de redémarrage autorisé sans preuve état initial | Vérifier après installation/service disponible |
| 2. UNIFICATION | /opt/vlad/projects/DELIKREOL absent | /workspace/DELIKREOL présent | NON VÉRIFIABLE (réf absente) | Archive SHA-256 vérifiée | DIVERGENCE RÉFÉRENCE | Aucune suppression / déplacement / push | Vérifier référence externe si elle apparaît |
| 3. SUMUP ARCHI | sumupService.ts + architecture locale | Migration non appliquée distante | 77/77 OK | NON VÉRIFIABLE | CONFIG EXT REQUISE (clés serveur) | Aucune modification provider / checkout-order | Fournir SUMUP_API_KEY + webhook secret |
| 4. PARTENAIRES (C) | partnerOnboardingService + 10 migrations locales | Migration locale (non confirmée distante) | 77/77 OK (tests globaux) | NON VÉRIFIABLE | TEST LOCAL | DB accès absent | Valider DB distante si accès obtenu |

| 4. STOCK (D) | mockCatalog / demoDb | Non confirmée distante | Tests globaux OK | DÉMONSTRATION / NON VÉRIFIÉ | Aucun stock réel vérifié | Vérifier base réelle |
| 4. CAPACITÉ CRÉNEAU | LivraisonPage (pas de logique confirmée) | Non confirmée | Pas de test spécifique | NON VÉRIFIÉ | Logique capacité non confirmée | Inspecter LivraisonPage si nécessaire |
| 4. IDEMPOTENCE | checkout-idempotency.spec.ts (7909 octets) | Non confirmée (Stripe disabled) | 13 tests dans suite | TEST LOCAL / NON VÉRIFIÉ | Stripe désactivé | Tester avec Stripe sandbox |
| 4. GAINS LIVREURS | DevenirLivreurPage / LivraisonPage | Non confirmée | Pas de test dédié | NON VÉRIFIÉ | Pas de preuve payout réel | Simuler avec données locales |
| 4. PREUVE LIVRAISON | LivraisonPage (mode proche/loin) | Non confirmée | Pas de test dédié | NON VÉRIFIÉ | Pas de preuve photo automatisée | Vérifier livraison réelle si possible |
| 4. JOURNAL AUDIT | metricsService + audit traces | Non confirmée distante | Tests métriques OK | NON VÉRIFIÉ | Événements/auteurs non vérifiés en prod | Vérifier DB réelle |
| 4. NOTIFICATIONS | Pas de test dédié / log non vérifié | Non confirmée | Pas de test dédié | NON VÉRIFIÉ | Pas de log notifié vérifié | Préparer tests simulés |
