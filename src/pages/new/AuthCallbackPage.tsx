import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { consumeAuthNext, consumePasswordSetup } from '../../utils/authRedirect';

export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [callbackReady, setCallbackReady] = useState(false);
  const [callbackError, setCallbackError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function completeAuthCallback() {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error_description') || params.get('error');
      const code = params.get('code');

      if (oauthError) {
        if (!cancelled) {
          setCallbackError(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
          setCallbackReady(true);
        }
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            setCallbackError(error.message || 'La validation de la connexion Google a échoué.');
            setCallbackReady(true);
          }
          return;
        }
      }

      if (!cancelled) setCallbackReady(true);
    }

    void completeAuthCallback();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!callbackReady || loading) return;

    if (user) {
      const next = consumeAuthNext() || '/espace-partenaire';
      const callbackIntent = new URLSearchParams(window.location.search).get('intent');
      if (callbackIntent === 'set-password' || consumePasswordSetup()) {
        navigate(`/connexion?mode=set-password&next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      navigate(next, { replace: true });
      return;
    }

    if (!callbackError) navigate('/connexion', { replace: true });
  }, [callbackError, callbackReady, loading, navigate, user]);

  return (
    <Layout>
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="max-w-sm rounded-[2rem] border border-primary/20 bg-white p-6 text-center shadow-xl">
          {callbackError ? (
            <>
              <h1 className="text-2xl font-black text-foreground">Connexion Google impossible</h1>
              <p className="mt-3 text-sm leading-6 text-red-700">{callbackError}</p>
              <Link to="/connexion" className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 font-black text-white">
                Revenir à la connexion
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <h1 className="text-2xl font-black text-foreground">Connexion en cours</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Validation sécurisée de ton accès DeliKreol.</p>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
