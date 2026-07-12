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
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const WHATSAPP_NUMBER = '596696653589';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Bonjour, je souhaite obtenir une information sur DeliKreol.'
)}`;

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Catalogue', to: '/catalogue', icon: <Store className="h-4 w-4" /> },
  { label: 'Traiteurs', to: '/traiteurs', icon: <ChefHat className="h-4 w-4" /> },
  { label: 'Demande pro', to: '/devis', icon: <FileText className="h-4 w-4" /> },
  { label: 'Partenaires', to: '/devenir-partenaire', icon: <Users className="h-4 w-4" /> },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));
  const isAdmin = user && profile?.user_type === 'admin';
  const accountTarget = !user ? '/connexion?next=/compte' : isAdmin ? '/admin' : '/compte';
  const accountLabel = user ? 'Mon espace' : 'Connexion';
  const accountIcon = user ? (
    <LayoutDashboard className="h-4 w-4" />
  ) : (
    <LogIn className="h-4 w-4" />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-white/95 shadow-[0_14px_40px_-34px_rgba(42,25,15,0.55)] backdrop-blur-2xl">
      <div className="madras-strip" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[70px] items-center justify-between gap-2">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="DeliKreol — accueil"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
              alt=""
              aria-hidden="true"
              width="44"
              height="44"
              className="brand-logo-frame h-10 w-10 rounded-2xl object-contain p-1.5 transition-transform group-hover:scale-105 sm:h-11 sm:w-11"
            />
            <div className="leading-tight">
              <span className="block text-base font-black tracking-tight text-foreground sm:text-xl">
                Deli<span className="text-primary">Kreol</span>
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:block">
                Martinique
              </span>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-2xl border border-primary/15 bg-primary/5 p-1 lg:flex"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive(item.to)
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-foreground/70 hover:bg-white hover:text-foreground'
                }`}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
              title="Contacter DeliKreol sur WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <Link
              to={accountTarget}
              className="hidden items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-sm font-black text-background shadow-sm transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountIcon}
              <span>{accountLabel}</span>
            </Link>

            <Link
              to="/panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground/75 transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Panier — ${itemCount} article${itemCount > 1 ? 's' : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground/75 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="animate-slide-up border-t border-border bg-white/98 shadow-2xl backdrop-blur-xl lg:hidden"
        >
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="Navigation mobile">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/75 hover:bg-muted'
                }`}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <Link
              to={accountTarget}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-sm font-black text-background transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {accountIcon}
              {accountLabel}
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
