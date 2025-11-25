import { useState, useEffect } from 'react';
import { QrCode, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { QRScanner } from '../components/QRScanner';
import { QRDisplay } from '../components/QRDisplay';
import { ProDashboard } from './ProDashboard';
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
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'deposits':
        return <div className="p-4">Deposits View (TODO)</div>;
      case 'capacity':
        return <div className="p-4">Capacity View (TODO)</div>;
      case 'scanner':
        return <div className="p-4">QR Scanner (TODO)</div>;
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
