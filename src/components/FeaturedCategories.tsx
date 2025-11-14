import { UtensilsCrossed, Apple, Store, Coffee, Pizza, Salad } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  count: number;
}

interface FeaturedCategoriesProps {
  onSelectCategory: (category: string) => void;
}

export function FeaturedCategories({ onSelectCategory }: FeaturedCategoriesProps) {
  const categories: Category[] = [
    { id: 'restaurant', name: 'Restaurants', icon: UtensilsCrossed, color: 'bg-red-500', count: 45 },
    { id: 'producer', name: 'Producteurs', icon: Apple, color: 'bg-green-500', count: 32 },
    { id: 'merchant', name: 'Commerçants', icon: Store, color: 'bg-blue-500', count: 28 },
    { id: 'cafe', name: 'Cafés', icon: Coffee, color: 'bg-amber-500', count: 18 },
    { id: 'fast-food', name: 'Fast Food', icon: Pizza, color: 'bg-orange-500', count: 24 },
    { id: 'healthy', name: 'Healthy', icon: Salad, color: 'bg-emerald-500', count: 15 },
  ];

  return (
    <div className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
          <button className="text-orange-600 font-medium hover:text-orange-700">
            Voir tout
          </button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-gray-50 transition-all transform hover:scale-105"
              >
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {category.count} lieux
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
