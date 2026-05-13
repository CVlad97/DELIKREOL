import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminPartners } from './pages/admin/AdminPartners';
import { CustomerApp } from './pages/CustomerApp';
import { InvestorOpsPage } from './pages/InvestorOpsPage';
import { PartnerDashboardPage } from './pages/PartnerDashboardPage';
import { PublicHomePage } from './pages/PublicHomePage';

function App() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const pathname = window.location.pathname;
  const legacyPath = window.location.search.startsWith('?/')
    ? `/${window.location.search.slice(2).split('&')[0].split('#')[0]}`
    : '';
  const effectivePathname = legacyPath || pathname;

  const content = view === 'customer' || effectivePathname.endsWith('/customer')
    ? <CustomerApp />
    : view === 'partner-documents' || effectivePathname.endsWith('/partner-documents')
      ? <PartnerDashboardPage />
      : view === 'admin-documents' || effectivePathname.endsWith('/admin-documents')
        ? <AdminPartners />
        : view === 'investor-ops' || effectivePathname.endsWith('/investor-ops')
          ? <InvestorOpsPage />
          : <PublicHomePage />;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>{content}</ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
