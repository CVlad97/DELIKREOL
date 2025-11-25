import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Users, 
  Store, 
  MapPin, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface SimulationStats {
  vendors: number;
  relayPoints: number;
  clientRequests: number;
  partnerApplications: number;
  requestsPending: number;
  requestsInProgress: number;
  requestsCompleted: number;
  applicationsPending: number;
  applicationsAccepted: number;
}

export function SimulationDashboard() {
  const [stats, setStats] = useState<SimulationStats>({
    vendors: 0,
    relayPoints: 0,
    clientRequests: 0,
    partnerApplications: 0,
    requestsPending: 0,
    requestsInProgress: 0,
    requestsCompleted: 0,
    applicationsPending: 0,
    applicationsAccepted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSimulationStats();
  }, []);

  const loadSimulationStats = async () => {
    setLoading(true);
    try {
      const [
        vendorsRes,
        relayPointsRes,
        requestsRes,
        applicationsRes,
      ] = await Promise.all([
        supabase.from('vendors').select('id', { count: 'exact', head: true }),
        supabase.from('relay_points').select('id', { count: 'exact', head: true }),
        supabase.from('client_requests').select('id, status', { count: 'exact' }),
        supabase.from('partner_applications').select('id, status', { count: 'exact' }),
      ]);

      const requests = requestsRes.data || [];
      const applications = applicationsRes.data || [];

      setStats({
        vendors: vendorsRes.count || 0,
        relayPoints: relayPointsRes.count || 0,
        clientRequests: requestsRes.count || 0,
        partnerApplications: applicationsRes.count || 0,
        requestsPending: requests.filter(r => r.status === 'pending_admin_review').length,
        requestsInProgress: requests.filter(r => r.status === 'in_progress').length,
        requestsCompleted: requests.filter(r => r.status === 'completed').length,
        applicationsPending: applications.filter(a => a.status === 'pending').length,
        applicationsAccepted: applications.filter(a => a.status === 'accepted').length,
      });
    } catch (error) {
      console.error('Error loading simulation stats:', error);
      showError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    const confirmed = window.confirm(
      'Voulez-vous vraiment réinitialiser les données de simulation ?\n\nCela supprimera toutes les données actuelles et rechargera les données de démonstration.'
    );

    if (!confirmed) return;

    setResetting(true);
    try {
      showSuccess('Réinitialisation en cours... (Fonctionnalité à implémenter via migration SQL)');
      await loadSimulationStats();
    } catch (error) {
      console.error('Error resetting simulation:', error);
      showError('Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 backdrop-blur border-2 border-emerald-600 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-50">Mode Simulation</h1>
                <p className="text-slate-300 mt-1">
                  Environnement de démonstration avec données réalistes
                </p>
              </div>
            </div>
            <button
              onClick={handleResetSimulation}
              disabled={resetting}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white rounded-xl font-medium transition-colors"
            >
              <RotateCcw className={`w-5 h-5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-200 mb-2">
                À propos du Mode Simulation
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                Ce mode contient des données fictives mais réalistes pour permettre aux futurs partenaires 
                et utilisateurs de comprendre le fonctionnement de DELIKREOL. Toutes les entreprises, 
                commandes et demandes sont des exemples créés pour la démonstration.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vendeurs */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-emerald-400" />
              <h3 className="font-semibold text-slate-200">Vendeurs</h3>
            </div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{stats.vendors}</div>
            <p className="text-slate-400 text-sm">Restaurants & Producteurs</p>
          </div>

          {/* Points Relais */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold text-slate-200">Points Relais</h3>
            </div>
            <div className="text-4xl font-bold text-blue-400 mb-2">{stats.relayPoints}</div>
            <p className="text-slate-400 text-sm">Lieux de retrait actifs</p>
          </div>

          {/* Demandes Clients */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="font-semibold text-slate-200">Demandes Clients</h3>
            </div>
            <div className="text-4xl font-bold text-purple-400 mb-2">{stats.clientRequests}</div>
            <p className="text-slate-400 text-sm">Commandes totales</p>
          </div>

          {/* Candidatures */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <h3 className="font-semibold text-slate-200">Candidatures</h3>
            </div>
            <div className="text-4xl font-bold text-orange-400 mb-2">{stats.partnerApplications}</div>
            <p className="text-slate-400 text-sm">Partenaires potentiels</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Demandes par Statut */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Demandes Clients par Statut
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-slate-200 font-medium">En Attente</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.requestsPending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-200 font-medium">En Cours</span>
                </div>
                <span className="text-2xl font-bold text-blue-400">{stats.requestsInProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-200 font-medium">Terminées</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{stats.requestsCompleted}</span>
              </div>
            </div>
          </div>

          {/* Candidatures par Statut */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-400" />
              Candidatures Partenaires
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-slate-200 font-medium">À Traiter</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.applicationsPending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-200 font-medium">Acceptées</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{stats.applicationsAccepted}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-200 font-medium">Refusées</span>
                </div>
                <span className="text-2xl font-bold text-slate-400">
                  {stats.partnerApplications - stats.applicationsPending - stats.applicationsAccepted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-200 mb-4">
            Comment utiliser le Mode Simulation
          </h3>
          <div className="space-y-3 text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm font-bold">1</span>
              </div>
              <p>
                <strong className="text-slate-200">Explorez les données :</strong> Naviguez dans 
                les pages Admin pour voir les demandes clients, candidatures partenaires et statistiques.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm font-bold">2</span>
              </div>
              <p>
                <strong className="text-slate-200">Testez les fonctionnalités :</strong> Modifiez 
                les statuts, acceptez/refusez des candidatures, visualisez sur la carte.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm font-bold">3</span>
              </div>
              <p>
                <strong className="text-slate-200">Réinitialisez si besoin :</strong> Utilisez le 
                bouton "Réinitialiser" pour restaurer les données de démonstration initiales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
