import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { User, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    document.title = 'Mon compte — DeliKreol';
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-3">Connectez-vous</h1>
          <p className="text-muted-foreground mb-6">Vous devez être connecté pour accéder à votre espace client.</p>
          <Link to="/connexion" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl">
            Se connecter
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BackBar label="Retour à l'accueil" backTo="/" />

        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Bonjour {profile?.full_name || 'Vous'}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Infos personnelles */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Mes informations
            </h3>
            <div className="space-y-3">
              <div><span className="text-xs text-muted-foreground">Téléphone</span><br />{profile?.phone || '—'}</div>
              <div><span className="text-xs text-muted-foreground">Commune / Zone</span><br />{(profile as any)?.commune || '—'}</div>
            </div>
            <Link to="/contact" className="mt-6 inline-block text-sm text-primary hover:underline">Mettre à jour mes infos →</Link>
          </div>

          {/* Commandes */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Mes dernières commandes
            </h3>
            <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            <Link to="/catalogue" className="mt-3 inline-block text-sm text-orange-600 font-semibold">Commander maintenant →</Link>
          </div>

          {/* Support rapide */}
          <div className="rounded-2xl border bg-card p-6 md:col-span-2">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Besoin d’aide ?
            </h3>
            <a
              href={`https://wa.me/596696653589?text=${encodeURIComponent('Bonjour, je suis sur l’espace client et j’ai une question sur ma commande.')}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl"
            >
              <MessageCircle className="w-4 h-4" /> Contacter le support WhatsApp
            </a>
          </div>
        </div>

        <button onClick={signOut} className="mt-8 text-xs text-muted-foreground hover:text-destructive transition-colors">
          Se déconnecter
        </button>
      </div>
    </Layout>
  );
}