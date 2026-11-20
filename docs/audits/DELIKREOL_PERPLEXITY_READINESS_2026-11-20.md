# DELIKREOL — Audit public et préparation Perplexity

Date : 20 novembre 2026. Serveur inspecté : srv1729857.

## Vérifié directement
- CLI Perplexity disponible : `/root/.local/bin/pplx` ; version `2026.07.30.1785394496+1b7382b`.
- La commande `pplx search web` existe et accepte une requête avec objectif, limite et répertoire de résultats.
- Les sept URLs suivantes renvoient HTTP 200 : `/`, `/traiteurs/`, `/catalogue/`, `/connexion/`, `/jobs`, `/offres-cash`, `/traiteur/les-delices-de-ninice`.
- Contrôle de qualité des logos locaux : `npm run quality:brands` ; deux assets authentifiés dans le registre du dépôt.

## Non vérifié / blocages
- Authentification Perplexity API : non confirmée ; la CLI ne propose pas `auth status`. Aucun appel API payant effectué.
- Aucun logo de partenaire supplémentaire authentifié ni téléchargé par cette opération.
- HTTP 200 ne prouve ni le rendu mobile, ni le fonctionnement du panier, ni le paiement, ni la validation réglementaire.
- L'audit automatisé complet et le test des transactions nécessitent des parcours de test et une validation humaine.

## Intégration économique
- Script `scripts/agents/perplexity-research.sh` : refuse tout appel payant par défaut.
- Un opérateur doit explicitement autoriser l'exécution en positionnant `PERPLEXITY_ALLOW_PAID_SEARCH=1` et en configurant ses identifiants localement, jamais dans le dépôt.
- Rechercher uniquement des sources officielles, conserver les URLs et ne pas confondre compte social trouvé avec logo authentifié.
- Aucune publication de code ni modification de la production depuis cet audit.

## Décision
**NO-GO commercial non levé** : audit public préliminaire seulement, pas de test de commande ni de paiement.
