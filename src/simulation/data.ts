import type { SimVendor, SimProduct, SimDriver, SimRelayPoint } from './types';

export const SIM_VENDORS: SimVendor[] = [
  { id: 'sv1', name: 'Chez Tatie Mireille', type: 'restaurant', address: 'Rue Victor Hugo, Fort-de-France', phone: '0696 12 34 56', gps: { lat: 14.6065, lon: -61.0742 }, rating: 4.8, active: true },
  { id: 'sv2', name: 'La Case a Rhum', type: 'restaurant', address: 'Boulevard Allegre, Le Lamentin', phone: '0696 23 45 67', gps: { lat: 14.6039, lon: -60.9956 }, rating: 4.6, active: true },
  { id: 'sv3', name: 'Verger Tropical', type: 'producer', address: 'Chemin Rural, Sainte-Anne', phone: '0696 34 56 78', gps: { lat: 14.4356, lon: -60.8817 }, rating: 4.9, active: true },
  { id: 'sv4', name: 'Boulangerie du Marin', type: 'merchant', address: 'Place de la Mairie, Le Marin', phone: '0696 45 67 89', gps: { lat: 14.4693, lon: -60.8731 }, rating: 4.7, active: true },
  { id: 'sv5', name: 'Pecherie du Robert', type: 'producer', address: 'Quai des Pecheurs, Le Robert', phone: '0696 56 78 90', gps: { lat: 14.6726, lon: -60.9358 }, rating: 4.5, active: true },
];

