import { useState, useEffect } from 'react';
import { Users, Store, MapPin, Truck, TrendingUp, DollarSign } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { supabase } from '../lib/supabase';
import { Vendor, RelayPoint, Location } from '../types';

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
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Vue d'ensemble</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Utilisateurs</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
          <Store className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Vendeurs</p>
          <p className="text-2xl font-bold">{stats.totalVendors}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
          <MapPin className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Points Relais</p>
          <p className="text-2xl font-bold">{stats.totalRelayPoints}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
          <Truck className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Livreurs actifs</p>
          <p className="text-2xl font-bold">{stats.activeDrivers}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Revenu total</p>
            <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
          </div>
          <DollarSign className="w-12 h-12 opacity-80" />
        </div>
        <div className="mt-4 pt-4 border-t border-green-400">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Commandes totales:</span>
            <span className="font-bold">{stats.totalOrders}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="opacity-90">Valeur moyenne:</span>
            <span className="font-bold">
              {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}€
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3">Carte de la plateforme</h2>
        <MapView
          center={mapCenter}
          vendors={vendors.filter((v) => v.latitude && v.longitude)}
          relayPoints={relayPoints}
          zoom={11}
          className="h-64 rounded-lg"
        />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Utilisateurs</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500">Gestion des utilisateurs à venir...</p>
      </div>
    </div>
  );

  const renderVendors = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Vendeurs</h1>

      {vendors.length > 0 ? (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{vendor.business_name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{vendor.business_type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendor.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{vendor.address}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <span className="text-sm text-gray-600">Commission: {vendor.commission_rate}%</span>
                <span className="text-sm text-gray-600">Rayon: {vendor.delivery_radius_km} km</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucun vendeur pour le moment
        </div>
      )}
    </div>
  );

  const renderRelayPoints = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Points Relais</h1>

      {relayPoints.length > 0 ? (
        <div className="space-y-3">
          {relayPoints.map((point) => (
            <div key={point.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{point.name}</h3>
                  <p className="text-sm text-gray-600">{point.address}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  point.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {point.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{point.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">• {point.total_pickups} retraits</span>
              </div>

              {point.storage_capacities && point.storage_capacities.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-600 mb-1">Capacités:</p>
                  <div className="flex gap-2">
                    {point.storage_capacities.map((cap) => (
                      <span key={cap.id} className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                        {cap.storage_type}: {cap.current_usage}/{cap.total_capacity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucun point relais pour le moment
        </div>
      )}
    </div>
  );

  const renderDeliveries = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Livraisons</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500">Gestion des livraisons à venir...</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-4">Performance globale</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Croissance utilisateurs</span>
              <span className="font-bold text-green-600">+{stats.totalUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Taux de conversion</span>
              <span className="font-bold">--</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Satisfaction client</span>
              <span className="font-bold">--</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3">Zones actives</h2>
        <MapView
          center={mapCenter}
          vendors={vendors.filter((v) => v.latitude && v.longitude)}
          relayPoints={relayPoints}
          zoom={11}
          className="h-80 rounded-lg"
        />
      </div>
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'vendors':
        return renderVendors();
      case 'relay-points':
        return renderRelayPoints();
      case 'deliveries':
        return renderDeliveries();
      case 'analytics':
        return renderAnalytics();
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
