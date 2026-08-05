/**
 * Modèle de données pour les lieux événementiels (salles de réception, salles des fêtes, etc.)
 * @module eventVenue
 */

export type EventVenueType =
  | 'reception_hall'
  | 'wedding_venue'
  | 'restaurant'
  | 'hotel'
  | 'outdoor'
  | 'community_hall'
  | 'other';

export type VenueVerificationStatus =
  | 'verified'
  | 'pending'
  | 'unverified';

export type DeliveryAccessLevel =
  | 'easy'
  | 'restricted'
  | 'unknown';

export interface EventVenue {
  id: string;
  slug: string;
  name: string;
  venueType: EventVenueType;
  description?: string;
  commune: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacitySeated?: number;
  capacityStanding?: number;
  parkingSpaces?: number;
  kitchenAvailable?: boolean;
  coldStorageAvailable?: boolean;
  loadingAreaAvailable?: boolean;
  deliveryAccess: DeliveryAccessLevel;
  pmrAccessible?: boolean;
  noiseRestriction?: string;
  openingNotes?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  images?: string[];
  verificationStatus: VenueVerificationStatus;
  published: boolean;
  /** True si c'est une fiche de démonstration (ne pas afficher comme partenaire confirmé) */
  isDemo?: boolean;
}

export const VENUE_TYPE_LABELS: Record<EventVenueType, string> = {
  reception_hall: 'Salle de réception',
  wedding_venue: 'Lieu de mariage',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  outdoor: 'Espace extérieur',
  community_hall: 'Salle des fêtes',
  other: 'Autre lieu',
};

export const VERIFICATION_LABELS: Record<VenueVerificationStatus, string> = {
  verified: '✅ Lieu vérifié',
  pending: '⏳ Vérification en cours',
  unverified: '❓ Coordonnées à confirmer',
};

export const DELIVERY_ACCESS_LABELS: Record<DeliveryAccessLevel, string> = {
  easy: 'Accès facile',
  restricted: 'Accès restreint',
  unknown: 'Accès à confirmer',
};
