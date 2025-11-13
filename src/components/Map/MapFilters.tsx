import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MapFiltersProps {
  currentFilter: 'all' | 'open' | 'available' | 'closed';
  onFilterChange: (filter: 'all' | 'open' | 'available' | 'closed') => void;
  showDrivers: boolean;
  onToggleDrivers: () => void;
  showZones: boolean;
  onToggleZones: () => void;
}

export default function MapFilters({
  currentFilter,
  onFilterChange,
  showDrivers,
  onToggleDrivers,
  showZones,
  onToggleZones
}: MapFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtres Points Relais</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Tous</span>
          </button>

          <button
            onClick={() => onFilterChange('open')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentFilter === 'open'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Ouverts</span>
          </button>

          <button
            onClick={() => onFilterChange('available')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentFilter === 'available'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Avec capacité</span>
          </button>

          <button
            onClick={() => onFilterChange('closed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentFilter === 'closed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Fermés</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Affichage</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDrivers}
              onChange={onToggleDrivers}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les livreurs en temps réel</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showZones}
              onChange={onToggleZones}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les zones de livraison</span>
          </label>
        </div>
      </div>
    </div>
  );
}
