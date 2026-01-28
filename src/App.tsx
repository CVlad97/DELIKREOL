import { ReactNode, useState, lazy, Suspense } from 'react';
import { Home, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RoleSelector } from './components/RoleSelector';
import { RoleInfoModal } from './components/RoleInfoModal';
import { AuthModal } from './components/AuthModal';
import { ClientHomePage } from './pages/ClientHomePage';
import { isSupabaseConfigured } from './lib/supabase';
import type { UserType } from './types';

const CustomerApp = lazy(() => import('./pages/CustomerApp'));
const VendorApp = lazy(() => import('./pages/VendorApp'));
const RelayHostApp = lazy(() => import('./pages/RelayHostApp'));
const DriverApp = lazy(() => import('./pages/DriverApp'));
const AdminApp = lazy(() => import('./pages/AdminApp'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const BecomePartner = lazy(() => import('./pages/BecomePartner'));
const LegalMentionsPage = lazy(() => import('./pages/LegalMentionsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary mx-auto mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-elegant">
            D
          </span>
        </div>
      </div>
      <p className="text-foreground font-bold text-xl tracking-tight">DELIKREOL</p>
      <p className="text-muted-foreground text-sm mt-2">Chargement de votre expérience...</p>
    </div>
  </div>
);

type MainShellProps = {
  children: ReactNode;
  onResetRole: () => void;
  currentRole: UserType;
};

function MainShell({ children, onResetRole, currentRole }: MainShellProps) {
  const { signOut } = useAuth();
  const roleLabels: Record<UserType, string> = {
    customer: 'Client',
    vendor: 'Vendeur',
    relay_host: 'Hôte Relais',
    driver: 'Livreur',
    admin: 'Admin',
  };

  const isPro = currentRole !== 'customer';

  const handleGoHome = () => {
    if (window.confirm('Voulez-vous vraiment retourner à l\'accueil?')) {
      onResetRole();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-xl transition-all font-semibold"
              title="Retour à l'accueil"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Accueil</span>
            </button>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-elegant">
                D
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-foreground text-base tracking-tight uppercase">DELIKREOL</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {isPro ? 'Espace Professionnel' : 'Espace Client'} · {roleLabels[currentRole]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-elegant transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

import MarketingHome from './pages/MarketingHome';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showBecomePartner, setShowBecomePartner] = useState(false);
  const [showLegalPage, setShowLegalPage] = useState<'legal' | 'privacy' | 'terms' | null>(null);
  const [mode, setMode] = useState<'home' | 'customer' | 'pro' | 'marketing' | null>(null);
  const [draftProducts, setDraftProducts] = useState<any[]>([]);

  if (loading) {
    return <LoadingFallback />;
  }

  // Show Marketing Home if not logged in and not specifically trying to enter an app
  if (!user && !mode && !showBecomePartner && !showLegalPage && !showGuide) {
    return (
      <div className="animate-fadeIn">
        <MarketingHome 
          onStart={() => setMode('home')} 
          onBecomePartner={() => setShowBecomePartner(true)}
        />
        <div className="fixed top-6 right-6 z-50 flex gap-4">
          <button 
            onClick={() => setMode('home')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-black uppercase tracking-widest text-[10px] shadow-elegant hover:scale-105 transition-all border border-white/20 backdrop-blur-md"
          >
            Lancer l'App
          </button>
        </div>
      </div>
    );
  }

  const effectiveRole: UserType | null =
    (profile?.user_type as UserType | undefined) ?? selectedRole;

  const resetRole = () => {
    setSelectedRole(null);
    setShowRoleInfo(false);
    setShowAuthModal(false);
    setShowBecomePartner(false);
    setShowLegalPage(null);
    setMode('home');
    window.scrollTo(0, 0);
  };

  if (user && effectiveRole === 'customer') {
    return (
      <MainShell currentRole="customer" onResetRole={resetRole}>
        <Suspense fallback={<LoadingFallback />}>
          <CustomerApp initialDraftProducts={draftProducts} />
        </Suspense>
      </MainShell>
    );
  }
  if (user && effectiveRole === 'vendor') {
    return (
      <MainShell currentRole="vendor" onResetRole={resetRole}>
        <Suspense fallback={<LoadingFallback />}>
          <VendorApp />
        </Suspense>
      </MainShell>
    );
  }
  if (user && effectiveRole === 'relay_host') {
    return (
      <MainShell currentRole="relay_host" onResetRole={resetRole}>
        <Suspense fallback={<LoadingFallback />}>
          <RelayHostApp />
        </Suspense>
      </MainShell>
    );
  }
  if (user && effectiveRole === 'driver') {
    return (
      <MainShell currentRole="driver" onResetRole={resetRole}>
        <Suspense fallback={<LoadingFallback />}>
          <DriverApp />
        </Suspense>
      </MainShell>
    );
  }
  if (user && effectiveRole === 'admin') {
    return (
      <MainShell currentRole="admin" onResetRole={resetRole}>
        <Suspense fallback={<LoadingFallback />}>
          <AdminApp />
        </Suspense>
      </MainShell>
    );
  }

  // Supabase check removed since we use Blink DB as primary/fallback

  if (showGuide) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <button
          onClick={() => setShowGuide(false)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </button>
        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks />
        </Suspense>
      </div>
    );
  }

  if (showBecomePartner) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <BecomePartner onBack={() => setShowBecomePartner(false)} />
      </Suspense>
    );
  }

  if (showLegalPage === 'legal') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <button
          onClick={() => setShowLegalPage(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <Suspense fallback={<LoadingFallback />}>
          <LegalMentionsPage />
        </Suspense>
      </div>
    );
  }

  if (showLegalPage === 'privacy') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <button
          onClick={() => setShowLegalPage(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicyPage />
        </Suspense>
      </div>
    );
  }

  if (showLegalPage === 'terms') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <button
          onClick={() => setShowLegalPage(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <Suspense fallback={<LoadingFallback />}>
          <TermsOfUsePage />
        </Suspense>
      </div>
    );
  }

  if (!mode || mode === 'home') {
    return (
      <>
        <ClientHomePage
          onSelectMode={(selectedMode, products) => {
            if (selectedMode === 'customer') {
              setMode('customer');
              setSelectedRole('customer');
              if (products && products.length > 0) {
                setDraftProducts(products);
              }
              setShowAuthModal(true);
            } else {
              setMode('pro');
            }
          }}
          onShowGuide={() => setShowGuide(true)}
          onShowLegal={(page) => setShowLegalPage(page)}
        />
        <div className="fixed top-20 right-6 z-40">
          <button
            onClick={() => setShowBecomePartner(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 font-medium flex items-center gap-2 text-sm"
          >
            <span>🤝</span>
            <span>Devenir Partenaire</span>
          </button>
        </div>
      </>
    );
  }

  if (mode === 'pro') {
    return (
      <>
        <RoleSelector
          onSelectRole={(role) => {
            setSelectedRole(role);
            if (role === 'customer') {
              setMode('customer');
              setShowAuthModal(true);
            } else {
              setShowRoleInfo(true);
            }
          }}
        />

        {selectedRole && selectedRole !== 'customer' && (
          <RoleInfoModal
            isOpen={showRoleInfo}
            roleType={selectedRole}
            onClose={() => setShowRoleInfo(false)}
            onContinue={() => {
              setShowRoleInfo(false);
              setShowAuthModal(true);
            }}
          />
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
