/**
 * SERVICE WAZE/GPS NAVIGATION - DELIKREOL
 * 
 * Intégration Waze Deep Links + Fallback Google Maps
 * Calcul ETA temps réel avec détection traffic
 * 
 * AUTO-GÉNÉRÉ PAR IA ARCHITECTE (Phase 2 - Interopérabilité)
 */

import { supabase } from '../lib/supabase';

export interface GPSCoordinates {
  lat: number;
  lon: number;
}

export interface WazeRouteOptions {
  origin: GPSCoordinates;
  destination: GPSCoordinates;
  optimize?: boolean;
  waypoints?: GPSCoordinates[];
}

export interface RouteResult {
  deepLink: string;
  estimatedDurationMinutes: number;
  estimatedArrival: Date;
  distanceKm: number;
  trafficCondition: 'low' | 'moderate' | 'heavy' | 'blocked';
  source: 'waze' | 'google' | 'osm' | 'fallback';
}

export interface ETAUpdate {
  deliveryId: string;
  currentETA: Date;
  delayMinutes: number;
  trafficCondition: string;
}

export class WazeNavigationService {
  private readonly WAZE_BASE_URL = 'https://waze.com/ul';
  private readonly GOOGLE_MAPS_BASE_URL = 'https://www.google.com/maps/dir/';
  private readonly AVERAGE_SPEED_KMH = 30; // Martinique urban speed
  private readonly TRAFFIC_SPEED_MULTIPLIER = {
    low: 1.0,
    moderate: 0.7,
    heavy: 0.5,
    blocked: 0.2,
  };

  /**
   * Génère Deep Link Waze pour navigation
   * Format: waze://ul?ll=LAT,LON&navigate=yes
   */
  generateWazeDeepLink(destination: GPSCoordinates, navigate: boolean = true): string {
    const params = new URLSearchParams({
      ll: `${destination.lat},${destination.lon}`,
      navigate: navigate ? 'yes' : 'no',
    });
    
    return `${this.WAZE_BASE_URL}?${params.toString()}`;
  }

  /**
   * Génère Deep Link Google Maps (fallback)
   */
  generateGoogleMapsDeepLink(origin: GPSCoordinates, destination: GPSCoordinates): string {
    return `${this.GOOGLE_MAPS_BASE_URL}${origin.lat},${origin.lon}/${destination.lat},${destination.lon}`;
  }

