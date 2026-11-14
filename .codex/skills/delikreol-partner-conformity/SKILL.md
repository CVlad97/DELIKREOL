---
name: delikreol-partner-conformity
description: Vérifie la conformité des partenaires DeliKreol avant publication commerciale (allergènes, photos autorisées, disponibilités, cadre légal livreurs et points relais, RLS et séparation des droits). Utiliser avant d'ouvrir une vitrine, de publier un plat ou d'annoncer un partenaire.
---

# DeliKreol — conformité partenaires

## Règle absolue

Une donnée commerciale ne s'invente jamais : prix, disponibilité, fournisseur, allergène, délai. Si l'information manque, l'état est BLOCKED_HUMAN avec le nom du partenaire concerné — pas une valeur par défaut.

## Contrôles par partenaire

| Contrôle | Preuve attendue |
|---|---|
| Photos publiées | accord du partenaire, ou photo `_fallback` explicitement à confirmer |
| Allergènes | déclaration du partenaire conservée, ou mention « à confirmer » affichée |
| Prix et disponibilité | source datée, pas une valeur de démonstration |
| Rattachement compte | `user_id` et email confirmé sur le bon enregistrement |
| Séparation des droits | un partenaire ne voit que ses données ; RLS active ; aucun rôle `admin` accordé |
| Visibilité | un partenaire masqué (`PUBLIC_HIDDEN_TRAITEURS`) ne réapparaît pas par effet de bord |

Les déclarations d'allergènes à confirmer et les photos « à confirmer » sont documentées dans `AUDIT_PHOTOS_RAPPORT.md`, `TRAITEURS_MEDIA_AUDIT.md` et `docs/audits/images/`. Ces fichiers sont des **preuves** : on les lit, on ne les réécrit pas.

## Cadre légal

Livreurs et points relais sont des **prestataires indépendants** : liberté d'accepter ou refuser une mission, pas d'horaires imposés, pas d'exclusivité, SIRET et assurance vérifiés avant activation. Voir `docs/LIVREURS_CADRE_LEGAL.md` et `docs/POINTS_RELAIS_CADRE_LEGAL.md`. Toute évolution vers un contrôle de type employeur déclenche BLOCKED_HUMAN et une revue juridique.

Les pages légales ne sont jamais présentées comme « certifiées conformes ». Un texte de médiation réel est requis avant annonce grand public.

## Sortie

`reports/launch/partner_conformity.json` : statut global + une ligne par partenaire (`partenaire | photos | allergènes | droits | statut`). Un seul partenaire non conforme sur un point P0 maintient le gate en FAIL, pas en PASS.
