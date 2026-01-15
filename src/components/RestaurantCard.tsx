import { Star, Clock, MapPin, TrendingUp } from 'lucide-react';
import { TrustBadgeHACCP } from './TrustBadgeHACCP';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
  distance: string;
  isNew?: boolean;
  promo?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02]"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        {restaurant.isNew && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            NOUVEAU
          </div>
        )}

        {restaurant.promo && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            {restaurant.promo}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-2 text-white text-sm">
            <Clock size={14} />
            <span className="font-medium">{restaurant.deliveryTime}</span>
            <span className="text-white/70">•</span>
            <span className="font-medium">{restaurant.deliveryFee === 0 ? 'Gratuit' : `${restaurant.deliveryFee}€`}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-600">{restaurant.category}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg ml-2">
            <Star className="w-4 h-4 text-green-600 fill-current" />
            <span className="text-sm font-bold text-gray-900">{restaurant.rating}</span>
            <span className="text-xs text-gray-500">({restaurant.reviews})</span>
          </div>
        </div>

        <div className="mb-3">
          <TrustBadgeHACCP showTooltip={true} />
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          <span>{restaurant.distance}</span>
        </div>
      </div>
    </button>
  );
}
