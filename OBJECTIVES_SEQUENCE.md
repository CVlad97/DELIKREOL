# DELIKREOL — Objectives Sequence

Date: 2026-07-06
But: atteindre les objectifs par gates verifiables, sans melanger les repos, les campagnes, les paiements et les automatisations.

## Gate 0 — Verification technique

Statut: OK localement.

- Site public accessible.
- Routes SPA verifiees.
- Liens et WhatsApp verifies.
- Build, lint, typecheck et tests verifies.
- Android Wi-Fi confirme.
- Shizuku non actif: blocage pour verification foreground systeme.

## Gate 1 — Securite donnees et Supabase

Statut: migration corrective preparee, application distante a verifier avant paiement auto.

- Nouvelle migration: `supabase/migrations/20260706000001_rls_policy_hardening.sql`.
- Objectif: remplacer les policies historiques `auth.role()` par `TO role`.
- A verifier sur Supabase avant activation paiement: advisors, migration list, test insert/select/update selon roles.

## Gate 2 — Banque, cles et encaissement

Statut: pret en manuel, bloque en automatique.

- Autorise maintenant: devis, confirmation WhatsApp, virement manuel, acompte manuel.
- Bloque: paiement carte automatique, Stripe production, campagne email a volume.
- Documents: voir `BANK_AND_KEYS_READINESS.md`.

## Gate 3 — Revenus immediats

Statut: pret a executer, 20 prospects publics ajoutes.

- 20 prospects renseignes dans `data/prospection/revenue-prospects-log.csv`.
- 10 messages entreprise.
- 5 messages partenaires.
- Suivi obligatoire: statut, prochaine action, date de relance.

## Gate 4 — Publication et mesure

Statut: GitHub Pages actif, cockpit Anyclaw mission-control publie.

- GitHub Pages reste le site principal.
- Anyclaw sert de cockpit public/installable pour suivre les gates: https://delikreol-mission-control.anyclaw.store/
- Cloudflare reste non actif tant que le domaine/DNS/deploiement n'est pas confirme.

## Gate 5 — Actions interdites sans confirmation

- Envoyer des emails reels.
- Envoyer des SMS.
- Lire contacts/SMS/calendrier.
- Creer ou exposer une cle API.
- Commit/push GitHub.
- Appliquer migration sur base distante.
- Activer paiement carte production.

## Skills fournis — sequence d'utilisation

| Skill | Usage dans cette sequence | Gate |
| --- | --- | --- |
| Android Device Access | Verifier Wi-Fi, batterie, ouvrir site, notifier, presse-papiers | 0 |
| github:github | Orienter repo actif, remote, branche, et changements | 0 |
| supabase:supabase | Auditer migrations/RLS, preparer durcissement | 1 |
| build-web-apps:supabase-postgres-best-practices | Appliquer `TO role`, `WITH CHECK`, eviter `auth.role()` | 1 |
| cloudflare:cloudflare | Garder Cloudflare comme gate DNS/deploiement, non active ici | 4 |
| anyclaw-publish | Publier cockpit mission-control si API disponible | 4 |
| build-web-apps:frontend-app-builder | Interface cockpit claire, mobile-first, premium | 4 |
| canva:canva-resize-for-all-social-media | Bloque sans design Canva source | 3 |
| outlook-email:outlook-email | Bloque sans boite/campagne confirmee | 3 |
| composio-cli | Optionnel pour connecter outils si slug cible donne | 3 |
| openai-developers:openai-platform-api-key | Non utilise: aucune app OpenAI API a construire maintenant | 5 |
| twilio-developer-kit:twilio-security-api-auth | Non utilise: aucun appel Twilio production maintenant | 5 |
| flightclaw | Non pertinent pour DELIKREOL revenu actuel | 5 |
| moody-s:moody-s-earnings-brief | Non pertinent sans analyse earnings 2-5 societes | 5 |
| skill-installer / skill-creator / plugin-creator | Non utilise: pas de nouvelle skill/plugin demandee | 5 |
