import { useState, useEffect, useRef } from 'react';
import { MapPin, Locate, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { calculateDistanceKm, getGoogleMapsLink, getWazeLink } from '../services/geolocation';
import { resolveTraiteurCoords } from '../services/partnerGeo';
import { traiteurSpaces } from '../data/traiteurs';
import { mockProducts } from '../data/mockCatalog';

interface MapPartner {
  id: string;
  name: string;
  type: 'traiteur' | 'relais' | 'livreur' | 'client';
  latitude: number;
  longitude: number;
  commune: string;
  status?: string;
  color: string;
}

const COLORS = {
  traiteur: { marker: 'hsl(var(--primary))', bg: 'bg-primary/15', text: 'text-primary', icon: '🧑‍🍳' },
  relais: { marker: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700', icon: '📦' },
  livreur: { marker: '#22c55e', bg: 'bg-green-100', text: 'text-green-700', icon: '🛵' },
  client: { marker: '#8b5cf6', bg: 'bg-purple-100', text: 'text-purple-700', icon: '📍' },
};

export default function ExpandableGeoMap() {
  const [expanded, setExpanded] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [partners, setPartners] = useState<MapPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<MapPartner | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Construire les partenaires avec coordonnées
  useEffect(() => {
    const list: MapPartner[] = [];

    // Traiteurs
    traiteurSpaces.forEach(t => {
      const coords = resolveTraiteurCoords(t.zone, t.commune);
      if (coords) {
        list.push({
          id: t.slug,
          name: t.name,
          type: 'traiteur',
          latitude: coords.latitude,
          longitude: coords.longitude,
          commune: t.commune || t.zone || '',
          status: t.status,
          color: COLORS.traiteur.marker,
        });
      }
    });

    setPartners(list);
  }, []);

  const handleGeoRequest = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        setExpanded(true);
      },
      () => { setGeoLoading(false); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const distFromUser = (p: MapPartner) => {
    if (!userPosition) return null;
    return calculateDistanceKm(
      { latitude: userPosition.lat, longitude: userPosition.lng },
      { latitude: p.latitude, longitude: p.longitude }
    );
  };

  const sortedPartners = [...partners].sort((a, b) => {
    const dA = distFromUser(a) ?? 999;
    const dB = distFromUser(b) ?? 999;
    return dA - dB;
  });

  // Initialisation Leaflet au déploiement
  useEffect(() => {
    if (!expanded || !mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([14.641, -61.014], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Marqueurs colorés par type
      const allPoints = [...partners];
      if (userPosition) {
        allPoints.push({
          id: 'vous',
          name: 'Vous êtes ici',
          type: 'client',
          latitude: userPosition.lat,
          longitude: userPosition.lng,
          commune: '',
          color: COLORS.client.marker,
        });
      }

      allPoints.forEach(p => {
        const color = COLORS[p.type]?.marker || 'hsl(var(--primary))';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${COLORS[p.type]?.icon || '📍'}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px">
            <p style="font-weight:bold;margin:0 0 4px;font-size:14px">${p.name}</p>
            <p style="margin:0 0 2px;font-size:12px;color:#666">${p.type === 'traiteur' ? '🧑‍🍳 Traiteur' : p.type === 'relais' ? '📦 Point relais' : p.type === 'client' ? '📍 Vous' : '🛵 Livreur'}</p>
            ${p.commune ? `<p style="margin:0;font-size:12px;color:#666">📍 ${p.commune}</p>` : ''}
            ${userPosition ? `<p style="margin:4px 0 0;font-size:12px;color:hsl(var(--primary));font-weight:bold">${distFromUser(p)?.toFixed(1)} km</p>` : ''}
            ${p.type !== 'client' ? `<a href="${getGoogleMapsLink({ latitude: p.latitude, longitude: p.longitude })}" target="_blank" style="display:inline-block;margin-top:6px;padding:4px 10px;background:#4285F4;color:white;border-radius:6px;text-decoration:none;font-size:11px">🗺️ Google Maps</a>` : ''}
          </div>
        `);

        marker.on('click', () => setSelectedPartner(p));
      });

      // Ajuster le zoom pour voir tout
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      mapInstance.current = map;
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [expanded, partners, userPosition]);

  return (
    <div className="bg-white rounded-2xl border border-primary/20 overflow-hidden shadow-sm transition-all duration-300">
      {/* Header toujours visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/8 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Géolocalisation</h3>
            <p className="text-xs text-gray-500">
              {userPosition
                ? `${partners.length} partenaires autour de vous`
                : 'Activez votre position pour voir les traiteurs près de chez vous'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!userPosition && !geoLoading && (
            <button
              onClick={(e) => { e.stopPropagation(); handleGeoRequest(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Locate className="w-3 h-3" />
              Me localiser
            </button>
          )}
          {geoLoading && (
            <span className="text-xs text-gray-400 animate-pulse">Localisation...</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Légende des couleurs */}
      {expanded && (
        <div className="px-4 pb-2 flex flex-wrap gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS.traiteur.marker }} /> Traiteurs</span>
          {userPosition && <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS.client.marker }} /> Vous</span>}
          <span className="text-xs text-gray-400 ml-auto">{partners.length} partenaires • {userPosition ? 'Triés par distance' : 'Tous les traiteurs'}</span>
        </div>
      )}

      {/* Carte Leaflet */}
      {expanded && (
        <div ref={mapRef} className="w-full h-[400px] md:h-[500px] bg-gray-100" />
      )}

      {/* Liste des partenaires */}
      {expanded && (
        <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
          {sortedPartners.map((p) => {
            const dist = distFromUser(p);
            const color = COLORS[p.type];
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPartner(p)}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedPartner?.id === p.id ? 'bg-primary/8' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${color.bg}`}>
                  {color.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.commune}</p>
                </div>
                <div className="text-right">
                  {dist !== null ? (
                    <span className="text-xs font-bold text-primary">{dist.toFixed(1)} km</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
                <a
                  href={getGoogleMapsLink({ latitude: p.latitude, longitude: p.longitude })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  title="Google Maps"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}