export const SIM_PRODUCTS: SimProduct[] = [
  { id: 'sp1', vendorId: 'sv1', vendorName: 'Chez Tatie Mireille', name: 'Colombo de poulet', description: 'Poulet marine aux epices colombo, riz et haricots rouges', category: 'Plats', price: 12.50, available: true, stock: 25, imageEmoji: '🍗', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp2', vendorId: 'sv1', vendorName: 'Chez Tatie Mireille', name: 'Accras de morue (12 pcs)', description: 'Beignets croustillants a la morue', category: 'Entrees', price: 8.00, available: true, stock: 40, imageEmoji: '🧆', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp3', vendorId: 'sv1', vendorName: 'Chez Tatie Mireille', name: 'Poulet boucane', description: 'Poulet fume au bois de canne, sauce chien', category: 'Plats', price: 14.00, available: true, stock: 15, imageEmoji: '🍖', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp4', vendorId: 'sv2', vendorName: 'La Case a Rhum', name: 'Langouste grillee', description: 'Langouste fraiche grillee, beurre citron vert', category: 'Plats', price: 35.00, available: true, stock: 8, imageEmoji: '🦞', requiresColdChain: true, storageType: 'cold' },
  { id: 'sp5', vendorId: 'sv2', vendorName: 'La Case a Rhum', name: 'Ti-punch traditionnel', description: 'Rhum blanc AOC, citron vert, sirop de canne', category: 'Boissons', price: 5.50, available: true, stock: 100, imageEmoji: '🍹', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp6', vendorId: 'sv3', vendorName: 'Verger Tropical', name: 'Panier fruits exotiques', description: 'Mangues, ananas, fruits de la passion, goyaves', category: 'Paniers', price: 18.00, available: true, stock: 12, imageEmoji: '🥭', requiresColdChain: true, storageType: 'cold' },
  { id: 'sp7', vendorId: 'sv3', vendorName: 'Verger Tropical', name: 'Jus de goyave frais (1L)', description: 'Jus 100% naturel, sans sucre ajoute', category: 'Boissons', price: 4.50, available: true, stock: 30, imageEmoji: '🧃', requiresColdChain: true, storageType: 'cold' },
  { id: 'sp8', vendorId: 'sv4', vendorName: 'Boulangerie du Marin', name: 'Pain au beurre creole', description: 'Viennoiserie briochee, specialite antillaise', category: 'Boulangerie', price: 2.50, available: true, stock: 50, imageEmoji: '🥐', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp9', vendorId: 'sv4', vendorName: 'Boulangerie du Marin', name: "Tourment d'amour", description: 'Gateau coco et confiture de goyave', category: 'Patisserie', price: 3.50, available: true, stock: 35, imageEmoji: '🧁', requiresColdChain: false, storageType: 'ambient' },
  { id: 'sp10', vendorId: 'sv5', vendorName: 'Pecherie du Robert', name: 'Filet de dorade coryphene', description: 'Dorade fraiche pechee du jour, 300g', category: 'Poissons', price: 16.00, available: true, stock: 10, imageEmoji: '🐟', requiresColdChain: true, storageType: 'cold' },
  { id: 'sp11', vendorId: 'sv5', vendorName: 'Pecherie du Robert', name: 'Crevettes geantes (500g)', description: 'Crevettes fraiches de Martinique', category: 'Fruits de mer', price: 22.00, available: true, stock: 6, imageEmoji: '🦐', requiresColdChain: true, storageType: 'frozen' },
  { id: 'sp12', vendorId: 'sv1', vendorName: 'Chez Tatie Mireille', name: 'Court-bouillon de poisson', description: 'Poisson mijote sauce tomate et piment', category: 'Plats', price: 13.00, available: true, stock: 18, imageEmoji: '🍲', requiresColdChain: false, storageType: 'ambient' },
];

export const SIM_DRIVERS: SimDriver[] = [
  { id: 'sd1', name: 'Kevin M.', phone: '0696 11 22 33', vehicleType: 'scooter', available: true, gps: { lat: 14.6100, lon: -61.0800 }, rating: 4.9, totalDeliveries: 342, todayEarnings: 67.50, hasColdBox: true },
  { id: 'sd2', name: 'Stephane J.', phone: '0696 22 33 44', vehicleType: 'car', available: true, gps: { lat: 14.6050, lon: -60.9990 }, rating: 4.7, totalDeliveries: 215, todayEarnings: 45.00, hasColdBox: true },
  { id: 'sd3', name: 'Thierry B.', phone: '0696 33 44 55', vehicleType: 'bike', available: true, gps: { lat: 14.4400, lon: -60.8850 }, rating: 4.8, totalDeliveries: 128, todayEarnings: 32.00, hasColdBox: false },
];

export const SIM_RELAY_POINTS: SimRelayPoint[] = [
  {
    id: 'sr1',
    name: 'Relais Fort-de-France Centre',
    address: 'Rue Victor Hugo, Fort-de-France',
    gps: { lat: 14.6060, lon: -61.0730 },
    active: true,
    capacities: [
      { storageType: 'ambient', total: 30, used: 8, temperatureRange: '18-25 C' },
      { storageType: 'cold', total: 15, used: 3, temperatureRange: '2-8 C' },
      { storageType: 'frozen', total: 5, used: 1, temperatureRange: '-18 C' },
    ],
    depositsWaiting: 3,
    todayPickups: 12,
    openHours: '7h-20h',
  },
  {
    id: 'sr2',
    name: 'Relais Lamentin Centre',
    address: 'Centre Commercial La Galleria, Le Lamentin',
    gps: { lat: 14.6030, lon: -60.9940 },
    active: true,
    capacities: [
      { storageType: 'ambient', total: 25, used: 14, temperatureRange: '18-25 C' },
      { storageType: 'cold', total: 10, used: 7, temperatureRange: '2-8 C' },
      { storageType: 'frozen', total: 3, used: 2, temperatureRange: '-18 C' },
    ],
    depositsWaiting: 5,
    todayPickups: 8,
    openHours: '8h-21h',
  },
  {
    id: 'sr3',
    name: 'Relais Sainte-Anne Bourg',
    address: 'Place du Marche, Sainte-Anne',
    gps: { lat: 14.4360, lon: -60.8820 },
    active: true,
    capacities: [
      { storageType: 'ambient', total: 20, used: 2, temperatureRange: '18-25 C' },
      { storageType: 'cold', total: 8, used: 1, temperatureRange: '2-8 C' },
    ],
    depositsWaiting: 1,
    todayPickups: 4,
    openHours: '7h30-19h',
  },
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  preparing: 'En preparation',
  ready: 'Prete',
  picked_up: 'Recuperee',
  in_transit: 'En livraison',
  at_relay: 'Au point relais',
  delivered: 'Livree',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-100 text-sky-800 border-sky-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-teal-100 text-teal-800 border-teal-200',
  picked_up: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
  at_relay: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  home_delivery: 'Livraison domicile',
  relay_point: 'Point relais',
  pickup: 'Retrait sur place',
};

export const STORAGE_LABELS: Record<string, string> = {
  ambient: 'Ambiante',
  cold: 'Refrigere',
  frozen: 'Congele',
};

export const STORAGE_COLORS: Record<string, string> = {
  ambient: 'bg-emerald-100 text-emerald-800',
  cold: 'bg-sky-100 text-sky-800',
  frozen: 'bg-blue-100 text-blue-800',
};
