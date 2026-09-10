import { useEffect, useState } from'react';
import { Link } from'react-router-dom';
import {
 ShoppingCart, ChefHat, Truck, MapPin, FileText,
 Target, AlertTriangle, ImageOff, Package, CheckCircle2,
 DollarSign, CalendarDays, Users, Bike,
} from'lucide-react';
import { mockProducts } from'../../data/mockCatalog';
import { traiteurSpaces } from'../../data/traiteurs';
import { PARTNER_PLANS } from'../../services/pricing';
import { supabase } from'../../lib/supabase';

function loadFromStorage(key: string): any[] {
 try { return JSON.parse(localStorage.getItem(key) ||'[]'); }
 catch { return []; }
}

/* ─── Composant candidatures récentes ─── */
type LatestApplication = {
 id: string;
 businessName: string;
 contactName: string;
 commune: string;
 phone: string;
 createdAt: string;
 kind: 'partner' | 'driver' | 'relay';
};

function LatestApplications() {
 const [apps, setApps] = useState<any[]>([]);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const load = async () => {
 const [partners, drivers, relays] = await Promise.all([
 supabase.from('partner_applications').select('id,business_name,contact_name,commune,phone,created_at'),
 supabase.from('driver_applications').select('id,name,commune,phone,created_at'),
 supabase.from('relay_point_applications').select('id,business_name,manager_name,commune,phone,created_at'),
 ]);

 const failed = [partners, drivers, relays].find((result) => result.error);
 if (failed?.error) {
 setError(failed.error.message);
 return;
 }

 const combined: LatestApplication[] = [
 ...(partners.data || []).map((app) => ({ id: app.id, businessName: app.business_name || 'Partenaire', contactName: app.contact_name || '', commune: app.commune || '', phone: app.phone || '', createdAt: app.created_at, kind: 'partner' as const })),
 ...(drivers.data || []).map((app) => ({ id: app.id, businessName: app.name || 'Livreur', contactName: app.name || '', commune: app.commune || '', phone: app.phone || '', createdAt: app.created_at, kind: 'driver' as const })),
 ...(relays.data || []).map((app) => ({ id: app.id, businessName: app.business_name || 'Point relais', contactName: app.manager_name || '', commune: app.commune || '', phone: app.phone || '', createdAt: app.created_at, kind: 'relay' as const })),
 ];
 setApps(combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
 };
 void load();
 }, []);

 if (error) {
 return <p className="text-sm text-red-600">Chargement impossible : {error}</p>;
 }

 if (apps.length === 0) {
 return <p className="text-sm text-muted-foreground italic">Aucune candidature pour le moment</p>;
 }

 return (
 <div className="space-y-3">
 {apps.map((app: LatestApplication) => (
 <div key={`${app.kind}-${app.id}`} className="text-sm p-3 bg-muted rounded-xl flex items-center justify-between gap-2">
 <div className="min-w-0 flex-1">
 <p className="font-semibold text-foreground truncate">{app.businessName}</p>
 <p className="text-xs text-muted-foreground truncate">
 {app.kind === 'partner' ? 'Partenaire' : app.kind === 'driver' ? 'Livreur' : 'Point relais'}
 {app.contactName ? ` • ${app.contactName}` : ''}{app.commune ? ` • ${app.commune}` : ''}{app.phone ? ` • ${app.phone}` : ''}
 </p>
 </div>
 <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
 {new Date(app.createdAt).toLocaleDateString('fr-FR')}
 </span>
 </div>
 ))}
 <Link
 to="/admin/applications"
 className="mt-3 inline-block text-xs text-primary font-semibold hover:underline"
 >
 Voir toutes les candidatures →
 </Link>
 </div>
 );
}

