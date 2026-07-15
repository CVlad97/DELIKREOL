import { useState, useEffect, useCallback } from 'react';
import { MapPin, Locate, ChevronDown } from 'lucide-react';
import { martiniqueCommunes, normalizeCommuneQuery } from '../data/martiniqueCommunes';
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
    } catch { /* empty */ }
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
    ? martiniqueCommunes.filter(c => {
        const names = [c.name, ...c.aliases].map(normalizeCommuneQuery);
        const q = normalizeCommuneQuery(search);
        return names.some(n => n.includes(q));
      })
    : martiniqueCommunes;

  const handleSelect = (name: string) => {
    setSelectedCommune(name);
    setShowList(false);
    setSearch('');
    try {
      localStorage.setItem('delikreol_client_location', JSON.stringify({ commune: name }));
    } catch { /* empty */ }
    onSelect({ commune: name, coords: position || undefined });
  };

  return (
    <div className={`bg-white rounded-2xl border border-primary/20 ${compact ? 'p-3' : 'p-4 shadow-sm'}`}>
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Nous utilisons votre position uniquement pour estimer les distances, délais et options disponibles.
      </p>
      
      <div className="flex gap-2">
        {/* Sélecteur commune */}
        <div className="relative flex-1">
          <div className="flex items-center bg-muted rounded-xl border px-3 py-2">
            <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              value={showList ? search : selectedCommune}
              onChange={e => { setSearch(e.target.value); setShowList(true); }}
              onFocus={() => setShowList(true)}
              placeholder="Choisir une commune"
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-gray-400"
            />
            <button onClick={() => setShowList(!showList)}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {showList && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filtered.slice(0, 34).map(c => (
                <button key={c.name} onClick={() => handleSelect(c.name)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/[0.08] ${c.name === selectedCommune ? 'bg-primary/[0.08] text-primary font-semibold' : 'text-foreground'}`}>
                  {c.name}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Aucune commune trouvée</p>}
            </div>
          )}
        </div>

        {/* Bouton géolocalisation */}
        {!position && (
          <button onClick={requestGeolocation} className="flex items-center gap-1 px-3 py-2 bg-primary/[0.15] text-primary rounded-xl text-xs font-bold hover:bg-primary/20">
            <Locate className="w-3 h-3" />
            {compact ? '' : 'Ma position'}
          </button>
        )}
      </div>

      {position && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>📍 Position utilisée pour le classement</span>
          <button onClick={() => { setPosition(null); }} className="text-primary hover:underline">Réinitialiser</button>
        </div>
      )}
    </div>
  );
}