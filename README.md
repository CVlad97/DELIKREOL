# DELIKREOL

Le goût local, simple à commander.
Plateforme de coordination traiteurs, plats créoles, points relais et livraison programmée en Martinique.

**© 2026 Vladimir Claveau — Tous droits réservés. Propriété exclusive.**
Reproduction, modification ou distribution interdite sans autorisation écrite.

## Stack

- React 18 + TypeScript + Vite + TailwindCSS, PWA via `vite-plugin-pwa`
- Supabase : Postgres, auth, Edge Functions — projet `boihlgodmclljtckhmgz`
- Hébergement production : VPS Hostinger `srv1729857.hstgr.cloud` (nginx 1.24, conteneur `delikreol-web`), domaine `delikreol.com`
- E-mail : Cloudflare Email Routing
- WhatsApp Business (support et coordination manuelle)

## État au 14/11/2026

- Production : `https://delikreol.com` sert la release `delikreol-84c0d40` (06/11/2026) ; `main` est à `4194bd0`, soit 2 commits d'avance non déployés.
- Verdict commercial : **NO-GO** — pilote manuel assisté uniquement. Source de vérité : [`docs/audits/AUDIT_CONSOLIDE_2026-11-14.md`](docs/audits/AUDIT_CONSOLIDE_2026-11-14.md).
- Paiements : Stripe désactivé (`stripe_disabled`), SumUp sans preuve sandbox, règlement manuel (virement, à la livraison, WhatsApp).
- Serveur : disque à 92 % et redémarrage en attente — P0 ouverts (voir l'audit consolidé).

## Démarrage

```bash
npm ci
cp .env.example .env    # renseigner les variables, ne jamais committer .env
npm run dev
```

## Vérification avant toute livraison

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:secrets
npm run audit:catalog-media
```

## Documentation

**Contrat de travail** : [`AGENTS.md`](AGENTS.md).

| Besoin | Document |
|---|---|
| État réel du projet, verdict, plan P0/P1 | [`docs/audits/AUDIT_CONSOLIDE_2026-11-14.md`](docs/audits/AUDIT_CONSOLIDE_2026-11-14.md) |
| Bloquants commerciaux avant ouverture | [`CHECKLIST_GO_LIVE.md`](CHECKLIST_GO_LIVE.md), [`GO_LIVE_CHECKLIST.md`](GO_LIVE_CHECKLIST.md) |
| Exploitation VPS (topologie, conteneurs, règles) | [`_docs/VPS_MASTER_FINALISATION_PROMPT.md`](_docs/VPS_MASTER_FINALISATION_PROMPT.md) |
| Étapes manuelles VPS / WhatsApp | [`docs/NEXT_MANUAL_STEPS.md`](docs/NEXT_MANUAL_STEPS.md) |
| Déploiement et rollback | [`docs/DEPLOYMENT_RUNBOOK.md`](docs/DEPLOYMENT_RUNBOOK.md), [`docs/ROLLBACK_PAYMENTS.md`](docs/ROLLBACK_PAYMENTS.md) |
| Qualité du harness (ECC) | [`docs/ECC_AUDIT_2026-11-05.md`](docs/ECC_AUDIT_2026-11-05.md) |
| Supabase : RLS, migration | [`SUPABASE_READINESS_AUDIT.md`](SUPABASE_READINESS_AUDIT.md), [`SUPABASE_MIGRATION_TEST_PLAN.md`](SUPABASE_MIGRATION_TEST_PLAN.md), [`docs/DATA_INFRASTRUCTURE.md`](docs/DATA_INFRASTRUCTURE.md) |
| Revenus et opérations | [`REVENUE_OPERATING_BOARD.md`](REVENUE_OPERATING_BOARD.md), [`CAMPAIGN_LAUNCH_KIT.md`](CAMPAIGN_LAUNCH_KIT.md), [`BANK_AND_KEYS_READINESS.md`](BANK_AND_KEYS_READINESS.md), [`REPOS_OPERATING_MAP.md`](REPOS_OPERATING_MAP.md), [`OBJECTIVES_SEQUENCE.md`](OBJECTIVES_SEQUENCE.md) |
| Prospection | [`PROSPECTION_PUBLIC_SOURCES.md`](PROSPECTION_PUBLIC_SOURCES.md), [`data/prospection/revenue-prospects-log.csv`](data/prospection/revenue-prospects-log.csv) |
| Cadre légal livraison / points relais | [`docs/LIVREURS_CADRE_LEGAL.md`](docs/LIVREURS_CADRE_LEGAL.md), [`docs/POINTS_RELAIS_CADRE_LEGAL.md`](docs/POINTS_RELAIS_CADRE_LEGAL.md) |
| Preuves partenaires (photos, médias) | [`AUDIT_PHOTOS_RAPPORT.md`](AUDIT_PHOTOS_RAPPORT.md), [`TRAITEURS_MEDIA_AUDIT.md`](TRAITEURS_MEDIA_AUDIT.md), [`partner_messages/`](partner_messages/) |

**Historique** : les rapports de session et audits périmés (Netlify, Bolt, GitHub Pages, ancienne référence Supabase) ont été supprimés le 14/11/2026. Ils restent consultables dans l'historique Git (`git log -- <fichier>`), et l'audit consolidé en résume les conclusions et les raisons de leur retrait.

## Routes principales

`/` accueil · `/catalogue` · `/traiteurs` · `/produit/:slug` · `/panier` · `/devenir-partenaire` · `/devenir-livreur` · `/points-relais` · `/statut-commande` · `/admin`

## Licence

Tous droits réservés. Voir [`LICENSE`](LICENSE).

## Contact

Vladimir Claveau — vladimirclavo@gmail.com
