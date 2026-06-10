import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';

// Existing pages (eager)
import { ProSpacePage } from './pages/ProSpacePage';
import { OrderStatusPage } from './pages/OrderStatusPage';

// New public pages — lazy loaded
const HomePage = lazy(() => import('./pages/new/HomePage'));
const CataloguePage = lazy(() => import('./pages/new/CataloguePage'));
const ProductDetailPage = lazy(() => import('./pages/new/ProductDetailPage'));
const TraiteursListPage = lazy(() => import('./pages/new/TraiteursListPage'));
const TraiteurDetailPage = lazy(() => import('./pages/new/TraiteurDetailPage'));
const CartPage = lazy(() => import('./pages/new/CartPage'));
const DevisPage = lazy(() => import('./pages/new/DevisPage'));
const DevenirPartenairePage = lazy(() => import('./pages/new/DevenirPartenairePage'));
const DevenirLivreurPage = lazy(() => import('./pages/new/DevenirLivreurPage'));
const PointsRelaisPage = lazy(() => import('./pages/new/PointsRelaisPage'));
const AidePage = lazy(() => import('./pages/new/AidePage'));
const LivraisonPage = lazy(() => import('./pages/new/LivraisonPage'));
const NotFoundPage = lazy(() => import('./pages/new/NotFoundPage'));

// Admin pages — fully lazy loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCommandes = lazy(() => import('./pages/admin/AdminCommandes'));
const AdminCatalog = lazy(() => import('./pages/admin/AdminCatalog'));
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners'));
const AdminLivreurs = lazy(() => import('./pages/admin/AdminLivreurs'));
const AdminRelais = lazy(() => import('./pages/admin/AdminRelais'));
const AdminDevis = lazy(() => import('./pages/admin/AdminDevis'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminMemoire = lazy(() => import('./pages/admin/AdminMemoire'));
const AdminParametres = lazy(() => import('./pages/admin/AdminParametres'));
const AdminOrchestrateur = lazy(() => import('./pages/admin/AdminOrchestrateur'));
const AdminOffres = lazy(() => import('./pages/admin/AdminOffres'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));

const basePath = import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || '/';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    </div>
  );
}

function LayoutWrapper() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function AdminWrapper() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLayout />
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={basePath}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Routes>
                {/* Public routes */}
                <Route element={<LayoutWrapper />}>
                  <Route index element={<HomePage />} />
                  <Route path="catalogue" element={<CataloguePage />} />
                  <Route path="produit/:slug" element={<ProductDetailPage />} />
                  <Route path="traiteurs" element={<TraiteursListPage />} />
                  <Route path="traiteur/:slug" element={<TraiteurDetailPage />} />
                  <Route path="panier" element={<CartPage />} />
                  <Route path="devis" element={<DevisPage />} />
                  <Route path="devenir-partenaire" element={<DevenirPartenairePage />} />
                  <Route path="devenir-livreur" element={<DevenirLivreurPage />} />
                  <Route path="points-relais" element={<PointsRelaisPage />} />
                  <Route path="aide" element={<AidePage />} />
                  <Route path="livraison" element={<LivraisonPage />} />
                  <Route path="pro" element={<ProSpacePage />} />
                  <Route path="statut-commande" element={<OrderStatusPage />} />
                  {/* Pages légales */}
                  <Route path="cgv" element={<TermsOfService />} />
                  <Route path="cgu" element={<TermsOfService />} />
                  <Route path="confidentialite" element={<PrivacyPolicy />} />
                  <Route path="mentions-legales" element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin routes */}
                <Route path="admin" element={<AdminWrapper />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="commandes" element={<AdminCommandes />} />
                  <Route path="catalogue" element={<AdminCatalog />} />
                  <Route path="partenaires" element={<AdminPartners />} />
                  <Route path="livreurs" element={<AdminLivreurs />} />
                  <Route path="points-relais" element={<AdminRelais />} />
                  <Route path="devis" element={<AdminDevis />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="memoire" element={<AdminMemoire />} />
                  <Route path="parametres" element={<AdminParametres />} />
                  <Route path="orchestrateur" element={<AdminOrchestrateur />} />
                  <Route path="offres" element={<AdminOffres />} />
                </Route>
              </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
