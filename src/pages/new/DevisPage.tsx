import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Send,
  MessageCircle,
  CalendarDays,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';

const WHATSAPP_NUMBER = '596696653589';

const EVENT_TYPES = [
  'Mariage',
  'Anniversaire',
  'Séminaire',
  'Repas d\'entreprise',
  'Communion',
  'Fête privée',
  'Autre',
];

interface DevisFormData {
  nom: string;
  telephone: string;
  email: string;
  date: string;
  lieu: string;
  commune: string;
  nombrePersonnes: string;
  budget: string;
  typeEvenement: string;
  preferencesAlimentaires: string;
  allergies: string;
  besoinLivraison: boolean;
  message: string;
}

const initialFormData: DevisFormData = {
  nom: '',
  telephone: '',
  email: '',
  date: '',
  lieu: '',
  commune: '',
  nombrePersonnes: '',
  budget: '',
  typeEvenement: '',
  preferencesAlimentaires: '',
  allergies: '',
  besoinLivraison: false,
  message: '',
};

export default function DevisPage() {
  const [form, setForm] = useState<DevisFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `🍽️ *Demande de devis — DeliKreol*`,
      ``,
      `👤 Nom : ${form.nom}`,
      `📞 Tél : ${form.telephone}`,
      form.email ? `📧 Email : ${form.email}` : '',
      `📅 Date : ${form.date}`,
      `📍 Lieu : ${form.lieu}${form.commune ? ` (${form.commune})` : ''}`,
      `👥 Personnes : ${form.nombrePersonnes}`,
      form.budget ? `💰 Budget : ${form.budget}` : '',
      `🎉 Événement : ${form.typeEvenement}`,
      form.preferencesAlimentaires ? `🥗 Préférences : ${form.preferencesAlimentaires}` : '',
      form.allergies ? `⚠️ Allergies : ${form.allergies}` : '',
      `🚚 Livraison : ${form.besoinLivraison ? 'Oui' : 'Non'}`,
      form.message ? `💬 Message : ${form.message}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem('delikreol_catering_requests') || '[]');
    const entry = {
      ...form,
      id: `devis_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'nouveau',
    };
    existing.push(entry);
    localStorage.setItem('delikreol_catering_requests', JSON.stringify(existing));

    setSubmitted(true);
    showSuccess('Votre demande a bien été reçue. Nous revenons vers vous rapidement par WhatsApp.');
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  if (submitted) {
    return (
      <Layout>
        <BackBar label='Retour' backTo='/' />
        <div className="max-w-lg mx-auto text-center px-4 py-16 space-y-6">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Merci pour votre demande !</h2>
          <p className="text-muted-foreground leading-relaxed">
            Votre demande a bien été reçue. Nous revenons vers vous rapidement par WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle size={18} fill="white" />
              Envoyer aussi par WhatsApp
            </button>
            <Link
              to="/catalogue"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <BackBar label='Retour' backTo='/' />
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <UtensilsCrossed size={14} />
            Traiteur &amp; Événements
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Demander un devis traiteur
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Vous organisez un événement en Martinique ? Décrivez votre projet ci-dessous et nous vous
            proposons un devis personnalisé avec nos traiteurs partenaires.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Vos coordonnées
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nom" className="block text-sm font-semibold text-foreground">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Jean Duplan"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="telephone" className="block text-sm font-semibold text-foreground">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  value={form.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="0696 XX XX XX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="jean@exemple.mq"
              />
            </div>
          </fieldset>

          {/* Event details */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Détails de l'événement
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="typeEvenement" className="block text-sm font-semibold text-foreground">
                  Type d'événement <span className="text-red-500">*</span>
                </label>
                <select
                  id="typeEvenement"
                  name="typeEvenement"
                  required
                  value={form.typeEvenement}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir —</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="date" className="block text-sm font-semibold text-foreground">
                  <CalendarDays size={14} className="inline mr-1" />
                  Date prévue <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="lieu" className="block text-sm font-semibold text-foreground">
                  <MapPin size={14} className="inline mr-1" />
                  Lieu
                </label>
                <input
                  id="lieu"
                  name="lieu"
                  type="text"
                  value={form.lieu}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Salle des fêtes, domicile…"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="commune" className="block text-sm font-semibold text-foreground">
                  Commune <span className="text-red-500">*</span>
                </label>
                <select
                  id="commune"
                  name="commune"
                  required
                  value={form.commune}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir une commune —</option>
                  {martiniqueCommunes.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nombrePersonnes" className="block text-sm font-semibold text-foreground">
                  <Users size={14} className="inline mr-1" />
                  Nombre de personnes <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombrePersonnes"
                  name="nombrePersonnes"
                  type="number"
                  min="1"
                  required
                  value={form.nombrePersonnes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="budget" className="block text-sm font-semibold text-foreground">
                  Budget indicatif
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="ex : 500–800€"
                />
              </div>
            </div>
          </fieldset>

          {/* Preferences */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Préférences &amp; allergies
            </legend>

            <div className="space-y-1.5">
              <label htmlFor="preferencesAlimentaires" className="block text-sm font-semibold text-foreground">
                Préférences alimentaires
              </label>
              <textarea
                id="preferencesAlimentaires"
                name="preferencesAlimentaires"
                rows={3}
                value={form.preferencesAlimentaires}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Végétarien, halal, sans porc, créole traditionnel…"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="allergies" className="block text-sm font-semibold text-foreground">
                <AlertCircle size={14} className="inline mr-1 text-orange-500" />
                Allergies à signaler
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows={2}
                value={form.allergies}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Arachides, fruits de mer…"
              />
            </div>
          </fieldset>

          {/* Livraison & message */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Livraison &amp; message
            </legend>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="besoinLivraison"
                checked={form.besoinLivraison}
                onChange={handleChange}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30 accent-primary"
              />
              <span className="text-sm font-semibold text-foreground">
                J'ai besoin d'une livraison sur place
              </span>
            </label>

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-semibold text-foreground">
                Message complémentaire
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Précisez vos attentes, le type de menu souhaité…"
              />
            </div>
          </fieldset>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-colors shadow-lg"
            >
              <Send size={16} />
              Envoyer la demande
            </button>
            <button
              type="button"
              onClick={openWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
            >
              <MessageCircle size={16} fill="white" />
              Envoyer par WhatsApp
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
