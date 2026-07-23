import { useEffect, useState } from 'react';
import { Settings, Save, AlertTriangle, ShieldCheck, RefreshCcw } from 'lucide-react';
import { supabase, type UserType } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

type ProfileAccess = {
  id: string;
  full_name: string | null;
  email: string | null;
  contact_email: string | null;
  phone: string | null;
  user_type: UserType;
  created_at: string;
};

const userTypeLabels: Record<UserType, string> = {
  customer: 'Client',
  vendor: 'Traiteur',
  driver: 'Livreur',
  relay_host: 'Point relais',
  admin: 'Admin',
};

const accessRoles: UserType[] = ['customer', 'vendor', 'driver', 'relay_host', 'admin'];

export function AdminParametres() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    whatsappNumber: '596696653589',
    contactEmail: 'contact@delikreol.com',
    minDeliveryAmount: '40',
    deliveryFee: '5',
    platformName: 'DeliKreol',
    paymentActive: false,
  });
  const [profiles, setProfiles] = useState<ProfileAccess[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Paramètres — Admin DeliKreol';
    const saved = localStorage.getItem('delikreol_settings');
    if (saved) {
      try { setSettings(s => ({ ...s, ...JSON.parse(saved) })); } catch { /* empty */ }
    }
    loadProfiles();
  }, []);

  const handleSave = () => {
    localStorage.setItem('delikreol_settings', JSON.stringify(settings));
    alert('Paramètres sauvegardés.');
  };

  const loadProfiles = async () => {
    setProfilesLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, contact_email, phone, user_type, created_at')
        .order('created_at', { ascending: false })
        .limit(80);

      if (error) throw error;
      setProfiles((data || []) as ProfileAccess[]);
    } catch (error) {
      console.error('Error loading profiles:', error);
      showToast('Impossible de charger les comptes', 'error');
    } finally {
      setProfilesLoading(false);
    }
  };

  const updateProfileRole = async (profileId: string, userType: UserType) => {
    setUpdatingProfileId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles((current) => current.map((profile) => (
        profile.id === profileId ? { ...profile, user_type: userType } : profile
      )));
      showToast(`Accès ${userTypeLabels[userType]} activé`, 'success');
    } catch (error) {
      console.error('Error updating profile role:', error);
      showToast('Impossible de modifier le rôle du compte', 'error');
    } finally {
      setUpdatingProfileId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        Paramètres
      </h1>

      <div className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">WhatsApp principal</label>
          <input value={settings.whatsappNumber} onChange={e => setSettings(s => ({...s, whatsappNumber: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email contact</label>
          <input value={settings.contactEmail} onChange={e => setSettings(s => ({...s, contactEmail: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Montant minimum livraison éloignée (€)</label>
          <input value={settings.minDeliveryAmount} onChange={e => setSettings(s => ({...s, minDeliveryAmount: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Frais de livraison par défaut (€)</label>
          <input value={settings.deliveryFee} onChange={e => setSettings(s => ({...s, deliveryFee: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={settings.paymentActive} onChange={e => setSettings(s => ({...s, paymentActive: e.target.checked}))} id="payment" className="rounded" />
          <label htmlFor="payment" className="text-sm">Paiement en ligne actif</label>
        </div>
        {settings.paymentActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">Le paiement en ligne est prévu en phase 2. Ne pas activer sans validation complète.</p>
          </div>
        )}
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
          <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>

      <section className="mt-10 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Accès partenaires et livreurs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quand un traiteur ou livreur se connecte, il apparaît ici en client. Passez son rôle en traiteur, livreur ou point relais pour ouvrir son portail.
            </p>
          </div>
          <button
            type="button"
            onClick={loadProfiles}
            disabled={profilesLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${profilesLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-orange-100">
          <div className="grid grid-cols-[1.4fr_.9fr_.8fr] bg-[#fff8ef] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-stone-600">
            <span>Compte</span>
            <span>Rôle actuel</span>
            <span>Activation</span>
          </div>
          {profilesLoading ? (
            <div className="p-5 text-sm text-muted-foreground">Chargement des comptes...</div>
          ) : profiles.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">Aucun compte trouvé.</div>
          ) : (
            <div className="divide-y divide-orange-100">
              {profiles.map((profile) => {
                const email = profile.email || profile.contact_email || 'Email non renseigné';
                return (
                  <div key={profile.id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.4fr_.9fr_.8fr] md:items-center">
                    <div>
                      <p className="font-black text-foreground">{profile.full_name || email}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                      {profile.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-800">
                      {userTypeLabels[profile.user_type] || profile.user_type}
                    </span>
                    <select
                      value={profile.user_type}
                      disabled={updatingProfileId === profile.id}
                      onChange={(event) => updateProfileRole(profile.id, event.target.value as UserType)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold"
                    >
                      {accessRoles.map((role) => (
                        <option key={role} value={role}>{userTypeLabels[role]}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminParametres;
