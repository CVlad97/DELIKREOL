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
import { LanguageSwitcher } from '../LanguageSwitcher';
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
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-white/95 shadow-[0_14px_40px_-34px_rgba(42,25,15,0.55)] backdrop-blur-2xl">
      <div className="madras-strip" />

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-[68px] min-w-0 items-center justify-between gap-1.5 sm:gap-2">
          <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2" aria-label="DeliKreol accueil">
            <img
              src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
              alt="Logo DeliKreol"
              className="brand-logo-frame h-10 w-10 shrink-0 rounded-2xl object-contain p-1.5 transition-transform group-hover:scale-105 sm:h-11 sm:w-11"
            />
            <div className="hidden min-[430px]:block leading-tight">
              <span className="block text-base font-black tracking-tight text-foreground sm:text-xl">
                Deli<span className="text-primary">Kreol</span>
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:block">
                Martinique
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-primary/20 bg-primary/[0.06] p-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive(item.to)
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-foreground/70 hover:bg-white hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Link
              to={accountTarget}
              className="inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl bg-foreground px-2 text-xs font-black text-white shadow-sm transition-colors hover:bg-primary md:px-3 md:text-sm"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountIcon}
              <span className="hidden md:inline">{accountLabel}</span>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/10 sm:flex"
              title="Contactez-nous sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <Link
              to="/panier"
              className="relative inline-flex h-10 min-w-10 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-primary/10 hover:text-foreground"
              aria-label={`Panier (${itemCount} articles)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-primary/10 lg:hidden"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="animate-slide-up border-t border-border/40 bg-white/95 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            <Link
              to={accountTarget}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary"
            >
              {accountIcon}
              {accountLabel}
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
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
              className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
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
