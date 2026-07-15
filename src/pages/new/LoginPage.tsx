import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ShieldCheck, Send } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { supabase, isDemoMode } from '../../lib/supabase';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';

export default function LoginPage() {
  useEffect(() => { trackPublicView(); setPageMeta('Connexion — DeliKreol | Espace partenaire', 'Connectez-vous à votre espace DeliKreol. Accès traiteurs, livreurs et administration.'); }, []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || params.get('redirect') || '/admin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (isDemoMode) {
      setStatus('error');
      setMessage('Connexion indisponible : Supabase n’est pas configuré sur ce déploiement.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL || '/'}${next.replace(/^\//, '')}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Impossible d’envoyer le lien. Vérifie que ton compte existe.');
      return;
    }

    setStatus('sent');
    setMessage('Lien envoyé. Ouvre ta boîte mail puis clique sur le lien pour accéder à ton espace.');
  }

  return (
    <Layout>
      <section className="min-h-[70vh] bg-gradient-to-br from-primary/[0.08] via-secondary/8 to-success/10 px-4 py-10">
        <div className="mx-auto max-w-md rounded-[2rem] border border-primary/20 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.15] text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">DELIKREOL</p>
            <h1 className="mt-2 text-2xl font-black text-foreground">Se connecter</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Entre ton email. Tu recevras un lien sécurisé pour ouvrir ton espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-foreground" htmlFor="login-email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="vladimir.claveau@gmail.com"
                className="w-full rounded-2xl border border-input py-3 pl-11 pr-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/30"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {status === 'loading' ? 'Envoi...' : 'Recevoir mon lien'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-input" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-muted-foreground">ou</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isDemoMode) { setStatus('error'); setMessage('Connexion Google indisponible sans Supabase.'); return; }
              supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL || '/'}${next.replace(/^\//, '')}` } });
            }}
            disabled={status === 'loading'}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-5 py-3 font-bold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continuer avec Google
          </button>

          {message && (
            <div className={`mt-5 rounded-2xl p-4 text-sm ${status === 'error' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-success/30 bg-success/10 text-success'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-muted p-4 text-xs leading-5 text-muted-foreground">
            Pour l’admin, ton email doit exister dans Supabase Auth et ton profil doit avoir le rôle admin.
          </div>

          <div className="mt-5 flex justify-center gap-4 text-sm font-bold">
            <Link to="/pro" className="text-primary hover:underline">Espace pro</Link>
            <button type="button" onClick={() => navigate('/')} className="text-muted-foreground hover:underline">Accueil</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
