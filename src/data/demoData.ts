export interface DemoVendor {
  id: string;
  business_name: string;
  business_type: 'restaurant' | 'producer' | 'merchant';
  description: string;
  address: string;
  phone: string;
  rating: number;
  is_active: boolean;
  commission_rate: number;
}

export interface DemoProduct {
  id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  description: string;
  category: string;
  price: number;
  is_available: boolean;
  stock_quantity: number;
}

export interface DemoOrder {
  id: string;
  order_number: string;
  customer_name: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_delivery' | 'delivered';
  delivery_type: 'home_delivery' | 'relay_point' | 'pickup';
  delivery_address: string;
  total_amount: number;
  items: { name: string; qty: number; price: number }[];
  created_at: string;
  vendor_name: string;
}

export interface DemoDriver {
  id: string;
  name: string;
  vehicle_type: 'bike' | 'scooter' | 'car';
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  today_earnings: number;
}

export interface DemoRelayPoint {
  id: string;
  name: string;
  address: string;
  type: string;
  is_active: boolean;
  deposits_waiting: number;
  capacity_pct: number;
  today_pickups: number;
}

export interface DemoStats {
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  orders_today: number;
  orders_week: number;
  active_vendors: number;
  active_drivers: number;
  active_relay_points: number;
  total_customers: number;
  avg_delivery_time: number;
}

export const demoVendors: DemoVendor[] = [
  { id: 'v1', business_name: 'Chez Tatie Mireille', business_type: 'restaurant', description: 'Cuisine creole traditionnelle, plats faits maison avec amour', address: 'Rue Victor Hugo, Fort-de-France', phone: '0696 12 34 56', rating: 4.8, is_active: true, commission_rate: 15 },
  { id: 'v2', business_name: 'La Case a Rhum', business_type: 'restaurant', description: 'Bar-restaurant avec vue mer, specialites grillades et poissons', address: 'Boulevard Allegre, Le Lamentin', phone: '0696 23 45 67', rating: 4.6, is_active: true, commission_rate: 18 },
  { id: 'v3', business_name: 'Verger Tropical', business_type: 'producer', description: 'Fruits exotiques frais et jus naturels de Martinique', address: 'Chemin Rural, Sainte-Anne', phone: '0696 34 56 78', rating: 4.9, is_active: true, commission_rate: 12 },
  { id: 'v4', business_name: 'Boulangerie du Marin', business_type: 'merchant', description: 'Pains artisanaux, viennoiseries et patisseries creoles', address: 'Place de la Mairie, Le Marin', phone: '0696 45 67 89', rating: 4.7, is_active: true, commission_rate: 10 },
  { id: 'v5', business_name: 'Pecherie du Robert', business_type: 'producer', description: 'Poissons frais et fruits de mer peches du jour', address: 'Quai des Pecheurs, Le Robert', phone: '0696 56 78 90', rating: 4.5, is_active: true, commission_rate: 14 },
  { id: 'v6', business_name: 'Epicerie Fine Antillaise', business_type: 'merchant', description: 'Produits locaux premium, epices, rhums et confitures', address: 'Avenue des Caraibes, Schoelcher', phone: '0696 67 89 01', rating: 4.4, is_active: false, commission_rate: 16 },
];

