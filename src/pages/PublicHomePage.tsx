import { FormEvent, ReactNode, useEffect, useMemo, useState, type ComponentType, type MouseEvent } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Download,
  Filter,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Star,
  Utensils,
} from 'lucide-react';
import { loadPublicCatalog, PublicCatalogProduct, PublicCatalogVendor } from '../services/publicCatalogService';
import { calculateOrderEconomics } from '../services/orderEconomics';
import { distanceKm, getMartiniqueServiceZones, vendorServesPoint } from '../services/serviceZones';
import { submitPartnerLead, submitPartnerProduct, uploadPartnerProductPhoto } from '../services/partnerPortalService';
import { createBusinessRequest } from '../services/liteOrdersService';
import { getOrderFallbackEndpoint, saveFallbackOrderToSheet } from '../services/orderFallbackService';
import { buildPartnerDispatchMessage, downloadOrderPdf } from '../utils/orderPdf';
import { publicSupabase } from '../lib/publicSupabase';
import { mockProducts } from '../data/mockCatalog';
import { getWhatsAppBusinessLink } from '../utils/whatsapp';
import { ORDER_FORM_URL, PUBLIC_OPERATIONS_EMAIL, SHEETS_FIRST_MODE } from '../config/publicRuntime';
import {
  trackBusinessRequestSuccess,
  trackCheckoutSuccess,
  trackPartnerLeadSuccess,
  trackProductSubmissionSuccess,
  trackPublicView,
} from '../services/metricsService';
import { useToast } from '../contexts/ToastContext';

type CatalogState = {
  configured: boolean;
  vendors: PublicCatalogVendor[];
  products: PublicCatalogProduct[];
};

type PartnerLeadForm = {
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  commune: string;
  zone_label: string;
  activity_type: string;
  delivery_radius_km: string;
  opening_hours: string;
  description: string;
};

type ProductSubmissionForm = {
  business_name: string;
  product_name: string;
  category: string;
  price: string;
  description: string;
};

type BusinessRequestForm = {
  company_name: string;
  contact: string;
  people_count: string;
  requested_date: string;
  requested_time: string;
  location: string;
  budget: string;
  frequency: string;
  details: string;
};

type SubmitStatus = {
  kind: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
};

type CheckoutStatus = SubmitStatus & {
  orderNumber?: string;
};

function isSupabasePausedError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const anyError = error as Record<string, unknown>;
  const status = Number(anyError.status ?? anyError.statusCode ?? anyError.status_code ?? NaN);
  if (status === 402 || status === 540) return true;
  const msg = String(anyError.message ?? anyError.error_description ?? anyError.details ?? anyError.hint ?? '').toLowerCase();
  return (
    msg.includes('paused') ||
    msg.includes('project paused') ||
    msg.includes('payment required') ||
    msg.includes('overdue_payment') ||
    msg.includes('billing') ||
    msg.includes('subscription') ||
    msg.includes('invoice') ||
    msg.includes('402') ||
    msg.includes('540')
  );
}

function isSupabaseUnavailableError(error: unknown) {
  if (!error) return false;
  if (typeof error === 'string') {
    const msg = error.toLowerCase();
    return msg.includes('failed to fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('dns');
  }
  if (typeof error !== 'object') return false;
  const anyError = error as Record<string, unknown>;
  const msg = String(anyError.message ?? anyError.error_description ?? anyError.details ?? anyError.hint ?? '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('dns') ||
    msg.includes('connection refused') ||
    msg.includes('service unavailable')
  );
}

type NotificationPreferences = {
  commande: boolean;
  partenaire: boolean;
  livreur: boolean;
  promos: boolean;
};

type CustomerLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  mapsUrl: string;
};

type GeoStatus = 'idle' | 'loading' | 'success' | 'error' | 'unsupported';
type GeoConsentState = 'idle' | 'ask' | 'declined' | 'granted';

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const whatsappBase = `https://wa.me/${whatsappNumber}`;
const featuredCategories = ['plats créoles', 'traiteurs', 'box / plateaux', 'desserts', 'boissons', 'commande entreprise'];
const budgetRanges = ['Tous', '≤ 15 €', '15 € - 30 €', '30 € et plus'];
const publicSiteUrl = 'https://cvlad97.github.io/DELIKREOL/';

function formatWhatsAppLabel(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('596') ? `+${digits}` : value;
}

function buildDemoCatalog(): CatalogState {
  const vendorNames = Array.from(new Set(mockProducts.map((product) => product.vendor)));
  const demoZones = ['Fort-de-France', 'Lamentin', 'Schoelcher'];
  const vendors = vendorNames.map((name, index) => ({
    id: `demo-vendor-${index + 1}`,
    business_name: name,
    business_type: 'Partenaire local',
    description: 'Partenaire de démonstration DELIKREOL.',
    logo_url: null,
    address: demoZones[index % demoZones.length],
    phone: '',
    latitude: null,
    longitude: null,
    commission_rate: 0.15,
    delivery_radius_km: 3 + (index % 3),
    zone_label: demoZones[index % demoZones.length],
  }));
  const vendorMap = new Map(vendors.map((vendor) => [vendor.business_name, vendor]));
  const products = mockProducts.map((product, index) => {
    const vendor = vendorMap.get(product.vendor) ?? vendors[index % vendors.length];
    return {
      id: `demo-${product.id}`,
      vendor_id: vendor.id,
      vendor_name: vendor.business_name,
      vendor_latitude: vendor.latitude,
      vendor_longitude: vendor.longitude,
      vendor_delivery_radius_km: vendor.delivery_radius_km,
      name: product.name,
      description: product.description ?? 'Produit de démonstration DELIKREOL.',
      category: product.category,
      price: product.price,
      image_url: product.image ?? null,
      stock_quantity: 10,
      zone_label: vendor.zone_label,
      available: product.available !== false,
    };
  });

  return { configured: false, vendors, products };
}

const trustPills = [
  'partenaires choisis',
  'retrait ou livraison',
  'réponse rapide',
  'pensé pour la Martinique',
];

const howItWorks = [
  {
    title: 'Je cherche',
    text: 'Adresse, commune ou produit: je trouve vite les offres disponibles près de moi.',
  },
  {
    title: 'J’ajoute',
    text: 'Je choisis un produit clair avec photo, prix, zone et disponibilité.',
  },
  {
    title: 'Je confirme / je paie',
    text: 'Je valide retrait ou livraison, puis PayPal, carte via lien sécurisé ou assistance WhatsApp.',
  },
  {
    title: 'Je suis ma commande',
    text: 'Je reçois une confirmation simple et les informations utiles pour récupérer ou recevoir ma commande.',
  },
];

const reassurance = [
  {
    title: 'Local et crédible',
    text: 'Partenaires visibles, communes servies, contact direct et infos utiles dès le premier écran.',
    icon: ShieldCheck,
  },
  {
    title: 'Simple et rapide',
    text: 'Un seul chemin principal sur mobile: voir les offres, ajouter, confirmer ou parler à DELIKREOL.',
    icon: Sparkles,
  },
  {
    title: 'Pensé pour la Martinique',
    text: 'Rayon réel, fallback commune si la géoloc manque et commandes entreprises adaptées aux usages locaux.',
    icon: MapPin,
  },
];

const roleCards = [
  {
    title: 'Vendeur',
    text: 'Publiez vos plats, produits ou menus locaux.',
    cta: 'Devenir vendeur',
    href: '#partenaires',
    icon: Store,
  },
  {
    title: 'Livreur',
    text: 'Choisissez votre zone, vos créneaux et votre rayon.',
    cta: 'Devenir livreur',
    href: '#livreur',
    icon: Truck,
  },
  {
    title: 'Point relais',
    text: 'Accueillez des retraits clients dans votre commerce.',
    cta: 'Proposer un relais',
    href: '#partenaires',
    icon: Home,
  },
  {
    title: 'Entreprise',
    text: 'Commandes groupées, repas d’équipe et récurrence.',
    cta: 'Demander un devis',
    href: '#entreprises',
    icon: Briefcase,
  },
];

const driverHighlights = [
  ['Gains estimés', 'À valider selon course'],
  ['Zone', 'Commune + secteur'],
  ['Rayon', '5 à 12 km conseillé'],
  ['Disponibilité', 'Créneaux libres'],
  ['Véhicule', 'Scooter, voiture ou vélo'],
];

const simulationScenarios = [
  ['Client commande', 'Produit ajouté, mode livraison ou retrait choisi, confirmation prête avec PDF.'],
  ['Vendeur reçoit', 'Détails produits, quantités, créneau, total et statut paiement lisibles.'],
  ['Livreur voit sa mission', 'Zone, rayon, mode de retrait et rémunération estimée visibles.'],
  ['Partenaire voit son gain', 'Sous-total, frais, commission estimée et montant à préparer.'],
  ['Entreprise envoie une demande', 'Nombre de personnes, date, lieu, budget et fréquence structurés.'],
];

const faqItems = [
  {
    question: 'DELIKREOL est-il un simple traiteur ?',
    answer: 'Non. DELIKREOL est une plateforme locale multi-partenaire qui relie clients, vendeurs, livraison et demandes entreprises.',
  },
  {
    question: 'Comment savoir si un partenaire est actif ?',
    answer: 'Les fiches affichent la visibilité, la commune, la zone, les horaires et l’état disponible ou à confirmer.',
  },
  {
    question: 'Peut-on commander pour une entreprise ?',
    answer: 'Oui. Le bloc Entreprises & commandes groupées permet de demander un devis, un repas d’équipe ou une récurrence.',
  },
  {
    question: 'Quels modes de paiement sont disponibles ?',
    answer: 'Les modes proposés sont affichés au niveau du panier : PayPal, carte via lien sécurisé ou assistance WhatsApp.',
  },
  {
    question: 'Comment rejoindre la plateforme ?',
    answer: 'Les vendeurs, traiteurs et prestataires peuvent remplir le formulaire partenaire pour être examinés puis intégrés.',
  },
];

const defaultPartnerLeadForm: PartnerLeadForm = {
  business_name: '',
  contact_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  commune: '',
  zone_label: '',
  activity_type: 'restaurant',
  delivery_radius_km: '3',
  opening_hours: '',
  description: '',
};

const defaultProductSubmissionForm: ProductSubmissionForm = {
  business_name: '',
  product_name: '',
  category: 'plats créoles',
  price: '',
  description: '',
};

const defaultBusinessRequestForm: BusinessRequestForm = {
  company_name: '',
  contact: '',
  people_count: '',
  requested_date: '',
  requested_time: '',
  location: '',
  budget: '',
  frequency: '',
  details: '',
};

