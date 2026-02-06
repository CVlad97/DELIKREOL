import { useState, useEffect } from 'react';
import { Navigation, MapPin, DollarSign, Clock, Package, Star, Truck } from 'lucide-react';
import { Navigation as NavBar } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { QRScanner } from '../components/QRScanner';
import { ProDashboard } from './ProDashboard';
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
    alert('QR Code scanne: ' + qrData);
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
    <div className="p-4 pb-24">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Courses disponibles</h1>
          <button
            onClick={toggleAvailability}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
              isAvailable
                ? 'bg-accent text-accent-foreground shadow-elegant'
                : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            {isAvailable ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-primary/[0.06] border border-primary/10 p-4 rounded-2xl">
            <Package className="w-5 h-5 text-primary mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aujourd'hui</p>
            <p className="text-xl font-black text-foreground tracking-tighter">{stats.todayDeliveries}</p>
          </div>
          <div className="bg-accent/[0.06] border border-accent/10 p-4 rounded-2xl">
            <DollarSign className="w-5 h-5 text-accent mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gains jour</p>
            <p className="text-xl font-black text-foreground tracking-tighter">{stats.todayEarnings.toFixed(2)} EUR</p>
          </div>
          <div className="bg-secondary/[0.06] border border-secondary/10 p-4 rounded-2xl">
            <Star className="w-5 h-5 text-secondary mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Note</p>
            <p className="text-xl font-black text-foreground tracking-tighter">{driver?.rating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {!isAvailable ? (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="font-bold text-foreground">Vous etes hors ligne</p>
          <p className="text-sm text-muted-foreground">Activez votre disponibilite pour voir les courses</p>
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
              <div key={delivery.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:border-primary/30 hover:shadow-soft transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{delivery.order?.order_number}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{delivery.pickup_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-accent text-lg tracking-tighter">{delivery.driver_fee} EUR</p>
                    <p className="text-xs text-muted-foreground font-bold">{distance.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">~{delivery.estimated_time} min</span>
                </div>

                <button
                  onClick={() => acceptDelivery(delivery.id)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-elegant transition-all active:scale-[0.98]"
                >
                  Accepter la course
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="font-bold text-foreground">Aucune course disponible</p>
          <p className="text-sm text-muted-foreground">Patientez, de nouvelles courses arrivent...</p>
        </div>
      )}
    </div>
  );

  const renderActive = () => {
    if (!activeDelivery) {
      return (
        <div className="p-4 pb-24">
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase mb-6">Course en cours</h1>
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">Aucune course en cours</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <div className="bg-primary p-6 rounded-b-[2rem]">
          <h1 className="text-2xl font-black text-primary-foreground tracking-tight uppercase mb-1">Course en cours</h1>
          <p className="text-primary-foreground/70 font-medium">{activeDelivery.order?.order_number}</p>
        </div>

        <div className="p-4">
          <div className="bg-card rounded-2xl border border-border/50 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  activeDelivery.status === 'assigned' ? 'bg-primary/10' :
                  activeDelivery.status === 'picked_up' ? 'bg-secondary/10' :
                  'bg-accent/10'
                }`}>
                  <Package className={`w-6 h-6 ${
                    activeDelivery.status === 'assigned' ? 'text-primary' :
                    activeDelivery.status === 'picked_up' ? 'text-secondary' :
                    'text-accent'
                  }`} />
                </div>
                <div>
                  <p className="font-black text-foreground text-lg capitalize tracking-tight">{activeDelivery.status.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground font-medium">~{activeDelivery.estimated_time} min</p>
                </div>
              </div>
              <p className="text-2xl font-black text-accent tracking-tighter">{activeDelivery.driver_fee} EUR</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Point de retrait</p>
                  <p className="text-sm font-medium text-foreground">{activeDelivery.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Livraison</p>
                  <p className="text-sm font-medium text-foreground">{activeDelivery.order?.delivery_address}</p>
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
                className="h-64 rounded-2xl shadow-soft"
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
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-elegant transition-all"
                >
                  <Navigation className="w-5 h-5" />
                  Navigation vers le retrait
                </button>
                <button
                  onClick={() => updateDeliveryStatus('picked_up')}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-elegant transition-all"
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
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-elegant transition-all"
                >
                  <Navigation className="w-5 h-5" />
                  Navigation vers le client
                </button>
                <button
                  onClick={() => updateDeliveryStatus('in_transit')}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-elegant transition-all"
                >
                  En route
                </button>
              </>
            )}

            {activeDelivery.status === 'in_transit' && (
              <button
                onClick={() => updateDeliveryStatus('delivered')}
                className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-elegant transition-all"
              >
                Livraison terminee
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-black text-foreground tracking-tight uppercase mb-6">Historique</h1>

      {deliveryHistory.length > 0 ? (
        <div className="space-y-3">
          {deliveryHistory.map((delivery) => (
            <div key={delivery.id} className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-soft transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-foreground">{delivery.order?.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {delivery.delivered_at && new Date(delivery.delivered_at).toLocaleString()}
                  </p>
                </div>
                <p className="font-black text-accent tracking-tighter">{delivery.driver_fee} EUR</p>
              </div>
              <p className="text-sm text-muted-foreground">{delivery.pickup_address}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">Aucune livraison pour le moment</p>
        </div>
      )}
    </div>
  );

  const renderEarnings = () => (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-black text-foreground tracking-tight uppercase mb-6">Gains</h1>

      <div className="bg-foreground text-background p-8 rounded-3xl shadow-elegant mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[60px]" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-background/50 mb-2">Total des gains</p>
          <p className="text-5xl font-black tracking-tighter mb-4">{stats.totalEarnings.toFixed(2)} EUR</p>
          <p className="text-sm font-medium text-background/60">
            {driver?.total_deliveries || 0} livraisons effectuees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-5 rounded-2xl border border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Aujourd'hui</p>
          <p className="text-2xl font-black text-accent tracking-tighter">{stats.todayEarnings.toFixed(2)} EUR</p>
          <p className="text-xs text-muted-foreground font-medium">{stats.todayDeliveries} livraisons</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Note moyenne</p>
          <p className="text-2xl font-black text-foreground tracking-tighter">{driver?.rating.toFixed(1)}/5</p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className={`w-3 h-3 ${n <= Math.round(driver?.rating || 0) ? 'text-secondary fill-secondary' : 'text-border'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <h2 className="font-black text-foreground uppercase tracking-tight text-lg mb-4">Statistiques</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground font-medium">Total livraisons</span>
            <span className="font-bold text-foreground">{driver?.total_deliveries || 0}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground font-medium">Gains moyens</span>
            <span className="font-bold text-foreground">
              {driver?.total_deliveries ? (stats.totalEarnings / driver.total_deliveries).toFixed(2) : '0.00'} EUR
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-muted-foreground font-medium">Vehicule</span>
            <span className="font-bold text-foreground capitalize">{driver?.vehicle_type}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-[10px]">D</span>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <ProDashboard onNavigate={setCurrentView} />;
      case 'available':
        return renderAvailable();
      case 'active':
        return renderActive();
      case 'history':
        return renderHistory();
      case 'earnings':
        return renderEarnings();
      default:
        return <ProDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderView()}
      <NavBar userType="driver" currentView={currentView} onNavigate={setCurrentView} />
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}

export default DriverApp;
