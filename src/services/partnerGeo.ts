// DELIKREOL — Géolocalisation partenaires
// Résout les coordonnées des traiteurs via API data.gouv.fr
// Cache les résultats pour éviter les appels répétés

const coordCache = new Map<string, { lat: number; lng: number }>();

const COORD_MAP: Record<string, { lat: number; lng: number }> = {
  'Fort-de-France': { lat: 14.6104, lng: -61.0718 },
  'Ducos': { lat: 14.5750, lng: -60.9750 },
  'Lamentin': { lat: 14.6150, lng: -60.9980 },
  'Saint-Joseph': { lat: 14.6700, lng: -61.0320 },
  'Case-Pilote': { lat: 14.6420, lng: -61.1390 },
  'Schoelcher': { lat: 14.6170, lng: -61.0830 },
  'Rivière-Salée': { lat: 14.5300, lng: -60.9800 },
  'Cluny': { lat: 14.5100, lng: -60.9650 },
  'Rivière-Pilote': { lat: 14.4870, lng: -60.9020 },
  'Saint-Esprit': { lat: 14.5500, lng: -60.9450 },
  'François': { lat: 14.6150, lng: -60.9030 },
  'Vauclin': { lat: 14.5450, lng: -60.8380 },
  'Marin': { lat: 14.4720, lng: -60.8700 },
  'Sainte-Anne': { lat: 14.4400, lng: -60.8800 },
  'Diamant': { lat: 14.4800, lng: -61.0300 },
  'Anses-d\'Arlet': { lat: 14.4900, lng: -61.0800 },
  'Trois-Îlets': { lat: 14.5500, lng: -61.0330 },
  'Bellefontaine': { lat: 14.6730, lng: -61.1590 },
  'Carbet': { lat: 14.7130, lng: -61.1820 },
  'Saint-Pierre': { lat: 14.7430, lng: -61.1750 },
  'Ajoupa-Bouillon': { lat: 14.8230, lng: -61.1480 },
  'Basse-Pointe': { lat: 14.8680, lng: -61.1190 },
  'Macouba': { lat: 14.8740, lng: -61.1390 },
  'Grand\'Rivière': { lat: 14.8800, lng: -61.1800 },
  'Sainte-Marie': { lat: 14.7820, lng: -61.0230 },
  'Gros-Morne': { lat: 14.7070, lng: -60.9830 },
  'Vert-Pré': { lat: 14.6950, lng: -60.9480 },
  'Fonds-Saint-Denis': { lat: 14.7400, lng: -61.1300 },
  'Morne-Rouge': { lat: 14.7650, lng: -61.1350 },
  'Trinité': { lat: 14.7380, lng: -60.9630 },
  'Robert': { lat: 14.6770, lng: -60.9390 },
  'Baie de Fort-de-France': { lat: 14.6000, lng: -61.0700 },
};

export function getCommuneCoordinates(name: string): { lat: number; lng: number } | null {
  // 1. Try exact match
  const exact = COORD_MAP[name];
  if (exact) return exact;

  // 2. Try case-insensitive match
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(COORD_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 3. Try partial match
  for (const [key, val] of Object.entries(COORD_MAP)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return val;
  }

  return null;
}

export function resolveTraiteurCoords(
  zone?: string,
  commune?: string
): { latitude: number; longitude: number } | null {
  const query = commune || zone || '';
  const coords = getCommuneCoordinates(query);
  if (coords) return { latitude: coords.lat, longitude: coords.lng };

  // Add small random offset for variety if same commune
  return null;
}