import { useState, useEffect } from 'react';
import { QrCode, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { QRScanner } from '../components/QRScanner';
import { QRDisplay } from '../components/QRDisplay';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { RelayPointHost, RelayPointDeposit, StorageCapacity } from '../types';

export function RelayHostApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [hostData, setHostData] = useState<RelayPointHost | null>(null);
  const [deposits, setDeposits] = useState<RelayPointDeposit[]>([]);
  const [capacities, setCapacities] = useState<StorageCapacity[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({
    todayPickups: 0,
    totalEarnings: 0,
    pendingDeposits: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHostData();
  }, [user]);

  const loadHostData = async () => {
    if (!user) return;

    try {
      const { data: hostInfo, error: hostError } = await supabase
        .from('relay_point_hosts')
        .select(`
          *,
          relay_point:relay_points(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (hostError) throw hostError;
      setHostData(hostInfo);

      if (hostInfo.relay_point_id) {
        await Promise.all([
          loadDeposits(hostInfo.relay_point_id),
          loadCapacities(hostInfo.relay_point_id),
        ]);
      }
    } catch (error) {
      console.error('Error loading host data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeposits = async (relayPointId: string) => {
    const { data, error } = await supabase
      .from('relay_point_deposits')
      .select(`
        *,
        order:orders(*),
        relay_point:relay_points(*)
      `)
      .eq('relay_point_id', relayPointId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeposits(data);

      const today = new Date().toISOString().split('T')[0];
      const todayPickups = data.filter(
        (d) => d.picked_up_at && d.picked_up_at.startsWith(today)
      ).length;

      const pending = data.filter((d) => d.status === 'deposited').length;

      setStats((prev) => ({
        ...prev,
        todayPickups,
        pendingDeposits: pending,
      }));
    }
  };

  const loadCapacities = async (relayPointId: string) => {
    const { data, error } = await supabase
      .from('storage_capacities')
      .select('*')
      .eq('relay_point_id', relayPointId);

    if (!error && data) {
      setCapacities(data);

      const totalCapacity = data.reduce((sum, cap) => sum + cap.total_capacity, 0);
      const totalUsage = data.reduce((sum, cap) => sum + cap.current_usage, 0);
      const occupancyRate = totalCapacity > 0 ? (totalUsage / totalCapacity) * 100 : 0;

      setStats((prev) => ({
        ...prev,
        occupancyRate,
      }));
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      const depositId = qrData.split('-')[0];

      const { data: deposit, error } = await supabase
        .from('relay_point_deposits')
        .select('*, order:orders(*)')
        .eq('id', depositId)
        .single();

      if (error) throw error;

      if (deposit.status === 'awaiting_deposit') {
        await supabase
          .from('relay_point_deposits')
          .update({
            status: 'deposited',
            deposited_at: new Date().toISOString(),
          })
          .eq('id', depositId);

        alert('Dépôt confirmé avec succès!');
      } else if (deposit.status === 'deposited') {
        await supabase
          .from('relay_point_deposits')
          .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
            picked_up_by: user?.id,
          })
          .eq('id', depositId);

        alert('Retrait confirmé avec succès!');
      }

      setShowScanner(false);
      loadHostData();
    } catch (error) {
      console.error('Error processing QR code:', error);
      alert('Erreur lors du traitement du QR code');
    }
  };

  const renderDashboard = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {hostData?.relay_point && (
          <p className="text-gray-600">{hostData.relay_point.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Retraits aujourd'hui</p>
          <p className="text-2xl font-bold">{stats.todayPickups}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Gains totaux</p>
          <p className="text-2xl font-bold">{stats.totalEarnings.toFixed(2)}€</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Dépôts en attente</p>
          <p className="text-2xl font-bold">{stats.pendingDeposits}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Taux d'occupation</p>
          <p className="text-2xl font-bold">{stats.occupancyRate.toFixed(0)}%</p>
        </div>
      </div>

      <button
        onClick={() => setShowScanner(true)}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg mb-6"
      >
        <QrCode className="w-6 h-6" />
        Scanner un QR Code
      </button>

      {hostData && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h2 className="font-bold text-lg mb-3">Informations du point relais</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type de rémunération:</span>
              <span className="font-medium capitalize">{hostData.compensation_type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant:</span>
              <span className="font-medium">{hostData.compensation_amount}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Note:</span>
              <span className="font-medium">⭐ {hostData.rating.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total retraits:</span>
              <span className="font-medium">{hostData.total_pickups}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 text-sm ${hostData.identity_verified ? 'text-green-600' : 'text-yellow-600'}`}>
              <div className={`w-3 h-3 rounded-full ${hostData.identity_verified ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
              Identité {hostData.identity_verified ? 'vérifiée' : 'en attente'}
            </div>
            <div className={`flex items-center gap-2 text-sm ${hostData.sanitary_compliance ? 'text-green-600' : 'text-yellow-600'}`}>
              <div className={`w-3 h-3 rounded-full ${hostData.sanitary_compliance ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
              Conformité sanitaire {hostData.sanitary_compliance ? 'validée' : 'en attente'}
            </div>
            <div className={`flex items-center gap-2 text-sm ${hostData.bank_account_verified ? 'text-green-600' : 'text-yellow-600'}`}>
              <div className={`w-3 h-3 rounded-full ${hostData.bank_account_verified ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
              Compte bancaire {hostData.bank_account_verified ? 'vérifié' : 'en attente'}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDeposits = () => (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dépôts</h1>
        <button
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 text-white p-2 rounded-lg"
        >
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      {deposits.length > 0 ? (
        <div className="space-y-3">
          {deposits.map((deposit) => (
            <div key={deposit.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold">{deposit.order?.order_number}</p>
                  <p className="text-sm text-gray-600 capitalize">{deposit.storage_type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  deposit.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                  deposit.status === 'deposited' ? 'bg-blue-100 text-blue-800' :
                  deposit.status === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {deposit.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                {deposit.deposited_at && (
                  <p>Déposé: {new Date(deposit.deposited_at).toLocaleString()}</p>
                )}
                {deposit.picked_up_at && (
                  <p>Retiré: {new Date(deposit.picked_up_at).toLocaleString()}</p>
                )}
              </div>

              {deposit.status === 'deposited' && (
                <div className="mt-3 pt-3 border-t">
                  <QRDisplay
                    value={deposit.pickup_qr_code}
                    size={150}
                    title="QR de retrait"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucun dépôt pour le moment</p>
        </div>
      )}
    </div>
  );

  const renderCapacity = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Capacité de stockage</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-4">Vue d'ensemble</h2>
        <div className="space-y-4">
          {capacities.map((capacity) => (
            <div key={capacity.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{capacity.storage_type}</span>
                <span className="text-sm text-gray-600">
                  {capacity.current_usage}/{capacity.total_capacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    (capacity.current_usage / capacity.total_capacity) * 100 > 80
                      ? 'bg-red-500'
                      : (capacity.current_usage / capacity.total_capacity) * 100 > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(capacity.current_usage / capacity.total_capacity) * 100}%`,
                  }}
                ></div>
              </div>
              {capacity.temperature_min !== null && capacity.temperature_max !== null && (
                <p className="text-xs text-gray-500 mt-1">
                  Température: {capacity.temperature_min}°C - {capacity.temperature_max}°C
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3">Équipements</h2>
        <div className="space-y-2">
          {capacities.map((capacity) => (
            <div key={capacity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <span className="capitalize">{capacity.storage_type}</span>
              <span className="text-sm text-gray-600">{capacity.equipment_type || 'Non spécifié'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Gains</h1>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <p className="text-sm opacity-90 mb-2">Total des gains</p>
        <p className="text-4xl font-bold mb-4">{stats.totalEarnings.toFixed(2)}€</p>
        <p className="text-sm opacity-90">
          Basé sur {hostData?.total_pickups || 0} retraits
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-3">Détails de rémunération</h2>
        {hostData && (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{hostData.compensation_type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Montant unitaire:</span>
              <span className="font-medium">{hostData.compensation_amount}€</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Retraits aujourd'hui:</span>
              <span className="font-medium">{stats.todayPickups}</span>
            </div>
            <div className="flex justify-between py-2 bg-green-50 -mx-4 px-4 rounded-b-xl">
              <span className="font-bold">Gains aujourd'hui:</span>
              <span className="font-bold text-green-600">
                {(stats.todayPickups * hostData.compensation_amount).toFixed(2)}€
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3">Historique des paiements</h2>
        <p className="text-sm text-gray-500">Fonctionnalité à venir...</p>
      </div>
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'deposits':
        return renderDeposits();
      case 'capacity':
        return renderCapacity();
      case 'earnings':
        return renderEarnings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="relay_host" currentView={currentView} onNavigate={setCurrentView} />
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
