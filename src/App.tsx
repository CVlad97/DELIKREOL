import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { RoleSelector } from './components/RoleSelector';
import { RoleInfoModal } from './components/RoleInfoModal';
import { AuthModal } from './components/AuthModal';
import { CustomerApp } from './pages/CustomerApp';
import { VendorApp } from './pages/VendorApp';
import { RelayHostApp } from './pages/RelayHostApp';
import { DriverApp } from './pages/DriverApp';
import { AdminApp } from './pages/AdminApp';
import type { UserType } from './types';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement de Delikreol...</p>
        </div>
      </div>
    );
  }

  const effectiveRole: UserType | null =
    (profile?.user_type as UserType | undefined) ?? selectedRole;

  if (user && effectiveRole === 'customer') {
    return <CustomerApp />;
  }
  if (user && effectiveRole === 'vendor') {
    return <VendorApp />;
  }
  if (user && effectiveRole === 'relay_host') {
    return <RelayHostApp />;
  }
  if (user && effectiveRole === 'driver') {
    return <DriverApp />;
  }
  if (user && effectiveRole === 'admin') {
    return <AdminApp />;
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
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
