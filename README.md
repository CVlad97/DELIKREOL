# DELIKREOL

Le goût local, simple à commander.

Plateforme de coordination traiteurs, plats créoles, points relais et livraison programmée en Martinique.

**© 2026 Vladimir Claveau — Tous droits réservés. Propriété exclusive.**
**Reproduction, modification ou distribution interdite sans autorisation écrite.**

## Stack
- React 18 + TypeScript + Vite + TailwindCSS
- Supabase (base de données, auth, Edge Functions)
- GitHub Pages (hébergement frontend)
- WhatsApp Business (support client uniquement)
- Google Sheets/Apps Script (fallback backup)

## Routes principales
- `/` — Accueil avec carrousels traiteurs et produits
- `/catalogue` — Catalogue complet
- `/traiteurs` — Liste des traiteurs
- `/panier` — Panier et checkout Supabase-first
- `/devenir-partenaire` — Candidature partenaire + forfaits
- `/devenir-livreur` — Candidature livreur
- `/points-relais` — Candidature point relais
- `/admin` — Dashboard coordinateur

## Operations revenu
- `REVENUE_OPERATING_BOARD.md` — priorites revenus, separation projets, scripts commerciaux
- `CAMPAIGN_LAUNCH_KIT.md` — campagnes WhatsApp/email pretes a envoyer
- `BANK_AND_KEYS_READINESS.md` — banque, cles, paiement, email domaine
- `REPOS_OPERATING_MAP.md` — role de chaque repo local
- `OBJECTIVES_SEQUENCE.md` — gates verifiables avant action
- `SUPABASE_READINESS_AUDIT.md` — audit RLS et migration de durcissement
- `SUPABASE_MIGRATION_TEST_PLAN.md` — plan de test avant application distante
- `ANYCLAW_MISSION_CONTROL.md` — cockpit Anyclaw publie
- `PROSPECTION_PUBLIC_SOURCES.md` — sources publiques de prospection
- `data/prospection/revenue-prospects-log.csv` — suivi prospects et relances

## Verification
```bash
npm run typecheck
npm run lint
npm run build
npm run audit:routes
```

## Licence
Tous droits réservés. Voir LICENSE.

## Contact
Vladimir Claveau — vladimirclavo@gmail.com
