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
import { UserType } from './types';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

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

  if (!user) {
    return (
      <>
        {!selectedRole || selectedRole === 'customer' ? (
          <CustomerApp />
        ) : (
          <RoleSelector onSelectRole={(role) => {
            setSelectedRole(role);
            if (role !== 'customer' && role !== 'admin') {
              setShowRoleInfo(true);
            } else if (role === 'admin') {
              setShowAuth(true);
            }
          }} />
        )}

        {selectedRole && selectedRole !== 'customer' && (
          <RoleInfoModal
            isOpen={showRoleInfo}
            onClose={() => {
              setShowRoleInfo(false);
              setSelectedRole(null);
            }}
            onContinue={() => {
              setShowRoleInfo(false);
              setShowAuth(true);
            }}
            roleType={selectedRole}
          />
        )}

        {showAuth && (
          <AuthModal
            isOpen={showAuth}
            onClose={() => {
              setShowAuth(false);
              setSelectedRole(null);
            }}
            initialMode="signup"
          />
        )}
      </>
    );
  }

  const userType = profile?.user_type || 'customer';

  switch (userType) {
    case 'customer':
      return <CustomerApp />;
    case 'vendor':
      return <VendorApp />;
    case 'relay_host':
      return <RelayHostApp />;
    case 'driver':
      return <DriverApp />;
    case 'admin':
      return <AdminApp />;
    default:
      return <CustomerApp />;
  }
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
