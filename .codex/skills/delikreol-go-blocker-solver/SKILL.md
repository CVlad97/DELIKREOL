---
name: delikreol-go-blocker-solver
description: Diagnose, prioritize and safely resolve every DELIKREOL launch blocker across catalog, partner access, Supabase RLS, orders, SumUp/Stripe sandbox, delivery, notifications, UX, deployment and 20-order GO evidence. Use when a GO audit finds a blocker, regression, failed test, broken route, or uncertain operational readiness.
---

# DELIKREOL — GO Blocker Solver

## Objective

Move DELIKREOL from PILOT/NO-GO to evidence-backed GO by solving **one independently verifiable blocker at a time**. This is not a blanket permission to change production, make live payments, contact partners, delete data, or disable security controls. Prefer minimum safe changes and repeatable tests. Keep the user's existing work and local files intact.

## Inputs and baseline

- GitHub `CVlad97/DELIKREOL`, working tree `/opt/vlad/projects/DELIKREOL`, public URL `https://delikreol.com/`.
- Start from the *current* origin/main and `git status`. If dirty, create a clean worktree. Do not reset, overwrite, stash or delete other people's work.
- Read `docs/PILOTE_20_COMMANDES_2026-11-20.md` and current evidence, but treat previous audit results as historical, not current.
- Run `node .codex/skills/delikreol-go-blocker-solver/triage.mjs` (read-only, creates JSON report), plus `node scripts/audit-catalog-media.mjs`, `node scripts/audit-routes.cjs`, `npm run typecheck`, `npm run build`, relevant Vitest/Playwright tests when dependencies permit. Capture exit codes and output; distinguish unavailable dependencies from test failures.
- Never print API keys, private contact details, customer orders or auth tokens into logs or Git.

## Triage and repair loop

1. Identify the **actual observed symptom** with URL, role, timestamp, environment and reproducible steps. Never invent a root cause.
2. Classify: `P0 security/payment/data loss`, `P0 checkout blocking`, `P1 partner/catalog/delivery`, `P2 performance/UI`. Set an owner and clear acceptance criteria.
3. Locate affected component and smallest regression test. For Supabase check RLS and ownership before any schema change. For catalog/photos use `delikreol-catalog-photo-go`; for legitimate partner linking use `delikreol-partner-linking`.
4. In clean branch/worktree, implement smallest reversible fix, with unit/integration test and before/after proof. Do not change other subsystems opportunistically.
5. Run build, typecheck, lint, targeted tests, mobile/desktop browser smoke, and `git diff --check`. A successful build is not proof of operational payments or delivery.
6. Propose PR with exact diff, tests, risks and rollback. Merge/deploy only with appropriate authorization. Confirm deployment SHA and live behavior before closing blocker.
7. Update report status `open → investigating → fixed-in-code → deployed → verified`; only `verified` counts as solved.
8. Re-run baseline and move to next blocker. If blocked by missing partner, bank, legal or production access, record precise dependency and stop rather than fake success.

## Workstreams / evidence requirements

| Workstream | Acceptance evidence |
|---|---|
| Catalog and photography | Correct product/partner match, rights and approval, accurate price, ingredients/allergens, working optimized images, mobile review |
| Partner/client authentication | Confirmed identity and role, legitimate partner ownership, RLS isolation, password recovery, no privilege escalation |
| Cart and menus | Guest and logged-in baskets, extras persisted, server price verification, no silent cross-vendor misrouting |
| Order lifecycle | Accept/refuse, cancel, reschedule, pickup/delivery, state transitions, idempotency and auditable logs |
| SumUp/Stripe | **Sandbox only**: signed webhook, duplicate/replay handling, failed payment, refund, no leaked secret; no live charges |
| Delivery and relays | Validated zones, fees, slots, driver assignment and actual notifications; no unsupported real-time claims |
| UX/mobile/PWA | 390px and desktop browser checks, keyboard access, performance, route reload, asset caching and error states |
| Commercial/legal | 3 confirmed pilot vendors, hours/capacity, commission, CGV, cancellations, privacy, mediator and partner sign-off |
| GO | 20 distinct pilot scenarios executed with proof, no P0 blockers, explicit human authorization for live activation |

## Automation guardrails

Replica/Codex/Hermes may **read, test, create isolated branches and draft fixes**. Never automatically perform production SQL, loosen RLS, deploy payment secrets, trigger real orders, make refunds, enable live Stripe/SumUp, publish unapproved product imagery, or send partner messages. No unattended `git push` to protected branches without explicit approval for the change. Keep an audit trail of each run and compare commit SHA.

## Deliverables

- `reports/go-blocker-triage.json`: current evidence and unverified blockers (generated, ignored by Git).
- One concise Markdown issue per verified P0/P1 with reproduction, cause, test, fix, owner, proof and rollback.
- GO status must remain `NO-GO` until independent end-to-end verification. A code fix is not a closed operational blocker.
