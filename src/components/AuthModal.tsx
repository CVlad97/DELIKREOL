import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

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
              ? 'Démarrer'
              : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
