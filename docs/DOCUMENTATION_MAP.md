# DELIKREOL — Carte documentaire et plan de fusion (14/11/2026)

**Objet :** mettre fin à 141 fichiers Markdown qui décrivent le même projet avec des vérités différentes, **sans supprimer aucune trace d'audit**.
**Statut :** proposition. Aucune fusion n'a été exécutée.

---

## 1. Constat chiffré

| Mesure | Valeur |
|---|---|
| Fichiers Markdown au total | **141** (53 à la racine, 88 sous `docs/`) — hors cette carte |
| Doublons exacts (md5 identique) | **0** |
| Clusters thématiques redondants identifiés | **18** |
| Documents encore valides comme référence de travail | **~30** |

Le problème n'est donc pas la copie, c'est la **dispersion** : dix-huit sujets sont traités par trois à dix fichiers qui se contredisent souvent sur des faits vérifiables (hébergeur, DNS, domaine, référence Supabase).

### Trois contradictions factuelles à éliminer

| Fichier | Ce qu'il affirme | Réalité vérifiée |
|---|---|---|
| `docs/DEPLOIEMENT.md` | « Déploiement Cloud (Vercel + Supabase) » | La production est un VPS Hostinger sous nginx, conteneur `delikreol-web`. Vercel n'est utilisé par rien. |
| `GOOGLE_WORKSPACE_DNS_SETUP.md` (16 Ko) | MX `smtp.google.com`, SPF Google, DKIM Google | L'e-mail passe par **Cloudflare Email Routing** (`CLOUDFLARE_EMAIL_ROUTING_DELIKREOL_COM.md`, `docs/DELIKREOL_EMAIL_CONFIG.md`). Suivre ce fichier casse le routage e-mail actuel. |
| `docs/audits/live/SPA_ROUTING_LIMITATION.md` | Limitation de routing SPA « sur GitHub Pages » | GitHub Pages ne sert plus le site. La limitation n'existe plus. |

Second effet de bord : la racine contient **deux checklists go-live opposées** — `GO_LIVE_CHECKLIST.md` (racine) décrit Bolt + Google Workspace, donc une infrastructure disparue, tandis que `docs/GO_LIVE_CHECKLIST.md` contient les vrais gates techniques (`npm ci`, typecheck, lint, test, build, audit:secrets, `npm audit`). C'est le fichier `docs/` qui est utile, pas celui de la racine.

---

## 2. Règle de préservation (non négociable)

Trois classes, trois traitements :

1. **CANONIQUE** — document vivant, mis à jour. Un seul par sujet. Il reste à sa place (racine ou `docs/<domaine>/`).
2. **PREUVE** — audit, rapport de vérification, relevé de données marchandes. **Jamais réécrit, jamais fusionné** : une preuve datée qui change de contenu n'est plus une preuve. Il est **déplacé** vers `docs/archives/audits/<année>/` et **indexé** (§ 5).
3. **SESSION** — rapport d'avancement d'un agent (« Build ✅ 0 erreur », « X_READY »). Déplacé vers `docs/archives/sessions/`, intact, et indexé.

Conséquence : aucune suppression dans ce plan. Seuls des déplacements (`git mv`) et des réécritures de **CANONIQUE**.

---

## 3. Clusters et canoniques proposés

### 3.1 Lancement et qualité

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Gates techniques pré-prod | `docs/GO_LIVE_CHECKLIST.md`, `docs/CHECKLIST_FINALE.md` (domaine `.mq`, périmé), `docs/MVP_READY.md`, `docs/FINALISATION_PLAN.md` | `docs/GO_LIVE_CHECKLIST.md` | Garder et fusionner les gates encore valides de `CHECKLIST_FINALE` ; archiver `MVP_READY`, `FINALISATION_PLAN` |
| Bloquants commerciaux | `CHECKLIST_GO_LIVE.md` (racine), `GO_LIVE_CHECKLIST.md` (racine), `PREUVES_MANQUANTES_2026-09-07.md`, `docs/audits/GO_LIVE_AUDIT_20260821.md` | `CHECKLIST_GO_LIVE.md` (racine) | Fusionner les bloquants encore ouverts ; archiver les deux autres (preuves) |

