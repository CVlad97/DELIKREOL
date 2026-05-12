import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  initialMode?: 'signin' | 'signup';
}

type DemoRole = 'customer' | 'vendor' | 'relay_host' | 'driver' | 'admin';

export function AuthModal({ isOpen, onClose, onBack, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const { signIn, signUp, signInWithGoogleCredential } = useAuth();
  const handleBack = onBack ?? onClose;
  const demoOverride =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('delikreol_demo_override') === 'true';

  useEffect(() => {
    if (!isOpen || !googleClientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        ux_mode: 'popup',
        callback: async (response) => {
          if (!response.credential) {
            setError('Connexion Google interrompue.');
            return;
          }
          setLoading(true);
          const { error } = await signInWithGoogleCredential(response.credential);
          setLoading(false);
          if (error) {
            setError(error.message || 'Connexion Google impossible pour le moment.');
            return;
          }
          onClose();
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: mode === 'signin' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        width: 320,
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [googleClientId, isOpen, mode, onClose, signInWithGoogleCredential]);

  if (!isOpen) return null;

  const handleDemoAccess = (role: DemoRole) => {
    setError('');
    try {
      const roleLabels: Record<DemoRole, string> = {
        customer: 'Client Demo',
        vendor: 'Vendeur Demo',
        relay_host: 'Hote Relais Demo',
        driver: 'Livreur Demo',
        admin: 'Admin Demo',
      };
      const raw = localStorage.getItem('delikreol_demo_profiles');
      const profiles = raw ? JSON.parse(raw) : [];
      const id = `demo_${role}_${Date.now()}`;
      const demoEmail = `${role}@demo.delikreol.local`;
      const newProfile = {
        id,
        full_name: roleLabels[role],
        phone: '0696000000',
        user_type: role,
        avatar_url: null,
        created_at: new Date().toISOString(),
        email: demoEmail,
      };
      profiles.push(newProfile);
      localStorage.setItem('delikreol_demo_profiles', JSON.stringify(profiles));
      localStorage.setItem('delikreol_demo_session', JSON.stringify({ userId: id, email: demoEmail }));
      localStorage.setItem('delikreol_demo_override', 'true');
      window.location.reload();
    } catch (err) {
      console.error('Demo access error:', err);
      setError('Impossible d’activer l’espace de test. Veuillez réessayer.');
    }
  };

  const handleExitDemo = () => {
    try {
      localStorage.removeItem('delikreol_demo_override');
      localStorage.removeItem('delikreol_demo_session');
      window.location.reload();
    } catch (err) {
      console.error('Exit demo error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          const errorMessages: Record<string, string> = {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Veuillez confirmer votre email',
          };
          throw new Error(errorMessages[error.message] || error.message);
        }
        onClose();
      } else {
        if (!fullName.trim() || !phone.trim()) {
          setError('Veuillez remplir tous les champs');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          const errorMessages: Record<string, string> = {
            'User already registered': 'Cet email est déjà utilisé',
            'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
          };
          throw new Error(errorMessages[error.message] || error.message);
        }
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 relative shadow-elegant border border-border animate-fadeIn">
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-muted rounded-full"
        >
          <X size={20} />
        </button>

        <div className="mb-10 text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-elegant mb-4">
            D
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
            {mode === 'signin' ? 'Bon retour !' : 'Bienvenue'}
          </h2>
          <p className="text-muted-foreground font-medium">
            {mode === 'signin'
              ? 'Connectez-vous à votre espace'
              : 'Rejoignez la communauté Delikreol'}
          </p>
        </div>

        <div className="flex p-1 bg-muted rounded-2xl mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              mode === 'signin'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              mode === 'signup'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inscription
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3">
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex justify-center" />
          ) : (
            <p className="text-center text-xs font-semibold text-muted-foreground">
              Connexion Google disponible après configuration de VITE_GOOGLE_CLIENT_ID.
            </p>
          )}
          <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
            Accès Google réservé à votre compte pour le moment.
          </p>
          <p className="mt-1 text-center text-[11px] font-semibold text-muted-foreground">
            Google ne se lance jamais automatiquement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold"
                  placeholder="0696 XX XX XX"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold"
              placeholder="votre@email.mq"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-muted border-none rounded-2xl focus:ring-4 focus:ring-primary/10 font-bold"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-primary/5 text-primary px-6 py-4 rounded-2xl text-sm font-bold border border-primary/10">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:shadow-elegant transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading
              ? 'Chargement...'
              : mode === 'signin'
              ? 'Me connecter'
              : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">Espace de test interne</p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              Accès réservé aux vérifications fonctionnelles avant publication opérationnelle.
            </p>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Scénarios contrôlés
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccess('customer')}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors"
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccess('vendor')}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors"
            >
              Vendeur
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccess('relay_host')}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors"
            >
              Hôte relais
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccess('driver')}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors"
            >
              Livreur
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccess('admin')}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors"
            >
              Admin
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Active un environnement local de vérification, sans modifier les données publiques.
          </p>
          {demoOverride && (
            <button
              type="button"
              onClick={handleExitDemo}
              className="mt-3 text-xs text-gray-500 underline hover:text-gray-700"
            >
              Quitter l’espace de test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
