import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ShieldCheck, Send } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { supabase, isDemoMode } from '../../lib/supabase';

export default function LoginPage() {
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
      <section className="min-h-[70vh] bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">DELIKREOL</p>
            <h1 className="mt-2 text-2xl font-black text-gray-900">Se connecter</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Entre ton email. Tu recevras un lien sécurisé pour ouvrir ton espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-gray-800" htmlFor="login-email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="vladimir.claveau@gmail.com"
                className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {status === 'loading' ? 'Envoi...' : 'Recevoir mon lien'}
            </button>
          </form>

          {message && (
            <div className={`mt-5 rounded-2xl p-4 text-sm ${status === 'error' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {message}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-xs leading-5 text-gray-600">
            Pour l’admin, ton email doit exister dans Supabase Auth et ton profil doit avoir le rôle admin.
          </div>

          <div className="mt-5 flex justify-center gap-4 text-sm font-bold">
            <Link to="/pro" className="text-orange-600 hover:underline">Espace pro</Link>
            <button type="button" onClick={() => navigate('/')} className="text-gray-600 hover:underline">Accueil</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
