import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Send, MessageCircle, CheckCircle2, MapPin, AlertTriangle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';
const TRANSPORT_MODES = ['Voiture', 'Scooter', 'Vélo', 'Autre'];

type DriverFormData = {
  nom: string;
  telephone: string;
  whatsapp: string;
  email: string;
  commune: string;
  zonesAcceptees: string[];
  moyenTransport: string;
  disponibilite: string;
  horaires: string;
  experienceLivraison: string;
};

const initialFormData: DriverFormData = {
  nom: '',
  telephone: '',
  whatsapp: '',
  email: '',
  commune: '',
  zonesAcceptees: [],
  moyenTransport: '',
  disponibilite: '',
  horaires: '',
  experienceLivraison: '',
};

export default function DevenirLivreurPage() {
  const [form, setForm] = useState<DriverFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedInSupabase, setSavedInSupabase] = useState(false);
  const { showSuccess } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneToggle = (communeName: string) => {
    setForm((prev) => {
      const zones = prev.zonesAcceptees.includes(communeName)
        ? prev.zonesAcceptees.filter((z) => z !== communeName)
        : [...prev.zonesAcceptees, communeName];
      return { ...prev, zonesAcceptees: zones };
    });
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      '🚚 *Candidature livreur — DeliKreol*',
      '',
      `👤 Nom : ${form.nom}`,
      `📞 Tél : ${form.telephone}`,
      form.whatsapp ? `💬 WhatsApp : ${form.whatsapp}` : '',
      form.email ? `📧 Email : ${form.email}` : '',
      `📍 Commune : ${form.commune}`,
      `🗺️ Zones : ${form.zonesAcceptees.join(', ') || 'Non précisé'}`,
      `🚗 Transport : ${form.moyenTransport}`,
      form.disponibilite ? `📅 Disponibilité : ${form.disponibilite}` : '',
      form.horaires ? `🕐 Horaires : ${form.horaires}` : '',
      form.experienceLivraison ? `💼 Expérience : ${form.experienceLivraison}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const saveLocalCopy = () => {
    const existing = JSON.parse(localStorage.getItem('delikreol_driver_applications') || '[]');
    existing.push({
      ...form,
      name: form.nom,
      phone: form.telephone,
      transportMode: form.moyenTransport,
      id: `driver_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'candidat',
    });
    localStorage.setItem('delikreol_driver_applications', JSON.stringify(existing));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      saveLocalCopy();

      if (isSupabaseConfigured && !isDemoMode) {
        const { error: dbError } = await supabase.from('driver_applications').insert({
          name: form.nom.trim(),
          phone: form.telephone.trim(),
          whatsapp: form.whatsapp.trim() || null,
          email: form.email.trim() || null,
          commune: form.commune,
          zones_acceptees: form.zonesAcceptees,
          transport_mode: form.moyenTransport,
          disponibilite: form.disponibilite || null,
          horaires: form.horaires || null,
          experience_livraison: form.experienceLivraison || null,
          status: 'candidat',
        });

        if (dbError) throw dbError;
        setSavedInSupabase(true);
      }

      setSubmitted(true);
      showSuccess('Candidature livreur enregistrée.');
    } catch (err: any) {
      console.warn('[Driver application] Supabase insert failed', err);
      setError('La candidature est gardée sur ce téléphone, mais l’envoi serveur a échoué. Merci d’envoyer aussi par WhatsApp.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank');
  };

  if (submitted) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
          <div className="inline-flex rounded-full bg-green-100 p-4 text-green-600"><CheckCircle2 size={48} /></div>
          <h2 className="text-2xl font-bold text-foreground">Candidature reçue</h2>
          <p className="text-muted-foreground leading-relaxed">
            {savedInSupabase ? 'La candidature est enregistrée dans l’admin DeliKreol.' : 'La candidature est sauvegardée localement. Envoie aussi par WhatsApp pour être sûr.'}
          </p>
          {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={openWhatsApp} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600">
              <MessageCircle size={18} /> Envoyer aussi par WhatsApp
            </button>
            <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90">
              Retour accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Truck size={14} /> Candidature livreur
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Devenir livreur DeliKreol</h1>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">Les livreurs sont validés progressivement selon les zones, disponibilités et documents.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <legend className="px-2 text-sm font-black uppercase tracking-wider text-foreground/60">Coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="nom" required value={form.nom} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Nom complet *" />
              <input name="telephone" required type="tel" value={form.telephone} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Téléphone *" />
              <input name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="WhatsApp" />
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Email" />
            </div>
            <select name="commune" required value={form.commune} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
              <option value="">— Votre commune * —</option>
              {martiniqueCommunes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <legend className="px-2 text-sm font-black uppercase tracking-wider text-foreground/60">Zones acceptées</legend>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4">
              {martiniqueCommunes.map((c) => (
                <label key={c.name} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${form.zonesAcceptees.includes(c.name) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground'}`}>
                  <input type="checkbox" checked={form.zonesAcceptees.includes(c.name)} onChange={() => handleZoneToggle(c.name)} className="h-3.5 w-3.5 accent-primary" />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <legend className="px-2 text-sm font-black uppercase tracking-wider text-foreground/60">Transport et disponibilité</legend>
            <select name="moyenTransport" required value={form.moyenTransport} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
              <option value="">— Moyen de transport * —</option>
              {TRANSPORT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input name="disponibilite" value={form.disponibilite} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Disponibilité : semaine, week-end, soir..." />
            <input name="horaires" value={form.horaires} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Horaires possibles" />
            <textarea name="experienceLivraison" rows={4} value={form.experienceLivraison} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Expérience livraison / remarques" />
          </fieldset>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <Send size={18} /> {submitting ? 'Envoi...' : 'Envoyer la candidature'}
            </button>
            <button type="button" onClick={openWhatsApp} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600">
              <MessageCircle size={18} /> WhatsApp direct
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
