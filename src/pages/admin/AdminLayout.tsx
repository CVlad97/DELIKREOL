import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, MapPin, FileText,
  Target, Brain, Settings, Menu, X, Home, ShoppingCart,
  Briefcase, DollarSign, ChefHat, ClipboardList, MessageCircle, KeyRound, Activity
} from 'lucide-react';

const adminNav = [
  { label: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/admin' },
  { label: 'Test système', icon: Activity, path: '/admin/test-systeme' },
  { label: 'Commandes', icon: ShoppingCart, path: '/admin/commandes' },
  { label: 'Produits', icon: Package, path: '/admin/catalogue' },
  { label: 'Partenaires', icon: ChefHat, path: '/admin/partenaires' },
  { label: 'Livreurs', icon: Truck, path: '/admin/livreurs' },
  { label: 'Points relais', icon: MapPin, path: '/admin/points-relais' },
  { label: 'Devis', icon: FileText, path: '/admin/devis' },
  { label: 'Leads', icon: Target, path: '/admin/leads' },
  { label: 'Mémoire projet', icon: Brain, path: '/admin/memoire' },
  { label: 'Paramètres', icon: Settings, path: '/admin/parametres' },
  { label: 'Orchestrateur', icon: Briefcase, path: '/admin/orchestrateur' },
  { label: 'Offres cash', icon: DollarSign, path: '/admin/offres' },
  { label: 'Finance', icon: DollarSign, path: '/admin/finance' },
  { label: 'Feedback', icon: MessageCircle, path: '/admin/feedback' },
  { label: 'Candidatures', icon: ClipboardList, path: '/admin/applications' },
  { label: 'Validation traiteurs', icon: ChefHat, path: '/admin/caterer-validation' },
  { label: 'Accès pilote', icon: KeyRound, path: '/admin/acces-pilote' },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">DK</div>
            <span className="font-bold text-foreground">Admin DeliKreol</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t my-3" />
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
            <Home className="w-4 h-4" />
            Retour au site
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">Admin DeliKreol</span>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
