import { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Product, Vendor, Order, RelayPoint } from '../types';

export function VendorApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    activeProducts: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorData();
  }, [user]);

  const loadVendorData = async () => {
    if (!user) return;

    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      await Promise.all([
        loadProducts(vendorData.id),
        loadOrders(vendorData.id),
        loadRelayPoints(vendorData),
      ]);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (vendorId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
      setStats((prev) => ({ ...prev, activeProducts: data.filter((p) => p.is_available).length }));
    }
  };

  const loadOrders = async (vendorId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('vendor_id', vendorId);

    if (!error && data) {
      const uniqueOrders = Array.from(
        new Map(data.map((item) => [item.order.id, item.order])).values()
      );
      setOrders(uniqueOrders);

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = uniqueOrders.filter((o) => o.created_at.startsWith(today));

      const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const avgOrderValue = uniqueOrders.length > 0 ? totalRevenue / uniqueOrders.length : 0;

      setStats((prev) => ({
        ...prev,
        totalRevenue,
        todayOrders: todayOrders.length,
        avgOrderValue,
      }));
    }
  };

  const loadRelayPoints = async (vendorData: Vendor) => {
    if (!vendorData.latitude || !vendorData.longitude) return;

    const { data, error } = await supabase
      .from('relay_points')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      setRelayPoints(data);
    }
  };

  const renderDashboard = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {vendor && (
          <p className="text-gray-600">{vendor.business_name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Revenu total</p>
          <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Commandes aujourd'hui</p>
          <p className="text-2xl font-bold">{stats.todayOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Produits actifs</p>
          <p className="text-2xl font-bold">{stats.activeProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Valeur moy.</p>
          <p className="text-2xl font-bold">{stats.avgOrderValue.toFixed(2)}€</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold text-lg mb-3">Commandes récentes</h2>
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium">{order.order_number}</p>
              <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{order.total_amount}€</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {vendor && vendor.latitude && vendor.longitude && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-lg mb-3">Points relais à proximité</h2>
          <MapView
            center={{ latitude: vendor.latitude, longitude: vendor.longitude }}
            relayPoints={relayPoints}
            vendors={[vendor]}
            zoom={12}
            className="h-64 rounded-lg"
          />
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes Produits</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <p className="font-bold text-lg text-green-600">{product.price}€</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                    {product.stock_quantity !== null && (
                      <span className="text-xs text-gray-600">Stock: {product.stock_quantity}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucun produit pour le moment</p>
          <p className="text-sm">Commencez par ajouter vos premiers plats</p>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type de livraison:</span>
                  <span className="font-medium capitalize">{order.delivery_type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Montant total:</span>
                  <span className="font-bold text-lg">{order.total_amount}€</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucune commande pour le moment
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Statistiques</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <h2 className="font-bold text-lg mb-4">Performance</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Revenu total</span>
              <span className="font-bold text-green-600">{stats.totalRevenue.toFixed(2)}€</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Commandes traitées</span>
              <span className="font-bold">{orders.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(orders.length * 10, 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Produits actifs</span>
              <span className="font-bold">{stats.activeProducts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min(stats.activeProducts * 20, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-lg mb-4">Meilleurs produits</h2>
        <p className="text-sm text-gray-500">Fonctionnalité à venir...</p>
      </div>
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'stats':
        return renderStats();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="vendor" currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
