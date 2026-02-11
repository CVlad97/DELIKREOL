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
import { CGUPage } from './pages/CGUPage';
import { PartnerDashboardPage } from './pages/PartnerDashboardPage';
import { isSupabaseConfigured } from './lib/supabase';
import type { UserType } from './types';

const CustomerApp = lazy(() =>
  import('./pages/CustomerApp').then((module) => ({ default: module.CustomerApp }))
);
const VendorApp = lazy(() =>
  import('./pages/VendorApp').then((module) => ({ default: module.VendorApp }))
);
const RelayHostApp = lazy(() =>
  import('./pages/RelayHostApp').then((module) => ({ default: module.RelayHostApp }))
);
const DriverApp = lazy(() =>
  import('./pages/DriverApp').then((module) => ({ default: module.DriverApp }))
);
const AdminApp = lazy(() =>
  import('./pages/AdminApp').then((module) => ({ default: module.AdminApp }))
);
const HowItWorks = lazy(() =>
  import('./pages/HowItWorks').then((module) => ({ default: module.HowItWorks }))
);
const BecomePartner = lazy(() =>
  import('./pages/BecomePartner').then((module) => ({ default: module.BecomePartner }))
);
const LegalMentionsPage = lazy(() =>
  import('./pages/LegalMentionsPage').then((module) => ({ default: module.LegalMentionsPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((module) => ({ default: module.PrivacyPolicyPage }))
);
const TermsOfUsePage = lazy(() =>
  import('./pages/TermsOfUsePage').then((module) => ({ default: module.TermsOfUsePage }))
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-sm">
            D
          </span>
        </div>
      </div>
      <p className="text-gray-800 font-medium text-lg">Chargement...</p>
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
    if (window.confirm('Voulez-vous vraiment retourner à l\'accueil? Vous serez déconnecté.')) {
      signOut();
      onResetRole();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <header className="w-full border-b-4 border-orange-400 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105 text-white font-bold"
              title="Retour à l'accueil"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Accueil</span>
            </button>
            <div className="h-8 w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-red-700 font-black text-lg shadow-lg">
                D
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-white text-sm md:text-base">DELIKREOL</span>
                <span className="text-xs text-yellow-200 font-bold">
                  {isPro ? 'Espace Pro' : 'Client'} · {roleLabels[currentRole]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-xs md:text-sm px-3 md:px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold hover:scale-105 transform transition-all"
              title="Déconnexion"
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

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showBecomePartner, setShowBecomePartner] = useState(false);
  const [showLegalPage, setShowLegalPage] = useState<'legal' | 'privacy' | 'terms' | 'cgu' | null>(null);
  const [mode, setMode] = useState<'home' | 'customer' | 'pro' | 'dashboard/partner' | null>(null);
  const [draftProducts, setDraftProducts] = useState<any[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm">
                D
              </span>
            </div>
          </div>
          <p className="text-slate-200 font-medium text-lg">Chargement de DELIKREOL</p>
          <p className="text-slate-400 text-sm mt-2">Plateforme logistique intelligente</p>
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

  const handleAuthExit = () => {
    setShowAuthModal(false);
    setShowRoleInfo(false);
    if (mode === 'customer') {
      resetRole();
      return;
    }
    if (mode === 'pro') {
      setSelectedRole(null);
    }
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

  // Dashboard partner route
  if (mode === 'dashboard/partner' && user) {
    return (
      <MainShell currentRole="vendor" onResetRole={() => setMode(null)}>
        <PartnerDashboardPage />
      </MainShell>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Configuration requise</h1>
          <p className="text-sm text-slate-300">
            Supabase n&apos;est pas encore configuré pour ce projet DELIKREOL.
          </p>
          <p className="text-xs text-slate-400">
            Ajoutez les variables d&apos;environnement{' '}
            <code className="font-mono">VITE_SUPABASE_URL</code> et{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> à partir
            de votre projet Supabase (voir le fichier <code>.env.example</code>).
          </p>
        </div>
      </div>
    );
  }

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

  if (showLegalPage === 'cgu') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <button
          onClick={() => setShowLegalPage(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <CGUPage onBack={() => setShowLegalPage(null)} />
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
          onOpenDemo={() => setShowAuthModal(true)}
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
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthExit}
          onBack={handleAuthExit}
        />
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
          onClose={handleAuthExit}
          onBack={handleAuthExit}
        />
      </>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthExit}
        onBack={handleAuthExit}
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
