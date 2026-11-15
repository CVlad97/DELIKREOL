# Langouste House — état de la fiche et conditions de mise en ligne

Relevé du 15/11/2026 sur la base de production (`boihlgodmclljtckhmgz`).
Fiche : `001854c7-6b0a-4eb7-8739-e68fe8a620dd`.

## Ce qui est déjà bon

| Élément | Valeur |
|---|---|
| Raison sociale | VIVIER CARAIBE SARL |
| SIRET | 39888283700014 |
| Téléphone / WhatsApp | `+596 696 17 80 00` |
| E-mail | viviercaraibesarl@gmail.com |
| Adresse | 14 rue Chéry Rosette, bd des Pêcheurs, Fond-Lahaye, 97233 Schœlcher |
| Commune / rayon | Schœlcher — 3 km |
| Photos | 16 images (galerie) + 1 hero, chemins stables sous `/vendors/langouste-house/` |
| Description | prudente et conforme (« soumis à confirmation ») |

## Ce qui bloque la mise en ligne

Aucun de ces points ne peut être rempli sans le partenaire : ce sont des
données commerciales et réglementaires, pas des champs techniques.

| # | Blocage | Valeur actuelle | Impact |
|---|---|---|---|
| 1 | `is_active` | `false` | aucune commande possible, aucune notification |
| 2 | `status` / `onboarding_status` | `draft` / `draft` | invisible côté client |
| 3 | `user_id` | `null` | aucun accès à l'espace traiteur, aucune alerte Web Push possible |
| 4 | Les 7 produits | `status = draft`, `price = 0.00`, `is_public = false`, `is_available = false` | rien de commandable, même si la fiche passait active |
| 5 | `allergens` (7 produits) | `null` | obligation d'information (INCO) — bloquant légal |
| 6 | `haccp_certificate_number` / `haccp_expiry_date` | `null` | conformité hygiène non justifiée |
| 7 | `contact_confirmed` | `false` | le partenaire n'a pas confirmé ses coordonnées |
| 8 | `photo_status` | `à confirmer` | droits d'usage des 16 photos non établis |
| 9 | `partner_status` | `à valider` | validation commerciale non faite |
| 10 | `latitude` / `longitude` | `null` | pas de calcul de distance ni d'affichage carte |
| 11 | `opening_hours` | `null` | créneaux et planification impossibles |

## Séquence de mise en ligne (après réponse du partenaire)

1. Renseigner les 11 points ci-dessus avec les valeurs fournies par écrit.
2. Vérifier chaque prix et chaque allergène **produit par produit** — pas de
   valeur par défaut, pas d'extrapolation depuis une photo.
3. Passer les produits en `is_public = true`, `is_available = true`,
   `status = 'verified'` seulement après vérification des deux points précédents.
4. Créer le compte auth du partenaire puis renseigner `vendors.user_id` —
   sans cela il ne peut ni voir ses commandes ni activer ses alertes.
5. Passer `is_active = true`, `status = 'active'`, puis vérifier qu'une
   commande de test produit bien une ligne dans `partner_notifications`.

## Message type à envoyer au partenaire

Le texte prêt à envoyer est dans la conversation du 15/11. Il demande, dans
cet ordre : confirmation des coordonnées et du contact, prix des 7 produits,
allergènes, numéro de certificat HACCP et date d'expiration, horaires,
autorisation d'utiliser les photos, et création de son accès.