### 3.2 Déploiement et hébergement

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Déploiement production | `docs/DEPLOYMENT_RUNBOOK.md`, `docs/DEPLOIEMENT.md` (Vercel), `docs/DEPLOY_DOT_COM.md`, `docs/audits/live/HOSTING_DEPLOYMENT.md`, `docs/SUPABASE_DEPLOY.md` | `docs/DEPLOYMENT_RUNBOOK.md` — **à réécrire pour le VPS réel** (docroot à confirmer, cf. audit consolidé) | Fusionner le runbook ; archiver Vercel et les rapports de migration |
| Installation locale | `docs/INSTALLATION.md`, `docs/QUICK_START.md`, `ENV_SETUP.md` | `docs/INSTALLATION.md` | Fusionner `QUICK_START` + le contenu variables de `ENV_SETUP` |
| Rollback | `docs/ROLLBACK_PAYMENTS.md` | — | **Conserver** tel quel (procédure sensible) |

### 3.3 E-mail, DNS, authentification

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| E-mail | `CLOUDFLARE_EMAIL_ROUTING_DELIKREOL_COM.md`, `docs/DELIKREOL_EMAIL_CONFIG.md`, `GOOGLE_WORKSPACE_DNS_SETUP.md` | `docs/DELIKREOL_EMAIL_CONFIG.md` | Fusionner les deux premiers ; **archiver** le troisième en le marquant « remplacé par Cloudflare Routing » |
| DNS domaine | `docs/HOSTINGER_DNS_SETUP.md`, `DELIKREOL_MQ_MIGRATION_REPORT.md` (15 Ko, domaine `.mq`) | `docs/HOSTINGER_DNS_SETUP.md` | Archiver le rapport de migration `.mq` |
| Auth Google | `GOOGLE_SSO_SETUP.md`, `docs/AUTH_GOOGLE_SUPABASE_RUNBOOK.md` | `docs/AUTH_GOOGLE_SUPABASE_RUNBOOK.md` | Fusionner le guide long dans le runbook |

### 3.4 Supabase et données

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Modèle de données | `docs/DATA_INFRASTRUCTURE.md`, `SUPABASE_READINESS_AUDIT.md`, `docs/audits/supabase/*` (2) | `docs/DATA_INFRASTRUCTURE.md` | Fusionner l'audit RLS encore valide ; archiver les états « avant » |
| Migration / RLS | `SUPABASE_MIGRATION_TEST_PLAN.md`, `docs/audits/staging-migration-audit.md` (36 Ko) | `SUPABASE_MIGRATION_TEST_PLAN.md` | Conserver le plan ; archiver l'audit comme preuve |
| Mode gratuit / open source | `SUPABASE_FREE_OPEN_SOURCE_SETUP.md`, `docs/LITE_TUNNEL.md`, `docs/OPERATIONS.md`, `docs/GOOGLE_SHEETS_SETUP.md`, `docs/OPS_GOOGLE_SHEET_MODEL.md` | `docs/lite/README.md` (nouveau, 1 page) | Fusionner les cinq en un seul document de la piste « Lite » |

### 3.5 Paiements

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Architecture paiements | `docs/payments/MANUAL_PAYMENT_ARCHITECTURE_20260731.md`, `docs/operations/GO_LIVE_PAYMENTS_DISPATCH_FACTURATION_20260911.md` | `docs/payments/MANUAL_PAYMENT_ARCHITECTURE_20260731.md` | Fusionner le statut daté dans l'architecture |
| Stripe test | `docs/STRIPE_TEST_RUNBOOK.md`, `docs/STRIPE_TEST_SETUP.md` | `docs/STRIPE_TEST_RUNBOOK.md` | Fusionner (deux documents qui décrivent la même procédure) |

### 3.6 Sécurité

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Politique de sécurité | `SECURITY.md` | `SECURITY.md` | **Canonique.** Y intégrer en annexe `SECURITY_DASHBOARD_CONFIG.md` (actions Supabase concrètes, unique) |
| Audits et correctifs | `SECURITY_AUDIT_FIXES_2026_01_05.md`, `SECURITY_FIXES_2024_12_29.md`, `SECURITY_FIXES_APPLIED.md`, `SECURITY_FINAL_STATUS.md`, `SECURITY_NON_ISSUES.md`, `SECURITY_NOTES.md`, `docs/SECURITY_NOTES.md` (contenu différent : « Lite premium »), `docs/audits/live/SECURITY_HEADERS.md` | aucune fusion | **Tout archiver intact** dans `docs/archives/audits/security/`. Renommer `docs/SECURITY_NOTES.md` → `SECURITY_NOTES_LITE_PREMIUM.md` pour lever l'homonymie trompeuse. |

