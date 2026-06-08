import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, ChefHat, Truck, MapPin, FileText,
  Target, AlertTriangle, ImageOff, Package
} from 'lucide-react';

function loadFromStorage(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

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

  const cards = [
    { label: 'Commandes', value: stats.orders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50', link: '/admin/commandes' },
    { label: 'Devis traiteur', value: stats.cateringRequests, icon: FileText, color: 'text-purple-600 bg-purple-50', link: '/admin/devis' },
    { label: 'Demandes partenaires', value: stats.partnerApplications, icon: ChefHat, color: 'text-orange-600 bg-orange-50', link: '/admin/partenaires' },
    { label: 'Candidatures livreurs', value: stats.driverApplications, icon: Truck, color: 'text-emerald-600 bg-emerald-50', link: '/admin/livreurs' },
    { label: 'Candidatures relais', value: stats.relayApplications, icon: MapPin, color: 'text-amber-600 bg-amber-50', link: '/admin/points-relais' },
    { label: 'Leads', value: stats.leads, icon: Target, color: 'text-indigo-600 bg-indigo-50', link: '/admin/leads' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Vue d'ensemble</h1>

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

      {/* Alerts */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5" />
          Actions à faire
        </h2>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-center gap-2"><ImageOff className="w-4 h-4" />Produits sans photo : vérifier les visuels</li>
          <li className="flex items-center gap-2"><Package className="w-4 h-4" />Produits sans description : compléter avec les prestataires</li>
          <li className="flex items-center gap-2"><ChefHat className="w-4 h-4" />Partenaires à contacter pour validation</li>
          <li className="flex items-center gap-2"><Truck className="w-4 h-4" />Aucun livreur validé pour le moment</li>
          <li className="flex items-center gap-2"><MapPin className="w-4 h-4" />Aucun point relais validé pour le moment</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
