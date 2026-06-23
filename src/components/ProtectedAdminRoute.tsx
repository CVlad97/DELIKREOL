import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OWNER_EMAIL = 'vladimir.claveau@gmail.com';

/**
 * Bloque /admin/* si :
 * - pas connecté → redirige /connexion avec retour vers la page demandée
 * - connecté mais pas admin → affiche un accès réservé clair
 */
export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/connexion?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userEmail = (user.email || '').trim().toLowerCase();
  const isAdmin = profile?.user_type === 'admin' || userEmail === OWNER_EMAIL;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé</h1>
        <p className="text-gray-500 mb-6">Cette section est réservée aux administrateurs DeliKreol.</p>
        <a href="/DELIKREOL/pro" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
          Retour à l’espace pro
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