### 3.7 WhatsApp et canaux

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Configuration WhatsApp | `docs/WHATSAPP_BUSINESS_SETUP.md`, `docs/WHATSAPP_IMPORT_SETUP.md` | `docs/WHATSAPP_BUSINESS_SETUP.md` | Fusionner (setup Meta + import) |
| Scripts et messages | `docs/OPS_WHATSAPP_SCRIPTS.md`, `docs/MESSAGES_WHATSAPP_PARTENAIRES.md`, `docs/LIENS_WHATSAPP_PARTENAIRES.md`, `partner_messages/`, `MESSAGE_PARTENAIRE_SAVE_PEYIA.md` | `docs/operations/` | Regrouper les scripts ; les messages partenaires sont des **données**, pas de la doc → rester dans `partner_messages/` |
| Lancement manuel | `docs/operations/PHASE1_WHATSAPP_MANUAL_LAUNCH.md`, `docs/operations/ACTIVE_REQUESTS_CONSOLIDATED_20260911.md`, `docs/operations/SOCIAL_DATA_RUNBOOK.md` | `docs/operations/PHASE1_WHATSAPP_MANUAL_LAUNCH.md` | Archiver les demandes consolidées (datées) |

### 3.8 Partenaires et médias

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Espace partenaire | `docs/PARTNER_SPACE_PILOTE.md`, `docs/PARTNER_STUDIO_DEPLOYED_20260906.md`, `docs/concept-partners.md`, `docs/partner-import-terminal-readiness-2026-07-16.md` | `docs/PARTNER_SPACE_PILOTE.md` | Fusionner le statut studio ; archiver les rapports datés |
| Dossiers pilotes | `docs/LANGOUSTE_HOUSE_*.md` (3), `docs/langouste-house-photo-provenance.md` | `docs/LANGOUSTE_HOUSE_PILOTE_DOSSIER.md` | **Conserver séparément** : convention à signer et procédure mobile sont des documents contractuels/opérationnels distincts |
| Preuves médias | `AUDIT_PHOTOS_RAPPORT.md`, `TRAITEURS_MEDIA_AUDIT.md`, `RAPPORT_MIGRATION_MEDIA.md`, `docs/audits/images/*` (8) | aucune | **Preuves : archiver intactes**, indexées dans § 5. Aucune fusion. |
| Imports traiteurs | `docs/imports/AN_TJE_COCO_PREFLIGHT.md`, `docs/openclaw/IMPORT_AN_TJE_COCO.md`, `TRAITEURS_ACCESS_LINKS.md` | `docs/openclaw/IMPORT_AN_TJE_COCO.md` | Fusionner le préflight ; les liens d'accès sont des données opérationnelles à garder |

### 3.9 Business, stratégie, mémoire

| Sujet | Fichiers | Canonique | Action |
|---|---|---|---|
| Stratégie | `docs/PLAN_STRATEGIQUE_COMPLET.md`, `SPRINT.md`, `docs/ROADMAP_TECHNIQUE_2026.md`, `docs/AUDIT_UBEREATS_DELIKREOL_2026-06-24.md` | `docs/PLAN_STRATEGIQUE_COMPLET.md` | Fusionner le sprint en cours ; archiver l'audit UberEats (preuve comparative) |
| Revenus | `REVENUE_OPERATING_BOARD.md`, `CAMPAIGN_LAUNCH_KIT.md`, `BANK_AND_KEYS_READINESS.md`, `PROSPECTION_PUBLIC_SOURCES.md` | `REVENUE_OPERATING_BOARD.md` | **Conserver séparément** : quatre artefacts d'exécution distincts (tableau de bord, kit, banque/clés, prospection) |
| Financement | `docs/community-fund.md`, `docs/FUNDRAISING_CAMPAIGN_MASTER_PROMPT.md` | `docs/FUNDRAISING_CAMPAIGN_MASTER_PROMPT.md` | Fusionner |
| Mémoire projet | `docs/PROJECTS_MEMORY.md`, `docs/PROJECT_MEMORY_CLEAN.md` | `docs/PROJECT_MEMORY_CLEAN.md` (2026-09-13, référence Supabase correcte) | Fusionner ; archiver `PROJECTS_MEMORY` (gabarit vide) |
| Orchestration agents | `ANYCLAW_MISSION_CONTROL.md`, `REPOS_OPERATING_MAP.md`, `OBJECTIVES_SEQUENCE.md`, `ORCHESTRATION_CONNECTE_SECURITE.md`, `HERMES_BANKABLE_OPERATING_PROMPT.md`, `docs/agents.md`, `docs/integrations.md` | `REPOS_OPERATING_MAP.md` + `docs/agents.md` | Fusionner l'orchestration datée ; garder la carte des dépôts et le guide des intégrations |

### 3.10 Specs non implémentées

`DELIVERY_CLICK_COLLECT.md`, `UNSOLD_INVENTORY_DLC.md`, `HOSTINGER_STYLE_UI_INTEGRATION_PLAN.md`

