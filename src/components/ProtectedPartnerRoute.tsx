import { Link, Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './layout/Layout';

const partnerRoles = new Set(['vendor', 'driver', 'relay_host', 'admin']);

export function ProtectedPartnerRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/connexion?next=${next}`} replace />;
  }

  if (!partnerRoles.has(profile?.user_type || '')) {
    return (
      <Layout>
        <section className="min-h-[65vh] bg-[#fff8ef] px-4 py-10 text-[#24140d]">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Compte connecté</p>
                <h1 className="mt-2 text-2xl font-black">Accès partenaire à activer</h1>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Votre compte existe, mais il n’est pas encore rattaché à un rôle traiteur, livreur ou point relais.
                  L’admin doit passer votre profil en <strong>vendor</strong>, <strong>driver</strong> ou <strong>relay_host</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck className="h-5 w-5" />
                À faire côté admin
              </div>
              <p className="mt-2">
                Ouvrir Admin → Paramètres/Profils ou Supabase → <code>profiles.user_type</code>, puis affecter le bon rôle au compte connecté.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/partenaire" className="rounded-2xl bg-primary px-5 py-3 text-center text-sm font-black text-white">
                Envoyer une correction fiche
              </Link>
              <Link to="/pro" className="rounded-2xl border border-orange-200 px-5 py-3 text-center text-sm font-black text-[#7c2d12]">
                Retour espace pro
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
}
