import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
  ChefHat,
  Store,
  FileText,
  Users,
  LogIn,
  LayoutDashboard,
  Bug,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const WHATSAPP_NUMBER = '596696653589';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Catalogue', to: '/catalogue', icon: <Store className="w-4 h-4" /> },
  { label: 'Traiteurs', to: '/traiteurs', icon: <ChefHat className="w-4 h-4" /> },
  { label: 'Commander', to: '/devis', icon: <FileText className="w-4 h-4" /> },
  { label: 'Partenaire', to: '/devenir-partenaire', icon: <Users className="w-4 h-4" /> },
  { label: 'Signaler un bug', to: '/feedback', icon: <Bug className="w-4 h-4" /> },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user && profile?.user_type === 'admin';
  const accountTarget = !user ? '/connexion?next=/compte' : isAdmin ? '/admin' : '/compte';
  const accountLabel = user ? 'Mon espace' : 'Se connecter';
  const accountIcon = user ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-orange-100 shadow-sm">
      <div className="madras-strip" />

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="DeliKreol accueil">
            <img
              src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
              alt="Logo DeliKreol"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-contain group-hover:scale-105 transition-transform"
            />
            <div className="block leading-tight">
              <span className="block text-base sm:text-xl font-black tracking-tight text-foreground">
                Deli<span className="text-primary">Kreol</span>
              </span>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                Martinique
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to={accountTarget}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-black text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountIcon}
              <span>{accountLabel}</span>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              title="Contactez-nous sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <Link
              to="/panier"
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              aria-label={`Panier (${itemCount} articles)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-foreground/70 hover:bg-muted transition-colors"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-white/95 backdrop-blur-xl animate-slide-up">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <Link
              to={accountTarget}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              {accountIcon}
              {accountLabel}
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
