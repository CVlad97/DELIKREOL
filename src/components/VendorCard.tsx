import { Store, MapPin, Clock, ArrowRight, Star } from 'lucide-react';
import { Vendor } from '../types';

interface VendorCardProps {
  vendor: Vendor;
  onClick: () => void;
}

const businessTypeLabels: Record<string, string> = {
  restaurant: 'Restaurant',
  producer: 'Producteur',
  merchant: 'Commerçant',
};

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-[2rem] border border-border hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-elegant hover:-translate-y-1 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        {vendor.logo_url ? (
          <img
            src={vendor.logo_url}
            alt={vendor.business_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Store size={48} className="text-muted-foreground opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
            {businessTypeLabels[vendor.business_type]}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-black text-xl text-foreground tracking-tight uppercase group-hover:text-primary transition-colors">{vendor.business_name}</h3>
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4 fill-primary" />
              <span className="text-sm font-black">4.8</span>
            </div>
          </div>
          {vendor.description && (
            <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{vendor.description}</p>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <MapPin size={14} className="text-secondary" />
            <span className="truncate">{vendor.address}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Clock size={14} className="text-primary" />
              <span>30-45 min</span>
            </div>
            <div className="text-primary font-black uppercase tracking-widest text-[10px] group-hover:gap-2 flex items-center transition-all">
              Visiter <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
