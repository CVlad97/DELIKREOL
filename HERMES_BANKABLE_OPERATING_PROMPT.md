# Prompt Hermes — DeliKreol bankable et automatisable

Mission : améliorer DeliKreol.mq à partir du dépôt GitHub `CVlad97/DELIKREOL` pour en faire une plateforme réelle, crédible, exploitable commercialement et finançable.

Priorité : reprendre le site existant, son logo, son style, ses photos, ses traiteurs et ses menus réels. Supprimer ou masquer tout contenu fictif ou non vérifié.

## Sources à reprendre

- `src/assets/delikreolLogo.ts` pour le logo.
- `src/pages/PublicHomePage.tsx` pour la structure publique.
- `src/data/partnerProfiles.ts` pour les biographies et contacts traiteurs.
- `src/data/traiteurs.ts` pour les fiches traiteurs et menus.
- `src/data/mockCatalog.ts` pour le catalogue déjà importé.
- `src/data/partnerAssets.ts` pour les photos.
- `src/lib/publicSupabase.ts` pour Supabase Free.
- `supabase/migrations/20251113161745_create_delikreol_core_schema.sql` pour la base de données.

## Partenaires réels à conserver

- An Tjè Coco
- Coco’s Food
- Saveurs d’Afrique / Lodika Saveurs d’Afrique
- Les Délices de Ninice

Les points relais génériques doivent devenir : “Réseau points relais en constitution — candidatures ouvertes”, sauf lieu clairement rattaché à un partenaire réel.

## Améliorations produit

- Recherche commune tolérante : accents, tirets, espaces, FDF = Fort-de-France.
- Liste déroulante des communes de Martinique.
- Confirmation visible après chaque formulaire ou action.
- Panier mobile clair avec bouton “Voir le panier” qui ouvre ou centre le panier.
- Créneaux de livraison réalistes avec heure limite de commande.
- Bouton “Contacter le prestataire” si délai dépassé ou livraison incertaine.
- Livraison éloignée possible à partir d’un seuil, par défaut 100 €.
- Textes simples, humains et non techniques.
- Mention phase 2 pour titres-restaurant / chèques déjeuner, sans dire que c’est déjà actif.

## Automatisation marketing

Créer dans l’admin un espace marketing simple :

- générateur de posts pour menus, traiteurs, offres entreprises, livreurs et points relais ;
- générateur de messages WhatsApp simples ;
- calendrier éditorial hebdomadaire ;
- suivi des leads par source : WhatsApp, Instagram, Facebook, site, email, bouche-à-oreille ;
- statut des prospects : nouveau, à rappeler, devis envoyé, gagné, perdu.

## WhatsApp Business

Préparer une page de configuration WhatsApp Business avec :

- description du profil DeliKreol ;
- réponses rapides client, devis traiteur, partenaire, retard possible, livraison incertaine ;
- étiquettes recommandées : nouveau client, devis traiteur, commande en cours, à rappeler, partenaire traiteur, livreur candidat, point relais candidat, entreprise ;
- structure de catalogue : menus du jour, traiteur événementiel, commandes entreprises, desserts, boissons, devenir partenaire.

## Gestion opérationnelle

Créer un centre opérationnel :

- commandes : nouvelle, à confirmer, confirmée, préparation, prête, livraison, livrée, annulée ;
- traiteurs : statut, zone, horaires, délai de préparation, minimum de commande, photos, menu, conditions ;
- livreurs : commune, disponibilité, véhicule, rayon, statut ;
- points relais : commerce, commune, horaires, capacité, statut ;
- alertes : commande non confirmée, livraison proche, paiement à confirmer, photo manquante.

## Gestion financière

Créer un tableau simple :

- chiffre d’affaires brut ;
- commission DeliKreol ;
- montant prestataire ;
- frais livraison ;
- marge estimée ;
- nombre de commandes ;
- panier moyen ;
- devis envoyés ;
- devis signés ;
- taux de conversion.

Les hypothèses doivent rester modifiables et clairement identifiées comme hypothèses.

## Business plan et plan financier

Créer ou préparer :

- `BUSINESS_PLAN_DELIKREOL.md`
- `PLAN_FINANCIER_DELIKREOL.md`
- `ROADMAP_30_60_90_DELIKREOL.md`
- `OPERATIONS_PLAYBOOK_DELIKREOL.md`

Le business plan doit expliquer le problème local, la solution, les clients, les partenaires, le modèle économique, la logistique, les outils, les hypothèses financières et les risques.

## Tous les dépôts GitHub

Préparer une méthode réutilisable pour auditer les autres dépôts du propriétaire :

- objectif du dépôt ;
- statut ;
- URL publique ;
- valeur business ;
- risques ;
- quick wins ;
- actions recommandées ;
- prochain livrable.

Ne modifier aucun autre dépôt sans validation explicite du propriétaire.

## Boucle d’amélioration continue

Chaque semaine : vérifier les formulaires, les leads, les blocages UX, les vrais partenaires, le catalogue, les textes, les commandes et les contenus marketing.

Chaque mois : mettre à jour le business plan, le plan financier, la roadmap, les indicateurs, les risques et les besoins de financement.

Résultat attendu : DeliKreol.mq doit être crédible, réel, humain, exploitable, finançable, durable et capable de s’adapter en continu.
