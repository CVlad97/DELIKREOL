import { Link, Navigate, useLocation } from'react-router-dom';
import { AlertCircle, ShieldCheck } from'lucide-react';
import { useState, type ReactNode } from'react';
import { useAuth } from'../contexts/AuthContext';
import { Layout } from'./layout/Layout';
import { supabase } from'../lib/supabase';

const partnerRoles = new Set(['vendor','driver','relay_host','admin']);

export function ProtectedPartnerRoute({ children }: { children: ReactNode }) {
 const { user, profile, loading, refreshProfile } = useAuth();
 const location = useLocation();
 const [activating, setActivating] = useState(false);
 const [activationError, setActivationError] = useState('');

 const activatePartnerAccess = async () => {
 setActivating(true);
 setActivationError('');
 try {
 const { data, error } = await supabase.rpc('claim_partner_access');
 if (error) throw error;
 if (!data?.claimed) {
 setActivationError("Aucune fiche traiteur ne correspond à l’adresse email confirmée de ce compte. Contactez DELIKREOL pour corriger l’email de votre fiche.");
 return;
 }
 await refreshProfile();
 window.location.assign('/catalogue-partenaire');
 } catch (error) {
 console.error('Partner access activation failed:', error);
 setActivationError("L’activation a échoué. Vérifiez que votre adresse email est confirmée, puis réessayez.");
 } finally {
 setActivating(false);
 }
 };

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

 if (!partnerRoles.has(profile?.user_type ||'')) {
 return (
 <Layout>
 <section className="min-h-[65vh] bg-[#fff8ef] px-4 py-10 text-[#24140d]">
 <div className="mx-auto max-w-2xl rounded-[2rem] border border-primary/20 bg-white p-6 shadow-soft sm:p-8">
 <div className="flex items-start gap-4">
 <div className="rounded-2xl bg-primary/[0.15] p-3 text-primary">
 <AlertCircle className="h-7 w-7" />
 </div>
 <div>
 <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Compte connecté</p>
 <h1 className="mt-2 text-2xl font-black">Accès partenaire à activer</h1>
 <p className="mt-3 text-sm leading-6 text-stone-600">
 Votre compte existe, mais il n’est pas encore rattaché à un rôle traiteur, livreur ou point relais.
 Si votre email confirmé correspond à une fiche traiteur, vous pouvez rattacher votre compte automatiquement et en toute sécurité.
 </p>
 </div>
 </div>

 <div className="mt-6 rounded-2xl border border-success/20 bg-success/[0.15] p-4 text-sm leading-6 text-success">
 <div className="flex items-center gap-2 font-black">
 <ShieldCheck className="h-5 w-5" />
 Activation sécurisée
 </div>
 <p className="mt-2">
 Le rattachement vérifie l’adresse email confirmée du compte. Les informations sensibles et la publication finale restent contrôlées par DELIKREOL.
 </p>
 </div>

 <div className="mt-6 grid gap-3 sm:grid-cols-2">
 <button type="button" onClick={activatePartnerAccess} disabled={activating} className="rounded-2xl bg-primary px-5 py-3 text-center text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">
 {activating ? 'Activation…' : 'Activer ma fiche traiteur'}
 </button>
 <Link to="/pro" className="rounded-2xl border border-primary/20 px-5 py-3 text-center text-sm font-black text-[#7c2d12]">
 Retour espace pro
 </Link>
 </div>
 {activationError && <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{activationError}</p>}
 <Link to="/partenaire" className="mt-4 block text-center text-sm font-bold text-primary underline underline-offset-4">
 Demander la correction de ma fiche
 </Link>
 </div>
 </section>
 </Layout>
 );
 }

 return <>{children}</>;
}
