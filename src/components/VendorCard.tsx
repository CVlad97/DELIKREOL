import { Store, MapPin, Clock } from 'lucide-react';
import { Vendor } from '../lib/supabase';

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
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
        {vendor.logo_url ? (
          <img
            src={vendor.logo_url}
            alt={vendor.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Store size={48} className="text-white" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{vendor.business_name}</h3>
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mt-1">
              {businessTypeLabels[vendor.business_type]}
            </span>
          </div>
        </div>

        {vendor.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vendor.description}</p>
        )}

        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1 text-emerald-600" />
            <span className="line-clamp-1">{vendor.address}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-emerald-600" />
            <span>Livraison sous 30-45 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
