# DELIKREOL — Public API Bridge

Le guide externe demandé (catalogue « 1900 APIs ») n'a pas pu être consulté dans cette session. Ce document ne prétend pas le reproduire.

## Exécution sûre
- `npm run api:catalog` : liste des fournisseurs envisagés et ceux déjà référencés dans le code.
- `npm run api:audit` : vérification hors ligne de l'inventaire et de la politique de sécurité.
- Tous les fournisseurs sont désactivés par défaut : **aucun appel réseau**, aucune installation de clé, aucun paiement.
- `existing_code` indique seulement une référence au fournisseur dans le projet, pas un service opérationnel vérifié.
- `candidate_unverified` exige une validation des conditions d'utilisation, des quotas, des prix, de la confidentialité et du cas d'usage avant activation.
- Ne jamais envoyer de données de clients, paiements, commandes, adresses, numéros ou clés à un fournisseur public sans autorisation et base légale appropriées.
- Toute intégration métier doit disposer de tests sur simulations, cache, limitation de débit et mécanisme de repli.

## Priorités
- supabase: Authentification, catalogue, commandes et gestion partenaires
- openstreetmap: Carte et positionnement des traiteurs et points relais
- open-meteo: Météo indicative pour planification de livraisons

Modifications documentaires et d'outillage uniquement : aucun parcours de vente n'a été modifié.
