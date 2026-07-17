import { useEffect, useState } from 'react';
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
  activePrefixes?: string[];
}

const primaryNavItems: NavItem[] = [
  { label: 'Catalogue', to: '/catalogue', icon: <Store className="h-4 w-4" /> },
  {
    label: 'Traiteurs',
    to: '/traiteurs',
    icon: <ChefHat className="h-4 w-4" />,
    activePrefixes: ['/traiteurs', '/traiteur'],
  },
  { label: 'Commander', to: '/devis', icon: <FileText className="h-4 w-4" /> },
  { label: 'Partenaire', to: '/devenir-partenaire', icon: <Users className="h-4 w-4" /> },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Signaler un bug', to: '/feedback', icon: <Bug className="h-4 w-4" /> },
];

const allMobileNavItems = [...primaryNavItems, ...secondaryNavItems];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (item: NavItem) => {
    const prefixes = item.activePrefixes || [item.to];
    return prefixes.some((prefix) => (
      location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
    ));
  };

  const isAdmin = user && profile?.user_type === 'admin';
  const accountTarget = !user ? '/connexion?next=/compte' : isAdmin ? '/admin' : '/compte';
  const accountLabel = user ? 'Mon espace' : 'Se connecter';
  const accountIcon = user
    ? <LayoutDashboard className="h-4 w-4" />
    : <LogIn className="h-4 w-4" />;

  const cartBadge = itemCount > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground shadow-sm animate-scale-in">
      {itemCount}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border-strong/50 bg-background/95 shadow-sm backdrop-blur-xl">
      <div className="madras-strip" />

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="grid h-[72px] grid-cols-[44px_minmax(0,1fr)_44px] items-center xl:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            to="/"
            data-testid="header-brand-mobile"
            className="flex min-w-0 items-center justify-self-center gap-1.5 rounded-xl px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Accueil DeliKreol"
          >
            <img
              src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
              alt=""
              className="brand-logo-frame h-10 w-10 shrink-0 rounded-xl object-contain p-1"
            />
            <span className="whitespace-nowrap text-base font-black tracking-[-0.04em] text-foreground min-[360px]:text-lg">
              DELI<span className="text-primary">KREOL</span>
            </span>
          </Link>

          <Link
            to="/panier"
            className="relative flex h-11 w-11 items-center justify-center justify-self-end rounded-xl text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartBadge}
          </Link>
        </div>

        <div className="hidden h-[76px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 xl:grid">
          <nav
            className="flex min-w-0 items-center gap-1 justify-self-start rounded-2xl border border-border-strong/40 bg-card p-1 shadow-sm"
            aria-label="Navigation principale"
          >
            {primaryNavItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/"
            data-testid="header-brand-desktop"
            className="flex items-center justify-self-center gap-2.5 rounded-xl px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Accueil DeliKreol"
          >
            <img
              src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
              alt=""
              className="brand-logo-frame h-11 w-11 rounded-xl object-contain p-1"
            />
            <span className="leading-none">
              <span className="block whitespace-nowrap text-xl font-black tracking-[-0.04em] text-foreground">
                DELI<span className="text-primary">KREOL</span>
              </span>
              <span className="mt-1 block text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Martinique
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center justify-self-end gap-2">
            <LanguageSwitcher />

            <Link
              to={accountTarget}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountIcon}
              <span className="hidden 2xl:inline">{accountLabel}</span>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-success transition-colors hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Contacter DeliKreol sur WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>

            <Link
              to="/panier"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartBadge}
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="animate-slide-up border-t border-border-strong/40 bg-background/98 shadow-xl backdrop-blur-xl xl:hidden"
        >
          <nav className="mx-auto max-w-7xl space-y-2 px-4 py-4" aria-label="Navigation mobile">
            <Link
              to={accountTarget}
              className="flex min-h-12 items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {accountIcon}
              {accountLabel}
            </Link>

            <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border-strong/40 bg-card px-3 py-2">
              <span className="text-sm font-bold text-foreground">Langue du site</span>
              <LanguageSwitcher />
            </div>

            <div className="space-y-1 pt-1">
              {allMobileNavItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-success transition-colors hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