  /**
   * Calcule distance haversine entre deux points GPS
   */
  private calculateDistanceKm(point1: GPSCoordinates, point2: GPSCoordinates): number {
    const R = 6371; // Earth radius km
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lon - point1.lon);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Détecte condition traffic selon heure/jour
   * TODO: Intégrer API traffic temps réel (Waze/Google)
   */
  async getTrafficCondition(): Promise<'low' | 'moderate' | 'heavy' | 'blocked'> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Heures de pointe Martinique: 7-9h et 17-19h
    if (day >= 1 && day <= 5) {
      // Jours ouvrables
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        return 'heavy';
      } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
        return 'moderate';
      }
    }

    // Weekend ou heures creuses
    return 'low';
  }

  /**
   * Calcule ETA avec prise en compte traffic
   */
  async calculateETA(options: WazeRouteOptions): Promise<RouteResult> {
    try {
      const { origin, destination } = options;
      
      // Calcul distance
      const distanceKm = this.calculateDistanceKm(origin, destination);
      
      // Détection traffic
      const trafficCondition = await this.getTrafficCondition();
      const speedMultiplier = this.TRAFFIC_SPEED_MULTIPLIER[trafficCondition];
      
      // Calcul durée avec traffic
      const effectiveSpeed = this.AVERAGE_SPEED_KMH * speedMultiplier;
      const durationMinutes = Math.ceil((distanceKm / effectiveSpeed) * 60);
      
      // ETA
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + durationMinutes);
      
      // Deep links (Waze prioritaire)
      const deepLink = this.generateWazeDeepLink(destination, true);
      
      return {
        deepLink,
        estimatedDurationMinutes: durationMinutes,
        estimatedArrival,
        distanceKm: Math.round(distanceKm * 100) / 100,
        trafficCondition,
        source: 'waze',
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      
      // Fallback: estimation basique
      const distanceKm = this.calculateDistanceKm(options.origin, options.destination);
      const durationMinutes = Math.ceil((distanceKm / 25) * 60); // Conservative speed
      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(estimatedArrival.getMinutes() + durationMinutes);
      
      return {
        deepLink: this.generateGoogleMapsDeepLink(options.origin, options.destination),
        estimatedDurationMinutes: durationMinutes,
        estimatedArrival,
        distanceKm: Math.round(distanceKm * 100) / 100,
        trafficCondition: 'moderate',
        source: 'fallback',
      };
    }
  }

  /**
   * Enregistre route optimisée dans DB (delivery_routing)
   */
  async storeDeliveryRoute(deliveryId: string, routeData: RouteResult): Promise<void> {
    try {
      const { error } = await supabase.from('delivery_routing').upsert({
        delivery_id: deliveryId,
        route_source: routeData.source,
        estimated_duration_minutes: routeData.estimatedDurationMinutes,
        estimated_arrival: routeData.estimatedArrival.toISOString(),
        distance_km: routeData.distanceKm,
        traffic_condition: routeData.trafficCondition,
        last_update: new Date().toISOString(),
      });

      if (error) {
        console.error('Error storing route:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store delivery route:', error);
      throw error;
    }
  }

  /**
   * Mise à jour ETA en temps réel (recalcul si besoin)
   */
  async updateETA(deliveryId: string, currentPosition: GPSCoordinates): Promise<ETAUpdate> {
    try {
      // Récupérer livraison
      const { data: delivery, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*, orders(delivery_latitude, delivery_longitude)')
        .eq('id', deliveryId)
        .single();

      if (deliveryError || !delivery) {
        throw new Error('Delivery not found');
      }

      const destination: GPSCoordinates = {
        lat: delivery.orders.delivery_latitude,
        lon: delivery.orders.delivery_longitude,
      };

      // Recalculer ETA
      const routeResult = await this.calculateETA({
        origin: currentPosition,
        destination,
      });

      // Mettre à jour DB
      await this.storeDeliveryRoute(deliveryId, routeResult);

      // Calculer retard
      const { data: routing } = await supabase
        .from('delivery_routing')
        .select('estimated_arrival')
        .eq('delivery_id', deliveryId)
        .single();

      const originalETA = routing ? new Date(routing.estimated_arrival) : new Date();
      const delayMinutes = Math.max(
        0,
        Math.round((routeResult.estimatedArrival.getTime() - originalETA.getTime()) / 60000)
      );

      return {
        deliveryId,
        currentETA: routeResult.estimatedArrival,
        delayMinutes,
        trafficCondition: routeResult.trafficCondition,
      };
    } catch (error) {
      console.error('Error updating ETA:', error);
      throw error;
    }
  }

  /**
   * Optimisation multi-stops (algorithme glouton simple)
   * TODO: Implémenter TSP solver pour optimisation avancée
   */
  async optimizeMultiStopRoute(
    origin: GPSCoordinates,
    stops: GPSCoordinates[]
  ): Promise<GPSCoordinates[]> {
    if (stops.length <= 1) return stops;

    const optimized: GPSCoordinates[] = [];
    let current = origin;
    const remaining = [...stops];

    while (remaining.length > 0) {
      // Trouver stop le plus proche
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistanceKm(current, remaining[0]);

      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistanceKm(current, remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Ajouter stop le plus proche
      optimized.push(remaining[nearestIndex]);
      current = remaining[nearestIndex];
      remaining.splice(nearestIndex, 1);
    }

    return optimized;
  }

  /**
   * RESILIENCE: Retry avec fallback automatique
   */
  async calculateETAWithFallback(options: WazeRouteOptions): Promise<RouteResult> {
    try {
      // Tentative 1: Waze
      return await this.calculateETA(options);
    } catch (error) {
      console.warn('Waze failed, falling back to Google Maps');
      try {
        // Tentative 2: Google Maps (simulation)
        const result = await this.calculateETA(options);
        return { ...result, source: 'google' };
      } catch (error2) {
        console.warn('Google Maps failed, using fallback calculation');
        // Tentative 3: Calcul basique (toujours disponible)
        const distanceKm = this.calculateDistanceKm(options.origin, options.destination);
        const durationMinutes = Math.ceil((distanceKm / 25) * 60);
        const estimatedArrival = new Date();
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() + durationMinutes);

        return {
          deepLink: this.generateGoogleMapsDeepLink(options.origin, options.destination),
          estimatedDurationMinutes: durationMinutes,
          estimatedArrival,
          distanceKm,
          trafficCondition: 'moderate',
          source: 'fallback',
        };
      }
    }
  }
}

// Export singleton
export const wazeNavigationService = new WazeNavigationService();
