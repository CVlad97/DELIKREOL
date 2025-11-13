import { useState, useEffect } from 'react';
import { Navigation, MapPin, DollarSign, Clock, Package } from 'lucide-react';
import { Navigation as NavBar } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { QRScanner } from '../components/QRScanner';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Driver, Delivery, Location } from '../types';

export function DriverApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('available');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<Delivery[]>([]);
  const [driverLocation, setDriverLocation] = useState<Location>({
    latitude: 14.6415,
    longitude: -61.0242,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    totalEarnings: 0,
    avgDeliveryTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
    startLocationTracking();
  }, [user]);

  useEffect(() => {
    if (isAvailable) {
      const interval = setInterval(loadAvailableDeliveries, 10000);
      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setDriverLocation(newLocation);

          if (driver) {
            supabase
              .from('drivers')
              .update({
                current_latitude: newLocation.latitude,
                current_longitude: newLocation.longitude,
              })
              .eq('id', driver.id);
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  };

  const loadDriverData = async () => {
    if (!user) return;

    try {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (driverError) throw driverError;
      setDriver(driverData);
      setIsAvailable(driverData.is_available);

      await Promise.all([
        loadAvailableDeliveries(),
        loadActiveDelivery(driverData.id),
        loadDeliveryHistory(driverData.id),
      ]);
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDeliveries = async () => {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('status', 'pending')
      .is('driver_id', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailableDeliveries(data);
    }
  };

  const loadActiveDelivery = async (driverId: string) => {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('driver_id', driverId)
      .in('status', ['assigned', 'picked_up', 'in_transit'])
      .single();

    if (!error && data) {
      setActiveDelivery(data);
    }
  };

  const loadDeliveryHistory = async (driverId: string) => {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('driver_id', driverId)
      .eq('status', 'delivered')
      .order('delivered_at', { ascending: false });

    if (!error && data) {
      setDeliveryHistory(data);

      const today = new Date().toISOString().split('T')[0];
      const todayDeliveries = data.filter((d) => d.delivered_at?.startsWith(today));
      const todayEarnings = todayDeliveries.reduce((sum, d) => sum + parseFloat(d.driver_fee), 0);
      const totalEarnings = data.reduce((sum, d) => sum + parseFloat(d.driver_fee), 0);

      setStats({
        todayDeliveries: todayDeliveries.length,
        todayEarnings,
        totalEarnings,
        avgDeliveryTime: 0,
      });
    }
  };

  const toggleAvailability = async () => {
    if (!driver) return;

    const newStatus = !isAvailable;
    const { error } = await supabase
      .from('drivers')
      .update({ is_available: newStatus })
      .eq('id', driver.id);

    if (!error) {
      setIsAvailable(newStatus);
      if (newStatus) {
        loadAvailableDeliveries();
      }
    }
  };

  const acceptDelivery = async (deliveryId: string) => {
    if (!driver) return;

    const { error } = await supabase
      .from('deliveries')
      .update({
        driver_id: driver.id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    if (!error) {
      loadDriverData();
      setCurrentView('active');
    }
  };

  const updateDeliveryStatus = async (status: string) => {
    if (!activeDelivery) return;

    const updates: any = { status };

    if (status === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', activeDelivery.id);

    if (!error) {
      loadDriverData();
      if (status === 'delivered') {
        setCurrentView('history');
      }
    }
  };

  const handleQRScan = async (qrData: string) => {
    setShowScanner(false);
    alert('QR Code scanné: ' + qrData);
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

  const renderAvailable = () => (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Courses disponibles</h1>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {isAvailable ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Package className="w-6 h-6 text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Aujourd'hui</p>
            <p className="text-lg font-bold">{stats.todayDeliveries}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Gains jour</p>
            <p className="text-lg font-bold">{stats.todayEarnings.toFixed(2)}€</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 mb-1" />
            <p className="text-xs text-gray-600">Note</p>
            <p className="text-lg font-bold">⭐ {driver?.rating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {!isAvailable ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="mb-2">Vous êtes hors ligne</p>
          <p className="text-sm">Activez votre disponibilité pour voir les courses</p>
        </div>
      ) : availableDeliveries.length > 0 ? (
        <div className="space-y-3">
          {availableDeliveries.map((delivery) => {
            const distance = calculateDistance(
              driverLocation.latitude,
              driverLocation.longitude,
              delivery.pickup_latitude || 0,
              delivery.pickup_longitude || 0
            );

            return (
              <div key={delivery.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold">{delivery.order?.order_number}</p>
                    <p className="text-sm text-gray-600">{delivery.pickup_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">{delivery.driver_fee}€</p>
                    <p className="text-xs text-gray-500">{distance.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>~{delivery.estimated_time} min</span>
                </div>

                <button
                  onClick={() => acceptDelivery(delivery.id)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
                >
                  Accepter la course
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune course disponible pour le moment</p>
          <p className="text-sm">Patientez, de nouvelles courses arrivent...</p>
        </div>
      )}
    </div>
  );

  const renderActive = () => {
    if (!activeDelivery) {
      return (
        <div className="p-4 pb-20">
          <h1 className="text-2xl font-bold mb-6">Course en cours</h1>
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune course en cours</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Course en cours</h1>
          <p className="text-purple-100">{activeDelivery.order?.order_number}</p>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activeDelivery.status === 'assigned' ? 'bg-blue-100' :
                  activeDelivery.status === 'picked_up' ? 'bg-orange-100' :
                  'bg-green-100'
                }`}>
                  <Package className={`w-6 h-6 ${
                    activeDelivery.status === 'assigned' ? 'text-blue-600' :
                    activeDelivery.status === 'picked_up' ? 'text-orange-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="font-bold text-lg capitalize">{activeDelivery.status.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">~{activeDelivery.estimated_time} min</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{activeDelivery.driver_fee}€</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Point de retrait</p>
                  <p className="text-sm">{activeDelivery.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Livraison</p>
                  <p className="text-sm">{activeDelivery.order?.delivery_address}</p>
                </div>
              </div>
            </div>
          </div>

          {activeDelivery.pickup_latitude && activeDelivery.pickup_longitude && (
            <div className="mb-4">
              <MapView
                center={{ latitude: activeDelivery.pickup_latitude, longitude: activeDelivery.pickup_longitude }}
                userLocation={driverLocation}
                zoom={14}
                className="h-64 rounded-xl shadow"
              />
            </div>
          )}

          <div className="space-y-3">
            {activeDelivery.status === 'assigned' && (
              <>
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.pickup_latitude},${activeDelivery.pickup_longitude}`,
                      '_blank'
                    );
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Navigation vers le retrait
                </button>
                <button
                  onClick={() => updateDeliveryStatus('picked_up')}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium"
                >
                  Confirmer le retrait
                </button>
              </>
            )}

            {activeDelivery.status === 'picked_up' && (
              <>
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.order?.delivery_latitude},${activeDelivery.order?.delivery_longitude}`,
                      '_blank'
                    );
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Navigation vers le client
                </button>
                <button
                  onClick={() => updateDeliveryStatus('in_transit')}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium"
                >
                  En route
                </button>
              </>
            )}

            {activeDelivery.status === 'in_transit' && (
              <button
                onClick={() => updateDeliveryStatus('delivered')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
              >
                Livraison terminée
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Historique</h1>

      {deliveryHistory.length > 0 ? (
        <div className="space-y-3">
          {deliveryHistory.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold">{delivery.order?.order_number}</p>
                  <p className="text-sm text-gray-600">
                    {delivery.delivered_at && new Date(delivery.delivered_at).toLocaleString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">{delivery.driver_fee}€</p>
              </div>
              <p className="text-sm text-gray-600">{delivery.pickup_address}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucune livraison pour le moment</p>
        </div>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Gains</h1>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <p className="text-sm opacity-90 mb-2">Total des gains</p>
        <p className="text-4xl font-bold mb-4">{stats.totalEarnings.toFixed(2)}€</p>
        <p className="text-sm opacity-90">
          {driver?.total_deliveries || 0} livraisons effectuées
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
          <p className="text-2xl font-bold text-green-600">{stats.todayEarnings.toFixed(2)}€</p>
          <p className="text-xs text-gray-500">{stats.todayDeliveries} livraisons</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
          <p className="text-2xl font-bold">⭐ {driver?.rating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Sur 5.0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3">Statistiques</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total livraisons:</span>
            <span className="font-medium">{driver?.total_deliveries || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Gains moyens:</span>
            <span className="font-medium">
              {driver?.total_deliveries ? (stats.totalEarnings / driver.total_deliveries).toFixed(2) : '0.00'}€
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Véhicule:</span>
            <span className="font-medium capitalize">{driver?.vehicle_type}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'available':
        return renderAvailable();
      case 'active':
        return renderActive();
      case 'history':
        return renderHistory();
      case 'earnings':
        return renderEarnings();
      default:
        return renderAvailable();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <NavBar userType="driver" currentView={currentView} onNavigate={setCurrentView} />
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