export const demoProducts: DemoProduct[] = [
  { id: 'p1', vendor_id: 'v1', vendor_name: 'Chez Tatie Mireille', name: 'Colombo de poulet', description: 'Poulet marine aux epices colombo, riz et haricots rouges', category: 'Plats', price: 12.50, is_available: true, stock_quantity: 25 },
  { id: 'p2', vendor_id: 'v1', vendor_name: 'Chez Tatie Mireille', name: 'Accras de morue (12 pcs)', description: 'Beignets croustillants a la morue et piment vegetarien', category: 'Entrees', price: 8.00, is_available: true, stock_quantity: 40 },
  { id: 'p3', vendor_id: 'v1', vendor_name: 'Chez Tatie Mireille', name: 'Poulet boucane', description: 'Poulet fume au bois de canne, sauce chien maison', category: 'Plats', price: 14.00, is_available: true, stock_quantity: 15 },
  { id: 'p4', vendor_id: 'v1', vendor_name: 'Chez Tatie Mireille', name: 'Gratin de christophine', description: 'Christophine gratinee au four avec fromage local', category: 'Accompagnements', price: 6.50, is_available: true, stock_quantity: 20 },
  { id: 'p5', vendor_id: 'v2', vendor_name: 'La Case a Rhum', name: 'Langouste grillee', description: 'Langouste fraiche grillee, beurre citron vert', category: 'Plats', price: 35.00, is_available: true, stock_quantity: 8 },
  { id: 'p6', vendor_id: 'v2', vendor_name: 'La Case a Rhum', name: 'Ti-punch traditionnel', description: 'Rhum blanc AOC, citron vert, sirop de canne', category: 'Boissons', price: 5.50, is_available: true, stock_quantity: 100 },
  { id: 'p7', vendor_id: 'v3', vendor_name: 'Verger Tropical', name: 'Panier fruits exotiques', description: 'Mangues, ananas, fruits de la passion, goyaves', category: 'Paniers', price: 18.00, is_available: true, stock_quantity: 12 },
  { id: 'p8', vendor_id: 'v3', vendor_name: 'Verger Tropical', name: 'Jus de goyave frais (1L)', description: 'Jus 100% naturel, sans sucre ajoute', category: 'Boissons', price: 4.50, is_available: true, stock_quantity: 30 },
  { id: 'p9', vendor_id: 'v3', vendor_name: 'Verger Tropical', name: 'Confiture de maracuja', description: 'Pot artisanal 250g, recette familiale', category: 'Epicerie', price: 7.00, is_available: true, stock_quantity: 45 },
  { id: 'p10', vendor_id: 'v4', vendor_name: 'Boulangerie du Marin', name: 'Pain au beurre creole', description: 'Viennoiserie briochee, specialite antillaise', category: 'Boulangerie', price: 2.50, is_available: true, stock_quantity: 50 },
  { id: 'p11', vendor_id: 'v4', vendor_name: 'Boulangerie du Marin', name: "Tourment d'amour", description: 'Gateau coco et confiture de goyave', category: 'Patisserie', price: 3.50, is_available: true, stock_quantity: 35 },
  { id: 'p12', vendor_id: 'v4', vendor_name: 'Boulangerie du Marin', name: 'Flan coco maison', description: 'Flan onctueux a la noix de coco rapee', category: 'Patisserie', price: 4.00, is_available: true, stock_quantity: 20 },
  { id: 'p13', vendor_id: 'v5', vendor_name: 'Pecherie du Robert', name: 'Filet de dorade coryphene', description: 'Dorade fraiche pechee du jour, 300g', category: 'Poissons', price: 16.00, is_available: true, stock_quantity: 10 },
  { id: 'p14', vendor_id: 'v5', vendor_name: 'Pecherie du Robert', name: 'Crevettes geantes (500g)', description: 'Crevettes fraiches de Martinique', category: 'Fruits de mer', price: 22.00, is_available: false, stock_quantity: 0 },
  { id: 'p15', vendor_id: 'v6', vendor_name: 'Epicerie Fine Antillaise', name: 'Rhum vieux 10 ans', description: 'Rhum AOC Martinique, vieilli en fut de chene', category: 'Spiritueux', price: 45.00, is_available: true, stock_quantity: 15 },
  { id: 'p16', vendor_id: 'v6', vendor_name: 'Epicerie Fine Antillaise', name: 'Epices colombo (100g)', description: "Melange d'epices traditionnel fait main", category: 'Epicerie', price: 5.00, is_available: true, stock_quantity: 60 },
  { id: 'p17', vendor_id: 'v6', vendor_name: 'Epicerie Fine Antillaise', name: 'Sauce chien maison', description: 'Sauce pimentee aux herbes fraiches, 250ml', category: 'Epicerie', price: 6.00, is_available: true, stock_quantity: 35 },
  { id: 'p18', vendor_id: 'v1', vendor_name: 'Chez Tatie Mireille', name: 'Court-bouillon de poisson', description: 'Poisson mijote sauce tomate et piment', category: 'Plats', price: 13.00, is_available: true, stock_quantity: 18 },
];

const now = new Date();
const ago = (mins: number) => {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
};

