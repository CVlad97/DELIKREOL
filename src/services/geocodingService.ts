export interface GeocodeResult {
  address: string;
  displayName: string;
  latitude: number;
  longitude: number;
  confidence: 'high' | 'medium' | 'low';
  commune?: string;
  postalCode?: string;
}

const MARTINIQUE_COMMUNES = [
  { name: 'Fort-de-France', lat: 14.6037, lon: -61.0730, postal: '97200' },
  { name: 'Le Lamentin', lat: 14.6097, lon: -60.9917, postal: '97232' },
  { name: 'Schoelcher', lat: 14.6137, lon: -61.1033, postal: '97233' },
  { name: 'Saint-Joseph', lat: 14.6667, lon: -61.0333, postal: '97212' },
  { name: 'Ducos', lat: 14.5833, lon: -60.9667, postal: '97224' },
  { name: 'Le Robert', lat: 14.6833, lon: -60.9333, postal: '97231' },
  { name: 'Le François', lat: 14.6167, lon: -60.9000, postal: '97240' },
  { name: 'Sainte-Marie', lat: 14.7833, lon: -61.0167, postal: '97230' },
  { name: 'La Trinité', lat: 14.7333, lon: -60.9667, postal: '97220' },
  { name: 'Rivière-Pilote', lat: 14.4833, lon: -60.9000, postal: '97211' },
  { name: 'Le Marin', lat: 14.4667, lon: -60.8667, postal: '97290' },
  { name: 'Sainte-Luce', lat: 14.4667, lon: -60.9500, postal: '97228' },
  { name: 'Rivière-Salée', lat: 14.5333, lon: -60.9667, postal: '97215' },
  { name: 'Les Trois-Îlets', lat: 14.5333, lon: -61.0333, postal: '97229' },
  { name: 'Le Diamant', lat: 14.4833, lon: -61.0167, postal: '97223' },
  { name: 'Saint-Pierre', lat: 14.7417, lon: -61.1783, postal: '97250' },
  { name: 'Le Carbet', lat: 14.7167, lon: -61.1667, postal: '97221' },
  { name: 'Bellefontaine', lat: 14.7000, lon: -61.1500, postal: '97222' },
  { name: 'Case-Pilote', lat: 14.6500, lon: -61.1333, postal: '97222' },
  { name: 'Le Prêcheur', lat: 14.8000, lon: -61.2167, postal: '97250' },
  { name: 'Fonds-Saint-Denis', lat: 14.6833, lon: -61.1167, postal: '97250' },
  { name: 'Le Morne-Rouge', lat: 14.7500, lon: -61.1167, postal: '97260' },
  { name: 'Le Lorrain', lat: 14.8333, lon: -61.0500, postal: '97214' },
  { name: 'Basse-Pointe', lat: 14.8667, lon: -61.1167, postal: '97218' },
  { name: 'Macouba', lat: 14.8667, lon: -61.0833, postal: '97218' },
  { name: 'Grand-Rivière', lat: 14.8667, lon: -61.1667, postal: '97218' },
  { name: 'Ajoupa-Bouillon', lat: 14.8167, lon: -61.1167, postal: '97216' },
  { name: 'Le Gros-Morne', lat: 14.6667, lon: -61.0500, postal: '97213' },
  { name: 'Saint-Esprit', lat: 14.5500, lon: -60.9333, postal: '97270' },
  { name: 'Vauclin', lat: 14.5500, lon: -60.8333, postal: '97280' },
  { name: 'Les Anses-d\'Arlet', lat: 14.5000, lon: -61.0667, postal: '97217' },
  { name: 'Sainte-Anne', lat: 14.4333, lon: -60.8833, postal: '97227' },
  { name: 'Morne-Vert', lat: 14.7000, lon: -61.1000, postal: '97226' },
];

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 3) {
    return [];
  }

  const results: GeocodeResult[] = [];

  for (const commune of MARTINIQUE_COMMUNES) {
    const communeName = commune.name.toLowerCase();
    
    if (communeName.includes(normalizedQuery) || normalizedQuery.includes(communeName)) {
      const confidence: 'high' | 'medium' | 'low' = 
        communeName === normalizedQuery ? 'high' :
        communeName.startsWith(normalizedQuery) ? 'high' :
        'medium';

      results.push({
        address: commune.name,
        displayName: `${commune.name}, Martinique ${commune.postal}`,
        latitude: commune.lat,
        longitude: commune.lon,
        confidence,
        commune: commune.name,
        postalCode: commune.postal,
      });
    }
  }

  const exactMatch = results.find(r => r.address.toLowerCase() === normalizedQuery);
  if (exactMatch) {
    return [exactMatch, ...results.filter(r => r !== exactMatch)];
  }

  return results.slice(0, 5);
}

export function isInDeliveryZone(latitude: number, longitude: number): boolean {
  const MARTINIQUE_BOUNDS = {
    minLat: 14.3,
    maxLat: 14.9,
    minLon: -61.3,
    maxLon: -60.8,
  };

  return (
    latitude >= MARTINIQUE_BOUNDS.minLat &&
    latitude <= MARTINIQUE_BOUNDS.maxLat &&
    longitude >= MARTINIQUE_BOUNDS.minLon &&
    longitude <= MARTINIQUE_BOUNDS.maxLon
  );
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