export function PublicHomePage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const customerPath = `${baseUrl}customer`;
  const orderFormUrl = ORDER_FORM_URL;
  const sheetsFirstMode = SHEETS_FIRST_MODE;
  const operationsEmail = PUBLIC_OPERATIONS_EMAIL;
  const gotoCustomer = (mode?: 'simulation') => {
    if (window.location.pathname.endsWith('/customer') || new URL(window.location.href).searchParams.get('view') === 'customer') {
      return;
    }
    if (mode === 'simulation') localStorage.setItem('delikreol_demo_override', 'true');
    window.location.assign(mode === 'simulation' ? `${customerPath}?mode=simulation` : customerPath);
  };
  const [catalog, setCatalog] = useState<CatalogState>({ configured: false, vendors: [], products: [] });
  const [query, setQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [budgetFilter, setBudgetFilter] = useState('Tous');
  const [selectedProducts, setSelectedProducts] = useState<PublicCatalogProduct[]>([]);
  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(null);
  const [pendingCustomerLocation, setPendingCustomerLocation] = useState<CustomerLocation | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoConsentState, setGeoConsentState] = useState<GeoConsentState>('idle');
  const [geoError, setGeoError] = useState('');
  const [vendorAvailabilityStatus, setVendorAvailabilityStatus] = useState('À confirmer par DELIKREOL');
  const [copyStatus, setCopyStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Carte via lien sécurisé');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>({ kind: 'idle' });
  const [activeScenario, setActiveScenario] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window === 'undefined' || !('Notification' in window) ? 'unsupported' : Notification.permission,
  );
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    commande: true,
    partenaire: true,
    livreur: true,
    promos: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerLeadForm, setPartnerLeadForm] = useState<PartnerLeadForm>(defaultPartnerLeadForm);
  const [productSubmissionForm, setProductSubmissionForm] = useState<ProductSubmissionForm>(defaultProductSubmissionForm);
  const [businessRequestForm, setBusinessRequestForm] = useState<BusinessRequestForm>(defaultBusinessRequestForm);
  const [partnerStatus, setPartnerStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productStatus, setProductStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [businessStatus, setBusinessStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [supabasePaused, setSupabasePaused] = useState(false);
  const [supabasePausedHint, setSupabasePausedHint] = useState<string | null>(null);
  const { showSuccess } = useToast();

  useEffect(() => {
    document.title = 'DELIKREOL Martinique | Plats créoles, traiteurs, produits locaux et entreprises';
    upsertMeta('description', 'DELIKREOL est la plateforme locale premium pour commander des plats créoles, des produits locaux et des demandes entreprises en Martinique.');
    upsertMeta('og:title', 'DELIKREOL Martinique | Plateforme locale premium');
    upsertMeta('og:description', 'Commandez des plats créoles et produits locaux en Martinique, avec retrait ou livraison selon votre commune.');
    trackPublicView();
  }, []);

  useEffect(() => {
    let active = true;
    loadPublicCatalog()
      .then((result) => {
        if (!active) return;
        if (result.configured && result.products.length > 0) {
          setCatalog(result);
          setError(null);
          return;
        }

        setCatalog(buildDemoCatalog());
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setCatalog(buildDemoCatalog());
        setError(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!publicSupabase) {
      setSupabasePaused(true);
      setSupabasePausedHint('Backend Supabase indisponible (pause ou configuration). Bascule sur enregistrement Sheets (si configuré), WhatsApp en support.');
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { error: pingError } = await publicSupabase.from('vendors').select('id').limit(1);
        if (!mounted) return;
        if (pingError && isSupabasePausedError(pingError)) {
          setSupabasePaused(true);
          setSupabasePausedHint('Supabase est en pause (facturation). Bascule sur enregistrement Sheets (si configuré), WhatsApp en support.');
        }
      } catch {
        // Ignore ping failures; the UI will handle on-demand fallbacks.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const serviceZones = useMemo(() => {
    const vendorZones = catalog.vendors.map((vendor) => vendor.zone_label).filter(Boolean);
    return getMartiniqueServiceZones(vendorZones);
  }, [catalog.vendors]);

  const categoryOptions = useMemo(() => {
    const fromCatalog = catalog.products.map((product) => product.category || 'plats créoles');
    return ['Tous', ...Array.from(new Set([...featuredCategories, ...fromCatalog]))];
  }, [catalog.products]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const customerPoint = customerLocation ? { latitude: customerLocation.lat, longitude: customerLocation.lng } : null;

    return catalog.products
      .map((product) => {
        const hasVendorGeo = product.vendor_latitude != null && product.vendor_longitude != null;
        const distanceToCustomerKm =
          customerPoint && hasVendorGeo
            ? distanceKm(customerPoint, { latitude: product.vendor_latitude!, longitude: product.vendor_longitude! })
            : null;
        return { product, distanceToCustomerKm };
      })
      .filter(({ product }) => {
        const zone = product.zone_label || '';
      const matchQuery =
        !needle ||
        `${product.name} ${product.vendor_name} ${product.category} ${product.description} ${zone}`
          .toLowerCase()
          .includes(needle);
      const matchCategory = categoryFilter === 'Tous' || product.category === categoryFilter;
        const matchCoverage =
          communeFilter === 'Tous'
            ? true
            : customerPoint
              ? vendorServesPoint(
                  {
                    id: product.vendor_id,
                    latitude: product.vendor_latitude,
                    longitude: product.vendor_longitude,
                    delivery_radius_km: product.vendor_delivery_radius_km,
                    zone_label: product.zone_label,
                  },
                  customerPoint,
                  communeFilter,
                )
              : zone.toLowerCase().includes(communeFilter.toLowerCase());
      const price = product.price;
      const matchBudget =
        budgetFilter === 'Tous' ||
        (budgetFilter === '≤ 15 €' && price <= 15) ||
        (budgetFilter === '15 € - 30 €' && price > 15 && price <= 30) ||
        (budgetFilter === '30 € et plus' && price > 30);
        return matchQuery && matchCategory && matchCoverage && matchBudget;
      })
      .sort((a, b) => {
        if (a.distanceToCustomerKm == null && b.distanceToCustomerKm == null) return 0;
        if (a.distanceToCustomerKm == null) return 1;
        if (b.distanceToCustomerKm == null) return -1;
        return a.distanceToCustomerKm - b.distanceToCustomerKm;
      })
      .map(({ product }) => product);
  }, [catalog.products, categoryFilter, communeFilter, budgetFilter, query, customerLocation]);

  const featuredProducts = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
  const heroProduct = featuredProducts[0] ?? catalog.products[0] ?? null;
  const highlightedVendors = useMemo(() => catalog.vendors.slice(0, 6), [catalog.vendors]);

  const selectionEconomics = useMemo(
    () =>
      calculateOrderEconomics({
        items: selectedProducts.map((product) => ({ price: product.price, commissionRate: 0.15 })),
        deliveryFee: fulfillmentMode === 'delivery' && selectedProducts.length > 0 ? 3.5 : 0,
        serviceFee: selectedProducts.length > 0 ? 1 : 0,
      }),
    [fulfillmentMode, selectedProducts],
  );

  const orderNumber = useMemo(() => `DK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(selectedProducts.length || 1).padStart(2, '0')}`, [selectedProducts.length]);

  const deliveryLabel = fulfillmentMode === 'delivery' ? 'Livraison' : 'Retrait';
  const deliverySlotLabel = deliverySlot || 'Créneau à confirmer';
  const customerMapsLabel = customerLocation?.mapsUrl || 'Position GPS non fournie — confirmer adresse manuellement';
  const customerMapPreviewLocation = pendingCustomerLocation ?? customerLocation;
  const productLines = useMemo(
    () =>
      selectedProducts.length
        ? selectedProducts.map((product) => `- ${product.name} x1 — ${product.vendor_name} — ${formatPrice(product.price)}`)
        : ['- Disponibilités du moment à proposer'],
    [selectedProducts],
  );

  const vendorMessage = useMemo(
    () =>
      [
        '📩 DEMANDE DISPONIBILITE VENDEUR',
        `Commande : ${orderNumber}`,
        'Produits à préparer :',
        ...productLines,
        `Créneau client : ${deliverySlotLabel}`,
        `Mode : ${deliveryLabel}`,
        `Adresse ou zone client : ${deliveryAddress || 'Adresse non fournie'}`,
        `Position Maps : ${customerMapsLabel}`,
        `Total : ${formatPrice(selectionEconomics.total_client)}`,
        `Statut disponibilité : ${vendorAvailabilityStatus}`,
        '',
        'Merci de répondre :',
        'OK disponible + délai préparation',
        'ou',
        'KO indisponible / alternative possible',
      ].join('\n'),
    [
      customerMapsLabel,
      deliveryAddress,
      deliveryLabel,
      deliverySlotLabel,
      orderNumber,
      productLines,
      selectionEconomics.total_client,
      vendorAvailabilityStatus,
    ],
  );

  const driverMessage = useMemo(
    () =>
      [
        '🚚 MISSION LIVRAISON DELIKREOL',
        `Commande : ${orderNumber}`,
        `Pickup : ${selectedProducts[0]?.vendor_name || 'Vendeur à confirmer'} / adresse vendeur si disponible`,
        `Drop client : ${deliveryAddress || 'Adresse client non fournie'}`,
        `Position client : ${customerMapsLabel}`,
        `Créneau : ${deliverySlotLabel}`,
        `Instructions : ${deliveryNotes || 'Aucune instruction'}`,
        `Montant commande : ${formatPrice(selectionEconomics.total_client)}`,
        'Statut : attendre confirmation vendeur avant départ',
      ].join('\n'),
    [customerMapsLabel, deliveryAddress, deliveryNotes, deliverySlotLabel, orderNumber, selectedProducts, selectionEconomics.total_client],
  );

  const partnerDispatchMessage = useMemo(
    () =>
      buildPartnerDispatchMessage({
        orderNumber,
        products: selectedProducts,
        deliveryMode: deliveryLabel,
        deliveryFee: selectionEconomics.frais_livraison,
        serviceFee: selectionEconomics.frais_service,
        total: selectionEconomics.total_client,
        paymentStatus: paymentMethod,
        slot: deliverySlotLabel,
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryNotes,
        customerMapsUrl: customerLocation?.mapsUrl,
        customerLat: customerLocation?.lat,
        customerLng: customerLocation?.lng,
        customerAccuracy: customerLocation?.accuracy,
      }),
    [
      customerLocation,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLabel,
      deliveryNotes,
      deliverySlotLabel,
      orderNumber,
      paymentMethod,
      selectedProducts,
      selectionEconomics,
    ],
  );

  const supportLink = useMemo(
    () =>
      `${whatsappBase}?text=${encodeURIComponent(
        `Bonjour DELIKREOL, j’ai besoin d’aide pour finaliser ma commande ${orderNumber}.`,
      )}`,
    [orderNumber],
  );

  const partnerDispatchLink = useMemo(() => {
    const subject = `Commande DELIKREOL ${orderNumber}`;
    return `mailto:${operationsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(partnerDispatchMessage)}`;
  }, [operationsEmail, orderNumber, partnerDispatchMessage]);

  const driverMissionLink = useMemo(() => `${whatsappBase}?text=${encodeURIComponent(driverMessage)}`, [driverMessage]);

  const partnerLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour DELIKREOL, je souhaite devenir partenaire.')}`;

  const businessLink = useMemo(() => {
    const body = [
      'Bonjour DELIKREOL, je souhaite une demande entreprise.',
      businessRequestForm.company_name && `Entreprise : ${businessRequestForm.company_name}`,
      businessRequestForm.contact && `Contact : ${businessRequestForm.contact}`,
      businessRequestForm.people_count && `Nombre de personnes : ${businessRequestForm.people_count}`,
      businessRequestForm.requested_date && `Date : ${businessRequestForm.requested_date}`,
      businessRequestForm.requested_time && `Heure : ${businessRequestForm.requested_time}`,
      businessRequestForm.location && `Lieu : ${businessRequestForm.location}`,
      businessRequestForm.budget && `Budget : ${businessRequestForm.budget}`,
      businessRequestForm.frequency && `Fréquence : ${businessRequestForm.frequency}`,
      businessRequestForm.details && `Détails : ${businessRequestForm.details}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `${whatsappBase}?text=${encodeURIComponent(body || 'Bonjour DELIKREOL, je souhaite une demande entreprise.')}`;
  }, [businessRequestForm]);

  async function handlePartnerLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerStatus({ kind: 'saving', message: 'Envoi de la demande partenaire...' });

    try {
      await submitPartnerLead({
        business_name: partnerLeadForm.business_name,
        contact_name: partnerLeadForm.contact_name,
        phone: partnerLeadForm.phone,
        whatsapp: partnerLeadForm.whatsapp || partnerLeadForm.phone,
        email: partnerLeadForm.email || undefined,
        commune: partnerLeadForm.commune || undefined,
        zone_label: partnerLeadForm.zone_label || partnerLeadForm.commune || undefined,
        activity_type: partnerLeadForm.activity_type || undefined,
        delivery_radius_km: Number(partnerLeadForm.delivery_radius_km || '8'),
        opening_hours: partnerLeadForm.opening_hours || undefined,
      });
      setPartnerStatus({ kind: 'success', message: 'Demande envoyée. Votre dossier sera examiné rapidement.' });
      trackPartnerLeadSuccess({
        activity_type: partnerLeadForm.activity_type || null,
        commune: partnerLeadForm.commune || null,
      });
      setPartnerLeadForm(defaultPartnerLeadForm);
    } catch (submitError) {
      setPartnerStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la demande pour le moment.') });
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductStatus({ kind: 'saving', message: 'Envoi de la proposition...' });

    try {
      let imageUrl: string | null = null;
      if (productPhoto) {
        const uploaded = await uploadPartnerProductPhoto(productPhoto);
        imageUrl = uploaded.publicUrl;
      }

      await submitPartnerProduct({
        business_name: productSubmissionForm.business_name,
        product_name: productSubmissionForm.product_name,
        description: productSubmissionForm.description || undefined,
        category: productSubmissionForm.category || undefined,
        price: Number(productSubmissionForm.price || '0'),
        is_available: true,
        image_url: imageUrl,
      });

      setProductStatus({ kind: 'success', message: 'Proposition envoyée. Elle sera vérifiée avant affichage.' });
      trackProductSubmissionSuccess({
        category: productSubmissionForm.category || null,
        has_photo: Boolean(productPhoto),
      });
      setProductSubmissionForm(defaultProductSubmissionForm);
      setProductPhoto(null);
    } catch (submitError) {
      setProductStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la proposition pour le moment.') });
    }
  }

  async function handleBusinessRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusinessStatus({ kind: 'saving', message: 'Envoi de la demande entreprise...' });

    try {
      await createBusinessRequest({
        company_name: businessRequestForm.company_name,
        contact: businessRequestForm.contact,
        people_count: businessRequestForm.people_count ? Number(businessRequestForm.people_count) : null,
        requested_date: businessRequestForm.requested_date || null,
        requested_time: businessRequestForm.requested_time || null,
        location: businessRequestForm.location || null,
        budget: businessRequestForm.budget || null,
        frequency: businessRequestForm.frequency || null,
      });
      setBusinessStatus({ kind: 'success', message: 'Demande entreprise envoyée. Un retour rapide est attendu.' });
      trackBusinessRequestSuccess({
        company_name: businessRequestForm.company_name || null,
        people_count: businessRequestForm.people_count ? Number(businessRequestForm.people_count) : null,
      });
      setBusinessRequestForm(defaultBusinessRequestForm);
    } catch (submitError) {
      setBusinessStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la demande entreprise pour le moment.') });
    }
  }

  function addToSelection(product: PublicCatalogProduct) {
    setSelectedProducts((current) => [...current, product]);
    setOrderConfirmed(false);
    setCheckoutStatus({ kind: 'idle' });
    showSuccess('Ajouté au panier');
  }

  function removeFromSelection(index: number) {
    setSelectedProducts((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setOrderConfirmed(false);
    setCheckoutStatus({ kind: 'idle' });
  }

  function clearSelection() {
    setSelectedProducts([]);
    setOrderConfirmed(false);
    setCheckoutStatus({ kind: 'idle' });
  }

  function buildOrderSummary(orderNumberValue: string) {
    const lines = selectedProducts.map((product) => `- ${product.name} (${formatPrice(product.price)}) — ${product.vendor_name}`).join('\n');
    const total = formatPrice(selectionEconomics.total_client);
    const delivery = fulfillmentMode === 'delivery' ? `Livraison: ${deliveryAddress.trim() || '(adresse à confirmer)'}` : 'Retrait';
    const slot = deliverySlot.trim() ? `Créneau: ${deliverySlot.trim()}` : '';
    const notes = deliveryNotes.trim() ? `Notes: ${deliveryNotes.trim()}` : '';
    const who = `Client: ${customerName.trim() || '(nom)'} | ${customerPhone.trim() || '(téléphone)'}`;

    return [
      `Commande: ${orderNumberValue}`,
      who,
      delivery,
      slot,
      notes,
      '',
      'Panier:',
      lines,
      '',
      `Total estimé: ${total}`,
      `Paiement souhaité: ${paymentMethod}`,
      `Statut vendeur: ${vendorAvailabilityStatus}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  function buildWhatsAppFallbackOrderMessage() {
    return [
      'Bonjour DELIKREOL, je souhaite commander.',
      buildOrderSummary(orderNumber),
      '',
      'Contexte: Supabase en pause, mode secours activé.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  function handleWhatsAppCheckoutFallback() {
    const message = buildWhatsAppFallbackOrderMessage();
    const link = getWhatsAppBusinessLink(whatsappNumber, message);
    // Aggressive fallback: always copy message, then attempt to open WhatsApp.
    void copyOperationalMessage(message, 'Message WhatsApp prêt. Collez-le si WhatsApp ne s’ouvre pas automatiquement.');
    window.location.href = link;
  }

  async function handleCheckout() {
    if (selectedProducts.length === 0) {
      setCheckoutStatus({ kind: 'error', message: 'Ajoutez au moins un produit au panier.' });
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutStatus({ kind: 'error', message: 'Nom et téléphone sont obligatoires pour confirmer la commande.' });
      return;
    }

    if (fulfillmentMode === 'delivery' && !deliveryAddress.trim()) {
      setCheckoutStatus({ kind: 'error', message: 'Adresse obligatoire pour une livraison.' });
      return;
    }

    const checkoutOrderId = crypto.randomUUID();
    const checkoutOrderNumber = `DK-${Date.now().toString(36).toUpperCase()}`;
    const hasSheetsEndpoint = Boolean(getOrderFallbackEndpoint());
    const hasOrderFormFallback = Boolean(orderFormUrl);
    const orderItemsPayload = selectedProducts.map((product) => ({
      order_id: checkoutOrderId,
      product_id: product.id,
      vendor_id: product.vendor_id,
      product_name: product.name,
      vendor_name: product.vendor_name,
      quantity: 1,
      unit_price: product.price,
      vendor_commission: Number((product.price * 0.15).toFixed(2)),
    }));

    const fallbackToOrderForm = async (reason: string) => {
      if (!hasOrderFormFallback) return false;
      setSupabasePaused(true);
      setSupabasePausedHint(reason);

      const formSummary = [
        'Finalisez la commande via formulaire.',
        '',
        buildOrderSummary(checkoutOrderNumber),
      ].join('\n');

      await copyOperationalMessage(formSummary, 'Récapitulatif commande');
      const opened = window.open(orderFormUrl, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.assign(orderFormUrl);

      setOrderConfirmed(true);
      setCheckoutStatus({
        kind: 'success',
        orderNumber: checkoutOrderNumber,
        message: `Commande ${checkoutOrderNumber} préparée. Finalisez via le formulaire sécurisé.`,
      });
      trackCheckoutSuccess({
        order_number: checkoutOrderNumber,
        items_count: selectedProducts.length,
        total_amount: selectionEconomics.total_client,
        mode: `${fulfillmentMode}_form`,
      });
      return true;
    };

    const fallbackToSheets = async (reason: string) => {
      setSupabasePaused(true);
      setSupabasePausedHint(reason);
      if (!hasSheetsEndpoint) {
        if (await fallbackToOrderForm(`${reason} Endpoint Sheets non configuré.`)) {
          return true;
        }
        setCheckoutStatus({
          kind: 'error',
          message: 'Commande indisponible: configurez VITE_SHEETS_ORDERS_URL ou VITE_ORDER_FORM_URL.',
        });
        return false;
      }

      const saved = await saveFallbackOrderToSheet({
        order_id: checkoutOrderId,
        order_number: checkoutOrderNumber,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        fulfillment_mode: fulfillmentMode,
        delivery_address: deliveryAddress.trim() || null,
        delivery_slot: deliverySlot.trim() || null,
        payment_method: paymentMethod,
        vendor_availability_status: vendorAvailabilityStatus,
        total_amount: selectionEconomics.total_client,
        source: sheetsFirstMode ? 'public_checkout_sheets_first' : 'public_checkout_fallback',
        items: orderItemsPayload.map((item) => ({
          product_id: item.product_id,
          vendor_id: item.vendor_id,
          product_name: item.product_name,
          vendor_name: item.vendor_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      if (!saved.saved) {
        if (await fallbackToOrderForm(`${reason} ${saved.error || 'Erreur endpoint Sheets.'}`)) {
          return true;
        }
        setCheckoutStatus({
          kind: 'error',
          message:
            `Commande applicative indisponible (${saved.error || 'endpoint secours absent'}). ` +
            'Utilisez le bouton support.',
        });
        return false;
      }

      setOrderConfirmed(true);
      setCheckoutStatus({
        kind: 'success',
        orderNumber: checkoutOrderNumber,
        message: `Commande ${checkoutOrderNumber} enregistrée en mode Sheets. Paiement : pending.`,
      });
      trackCheckoutSuccess({
        order_number: checkoutOrderNumber,
        items_count: selectedProducts.length,
        total_amount: selectionEconomics.total_client,
        mode: sheetsFirstMode ? `${fulfillmentMode}_sheets_first` : `${fulfillmentMode}_fallback`,
      });
      return true;
    };

    if (sheetsFirstMode) {
      setCheckoutStatus({ kind: 'saving', message: 'Enregistrement de la commande (mode gratuit)...' });
      await fallbackToSheets('Mode gratuit actif. Enregistrement prioritaire sur Sheets.');
      return;
    }

    if (!publicSupabase || supabasePaused) {
      await fallbackToSheets(
        !publicSupabase
          ? 'Backend Supabase indisponible (configuration). Bascule sur enregistrement Sheets.'
          : 'Supabase est en pause. Bascule sur enregistrement Sheets.',
      );
      return;
    }

    setCheckoutStatus({ kind: 'saving', message: 'Création de la commande...' });

    const orderPayload = {
      id: checkoutOrderId,
      order_number: checkoutOrderNumber,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      status: 'pending',
      payment_status: 'pending',
      delivery_status: 'pending',
      delivery_type: fulfillmentMode === 'delivery' ? 'home_delivery' : 'pickup',
      delivery_address: deliveryAddress.trim() || null,
      delivery_latitude: customerLocation?.lat ?? null,
      delivery_longitude: customerLocation?.lng ?? null,
      scheduled_time: deliverySlot.trim() || null,
      delivery_fee: selectionEconomics.frais_livraison,
      total_amount: selectionEconomics.total_client,
      source: 'public_checkout',
      notes: [
        deliveryNotes && `Instructions: ${deliveryNotes}`,
        customerLocation?.mapsUrl && `Maps: ${customerLocation.mapsUrl}`,
        `Paiement souhaité: ${paymentMethod}`,
        `Statut vendeur: ${vendorAvailabilityStatus}`,
      ]
        .filter(Boolean)
        .join('\n') || null,
    };

    try {
      const { error: orderError } = await publicSupabase.from('orders').insert(orderPayload);
      if (orderError) {
        if (isSupabasePausedError(orderError) || isSupabaseUnavailableError(orderError)) {
          await fallbackToSheets('Supabase indisponible. Bascule sur enregistrement Sheets.');
          return;
        }
        setCheckoutStatus({ kind: 'error', message: `Commande non créée : ${orderError.message}` });
        return;
      }

      const { error: itemsError } = await publicSupabase.from('order_items').insert(orderItemsPayload);
      if (itemsError) {
        if (isSupabasePausedError(itemsError) || isSupabaseUnavailableError(itemsError)) {
          await fallbackToSheets('Supabase indisponible. Bascule sur enregistrement Sheets.');
          return;
        }
        setCheckoutStatus({ kind: 'error', message: `Produits non enregistrés : ${itemsError.message}` });
        return;
      }
    } catch (unexpectedError) {
      if (isSupabasePausedError(unexpectedError) || isSupabaseUnavailableError(unexpectedError)) {
        await fallbackToSheets('Supabase indisponible. Bascule sur enregistrement Sheets.');
        return;
      }
      setCheckoutStatus({
        kind: 'error',
        message: `Erreur checkout : ${String((unexpectedError as any)?.message ?? unexpectedError)}`,
      });
      return;
    }

    setOrderConfirmed(true);
    setCheckoutStatus({
      kind: 'success',
      orderNumber: checkoutOrderNumber,
      message: `Commande ${checkoutOrderNumber} enregistrée. Statut : pending. Paiement : pending.`,
    });
    trackCheckoutSuccess({
      order_number: checkoutOrderNumber,
      items_count: selectedProducts.length,
      total_amount: selectionEconomics.total_client,
      mode: fulfillmentMode,
    });
  }

  async function requestNotifications() {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  function askCustomerPosition() {
    if (geoStatus === 'loading') return;
    setGeoError('');
    setGeoConsentState('ask');
  }

  function cancelCustomerPositionConsent() {
    setGeoConsentState('declined');
    setGeoError('');
  }

  function useCustomerPosition() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      setGeoConsentState('declined');
      setGeoError('Géolocalisation non supportée par ce navigateur. Saisissez l’adresse manuellement.');
      return;
    }

    setGeoStatus('loading');
    setGeoConsentState('ask');
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPendingCustomerLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          mapsUrl: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
        });
        setGeoStatus('success');
        setGeoConsentState('granted');
      },
      (positionError) => {
        setGeoStatus('error');
        setGeoConsentState('declined');
        setGeoError(
          positionError.code === positionError.PERMISSION_DENIED
            ? 'Permission refusée. Saisissez l’adresse manuellement.'
            : 'Position indisponible. Saisissez l’adresse manuellement.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function confirmPendingCustomerPosition() {
    if (!pendingCustomerLocation) {
      setGeoError('Aucune position détectée à valider.');
      return;
    }
    setCustomerLocation(pendingCustomerLocation);
    setPendingCustomerLocation(null);
    setGeoConsentState('granted');
    setGeoError('');
    showSuccess('Position validée.');
  }

  function rejectPendingCustomerPosition() {
    setPendingCustomerLocation(null);
    setGeoConsentState('declined');
    if (!customerLocation) setGeoStatus('idle');
  }

  async function copyOperationalMessage(message: string, label: string) {
    try {
      if ('clipboard' in navigator && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = message;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus(`${label} copié. Validez humainement avant envoi.`);
    } catch {
      setCopyStatus(`Copie impossible pour ${label}. Utilisez le bouton WhatsApp ou email.`);
    }
  }

  function handleDownloadOrderPdf() {
    downloadOrderPdf({
      orderNumber,
      products: selectedProducts,
      deliveryMode: deliveryLabel,
      deliveryFee: selectionEconomics.frais_livraison,
      serviceFee: selectionEconomics.frais_service,
      total: selectionEconomics.total_client,
      paymentStatus: paymentMethod,
      slot: deliverySlotLabel,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryNotes,
      customerMapsUrl: customerLocation?.mapsUrl,
      customerLat: customerLocation?.lat,
      customerLng: customerLocation?.lng,
      customerAccuracy: customerLocation?.accuracy,
    });
  }

  function confirmOrderLocally() {
    setOrderConfirmed(true);
  }

  function scrollToCheckoutPanel() {
    const target = document.getElementById('commande');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#fbf4ea] text-[#2a190f]">
      <header className="sticky top-0 z-50 border-b border-white/80 bg-[#fff8ec]/92 backdrop-blur-xl">
        <div className="relative mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#7c2d12] shadow-sm">
              Martinique
            </span>
          </div>

          <a href="#accueil" className="brand-logo-frame flex items-center gap-3 rounded-2xl px-3 py-2" aria-label="DELIKREOL accueil">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-12 w-12 rounded-2xl bg-white p-1.5 shadow-lg sm:h-14 sm:w-14" />
            <div className="leading-none">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#c2410c]">Local premium</p>
              <p className="text-lg font-black tracking-tight text-[#2a190f] sm:text-xl">DELIKREOL</p>
            </div>
          </a>

          <nav className="absolute left-1/2 top-full hidden -translate-x-1/2 items-center gap-2 rounded-b-[1.5rem] border border-t-0 border-orange-100 bg-[#fff8ec]/95 px-4 py-2 shadow-soft backdrop-blur lg:flex">
            <NavLink href="#catalogue">Catalogue</NavLink>
            <NavLink href="#zones">Zones</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          <div className="hidden items-end gap-3 xl:flex">
            <div className="text-right leading-tight">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c2410c]">Contact dédié</p>
              <a href={`https://wa.me/${whatsappNumber}`} className="text-sm font-black text-[#2a190f] hover:text-[#c2410c]">
                WhatsApp {formatWhatsAppLabel(whatsappNumber)}
              </a>
              <a href={publicSiteUrl} className="block text-[11px] font-semibold text-stone-500 hover:text-[#7c2d12]" target="_blank" rel="noreferrer">
                {publicSiteUrl.replace('https://', '')}
              </a>
            </div>
            <a
              href={customerPath}
              onClick={(event) => {
                event.preventDefault();
                gotoCustomer();
              }}
              className="inline-flex rounded-full bg-[#d95f2d] px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
            >
              Commander
            </a>
          </div>
        </div>
      </header>

      <main id="accueil">
        <section className="island-hero-surface relative overflow-hidden border-b border-orange-100">
          <div className="madras-strip" />
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
            <div className="brand-hero-glow flex flex-col justify-center">
              <div className="mx-auto flex w-fit flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
                <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-20 w-20 rounded-[1.6rem] bg-white p-2 shadow-2xl shadow-orange-900/10 sm:h-24 sm:w-24" />
                <BadgeRow />
              </div>
              <h1 className="mt-5 max-w-4xl text-center font-display text-4xl font-black leading-[0.94] tracking-tight text-[#2a190f] sm:text-6xl lg:text-left lg:text-7xl">
                Le réflexe local qui donne envie de commander.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-[#5a4334] sm:text-lg lg:mx-0 lg:text-left">
                Plats créoles et produits locaux en Martinique. Choisissez, ajoutez au panier, confirmez en moins de 2 minutes.
              </p>

              <div className="mt-7 rounded-[2rem] border border-white/80 bg-white/88 p-3 shadow-2xl shadow-orange-900/10 backdrop-blur">
                <div className="grid gap-3 lg:grid-cols-[1fr_210px]">
                  <label className="relative block">
                    <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c2410c]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Adresse, commune ou produit"
                      className="h-16 w-full rounded-[1.35rem] border border-orange-100 bg-[#fffaf4] pl-14 pr-4 text-base font-black text-[#2a190f] outline-none ring-orange-200 placeholder:text-stone-400 focus:ring-4"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => gotoCustomer()}
                    className="inline-flex h-16 items-center justify-center gap-2 rounded-[1.35rem] bg-[#d95f2d] px-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5"
                  >
                    Commander maintenant <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Communes partenaires</span>
                  {serviceZones.slice(0, 4).map((zone) => (
                    <span key={zone} className="rounded-lg border border-orange-100 bg-[#fff8ef] px-3 py-1.5 text-xs font-black text-[#7c2d12]">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => gotoCustomer()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2a190f] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-stone-900/15 transition hover:-translate-y-0.5"
                >
                  Commander maintenant <ShoppingBag className="h-4 w-4" />
                </button>
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour DELIKREOL, je veux être orienté vers l’offre la plus adaptée.')}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white/80 px-6 py-4 text-sm font-black text-[#7c2d12] transition hover:-translate-y-0.5">
                  Besoin d’aide <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="premium-card relative rounded-[2.4rem] border border-white/80 bg-white/75 p-3 shadow-elegant backdrop-blur">
              {heroProduct ? (
                <div className="overflow-hidden rounded-[2rem] bg-[#20150f] text-white shadow-2xl">
                  <div className="relative aspect-[4/4] sm:aspect-[16/13] lg:aspect-[4/3]">
                    {heroProduct.image_url ? (
                      <img src={heroProduct.image_url} alt={heroProduct.name} className="h-full w-full object-cover" />
                    ) : (
                      <HeroFallback name={heroProduct.name} />
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-white/92 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#7c2d12] shadow-lg">
                      Ambiance Martinique
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/48 to-transparent p-5 sm:p-7">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Produit phare</p>
                      <h2 className="mt-2 max-w-md text-3xl font-black sm:text-4xl">{heroProduct.name}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
                        <span className="rounded-full bg-white/10 px-3 py-1">{heroProduct.vendor_name}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1">Rayon {heroProduct.vendor_delivery_radius_km} km</span>
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <strong className="text-3xl font-black text-orange-200">{formatPrice(heroProduct.price)}</strong>
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                          Disponible
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <HeroFallback name="DELIKREOL" loading={loading} configured={catalog.configured} />
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {trustPills.map((pill) => (
                  <TrustCard key={pill} label={pill} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle
            eyebrow="Comment ça marche"
            title="Chercher, ajouter, confirmer, suivre."
            text="Un parcours court, lisible sur mobile."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {howItWorks.slice(0, 3).map((step, index) => (
              <StepCard key={step.title} index={index + 1} title={step.title} text={step.text} />
            ))}
          </div>
        </section>

        <section id="catalogue" className="bg-[#fffdf8] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-5 rounded-[2.25rem] border border-orange-100 bg-white p-5 shadow-soft lg:flex-row lg:items-end lg:justify-between lg:p-7">
              <SectionTitle
                eyebrow="Catalogue"
                title="Choisir vite, commander clair."
                text="Parcours client prioritaire: produits visibles, ajout au panier, validation."
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => gotoCustomer()}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-[#d95f2d] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-500/25"
                >
                  Commander maintenant <ShoppingBag className="h-5 w-5" />
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour DELIKREOL, j’ai besoin d’aide pour choisir une offre.')}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#7c2d12] shadow-sm"
                >
                  Besoin d’aide
                </a>
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[2rem] border border-orange-100 bg-[#24170f] p-4 shadow-elegant lg:grid-cols-[1fr_220px_220px_220px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c2410c]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un plat, un traiteur, un produit ou une commune"
                  className="w-full rounded-2xl border border-white/10 bg-white py-4 pl-12 pr-4 text-sm font-black text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
                />
              </label>
              <Select value={communeFilter} onChange={setCommuneFilter}>
                <option value="Tous">Selon votre adresse / position</option>
                {serviceZones.map((zone) => (
                  <option key={zone} value={zone}>
                    Fallback commune : {zone}
                  </option>
                ))}
              </Select>
              <Select value={budgetFilter} onChange={setBudgetFilter}>
                {budgetRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={askCustomerPosition}
                disabled={geoStatus === 'loading'}
                className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#2a190f] transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {customerLocation ? 'Position validée' : pendingCustomerLocation ? 'Valider position' : geoStatus === 'loading' ? 'Localisation...' : 'Me géolocaliser'}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold text-stone-600">
              La livraison est calculée autour de chaque partenaire avec son rayon réel. La commune sert seulement de fallback si la position manque.
            </p>
            {geoConsentState === 'ask' && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-[#fff8ef] p-4">
                <p className="text-sm font-black text-[#7c2d12]">Souhaitez-vous être géolocalisé et affiché sur la carte ?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={useCustomerPosition}
                    disabled={geoStatus === 'loading'}
                    className="rounded-xl bg-[#d95f2d] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                  >
                    Oui, autoriser
                  </button>
                  <button
                    type="button"
                    onClick={cancelCustomerPositionConsent}
                    className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-black text-[#7c2d12]"
                  >
                    Non, merci
                  </button>
                </div>
              </div>
            )}
            {customerMapPreviewLocation && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100">
                <MapContainer center={[customerMapPreviewLocation.lat, customerMapPreviewLocation.lng]} zoom={16} scrollWheelZoom={false} className="h-52 w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CircleMarker
                    center={[customerMapPreviewLocation.lat, customerMapPreviewLocation.lng]}
                    radius={8}
                    pathOptions={{ color: '#d95f2d', fillColor: '#d95f2d', fillOpacity: 0.9 }}
                  >
                    <Popup>Votre position</Popup>
                  </CircleMarker>
                </MapContainer>
                {pendingCustomerLocation && (
                  <div className="grid grid-cols-1 gap-2 border-t border-orange-100 bg-orange-50 p-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={confirmPendingCustomerPosition}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                    >
                      Valider ma position
                    </button>
                    <button
                      type="button"
                      onClick={rejectPendingCustomerPosition}
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-800"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryOptions.slice(0, 12).map((category) => {
                const active = categoryFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                      active
                        ? 'border-transparent bg-[#d95f2d] text-white shadow-lg shadow-orange-500/20'
                        : 'border-orange-200 bg-white text-[#7c2d12] hover:-translate-y-0.5'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                {loading && <EmptyState title="Catalogue en chargement" text="Les offres apparaîtront dès que les partenaires publiés sont récupérés." />}
                {error && <EmptyState title="Catalogue indisponible" text={error} />}
                {!loading && !error && filteredProducts.length === 0 && (
                  <EmptyState
                    title="Aucune offre visible avec ces filtres"
                    text="Affinez la commune, la catégorie ou le budget. Vous pouvez aussi demander une orientation immédiate."
                    action={supportLink}
                  />
                )}

                {filteredProducts.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c2410c]">Sélection en vedette</p>
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">{featuredProducts.length} cartes</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {featuredProducts.map((product) => (
                        <ProductCard key={`featured-${product.id}`} product={product} onAdd={() => addToSelection(product)} compact />
                      ))}
                    </div>

                    <div id="commande" className="mt-8 scroll-mt-28 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} onAdd={() => addToSelection(product)} />
                        ))}
                      </div>
                      <SelectionPanel
                        products={selectedProducts}
                        summary={selectionEconomics}
                        supportLink={supportLink}
                        partnerDispatchLink={partnerDispatchLink}
                        driverMissionLink={driverMissionLink}
                        vendorMessage={vendorMessage}
                        driverMessage={driverMessage}
                        copyStatus={copyStatus}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        deliveryAddress={deliveryAddress}
                        deliveryNotes={deliveryNotes}
                        deliverySlot={deliverySlot}
                        customerLocation={customerLocation}
                        geoStatus={geoStatus}
                        geoConsentState={geoConsentState}
                        geoError={geoError}
                        pendingCustomerLocation={pendingCustomerLocation}
                        fulfillmentMode={fulfillmentMode}
                        paymentMethod={paymentMethod}
                        vendorAvailabilityStatus={vendorAvailabilityStatus}
                        notificationPermission={notificationPermission}
                        notificationPrefs={notificationPrefs}
                        orderConfirmed={orderConfirmed}
                        checkoutStatus={checkoutStatus}
                        supabasePaused={supabasePaused}
                        supabasePausedHint={supabasePausedHint}
                        onCustomerNameChange={setCustomerName}
                        onCustomerPhoneChange={setCustomerPhone}
                        onDeliveryAddressChange={setDeliveryAddress}
                        onDeliveryNotesChange={setDeliveryNotes}
                        onDeliverySlotChange={setDeliverySlot}
                        onCustomerPositionRequest={askCustomerPosition}
                        onConfirmCustomerPosition={useCustomerPosition}
                        onCancelCustomerPosition={cancelCustomerPositionConsent}
                        onValidatePendingCustomerPosition={confirmPendingCustomerPosition}
                        onRejectPendingCustomerPosition={rejectPendingCustomerPosition}
                        onFulfillmentModeChange={setFulfillmentMode}
                        onPaymentMethodChange={setPaymentMethod}
                        onVendorAvailabilityStatusChange={setVendorAvailabilityStatus}
                        onCopyVendorMessage={() => copyOperationalMessage(vendorMessage, 'Message vendeur')}
                        onCopyDriverMessage={() => copyOperationalMessage(driverMessage, 'Mission livreur')}
                        onNotificationPreferenceChange={(key, value) => setNotificationPrefs((current) => ({ ...current, [key]: value }))}
                        onRequestNotifications={requestNotifications}
                        onDownloadPdf={handleDownloadOrderPdf}
                        onConfirmOrder={handleCheckout}
                        onWhatsAppFallback={handleWhatsAppCheckoutFallback}
                        onRemove={removeFromSelection}
                        onClear={clearSelection}
                      />
                    </div>
                  </>
                )}
              </div>

              <aside className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Fiche produit</p>
                <h3 className="mt-2 text-2xl font-black text-[#2a190f]">Lecture rapide</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Chaque fiche affiche le vendeur, la commune, le prix et l’action de conversion la plus simple. C’est la vitrine la plus rentable du site.
                </p>
                {heroProduct ? (
                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-orange-100">
                    <div className="aspect-[4/3] bg-[#fff2e6]">
                      {heroProduct.image_url ? (
                        <img src={heroProduct.image_url} alt={heroProduct.name} className="h-full w-full object-cover" />
                      ) : (
                        <HeroFallback name={heroProduct.name} />
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">
                        <BadgeCheck className="h-4 w-4" />
                        partenaire visible
                      </div>
                      <h4 className="text-xl font-black text-[#2a190f]">{heroProduct.name}</h4>
                      <p className="text-sm text-stone-600">{heroProduct.vendor_name}</p>
                      <div className="grid gap-2 text-sm text-stone-600">
                        <InfoLine label="Couverture" value={`Livraison autour du partenaire - ${heroProduct.vendor_delivery_radius_km} km`} />
                        <InfoLine label="Prix" value={formatPrice(heroProduct.price)} />
                        <InfoLine label="Service" value="Retrait / livraison selon adresse client" />
                        <InfoLine label="Disponibilité" value={heroProduct.available ? 'Disponible' : 'À confirmer'} />
                      </div>
                      <button type="button" onClick={() => addToSelection(heroProduct)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                        Ajouter et commander
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm text-stone-600">
                    Aucune fiche produit active pour le moment. Les prochaines offres publiées apparaîtront ici.
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl px-4 py-14">
          <div className="island-map-surface rounded-[2.5rem] border border-orange-100 p-5 shadow-elegant lg:p-8">
            <div className="relative z-10">
              <SectionTitle
                eyebrow="Zones desservies"
                title="Une carte locale claire."
                text="La couverture se base sur la position de chaque partenaire et son rayon de livraison. La commune reste un repère de secours."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {serviceZones.slice(0, 8).map((zone) => (
                  <ZoneCard key={zone} zone={zone} />
                ))}
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {highlightedVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pro" className="mx-auto max-w-7xl px-4 pb-10">
          <details className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-[#7c2d12]">
              Vous êtes partenaire, livreur ou entreprise ? Ouvrir l’espace pro
            </summary>
            <p className="mt-3 text-sm text-stone-600">
              Cette zone est secondaire pour le public. Le flux principal reste le catalogue et la commande.
            </p>
            <div className="mt-6 space-y-8">
        <section className="bg-[#fff8ef] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-[2.4rem] border border-orange-100 bg-white p-5 shadow-soft lg:p-8">
              <SectionTitle
                eyebrow="Partenaires"
                title="Un accès propre pour chaque rôle."
                text="Vendeur, livreur, point relais ou entreprise : une carte courte, une action claire."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {roleCards.map((role) => (
                  <RoleCard key={role.title} {...role} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="livreur" className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-6 rounded-[2rem] border border-orange-100 bg-white p-5 shadow-elegant lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Livreurs</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-[#2a190f] sm:text-5xl">Un parcours livreur simple à comprendre.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                DELIKREOL doit afficher ce qui compte avant l’inscription: gains estimés, zone, rayon, disponibilités et véhicule.
              </p>
              <a href={`${whatsappBase}?text=${encodeURIComponent('Bonjour DELIKREOL, je souhaite devenir livreur.')}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                Devenir livreur <Truck className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {driverHighlights.map(([label, value]) => (
                <div key={label} className="rounded-[1.35rem] border border-orange-100 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{label}</p>
                  <p className="mt-2 text-lg font-black text-[#2a190f]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="rounded-[2rem] border border-orange-100 bg-[#24170f] p-5 text-white shadow-elegant lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Vérification opérationnelle</p>
                <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Tester le parcours complet sans toucher aux données publiques.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
                  Cet espace sert à contrôler les enchaînements client, vendeur, livreur, partenaire et entreprise sans modifier les données publiques.
                </p>
              </div>
              <span className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                Accès interne
              </span>
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-[320px_1fr]">
              <div className="grid gap-2">
                {simulationScenarios.map(([title], index) => (
                  <button
                    key={title}
                    onClick={() => setActiveScenario(index)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-black ${activeScenario === index ? 'bg-orange-300 text-[#24170f]' : 'bg-white/10 text-white'}`}
                  >
                    {title}
                  </button>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">Scénario actif</p>
                <h3 className="mt-2 text-2xl font-black">{simulationScenarios[activeScenario][0]}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-200">{simulationScenarios[activeScenario][1]}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Commande" value={selectedProducts.length ? `${selectedProducts.length} article(s)` : 'À sélectionner'} />
                  <MiniMetric label="Total" value={formatPrice(selectionEconomics.total_client)} />
                  <MiniMetric label="Paiement" value={paymentMethod} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reassurance.map((item) => (
              <ValueCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section id="entreprises" className="bg-[#24170f] py-14 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Entreprises & commandes groupées</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-black leading-tight sm:text-5xl">
                Repas d’équipe, commandes récurrentes, événements ou demandes urgentes.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                DELIKREOL permet à une entreprise de formuler une demande structurée, simple à traiter, avec un devis rapide et un suivi propre.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <BusinessChip text="Repas d’équipe" />
                <BusinessChip text="Commande récurrente" />
                <BusinessChip text="Événement / cocktail" />
                <BusinessChip text="Facturation" />
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MiniMetric label="Frais livraison" value="Selon commune" />
                  <MiniMetric label="Mode de paiement" value="Lien sécurisé" />
                  <MiniMetric label="Confirmation" value="WhatsApp + email" />
                  <MiniMetric label="Délai" value="Confirmé à la commande" />
                </div>
              </div>
            </div>

            <form onSubmit={handleBusinessRequestSubmit} className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Demande entreprise</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InputDark value={businessRequestForm.company_name} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, company_name: value }))} placeholder="Entreprise" required />
                <InputDark value={businessRequestForm.contact} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, contact: value }))} placeholder="Contact" required />
                <InputDark value={businessRequestForm.people_count} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, people_count: value }))} placeholder="Nombre de personnes" />
                <InputDark value={businessRequestForm.location} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, location: value }))} placeholder="Commune / lieu" />
                <InputDark value={businessRequestForm.requested_date} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, requested_date: value }))} placeholder="Date souhaitée" />
                <InputDark value={businessRequestForm.requested_time} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, requested_time: value }))} placeholder="Heure souhaitée" />
                <InputDark value={businessRequestForm.budget} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, budget: value }))} placeholder="Budget" />
                <InputDark value={businessRequestForm.frequency} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, frequency: value }))} placeholder="Fréquence" />
                <TextareaDark
                  value={businessRequestForm.details}
                  onChange={(value) => setBusinessRequestForm((current) => ({ ...current, details: value }))}
                  placeholder="Repas d’équipe, buffet, commande récurrente, livraison..."
                  className="sm:col-span-2"
                  rows={4}
                />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={businessStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 disabled:opacity-70">
                  {businessStatus.kind === 'saving' ? 'Envoi...' : 'Envoyer la demande'}
                </button>
                <a href={businessLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-black text-white">
                  Copier sur WhatsApp
                </a>
              </div>
              <StatusBanner status={businessStatus} />
            </form>
          </div>
        </section>

        <section id="partenaires" className="bg-[#fff4e2] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              eyebrow="Devenir partenaire"
              title="Restaurants, traiteurs, vendeurs et prestataires locaux."
              text="Le site permet de rejoindre la plateforme avec une fiche simple, un catalogue clair et une conversion pensée pour les smartphones."
            />

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr_1.08fr]">
              <div className="rounded-[1.75rem] bg-[#20150f] p-6 text-white shadow-elegant">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Pourquoi rejoindre DELIKREOL</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">Un site qui met en avant votre offre sans vous noyer.</h3>
                <div className="mt-6 space-y-3">
                  {[
                    'Visibilité locale premium',
                    'Fiche claire avec commune et zone',
                    'CTA WhatsApp et devis rapide',
                    'Catalogue produit ou service',
                    'Parcours pensé pour la conversion mobile',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <BadgeCheck className="h-5 w-5 text-emerald-300" />
                      <span className="text-sm font-semibold text-stone-100">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePartnerLeadSubmit} className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Formulaire partenaire</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input value={partnerLeadForm.business_name} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l’établissement" required className="sm:col-span-2" />
                  <Input value={partnerLeadForm.contact_name} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, contact_name: value }))} placeholder="Contact" required />
                  <Input value={partnerLeadForm.phone} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, phone: value }))} placeholder="Téléphone" required />
                  <Input value={partnerLeadForm.whatsapp} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, whatsapp: value }))} placeholder="WhatsApp" />
                  <Input value={partnerLeadForm.email} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, email: value }))} placeholder="Email" />
                  <Input value={partnerLeadForm.commune} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, commune: value }))} placeholder="Commune" />
                  <Input value={partnerLeadForm.zone_label} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, zone_label: value }))} placeholder="Commune fallback" />
                  <Input value={partnerLeadForm.delivery_radius_km} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, delivery_radius_km: value }))} placeholder="Rayon livraison pilote (3 km conseillé)" />
                  <Input value={partnerLeadForm.activity_type} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, activity_type: value }))} placeholder="Type d’activité" />
                  <Input value={partnerLeadForm.opening_hours} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, opening_hours: value }))} placeholder="Horaires" className="sm:col-span-2" />
                  <Textarea
                    value={partnerLeadForm.description}
                    onChange={(value) => setPartnerLeadForm((current) => ({ ...current, description: value }))}
                    placeholder="Décrivez votre activité, vos produits, votre livraison..."
                    className="sm:col-span-2"
                    rows={4}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={partnerStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 font-black text-white disabled:opacity-70">
                    {partnerStatus.kind === 'saving' ? 'Envoi...' : 'Envoyer ma demande'}
                  </button>
                  <a href={partnerLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-[#fff8ef] px-5 py-3 font-black text-[#7c2d12]">
                    WhatsApp partenaire
                  </a>
                </div>
                <StatusBanner status={partnerStatus} />
              </form>

              <form onSubmit={handleProductSubmit} className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Proposer un produit</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Ajoutez une offre ou une carte produit pour enrichir le catalogue local avec photo, prix et disponibilité.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input value={productSubmissionForm.business_name} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l’établissement" required className="sm:col-span-2" />
                  <Input value={productSubmissionForm.product_name} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, product_name: value }))} placeholder="Nom du produit" required />
                  <Input value={productSubmissionForm.category} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, category: value }))} placeholder="Catégorie" />
                  <Input value={productSubmissionForm.price} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, price: value }))} placeholder="Prix" />
                  <Textarea
                    value={productSubmissionForm.description}
                    onChange={(value) => setProductSubmissionForm((current) => ({ ...current, description: value }))}
                    placeholder="Description courte"
                    className="sm:col-span-2"
                    rows={4}
                  />
                  <label className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-600">
                    <span className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#c2410c]" />
                      {productPhoto ? productPhoto.name : 'Ajouter une photo produit'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setProductPhoto(event.target.files?.[0] ?? null)} />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">Choisir</span>
                  </label>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={productStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white disabled:opacity-70">
                    {productStatus.kind === 'saving' ? 'Envoi...' : 'Ajouter au catalogue'}
                  </button>
                  <span className="inline-flex items-center rounded-2xl border border-orange-100 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                    Visibilité locale premium
                  </span>
                </div>
                <StatusBanner status={productStatus} />
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle
            eyebrow="Preuves et confiance"
            title="Le site doit rassurer au premier regard."
            text="Les preuves affichées restent simples, lisibles et vérifiables."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              'Partenaires visibles et vérifiés',
              'Réponse rapide par WhatsApp',
              'Commande entreprise simple à relancer',
            ].map((item) => (
              <ProofCard key={item} title={item} />
            ))}
          </div>
          <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Preuve sociale</p>
            <p className="mt-3 text-base leading-7 text-stone-600">
              Une vitrine crédible gagne quand elle montre immédiatement qu’on peut commander, être livré et retrouver un partenaire local sans friction.
            </p>
          </div>
        </section>

        <section className="bg-[#24170f] py-14 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Priorité client</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              Commander vite, être livré, recommander.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300 sm:text-base sm:leading-7">
              DELIKREOL garde un flux simple: catalogue clair, panier, confirmation rapide et assistance locale.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Catalogue visuel et prix clairs',
                'Ajout au panier sans friction',
                'Confirmation en quelques étapes',
                'Support humain en option',
              ].map((item) => (
                <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
                  <BadgeCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-bold leading-6 text-stone-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
            </div>
          </details>
        </section>

        <section id="faq" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              eyebrow="FAQ"
              title="Les questions qui déclenchent la conversion."
              text="Chaque réponse doit lever une objection simple: confiance, zone, disponibilité et commande."
            />
            <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-[#fff8ef] p-5 shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Conversion</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                Le parcours public priorise une seule action: choisir un produit et valider la commande. Les autres besoins restent en accès secondaire.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {faqItems.map((item) => (
                <FaqItem key={item.question} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-4 rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(135deg,_#24170f_0%,_#392115_52%,_#d95f2d_180%)] p-6 text-white lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Contact / WhatsApp</p>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Une réponse rapide, directe, locale.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-200 sm:text-base sm:leading-7">
                En cas de doute, l’utilisateur peut joindre DELIKREOL immédiatement. La commande principale reste enregistrée dans l’application.
              </p>
            </div>
            <div className="grid gap-3">
              <a href={supportLink} className="rounded-2xl bg-white px-5 py-4 text-center font-black text-[#24170f]">
                Besoin d’aide
              </a>
              <a href="#pro" className="rounded-2xl border border-white/20 px-5 py-4 text-center font-black text-white">
                Accès partenaires & entreprises
              </a>
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm leading-6 text-stone-100">
                Email: <span className="font-bold">{operationsEmail}</span>
                <br />
                Frais de livraison: <span className="font-bold">selon distance et rayon partenaire</span>
                <br />
                Minimum de commande: <span className="font-bold">confirmé avant paiement</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-orange-100 bg-[#fff9f3]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-10 w-10 rounded-2xl bg-white p-1.5 shadow-sm" />
              <div>
                <p className="font-black text-[#2a190f]">DELIKREOL</p>
                <p className="text-sm text-stone-500">Plateforme locale premium en Martinique</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              DELIKREOL est prioritairement une plateforme de commande locale: catalogue visuel, panier simple et confirmation rapide sur mobile.
            </p>
          </div>
          <FooterBlock title="Couverture partenaires">
            {serviceZones.slice(0, 6).map((zone) => (
              <FooterLink key={zone} label={zone} />
            ))}
            <FooterLink label="Rayon réel par partenaire" />
            <FooterLink label="Fallback commune si géoloc absente" />
            <FooterLink label="Entreprise / devis" />
          </FooterBlock>
          <FooterBlock title="Liens utiles">
            <FooterLink label="CGV" />
            <FooterLink label="Mentions légales" />
            <FooterLink label="Confidentialité" />
            <a href="#pro" className="block text-sm font-bold text-[#7c2d12]">
              Espace partenaires & entreprises
            </a>
            <a href={whatsappBase} className="inline-flex items-center gap-2 text-sm font-bold text-[#7c2d12]">
              WhatsApp <MessageCircle className="h-4 w-4" />
            </a>
          </FooterBlock>
        </div>
      </footer>

      {selectedProducts.length > 0 && (
        <div data-testid="mobile-cart-bar" className="fixed inset-x-4 bottom-4 z-50 rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-2xl shadow-orange-900/20 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">{selectedProducts.length} article(s)</p>
              <p className="text-sm font-bold text-[#2a190f]">{formatPrice(selectionEconomics.subtotal_produits)} hors livraison</p>
            </div>
            <button type="button" onClick={scrollToCheckoutPanel} className="rounded-full bg-[#d95f2d] px-4 py-3 text-sm font-black text-white">
              Voir panier / commander
            </button>
          </div>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="fixed inset-x-4 bottom-4 z-50 grid grid-cols-[1fr_auto] gap-2 rounded-[1.5rem] border border-orange-100 bg-white p-3 shadow-2xl shadow-orange-900/20 md:hidden">
          <button
            type="button"
            onClick={() => gotoCustomer()}
            className="inline-flex items-center justify-center rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black text-white"
          >
            Commander maintenant
          </button>
          <a href={supportLink} className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-4 py-3 text-sm font-black text-[#7c2d12]">
            Aide
          </a>
        </div>
      )}

      <a
        href={whatsappBase}
        className="fixed bottom-5 right-5 z-50 hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-2xl shadow-green-500/30 md:inline-flex"
      >
        WhatsApp <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}

function BadgeRow() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#c2410c] shadow-sm">
        plateforme locale premium
      </span>
      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">
        pensée pour la Martinique
      </span>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">{label}</span>
      <span className="text-right text-sm font-semibold text-[#2a190f]">{value}</span>
    </div>
  );
}

function TrustCard({ label }: { label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/20 bg-white/92 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[#7c2d12] shadow-soft backdrop-blur">
      {label}
    </div>
  );
}

function GapMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffaf4] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-2 text-lg font-black text-[#2a190f]">{value}</p>
    </div>
  );
}

function ZoneCard({ zone }: { zone: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/70 bg-white/88 px-4 py-4 shadow-soft backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d95f2d] shadow-[0_0_0_5px_rgba(217,95,45,0.12)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">commune</p>
      </div>
      <p className="mt-3 text-base font-black text-[#2a190f]">{zone}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">Fallback commune si aucune position client n’est disponible.</p>
    </div>
  );
}

function ValueCard({ title, text, icon: Icon }: { title: string; text: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function RoleCard({
  title,
  text,
  cta,
  href,
  icon: Icon,
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[1.9rem] border border-orange-100 bg-[#fffaf4] p-5 shadow-soft transition hover:-translate-y-1 hover:bg-white hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-[#2a190f]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
        </div>
        <span className="rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <a href={href} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-[#7c2d12]">
        {cta} <ChevronRight className="h-4 w-4" />
      </a>
    </article>
  );
}

function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d95f2d] text-sm font-black text-white">{index}</div>
      <h3 className="mt-4 text-xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: PublicCatalogProduct;
  onAdd: () => void;
  compact?: boolean;
}) {
  return (
    <article className="premium-card group overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-2xl">
      <div className={`${compact ? 'aspect-[16/11]' : 'aspect-[4/3]'} relative bg-[#fff4e7]`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <HeroFallback name={product.name} />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-lg">
          {product.available ? 'Disponible' : 'À confirmer'}
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-[#2a190f]`}>{product.name}</h3>
            <p className="mt-1 text-sm font-semibold text-stone-500">{product.vendor_name}</p>
          </div>
          <strong className={`${compact ? 'text-xl' : 'text-2xl'} whitespace-nowrap font-black text-[#2a190f]`}>{formatPrice(product.price)}</strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-[0.14em]">
          <span className="rounded-2xl bg-[#fff4e7] px-3 py-2 text-[#7c2d12]">Rayon {product.vendor_delivery_radius_km} km</span>
          <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">Selon position</span>
        </div>
        <button data-testid="add-to-cart" type="button" onClick={onAdd} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-orange-500/20">
          Ajouter au panier <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function VendorCard({ vendor }: { vendor: PublicCatalogVendor }) {
  return (
    <article className="rounded-[1.9rem] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">{vendor.business_type}</p>
          <h3 className="mt-2 text-2xl font-black text-[#2a190f]">{vendor.business_name}</h3>
        </div>
        <BadgeCheck className="h-7 w-7 text-emerald-600" />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{vendor.description}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <InfoLine label="Couverture" value="Livraison autour de ce partenaire" />
        <InfoLine label="Rayon" value={`${vendor.delivery_radius_km} km`} />
        <InfoLine label="Position" value={vendor.latitude != null && vendor.longitude != null ? 'Géolocalisée' : 'Fallback commune'} />
        <InfoLine label="Adresse" value={vendor.address || 'Adresse confirmée à la commande'} />
      </div>
    </article>
  );
}

function SelectionPanel({
  products,
  summary,
  supportLink,
  partnerDispatchLink,
  driverMissionLink,
  vendorMessage,
  driverMessage,
  copyStatus,
  customerName,
  customerPhone,
  deliveryAddress,
  deliveryNotes,
  deliverySlot,
  customerLocation,
  geoStatus,
  geoConsentState,
  geoError,
  pendingCustomerLocation,
  fulfillmentMode,
  paymentMethod,
  vendorAvailabilityStatus,
  notificationPermission,
  notificationPrefs,
  orderConfirmed,
  checkoutStatus,
  supabasePaused,
  supabasePausedHint,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onDeliveryAddressChange,
  onDeliveryNotesChange,
  onDeliverySlotChange,
  onCustomerPositionRequest,
  onConfirmCustomerPosition,
  onCancelCustomerPosition,
  onValidatePendingCustomerPosition,
  onRejectPendingCustomerPosition,
  onFulfillmentModeChange,
  onPaymentMethodChange,
  onVendorAvailabilityStatusChange,
  onCopyVendorMessage,
  onCopyDriverMessage,
  onNotificationPreferenceChange,
  onRequestNotifications,
  onDownloadPdf,
  onConfirmOrder,
  onWhatsAppFallback,
  onRemove,
  onClear,
}: {
  products: PublicCatalogProduct[];
  summary: ReturnType<typeof calculateOrderEconomics>;
  supportLink: string;
  partnerDispatchLink: string;
  driverMissionLink: string;
  vendorMessage: string;
  driverMessage: string;
  copyStatus: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes: string;
  deliverySlot: string;
  customerLocation: CustomerLocation | null;
  geoStatus: GeoStatus;
  geoConsentState: GeoConsentState;
  geoError: string;
  pendingCustomerLocation: CustomerLocation | null;
  fulfillmentMode: 'delivery' | 'pickup';
  paymentMethod: string;
  vendorAvailabilityStatus: string;
  notificationPermission: NotificationPermission | 'unsupported';
  notificationPrefs: NotificationPreferences;
  orderConfirmed: boolean;
  checkoutStatus: CheckoutStatus;
  supabasePaused: boolean;
  supabasePausedHint: string | null;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onDeliveryAddressChange: (value: string) => void;
  onDeliveryNotesChange: (value: string) => void;
  onDeliverySlotChange: (value: string) => void;
  onCustomerPositionRequest: () => void;
  onConfirmCustomerPosition: () => void;
  onCancelCustomerPosition: () => void;
  onValidatePendingCustomerPosition: () => void;
  onRejectPendingCustomerPosition: () => void;
  onFulfillmentModeChange: (mode: 'delivery' | 'pickup') => void;
  onPaymentMethodChange: (value: string) => void;
  onVendorAvailabilityStatusChange: (value: string) => void;
  onCopyVendorMessage: () => void;
  onCopyDriverMessage: () => void;
  onNotificationPreferenceChange: (key: keyof NotificationPreferences, value: boolean) => void;
  onRequestNotifications: () => void;
  onDownloadPdf: () => void;
  onConfirmOrder: () => void;
  onWhatsAppFallback: () => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}) {
  const mapPreviewLocation = pendingCustomerLocation ?? customerLocation;

  return (
    <aside data-testid="cart-panel" className="h-fit rounded-[2rem] border border-orange-100 bg-white p-5 shadow-elegant lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-[#fff3e5] p-3 text-[#d95f2d]">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-black text-[#2a190f]">Panier sécurisé</h3>
            <p className="text-xs font-semibold text-stone-500">Validation humaine avant préparation.</p>
          </div>
        </div>
        <span data-testid="cart-badge" className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">{products.length} article(s)</span>
      </div>

      {supabasePaused && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
          {supabasePausedHint ?? 'Commande applicative temporairement indisponible. Bascule Sheets/Formulaire activée, WhatsApp reste en support.'}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-stone-600">Ajoutez une offre pour préparer votre commande. Le montant final sera confirmé avant validation.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {products.map((product, index) => (
            <div key={`${product.id}-${index}`} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#2a190f]">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.vendor_name}</p>
                </div>
                <button onClick={() => onRemove(index)} className="text-xs font-bold text-stone-400">
                  Retirer
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            {[
              ['delivery', 'Livraison'],
              ['pickup', 'Retrait'],
            ].map(([mode, label]) => {
              const active = fulfillmentMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onFulfillmentModeChange(mode as 'delivery' | 'pickup')}
                  className={`rounded-2xl border px-3 py-3 text-sm font-black ${
                    active ? 'border-[#d95f2d] bg-[#fff3e5] text-[#7c2d12]' : 'border-orange-100 bg-white text-stone-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-2">
            <input
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Nom"
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
            />
            <input
              value={customerPhone}
              onChange={(event) => onCustomerPhoneChange(event.target.value)}
              placeholder="Téléphone"
              inputMode="tel"
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
            />
            <input
              value={deliveryAddress}
              onChange={(event) => onDeliveryAddressChange(event.target.value)}
              placeholder={fulfillmentMode === 'delivery' ? 'Adresse complète / repère' : 'Commune de retrait'}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
            />
            <textarea
              value={deliveryNotes}
              onChange={(event) => onDeliveryNotesChange(event.target.value)}
              placeholder="Instructions livraison: bâtiment, portail, repère, appel avant arrivée..."
              rows={3}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
            />
            <input
              value={deliverySlot}
              onChange={(event) => onDeliverySlotChange(event.target.value)}
              placeholder="Créneau souhaité: aujourd’hui 12h30, demain matin..."
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
            />
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Position client</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Votre position sert uniquement à estimer la livraison et faciliter le retrait/livraison. Vous pouvez aussi saisir votre adresse manuellement.
                </p>
              </div>
              <button
                type="button"
                onClick={onCustomerPositionRequest}
                disabled={geoStatus === 'loading'}
                className="shrink-0 rounded-xl bg-[#2a190f] px-3 py-2 text-xs font-black text-white disabled:opacity-60"
              >
                {geoStatus === 'loading' ? 'Localisation...' : 'Me géolocaliser'}
              </button>
            </div>
            {geoConsentState === 'ask' && (
              <div className="mt-3 rounded-xl border border-orange-200 bg-[#fff8ef] p-3">
                <p className="text-xs font-black text-[#7c2d12]">
                  Souhaitez-vous être géolocalisé pour afficher votre position sur la carte ?
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onConfirmCustomerPosition}
                    disabled={geoStatus === 'loading'}
                    className="rounded-xl bg-[#d95f2d] px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    Oui, autoriser
                  </button>
                  <button
                    type="button"
                    onClick={onCancelCustomerPosition}
                    className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-black text-[#7c2d12]"
                  >
                    Non, merci
                  </button>
                </div>
              </div>
            )}
            {mapPreviewLocation && (
              <div className="mt-3 overflow-hidden rounded-xl border border-orange-100">
                <MapContainer
                  center={[mapPreviewLocation.lat, mapPreviewLocation.lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  className="h-44 w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CircleMarker
                    center={[mapPreviewLocation.lat, mapPreviewLocation.lng]}
                    radius={8}
                    pathOptions={{ color: '#d95f2d', fillColor: '#d95f2d', fillOpacity: 0.9 }}
                  >
                    <Popup>Votre position</Popup>
                  </CircleMarker>
                </MapContainer>
              </div>
            )}
            {pendingCustomerLocation && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-900">
                  Position détectée : {pendingCustomerLocation.lat.toFixed(6)}, {pendingCustomerLocation.lng.toFixed(6)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onValidatePendingCustomerPosition}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                  >
                    Valider ma position
                  </button>
                  <button
                    type="button"
                    onClick={onRejectPendingCustomerPosition}
                    className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black text-emerald-800"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            )}
            {fulfillmentMode === 'delivery' && (
              <div className="mt-3 grid gap-1 rounded-xl bg-[#fff8ef] p-3 text-xs font-bold text-[#7c2d12]">
                <span>Adresse obligatoire</span>
                <span>Position GPS recommandée</span>
                {customerLocation ? (
                  <a href={customerLocation.mapsUrl} target="_blank" rel="noreferrer" className="text-[#0f766e] underline">
                    Lien Maps généré - précision {customerLocation.accuracy ? `${Math.round(customerLocation.accuracy)} m` : 'non fournie'}
                  </a>
                ) : (
                  <span>Position GPS non fournie — confirmer adresse manuellement.</span>
                )}
              </div>
            )}
            {geoError && <p className="mt-2 text-xs font-bold text-red-700">{geoError}</p>}
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm">
            <PriceLine label="Sous-total" value={formatPrice(summary.subtotal_produits)} />
            <PriceLine label={fulfillmentMode === 'delivery' ? 'Livraison' : 'Retrait'} value={formatPrice(summary.frais_livraison)} />
            <PriceLine label="Frais service" value={formatPrice(summary.frais_service)} />
            <div className="mt-3 rounded-2xl bg-[#2a190f] px-4 py-3 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-200">Total estimé</p>
              <p className="mt-1 text-3xl font-black">{formatPrice(summary.total_client)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Paiement</p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-[#2a190f]">
              {['PayPal', 'Carte via lien sécurisé', 'Assistance WhatsApp'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onPaymentMethodChange(method)}
                  className={`rounded-xl px-3 py-2 text-left ${paymentMethod === method ? 'bg-[#2a190f] text-white' : 'bg-[#fff8ef] text-[#2a190f]'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Orchestration</p>
            <select
              value={vendorAvailabilityStatus}
              onChange={(event) => onVendorAvailabilityStatusChange(event.target.value)}
              className="mt-3 w-full rounded-xl border border-orange-100 bg-[#fff8ef] px-3 py-3 text-sm font-bold text-[#2a190f] outline-none"
            >
              <option>À confirmer par DELIKREOL</option>
              <option>Demande envoyée au vendeur</option>
              <option>Vendeur disponible</option>
              <option>Vendeur indisponible</option>
            </select>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={onConfirmOrder}
                disabled={checkoutStatus.kind === 'saving'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d95f2d] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                <ShoppingBag className="h-4 w-4" /> Enregistrer la commande
              </button>
              <button
                type="button"
                onClick={onWhatsAppFallback}
                disabled={checkoutStatus.kind === 'saving'}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800 disabled:opacity-60"
              >
                <MessageCircle className="h-4 w-4" /> Envoyer sur WhatsApp (support)
              </button>
              <a href={supportLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-[#7c2d12]">
                <MessageCircle className="h-4 w-4" /> Besoin d’aide
              </a>
              <button type="button" onClick={onCopyVendorMessage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fff8ef] px-4 py-3 text-sm font-black text-[#2a190f]">
                <Mail className="h-4 w-4" /> Préparer message vendeur
              </button>
              <button type="button" onClick={onCopyDriverMessage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fff8ef] px-4 py-3 text-sm font-black text-[#2a190f]">
                <Truck className="h-4 w-4" /> Préparer mission livreur
              </button>
              <a href={driverMissionLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-[#7c2d12]">
                Ouvrir mission livreur sur WhatsApp central
              </a>
            </div>
            {copyStatus && <p className="mt-2 text-xs font-bold text-emerald-800">{copyStatus}</p>}
            <details className="mt-3 rounded-xl bg-[#fff8ef] p-3 text-xs text-stone-600">
              <summary className="cursor-pointer font-black text-[#7c2d12]">Aperçu vendeur / livreur</summary>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-sans">{vendorMessage}</pre>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-sans">{driverMessage}</pre>
            </details>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#d95f2d]" />
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Alertes utiles</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(notificationPrefs) as Array<keyof NotificationPreferences>).map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-xl bg-[#fff8ef] px-3 py-2 text-xs font-bold capitalize text-[#2a190f]">
                  <input
                    type="checkbox"
                    checked={notificationPrefs[key]}
                    onChange={(event) => onNotificationPreferenceChange(key, event.target.checked)}
                  />
                  {key}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={onRequestNotifications}
              disabled={notificationPermission === 'granted' || notificationPermission === 'unsupported'}
              className="mt-3 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-[#7c2d12] disabled:opacity-60"
            >
              {notificationPermission === 'granted'
                ? 'Notifications activées'
                : notificationPermission === 'unsupported'
                  ? 'Notifications non supportées'
                  : 'Activer les notifications'}
            </button>
          </div>

          <button onClick={onConfirmOrder} disabled={checkoutStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 font-black uppercase tracking-[0.14em] text-white disabled:opacity-60">
            {checkoutStatus.kind === 'saving' ? 'Enregistrement...' : 'Confirmer la commande'} <ArrowRight className="h-4 w-4" />
          </button>
          {checkoutStatus.kind === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {checkoutStatus.message}
            </div>
          )}
          {checkoutStatus.kind === 'success' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              {checkoutStatus.message}
            </div>
          )}
          {orderConfirmed && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-black">Commande enregistrée dans DELIKREOL.</p>
              <p className="mt-1">Téléchargez le PDF ou envoyez l’email partenaire. WhatsApp reste disponible uniquement en support.</p>
              <div className="mt-3 grid gap-2">
                <button onClick={onDownloadPdf} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-[#2a190f]">
                  <Download className="h-4 w-4" /> Télécharger le PDF
                </button>
                <a href={partnerDispatchLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-[#2a190f]">
                  <Mail className="h-4 w-4" /> Email partenaire
                </a>
                <a href={supportLink} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-[#2a190f]">
                  <MessageCircle className="h-4 w-4" /> Besoin d’aide
                </a>
              </div>
            </div>
          )}
          <button onClick={onClear} className="w-full rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-[#7c2d12]">
            Vider le panier
          </button>
          <p className="text-xs font-medium text-stone-500">La commande peut être envoyée par email avec PDF, puis relayée sur WhatsApp si le partenaire le préfère.</p>
        </div>
      )}
    </aside>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Package className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-2xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{text}</p>
      {action && (
        <a href={action} className="mt-5 inline-flex rounded-2xl bg-[#d95f2d] px-5 py-3 text-sm font-black text-white">
          Devenir partenaire
        </a>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
      <summary className="cursor-pointer list-none text-lg font-black text-[#2a190f]">
        <span className="flex items-center justify-between gap-3">
          {question}
          <ChevronRight className="h-5 w-5 transition group-open:rotate-90" />
        </span>
      </summary>
      <p className="mt-4 text-sm leading-6 text-stone-600">{answer}</p>
    </details>
  );
}

function ProofCard({ title }: { title: string }) {
  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Star className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Information vérifiable avant paiement, avec confirmation par email ou WhatsApp selon le canal choisi.
      </p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl font-display text-3xl font-black tracking-tight text-[#2a190f] sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">{text}</p>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={`rounded-2xl border border-orange-100 bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function InputDark({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={`rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-stone-300 outline-none ring-white/20 focus:ring-4 ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-orange-100 bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function TextareaDark({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-stone-300 outline-none ring-white/20 focus:ring-4 ${className}`}
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-orange-100 bg-[#fffaf4] px-10 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
      >
        {children}
      </select>
    </div>
  );
}

function PriceLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${strong ? 'text-base font-black text-[#2a190f]' : 'text-stone-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-300">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function BusinessChip({ text }: { text: string }) {
  return <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-100">{text}</span>;
}

function HeroFallback({ name, loading, configured }: { name: string; loading?: boolean; configured?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(217,95,45,0.28),transparent_35%),linear-gradient(135deg,#fde9d6,#fff3e4,#dfefe9)]">
      <div className="rounded-full bg-white/85 px-6 py-4 text-center shadow-lg">
        <Utensils className="mx-auto h-8 w-8 text-[#c2410c]" />
        <p className="mt-2 max-w-[220px] text-sm font-black text-[#2a190f]">
          {loading ? 'Chargement...' : configured === false ? 'Catalogue non configuré' : name}
        </p>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="rounded-lg px-4 py-2 text-sm font-black text-[#5a4334] transition hover:bg-white hover:text-[#2a190f]">
      {children}
    </a>
  );
}

function FooterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return <p className="text-sm font-semibold text-stone-600">{label}</p>;
}

function StatusBanner({ status }: { status: SubmitStatus }) {
  if (status.kind === 'idle') return null;
  const tone =
    status.kind === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status.kind === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-orange-200 bg-orange-50 text-orange-800';
  return <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>{status.message}</p>;
}

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
