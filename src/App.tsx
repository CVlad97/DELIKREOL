import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminPartners } from './pages/admin/AdminPartners';
import { PartnerDashboardPage } from './pages/PartnerDashboardPage';
import { PublicHomePage } from './pages/PublicHomePage';

function App() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const pathname = window.location.pathname;

  const content = view === 'partner-documents' || pathname.endsWith('/partner-documents')
    ? <PartnerDashboardPage />
    : view === 'admin-documents' || pathname.endsWith('/admin-documents')
      ? <AdminPartners />
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
