import { useState, useEffect } from 'react';
import { Users, Store, MapPin, Truck, DollarSign, Plug } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { APIKeysManager } from '../components/admin/APIKeysManager';
import { WhatsAppManager } from '../components/admin/WhatsAppManager';
import { AdminInsights } from './AdminInsights';
import { AdminHub } from './AdminHub';
import { AdminRequests } from './AdminRequests';
import { AdminTestGuide } from './AdminTestGuide';
import { AdminPartners } from './admin/AdminPartners';
import { CommunityFundAdmin } from './admin/CommunityFundAdmin';
import { ProDashboard } from './ProDashboard';
import { supabase } from '../lib/supabase';
import { Vendor, RelayPoint, Location } from '../types';
import { integrations, getIntegrationStatus } from '../config/integrations';

export function AdminApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalRelayPoints: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
  });
  const [mapCenter] = useState<Location>({
    latitude: 14.6415,
    longitude: -61.0242,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadVendors(),
        loadRelayPoints(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const [usersRes, vendorsRes, relayPointsRes, ordersRes, driversRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vendors').select('id', { count: 'exact', head: true }),
      supabase.from('relay_points').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount'),
      supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('is_available', true),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    setStats({
      totalUsers: usersRes.count || 0,
      totalVendors: vendorsRes.count || 0,
      totalRelayPoints: relayPointsRes.count || 0,
      totalOrders: ordersRes.data?.length || 0,
      totalRevenue,
      activeDrivers: driversRes.count || 0,
    });
  };

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVendors(data);
    }
  };

  const loadRelayPoints = async () => {
    const { data, error } = await supabase
      .from('relay_points')
      .select(`
        *,
        storage_capacities(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRelayPoints(data);
    }
  };

  const renderDashboard = () => (
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'hub':
        return <AdminHub />;
      case 'requests':
        return <AdminRequests />;
      case 'partners':
        return <AdminPartners />;
      case 'insights':
        return <AdminInsights />;
      case 'test-guide':
        return <AdminTestGuide />;
      case 'map':
        return <MapView vendors={vendors} relayPoints={relayPoints} center={mapCenter} zoom={11} />;
      case 'api-keys':
        return <APIKeysManager />;
      case 'whatsapp':
        return <WhatsAppManager />;
      case 'community-fund':
        return <CommunityFundAdmin />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="admin" currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
