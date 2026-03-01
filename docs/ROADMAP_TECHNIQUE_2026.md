# Roadmap Technique 2026 - Delikreol

## Phase 1 - MVP (0 a 8 semaines)
Objectif: vente en ligne operationnelle Martinique + logistique locale minimale.

- Catalogue structure (5 categories prioritaires)
- Comptes vendeurs + fiches producteurs
- Checkout Stripe + confirmation commande
- Backoffice commande simple (client/vendeur/admin)
- Tracking de base (etat commande + notifications)
- Deploiement Vercel + Supabase prod

KPI MVP:
- 50 produits actifs
- 10 vendeurs onboardes
- 95% commandes sans incident critique

## Phase 2 - Beta (2 a 4 mois)
Objectif: marketplace multi-acteurs robuste et automatisation operationnelle.

- Livraison mutualisee (tournes + points relais)
- Dashboard fournisseurs complet (stock, ventes, SLA)
- Sync fournisseurs (CSV/Sheets/API)
- Moteur promo + coupons + fidelite
- Observabilite (logs, alerting, quality gates)

KPI Beta:
- 1000 commandes/mois
- taux de rupture < 5%
- temps moyen preparation < 30 min

## Phase 3 - Scale International (4 a 12 mois)
Objectif: plateforme exportable DOM-TOM et internationale.

- Gestion multi-zone et regles export
- Multi-devises / TVA / frais douane
- Connecteurs transporteurs internationaux
- Architecture event-driven (files de messages)
- Data platform BI (forecasting demande/stocks)

KPI Scale:
- 3 territoires actifs
- delai moyen livraison export < 5 jours
- marge logistique amelioree de 20%

## Priorites transverses (en continu)
- Securite: RLS, rotation secrets, audit acces
- Qualite: tests e2e critiques, contracts API
- Performance: monitoring front (LCP/INP), indexes SQL
- Conformite: mentions legales, CGU, politique retours
