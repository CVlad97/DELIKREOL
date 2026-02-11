/**
 * Route Optimization Service
 * Optimise les tournées de livraison pour les livreurs
 * Utilise l'algorithme du voyageur de commerce (TSP) simplifié
 */

interface Location {
  id: string;
  lat: number;
  lng: number;
  address: string;
  priority?: number; // 1=urgent, 2=normal, 3=flexible
  timeWindow?: {
    start: string; // Format HH:MM
    end: string;
  };
}

interface OptimizedRoute {
  locations: Location[];
  totalDistance: number; // en km
  estimatedDuration: number; // en minutes
  order: string[]; // IDs des locations dans l'ordre optimal
}

/**
 * Calcule la distance entre deux points (formule de Haversine)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Algorithme du plus proche voisin (Nearest Neighbor)
 * Complexité: O(n²)
 */
function nearestNeighborTSP(
  locations: Location[],
  startLocation: Location
): { order: string[]; totalDistance: number } {
  if (locations.length === 0) {
    return { order: [], totalDistance: 0 };
  }

  const unvisited = new Set(locations.map((loc) => loc.id));
  const order: string[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;

  while (unvisited.size > 0) {
    let nearestId: string | null = null;
    let minDistance = Infinity;

    // Trouver le point le plus proche non visité
    for (const id of unvisited) {
      const loc = locations.find((l) => l.id === id)!;
      const dist = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        loc.lat,
        loc.lng
      );

      // Appliquer un bonus pour les livraisons urgentes
      const priorityFactor = loc.priority === 1 ? 0.5 : 1.0;
      const adjustedDist = dist * priorityFactor;

      if (adjustedDist < minDistance) {
        minDistance = dist; // Distance réelle, pas ajustée
        nearestId = id;
      }
    }

    if (nearestId) {
      order.push(nearestId);
      unvisited.delete(nearestId);
      currentLocation = locations.find((l) => l.id === nearestId)!;
      totalDistance += minDistance;
    }
  }

  return { order, totalDistance };
}

/**
 * Optimisation 2-opt pour améliorer la route
 * Complexité: O(n²)
 */
function twoOptOptimization(
  locations: Location[],
  initialOrder: string[]
): { order: string[]; totalDistance: number } {
  let order = [...initialOrder];
  let improved = true;
  let totalDistance = calculateRouteDistance(locations, order);

  while (improved) {
    improved = false;

    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 2; j < order.length; j++) {
        // Tester l'inversion du segment [i+1, j]
        const newOrder = [
          ...order.slice(0, i + 1),
          ...order.slice(i + 1, j + 1).reverse(),
          ...order.slice(j + 1)
        ];

        const newDistance = calculateRouteDistance(locations, newOrder);

        if (newDistance < totalDistance) {
          order = newOrder;
          totalDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return { order, totalDistance };
}

/**
 * Calcule la distance totale d'une route
 */
function calculateRouteDistance(locations: Location[], order: string[]): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const loc1 = locations.find((l) => l.id === order[i])!;
    const loc2 = locations.find((l) => l.id === order[i + 1])!;
    total += calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
  }
  return total;
}

/**
 * Estime la durée de livraison
 * Prend en compte: distance, vitesse moyenne, temps d'arrêt
 */
function estimateDuration(
  totalDistance: number,
  numStops: number,
  avgSpeedKmH: number = 25 // Vitesse moyenne en ville (Martinique)
): number {
  const drivingTimeMinutes = (totalDistance / avgSpeedKmH) * 60;
  const stopTimeMinutes = numStops * 5; // 5 min par arrêt
  return Math.ceil(drivingTimeMinutes + stopTimeMinutes);
}

/**
 * Fonction principale: optimise une tournée de livraison
 */
export async function optimizeDeliveryRoute(
  deliveryLocations: Location[],
  driverStartLocation: Location,
  options?: {
    maxDistance?: number; // Distance max en km
    maxDuration?: number; // Durée max en minutes
    use2Opt?: boolean; // Appliquer l'optimisation 2-opt
  }
): Promise<OptimizedRoute> {
  const { maxDistance, maxDuration, use2Opt = true } = options || {};

  // Étape 1: Trier par priorité
  const sortedLocations = [...deliveryLocations].sort((a, b) => {
    const priorityA = a.priority || 2;
    const priorityB = b.priority || 2;
    return priorityA - priorityB;
  });

  // Étape 2: Algorithme du plus proche voisin
  let result = nearestNeighborTSP(sortedLocations, driverStartLocation);

  // Étape 3: Optimisation 2-opt (optionnelle)
  if (use2Opt && result.order.length > 3) {
    result = twoOptOptimization(sortedLocations, result.order);
  }

  // Étape 4: Vérifier les contraintes
  const estimatedDuration = estimateDuration(result.totalDistance, result.order.length);

  if (maxDistance && result.totalDistance > maxDistance) {
    console.warn(`Distance totale (${result.totalDistance.toFixed(1)}km) dépasse la limite (${maxDistance}km)`);
  }

  if (maxDuration && estimatedDuration > maxDuration) {
    console.warn(`Durée estimée (${estimatedDuration}min) dépasse la limite (${maxDuration}min)`);
  }

  // Étape 5: Construire la route optimisée
  const optimizedLocations = result.order.map(
    (id) => sortedLocations.find((loc) => loc.id === id)!
  );

  return {
    locations: optimizedLocations,
    totalDistance: parseFloat(result.totalDistance.toFixed(2)),
    estimatedDuration,
    order: result.order
  };
}

/**
 * Batch optimization: optimise plusieurs tournées en parallèle
 */
export async function optimizeMultipleRoutes(
  drivers: Array<{ id: string; startLocation: Location }>,
  allDeliveries: Location[]
): Promise<Map<string, OptimizedRoute>> {
  const routes = new Map<string, OptimizedRoute>();

  // Répartir les livraisons entre les livreurs (simple round-robin)
  const deliveriesPerDriver = Math.ceil(allDeliveries.length / drivers.length);

  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const driverDeliveries = allDeliveries.slice(
      i * deliveriesPerDriver,
      (i + 1) * deliveriesPerDriver
    );

    if (driverDeliveries.length > 0) {
      const optimizedRoute = await optimizeDeliveryRoute(
        driverDeliveries,
        driver.startLocation
      );
      routes.set(driver.id, optimizedRoute);
    }
  }

  return routes;
}

/**
 * Export pour tests unitaires
 */
export const __testing = {
  calculateDistance,
  nearestNeighborTSP,
  twoOptOptimization,
  estimateDuration
};
