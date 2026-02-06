import { useState, useEffect } from 'react';
import { MapPin, Search, ShoppingCart, Package, Star } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import EnhancedMap from '../components/Map/EnhancedMap';
import MapFilters from '../components/Map/MapFilters';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { OrderTracking } from '../components/OrderTracking';
import { UserProfile } from '../components/UserProfile';
import { ClientRequestForm } from '../components/ClientRequestForm';
import { MyRequests } from '../components/MyRequests';
import { CommunityFundPage } from './CommunityFundPage';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Product, RelayPoint, Location, Order } from '../types';

interface CustomerAppProps {
  initialDraftProducts?: any[];
}

export function CustomerApp({ initialDraftProducts }: CustomerAppProps = {}) {
  const { user } = useAuth();
  const { items } = useCart();
  const [currentView, setCurrentView] = useState('home');
  const [draftProducts] = useState(initialDraftProducts || []);
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
        () => {}
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
    <div className="pb-24">
      <div className="bg-primary rounded-b-[2rem] p-6 pb-8 shadow-elegant">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-primary-foreground tracking-tight">Bonjour !</h1>
            <p className="text-primary-foreground/70 text-sm font-medium">Que voulez-vous savourer aujourd'hui ?</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-primary-foreground text-primary p-3 rounded-2xl shadow-soft hover:scale-105 transition-transform"
          >
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {items.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un plat creole..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card text-foreground shadow-soft font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-elegant'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {category === 'all' ? 'Tout' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-8">
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase mb-6">Plats disponibles</h2>
        {loading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-[10px]">D</span>
              </div>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-medium">Aucun produit trouve</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-black text-foreground tracking-tight uppercase mb-6">Mes Commandes</h1>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderTracking key={order.id} orderId={order.id} onClose={() => {}} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground font-medium">Aucune commande pour le moment</p>
        </div>
      )}
    </div>
  );

  const [mapFilter, setMapFilter] = useState<'all' | 'open' | 'available' | 'closed'>('all');
  const [showDrivers, setShowDrivers] = useState(true);
  const [showZones, setShowZones] = useState(true);

  const renderMap = () => (
    <div className="pb-24">
      <div className="p-4">
        <h1 className="text-2xl font-black text-foreground tracking-tight uppercase mb-2">Carte Interactive</h1>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <MapPin className="w-4 h-4 text-primary" />
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
        <h2 className="text-lg font-black text-foreground tracking-tight uppercase mb-4">Points relais a proximite</h2>
        <div className="space-y-3">
          {relayPoints.slice(0, 5).map((point) => (
            <div key={point.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:border-primary/30 hover:shadow-soft transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{point.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{point.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      <span className="text-sm font-bold text-foreground">{point.rating.toFixed(1)}</span>
                    </div>
                    {point.distance && (
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{point.distance.toFixed(1)} km</span>
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

  const renderProfile = () => <UserProfile isOpen={true} onClose={() => setCurrentView('home')} />;

  const renderRequests = () => (
    <div className="p-4 pb-24 space-y-6">
      <div className="bg-foreground rounded-3xl p-8 border border-border/10">
        <h1 className="text-3xl font-black text-background tracking-tight uppercase mb-2">
          Service Conciergerie
        </h1>
        <p className="text-background/70 font-medium">
          <strong className="text-background">Delikreol</strong> &mdash; Livraison mutualisee & points relais en Martinique
        </p>
        <p className="text-background/50 mt-2 text-sm font-medium leading-relaxed">
          Commandez ce que vous voulez, ou vous voulez. Livraison a domicile ou retrait en point relais.
          Nous soutenons les commerces locaux avec une logistique transparente et efficace.
        </p>
      </div>

      <ClientRequestForm initialProducts={draftProducts} />
      <MyRequests />
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'requests':
        return renderRequests();
      case 'community-fund':
        return <CommunityFundPage />;
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
    <div className="min-h-screen bg-background">
      {renderView()}
      <Navigation userType="customer" currentView={currentView} onNavigate={setCurrentView} />
      {showCart && <Cart onClose={() => setShowCart(false)} />}
    </div>
  );
}

export default CustomerApp;
