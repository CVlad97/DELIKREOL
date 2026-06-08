import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Send,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';

const WHATSAPP_NUMBER = '596696653589';

const TRANSPORT_MODES = ['Voiture', 'Scooter', 'Vélo', 'Autre'];

interface DriverFormData {
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
}

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

const STATUSES = [
  { label: 'Candidat', color: 'bg-blue-100 text-blue-700' },
  { label: 'À appeler', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Documents à vérifier', color: 'bg-orange-100 text-orange-700' },
  { label: 'Validé', color: 'bg-green-100 text-green-700' },
  { label: 'Suspendu', color: 'bg-red-100 text-red-700' },
  { label: 'Inactif', color: 'bg-gray-100 text-gray-700' },
];

export default function DevenirLivreurPage() {
  const [form, setForm] = useState<DriverFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `🚚 *Candidature livreur — DeliKreol*`,
      ``,
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem('delikreol_driver_applications') || '[]');
    const entry = {
      ...form,
      id: `driver_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'candidat',
    };
    existing.push(entry);
    localStorage.setItem('delikreol_driver_applications', JSON.stringify(existing));

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Truck size={14} />
            Candidature livreur
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Devenir livreur DeliKreol
          </h1>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 space-y-1">
              <p className="font-bold">Important</p>
              <p>
                Les livreurs sont validés progressivement. DeliKreol vérifie les zones,
                disponibilités et conditions avant activation. Aucune promesse de revenu fixe
                n'est faite.
              </p>
            </div>
          </div>

          {/* Statuses info */}
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
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
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
                  placeholder="Marc Joseph"
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-foreground">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Même numéro ou différent"
                />
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
                  placeholder="marc@exemple.mq"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="commune" className="block text-sm font-semibold text-foreground">
                <MapPin size={14} className="inline mr-1" />
                Votre commune <span className="text-red-500">*</span>
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
          </fieldset>

          {/* Zones */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Zones acceptées
            </legend>
            <p className="text-xs text-muted-foreground">
              Cochez les communes dans lesquelles vous acceptez de livrer.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
              {martiniqueCommunes.map((c) => (
                <label
                  key={c.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
                    form.zonesAcceptees.includes(c.name)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-foreground hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.zonesAcceptees.includes(c.name)}
                    onChange={() => handleZoneToggle(c.name)}
                    className="w-3.5 h-3.5 rounded accent-primary"
                  />
                  {c.name}
                </label>
              ))}
            </div>
            {form.zonesAcceptees.length > 0 && (
              <p className="text-xs text-primary font-semibold">
                {form.zonesAcceptees.length} commune{form.zonesAcceptees.length > 1 ? 's' : ''} sélectionnée{form.zonesAcceptees.length > 1 ? 's' : ''}
              </p>
            )}
          </fieldset>

          {/* Transport & availability */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Transport &amp; disponibilité
            </legend>

            <div className="space-y-1.5">
              <label htmlFor="moyenTransport" className="block text-sm font-semibold text-foreground">
                Moyen de transport <span className="text-red-500">*</span>
              </label>
              <select
                id="moyenTransport"
                name="moyenTransport"
                required
                value={form.moyenTransport}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              >
                <option value="">— Choisir —</option>
                {TRANSPORT_MODES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="disponibilite" className="block text-sm font-semibold text-foreground">
                  <Clock size={14} className="inline mr-1" />
                  Disponibilité générale
                </label>
                <textarea
                  id="disponibilite"
                  name="disponibilite"
                  rows={3}
                  value={form.disponibilite}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Semaine complète, weekends uniquement…"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="horaires" className="block text-sm font-semibold text-foreground">
                  Horaires préférés
                </label>
                <textarea
                  id="horaires"
                  name="horaires"
                  rows={3}
                  value={form.horaires}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="11h–14h et 18h–21h"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="experienceLivraison" className="block text-sm font-semibold text-foreground">
                Expérience en livraison
              </label>
              <textarea
                id="experienceLivraison"
                name="experienceLivraison"
                rows={3}
                value={form.experienceLivraison}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Ex : 2 ans chez UberEats, livraison pour un restaurant…"
              />
            </div>
          </fieldset>

          {/* Documents info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 space-y-1">
              <p className="font-bold">Pièces &amp; assurance</p>
              <p>
                Les documents nécessaires (pièce d'identité, assurance, permis si applicable)
                seront demandés dans un second temps, après un premier échange avec l'équipe
                DeliKreol.
              </p>
            </div>
          </div>

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
