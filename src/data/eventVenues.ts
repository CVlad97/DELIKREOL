/**
 * Données des lieux événementiels (salles de réception, salles des fêtes, etc.)
 *
 * ⚠️ AVERTISSEMENT : Ces données sont des FICHES DE DÉMONSTRATION.
 * Elles ne représentent pas de lieux réels. Les coordonnées GPS sont
 * approximatives (centre de commune) et doivent être remplacées par
 * des données vérifiées avant publication.
 *
 * Règles de publication :
 * - published = false par défaut pour toute donnée incomplète
 * - Aucune salle ne doit être affichée publiquement sans coordonnées valides
 * - Les données doivent être validées par Vladimir avant publication
 */

import type { EventVenue } from '../types/eventVenue';

export const eventVenues: EventVenue[] = [
  {
    id: 'demo-venue-001',
    slug: 'salle-demo-fort-de-france',
    name: 'Lieu de démonstration — Fort-de-France',
    venueType: 'reception_hall',
    description: 'Fiche de démonstration. À remplacer par une salle réelle vérifiée.',
    commune: 'Fort-de-France',
    address: 'Centre-ville, Fort-de-France (à confirmer)',
    latitude: 14.6036,
    longitude: -61.0710,
    capacitySeated: 120,
    capacityStanding: 180,
    parkingSpaces: 30,
    kitchenAvailable: true,
    coldStorageAvailable: false,
    loadingAreaAvailable: true,
    deliveryAccess: 'easy',
    pmrAccessible: true,
    noiseRestriction: 'Musique amplifiée jusqu\'à 23h',
    openingNotes: 'Disponible sur réservation — horaires à confirmer avec le gestionnaire',
    phone: undefined, // À collecter
    whatsapp: undefined, // À collecter
    website: undefined, // À collecter
    images: [],
    verificationStatus: 'unverified',
    published: false, // DÉMONSTRATION — ne pas publier sans validation
    isDemo: true,
  },
  {
    id: 'demo-venue-002',
    slug: 'salle-demo-le-lamentin',
    name: 'Lieu de démonstration — Le Lamentin',
    venueType: 'community_hall',
    description: 'Fiche de démonstration. À remplacer par une salle réelle vérifiée.',
    commune: 'Le Lamentin',
    address: 'Zone urbaine, Le Lamentin (à confirmer)',
    latitude: 14.6092,
    longitude: -60.9947,
    capacitySeated: 80,
    capacityStanding: 120,
    parkingSpaces: 15,
    kitchenAvailable: false,
    coldStorageAvailable: false,
    loadingAreaAvailable: true,
    deliveryAccess: 'restricted',
    pmrAccessible: false,
    noiseRestriction: undefined, // À collecter
    openingNotes: 'Accès camionnette possible, pas de semi-remorque',
    phone: undefined,
    whatsapp: undefined,
    website: undefined,
    images: [],
    verificationStatus: 'unverified',
    published: false,
    isDemo: true,
  },
  {
    id: 'demo-venue-003',
    slug: 'espace-demo-schoelcher',
    name: 'Lieu de démonstration — Schœlcher',
    venueType: 'wedding_venue',
    description: 'Fiche de démonstration. À remplacer par un lieu réel vérifié.',
    commune: 'Schœlcher',
    address: 'Front de mer, Schœlcher (à confirmer)',
    latitude: 14.6136,
    longitude: -61.0967,
    capacitySeated: 200,
    capacityStanding: 300,
    parkingSpaces: 50,
    kitchenAvailable: true,
    coldStorageAvailable: true,
    loadingAreaAvailable: true,
    deliveryAccess: 'easy',
    pmrAccessible: true,
    noiseRestriction: 'Pas de restriction signalée',
    openingNotes: 'Espace modulable — réservation 3 mois à l\'avance recommandée',
    phone: undefined,
    whatsapp: undefined,
    website: undefined,
    images: [],
    verificationStatus: 'unverified',
    published: false,
    isDemo: true,
  },
];

/**
 * Retourne uniquement les lieux publiés avec coordonnées valides.
 * Les lieux de démonstration ne sont JAMAIS inclus.
 */
export function getPublishedEventVenues(): EventVenue[] {
  return eventVenues.filter((v) => {
    if (!v.published) return false;
    if (v.isDemo) return false;
    if (!v.name || v.name.trim() === '') return false;
    if (!isValidLatitude(v.latitude) || !isValidLongitude(v.longitude)) return false;
    return true;
  });
}

/**
 * Retourne les lieux de démonstration (pour tests et aperçu admin uniquement).
 */
export function getDemoEventVenues(): EventVenue[] {
  return eventVenues.filter((v) => v.isDemo);
}

function isValidLatitude(lat?: number): boolean {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng?: number): boolean {
  return typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}
