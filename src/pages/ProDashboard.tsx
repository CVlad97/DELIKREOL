import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  MapPin, 
  Truck, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { UserType } from '../types';

interface DashboardStats {
  pendingCount: number;
  todayCount: number;
  weekCount: number;
}

export function ProDashboard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ pendingCount: 0, todayCount: 0, weekCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const userType = profile?.user_type as UserType;

  useEffect(() => {
    loadDashboardData();
  }, [userType]);

  const loadDashboardData = async () => {
    if (!user || !userType) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      switch (userType) {
        case 'admin':
          await loadAdminStats();
          break;
        case 'vendor':
          await loadVendorStats();
          break;
        case 'relay_host':
          await loadRelayHostStats();
          break;
        case 'driver':
          await loadDriverStats();
          break;
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    const [requestsRes, partnersRes] = await Promise.all([
      supabase.from('client_requests').select('id, status, created_at').eq('status', 'pending_admin_review'),
      supabase.from('partner_applications').select('id, status').eq('status', 'pending')
    ]);

    setStats({
      pendingCount: (partnersRes.data?.length || 0) + (requestsRes.data?.length || 0),
      todayCount: requestsRes.data?.length || 0,
      weekCount: requestsRes.data?.length || 0
    });
  };

  const loadVendorStats = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, status')
      .eq('status', 'pending');
    
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0
    });
  };

  const loadRelayHostStats = async () => {
    const { data } = await supabase
      .from('relay_point_deposits')
      .select('id, status')
      .eq('status', 'pending');
    
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0
    });
  };

  const loadDriverStats = async () => {
    const { data } = await supabase
      .from('deliveries')
      .select('id, status')
      .in('status', ['pending', 'in_transit']);
    
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const roleConfig = {
    admin: {
      title: 'Tableau de Bord Admin',
      icon: Users,
      color: 'purple',
      cards: [
        {
          title: 'Demandes à traiter',
          value: stats.todayCount,
          icon: AlertCircle,
          action: () => onNavigate?.('requests'),
          actionLabel: 'Voir les demandes'
        },
        {
          title: 'Candidatures partenaires',
          value: stats.pendingCount - stats.todayCount,
          icon: Users,
          action: () => onNavigate?.('partners'),
          actionLabel: 'Gérer les partenaires'
        },
        {
          title: 'Actions rapides',
          links: [
            { label: 'Demandes clients', view: 'requests' },
            { label: 'Partenaires', view: 'partners' },
            { label: 'Guide de test', view: 'test-guide' }
          ]
        }
      ]
    },
    vendor: {
      title: 'Tableau de Bord Vendeur',
      icon: Package,
      color: 'orange',
      cards: [
        {
          title: 'Commandes à préparer',
          value: stats.pendingCount,
          icon: Package,
          actionLabel: 'Voir mes commandes'
        },
        {
          title: 'Livraisons aujourd\'hui',
          value: stats.todayCount,
          icon: Clock,
          actionLabel: 'Planning du jour'
        }
      ]
    },
    relay_host: {
      title: 'Tableau de Bord Point Relais',
      icon: MapPin,
      color: 'blue',
      cards: [
        {
          title: 'Colis en attente',
          value: stats.pendingCount,
          icon: Package,
          actionLabel: 'Voir les colis'
        },
        {
          title: 'Retraits prévus',
          value: stats.todayCount,
          icon: Users,
          actionLabel: 'Clients attendus'
        }
      ]
    },
    driver: {
      title: 'Tableau de Bord Livreur',
      icon: Truck,
      color: 'emerald',
      cards: [
        {
          title: 'Livraisons en cours',
          value: stats.pendingCount,
          icon: Truck,
          actionLabel: 'Ma tournée'
        },
        {
          title: 'Livraisons du jour',
          value: stats.todayCount,
          icon: Clock,
          actionLabel: 'Planning'
        }
      ]
    }
  };

  const config = userType && userType !== 'customer' ? roleConfig[userType] : null;
  if (!config) return null;

  const Icon = config.icon;
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-900/50 to-purple-800/30 border-purple-600',
    orange: 'from-orange-900/50 to-orange-800/30 border-orange-600',
    blue: 'from-blue-900/50 to-blue-800/30 border-blue-600',
    emerald: 'from-emerald-900/50 to-emerald-800/30 border-emerald-600'
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className={`bg-gradient-to-br ${colorClasses[config.color]} backdrop-blur border-2 rounded-3xl p-8 mb-8`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-${config.color}-500/20 flex items-center justify-center`}>
              <Icon className={`w-8 h-8 text-${config.color}-400`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-50">{config.title}</h1>
              <p className="text-slate-300">Bienvenue sur votre espace professionnel</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.cards.map((card: any, idx: number) => (
            <div key={idx} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition-all">
              {card.title && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {card.icon && <card.icon className="w-6 h-6 text-emerald-400" />}
                    <h3 className="font-semibold text-slate-200">{card.title}</h3>
                  </div>
                  {card.value !== undefined && (
                    <div className="text-4xl font-bold text-emerald-400 mb-4">{card.value}</div>
                  )}
                  {card.actionLabel && (
                    <button
                      onClick={card.action}
                      className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-medium transition-colors"
                    >
                      {card.actionLabel}
                    </button>
                  )}
                </>
              )}
              {card.links && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-200 mb-3">Actions rapides</h3>
                  {card.links.map((link: any, linkIdx: number) => (
                    <button
                      key={linkIdx}
                      onClick={() => onNavigate?.(link.view)}
                      className="w-full text-left px-4 py-2 bg-slate-900/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{link.label}</span>
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">Espace professionnel actif</h3>
              <p className="text-slate-400 text-sm">
                Vous êtes connecté en tant que {profile?.full_name || 'utilisateur pro'}. 
                Utilisez le bouton en haut à droite pour revenir au mode client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
