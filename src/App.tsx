import { ReactNode, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RoleSelector } from './components/RoleSelector';
import { RoleInfoModal } from './components/RoleInfoModal';
import { AuthModal } from './components/AuthModal';
import { CustomerApp } from './pages/CustomerApp';
import { VendorApp } from './pages/VendorApp';
import { RelayHostApp } from './pages/RelayHostApp';
import { DriverApp } from './pages/DriverApp';
import { AdminApp } from './pages/AdminApp';
import { isSupabaseConfigured } from './lib/supabase';
import type { UserType } from './types';

type MainShellProps = {
  children: ReactNode;
  onResetRole: () => void;
  currentRole: UserType;
};

function MainShell({ children, onResetRole, currentRole }: MainShellProps) {
  const roleLabels: Record<UserType, string> = {
    customer: 'Client',
    vendor: 'Vendeur',
    relay_host: 'Hôte Relais',
    driver: 'Livreur',
    admin: 'Admin',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
              D
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">Delikreol</span>
              <span className="text-xs text-slate-400">
                Hub logistique · {roleLabels[currentRole]}
              </span>
            </div>
          </div>
          <button
            onClick={onResetRole}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:border-emerald-400 hover:text-emerald-400 transition-all"
          >
            ⬅ Changer de rôle
          </button>
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
    window.scrollTo(0, 0);
  };

  if (user && effectiveRole === 'customer') {
    return (
      <MainShell currentRole="customer" onResetRole={resetRole}>
        <CustomerApp />
      </MainShell>
    );
  }
  if (user && effectiveRole === 'vendor') {
    return (
      <MainShell currentRole="vendor" onResetRole={resetRole}>
        <VendorApp />
      </MainShell>
    );
  }
  if (user && effectiveRole === 'relay_host') {
    return (
      <MainShell currentRole="relay_host" onResetRole={resetRole}>
        <RelayHostApp />
      </MainShell>
    );
  }
  if (user && effectiveRole === 'driver') {
    return (
      <MainShell currentRole="driver" onResetRole={resetRole}>
        <DriverApp />
      </MainShell>
    );
  }
  if (user && effectiveRole === 'admin') {
    return (
      <MainShell currentRole="admin" onResetRole={resetRole}>
        <AdminApp />
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

  return (
    <>
      <RoleSelector
        onSelectRole={(role) => {
          setSelectedRole(role);
          if (role === 'customer') {
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
