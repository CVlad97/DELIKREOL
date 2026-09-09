# MODELE LISTE DE PROSPECTION — POINTS RELAIS MARTINIQUE
# 2026-09-08 — Aucun commerce inventé — Aucune donnée réelle — Template uniquement

## CONTEXTE
- Projet : DELIKREOL
- Zone : Martinique (34 communes)
- Objectif : Recruter des points relais (commerces/associations) pour la récupération/livraison
- Règle stricte : Aucun commerce inventé — aucune donnée inventée — aucune adresse inventée
- Utilisation : Template de collecte des données de prospection uniquement

## FORMAT PROPOSÉ (CSV / JSON / Google Sheets)

Colonne | Description | Exemple (fictif — template uniquement) | Source attendue
--- | --- | --- | ---
nom_lieu | Nom du commerce/association | "Épicerie du Centre" | Candidat / Recherche terrain
responsable | Nom du contact | "Marie L." | Candidat / Téléphone
commune | Commune (34 listées ci-dessous) | "Fort-de-France" | Sélection parmi la liste
adresse | Adresse complète | "12 rue du Commerce" | Candidat / Visite
telephone | Téléphone Martinique | "0696 12 34 56" | Candidat
whatsapp | Numéro WhatsApp | "596696653589" | Candidat
email | Email | "contact@epicerie.fr" | Candidat
horaires | Horaires d'ouverture | "Lun-Sam 7h-19h" | Candidat
capacite | Capacité approximative | "~20 colis / jour" | Candidat
conditions | Conditions particulières | "Réfrigérateur disponible" | Candidat
zone_desserte | Communautaire (communes proches) | "Fort-de-France, Ducos, Lamentin" | Candidat / Admin
statut | Candidat / À vérifier / Validé / Actif | "candidat" | Admin (défaut : candidat)
mode_contact | WhatsApp / Téléphone / Email / Visite | "WhatsApp" | Admin
commentaire | Note prospection | "Premier contact — réponse attendue" | Admin
photo_confirmée | Oui / Non / À confirmer | "non" | Admin
\n## COMMUNES DE PROSPECTION (34 — liste du fichier officiel)

1. Ajoupa-Bouillon
2. Anses-d'Arlet
3. Basse-Pointe
4. Bellefontaine
5. Carbet
6. Case-Pilote
7. Diamant
8. Ducos
9. Fonds-Saint-Denis
10. Fort-de-France
11. François
12. Grand'Rivière
13. Gros-Morne
14. Lamentin
15. Lorrain
16. Macouba
17. Marigot
18. Marin
19. Morne-Rouge
20. Morne-Vert
21. Prêcheur
22. Rivière-Pilote
23. Rivière-Salée
24. Robert
25. Sainte-Anne
26. Sainte-Luce
27. Sainte-Marie
28. Saint-Esprit
29. Saint-Joseph
30. Saint-Pierre
31. Schœlcher
32. Trinité
33. Trois-Îlets
34. Vauclin

## RÈGLES D'AUTORISATION (règles de l'utilisateur — strictes)

- NE PAS envoyer de WhatsApp sans autorisation explicite du responsable
- NE PAS inventer d'adresses réelles
- NE PAS inventer de numéros de téléphone réels
- NE PAS exposer des données personnelles sans consentement
- NE PAS créer d'entrée dans localStorage sans soumission réelle du formulaire
- TOUJOURS vérifier `connection='open'` + `creds.registered=true` du bridge WhatsApp avant tout envoi
- TOUJOURS conserver le modèle de prospection dans `_docs/` comme document de référence

## MÉTHODE DE COLLECTE PROPOSÉE (sans inventer)

1. **Phase 1 — Rechercher** : Consulter des annuaires officiels, sites des mairies de Martinique, et listes de commerces
2. **Phase 2 — Contacter** : Utiliser le formulaire `DevenirPointRelaisPage` ou `PointsRelaisPage` — le commerce remplit lui-même
3. **Phase 3 — Valider** : Admin vérifie via `AdminPointsRelais` (statut : candidat → vérifier → valide → actif)
4. **Phase 4 — Active** : Point relais identifié comme actif dans la base

## PRÉPARATION ADMIN

Le tableau `AdminPointsRelais` permet :
- Filtrer par statut (candidat, à_appeler, valide, actif, suspendu, inactif) — confirmé
- Filtrer par commune (34 options) — confirmé
- Mettre à jour le statut — confirmé
- Voir le source (supabase / localStorage) — confirmé
- Envoyer WhatsApp via `openWhatsApp()` — confirmé (nécessite autorisation)

Aucun commerce inventé dans ce document. Aucun message envoyé sans validation humaine.
