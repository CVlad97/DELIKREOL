import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Users, ChefHat, Truck, MapPin, FileText,
  ShoppingCart, TrendingUp, CalendarDays, DollarSign,
  MousePointerClick, ArrowUpRight, ArrowDownRight,
  BarChart3, Target, Smartphone, Monitor,
} from 'lucide-react';
import { getLocalMetrics } from '../../services/metricsService';

/* ─── Helpers localStorage ─── */
function loadFromStorage(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

/* ─── Types ─── */
interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  growth?: number;
  sub?: string;
}

/* ─── Composant carte statistique ─── */
function StatCardWidget({ card }: { card: StatCard }) {
  const Icon = card.icon;
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-elegant transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {card.growth !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold ${card.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {card.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(card.growth)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-foreground mb-1">{card.value}</p>
      <p className="text-sm text-muted-foreground">{card.label}</p>
      {card.sub && <p className="text-xs text-muted-foreground/60 mt-1">{card.sub}</p>}
    </div>
  );
}

/* ─── Section inscriptions par catégorie ─── */
function SignupsByCategory() {
  const partners = loadFromStorage('delikreol_partner_applications');
  const drivers = loadFromStorage('delikreol_driver_applications');
  const relays = loadFromStorage('delikreol_relay_applications');
  const catering = loadFromStorage('delikreol_catering_requests');
  const leads = loadFromStorage('delikreol_leads');
  const orders = loadFromStorage('delikreol_orders');

  const categories = [
    { label: 'Traiteurs (partenaires)', value: partners.length, icon: ChefHat, color: 'text-orange-600 bg-orange-50' },
    { label: 'Livreurs', value: drivers.length, icon: Truck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Points relais', value: relays.length, icon: MapPin, color: 'text-amber-600 bg-amber-50' },
    { label: 'Demandes devis traiteur', value: catering.length, icon: FileText, color: 'text-purple-600 bg-purple-50' },
    { label: 'Leads', value: leads.length, icon: Target, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Commandes', value: orders.length, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  ];

  const total = categories.reduce((s, c) => s + c.value, 0);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Inscriptions & Conversions par catégorie
        <span className="text-xs text-muted-foreground font-normal ml-auto">Total: {total}</span>
      </h3>
      <div className="space-y-3">
        {categories.map(cat => {
          const Icon = cat.icon;
          const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
          return (
            <div key={cat.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground truncate">{cat.label}</span>
                  <span className="font-bold text-foreground ml-2">{cat.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: cat.color.match(/bg-(\w+)-(\d+)/)?.[0]?.replace('text-', '') || '#f97316' }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Entonnoir de conversion ─── */
function ConversionFunnel() {
  const metrics = getLocalMetrics();
  const views = metrics.public_view || 0;
  const partners = loadFromStorage('delikreol_partner_applications').length;
  const catering = loadFromStorage('delikreol_catering_requests').length;
  const orders = loadFromStorage('delikreol_orders').length;

  const steps = [
    { label: 'Vues du site', value: views, pct: 100 },
    { label: 'Candidatures partenaires', value: partners, pct: views > 0 ? Math.round((partners / views) * 100) : 0 },
    { label: 'Demandes de devis', value: catering, pct: views > 0 ? Math.round((catering / views) * 100) : 0 },
    { label: 'Commandes', value: orders, pct: views > 0 ? Math.round((orders / views) * 100) : 0 },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Entonnoir de conversion
      </h3>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.label} className="relative">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{step.label}</span>
              <span className="font-bold text-foreground">{step.value.toLocaleString('fr-FR')}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${step.pct}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #f97316, #fb923c)'
                    : i === 1
                      ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                      : i === 2
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{step.pct}% des visiteurs</p>
          </div>
        ))}
      </div>
      {views === 0 && (
        <p className="text-xs text-amber-600 mt-3">
          ⚠️ Aucune vue enregistrée. Le tracking est actif maintenant que les pages appellent trackPublicView().
        </p>
      )}
    </div>
  );
}

/* ─── Stats en temps réel ─── */
function RealtimeStats() {
  const metrics = getLocalMetrics();
  const now = new Date();
  const today = now.toDateString();

  // Compter les inscriptions d'aujourd'hui
  const todayPartners = loadFromStorage('delikreol_partner_applications')
    .filter((a: any) => new Date(a.createdAt || a.created_at || 0).toDateString() === today).length;
  const todayOrders = loadFromStorage('delikreol_orders')
    .filter((a: any) => new Date(a.createdAt || a.created_at || 0).toDateString() === today).length;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Aujourd'hui
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 rounded-xl text-center">
          <p className="text-2xl font-black text-blue-600">{metrics.public_view || 0}</p>
          <p className="text-xs text-blue-700 font-medium">Vues totales</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl text-center">
          <p className="text-2xl font-black text-emerald-600">{todayOrders}</p>
          <p className="text-xs text-emerald-700 font-medium">Commandes aujourd'hui</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-xl text-center">
          <p className="text-2xl font-black text-orange-600">{todayPartners}</p>
          <p className="text-xs text-orange-700 font-medium">Nouveaux inscrits</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl text-center">
          <p className="text-2xl font-black text-purple-600">{loadFromStorage('delikreol_orders').length}</p>
          <p className="text-xs text-purple-700 font-medium">Commandes total</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Recommandations actionnables ─── */
function ActionRecommendations() {
  const metrics = getLocalMetrics();
  const views = metrics.public_view || 0;
  const partners = loadFromStorage('delikreol_partner_applications').length;
  const drivers = loadFromStorage('delikreol_driver_applications').length;
  const orders = loadFromStorage('delikreol_orders').length;

  const recs = [];

  if (views < 10) {
    recs.push({
      priority: 'P0',
      title: '🌐 Gagner en visibilité',
      desc: 'Moins de 10 vues. Partager le lien sur WhatsApp, Facebook, Instagram. Activer Google Analytics (VITE_GA_ID dans .env).',
      icon: Eye,
      color: 'text-red-600 bg-red-50',
    });
  }
  if (partners < 3) {
    recs.push({
      priority: 'P0',
      title: '🤝 Recruter des traiteurs',
      desc: 'Contacter les traiteurs locaux Martinique (WhatsApp, bouche-à-oreille). Proposer le forfait gratuit ou lancement.',
      icon: ChefHat,
      color: 'text-orange-600 bg-orange-50',
    });
  }
  if (drivers < 2) {
    recs.push({
      priority: 'P1',
      title: '🚚 Recruter des livreurs',
      desc: 'Les livreurs sont essentiels. Publier l\'offre sur les réseaux martiniquais.',
      icon: Truck,
      color: 'text-emerald-600 bg-emerald-50',
    });
  }
  if (orders === 0) {
    recs.push({
      priority: 'P0',
      title: '💸 Première commande',
      desc: 'Objectif numéro 1 : passer la première commande réelle. Faire une commande test toi-même ou offrir une réduction à un ami.',
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50',
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'OK',
      title: '🎉 Bonne dynamique !',
      desc: 'Continue d\'alimenter le catalogue et de recruter. Prochaine étape : automatiser le marketing.',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    });
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Recommandations actionnables
      </h3>
      <div className="space-y-3">
        {recs.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rec.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rec.priority === 'P0' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'P1' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{rec.priority}</span>
                  <span className="font-bold text-sm text-foreground">{rec.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
export default function AdminAnalytics() {
  useEffect(() => {
    document.title = 'Analytics — Admin DeliKreol';
  }, []);

  const metrics = getLocalMetrics();
  const partners = loadFromStorage('delikreol_partner_applications');
  const drivers = loadFromStorage('delikreol_driver_applications');
  const relays = loadFromStorage('delikreol_relay_applications');
  const catering = loadFromStorage('delikreol_catering_requests');
  const orders = loadFromStorage('delikreol_orders');
  const leads = loadFromStorage('delikreol_leads');

  const totalSignups = partners.length + drivers.length + relays.length;

  const summaryCards: StatCard[] = [
    { label: 'Vues du site', value: metrics.public_view || 0, icon: Eye, color: 'text-blue-600 bg-blue-50', growth: 0, sub: 'toutes sessions confondues' },
    { label: 'Inscriptions total', value: totalSignups, icon: Users, color: 'text-orange-600 bg-orange-50', sub: `${partners.length} traiteurs · ${drivers.length} livreurs · ${relays.length} relais` },
    { label: 'Demandes de devis', value: catering.length, icon: FileText, color: 'text-purple-600 bg-purple-50', sub: 'traiteur événementiel' },
    { label: 'Commandes', value: orders.length, icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50', sub: `${leads.length} leads` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Tableau de bord des métriques — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          to="/admin"
          className="text-sm text-primary font-semibold hover:underline"
        >
          ← Retour
        </Link>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <StatCardWidget key={card.label} card={card} />
        ))}
      </div>

      {/* Grille principale */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ConversionFunnel />
        <RealtimeStats />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SignupsByCategory />
        <ActionRecommendations />
      </div>

      {/* Note sur les données */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
        <p className="font-semibold mb-1">📊 Données locales (localStorage)</p>
        <p>
          Les analytics sont basés sur les données stockées dans le navigateur via localStorage.
          Pour des analytics professionnels, configure <code className="bg-amber-100 px-1 rounded">VITE_GA_ID</code> (Google Analytics) dans le fichier <code className="bg-amber-100 px-1 rounded">.env</code>.
          Les données Google Analytics seront visibles dans ton compte Google Analytics sur <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">analytics.google.com</a>.
        </p>
      </div>
    </div>
  );
}