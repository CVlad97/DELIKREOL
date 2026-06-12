import { useState, useEffect, useCallback } from 'react';
import { MapPin, Locate, ChevronDown, Navigation } from 'lucide-react';
import { martiniqueCommunes } from '../data/martiniqueCommunes';
import { saveClientLocation } from '../services/geolocation';
import { hasConsented } from '../services/privacy';

interface LocationSelectorProps {
  onSelect: (location: { commune: string; coords?: { latitude: number; longitude: number } }) => void;
  compact?: boolean;
}

export function LocationSelector({ onSelect, compact }: LocationSelectorProps) {
  const [selectedCommune, setSelectedCommune] = useState('');
  const [showList, setShowList] = useState(false);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Charger dernière position depuis localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('delikreol_client_location') || '{}');
      if (saved.commune) setSelectedCommune(saved.commune);
    } catch {}
  }, []);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation || !hasConsented('geolocation')) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setPosition(coords);
        saveClientLocation({ commune: selectedCommune, coords, consentGiven: true, source: 'gps', address: '' });
        onSelect({ commune: selectedCommune, coords });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [selectedCommune, onSelect]);

  const filtered = search
    ? martiniqueCommunes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : martiniqueCommunes;

  const handleSelect = (name: string) => {
    setSelectedCommune(name);
    setShowList(false);
    setSearch('');
    try {
      localStorage.setItem('delikreol_client_location', JSON.stringify({ commune: name }));
    } catch {}
    onSelect({ commune: name, coords: position || undefined });
  };

  return (
    <div className={`bg-white rounded-2xl border border-orange-100 ${compact ? 'p-3' : 'p-4 shadow-sm'}`}>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Nous utilisons votre position uniquement pour estimer les distances, délais et options disponibles.
      </p>
      
      <div className="flex gap-2">
        {/* Sélecteur commune */}
        <div className="relative flex-1">
          <div className="flex items-center bg-gray-50 rounded-xl border px-3 py-2">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <input
              value={showList ? search : selectedCommune}
              onChange={e => { setSearch(e.target.value); setShowList(true); }}
              onFocus={() => setShowList(true)}
              placeholder="Choisir une commune"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            <button onClick={() => setShowList(!showList)}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {showList && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filtered.slice(0, 34).map(c => (
                <button key={c.name} onClick={() => handleSelect(c.name)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${c.name === selectedCommune ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'}`}>
                  {c.name}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Aucune commune trouvée</p>}
            </div>
          )}
        </div>

        {/* Bouton géolocalisation */}
        {!position && (
          <button onClick={requestGeolocation} className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-200">
            <Locate className="w-3 h-3" />
            {compact ? '' : 'Ma position'}
          </button>
        )}
      </div>

      {position && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>📍 Position utilisée pour le classement</span>
          <button onClick={() => { setPosition(null); }} className="text-orange-600 hover:underline">Réinitialiser</button>
        </div>
      )}
    </div>
  );
}