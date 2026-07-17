import { Store, MapPin, Clock, ArrowRight, Star } from 'lucide-react';
import { Vendor } from '../types';
import { SmartImage } from './SmartImage';

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
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[2rem] border border-border bg-card text-left shadow-elegant transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-48 overflow-hidden bg-transparent" data-color-fidelity="original">
        {vendor.logo_url ? (
          <SmartImage
            src={vendor.logo_url}
            alt={`Logo de ${vendor.business_name}`}
            kind="logo"
            fit="contain"
            containerClassName="h-full w-full bg-transparent"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Store size={48} className="text-muted-foreground opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
            {businessTypeLabels[vendor.business_type] ?? 'Partenaire local'}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-black text-xl text-foreground tracking-tight uppercase group-hover:text-primary transition-colors">
              {vendor.business_name}
            </h3>
            <div className="flex items-center gap-1 text-primary" aria-label="Note 4,8 sur 5">
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
    </button>
  );
}
