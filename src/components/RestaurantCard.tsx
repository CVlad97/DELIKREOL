import { Star, Clock, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

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
      className="group w-full bg-card rounded-[2rem] border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-elegant hover:-translate-y-1 text-left"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute top-4 left-4 flex gap-2">
          {restaurant.isNew && (
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 uppercase shadow-lg">
              <TrendingUp size={10} />
              Nouveau
            </div>
          )}
          <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 uppercase shadow-lg">
            <ShieldCheck size={10} />
            Vérifié
          </div>
        </div>

        {restaurant.promo && (
          <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
            {restaurant.promo}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent p-4">
          <div className="flex items-center gap-3 text-background text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <span>{restaurant.deliveryFee === 0 ? 'Livraison Offerte' : `Frais: ${restaurant.deliveryFee}€`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-black text-foreground text-xl tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{restaurant.category}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-black text-foreground">{restaurant.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MapPin size={14} className="text-secondary" />
            <span>À {restaurant.distance}</span>
          </div>
          <div className="text-primary font-black uppercase tracking-widest text-[10px]">Voir la carte →</div>
        </div>
      </div>
    </button>
  );
}