→ **Conserver**, déplacés dans `docs/specs/`. Ce sont des intentions non réalisées : les fusionner dans un canonique les rendrait invisibles.

---

## 4. Arborescence cible

```
README.md  AGENTS.md  CONTRIBUTING.md  SECURITY.md  LICENSE
CHECKLIST_GO_LIVE.md          # bloquants commerciaux, uniques
REVENUE_OPERATING_BOARD.md    # + kit campagne, banque/clés, prospection (sujets distincts)
docs/
  DEPLOYMENT_RUNBOOK.md       # réécrit pour le VPS réel
  GO_LIVE_CHECKLIST.md        # gates techniques
  INSTALLATION.md             # + QUICK_START, variables d'env
  DATA_INFRASTRUCTURE.md      # + audit RLS valide
  SUPABASE_MIGRATION_TEST_PLAN.md
  DELIKREOL_EMAIL_CONFIG.md   # Cloudflare Email Routing
  HOSTINGER_DNS_SETUP.md
  AUTH_GOOGLE_SUPABASE_RUNBOOK.md
  PARTNER_SPACE_PILOTE.md
  WHATSAPP_BUSINESS_SETUP.md
  OPERATIONS.md
  PLAN_STRATEGIQUE_COMPLET.md
  PROJECT_MEMORY_CLEAN.md
  REPOS_OPERATING_MAP.md
  agents.md
  integrations.md
  payments/  legal/  operations/  lite/  specs/
  audits/                     # audits de référence encore valides (ECC, consolidé)
  archives/
    audits/{security,images,supabase,live,colors}/
    sessions/
    INDEX.md                  # index unique de tout ce qui est archivé
```

Cible : **~30 documents canoniques** + archives indexées, contre 141 fichiers en vrac.

---

## 5. Index des archives (à produire pendant l'exécution)

`docs/archives/INDEX.md` : une ligne par document archivé — chemin, date, sujet, raison de l'archivage, et ce qui l'a remplacé. Sans cet index, archiver revient à cacher. C'est la pièce qui garantit qu'une **preuve reste trouvable** même hors du chemin principal.

---

## 6. Exécution proposée — 4 lots réversibles

Chaque lot est un commit séparé, `git mv` uniquement (aucune réécriture de preuve), et se termine par un contrôle de liens.

| Lot | Contenu | Risque | Contrôle |
|---|---|---|---|
| **1. Archives à froid** | Déplacer sécurité, images, sessions, états « avant » vers `docs/archives/` + écrire `INDEX.md` | nul | `grep -r` des anciens chemins, liens README |
| **2. Renommages** | `docs/SECURITY_NOTES.md` → `SECURITY_NOTES_LITE_PREMIUM.md` ; `docs/agents.md` (minuscule) → `AGENTS_AGENTS_IA.md` pour éviter la confusion avec le contrat `AGENTS.md` | faible | liens internes |
| **3. Fusions de canoniques** | E-mail, déploiement, installation, Stripe, mémoire projet, Lite, auth Google | moyen : nécessite de lire les sources et de ne pas perdre d'info | relecture ligne à ligne, aucune donnée commerciale inventée |
| **4. Contradictions** | Réécrire `docs/DEPLOYMENT_RUNBOOK.md` pour le VPS réel ; marquer `GOOGLE_WORKSPACE_DNS_SETUP.md` et `docs/DEPLOIEMENT.md` comme remplacés ; mettre à jour la carte du README | moyen | vérifier que le README ne pointe que vers des canoniques |

**Ordre recommandé :** 1 → 2 → 4 → 3. Traiter d'abord les contradictions (§ 1) évite de fusionner des textes faux dans des canoniques.

---

## 7. Ce qui n'est jamais touché

- `AGENTS.md` (contrat ECC), `LICENSE`, `CONTRIBUTING.md` ;
- `CHECKLIST_GO_LIVE.md` dans ses bloquants factuels ;
- les documents contractuels Langouste House (convention à signer, procédure mobile) ;
- les preuves marchandes et photos (audits images, messages partenaires) ;
- les audits de sécurité : déplacés, **jamais réécrits**.

## 8. Limites de cette proposition

Aucun fichier n'a été déplacé ni fusionné à ce stade. Les regroupements ci-dessus sont établis sur les titres, tailles et contenus d'en-tête ; chaque fusion du lot 3 exige une lecture complète des sources avant écriture. Les fichiers de `docs/` peuvent encore contenir des informations uniques que seul un diff exhaustif révélera — c'est pourquoi la règle est **archiver plutôt que supprimer**.
