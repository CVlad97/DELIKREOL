import { supabase } from '../lib/supabase';

interface Driver {
  id: string;
  user_id: string;
  vehicle_type: string;
  is_available: boolean;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  active_deliveries_count?: number;
}

interface RelayPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_load: number;
  is_active: boolean;
  hours: any;
}

interface Order {
  id: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_type: string;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function autoAssignDriver(orderId: string): Promise<{
  success: boolean;
  driverId?: string;
  error?: string;
}> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, delivery_latitude, delivery_longitude')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Commande introuvable' };
    }

    if (!order.delivery_latitude || !order.delivery_longitude) {
      return { success: false, error: 'Adresse de livraison invalide' };
    }

    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('is_available', true);

    if (driversError || !drivers || drivers.length === 0) {
      return { success: false, error: 'Aucun livreur disponible' };
    }

    const { data: activeDeliveries } = await supabase
      .from('deliveries')
      .select('driver_id')
      .in('status', ['pending', 'in_progress']);

    const deliveryCounts: Record<string, number> = {};
    activeDeliveries?.forEach((d) => {
      if (d.driver_id) {
        deliveryCounts[d.driver_id] = (deliveryCounts[d.driver_id] || 0) + 1;
      }
    });

    let bestDriver: Driver | null = null;
    let bestScore = Infinity;

    for (const driver of drivers) {
      const activeCount = deliveryCounts[driver.id] || 0;

      if (activeCount >= 3) continue;

      let distance = 10;
      if (driver.current_location?.latitude && driver.current_location?.longitude) {
        distance = calculateDistance(
          driver.current_location.latitude,
          driver.current_location.longitude,
          order.delivery_latitude,
          order.delivery_longitude
        );
      }

      const score = distance * 2 + activeCount * 5;

      if (score < bestScore) {
        bestScore = score;
        bestDriver = driver as Driver;
      }
    }

    if (!bestDriver) {
      return { success: false, error: 'Aucun livreur optimal trouvé' };
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .update({
        driver_id: bestDriver.id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (deliveryError) {
      return { success: false, error: 'Erreur lors de l\'assignation' };
    }

    await supabase
      .from('orders')
      .update({ status: 'assigned_driver' })
      .eq('id', orderId);

    return { success: true, driverId: bestDriver.id };
  } catch (error: any) {
    console.error('Error in autoAssignDriver:', error);
    return { success: false, error: error.message || 'Erreur système' };
  }
}

export async function suggestBestRelay(order: Order): Promise<{
  success: boolean;
  relayPoint?: RelayPoint;
  error?: string;
}> {
  try {
    if (!order.delivery_latitude || !order.delivery_longitude) {
      return { success: false, error: 'Position de livraison invalide' };
    }

    const { data: relayPoints, error: relayError } = await supabase
      .from('relay_points')
      .select('*')
      .eq('is_active', true);

    if (relayError || !relayPoints || relayPoints.length === 0) {
      return { success: false, error: 'Aucun point relais disponible' };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    let bestRelay: RelayPoint | null = null;
    let bestScore = Infinity;

    for (const relay of relayPoints) {
      const availableCapacity = relay.capacity - (relay.current_load || 0);

      if (availableCapacity <= 0) continue;

      const distance = calculateDistance(
        order.delivery_latitude!,
        order.delivery_longitude!,
        relay.latitude,
        relay.longitude
      );

      if (distance > 5) continue;

      let isOpen = true;
      if (relay.hours && typeof relay.hours === 'object') {
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentDay];
        const todayHours = relay.hours[dayName];
        if (todayHours && todayHours.open && todayHours.close) {
          const [openHour] = todayHours.open.split(':').map(Number);
          const [closeHour] = todayHours.close.split(':').map(Number);
          isOpen = currentHour >= openHour && currentHour < closeHour;
        }
      }

      if (!isOpen) continue;

      const capacityScore = (relay.capacity - availableCapacity) / relay.capacity * 100;
      const distanceScore = distance * 20;
      const score = distanceScore + capacityScore;

      if (score < bestScore) {
        bestScore = score;
        bestRelay = relay;
      }
    }

    if (!bestRelay) {
      return { success: false, error: 'Aucun point relais optimal trouvé' };
    }

    return { success: true, relayPoint: bestRelay };
  } catch (error: any) {
    console.error('Error in suggestBestRelay:', error);
    return { success: false, error: error.message || 'Erreur système' };
  }
}

export async function updateRelayLoad(relayPointId: string, increment: number): Promise<boolean> {
  try {
    const { data: relay } = await supabase
      .from('relay_points')
      .select('current_load')
      .eq('id', relayPointId)
      .single();

    if (!relay) return false;

    const newLoad = Math.max(0, (relay.current_load || 0) + increment);

    const { error } = await supabase
      .from('relay_points')
      .update({ current_load: newLoad, updated_at: new Date().toISOString() })
      .eq('id', relayPointId);

    return !error;
  } catch (error) {
    console.error('Error updating relay load:', error);
    return false;
  }
}

export async function getSaturatedRelays(): Promise<RelayPoint[]> {
  try {
    const { data: relays } = await supabase
      .from('relay_points')
      .select('*')
      .eq('is_active', true);

    if (!relays) return [];

    return relays.filter((relay) => {
      const loadPercentage = ((relay.current_load || 0) / relay.capacity) * 100;
      return loadPercentage >= 80;
    });
  } catch (error) {
    console.error('Error getting saturated relays:', error);
    return [];
  }
}
