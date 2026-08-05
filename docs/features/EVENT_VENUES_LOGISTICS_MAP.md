# Salles de réception et logistique événementielle — Carte DELIKREOL

## Objectif

Ajouter sur la carte interactive les salles de réception, salles des fêtes, lieux de mariage et espaces événementiels pour faciliter :
- le choix du lieu ;
- la sélection du traiteur proche ;
- l'affectation d'un livreur ;
- l'estimation des distances ;
- l'organisation du chargement ;
- la préparation d'une demande événementielle par WhatsApp.

## Architecture

### Fichiers créés

| Fichier | Rôle |
|---------|------|
| `src/types/eventVenue.ts` | Modèle de données (interface, types, labels) |
| `src/data/eventVenues.ts` | Données de démonstration + `getPublishedEventVenues()` |
| `src/services/venueLogistics.ts` | Fonctions pures : proximité, validation, résumé logistique |
| `src/services/eventVenueWhatsApp.ts` | Construction du message WhatsApp (sans envoi réel) |
| `supabase/migrations/20260731000002_create_event_venues.sql` | Migration réversible (NON EXÉCUTÉE) |
| `src/services/eventVenues.test.ts` | Tests unitaires (20 cas) |
| `tests/e2e/event-venues-map.spec.ts` | Tests Playwright |

### Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/pages/DiscoveryMapPage.tsx` | Suppression Math.random(), icônes L.divIcon locales, filtre salles, popup logistique, formulaire événement |

## Modèle de données

```typescript
interface EventVenue {
  id, slug, name, venueType, commune, address?
  latitude?, longitude?
  capacitySeated?, capacityStanding?, parkingSpaces?
  kitchenAvailable?, coldStorageAvailable?, loadingAreaAvailable?
  deliveryAccess, pmrAccessible?
  noiseRestriction?, openingNotes?
  phone?, whatsapp?, website?
  images?
  verificationStatus, published
  isDemo?
}
```

## Règles de publication

- `published = false` par défaut pour toute donnée incomplète
- `getPublishedEventVenues()` filtre : published=true, coordonnées valides, nom non vide, pas de démo
- Aucune salle non vérifiée présentée comme partenaire confirmé
- Les fiches de démonstration sont étiquetées "Lieu de démonstration"

## Confidentialité

- Géolocalisation : uniquement après action volontaire, pas de stockage durable
- Coordonnées des salles : publiques uniquement si published=true
- Coordonnées des livreurs : **jamais de position temps réel** — uniquement zone d'activité déclarée
- Numéros de téléphone : affichés uniquement si fournis et autorisés
- WhatsApp : message préparé, pas d'envoi automatique

## Fonctionnement WhatsApp

1. L'utilisateur clique sur "Préparer mon événement"
2. Une modale s'ouvre avec un formulaire (date, heure, invités, besoins)
3. Le bouton "Préparer le message" génère le texte structuré
4. L'utilisateur peut copier le message ou ouvrir WhatsApp
5. **Aucune commande n'est créée** — statut "demande à confirmer"

## Limites

- Les 3 fiches de démonstration ne sont pas publiées (published=false)
- Aucune salle réelle n'est ajoutée sans validation
- Les tests visuels Playwright nécessitent une UI Leaflet fonctionnelle en CI
- La migration SQL n'est pas exécutée

## Données restant à collecter

Pour chaque salle réelle :
- Nom commercial
- Nom du responsable
- Commune et adresse exacte
- Coordonnées GPS vérifiées
- Téléphone / WhatsApp
- Type de lieu, capacité, parking, cuisine, chambre froide
- Accès PMR, restrictions sonores
- Photos
- Autorisation de publication

→ Voir `docs/templates/EVENT_VENUE_DATA_COLLECTION.md`

## Procédure d'ajout d'une salle

1. Collecter les données via la fiche de collecte
2. Créer une entrée dans `src/data/eventVenues.ts` avec `published: false`
3. Valider les coordonnées GPS (GPS Check)
4. Vérifier les contacts (appel ou WhatsApp)
5. Après validation de Vladimir : passer `published: true`
6. Tester sur la carte interactive
7. Commit et push après validation

## Rollback

```bash
# Annuler les changements de code
git checkout main -- src/pages/DiscoveryMapPage.tsx
# Supprimer les fichiers créés
rm src/types/eventVenue.ts src/data/eventVenues.ts src/services/venueLogistics.ts src/services/eventVenueWhatsApp.ts
rm src/services/eventVenues.test.ts tests/e2e/event-venues-map.spec.ts
rm supabase/migrations/20260731000002_create_event_venues.sql
rm docs/features/EVENT_VENUES_LOGISTICS_MAP.md docs/templates/EVENT_VENUE_DATA_COLLECTION.md
```

SQL rollback (si migration appliquée) :
```sql
DROP TABLE IF EXISTS public.event_venues;
DROP FUNCTION IF EXISTS public.update_event_venues_updated_at();
```

## Tests exécutés

| Commande | Résultat |
|----------|----------|
| `npm run typecheck` | ✅ 0 erreur |
| `npm run lint` | ✅ 0 erreur |
| `npm test` | ✅ 63+ tests passent |
| `npm run build` | ✅ OK |
