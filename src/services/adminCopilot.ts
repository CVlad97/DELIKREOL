import { supabase } from '../lib/supabase';

export interface AdminContext {
  ordersToday: number;
  pendingApplications: number;
  pendingRequests: number;
  activeVendors: number;
  activeDrivers: number;
  totalRevenue: number;
}

export interface CopilotSummary {
  summary: string;
  alerts: string[];
  suggestions: string[];
}

export async function getAdminSummary(): Promise<AdminContext> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersRes, appsRes, requestsRes, vendorsRes, driversRes] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .gte('created_at', today.toISOString()),
      supabase
        .from('partner_applications')
        .select('id', { count: 'exact' })
        .eq('status', 'pending'),
      supabase
        .from('client_requests')
        .select('id', { count: 'exact' })
        .eq('status', 'pending_admin_review'),
      supabase
        .from('vendors')
        .select('id', { count: 'exact' })
        .eq('is_active', true),
      supabase
        .from('drivers')
        .select('id', { count: 'exact' })
        .eq('is_available', true),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return {
      ordersToday: ordersRes.count || 0,
      pendingApplications: appsRes.count || 0,
      pendingRequests: requestsRes.count || 0,
      activeVendors: vendorsRes.count || 0,
      activeDrivers: driversRes.count || 0,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error getting admin summary:', error);
    return {
      ordersToday: 0,
      pendingApplications: 0,
      pendingRequests: 0,
      activeVendors: 0,
      activeDrivers: 0,
      totalRevenue: 0,
    };
  }
}

export async function askAdminCopilot(
  question: string,
  context: AdminContext
): Promise<string> {
  const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY;

  if (!hasOpenAI) {
    return `📊 **Mode Démo - IA non activée**

Voici les données brutes disponibles :

**Aujourd'hui :**
- 📦 Commandes : ${context.ordersToday}
- 💰 Revenu : ${context.totalRevenue.toFixed(2)}€
- ⏳ Demandes clients en attente : ${context.pendingRequests}

**Partenaires :**
- 📝 Candidatures en attente : ${context.pendingApplications}
- 🏪 Vendeurs actifs : ${context.activeVendors}
- 🚗 Livreurs disponibles : ${context.activeDrivers}

💡 **Votre question :** "${question}"

*Pour activer l'IA Copilot, configurez VITE_OPENAI_API_KEY dans votre environnement.*`;
  }

  return 'IA Copilot activée - TODO: Implémenter l\'appel à OpenAI/Claude via Edge Function';
}

export function generateInsights(context: AdminContext): CopilotSummary {
  const alerts: string[] = [];
  const suggestions: string[] = [];

  if (context.pendingApplications > 5) {
    alerts.push(`${context.pendingApplications} candidatures partenaires en attente de traitement`);
  }

  if (context.pendingRequests > 10) {
    alerts.push(`${context.pendingRequests} demandes clients à traiter rapidement`);
  }

  if (context.activeDrivers < 3) {
    alerts.push('Peu de livreurs disponibles - risque de délais');
    suggestions.push('Recruter plus de livreurs ou augmenter les incitations');
  }

  if (context.ordersToday === 0) {
    suggestions.push('Aucune commande aujourd\'hui - considérer une campagne promotionnelle');
  }

  if (context.activeVendors < 5) {
    suggestions.push('Augmenter le nombre de vendeurs actifs pour diversifier l\'offre');
  }

  const summary = `
📊 **Résumé du jour**
${context.ordersToday} commande(s) · ${context.totalRevenue.toFixed(2)}€ de revenu
${context.pendingRequests} demande(s) en attente · ${context.pendingApplications} candidature(s) à traiter
  `.trim();

  return { summary, alerts, suggestions };
}
