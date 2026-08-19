import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { validateMartiniquePhone } from '../../utils/validation';
import { buildOnboardingWhatsAppMessage } from '../../services/logisticsPartnerBilling';

const WHATSAPP_NUMBER = '596696653589';
const RELAY_TYPES = ['commerce_partenaire', 'traiteur_point_relais', 'hub_logistique', 'consigne_refrigeree'];
const STORAGE_OPTIONS = ['chaud', 'froid', 'sec', 'surgelé'];

export function DevenirPointRelaisPage() {
  const [form, setForm] = useState({
    business_name: '',
    manager_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    commune: '',
    address: '',
    opening_hours: '',
    capacity: '',
    relay_type: 'commerce_partenaire',
    siret: '',
    storage: [] as string[],
    pickup_windows: '',
    can_receive_drivers: false,
    can_act_as_vendor_relay: false,
    independent_status_confirmed: false,
    hygiene_confirmed: false,
    terms_confirmed: false,
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k: string, v: string | boolean | string[]) => setForm(f => ({ ...f, [k]: v }));
  const toggleStorage = (value: string) => {
    setForm((prev) => ({
      ...prev,
      storage: prev.storage.includes(value) ? prev.storage.filter((item) => item !== value) : [...prev.storage, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.business_name || !form.phone || !form.commune) { setError('Nom, téléphone et commune requis'); return; }
    if (!validateMartiniquePhone(form.phone)) { setError('Téléphone Martinique invalide (0696/0697)'); return; }
    if (!form.independent_status_confirmed || !form.hygiene_confirmed || !form.terms_confirmed) { setError('Merci de confirmer les engagements obligatoires.'); return; }
    try {
      const { supabase } = await import('../../lib/supabase');
      if (supabase) {
        const { error: dbErr } = await supabase.from('relay_point_applications').insert([{ ...form }]);
        if (dbErr) throw dbErr;
      } else throw new Error('supabase non disponible');
    } catch {
      const existing = JSON.parse(localStorage.getItem('delikreol_relay_applications') || '[]');
      existing.push({ ...form, id: crypto.randomUUID(), status: 'candidat', created_at: new Date().toISOString() });
      localStorage.setItem('delikreol_relay_applications', JSON.stringify(existing));
    }
    setSent(true);
  };

  const whatsappMessage = buildOnboardingWhatsAppMessage({
    partnerKind: 'relay_host',
    name: form.business_name || form.manager_name,
    commune: form.commune,
    phone: form.whatsapp || form.phone,
    availability: `${form.opening_hours} ${form.pickup_windows}`.trim(),
    relayStorage: form.storage,
  });

  const controlClass = 'w-full min-h-11 rounded-xl border border-input bg-white px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  if (sent) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mb-4 text-5xl">📦</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Merci pour votre candidature</h1>
          <p className="mb-6 text-muted-foreground">DELIKREOL vous recontactera sous 48h.</p>
          <p className="mb-8 text-sm text-muted-foreground">Vous avez une question ? Contactez-nous sur WhatsApp.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-success px-6 py-3 font-bold text-success-foreground transition hover:brightness-95">💬 Nous contacter</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-2 text-3xl font-black text-foreground">Devenir point relais</h1>
        <p className="mb-8 text-muted-foreground">Proposez votre commerce ou votre activité de traiteur comme point de retrait DELIKREOL. Activation uniquement après validation manuelle.</p>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <div><label className="mb-1 block text-sm font-semibold">Nom de l'établissement *</label><input value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">Responsable</label><input value={form.manager_name} onChange={e => handleChange('manager_name', e.target.value)} className={controlClass} /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-semibold">Téléphone *</label><input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="0696 XX XX XX" className={controlClass} /></div>
            <div><label className="mb-1 block text-sm font-semibold">WhatsApp</label><input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="0696..." className={controlClass} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-semibold">Email</label><input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">SIRET ou en cours</label><input value={form.siret} onChange={e => handleChange('siret', e.target.value)} className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">Type de relais</label>
            <select value={form.relay_type} onChange={e => handleChange('relay_type', e.target.value)} className={controlClass}>
              {RELAY_TYPES.map(type => <option key={type} value={type}>{type === 'traiteur_point_relais' ? 'Traiteur aussi point relais' : type.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div><label className="mb-1 block text-sm font-semibold">Commune *</label>
            <select value={form.commune} onChange={e => handleChange('commune', e.target.value)} className={controlClass}>
              <option value="">Sélectionner une commune</option>
              {martiniqueCommunes.slice(0, 34).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="mb-1 block text-sm font-semibold">Adresse</label><input value={form.address} onChange={e => handleChange('address', e.target.value)} className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">Horaires d'ouverture</label><input value={form.opening_hours} onChange={e => handleChange('opening_hours', e.target.value)} placeholder="ex : Lun-Sam 8h-19h" className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">Créneaux retrait client</label><input value={form.pickup_windows} onChange={e => handleChange('pickup_windows', e.target.value)} placeholder="ex : 17h30-20h" className={controlClass} /></div>
          <div><label className="mb-1 block text-sm font-semibold">Capacité (colis/jour)</label><input value={form.capacity} onChange={e => handleChange('capacity', e.target.value)} placeholder="ex : 30" className={controlClass} /></div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Stockage possible</label>
            <div className="grid grid-cols-2 gap-2">
              {STORAGE_OPTIONS.map(option => (
                <label key={option} className={`rounded-xl border px-3 py-2 text-sm ${form.storage.includes(option) ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-white'}`}>
                  <input type="checkbox" checked={form.storage.includes(option)} onChange={() => toggleStorage(option)} className="mr-2 accent-primary" />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-sm">
            <label className="flex gap-3"><input type="checkbox" checked={form.can_receive_drivers} onChange={e => handleChange('can_receive_drivers', e.target.checked)} className="mt-1 accent-primary" /><span>Je peux réceptionner des dépôts livreurs.</span></label>
            <label className="flex gap-3"><input type="checkbox" checked={form.can_act_as_vendor_relay} onChange={e => handleChange('can_act_as_vendor_relay', e.target.checked)} className="mt-1 accent-primary" /><span>Je suis traiteur et peux aussi servir de point relais adapté.</span></label>
            <label className="flex gap-3"><input required type="checkbox" checked={form.independent_status_confirmed} onChange={e => handleChange('independent_status_confirmed', e.target.checked)} className="mt-1 accent-primary" /><span>Je confirme candidater comme prestataire indépendant.</span></label>
            <label className="flex gap-3"><input required type="checkbox" checked={form.hygiene_confirmed} onChange={e => handleChange('hygiene_confirmed', e.target.checked)} className="mt-1 accent-primary" /><span>Je pourrai justifier les conditions d’hygiène et de conservation déclarées.</span></label>
            <label className="flex gap-3"><input required type="checkbox" checked={form.terms_confirmed} onChange={e => handleChange('terms_confirmed', e.target.checked)} className="mt-1 accent-primary" /><span>J’accepte une validation manuelle avant activation.</span></label>
          </div>
          {error && <p className="text-sm font-semibold text-destructive" role="alert">{error}</p>}
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Envoyer ma candidature</button>
        </form>
      </div>
    </Layout>
  );
}
