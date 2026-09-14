import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Truck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateDistanceKm, type Coords } from '../services/geolocation';

type Props = { commune?: string; coords?: Coords | null };
type Status = 'idle' | 'loading' | 'ready' | 'fallback';

type DriverRow = {
  is_available?: boolean;
  is_active?: boolean;
  status?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
  current_location?: Coords | null;
  max_radius_km?: number;
};

type RelayRow = {
  name?: string;
  is_active?: boolean;
  status?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  current_load?: number;
  current_location?: Coords | null;
};

function rowCoords(row: DriverRow | RelayRow): Coords | null {
  const latitude = row.latitude ?? row.current_location?.latitude;
  const longitude = row.longitude ?? row.current_location?.longitude;
  return typeof latitude === 'number' && typeof longitude === 'number'
    ? { latitude, longitude }
    : null;
}function isNear(
  row: DriverRow | RelayRow,
  commune: string | undefined,
  coords: Coords | null | undefined,
  radiusKm: number
) {
  const sameCommune = Boolean(commune && row.commune &&
    row.commune.toLocaleLowerCase() === commune.toLocaleLowerCase());
  const position = rowCoords(row);
  const distance = coords && position ? calculateDistanceKm(coords, position) : Infinity;
  return sameCommune || distance <= radiusKm;
}

export function DeliveryAvailability({ commune, coords }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [relays, setRelays] = useState<RelayRow[]>([]);
  const [nearestRelay, setNearestRelay] = useState<RelayRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!commune && !coords) {
      setStatus('idle');
      setDrivers([]);
      setRelays([]);
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus('fallback');
      return;
    }
    setStatus('loading');
    Promise.all([
      supabase.from('drivers').select('is_available,is_active,status,commune,latitude,longitude,current_location,max_radius_km'),
      supabase.from('relay_points').select('name,is_active,status,commune,latitude,longitude,capacity,current_load'),
    ]).then(([driverResult, relayResult]) => {
      if (cancelled) return;
      const availableDrivers = (driverResult.data || []).filter((row) =>
        row.is_available === true && row.is_active !== false &&
        (!row.status || ['available', 'actif', 'active'].includes(row.status))
      ) as DriverRow[];
      const availableRelays = (relayResult.data || []).filter((row) =>
        row.is_active !== false && (!row.status || ['available', 'actif', 'active'].includes(row.status)) &&
        (row.capacity == null || (row.current_load || 0) < row.capacity)
      ) as RelayRow[];
      const nearbyDrivers = availableDrivers.filter((row) =>
        isNear(row, commune, coords, row.max_radius_km || 15)
      );
      const nearbyRelays = availableRelays.filter((row) => isNear(row, commune, coords, 5));
      setDrivers(nearbyDrivers);
      setRelays(nearbyRelays);
      setNearestRelay(nearbyRelays[0] || null);
      setStatus(driverResult.error || relayResult.error ? 'fallback' : 'ready');
    }).catch(() => {
      if (!cancelled) setStatus('fallback');
    });
    return () => { cancelled = true; };
  }, [commune, coords]);

  if (status === 'idle') return null;
  if (status === 'loading') {
    return <div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm font-bold text-[#4b5f55]">Recherche des livreurs et points relais autour de vous…</div>;
  }
  if (status === 'fallback' || (drivers.length === 0 && relays.length === 0)) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-200">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span><strong>Livraison non confirmée pour cette zone.</strong> Pour l’instant, choisissez le click &amp; collect chez le traiteur si cette option est proposée. Nous recherchons encore un livreur ou un point relais partenaire.</span>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100">
      <div className="flex flex-wrap items-center gap-4 text-sm font-black text-[#173f32]">
        <span className="inline-flex items-center gap-2"><Truck className="h-5 w-5 text-[#09614f]" /> {drivers.length} livreur{drivers.length > 1 ? 's' : ''} disponible{drivers.length > 1 ? 's' : ''}</span>
        <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5 text-[#09614f]" /> {relays.length} point{relays.length > 1 ? 's' : ''} relais</span>
      </div>
      {nearestRelay?.name && <p className="mt-2 text-sm font-semibold text-[#4b5f55]"><CheckCircle2 className="mr-1 inline h-4 w-4 text-[#09614f]" /> Point relais proposé : {nearestRelay.name}</p>}
    </div>
  );
}