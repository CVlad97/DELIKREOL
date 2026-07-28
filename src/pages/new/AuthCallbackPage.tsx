import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { consumeAuthNext } from '../../utils/authRedirect';

export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate(consumeAuthNext() || '/espace-partenaire', { replace: true });
      return;
    }

    navigate('/connexion', { replace: true });
  }, [loading, navigate, user]);

  return (
    <Layout>
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="max-w-sm rounded-[2rem] border border-primary/20 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <h1 className="text-2xl font-black text-foreground">Connexion en cours</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Validation sécurisée de ton accès DeliKreol.
          </p>
        </div>
      </main>
    </Layout>
  );
}
