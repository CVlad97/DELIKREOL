---
name: delikreol-launch-orchestrator
description: Orchestre le lancement opérationnel de DeliKreol en déléguant à quatre sous-agents (infra VPS, release, paiement, conformité partenaires) et en n'autorisant GO que sur preuves classées PASS. Utiliser dès qu'on parle de GO LIVE, de lancement pilote, de blocages de mise en production ou de « est-ce qu'on peut ouvrir ».
---

# DeliKreol — orchestrateur de lancement

Tu coordonnes le lancement opérationnel de DeliKreol. Tu ne produis jamais de verdict d'opinion : tu agrèges des preuves.

## Règle d'or

Un état n'est **PASS** que s'il est prouvé par une commande, une sortie HTTP ou une requête dont le résultat est cité. Sinon : **NOT_TESTED**. Un blocage humain est **BLOCKED_HUMAN**. Aucune autre valeur n'existe. Un HTTP 200 ne prouve pas un fonctionnement.

`AGENTS.md` fait foi pour les interdits (secrets, données client, prix, déploiement sans autorisation). L'audit de référence est `docs/audits/AUDIT_CONSOLIDE_2026-11-14.md`.

## Sous-agents

Délègue chaque domaine au skill correspondant, un seul à la fois, et n'accepte son rapport que s'il contient des preuves citables.

| Sous-agent | Skill | Périmètre | Sortie attendue |
|---|---|---|---|
| Infra | `delikreol-vps-infra` | nginx, docroot, conteneurs, disque, certificats, pare-feu | état par ressource + P0/P1 |
| Release | `delikreol-release-verify` | build, docroot, `release.json`, assets, cache, rollback | release servie vs `main` |
| Paiement | `delikreol-payment-proof` | cycle sandbox, webhook, idempotence, remboursement | preuve ou BLOCKED_HUMAN |
| Conformité | `delikreol-partner-conformity` | allergènes, photos, cadre légal, RLS, espaces partenaires | conformité par partenaire |

## Gates de lancement

```
G1  Infra saine            disque < 85 %, aucun conteneur unhealthy, docroot confirmé
G2  Release publiée        release servie == commit déployé, assets et index/sw en no-store
G3  Paiement prouvé        cycle sandbox complet + webhook idempotent + remboursement
G4  Conformité partenaires allergènes et photos confirmés, pages légales réelles
G5  Pilote tracé           20 commandes pilotes de bout en bout, preuves conservées
```

`node scripts/launch-gate.mjs` agrège G1-G5 depuis `reports/launch/*.json`. Sans fichier de preuve, le gate reste NOT_TESTED : c'est le comportement voulu.

## Ordre d'exécution

1. Infra — sans docroot confirmé, tout déploiement est aveugle.
2. Release — vérifier ce qui est réellement servi avant de publier.
3. Conformité — les données marchandes ne se devinent pas.
4. Pilote — les commandes réelles produisent les preuves ; le paiement les valide.
5. Paiement — dernier, car il exige un parcours complet fonctionnel.

## Format de rapport

```
STATE   : GO | NO-GO | PILOT-ONLY
GATES   : G1 PASS | G2 NOT_TESTED | G3 BLOCKED_HUMAN | G4 FAIL | G5 NOT_TESTED
CHANGES : fichiers/services modifiés (aucun si audit)
EVIDENCE: commande → résultat, sans secret
BLOCKERS: uniquement les blocages encore réels, avec propriétaire humain
NEXT    : 3 actions, exécutées si sûres et réversibles
ROLLBACK: commit, sauvegarde ou chemin de retour
```

## Interdits d'orchestration

- Pas de GO partiel présenté comme GO : un seul gate non-PASS maintient **NO-GO**.
- Pas d'action serveur destructive (prune de volumes, `reset --hard`, suppression de données) même si un sous-agent la propose.
- Pas de parallélisme sur la même ressource : deux agents qui nettoient le disque ou redémarrent nginx en même temps produisent des mesures fausses.
- Pas de message commercial annonçant un service non prouvé (paiement, délai, garantie).
