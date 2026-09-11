import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  MapPin,
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const WHATSAPP_NUMBER = '596696653589';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const OWNER_EMAIL = 'contactcvs@ikabay.store';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  activePrefixes?: string[];
}

type BrandMarket = {
  region: string;
  subtitle: string;
  badge: string;
};

const DEFAULT_MARKET: BrandMarket = {
  region: 'Martinique',
  subtitle: 'DeliKreol Martinique',
  badge: 'À la carte',
};

function resolveMarketFromCoords(latitude: number, longitude: number): BrandMarket {
  if (latitude >= 15.75 && latitude <= 16.65 && longitude >= -62 && longitude <= -60.85) {
    return { region: 'Guadeloupe', subtitle: 'DeliKreol Guadeloupe', badge: 'À la carte' };
  }
  if (latitude >= 14.35 && latitude <= 14.95 && longitude >= -61.35 && longitude <= -60.75) {
    return DEFAULT_MARKET;
  }
  if (latitude >= 2 && latitude <= 6 && longitude >= -55 && longitude <= -51) {
    return { region: 'Guyane', subtitle: 'DeliKreol Guyane', badge: 'À la carte' };
  }
  if (latitude >= 17.75 && latitude <= 18.2 && longitude >= -63.25 && longitude <= -62.7) {
    return { region: 'Saint-Martin', subtitle: 'DeliKreol Saint-Martin', badge: 'À la carte' };
  }
  if (latitude >= 15.15 && latitude <= 15.75 && longitude >= -61.6 && longitude <= -61.15) {
    return { region: 'Dominique', subtitle: 'DeliKreol Dominique', badge: 'À la carte' };
  }
  return DEFAULT_MARKET;
}

function readStoredMarket(): BrandMarket {
  if (typeof window === 'undefined') return DEFAULT_MARKET;
  try {
    const raw = window.localStorage.getItem('delikreol_brand_market');
    if (!raw) return DEFAULT_MARKET;
    const parsed = JSON.parse(raw) as Partial<BrandMarket>;
    if (!parsed.region || !parsed.subtitle) return DEFAULT_MARKET;
    return {
      region: parsed.region,
      subtitle: parsed.subtitle,
      badge: parsed.badge || 'À la carte',
    };
  } catch {
    return DEFAULT_MARKET;
  }
}

const primaryNavItems: NavItem[] = [
  { label: 'Catalogue', to: '/catalogue', icon: <Store className="h-4 w-4" /> },
  {
    label: 'Traiteurs',
    to: '/traiteurs',
    icon: <ChefHat className="h-4 w-4" />,
    activePrefixes: ['/traiteurs', '/traiteur'],
  },
  { label: 'Actualités', to: '/actualites', icon: <FileText className="h-4 w-4" /> },
  { label: 'Commander', to: '/devis', icon: <FileText className="h-4 w-4" /> },
  { label: 'Partenaire', to: '/devenir-partenaire', icon: <Users className="h-4 w-4" /> },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Signaler un bug', to: '/feedback', icon: <Bug className="h-4 w-4" /> },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandMarket, setBrandMarket] = useState<BrandMarket>(() => readStoredMarket());
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const localizedPrimaryNavItems = primaryNavItems.map((item) => ({
    ...item,
    label: item.to === '/catalogue' ? t('nav.catalog')
      : item.to === '/traiteurs' ? t('nav.traiteurs')
        : item.to === '/actualites' ? 'Actualités'
          : item.to === '/devenir-partenaire' ? t('nav.partner')
            : t('home.hero_cta'),
  }));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const applyMarket = (nextMarket: BrandMarket) => {
      if (cancelled) return;
      setBrandMarket(nextMarket);
      try {
        window.localStorage.setItem('delikreol_brand_market', JSON.stringify(nextMarket));
      } catch { /* ignore */ }
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) return undefined;

    const locate = () => navigator.geolocation.getCurrentPosition(
      (position) => applyMarket(resolveMarketFromCoords(position.coords.latitude, position.coords.longitude)),
      () => undefined,
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 900000 }
    );

    if ('permissions' in navigator && navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((permission) => {
          if (permission.state === 'granted') locate();
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (item: NavItem) => {
    const prefixes = item.activePrefixes || [item.to];
    return prefixes.some((prefix) => (
      location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
    ));
  };

  const userEmail = (user?.email || '').trim().toLowerCase();
  const isAdmin = !!user && (profile?.user_type === 'admin' || userEmail === OWNER_EMAIL);
  const accountTarget = !user ? '/pro' : isAdmin ? '/admin' : '/compte';
  const accountLabel = user ? t('nav.account') : t('nav.login');
  const accountIcon = user
    ? <LayoutDashboard className="h-4 w-4" />
    : <LogIn className="h-4 w-4" />;

  const cartBadge = itemCount > 0 && (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground shadow-sm animate-scale-in">
      {itemCount}
    </span>
  );

  const brandLogo = (
    <img
      src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
      alt=""
      className="brand-logo-frame h-12 w-12 shrink-0 rounded-2xl object-contain p-1.5 ring-2 ring-white/90 sm:h-14 sm:w-14"
    />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border-strong/50 bg-background/95 shadow-sm backdrop-blur-xl">
      <div className="madras-strip" />

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative grid h-[82px] grid-cols-[44px_minmax(0,1fr)_88px] items-center gap-1 xl:hidden">
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
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-[1.4rem] border border-primary/20 bg-white/95 px-2.5 py-1.5 text-center shadow-[0_18px_45px_-28px_rgba(42,25,15,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Accueil ${brandMarket.subtitle}`}
          >
            {brandLogo}
            <span className="leading-none">
              <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-primary">
                {brandMarket.badge}
              </span>
              <span className="block whitespace-nowrap text-lg font-black tracking-[-0.05em] text-foreground">
                DELI<span className="text-primary">KREOL</span>
              </span>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" /> {brandMarket.region}
              </span>
            </span>
          </Link>

          <div className="col-start-3 flex items-center justify-end gap-1">
            <Link
              to={accountTarget}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountIcon}
            </Link>

            <Link
              to="/panier"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartBadge}
            </Link>
          </div>
        </div>

        <div className="hidden h-[88px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 xl:grid">
          <nav
            className="flex min-w-0 items-center gap-1 justify-self-start rounded-2xl border border-border-strong/40 bg-card p-1 shadow-sm"
            aria-label="Navigation principale"
          >
            {localizedPrimaryNavItems.map((item) => {
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
            className="group flex items-center justify-self-center gap-3 rounded-[1.6rem] border border-primary/20 bg-white/95 px-4 py-2.5 text-center shadow-[0_24px_70px_-42px_rgba(42,25,15,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-48px_rgba(42,25,15,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Accueil ${brandMarket.subtitle}`}
          >
            {brandLogo}
            <span className="leading-none">
              <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                {brandMarket.badge}
              </span>
              <span className="block whitespace-nowrap text-2xl font-black tracking-[-0.055em] text-foreground">
                DELI<span className="text-primary">KREOL</span>
              </span>
              <span className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {brandMarket.subtitle}
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
          className="animate-slide-up border-t border-border-strong/40 bg-background shadow-xl xl:hidden"
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
              <span className="text-sm font-bold text-foreground">{t('common.language')}</span>
              <LanguageSwitcher />
            </div>

            <div className="space-y-1 pt-1">
              {[...localizedPrimaryNavItems, ...secondaryNavItems].map((item) => {
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
