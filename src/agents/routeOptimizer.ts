import { supabase } from '../lib/supabase';
import { Order, Driver } from '../types';

interface OrderWithLocation extends Order {
  delivery_latitude: number;
  delivery_longitude: number;
}

interface DriverWithLocation extends Driver {
  current_latitude: number;
  current_longitude: number;
}

interface RouteAssignment {
  driverId: string;
  driverName: string;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    address: string;
    distance: number;
    estimatedTime: number;
  }>;
  totalDistance: number;
  estimatedTotalTime: number;
}

interface OptimizationResult {
  assignments: RouteAssignment[];
  unassignedOrders: string[];
  summary: {
    totalOrders: number;
    assignedOrders: number;
    driversUsed: number;
    averageOrdersPerDriver: number;
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function estimateDeliveryTime(distanceKm: number): number {
  const avgSpeedKmh = 25;
  const preparationTimeMin = 5;
  return Math.round((distanceKm / avgSpeedKmh) * 60 + preparationTimeMin);
}

async function getDriverActiveDeliveries(driverId: string): Promise<number> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('id')
    .eq('driver_id', driverId)
    .in('status', ['pending', 'assigned', 'picked_up', 'in_transit']);

  if (error) {
    console.error('Error fetching driver deliveries:', error);
    return 0;
  }

  return data?.length || 0;
}

function scoreDriverForOrder(
  driver: DriverWithLocation,
  order: OrderWithLocation,
  currentLoad: number
): number {
  const distance = calculateDistance(
    driver.current_latitude,
    driver.current_longitude,
    order.delivery_latitude,
    order.delivery_longitude
  );

  const distanceScore = Math.max(0, 100 - distance * 10);
  const loadScore = Math.max(0, 100 - currentLoad * 30);

  return distanceScore * 0.6 + loadScore * 0.4;
}

export async function optimizeRoutes(_timeWindowMinutes: number = 60): Promise<OptimizationResult> {
  try {

    const [ordersRes, driversRes] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id,
          order_number,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          status
        `)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .not('delivery_latitude', 'is', null)
        .not('delivery_longitude', 'is', null),
      supabase
        .from('drivers')
        .select(`
          id,
          user_id,
          is_available,
          current_latitude,
          current_longitude,
          profiles:user_id(full_name)
        `)
        .eq('is_available', true)
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null),
    ]);

    const orders = (ordersRes.data || []) as OrderWithLocation[];
    const drivers = (driversRes.data || []) as any[];

    if (orders.length === 0) {
      return {
        assignments: [],
        unassignedOrders: [],
        summary: {
          totalOrders: 0,
          assignedOrders: 0,
          driversUsed: 0,
          averageOrdersPerDriver: 0,
        },
      };
    }

    const driverLoads = new Map<string, number>();
    for (const driver of drivers) {
      const activeDeliveries = await getDriverActiveDeliveries(driver.id);
      driverLoads.set(driver.id, activeDeliveries);
    }

    const assignments: RouteAssignment[] = [];
    const assignedOrderIds = new Set<string>();
    const MAX_ORDERS_PER_DRIVER = 3;

    for (const driver of drivers) {
      const currentLoad = driverLoads.get(driver.id) || 0;
      if (currentLoad >= MAX_ORDERS_PER_DRIVER) continue;

      const availableOrders = orders.filter(o => !assignedOrderIds.has(o.id));
      if (availableOrders.length === 0) break;

      const ordersWithScores = availableOrders.map(order => ({
        order,
        score: scoreDriverForOrder(driver, order, currentLoad),
        distance: calculateDistance(
          driver.current_latitude,
          driver.current_longitude,
          order.delivery_latitude,
          order.delivery_longitude
        ),
      }));

      ordersWithScores.sort((a, b) => b.score - a.score);

      const ordersToAssign = ordersWithScores
        .slice(0, MAX_ORDERS_PER_DRIVER - currentLoad)
        .map(item => item.order);

      if (ordersToAssign.length > 0) {
        let totalDistance = 0;
        let totalTime = 0;

        const orderDetails = ordersToAssign.map((order, index) => {
          const prevLat = index === 0 ? driver.current_latitude : ordersToAssign[index - 1].delivery_latitude;
          const prevLon = index === 0 ? driver.current_longitude : ordersToAssign[index - 1].delivery_longitude;

          const distance = calculateDistance(
            prevLat,
            prevLon,
            order.delivery_latitude,
            order.delivery_longitude
          );

          const time = estimateDeliveryTime(distance);

          totalDistance += distance;
          totalTime += time;

          assignedOrderIds.add(order.id);

          return {
            orderId: order.id,
            orderNumber: order.order_number,
            address: order.delivery_address || 'Adresse non spécifiée',
            distance: Math.round(distance * 10) / 10,
            estimatedTime: time,
          };
        });

        assignments.push({
          driverId: driver.id,
          driverName: driver.profiles?.full_name || 'Livreur',
          orders: orderDetails,
          totalDistance: Math.round(totalDistance * 10) / 10,
          estimatedTotalTime: totalTime,
        });
      }
    }

    const unassignedOrders = orders
      .filter(o => !assignedOrderIds.has(o.id))
      .map(o => o.id);

    return {
      assignments,
      unassignedOrders,
      summary: {
        totalOrders: orders.length,
        assignedOrders: assignedOrderIds.size,
        driversUsed: assignments.length,
        averageOrdersPerDriver: assignments.length > 0
          ? Math.round(assignedOrderIds.size / assignments.length * 10) / 10
          : 0,
      },
    };
  } catch (error) {
    console.error('Error optimizing routes:', error);
    throw new Error('Échec de l\'optimisation des tournées');
  }
}

export async function assignRouteToDriver(
  driverId: string,
  orderIds: string[]
): Promise<boolean> {
  try {
    for (const orderId of orderIds) {
      const { data: existingDelivery } = await supabase
        .from('deliveries')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existingDelivery) {
        await supabase
          .from('deliveries')
          .update({
            driver_id: driverId,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
          })
          .eq('id', existingDelivery.id);
      } else {
        const { data: order } = await supabase
          .from('orders')
          .select('delivery_address, delivery_latitude, delivery_longitude')
          .eq('id', orderId)
          .single();

        if (order) {
          await supabase.from('deliveries').insert({
            order_id: orderId,
            driver_id: driverId,
            status: 'assigned',
            pickup_address: order.delivery_address || '',
            pickup_latitude: order.delivery_latitude,
            pickup_longitude: order.delivery_longitude,
            driver_fee: 2.45,
            assigned_at: new Date().toISOString(),
          });
        }
      }

      await supabase
        .from('orders')
        .update({ status: 'in_delivery' })
        .eq('id', orderId);
    }

    return true;
  } catch (error) {
    console.error('Error assigning route:', error);
    return false;
  }
}

export async function getOptimizationStats(): Promise<{
  totalDrivers: number;
  availableDrivers: number;
  pendingOrders: number;
  averageLoad: number;
}> {
  const [driversRes, ordersRes] = await Promise.all([
    supabase.from('drivers').select('id, is_available'),
    supabase
      .from('orders')
      .select('id')
      .in('status', ['confirmed', 'preparing', 'ready']),
  ]);

  const drivers = driversRes.data || [];
  const availableDrivers = drivers.filter(d => d.is_available);

  return {
    totalDrivers: drivers.length,
    availableDrivers: availableDrivers.length,
    pendingOrders: ordersRes.data?.length || 0,
    averageLoad: availableDrivers.length > 0
      ? Math.round((ordersRes.data?.length || 0) / availableDrivers.length * 10) / 10
      : 0,
  };
}
