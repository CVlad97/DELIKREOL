import { Store, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  const businessType = businessTypeLabels[vendor.business_type] ?? 'Partenaire local';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Découvrir ${vendor.business_name}`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {vendor.logo_url ? (
          <SmartImage
            src={vendor.logo_url}
            alt={`Logo de ${vendor.business_name}`}
            kind="logo"
            containerClassName="h-full w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Store size={48} className="text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-md">
            {businessType}
          </span>
        </div>

        {vendor.is_active && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-success shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Partenaire actif
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
            {vendor.business_name}
          </h3>
          {vendor.description && (
            <p className="line-clamp-3 text-sm font-medium leading-6 text-muted-foreground">
              {vendor.description}
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
            <MapPin size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-2">{vendor.address || 'Martinique'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Clock size={15} className="text-accent" aria-hidden="true" />
              <span>Créneau confirmé sur demande</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary">
              Découvrir
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
