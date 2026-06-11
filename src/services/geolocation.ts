// DELIKREOL — Géolocalisation
// RGPD : position uniquement avec consentement, pas de tracking permanent

export interface Coords {
  latitude: number;
  longitude: number;
}

export type LocationSource = 'gps' | 'commune' | 'address' | 'relay' | 'pickup';

export interface ClientLocation {
  coords: Coords | null;
  commune: string;
  address: string;
  source: LocationSource;
  consentGiven: boolean;
}

const DEFAULT_COMMUNE = 'Fort-de-France';

// Demander position GPS avec consentement
export function requestClientLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

export function getPermissionStatus(): Promise<PermissionState> {
  if (!navigator.permissions?.query) return Promise.resolve('prompt');
  return navigator.permissions.query({ name: 'geolocation' }).then(p => p.state);
}

// Distance Haversine (km)
export function calculateDistanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLng = (b.longitude - a.longitude) * Math.PI / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Trier par distance
export function sortByDistance<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  origin: Coords
): T[] {
  return [...items].sort((a, b) => {
    const dA = a.latitude && a.longitude ? calculateDistanceKm(origin, { latitude: a.latitude, longitude: a.longitude }) : Infinity;
    const dB = b.latitude && b.longitude ? calculateDistanceKm(origin, { latitude: b.latitude, longitude: b.longitude }) : Infinity;
    return dA - dB;
  });
}

// Waze / Google Maps links
export function getWazeLink(coord: Coords): string {
  return `https://waze.com/ul?ll=${coord.latitude},${coord.longitude}&navigate=yes`;
}

export function getGoogleMapsLink(coord: Coords): string {
  return `https://maps.google.com/maps?q=${coord.latitude},${coord.longitude}`;
}

// Vérification basique qualité
export function qualityCheckLocation(coord: Coords): boolean {
  // Martinique approx: lat 14.3-14.9, lng -61.2--60.8
  return (
    coord.latitude >= 14.3 && coord.latitude <= 14.9 &&
    coord.longitude >= -61.25 && coord.longitude <= -60.8
  );
}

// Stockage localStorage (pas de cookie)
const LOCATION_STORAGE_KEY = 'delikreol_client_location';

export function saveClientLocation(loc: ClientLocation): void {
  try { localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc)); } catch {}
}

export function loadClientLocation(): ClientLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearClientLocation(): void {
  try { localStorage.removeItem(LOCATION_STORAGE_KEY); } catch {}
}