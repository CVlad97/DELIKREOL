import { useState, useEffect } from 'react';
import { MapPin, Search, ShoppingCart, Filter, FileText } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import EnhancedMap from '../components/Map/EnhancedMap';
import MapFilters from '../components/Map/MapFilters';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { OrderTracking } from '../components/OrderTracking';
import { UserProfile } from '../components/UserProfile';
import { ClientRequestForm } from '../components/ClientRequestForm';
import { MyRequests } from '../components/MyRequests';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Product, RelayPoint, Location, Order } from '../types';

export function CustomerApp() {
  const { user } = useAuth();
  const { items } = useCart();
  const [currentView, setCurrentView] = useState('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userLocation, setUserLocation] = useState<Location>({
    latitude: 14.6415,
    longitude: -61.0242,
    address: 'Fort-de-France, Martinique',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    loadProducts();
    loadRelayPoints();
    loadOrders();
  }, []);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.log('Using default location');
        }
      );
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('is_available', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelayPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('relay_points')
        .select(`
          *,
          storage_capacities(*)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const pointsWithDistance = (data || []).map((point) => ({
        ...point,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          point.latitude,
          point.longitude
        ),
      }));

      pointsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setRelayPoints(pointsWithDistance);
    } catch (error) {
      console.error('Error loading relay points:', error);
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          delivery:deliveries(
            *,
            driver:drivers(*)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const renderHome = () => (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Bonjour! 👋</h1>
            <p className="text-orange-100">Que voulez-vous manger aujourd'hui?</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-white text-orange-600 p-3 rounded-full shadow-lg"
          >
            <ShoppingCart className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un plat créole..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full text-gray-900 shadow-lg"
          />
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Tout' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold mb-4">Plats disponibles</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucun produit trouvé
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Mes Commandes</h1>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderTracking key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Aucune commande pour le moment
        </div>
      )}
    </div>
  );

  const [mapFilter, setMapFilter] = useState<'all' | 'open' | 'available' | 'closed'>('all');
  const [showDrivers, setShowDrivers] = useState(true);
  const [showZones, setShowZones] = useState(true);

  const renderMap = () => (
    <div className="pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Carte Interactive Delikreol</h1>
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{relayPoints.length} points relais disponibles</span>
        </div>
      </div>

      <div className="px-4 mb-4">
        <MapFilters
          currentFilter={mapFilter}
          onFilterChange={setMapFilter}
          showDrivers={showDrivers}
          onToggleDrivers={() => setShowDrivers(!showDrivers)}
          showZones={showZones}
          onToggleZones={() => setShowZones(!showZones)}
        />
      </div>

      <div className="px-4">
        <EnhancedMap
          filter={mapFilter}
          showDrivers={showDrivers}
          showZones={showZones}
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={12}
        />
      </div>

      <div className="p-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Points relais à proximité</h2>
        <div className="space-y-3">
          {relayPoints.slice(0, 5).map((point) => (
            <div key={point.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{point.name}</h3>
                  <p className="text-sm text-gray-600">{point.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{point.rating.toFixed(1)}</span>
                    {point.distance && (
                      <span className="text-sm text-gray-500">• {point.distance.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => <UserProfile />;

  const renderRequests = () => (
    <div className="p-4 pb-20 space-y-6 bg-slate-950">
      <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">
          Service Conciergerie
        </h1>
        <p className="text-slate-300">
          💡 <strong>Delikreol</strong> — Livraison mutualisée & points relais en Martinique
        </p>
        <p className="text-slate-400 mt-2 text-sm">
          Commandez ce que vous voulez, où vous voulez. Livraison à domicile ou retrait en point relais.
          Nous soutenons les commerces locaux avec une logistique transparente et efficace.
        </p>
      </div>

      <ClientRequestForm />
      <MyRequests />
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'requests':
        return renderRequests();
      case 'orders':
        return renderOrders();
      case 'map':
        return renderMap();
      case 'profile':
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="customer" currentView={currentView} onNavigate={setCurrentView} />
      {showCart && <Cart onClose={() => setShowCart(false)} />}
    </div>
  );
}
