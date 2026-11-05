# DELIKREOL — ECC engineering contract

## Objectif
Finaliser un pilote commercial mesurable en Martinique, sans jamais annoncer GO avant preuves de commande et conformité.

## Conventions de travail
- Lire README.md, package.json, routes, services, scripts et les rapports existants avant toute modification.
- Ne jamais afficher de secrets, modifier les fichiers .env ni effacer une donnée client.
- Travail sur une branche ou modifications locales revues ; aucun déploiement, paiement réel ou activation d'offres sans autorisation.
- Conserver les modifications locales préexistantes et les paramètres d'hébergement.
- Pour une donnée commerciale (prix, disponibilité, fournisseur, allergènes), ne jamais l'inventer.
- Chaque modification doit être reliée à un résultat de test reproductible.
- Vérifier les droits d'accès, RLS, sessions, propriété des données et appels API selon les rôles.

## Tests obligatoires
```sh
npm run typecheck; npm run lint; npm run test; npm run build; npm run audit:catalog-media; npm run audit:secrets
```

## Parcours bloquants au lancement
- DELIKREOL : connexion client/partenaire, composition menu, panier, validation/annulation, retrait/livraison, paiement sandbox + webhook/idempotence + remboursements, 20 commandes pilotes tracées.
- KOPÉAGRI : inscription producteur, conformité catalogue/traçabilité, validation commandes, approvisionnement/livraison, séparation des droits, liens DELIKREOL.
- Exiger une preuve navigateur et backend par parcours ; le HTTP 200 ne prouve pas son fonctionnement.
- Contrôler RGPD, CGV, mentions légales, déclaration et hygiène selon l'activité réelle ; bloquer GO si inconnu.

## Audit ECC
Utiliser le script officiel `/root/.codex/.tmp/marketplaces/ecc/scripts/harness-audit.js` via `scripts/ecc-audit.sh`. Les scores ECC mesurent la qualité du harness, pas la préparation commerciale.