export function AdminDashboard() {
 const [stats, setStats] = useState({
 orders: 0, cateringRequests: 0, partnerApplications: 0,
 driverApplications: 0, relayApplications: 0, leads: 0,
 });
 const [liveStats, setLiveStats] = useState({ ordersToday: 0, revenueMonth: 0, activePartners: 0, ongoingDeliveries: 0 });
 const [catalogStats, setCatalogStats] = useState({ total: mockProducts.length, withoutDescription: 0, withoutPrice: 0 });

 useEffect(() => {
 document.title ='Dashboard Admin — DeliKreol';
 const loadCounts = async () => {
 const [orders, catering, partners, drivers, relays, leads] = await Promise.all([
 supabase.from('orders').select('id', { count: 'exact', head: true }),
 supabase.from('catering_requests').select('id', { count: 'exact', head: true }),
 supabase.from('partner_applications').select('id', { count: 'exact', head: true }),
 supabase.from('driver_applications').select('id', { count: 'exact', head: true }),
 supabase.from('relay_point_applications').select('id', { count: 'exact', head: true }),
 supabase.from('leads').select('id', { count: 'exact', head: true }),
 ]);
 setStats({
 orders: orders.error ? loadFromStorage('delikreol_orders').length : orders.count || 0,
 cateringRequests: catering.error ? loadFromStorage('delikreol_catering_requests').length : catering.count || 0,
 partnerApplications: partners.error ? loadFromStorage('delikreol_partner_applications').length : partners.count || 0,
 driverApplications: drivers.error ? loadFromStorage('delikreol_driver_applications').length : drivers.count || 0,
 relayApplications: relays.error ? loadFromStorage('delikreol_relay_applications').length : relays.count || 0,
 leads: leads.error ? loadFromStorage('delikreol_leads').length : leads.count || 0,
 });
 };
 void loadCounts();
 }, []);

 useEffect(() => {
   const loadLiveStats = async () => {
     const now = new Date();
     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
     const [todayRes, monthRes, vendorsRes, deliveriesRes, productsRes] = await Promise.all([
       supabase.from('orders').select('id').gte('created_at', startOfDay),
       supabase.from('orders').select('total_amount').gte('created_at', startOfMonth),
       supabase.from('vendors').select('id').eq('is_active', true),
       supabase.from('deliveries').select('id').in('status', ['assigned', 'accepted', 'in_progress', 'picked_up', 'en_route']),
       supabase.from('products').select('id, description, price'),
     ]);
     const localOrders = loadFromStorage('delikreol_orders');
     const revenue = (monthRes.data || []).reduce((sum, row) => sum + Number((row as { total_amount?: number }).total_amount || 0), 0);
     const catalog = productsRes.data || [];
     setLiveStats({
       ordersToday: todayRes.error ? localOrders.length : (todayRes.data || []).length,
       revenueMonth: monthRes.error ? 0 : revenue,
       activePartners: vendorsRes.error ? 0 : (vendorsRes.data || []).length,
       ongoingDeliveries: deliveriesRes.error ? 0 : (deliveriesRes.data || []).length,
     });
     if (!productsRes.error && catalog.length > 0) {
       setCatalogStats({
         total: catalog.length,
         withoutDescription: catalog.filter((p) => !p.description || p.description.trim().length < 10).length,
         withoutPrice: catalog.filter((p) => p.price == null || Number(p.price) <= 0).length,
       });
     }
   };
   void loadLiveStats();
 }, []);

 // Audit live depuis les données réelles
 const productsSansDescription = catalogStats.withoutDescription;
 const productsSansPrix = catalogStats.withoutPrice;
 const partenairesActifs = traiteurSpaces.filter(t => t.status ==='public confirmé').length;
 const partenairesAVerifier = traiteurSpaces.filter(t => t.status !=='public confirmé').length;
 const totalProduits = catalogStats.total;

 const cards = [
 { label:'Commandes', value: stats.orders, icon: ShoppingCart, color:'text-blue-600 bg-blue-50', link:'/admin/commandes' },
 { label:'Devis traiteur', value: stats.cateringRequests, icon: FileText, color:'text-purple-600 bg-purple-50', link:'/admin/devis' },
 { label:'Candidatures partenaires', value: stats.partnerApplications, icon: ChefHat, color:'text-primary bg-primary/[0.08]', link:'/admin/applications' },
 { label:'Candidatures livreurs', value: stats.driverApplications, icon: Truck, color:'text-success bg-success/10', link:'/admin/livreurs' },
 { label:'Candidatures relais', value: stats.relayApplications, icon: MapPin, color:'text-amber-600 bg-muted', link:'/admin/points-relais' },
 { label:'Leads', value: stats.leads, icon: Target, color:'text-indigo-600 bg-indigo-50', link:'/admin/leads' },
 ];

 /* Cartes alimentées par les données disponibles */
 const quickCards = [
 { label:'Commandes aujourd\'hui', value: liveStats.ordersToday, icon: CalendarDays, color:'text-blue-600 bg-blue-50' },
 { label:'Revenus du mois', value: `${liveStats.revenueMonth.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, icon: DollarSign, color:'text-success bg-success/10' },
 { label:'Partenaires actifs', value: liveStats.activePartners, icon: Users, color:'text-primary bg-primary/[0.08]' },
 { label:'Livraisons en cours', value: liveStats.ongoingDeliveries, icon: Bike, color:'text-purple-600 bg-purple-50' },
 ];

 return (
 <div>
 <h1 className="text-2xl font-display font-bold mb-6">Vue d'ensemble</h1>

 {/* Quick stats — 4 cartes clés */}
 <h2 className="sectionTitle text-lg font-display font-bold mb-3 text-foreground">Aperçu du jour</h2>
 <div className="cardGrid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 {quickCards.map(card => (
 <div key={card.label} className="card bg-card rounded-2xl border border-border/50 p-5">
 <div className="flex items-center gap-3 mb-2">
 <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
 <card.icon className="w-5 h-5" />
 </div>
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</span>
 </div>
 <p className="text-2xl font-black text-foreground">{card.value}</p>
 </div>
 ))}
 </div>

 {/* Stats cards */}
 <h2 className="sectionTitle text-lg font-display font-bold mb-3 text-foreground">Toutes les données</h2>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
 {cards.map(card => (
 <Link key={card.label} to={card.link} className="bg-card rounded-xl border p-5 hover:shadow-elegant transition-shadow group">
 <div className="flex items-center justify-between mb-3">
 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
 <card.icon className="w-5 h-5" />
 </div>
 <span className="text-3xl font-bold">{card.value}</span>
 </div>
 <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{card.label}</p>
 </Link>
 ))}
 </div>

 {/* Catalogue & Partenaires audit */}
 <div className="grid md:grid-cols-2 gap-4 mb-8">
 {/* Produits */}
 <div className="bg-white rounded-xl border p-5">
 <h2 className="font-semibold flex items-center gap-2 mb-3">
 <Package className="w-5 h-5 text-primary" />
 Produits au catalogue
 </h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span>Total produits</span><span className="font-bold">{totalProduits}</span></div>
 <div className="flex justify-between text-amber-600"><span>⚠️ Descriptions à valider</span><span>{productsSansDescription}</span></div>
 <div className="flex justify-between text-red-600"><span>❌ Prix à confirmer</span><span>{productsSansPrix}</span></div>
 <div className="flex justify-between text-success"><span>✅ Produits OK</span><span>{totalProduits - productsSansDescription}</span></div>
 </div>
 <Link to="/admin/catalogue" className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">Gérer le catalogue →</Link>
 </div>

 {/* Partenaires */}
 <div className="bg-white rounded-xl border p-5">
 <h2 className="font-semibold flex items-center gap-2 mb-3">
 <ChefHat className="w-5 h-5 text-primary" />
 Partenaires
 </h2>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span>Total partenaires</span><span className="font-bold">{traiteurSpaces.length}</span></div>
 <div className="flex justify-between text-success"><span>✅ Publiés</span><span>{partenairesActifs}</span></div>
 <div className="flex justify-between text-amber-600"><span>⚠️ À vérifier</span><span>{partenairesAVerifier}</span></div>
 <div className="flex justify-between"><span>Forfaits disponibles</span><span className="font-bold">{PARTNER_PLANS.length}</span></div>
 </div>
 <Link to="/admin/partenaires" className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">Voir les partenaires →</Link>
 </div>
 </div>

 {/* Dernières candidatures partenaires */}
 <div className="bg-white rounded-xl border p-5 mb-8">
 <h2 className="font-semibold flex items-center gap-2 mb-3">
 <FileText className="w-5 h-5 text-primary" />
 Dernières candidatures
 </h2>
 <LatestApplications />
 </div>

 {/* Alerts */}
 <div className="bg-muted border border-input rounded-xl p-5">
 <h2 className="font-semibold text-muted-foreground flex items-center gap-2 mb-3">
 <AlertTriangle className="w-5 h-5" />
 Actions à faire
 </h2>
 <ul className="space-y-2 text-sm text-muted-foreground">
 {productsSansDescription > 0 && (
 <li className="flex items-center gap-2"><ImageOff className="w-4 h-4" />{productsSansDescription} produit(s) sans description complète</li>
 )}
 {productsSansPrix > 0 && (
 <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{productsSansPrix} produit(s) sans prix défini</li>
 )}
 {partenairesAVerifier > 0 && (
 <li className="flex items-center gap-2"><ChefHat className="w-4 h-4" />{partenairesAVerifier} partenaire(s) à vérifier avant publication</li>
 )}
 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" />{partenairesActifs} partenaire(s) publié(s) et actif(s)</li>
 </ul>
 </div>
 </div>
 );
}

export default AdminDashboard;
