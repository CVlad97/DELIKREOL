/**
 * Service de logistique événementielle — fonctions pures et testables.
 * @module venueLogistics
 */

import type { EventVenue } from '../types/eventVenue';
import type { TraiteurSpace } from '../data/traiteurs';
import type { DriverRef } from '../data/driverReferences';
import { calculateDistanceKm, type Coords } from './geolocation';

/**
 * Valide qu'une coordonnée est utilisable (latitude et longitude présentes et valides).
 */
export function isValidCoordinate(lat?: number, lng?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Retourne les coordonnées d'un lieu si valides, sinon null.
 */
export function getVenueCoords(venue: EventVenue): Coords | null {
  if (isValidCoordinate(venue.latitude, venue.longitude)) {
    return { latitude: venue.latitude!, longitude: venue.longitude! };
  }
  return null;
}

/**
 * Trouve les traiteurs les plus proches d'un lieu, triés par distance croissante.
 * Ignore les traiteurs sans coordonnées valides.
 */
export function findNearestTraiteursToVenue(
  venue: EventVenue,
  traiteurs: TraiteurSpace[],
  limit = 5,
): Array<{ traiteur: TraiteurSpace; distanceKm: number }> {
  const venueCoords = getVenueCoords(venue);
  if (!venueCoords) return [];

  const results = traiteurs
    .filter((t) => isValidCoordinate(t.latitude, t.longitude))
    .map((t) => ({
      traiteur: t,
      distanceKm: calculateDistanceKm(venueCoords, {
        latitude: t.latitude!,
        longitude: t.longitude!,
      }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return results;
}

/**
 * Retourne les livreurs par zone d'activité (pas de position temps réel).
 * N'expose jamais les coordonnées privées d'un livreur.
 */
export function findNearestDriversToVenue(
  venue: EventVenue,
  drivers: DriverRef[],
  limit = 5,
): Array<{ driver: DriverRef; zoneMatch: boolean }> {
  // Pas de position temps réel — on filtre par zone d'activité déclarée
  const venueCommune = venue.commune.toLowerCase();

  const matched = drivers
    .filter((d) => d.disponible)
    .map((d) => ({
      driver: d,
      zoneMatch: d.zone.toLowerCase().includes(venueCommune) || d.zone.toLowerCase().includes('toute la martinique'),
    }))
    .sort((a, b) => {
      // Zone match en premier, puis par nom
      if (a.zoneMatch && !b.zoneMatch) return -1;
      if (!a.zoneMatch && b.zoneMatch) return 1;
      return a.driver.name.localeCompare(b.driver.name);
    })
    .slice(0, limit);

  return matched;
}

/**
 * Construit un résumé logistique pour un lieu événementiel.
 */
export function buildVenueLogisticsSummary(
  venue: EventVenue,
  traiteurs: TraiteurSpace[],
  drivers: DriverRef[],
): {
  venueCoords: Coords | null;
  nearestTraiteurs: Array<{ traiteur: TraiteurSpace; distanceKm: number }>;
  availableDrivers: Array<{ driver: DriverRef; zoneMatch: boolean }>;
  hasKitchen: boolean;
  hasColdStorage: boolean;
  hasLoadingArea: boolean;
  deliveryAccessLabel: string;
} {
  return {
    venueCoords: getVenueCoords(venue),
    nearestTraiteurs: findNearestTraiteursToVenue(venue, traiteurs, 5),
    availableDrivers: findNearestDriversToVenue(venue, drivers, 5),
    hasKitchen: Boolean(venue.kitchenAvailable),
    hasColdStorage: Boolean(venue.coldStorageAvailable),
    hasLoadingArea: Boolean(venue.loadingAreaAvailable),
    deliveryAccessLabel: venue.deliveryAccess === 'easy' ? 'Accès facile' : venue.deliveryAccess === 'restricted' ? 'Accès restreint' : 'Accès à confirmer',
  };
}