export const demoOrders: DemoOrder[] = [
  { id: 'o1', order_number: 'DK-2026-001', customer_name: 'Marie-Josephe D.', status: 'in_delivery', delivery_type: 'home_delivery', delivery_address: 'Rue Schoelcher, Fort-de-France', total_amount: 34.50, items: [{ name: 'Colombo de poulet', qty: 2, price: 12.50 }, { name: 'Jus de goyave frais', qty: 2, price: 4.50 }], created_at: ago(45), vendor_name: 'Chez Tatie Mireille' },
  { id: 'o2', order_number: 'DK-2026-002', customer_name: 'Jean-Pierre L.', status: 'preparing', delivery_type: 'relay_point', delivery_address: 'Relais Lamentin Centre', total_amount: 27.50, items: [{ name: 'Poulet boucane', qty: 1, price: 14.00 }, { name: 'Accras de morue (12)', qty: 1, price: 8.00 }, { name: 'Ti-punch', qty: 1, price: 5.50 }], created_at: ago(25), vendor_name: 'Chez Tatie Mireille' },
  { id: 'o3', order_number: 'DK-2026-003', customer_name: 'Sylvie M.', status: 'pending', delivery_type: 'home_delivery', delivery_address: 'Lotissement Beausejour, Le Lamentin', total_amount: 53.00, items: [{ name: 'Langouste grillee', qty: 1, price: 35.00 }, { name: 'Panier fruits', qty: 1, price: 18.00 }], created_at: ago(10), vendor_name: 'La Case a Rhum' },
  { id: 'o4', order_number: 'DK-2026-004', customer_name: 'Patrick R.', status: 'delivered', delivery_type: 'pickup', delivery_address: 'Boulangerie du Marin', total_amount: 15.50, items: [{ name: 'Pain au beurre', qty: 3, price: 2.50 }, { name: "Tourment d'amour", qty: 2, price: 3.50 }], created_at: ago(120), vendor_name: 'Boulangerie du Marin' },
  { id: 'o5', order_number: 'DK-2026-005', customer_name: 'Celine B.', status: 'confirmed', delivery_type: 'home_delivery', delivery_address: 'Quartier Didier, Fort-de-France', total_amount: 44.50, items: [{ name: 'Filet de dorade', qty: 2, price: 16.00 }, { name: 'Gratin christophine', qty: 1, price: 6.50 }, { name: 'Sauce chien', qty: 1, price: 6.00 }], created_at: ago(15), vendor_name: 'Pecherie du Robert' },
  { id: 'o6', order_number: 'DK-2026-006', customer_name: 'Andre G.', status: 'ready', delivery_type: 'relay_point', delivery_address: 'Relais Fort-de-France Centre', total_amount: 62.00, items: [{ name: 'Rhum vieux 10 ans', qty: 1, price: 45.00 }, { name: 'Epices colombo', qty: 2, price: 5.00 }, { name: 'Confiture maracuja', qty: 1, price: 7.00 }], created_at: ago(55), vendor_name: 'Epicerie Fine Antillaise' },
  { id: 'o7', order_number: 'DK-2026-007', customer_name: 'Fabienne T.', status: 'in_delivery', delivery_type: 'home_delivery', delivery_address: 'Anse Mitan, Les Trois-Ilets', total_amount: 21.00, items: [{ name: 'Court-bouillon', qty: 1, price: 13.00 }, { name: 'Accras de morue', qty: 1, price: 8.00 }], created_at: ago(35), vendor_name: 'Chez Tatie Mireille' },
  { id: 'o8', order_number: 'DK-2026-008', customer_name: 'Lucas V.', status: 'delivered', delivery_type: 'home_delivery', delivery_address: 'Rue de la Liberte, Schoelcher', total_amount: 29.50, items: [{ name: 'Colombo de poulet', qty: 1, price: 12.50 }, { name: 'Jus de goyave', qty: 2, price: 4.50 }, { name: 'Epices colombo', qty: 1, price: 5.00 }], created_at: ago(180), vendor_name: 'Chez Tatie Mireille' },
];

export const demoDrivers: DemoDriver[] = [
  { id: 'd1', name: 'Kevin M.', vehicle_type: 'scooter', is_available: false, rating: 4.9, total_deliveries: 342, today_earnings: 67.50 },
  { id: 'd2', name: 'Stephane J.', vehicle_type: 'car', is_available: true, rating: 4.7, total_deliveries: 215, today_earnings: 45.00 },
  { id: 'd3', name: 'Thierry B.', vehicle_type: 'bike', is_available: true, rating: 4.8, total_deliveries: 128, today_earnings: 32.00 },
];

export const demoRelayPoints: DemoRelayPoint[] = [
  { id: 'r1', name: 'Relais Fort-de-France Centre', address: 'Rue Victor Hugo, Fort-de-France', type: 'partner_store', is_active: true, deposits_waiting: 3, capacity_pct: 45, today_pickups: 12 },
  { id: 'r2', name: 'Relais Lamentin Centre Commercial', address: 'Centre Commercial La Galleria, Le Lamentin', type: 'partner_store', is_active: true, deposits_waiting: 5, capacity_pct: 72, today_pickups: 8 },
  { id: 'r3', name: 'Relais Sainte-Anne Bourg', address: 'Place du Marche, Sainte-Anne', type: 'vendor_location', is_active: true, deposits_waiting: 1, capacity_pct: 20, today_pickups: 4 },
  { id: 'r4', name: 'Relais Le Marin Port', address: 'Quai Ouest, Le Marin', type: 'partner_store', is_active: false, deposits_waiting: 0, capacity_pct: 0, today_pickups: 0 },
];

export const demoStats: DemoStats = {
  revenue_today: 1847.50,
  revenue_week: 12450.00,
  revenue_month: 48320.00,
  orders_today: 47,
  orders_week: 312,
  active_vendors: 5,
  active_drivers: 3,
  active_relay_points: 3,
  total_customers: 234,
  avg_delivery_time: 28,
};

export const orderStatusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  preparing: 'En preparation',
  ready: 'Prete',
  in_delivery: 'En livraison',
  delivered: 'Livree',
};

export const orderStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-100 text-sky-800 border-sky-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-teal-100 text-teal-800 border-teal-200',
  in_delivery: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const deliveryTypeLabels: Record<string, string> = {
  home_delivery: 'Livraison domicile',
  relay_point: 'Point relais',
  pickup: 'Retrait',
};
