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
const HomePage = lazy(() => import('./pages/new/HomePage').then(m => ({ default: m.default ?? m.HomePage })));
const CataloguePage = lazy(() => import('./pages/new/CataloguePage').then(m => ({ default: m.default ?? m.CataloguePage })));
const ProductDetailPage = lazy(() => import('./pages/new/ProductDetailPage').then(m => ({ default: m.default ?? m.ProductDetailPage })));
const TraiteursListPage = lazy(() => import('./pages/new/TraiteursListPage').then(m => ({ default: m.default ?? m.TraiteursListPage })));
const TraiteurDetailPage = lazy(() => import('./pages/new/TraiteurDetailPage').then(m => ({ default: m.default ?? m.TraiteurDetailPage })));
const CartPage = lazy(() => import('./pages/new/CartPage').then(m => ({ default: m.default ?? m.CartPage })));
const DevisPage = lazy(() => import('./pages/new/DevisPage').then(m => ({ default: m.default ?? m.DevisPage })));
const DevenirPartenairePage = lazy(() => import('./pages/new/DevenirPartenairePage').then(m => ({ default: m.default ?? m.DevenirPartenairePage })));
const DevenirLivreurPage = lazy(() => import('./pages/new/DevenirLivreurPage').then(m => ({ default: m.default ?? m.DevenirLivreurPage })));
const PointsRelaisPage = lazy(() => import('./pages/new/PointsRelaisPage').then(m => ({ default: m.default ?? m.PointsRelaisPage })));
const AidePage = lazy(() => import('./pages/new/AidePage').then(m => ({ default: m.default ?? m.AidePage })));
const LivraisonPage = lazy(() => import('./pages/new/LivraisonPage').then(m => ({ default: m.default ?? m.LivraisonPage })));
const NotFoundPage = lazy(() => import('./pages/new/NotFoundPage').then(m => ({ default: m.default ?? m.NotFoundPage })));

// Admin pages — fully lazy loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.default ?? m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.default ?? m.AdminDashboard })));
const AdminCommandes = lazy(() => import('./pages/admin/AdminCommandes').then(m => ({ default: m.default ?? m.AdminCommandes })));
const AdminCatalog = lazy(() => import('./pages/admin/AdminCatalog').then(m => ({ default: m.default ?? m.AdminCatalog })));
const AdminPartners = lazy(() => import('./pages/admin/AdminPartners').then(m => ({ default: m.default ?? m.AdminPartners })));
const AdminLivreurs = lazy(() => import('./pages/admin/AdminLivreurs').then(m => ({ default: m.default ?? m.AdminLivreurs })));
const AdminRelais = lazy(() => import('./pages/admin/AdminRelais').then(m => ({ default: m.default ?? m.AdminRelais })));
const AdminDevis = lazy(() => import('./pages/admin/AdminDevis').then(m => ({ default: m.default ?? m.AdminDevis })));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads').then(m => ({ default: m.default ?? m.AdminLeads })));
const AdminMemoire = lazy(() => import('./pages/admin/AdminMemoire').then(m => ({ default: m.default ?? m.AdminMemoire })));
const AdminParametres = lazy(() => import('./pages/admin/AdminParametres').then(m => ({ default: m.default ?? m.AdminParametres })));
const AdminOrchestrateur = lazy(() => import('./pages/admin/AdminOrchestrateur').then(m => ({ default: m.default ?? m.AdminOrchestrateur })));
const AdminOffres = lazy(() => import('./pages/admin/AdminOffres').then(m => ({ default: m.default ?? m.AdminOffres })));

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
