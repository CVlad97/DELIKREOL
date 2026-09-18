import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, LockKeyhole, Mail, ShieldCheck, Send, Truck, Users } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isDemoMode } from '../../lib/supabase';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import {
  getAuthCallbackUrl,
  rememberAuthNext,
  rememberPasswordSetup,
  sanitizeAuthNext,
} from '../../utils/authRedirect';

type LoginMode = 'magic' | 'password' | 'reset' | 'set-password';
type LoginStatus = 'idle' | 'loading' | 'sent' | 'error';

const passwordModes: LoginMode[] = ['magic', 'password', 'reset', 'set-password'];

export default function LoginPage() {
  useEffect(() => {
    trackPublicView();
    setPageMeta(
      'Connexion — DeliKreol | Espace partenaire',
      'Connectez-vous à votre espace DeliKreol. Accès traiteurs, livreurs et administration.',
    );
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [message, setMessage] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, signIn, refreshProfile } = useAuth();
  const next = sanitizeAuthNext(params.get('next') || params.get('redirect'));
  const mode = useMemo<LoginMode>(() => {
    const requestedMode = params.get('mode') as LoginMode | null;
    return requestedMode && passwordModes.includes(requestedMode) ? requestedMode : 'password';
  }, [params]);
  const isSettingPassword = mode === 'set-password';

  useEffect(() => {
    if (!loading && user && !isSettingPassword) {
      navigate(next, { replace: true });
    }
  }, [isSettingPassword, loading, navigate, next, user]);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (isDemoMode) {
      setStatus('error');
      setMessage('Connexion indisponible : Supabase n’est pas configuré sur ce déploiement.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    rememberAuthNext(next);

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Impossible d’envoyer le lien. Vérifie l’email ou réessaie dans quelques minutes.');
      return;
    }

    setStatus('sent');
    setMessage('Lien envoyé. Ouvre ta boîte mail puis clique sur le lien. Si tu vois un code à 6 chiffres, saisis-le ici.');
  }

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const { error } = await signIn(cleanEmail, password);

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Connexion refusée. Vérifie ton email et ton mot de passe.');
      return;
    }

    navigate(next, { replace: true });
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (isDemoMode) {
      setStatus('error');
      setMessage('Réinitialisation indisponible : Supabase n’est pas configuré sur ce déploiement.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    rememberAuthNext(next);
    rememberPasswordSetup();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${getAuthCallbackUrl()}?intent=set-password`,
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Impossible d’envoyer l’email de configuration du mot de passe.');
      return;
    }

    setStatus('sent');
    setMessage('Email envoyé. Clique sur le lien reçu pour définir ton mot de passe.');
  }

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!user) {
      setStatus('error');
      setMessage('Session expirée. Relance le lien reçu par email pour définir ton mot de passe.');
      return;
    }

    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('Choisis un mot de passe de 8 caractères minimum.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Impossible de définir le mot de passe.');
      return;
    }

    await refreshProfile();
    navigate(next, { replace: true });
  }

  async function handleVerifyOtp() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.replace(/\D/g, '');

    if (!cleanEmail || cleanToken.length !== 6) {
      setStatus('error');
      setMessage('Entre ton email et le code à 6 chiffres reçu par mail.');
      return;
    }

    setStatus('loading');
    setMessage('');
    rememberAuthNext(next);

    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Code invalide ou expiré. Renvoie un lien puis réessaie.');
      return;
    }

    navigate(next, { replace: true });
  }

  const submitHandler =
    mode === 'password'
      ? handlePasswordLogin
      : mode === 'reset'
        ? handlePasswordReset
        : isSettingPassword
          ? handleSetPassword
          : handleMagicLink;

  return (
    <Layout>
      <section className="min-h-[70vh] bg-gradient-to-br from-primary/[0.08] via-secondary/8 to-success/10 px-4 py-10">
        <div className="mx-auto max-w-md rounded-[2rem] border border-primary/20 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.15] text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">DELIKREOL</p>
            <h1 className="mt-2 text-2xl font-black text-foreground">
              {isSettingPassword ? 'Définir mon mot de passe' : 'Se connecter'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isSettingPassword
                ? 'Choisis un mot de passe pour ouvrir ton espace DeliKreol.'
                : 'Entre ton email et ton mot de passe.'}
            </p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              to="/connexion?next=/admin"
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                next.startsWith('/admin') ? 'border-primary bg-primary text-white' : 'border-input bg-white text-foreground hover:bg-muted'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              Connexion admin
            </Link>
            <Link
              to="/connexion?next=/catalogue-partenaire"
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                next.startsWith('/espace-partenaire') || next.startsWith('/catalogue-partenaire') || next.startsWith('/partner-documents')
                  ? 'border-primary bg-primary text-white'
                  : 'border-input bg-white text-foreground hover:bg-muted'
              }`}
            >
              <Users className="h-4 w-4" />
              Traiteur
            </Link>
            <Link
              to="/connexion?next=/espace-livreur"
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                next.startsWith('/espace-livreur') ? 'border-primary bg-primary text-white' : 'border-input bg-white text-foreground hover:bg-muted'
              }`}
            >
              <Truck className="h-4 w-4" />
              Livreur
            </Link>
          </div>

          <form onSubmit={submitHandler} className="mt-6 space-y-4">
            {!isSettingPassword && (
              <>
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
                    placeholder="contact@delikreol.com"
                    className="w-full rounded-2xl border border-input py-3 pl-11 pr-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/30"
                  />
                </div>
              </>
            )}

            {mode === 'password' && (
              <>
                <label className="block text-sm font-bold text-foreground" htmlFor="login-password">
                  Mot de passe
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-input py-3 pl-11 pr-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/30"
                  />
                </div>
              </>
            )}

            {isSettingPassword && (
              <>
                <label className="block text-sm font-bold text-foreground" htmlFor="new-password">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-input py-3 pl-11 pr-4 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/30"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {mode === 'password' || isSettingPassword ? <LockKeyhole className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              {status === 'loading'
                ? 'Traitement...'
                : mode === 'password'
                  ? 'Se connecter'
                  : mode === 'reset'
                    ? 'Envoyer le lien de configuration'
                    : isSettingPassword
                      ? 'Enregistrer mon mot de passe'
                      : 'Recevoir mon lien'}
            </button>
          </form>

          {mode === 'password' && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <Link
                to={`/connexion?mode=magic&next=${encodeURIComponent(next)}`}
                className="rounded-xl border border-primary/20 px-3 py-2 font-bold text-primary hover:bg-primary/[0.05]"
              >
                Créer mon accès
              </Link>
              <Link
                to={`/connexion?mode=reset&next=${encodeURIComponent(next)}`}
                className="rounded-xl border border-primary/20 px-3 py-2 font-bold text-primary hover:bg-primary/[0.05]"
              >
                Mot de passe oublié
              </Link>
            </div>
          )}

          {status === 'sent' && mode === 'magic' && (
            <div className="mt-5 rounded-2xl border border-input bg-muted p-4">
              <label className="block text-sm font-bold text-foreground" htmlFor="login-otp">
                Code reçu par email
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  id="login-otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="min-w-0 flex-1 rounded-2xl border border-input px-4 py-3 text-center text-lg font-black tracking-[0.25em] outline-none focus:border-ring focus:ring-4 focus:ring-ring/30"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="rounded-2xl bg-foreground px-4 py-3 text-sm font-black text-white transition hover:bg-foreground/90"
                >
                  Valider
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-5 rounded-2xl p-4 text-sm ${
                status === 'error'
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'border border-success/30 bg-success/10 text-success'
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-muted p-4 text-xs leading-5 text-muted-foreground">
            Utilisez l’adresse email enregistrée sur votre fiche partenaire. Pour une première connexion, choisissez “Créer mon accès”.
          </div>

          <div className="mt-5 flex justify-center gap-4 text-sm font-bold">
            <Link to="/pro" className="text-primary hover:underline">
              Espace pro
            </Link>
            <button type="button" onClick={() => navigate('/')} className="text-muted-foreground hover:underline">
              Accueil
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
