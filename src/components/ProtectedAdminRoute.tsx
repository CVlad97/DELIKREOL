import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Bloque /admin/* si :
 * - pas connecté → redirige /connexion
 * - connecté mais pas admin → redirige /pro
 */
export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé</h1>
        <p className="text-gray-500 mb-6">Cette section est réservée aux administrateurs DeliKreol.</p>
        <a href="/" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return <>{children}</>;
}