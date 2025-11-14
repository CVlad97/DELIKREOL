import { Zap, Star, Clock, DollarSign, Leaf } from 'lucide-react';

interface QuickFiltersProps {
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
}

export function QuickFilters({ selectedFilters, onToggleFilter }: QuickFiltersProps) {
  const filters = [
    { id: 'fastest', label: 'Livraison rapide', icon: Zap, color: 'text-yellow-600' },
    { id: 'top-rated', label: 'Mieux notés', icon: Star, color: 'text-orange-600' },
    { id: 'open-now', label: 'Ouvert maintenant', icon: Clock, color: 'text-green-600' },
    { id: 'budget', label: 'Petit budget', icon: DollarSign, color: 'text-blue-600' },
    { id: 'local', label: 'Produits locaux', icon: Leaf, color: 'text-emerald-600' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => onToggleFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : filter.color}`} />
                <span className="text-sm">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
