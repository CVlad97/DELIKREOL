import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isDemoMode } from '../lib/supabase';
import { AlertCircle, Clock, MapPin, Package, ShieldCheck, Store, Truck, Users } from 'lucide-react';
import type { UserType } from '../types';
import { getOpsDashboardSnapshot, type OpsDashboardSnapshot } from '../services/opsService';
import { OpsAlertsPanel } from '../components/admin/OpsAlertsPanel';
import { OpsEntitiesPanel } from '../components/admin/OpsEntitiesPanel';
import { OpsKpiGrid } from '../components/admin/OpsKpiGrid';
import { MissionPipelineBoard } from '../components/admin/MissionPipelineBoard';

interface DashboardStats {
  pendingCount: number;
  todayCount: number;
  weekCount: number;
}

export function ProDashboard({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ pendingCount: 0, todayCount: 0, weekCount: 0 });
  const [loading, setLoading] = useState(true);
  const [opsSnapshot, setOpsSnapshot] = useState<OpsDashboardSnapshot | null>(null);

  const userType = profile?.user_type as UserType;

  useEffect(() => {
    loadDashboardData();
  }, [userType, user]);

  const loadDashboardData = async () => {
    if (!user || !userType) return;

    try {
      if (userType === 'admin') {
        const snapshot = await getOpsDashboardSnapshot();
        setOpsSnapshot(snapshot);
      }

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
    if (isDemoMode) {
      const snapshot = await getOpsDashboardSnapshot();
      setStats({
        pendingCount: snapshot.kpis.awaitingQualification,
        todayCount: snapshot.kpis.requestsToday,
        weekCount: snapshot.kpis.completedToday,
      });
      return;
    }

    const [requestsRes, partnersRes] = await Promise.all([
      supabase.from('client_requests').select('id, status, created_at').eq('status', 'pending_admin_review'),
      supabase.from('partner_applications').select('id, status').eq('status', 'pending'),
    ]);

    setStats({
      pendingCount: (partnersRes.data?.length || 0) + (requestsRes.data?.length || 0),
      todayCount: requestsRes.data?.length || 0,
      weekCount: requestsRes.data?.length || 0,
    });
  };

  const loadVendorStats = async () => {
    if (isDemoMode) {
      setStats({ pendingCount: 4, todayCount: 7, weekCount: 18 });
      return;
    }

    const { data } = await supabase.from('orders').select('id, status').eq('status', 'pending');
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0,
    });
  };

  const loadRelayHostStats = async () => {
    if (isDemoMode) {
      setStats({ pendingCount: 3, todayCount: 6, weekCount: 14 });
      return;
    }

    const { data } = await supabase.from('relay_point_deposits').select('id, status').eq('status', 'pending');
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0,
    });
  };

  const loadDriverStats = async () => {
    if (isDemoMode) {
      setStats({ pendingCount: 2, todayCount: 5, weekCount: 16 });
      return;
    }

    const { data } = await supabase.from('deliveries').select('id, status').in('status', ['pending', 'in_transit']);
    setStats({
      pendingCount: data?.length || 0,
      todayCount: data?.length || 0,
      weekCount: data?.length || 0,
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (userType === 'admin' && opsSnapshot) {
    return (
      <div className="min-h-screen bg-[#f6efe7] px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-[#dec3a7] bg-[linear-gradient(135deg,rgba(116,27,27,0.96),rgba(173,70,34,0.94)_42%,rgba(223,174,74,0.9)_100%)] p-6 text-white shadow-[0_30px_80px_rgba(88,31,20,0.28)]">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/90">
                  DELIKREOL OPS
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                  Cockpit operateur local pour demandes, partenaires, missions et marge.
                </h1>
                <p className="mt-4 max-w-2xl text-base font-medium text-white/80 md:text-lg">
                  Vous faites la demande, DELIKREOL organise et transmet aux bons partenaires. Cette vue centralise l'activite terrain sans backend obligatoire.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => onNavigate?.('operations')} className="rounded-full bg-[#1f6a4a] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#19573d]">
                    Ouvrir les operations
                  </button>
                  <button onClick={() => onNavigate?.('partners')} className="rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20">
                    Qualifier les partenaires
                  </button>
                  <button onClick={() => onNavigate?.('requests')} className="rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20">
                    Voir les demandes
                  </button>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/15 bg-black/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">Discipline operative</p>
                <div className="mt-4 space-y-3 text-sm font-medium text-white/85">
                  <div className="rounded-2xl bg-white/10 p-4">Centraliser tous les canaux dans le pipeline avant execution terrain.</div>
                  <div className="rounded-2xl bg-white/10 p-4">Verifier marge et disponibilite partenaire avant promotion agressive.</div>
                  <div className="rounded-2xl bg-white/10 p-4">Suivre les documents critiques avant activation publique d'un partenaire.</div>
                </div>
              </div>
            </div>
          </section>

          <OpsKpiGrid snapshot={opsSnapshot} />
          <MissionPipelineBoard snapshot={opsSnapshot} />
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <OpsAlertsPanel snapshot={opsSnapshot} onNavigate={onNavigate} />
            <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#f7eadf] p-3 text-[#963b25]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Vue rapide</p>
                  <h2 className="text-xl font-black text-[#26150f]">Actions prioritaires aujourd'hui</h2>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <button onClick={() => onNavigate?.('operations')} className="rounded-3xl border border-[#ead8bb] bg-[#fffaf4] p-5 text-left transition hover:border-[#d9b181]">
                  <div className="mb-3 inline-flex rounded-2xl bg-[#f7eadf] p-3 text-[#963b25]"><Package className="h-5 w-5" /></div>
                  <p className="text-lg font-black text-[#2f1911]">Piloter les missions</p>
                  <p className="mt-2 text-sm text-[#6d5c52]">Suivi commandes, affectation, statut et cloture terrain.</p>
                </button>
                <button onClick={() => onNavigate?.('partners')} className="rounded-3xl border border-[#ead8bb] bg-[#fffaf4] p-5 text-left transition hover:border-[#d9b181]">
                  <div className="mb-3 inline-flex rounded-2xl bg-[#eef8f1] p-3 text-[#1f6a4a]"><ShieldCheck className="h-5 w-5" /></div>
                  <p className="text-lg font-black text-[#2f1911]">Regulariser les partenaires</p>
                  <p className="mt-2 text-sm text-[#6d5c52]">Dossier, documents, visibilite publique et readiness operationnelle.</p>
                </button>
                <button onClick={() => onNavigate?.('map')} className="rounded-3xl border border-[#ead8bb] bg-[#fffaf4] p-5 text-left transition hover:border-[#d9b181]">
                  <div className="mb-3 inline-flex rounded-2xl bg-[#f1f5ff] p-3 text-[#29579f]"><MapPin className="h-5 w-5" /></div>
                  <p className="text-lg font-black text-[#2f1911]">Cartographier les zones</p>
                  <p className="mt-2 text-sm text-[#6d5c52]">Reperer les zones actives, relais et poches de demande.</p>
                </button>
                <button onClick={() => onNavigate?.('requests')} className="rounded-3xl border border-[#ead8bb] bg-[#fffaf4] p-5 text-left transition hover:border-[#d9b181]">
                  <div className="mb-3 inline-flex rounded-2xl bg-[#fff1ef] p-3 text-[#b1452c]"><AlertCircle className="h-5 w-5" /></div>
                  <p className="text-lg font-black text-[#2f1911]">Qualifier les demandes</p>
                  <p className="mt-2 text-sm text-[#6d5c52]">Passer du site, de WhatsApp ou de Telegram a une mission exploitable.</p>
                </button>
              </div>
            </div>
          </div>
          <OpsEntitiesPanel snapshot={opsSnapshot} />
        </div>
      </div>
    );
  }

  const roleConfig = {
    vendor: {
      title: 'Tableau de bord vendeur',
      icon: Package,
      color: 'from-[#fff6ea] to-[#fffdf9] border-[#ecd5b8]',
      cards: [
        { title: 'Commandes a preparer', value: stats.pendingCount, icon: Package, actionLabel: 'Voir mes commandes' },
        { title: "Livraisons aujourd'hui", value: stats.todayCount, icon: Clock, actionLabel: 'Planning du jour' },
      ],
    },
    relay_host: {
      title: 'Tableau de bord point relais',
      icon: MapPin,
      color: 'from-[#eff7ff] to-[#fffdf9] border-[#cfe3f4]',
      cards: [
        { title: 'Colis en attente', value: stats.pendingCount, icon: Package, actionLabel: 'Voir les colis' },
        { title: 'Retraits prevus', value: stats.todayCount, icon: Users, actionLabel: 'Clients attendus' },
      ],
    },
    driver: {
      title: 'Tableau de bord livreur',
      icon: Truck,
      color: 'from-[#eef9f1] to-[#fffdf9] border-[#d4ead9]',
      cards: [
        { title: 'Livraisons en cours', value: stats.pendingCount, icon: Truck, actionLabel: 'Ma tournee' },
        { title: 'Livraisons du jour', value: stats.todayCount, icon: Clock, actionLabel: 'Planning' },
      ],
    },
  };

  const config = userType && userType !== 'customer' && userType !== 'admin' ? roleConfig[userType] : null;
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#f6efe7] p-6">
      <div className="mx-auto max-w-7xl">
        <div className={`mb-8 rounded-[30px] border bg-gradient-to-br p-8 ${config.color}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#7a4a25] shadow-sm">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#26150f]">{config.title}</h1>
              <p className="text-sm font-medium text-[#6d5c52]">Espace professionnel DELIKREOL</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {config.cards.map((card, idx) => (
            <div key={idx} className="rounded-[28px] border border-[#ead8bb] bg-white p-6 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                {card.icon && <card.icon className="h-6 w-6 text-[#9b4b28]" />}
                <h3 className="font-black text-[#2f1911]">{card.title}</h3>
              </div>
              <div className="mb-4 text-4xl font-black text-[#1f6a4a]">{card.value}</div>
              <button className="w-full rounded-2xl bg-[#7a2f22] px-4 py-3 text-sm font-black text-white transition hover:bg-[#642519]">
                {card.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
