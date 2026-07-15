import { useState, useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate, ChefHat, Package, Truck, Store, Navigation, CheckCircle, Crosshair } from 'lucide-react';
import { traiteurSpaces } from '../data/traiteurs';
import { driverReferences } from '../data/driverReferences';
import { calculateDistanceKm, getGoogleMapsLink, getWazeLink } from '../services/geolocation';
import { Layout } from '../components/layout/Layout';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MARTINIQUE_CENTER: [number, number] = [14.641, -61.014];

type FilterType = 'traiteurs' | 'relais' | 'livreurs';

interface MapPoint {
  id: string;
  name: string;
  type: FilterType;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  status?: string;
  image?: string;
}

const traiteurIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const relayIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448653.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3208/3208672.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function getIcon(type: FilterType) {
  switch(type) {
    case 'traiteurs': return traiteurIcon;
    case 'relais': return relayIcon;
    case 'livreurs': return driverIcon;
  }
}

export function DiscoveryMapPage() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MARTINIQUE_CENTER);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set(['traiteurs']));
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [positionValidated, setPositionValidated] = useState(false);

  // Build map points from data
  const allPoints = useMemo<MapPoint[]>(() => {
    const points: MapPoint[] = [];

    // Traiteurs with lat/lng
    traiteurSpaces.filter(t => t.latitude && t.longitude).forEach(t => {
      points.push({
        id: `traiteur-${t.slug}`,
        name: t.name,
        type: 'traiteurs',
        lat: t.latitude!,
        lng: t.longitude!,
        address: t.zone || t.commune,
        status: t.status === 'public confirmé' ? '✅ Partenaire' : '⏳ En cours',
        image: t.portraitImage || undefined,
      });
    });

    // Sample relay points (from communes)
    const communes = ['Fort-de-France', 'Rivière-Pilote', 'Dillon', 'Cluny', 'Le Lamentin', 'Schœlcher'];
    communes.forEach((c, i) => {
      points.push({
        id: `relais-${i}`,
        name: `Point relais ${c}`,
        type: 'relais',
        lat: 14.61 + Math.random() * 0.05,
        lng: -61.05 + Math.random() * 0.05,
        address: c,
        status: '🟢 Ouvert',
      });
    });

    // Livreurs from driverReferences
    driverReferences.filter(d => d.disponible).forEach((d, i) => {
      const lat = 14.62 + Math.random() * 0.06;
      const lng = -61.02 + Math.random() * 0.06;
      points.push({
        id: `driver-${i}`,
        name: d.name,
        type: 'livreurs',
        lat,
        lng,
        address: d.zone,
        phone: d.contact,
        status: '🟢 Disponible',
      });
    });

    return points;
  }, []);

  const filteredPoints = useMemo(() => 
    allPoints.filter(p => activeFilters.has(p.type)),
    [allPoints, activeFilters]
  );

  const requestPosition = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const posData = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(posData);
        setMapCenter([posData.lat, posData.lng]);
        setPositionValidated(true);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const toggleFilter = (f: FilterType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const DISTANCE_COLORS = ['hsl(var(--primary))', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  const FILTERS: { key: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'traiteurs', label: 'Traiteurs', icon: ChefHat, count: allPoints.filter(p => p.type === 'traiteurs').length },
    { key: 'relais', label: 'Points relais', icon: Package, count: allPoints.filter(p => p.type === 'relais').length },
    { key: 'livreurs', label: 'Livreurs', icon: Truck, count: allPoints.filter(p => p.type === 'livreurs').length },
  ];

  return (
    <Layout title="Carte interactive">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">📍 Carte interactive</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {positionValidated 
                ? 'Position validée — tri par distance activé' 
                : 'Trouvez traiteurs, points relais et livreurs près de chez vous'}
            </p>
          </div>
          <button
            onClick={requestPosition}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              positionValidated
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-primary text-primary-foreground hover:shadow-warm'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            {positionValidated ? '✅ Position validée' : 'Valider ma position'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeFilters.has(key)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilters.has(key) ? 'bg-white/20' : 'bg-muted'
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border shadow-soft h-[500px] lg:h-[600px]">
            <LeafletMap center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              {userPos && (
                <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600">✅ Ma position</p>
                      <p className="text-xs text-muted-foreground">Validée</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {filteredPoints.map(p => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={getIcon(p.type)}
                  eventHandlers={{ click: () => setSelectedPoint(p) }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        {p.type === 'traiteurs' && <ChefHat className="w-4 h-4 text-orange-500" />}
                        {p.type === 'relais' && <Package className="w-4 h-4 text-blue-500" />}
                        {p.type === 'livreurs' && <Truck className="w-4 h-4 text-green-500" />}
                        <h3 className="font-bold">{p.name}</h3>
                      </div>
                      {p.address && <p className="text-sm text-muted-foreground">{p.address}</p>}
                      {p.phone && <a href={`https://wa.me/${p.phone.replace(/\D/g,'')}`} className="block text-sm text-green-600 hover:underline mt-1" target="_blank">📱 {p.phone}</a>}
                      {p.status && <p className="text-xs mt-2">{p.status}</p>}
                      {userPos && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: p.lat, longitude: p.lng }).toFixed(1)} km
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <a href={getWazeLink({ latitude: p.lat, longitude: p.lng })} target="_blank" className="text-xs px-2 py-1 bg-black/5 rounded-lg hover:bg-black/10">Waze</a>
                        <a href={getGoogleMapsLink({ latitude: p.lat, longitude: p.lng })} target="_blank" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Google</a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LeafletMap>
          </div>

          {/* Sidebar list */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b border-border bg-muted/20 sticky top-0">
              <h3 className="font-bold text-sm">
                {filteredPoints.length} résultat{filteredPoints.length > 1 ? 's' : ''}
                {userPos ? ' — triés par distance' : ''}
              </h3>
            </div>
            {filteredPoints.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <LeafletMap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun résultat</p>
                <p className="text-xs mt-1">Active un filtre ci-dessus</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredPoints
                  .sort((a, b) => {
                    if (!userPos) return 0;
                    const dA = calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: a.lat, longitude: a.lng });
                    const dB = calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: b.lat, longitude: b.lng });
                    return dA - dB;
                  })
                  .slice(0, 30)
                  .map((p) => {
                    const dist = userPos ? calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: p.lat, longitude: p.lng }) : null;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setMapCenter([p.lat, p.lng])}
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          p.type === 'traiteurs' ? 'bg-orange-100' : p.type === 'relais' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {p.type === 'traiteurs' ? '🍽️' : p.type === 'relais' ? '📦' : '🚚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.address || p.phone || ''}</p>
                        </div>
                        <div className="text-right">
                          {dist !== null && (
                            <span className="text-xs font-bold" style={{ color: DISTANCE_COLORS[Math.min(Math.floor(dist / 2), 4)] }}>
                              {dist.toFixed(1)} km
                            </span>
                          )}
                          {p.status && <p className="text-[10px] text-muted-foreground">{p.status === 'Disponible' ? '🟢' : ''}</p>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}