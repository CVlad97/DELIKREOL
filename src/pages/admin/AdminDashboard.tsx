import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, ChefHat, Truck, MapPin, FileText,
  Target, AlertTriangle, ImageOff, Package, CheckCircle2,
  DollarSign, CalendarDays, Users, Bike,
} from 'lucide-react';
import { mockProducts } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import { PARTNER_PLANS } from '../../services/pricing';

function loadFromStorage(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

/* ─── Données démo réalistes ─── */
const DEMO_STATS = {
  ordersToday: 14,
  revenueMonth: 4_280.50,
  activePartners: 8,
  ongoingDeliveries: 6,
};

export function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0, cateringRequests: 0, partnerApplications: 0,
    driverApplications: 0, relayApplications: 0, leads: 0,
  });

  useEffect(() => {
    document.title = 'Dashboard Admin — DeliKreol';
    setStats({
      orders: loadFromStorage('delikreol_orders').length,
      cateringRequests: loadFromStorage('delikreol_catering_requests').length,
      partnerApplications: loadFromStorage('delikreol_partner_applications').length,
      driverApplications: loadFromStorage('delikreol_driver_applications').length,
      relayApplications: loadFromStorage('delikreol_relay_applications').length,
      leads: loadFromStorage('delikreol_leads').length,
    });
  }, []);

  // Audit live depuis les données réelles
  const productsSansDescription = mockProducts.filter(p => !p.description || p.description.includes('confirmer')).length;
  const productsSansPrix = mockProducts.filter(p => !p.price || p.price === 0).length;
  const partenairesActifs = traiteurSpaces.filter(t => t.status === 'public confirmé').length;
  const partenairesAVerifier = traiteurSpaces.filter(t => t.status !== 'public confirmé').length;
  const totalProduits = mockProducts.length;

  const cards = [
    { label: 'Commandes', value: stats.orders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50', link: '/admin/commandes' },
    { label: 'Devis traiteur', value: stats.cateringRequests, icon: FileText, color: 'text-purple-600 bg-purple-50', link: '/admin/devis' },
    { label: 'Partenaires', value: stats.partnerApplications, icon: ChefHat, color: 'text-orange-600 bg-orange-50', link: '/admin/partenaires' },
    { label: 'Candidatures livreurs', value: stats.driverApplications, icon: Truck, color: 'text-emerald-600 bg-emerald-50', link: '/admin/livreurs' },
    { label: 'Candidatures relais', value: stats.relayApplications, icon: MapPin, color: 'text-amber-600 bg-amber-50', link: '/admin/points-relais' },
    { label: 'Leads', value: stats.leads, icon: Target, color: 'text-indigo-600 bg-indigo-50', link: '/admin/leads' },
  ];

  /* Cartes stats "live" (démo réalistes) */
  const quickCards = [
    { label: 'Commandes aujourd\'hui', value: DEMO_STATS.ordersToday, icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
    { label: 'Revenus du mois', value: `${DEMO_STATS.revenueMonth.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Partenaires actifs', value: DEMO_STATS.activePartners, icon: Users, color: 'text-orange-600 bg-orange-50' },
    { label: 'Livraisons en cours', value: DEMO_STATS.ongoingDeliveries, icon: Bike, color: 'text-purple-600 bg-purple-50' },
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
            <Package className="w-5 h-5 text-orange-600" />
                         Produits au catalogue
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total produits</span><span className="font-bold">{totalProduits}</span></div>
            <div className="flex justify-between text-amber-600"><span>⚠️ Descriptions à valider</span><span>{productsSansDescription}</span></div>
            <div className="flex justify-between text-red-600"><span>❌ Prix à confirmer</span><span>{productsSansPrix}</span></div>
            <div className="flex justify-between text-emerald-600"><span>✅ Produits OK</span><span>{totalProduits - productsSansDescription}</span></div>
          </div>
          <Link to="/admin/catalogue" className="mt-3 inline-block text-xs text-orange-600 font-semibold hover:underline">Gérer le catalogue →</Link>
        </div>

        {/* Partenaires */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <ChefHat className="w-5 h-5 text-orange-600" />
            Partenaires
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total partenaires</span><span className="font-bold">{traiteurSpaces.length}</span></div>
            <div className="flex justify-between text-emerald-600"><span>✅ Publiés</span><span>{partenairesActifs}</span></div>
            <div className="flex justify-between text-amber-600"><span>⚠️ À vérifier</span><span>{partenairesAVerifier}</span></div>
            <div className="flex justify-between"><span>Forfaits disponibles</span><span className="font-bold">{PARTNER_PLANS.length}</span></div>
          </div>
          <Link to="/admin/partenaires" className="mt-3 inline-block text-xs text-orange-600 font-semibold hover:underline">Voir les partenaires →</Link>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5" />
          Actions à faire
        </h2>
        <ul className="space-y-2 text-sm text-amber-700">
          {productsSansDescription > 0 && (
            <li className="flex items-center gap-2"><ImageOff className="w-4 h-4" />{productsSansDescription} produit(s) sans description complète</li>
          )}
          {productsSansPrix > 0 && (
            <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{productsSansPrix} produit(s) sans prix défini</li>
          )}
          {partenairesAVerifier > 0 && (
            <li className="flex items-center gap-2"><ChefHat className="w-4 h-4" />{partenairesAVerifier} partenaire(s) à vérifier avant publication</li>
          )}
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{partenairesActifs} partenaire(s) publié(s) et actif(s)</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;