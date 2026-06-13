// DELIKREOL — Liens Waze / Google Maps
// Utile pour le dashboard coordinateur : vérifier adresse, commune, distance

export interface Coords {
  latitude: number;
  longitude: number;
}

/** Lien Waze vers une adresse (ouvre l'app Waze) */
export function getWazeLink(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

/** Lien Google Maps vers une adresse */
export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Lien Google Maps recherche par nom/commune */
export function getMapsSearchLink(query: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}

/** Vérifie si des coordonnées sont dans un rayon acceptable pour la Martinique */
export function isInMartinique(lat: number, lng: number): boolean {
  return lat >= 14.3 && lat <= 14.9 && lng >= -61.3 && lng <= -60.8;
}

/** Vérifie la cohérence d'une adresse : commune + coordonnées approximatives */
export function validateLocationQuality(lat?: number, lng?: number, commune?: string): string[] {
  const issues: string[] = [];
  if (!lat || !lng) {
    issues.push('Coordonnées manquantes');
    return issues;
  }
  if (!isInMartinique(lat, lng)) {
    issues.push('Coordonnées hors Martinique');
  }
  return issues;
}

/** Format distance lisible */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}