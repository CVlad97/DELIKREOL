export type GeoPoint = { latitude: number; longitude: number };
export type ZoneVendor = {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_radius_km?: number | null;
  zone_label?: string | null;
};

const MARTINIQUE_ZONES = ['Fort-de-France', 'Le Lamentin', 'Schoelcher', 'Ducos', 'Riviere-Salee', 'Le Robert'];

export function getMartiniqueServiceZones(vendorZones: Array<string | null | undefined> = []) {
  const zones = new Set(MARTINIQUE_ZONES);
  vendorZones.filter(Boolean).forEach((zone) => zones.add(String(zone)));
  return Array.from(zones);
}

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function vendorServesPoint(vendor: ZoneVendor, customer: GeoPoint, fallbackZone?: string) {
  if (vendor.latitude != null && vendor.longitude != null && vendor.delivery_radius_km != null) {
    return distanceKm({ latitude: vendor.latitude, longitude: vendor.longitude }, customer) <= vendor.delivery_radius_km;
  }
  if (fallbackZone && vendor.zone_label) {
    return normalizeZone(vendor.zone_label).includes(normalizeZone(fallbackZone));
  }
  return false;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function normalizeZone(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
