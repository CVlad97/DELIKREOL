import { supabase } from '../lib/supabase';
import { callOpenAI } from '../utils/apiIntegrations';

export interface DailyMetrics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue: number;
  activeDrivers: number;
  availableDrivers: number;
  totalRelayPoints: number;
  relayUtilization: Array<{
    name: string;
    currentUsage: number;
    totalCapacity: number;
    utilizationRate: number;
  }>;
  ordersByZone: Record<string, number>;
  averageDeliveryTime?: number;
}

export interface CopilotResponse {
  summary: string;
  alerts: string[];
  suggestions: string[];
  fullAnalysis?: string;
}

export async function aggregateDailyMetrics(): Promise<DailyMetrics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersRes, driversRes, relayPointsRes, deliveriesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('status, total_amount, delivery_address')
      .gte('created_at', today.toISOString()),
    supabase
      .from('drivers')
      .select('id, is_available'),
    supabase
      .from('relay_points')
      .select(`
        id,
        name,
        storage_capacities(storage_type, total_capacity, current_usage)
      `)
      .eq('is_active', true),
    supabase
      .from('deliveries')
      .select('created_at, delivered_at')
      .not('delivered_at', 'is', null)
      .gte('created_at', today.toISOString()),
  ]);

  const orders = ordersRes.data || [];
  const drivers = driversRes.data || [];
  const relayPoints = relayPointsRes.data || [];
  const deliveries = deliveriesRes.data || [];

  const ordersByStatus: Record<string, number> = {};
  orders.forEach((order) => {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0);

  const relayUtilization = relayPoints.map((point: any) => {
    const capacities = point.storage_capacities || [];
    const totalCapacity = capacities.reduce((sum: number, cap: any) => sum + cap.total_capacity, 0);
    const currentUsage = capacities.reduce((sum: number, cap: any) => sum + cap.current_usage, 0);

    return {
      name: point.name,
      currentUsage,
      totalCapacity,
      utilizationRate: totalCapacity > 0 ? (currentUsage / totalCapacity) * 100 : 0,
    };
  });

  let averageDeliveryTime: number | undefined;
  if (deliveries.length > 0) {
    const totalTime = deliveries.reduce((sum, delivery) => {
      const start = new Date(delivery.created_at).getTime();
      const end = new Date(delivery.delivered_at).getTime();
      return sum + (end - start);
    }, 0);
    averageDeliveryTime = Math.round(totalTime / deliveries.length / 60000);
  }

  const ordersByZone: Record<string, number> = {};
  orders.forEach((order) => {
    const zone = order.delivery_address?.split(',').pop()?.trim() || 'Unknown';
    ordersByZone[zone] = (ordersByZone[zone] || 0) + 1;
  });

  return {
    totalOrders: orders.length,
    ordersByStatus,
    totalRevenue,
    activeDrivers: drivers.filter((d) => d.is_available).length,
    availableDrivers: drivers.filter((d) => d.is_available).length,
    totalRelayPoints: relayPoints.length,
    relayUtilization,
    ordersByZone,
    averageDeliveryTime,
  };
}

export async function generateCopilotSummary(metrics: DailyMetrics): Promise<CopilotResponse> {
  try {
    const saturatedRelays = metrics.relayUtilization.filter(r => r.utilizationRate > 80);

    const prompt = `Tu es un assistant logistique pour DELIKREOL, une plateforme de livraison en Martinique.

Données du jour:
- Commandes totales: ${metrics.totalOrders}
- Revenus: ${metrics.totalRevenue.toFixed(2)}€
- Livreurs disponibles: ${metrics.availableDrivers}
- Points relais: ${metrics.totalRelayPoints}
- Temps de livraison moyen: ${metrics.averageDeliveryTime || 'N/A'} minutes
- Points relais saturés (>80%): ${saturatedRelays.length}

Statut des commandes:
${Object.entries(metrics.ordersByStatus).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

Utilisation des relais:
${metrics.relayUtilization.map(r => `- ${r.name}: ${r.utilizationRate.toFixed(1)}% (${r.currentUsage}/${r.totalCapacity})`).join('\n')}

Génère un résumé opérationnel concis avec:
1. Un résumé de la situation (2-3 phrases)
2. Les alertes prioritaires (liste à puces)
3. Les suggestions d'optimisation (liste à puces)

Réponds en français, format concis et actionnable.`;

    const analysis = await callOpenAI(prompt);

    const lines = analysis.split('\n').filter(l => l.trim());
    const summary = lines.slice(0, 3).join(' ');

    const alerts: string[] = [];
    if (saturatedRelays.length > 0) {
      alerts.push(`${saturatedRelays.length} point(s) relais saturé(s)`);
    }
    if (metrics.availableDrivers < 3) {
      alerts.push('Pénurie de livreurs disponibles');
    }
    if (metrics.ordersByStatus['pending'] > 5) {
      alerts.push(`${metrics.ordersByStatus['pending']} commandes en attente`);
    }

    const suggestions: string[] = [];
    if (saturatedRelays.length > 0) {
      suggestions.push('Rediriger les commandes vers des relais moins chargés');
    }
    if (metrics.availableDrivers < metrics.totalOrders / 5) {
      suggestions.push('Recruter des livreurs supplémentaires');
    }
    if (metrics.averageDeliveryTime && metrics.averageDeliveryTime > 60) {
      suggestions.push('Optimiser les zones de livraison');
    }

    return {
      summary: summary || 'Système opérationnel',
      alerts,
      suggestions,
      fullAnalysis: analysis,
    };
  } catch (error) {
    console.error('Error generating copilot summary:', error);

    return {
      summary: `${metrics.totalOrders} commandes aujourd'hui, ${metrics.totalRevenue.toFixed(2)}€ de revenus`,
      alerts: [],
      suggestions: [],
    };
  }
}

export async function askCopilot(question: string, context?: DailyMetrics): Promise<string> {
  try {
    const contextStr = context ? `
Contexte actuel:
- Commandes: ${context.totalOrders}
- Revenus: ${context.totalRevenue.toFixed(2)}€
- Livreurs disponibles: ${context.availableDrivers}
- Points relais: ${context.totalRelayPoints}

` : '';

    const prompt = `${contextStr}Question de l'administrateur DELIKREOL: ${question}

Réponds de manière concise et actionnable en français.`;

    return await callOpenAI(prompt);
  } catch (error) {
    console.error('Error asking copilot:', error);
    throw new Error('Assistant IA temporairement indisponible');
  }
}

export async function logError(
  functionName: string,
  errorType: string,
  errorMessage: string,
  contextData?: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('error_logs').insert({
      user_id: user?.id || null,
      function_name: functionName,
      error_type: errorType,
      error_message: errorMessage,
      context_data: contextData || {},
    });
  } catch (error) {
    console.error('Failed to log error:', error);
  }
}
