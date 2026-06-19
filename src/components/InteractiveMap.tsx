import { useState, useEffect, useCallback } from 'react';
import { MapPin, Locate, ChevronDown, Navigation } from 'lucide-react';
import { calculateDistanceKm, getGoogleMapsLink, getWazeLink } from '../services/geolocation';
import { martiniqueCommunes } from '../data/martiniqueCommunes';

interface MapPoint {
  name: string;
  type: 'partner' | 'relay' | 'client';
  latitude: number;
  longitude: number;
  address?: string;
  status?: string;
}

interface InteractiveMapProps {
  points: MapPoint[];
  clientCoords?: { latitude: number; longitude: number } | null;
  onSelectPoint?: (point: MapPoint) => void;
  compact?: boolean;
}

const MARTINIQUE_CENTER = { lat: 14.641, lng: -61.014 };

export function InteractiveMap({ points, clientCoords, onSelectPoint, compact }: InteractiveMapProps) {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [showList, setShowList] = useState(false);
  const [sortedPoints, setSortedPoints] = useState<MapPoint[]>(points);

  useEffect(() => {
    if (userPosition) {
      setSortedPoints([...points].sort((a, b) => {
        const dA = calculateDistanceKm(userPosition, { latitude: a.latitude, longitude: a.longitude });
        const dB = calculateDistanceKm(userPosition, { latitude: b.latitude, longitude: b.longitude });
        return dA - dB;
      }));
    } else {
      setSortedPoints(points);
    }
  }, [points, userPosition]);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  const distFromUser = (p: MapPoint) => {
    if (!userPosition) return null;
    return calculateDistanceKm(userPosition, { latitude: p.latitude, longitude: p.longitude });
  };

  const icon = (type: string) => {
    switch(type) {
      case 'partner': return '🍽️';
      case 'relay': return '📦';
      default: return '📍';
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-orange-100 overflow-hidden ${compact ? '' : 'shadow-sm'}`}>
      {/* En-tête avec position */}
      <div className="p-4 border-b border-orange-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            {userPosition ? 'À proximité' : 'Points disponibles'}
          </h3>
          {!userPosition && (
            <button onClick={requestPosition} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200">
              <Locate className="w-3 h-3" /> Ma position
            </button>
          )}
        </div>

        {/* Sélecteur de commune */}
        <div className="relative">
          <button onClick={() => setShowList(!showList)} className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 border">
            <span>{selectedCommune || 'Choisir une commune'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showList && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <button onClick={() => { setSelectedCommune(''); setShowList(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-orange-50">Toutes</button>
              {martiniqueCommunes.slice(0, 34).map(c => (
                <button key={c.name} onClick={() => { setSelectedCommune(c.name); setShowList(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50">{c.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carte simplifiée — liste par distance */}
      <div className="divide-y divide-orange-50">
        {sortedPoints.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Aucun point disponible dans cette zone
          </div>
        )}
        {sortedPoints
          .filter(p => !selectedCommune || p.address?.includes(selectedCommune))
          .slice(0, compact ? 3 : 10)
          .map((p, i) => {
            const dist = distFromUser(p);
            return (
              <div
                key={i}
                onClick={() => { onSelectPoint?.(p); }}
                className="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <span className="text-xl">{icon(p.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {p.type === 'partner' ? 'Traiteur' : p.type === 'relay' ? 'Point relais' : 'Client'} 
                    {p.address ? ` · ${p.address}` : ''}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {dist !== null ? `${dist.toFixed(1)} km` : ''}
                  {p.status && <p className="text-emerald-600 font-semibold">{p.status}</p>}
                </div>
                {dist !== null && (
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); window.open(getWazeLink({ latitude: p.latitude, longitude: p.longitude }), '_blank'); }} className="p-1.5 text-black hover:bg-gray-100 rounded-lg" title="Ouvrir dans Waze">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M20.87 10.49C20.87 5.29 16.7 1 11.5 1S2.13 5.29 2.13 10.49c0 3.37 2.34 6.64 5.47 8.14.32.15.48.47.38.8-.11.43-.26 1.22-.36 1.5-.1.28.24.54.52.38l1.87-1.11c.35-.2.75-.3 1.15-.3.38 0 .76.11 1.09.31 1.73 1.02 4.06 1.42 6.49 1.42 1.72 0 3.41-.28 4.93-.83.33-.12.53-.46.43-.8-.07-.28-.24-.88-.38-1.32-.08-.28.1-.57.38-.68 3.12-1.1 5.44-4.3 5.44-7.67z"/>
                      </svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); window.open(getGoogleMapsLink({ latitude: p.latitude, longitude: p.longitude }), '_blank'); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Ouvrir dans Google Maps">
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {userPosition && (
        <div className="px-4 py-2 bg-orange-50 text-xs text-gray-500">
          📍 Position actuelle utilisée pour le classement
        </div>
      )}
    </div>
  );
}