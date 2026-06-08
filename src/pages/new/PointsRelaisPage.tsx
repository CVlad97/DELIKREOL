import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Send,
  MessageCircle,
  CheckCircle2,
  Package,
  Clock,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';

const WHATSAPP_NUMBER = '596696653589';

interface RelayFormData {
  nomLieu: string;
  responsable: string;
  commune: string;
  adresse: string;
  telephone: string;
  horaires: string;
  capacite: string;
  conditions: string;
  message: string;
}

const initialFormData: RelayFormData = {
  nomLieu: '',
  responsable: '',
  commune: '',
  adresse: '',
  telephone: '',
  horaires: '',
  capacite: '',
  conditions: '',
  message: '',
};

const STATUSES = [
  { label: 'Candidat', color: 'bg-blue-100 text-blue-700' },
  { label: 'À vérifier', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Validé', color: 'bg-green-100 text-green-700' },
  { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
];

export default function PointsRelaisPage() {
  const [form, setForm] = useState<RelayFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `📍 *Candidature point relais — DeliKreol*`,
      ``,
      `🏪 Lieu : ${form.nomLieu}`,
      `👤 Responsable : ${form.responsable}`,
      `📍 Commune : ${form.commune}`,
      form.adresse ? `📫 Adresse : ${form.adresse}` : '',
      `📞 Tél : ${form.telephone}`,
      form.horaires ? `🕐 Horaires : ${form.horaires}` : '',
      form.capacite ? `📦 Capacité : ${form.capacite}` : '',
      form.conditions ? `📋 Conditions : ${form.conditions}` : '',
      form.message ? `💬 Message : ${form.message}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem('delikreol_relay_applications') || '[]');
    const entry = {
      ...form,
      id: `relay_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'candidat',
    };
    existing.push(entry);
    localStorage.setItem('delikreol_relay_applications', JSON.stringify(existing));

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
        <div className="max-w-lg mx-auto text-center px-4 py-16 space-y-6">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Merci pour votre candidature !</h2>
          <p className="text-muted-foreground leading-relaxed">
            Votre demande a bien été reçue. Nous revenons vers vous rapidement par WhatsApp.
          </p>
          <p className="text-xs text-muted-foreground">
            Statut initial : <span className="font-bold text-blue-600">candidat</span>
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 max-w-md mx-auto">
            <strong>Note :</strong> Votre point relais ne sera pas affiché comme actif tant qu'il
            n'aura pas été validé par l'équipe DeliKreol.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle size={18} fill="white" />
              Envoyer aussi par WhatsApp
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <MapPin size={14} />
            Points relais
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Devenir point relais
          </h1>

          {/* Concept explanation */}
          <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Qu'est-ce qu'un point relais DeliKreol ?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un point relais est un lieu partenaire (commerce, association, local professionnel)
              où les clients peuvent récupérer leurs commandes DeliKreol. Cela permet de faciliter
              la livraison en regroupant les commandes d'un même secteur et d'offrir une
              alternative pratique au retrait chez le prestataire.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex gap-3 p-3 bg-background rounded-xl border border-border">
                <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Horaires flexibles</p>
                  <p className="text-xs text-muted-foreground">Vous définissez vos créneaux</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-background rounded-xl border border-border">
                <Package size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Flux additionnel</p>
                  <p className="text-xs text-muted-foreground">Attirez de nouveaux visiteurs</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-background rounded-xl border border-border">
                <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Validation préalable</p>
                  <p className="text-xs text-muted-foreground">Vérification par DeliKreol</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statuses */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Info size={14} />
              Parcours de validation
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <span key={s.label} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                  {s.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Votre lieu ne sera pas affiché comme point relais actif tant qu'il n'a pas été validé
              par l'équipe DeliKreol.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Informations du lieu
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nomLieu" className="block text-sm font-semibold text-foreground">
                  Nom du lieu <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomLieu"
                  name="nomLieu"
                  type="text"
                  required
                  value={form.nomLieu}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Épicerie Chez Mano"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="responsable" className="block text-sm font-semibold text-foreground">
                  Responsable <span className="text-red-500">*</span>
                </label>
                <input
                  id="responsable"
                  name="responsable"
                  type="text"
                  required
                  value={form.responsable}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Emmanuel Lubin"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                  placeholder="0596 XX XX XX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="adresse" className="block text-sm font-semibold text-foreground">
                Adresse complète
              </label>
              <input
                id="adresse"
                name="adresse"
                type="text"
                value={form.adresse}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="12 rue de la Liberté, Fort-de-France"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Détails opérationnels
            </legend>

            <div className="space-y-1.5">
              <label htmlFor="horaires" className="block text-sm font-semibold text-foreground">
                Horaires d'ouverture
              </label>
              <textarea
                id="horaires"
                name="horaires"
                rows={3}
                value={form.horaires}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Lundi–Samedi 7h–19h, Dimanche 8h–13h"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="capacite" className="block text-sm font-semibold text-foreground">
                  Capacité approximative
                </label>
                <textarea
                  id="capacite"
                  name="capacite"
                  rows={2}
                  value={form.capacite}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Espace pour ~20 commandes"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="conditions" className="block text-sm font-semibold text-foreground">
                  Conditions particulières
                </label>
                <textarea
                  id="conditions"
                  name="conditions"
                  rows={2}
                  value={form.conditions}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Réfrigérateur disponible, parking…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-semibold text-foreground">
                Message complémentaire
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Précisions, questions…"
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
              Envoyer ma candidature
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
