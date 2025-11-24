import { useState, useEffect, useRef } from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { geocodeAddress, isInDeliveryZone, GeocodeResult } from '../services/geocodingService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress: (result: GeocodeResult) => void;
  error?: string;
}

export function AddressAutocomplete({ value, onChange, onSelectAddress, error }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await geocodeAddress(value);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSelectSuggestion = (result: GeocodeResult) => {
    onChange(result.displayName);
    onSelectAddress(result);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="text-xs text-emerald-400">✓ Exacte</span>;
      case 'medium':
        return <span className="text-xs text-blue-400">Probable</span>;
      default:
        return <span className="text-xs text-slate-400">Approximative</span>;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Entrez votre adresse ou commune..."
          className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((result, index) => {
            const inZone = isInDeliveryZone(result.latitude, result.longitude);
            
            return (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(result)}
                className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-start gap-3 border-b border-slate-700 last:border-0"
              >
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-200 font-medium">{result.address}</span>
                    {getConfidenceBadge(result.confidence)}
                  </div>
                  <div className="text-sm text-slate-400">{result.displayName}</div>
                  {inZone ? (
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                      <Check className="w-3 h-3" />
                      Zone de livraison couverte
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                      Hors zone - livraison sous réserve
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showSuggestions && value.length >= 3 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 text-center text-slate-400">
          Aucune commune trouvée. Essayez une autre recherche.
        </div>
      )}
    </div>
  );
}
