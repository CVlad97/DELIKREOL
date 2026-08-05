import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Locate, ChefHat, Package, Truck, Store, Navigation, CheckCircle, Crosshair, Building2, X, Calendar, Users, Utensils, Truck as TruckIcon, Wrench, GlassWater, UserCog, MessageCircle, Copy } from 'lucide-react';
import { traiteurSpaces } from '../data/traiteurs';
import { driverReferences } from '../data/driverReferences';
import { getPublishedEventVenues, getDemoEventVenues } from '../data/eventVenues';
import { calculateDistanceKm, getGoogleMapsLink, getWazeLink, type Coords } from '../services/geolocation';
import { findNearestTraiteursToVenue, findNearestDriversToVenue, isValidCoordinate } from '../services/venueLogistics';
import { buildEventWhatsAppUrl, buildEventWhatsAppMessage, containsSensitiveData, type EventRequestData } from '../services/eventVenueWhatsApp';
import { VENUE_TYPE_LABELS, VERIFICATION_LABELS, DELIVERY_ACCESS_LABELS, type EventVenue } from '../types/eventVenue';
import { Layout } from '../components/layout/Layout';

// ——— Icônes Leaflet locales (L.divIcon, pas de CDN) ———

function createDivIcon(html: string, className: string) {
  return L.divIcon({
    html,
    className,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const traiteurIcon = createDivIcon(
  '<div style="font-size:24px;line-height:36px;text-align:center;width:36px;height:36px;">🍽️</div>',
  'delikreol-marker traiteur-marker'
);

const relayIcon = createDivIcon(
  '<div style="font-size:24px;line-height:36px;text-align:center;width:36px;height:36px;">📦</div>',
  'delikreol-marker relay-marker'
);

const driverIcon = createDivIcon(
  '<div style="font-size:24px;line-height:36px;text-align:center;width:36px;height:36px;">🚚</div>',
  'delikreol-marker driver-marker'
);

const userIcon = createDivIcon(
  '<div style="font-size:24px;line-height:40px;text-align:center;width:40px;height:40px;">📍</div>',
  'delikreol-marker user-marker'
);

const venueIcon = createDivIcon(
  '<div style="font-size:24px;line-height:36px;text-align:center;width:36px;height:36px;">🏛️</div>',
  'delikreol-marker venue-marker'
);

const MARTINIQUE_CENTER: [number, number] = [14.641, -61.014];

type FilterType = 'traiteurs' | 'venues' | 'relais' | 'livreurs';

interface MapPoint {
  id: string;
  name: string;
  type: FilterType;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  status?: string;
  image?: string;
  venue?: EventVenue;
}

function getIcon(type: FilterType) {
  switch (type) {
    case 'traiteurs': return traiteurIcon;
    case 'relais': return relayIcon;
    case 'livreurs': return driverIcon;
    case 'venues': return venueIcon;
  }
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

// ——— Composant popup salle avec détails logistiques ———

function VenuePopup({ venue, userPos, onPrepareEvent }: {
  venue: EventVenue;
  userPos: { lat: number; lng: number } | null;
  onPrepareEvent: (venue: EventVenue) => void;
}) {
  const coords = isValidCoordinate(venue.latitude, venue.longitude) ? { latitude: venue.latitude!, longitude: venue.longitude! } : null;
  const distance = userPos && coords ? calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, coords) : null;
  const nearestTraiteurs = useMemo(() => findNearestTraiteursToVenue(venue, traiteurSpaces, 3), [venue]);
  const availableDrivers = useMemo(() => findNearestDriversToVenue(venue, driverReferences, 3), [venue]);

  return (
    <div className="min-w-[240px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
        <h3 className="font-bold text-foreground">{venue.name}</h3>
      </div>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{VENUE_TYPE_LABELS[venue.venueType]}</p>
      <p className="text-sm text-muted-foreground">{venue.commune}</p>
      {venue.address && <p className="text-sm text-muted-foreground">{venue.address}</p>}
      <p className="text-xs mt-1">{VERIFICATION_LABELS[venue.verificationStatus]}</p>

      {distance !== null && (
        <p className="text-xs text-muted-foreground mt-1">📍 {distance.toFixed(1)} km de votre position</p>
      )}

      <div className="mt-3 space-y-1 text-xs">
        {venue.capacitySeated != null && <p><span className="font-semibold">Capacité assise :</span> {venue.capacitySeated} personnes</p>}
        {venue.capacityStanding != null && <p><span className="font-semibold">Capacité debout :</span> {venue.capacityStanding} personnes</p>}
        {venue.parkingSpaces != null && <p><span className="font-semibold">Parking :</span> {venue.parkingSpaces} places</p>}
        <p><span className="font-semibold">Cuisine :</span> {venue.kitchenAvailable ? 'Disponible' : 'Non disponible'}</p>
        <p><span className="font-semibold">Chambre froide :</span> {venue.coldStorageAvailable ? 'Disponible' : 'Non disponible'}</p>
        <p><span className="font-semibold">Zone de chargement :</span> {venue.loadingAreaAvailable ? 'Disponible' : 'Non disponible'}</p>
        <p><span className="font-semibold">Accessibilité PMR :</span> {venue.pmrAccessible ? 'Oui' : 'Non'}</p>
        <p><span className="font-semibold">Livraison :</span> {DELIVERY_ACCESS_LABELS[venue.deliveryAccess]}</p>
        {venue.noiseRestriction && <p><span className="font-semibold">Restriction sonore :</span> {venue.noiseRestriction}</p>}
      </div>

      {nearestTraiteurs.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-xs font-bold mb-1">Traiteurs proches :</p>
          {nearestTraiteurs.map(({ traiteur, distanceKm }) => (
            <p key={traiteur.slug} className="text-xs text-muted-foreground">{traiteur.name} — {distanceKm.toFixed(1)} km</p>
          ))}
        </div>
      )}

      {availableDrivers.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-bold mb-1">Livreurs couvrant la zone :</p>
          {availableDrivers.map(({ driver }) => (
            <p key={driver.name} className="text-xs text-muted-foreground">{driver.name} — {driver.zone}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        {coords && (
          <>
            <a href={getWazeLink(coords)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-muted rounded-lg hover:bg-primary/[0.15] min-h-[36px] flex items-center">Waze</a>
            <a href={getGoogleMapsLink(coords)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-muted rounded-lg hover:bg-primary/[0.15] min-h-[36px] flex items-center">Google Maps</a>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPrepareEvent(venue)}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white font-bold rounded-xl text-xs min-h-[44px] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Calendar className="w-4 h-4" aria-hidden="true" />
        Préparer mon événement
      </button>
    </div>
  );
}

// ——— Modale formulaire événement ———

function EventRequestModal({ venue, onClose }: { venue: EventVenue; onClose: () => void }) {
  const [form, setForm] = useState<EventRequestData>({
    venueName: venue.name,
    commune: venue.commune,
    date: '',
    time: '',
    eventType: '',
    guestCount: 0,
    needCaterer: true,
    needDelivery: true,
    needSetup: false,
    needBeverages: false,
    needServiceStaff: false,
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = 'La date est requise';
    else {
      const selected = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) errs.date = 'La date ne peut pas être dans le passé';
    }
    if (form.guestCount < 0) errs.guestCount = 'Le nombre d\'invités doit être positif';
    if (form.guestCount > 5000) errs.guestCount = 'Nombre d\'invités irréaliste (max 5000)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    const url = buildEventWhatsAppUrl(form);
    const msg = buildEventWhatsAppMessage(form);
    setWhatsappUrl(url);
    setMessageText(msg);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard non disponible
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const fieldClass = 'w-full min-h-11 rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 id="event-modal-title" className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" aria-hidden="true" />
            Préparer mon événement
          </h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="min-h-10 min-w-10 p-2 rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Lieu sélectionné</p>
            <p className="font-bold text-foreground">{venue.name}</p>
            <p className="text-sm text-muted-foreground">{venue.commune}</p>
          </div>

          <div>
            <label htmlFor="evt-date" className="block text-xs font-bold text-foreground mb-1">Date de l'événement *</label>
            <input id="evt-date" type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className={fieldClass} aria-invalid={!!errors.date} />
            {errors.date && <p className="text-xs text-destructive mt-1" role="alert" aria-live="assertive">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor="evt-time" className="block text-xs font-bold text-foreground mb-1">Heure souhaitée</label>
            <input id="evt-time" type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className={fieldClass} />
          </div>

          <div>
            <label htmlFor="evt-type" className="block text-xs font-bold text-foreground mb-1">Type d'événement</label>
            <select id="evt-type" value={form.eventType} onChange={(e) => setForm(f => ({ ...f, eventType: e.target.value }))} className={fieldClass}>
              <option value="">Sélectionner...</option>
              <option value="Mariage">Mariage</option>
              <option value="Anniversaire">Anniversaire</option>
              <option value="Réunion professionnelle">Réunion professionnelle</option>
              <option value="Séminaire">Séminaire</option>
              <option value="Repas de cérémonie">Repas de cérémonie</option>
              <option value="Cocktail">Cocktail</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="evt-guests" className="block text-xs font-bold text-foreground mb-1">Nombre d'invités</label>
            <input id="evt-guests" type="number" min={0} max={5000} value={form.guestCount || ''} onChange={(e) => setForm(f => ({ ...f, guestCount: parseInt(e.target.value) || 0 }))} className={fieldClass} aria-invalid={!!errors.guestCount} placeholder="Ex: 80" />
            {errors.guestCount && <p className="text-xs text-destructive mt-1" role="alert" aria-live="assertive">{errors.guestCount}</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-foreground mb-2">Besoins</legend>
            {[
              { key: 'needCaterer', label: 'Traiteur', icon: Utensils },
              { key: 'needDelivery', label: 'Livraison', icon: TruckIcon },
              { key: 'needSetup', label: 'Installation', icon: Wrench },
              { key: 'needBeverages', label: 'Boissons', icon: GlassWater },
              { key: 'needServiceStaff', label: 'Personnel de service', icon: UserCog },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                <input type="checkbox" checked={form[key as keyof EventRequestData] as boolean} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="evt-comment" className="block text-xs font-bold text-foreground mb-1">Commentaire</label>
            <textarea id="evt-comment" value={form.comment} onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))} className={fieldClass} rows={3} placeholder="Précisions, demandes spéciales..." />
          </div>

          {!whatsappUrl ? (
            <button type="button" onClick={handleGenerate} className="w-full min-h-12 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Préparer le message WhatsApp
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <p className="text-xs font-bold text-muted-foreground mb-2">Message prêt à envoyer :</p>
                <pre className="text-xs whitespace-pre-wrap text-foreground max-h-32 overflow-y-auto">{messageText}</pre>
                {containsSensitiveData(messageText) && <p className="text-xs text-destructive mt-2" role="alert">⚠️ Données sensibles détectées — message non envoyé</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleOpenWhatsApp} className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  Ouvrir WhatsApp
                </button>
                <button type="button" onClick={handleCopy} className="min-h-12 min-w-12 inline-flex items-center justify-center px-3 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Copier le message">
                  {copied ? <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center" aria-live="polite">Aucune commande créée — demande à confirmer sur WhatsApp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DiscoveryMapPage() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MARTINIQUE_CENTER);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set(['traiteurs']));
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [positionValidated, setPositionValidated] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [eventVenue, setEventVenue] = useState<EventVenue | null>(null);

  // Build map points from data — NO Math.random()
  const allPoints = useMemo<MapPoint[]>(() => {
    const points: MapPoint[] = [];

    // Traiteurs with verified lat/lng
    traiteurSpaces.filter(t => isValidCoordinate(t.latitude, t.longitude)).forEach(t => {
      points.push({
        id: `traiteur-${t.slug}`,
        name: t.name,
        type: 'traiteurs',
        lat: t.latitude!,
        lng: t.longitude!,
        address: t.zone || t.commune,
        status: t.status === 'public confirmé' ? '✅ Partenaire' : '⏳ En cours',
        image: t.portraitImage || undefined,
      });
    });

    // Event venues — published only (demo venues excluded by getPublishedEventVenues)
    // For development preview, also show demo venues with a clear label
    const publishedVenues = getPublishedEventVenues();
    const demoVenues = getDemoEventVenues();

    [...publishedVenues, ...demoVenues].forEach(v => {
      if (!isValidCoordinate(v.latitude, v.longitude)) return;
      points.push({
        id: `venue-${v.id}`,
        name: v.name,
        type: 'venues',
        lat: v.latitude!,
        lng: v.longitude!,
        address: v.commune,
        status: v.isDemo ? '🧪 Démonstration' : VERIFICATION_LABELS[v.verificationStatus],
        venue: v,
      });
    });

    // Relay points — NO Math.random(), use fixed commune coordinates
    // These are clearly labeled as "à confirmer" — not real relay points
    const RELAY_COMMUNES: { name: string; lat: number; lng: number }[] = [
      { name: 'Fort-de-France', lat: 14.6036, lng: -61.0710 },
      { name: 'Le Lamentin', lat: 14.6092, lng: -60.9947 },
      { name: 'Schœlcher', lat: 14.6136, lng: -61.0967 },
      { name: 'Rivière-Pilote', lat: 14.5340, lng: -60.9640 },
      { name: 'Ducos', lat: 14.5776, lng: -60.9667 },
      { name: 'Le Robert', lat: 14.6760, lng: -60.9360 },
    ];
    RELAY_COMMUNES.forEach((c, i) => {
      points.push({
        id: `relais-${i}`,
        name: `Point relais ${c.name}`,
        type: 'relais',
        lat: c.lat,
        lng: c.lng,
        address: c.name,
        status: 'Réseau en constitution',
      });
    });

    // Drivers — NO Math.random(), no real-time position
    // Show only zone-based info (no precise coordinates)
    driverReferences.filter(d => d.disponible).forEach((d, i) => {
      // Use fixed approximate commune coordinates for zone display
      const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
        'Toute la Martinique': { lat: 14.641, lng: -61.014 },
        'Fort-de-France': { lat: 14.6036, lng: -61.0710 },
        'Schœlcher': { lat: 14.6136, lng: -61.0967 },
      };
      const zoneKey = Object.keys(ZONE_COORDS).find(k => d.zone.includes(k)) || 'Toute la Martinique';
      const coord = ZONE_COORDS[zoneKey];
      points.push({
        id: `driver-${i}`,
        name: d.name,
        type: 'livreurs',
        lat: coord.lat,
        lng: coord.lng,
        address: d.zone,
        phone: d.contact,
        status: '🟢 Disponible',
      });
    });

    return points;
  }, []);

  const filteredPoints = useMemo(
    () => allPoints.filter(p => activeFilters.has(p.type)),
    [allPoints, activeFilters]
  );

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non supportée par votre navigateur');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const posData = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(posData);
        setMapCenter([posData.lat, posData.lng]);
        setPositionValidated(true);
        setGeoError('');
      },
      () => {
        setGeoError('Position refusée ou indisponible. Vous pouvez continuer sans géolocalisation.');
        setPositionValidated(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const toggleFilter = (f: FilterType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const DISTANCE_COLORS = ['hsl(var(--primary))', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  const FILTERS: { key: FilterType; label: string; icon: typeof ChefHat; count: number }[] = [
    { key: 'traiteurs', label: 'Traiteurs', icon: ChefHat, count: allPoints.filter(p => p.type === 'traiteurs').length },
    { key: 'venues', label: 'Salles & réceptions', icon: Building2, count: allPoints.filter(p => p.type === 'venues').length },
    { key: 'relais', label: 'Points relais', icon: Package, count: allPoints.filter(p => p.type === 'relais').length },
    { key: 'livreurs', label: 'Livreurs', icon: Truck, count: allPoints.filter(p => p.type === 'livreurs').length },
  ];

  return (
    <Layout title="Carte interactive">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Carte interactive</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {positionValidated
                ? 'Position validée — tri par distance activé'
                : 'Trouvez traiteurs, salles, points relais et livreurs près de chez vous'}
            </p>
          </div>
          <button
            onClick={requestPosition}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all ${
              positionValidated
                ? 'bg-success/[0.15] text-success'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
            aria-pressed={positionValidated}
          >
            <Crosshair className="w-4 h-4" aria-hidden="true" />
            {positionValidated ? 'Position validée' : 'Valider ma position'}
          </button>
        </div>

        {geoError && (
          <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-xl" role="alert" aria-live="assertive">{geoError}</p>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtres carte">
          {FILTERS.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              aria-pressed={activeFilters.has(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold transition-all border ${
                activeFilters.has(key)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilters.has(key) ? 'bg-white/20' : 'bg-muted'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border shadow-soft h-[500px] lg:h-[600px]">
            <LeafletMap center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              {userPos && (
                <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-success">Ma position</p>
                      <p className="text-xs text-muted-foreground">Validée</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {filteredPoints.map(p => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={getIcon(p.type)}
                  eventHandlers={{ click: () => setSelectedPoint(p) }}
                >
                  <Popup>
                    {p.type === 'venues' && p.venue ? (
                      <VenuePopup venue={p.venue} userPos={userPos} onPrepareEvent={(v) => setEventVenue(v)} />
                    ) : (
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          {p.type === 'traiteurs' && <ChefHat className="w-4 h-4 text-primary" aria-hidden="true" />}
                          {p.type === 'relais' && <Package className="w-4 h-4 text-primary" aria-hidden="true" />}
                          {p.type === 'livreurs' && <Truck className="w-4 h-4 text-primary" aria-hidden="true" />}
                          <h3 className="font-bold text-foreground">{p.name}</h3>
                        </div>
                        {p.address && <p className="text-sm text-muted-foreground">{p.address}</p>}
                        {p.phone && <a href={`https://wa.me/${p.phone.replace(/\D/g, '')}`} className="block text-sm text-success hover:underline mt-1" target="_blank" rel="noopener noreferrer">{p.phone}</a>}
                        {p.status && <p className="text-xs mt-2 text-muted-foreground">{p.status}</p>}
                        {userPos && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: p.lat, longitude: p.lng }).toFixed(1)} km
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <a href={getWazeLink({ latitude: p.lat, longitude: p.lng })} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-muted rounded-lg hover:bg-primary/[0.15] min-h-[36px] flex items-center">Waze</a>
                          <a href={getGoogleMapsLink({ latitude: p.lat, longitude: p.lng })} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-muted rounded-lg hover:bg-primary/[0.15] min-h-[36px] flex items-center">Google</a>
                        </div>
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </LeafletMap>
          </div>

          {/* Sidebar list */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b border-border bg-muted/20 sticky top-0">
              <h3 className="font-bold text-sm">
                {filteredPoints.length} résultat{filteredPoints.length > 1 ? 's' : ''}
                {userPos ? ' — triés par distance' : ''}
              </h3>
            </div>
            {filteredPoints.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Aucun résultat</p>
                <p className="text-xs mt-1">Activez un filtre ci-dessus</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredPoints
                  .sort((a, b) => {
                    if (!userPos) return 0;
                    const dA = calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: a.lat, longitude: a.lng });
                    const dB = calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: b.lat, longitude: b.lng });
                    return dA - dB;
                  })
                  .slice(0, 30)
                  .map((p) => {
                    const dist = userPos ? calculateDistanceKm({ latitude: userPos.lat, longitude: userPos.lng }, { latitude: p.lat, longitude: p.lng }) : null;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setMapCenter([p.lat, p.lng])}
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors min-h-[60px]"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          p.type === 'traiteurs' ? 'bg-primary/[0.15]' : p.type === 'venues' ? 'bg-accent/15' : p.type === 'relais' ? 'bg-muted' : 'bg-muted'
                        }`}>
                          {p.type === 'traiteurs' ? '🍽️' : p.type === 'venues' ? '🏛️' : p.type === 'relais' ? '📦' : '🚚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.address || ''}</p>
                          {p.type === 'venues' && p.venue && (
                            <p className="text-xs text-muted-foreground">
                              {p.venue.capacitySeated != null ? `${p.venue.capacitySeated} pers. assises` : ''}
                              {p.venue.kitchenAvailable ? ' · Cuisine' : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {dist !== null && (
                            <span className="text-xs font-bold" style={{ color: DISTANCE_COLORS[Math.min(Math.floor(dist / 2), 4)] }}>
                              {dist.toFixed(1)} km
                            </span>
                          )}
                          {p.status && <p className="text-[10px] text-muted-foreground">{p.status}</p>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {eventVenue && (
        <EventRequestModal venue={eventVenue} onClose={() => setEventVenue(null)} />
      )}
    </Layout>
  );
}
