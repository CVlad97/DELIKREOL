import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Send,
  MessageCircle,
  CheckCircle2,
  Star,
  TrendingUp,
  Shield,
  Megaphone,
  Camera,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';

const ACTIVITY_TYPES = [
  'Traiteur',
  'Snack',
  'Restaurant',
  'Food truck',
  'Pâtisserie',
  'Autre',
];

interface PartnerFormData {
  nomActivite: string;
  nomResponsable: string;
  telephone: string;
  whatsapp: string;
  email: string;
  commune: string;
  typeActivite: string;
  produitsProposés: string;
  horaires: string;
  conditionsRetrait: string;
  zonesPossibles: string;
  photosDisponibles: string;
  besoinAideMenu: boolean;
  message: string;
}

const initialFormData: PartnerFormData = {
  nomActivite: '',
  nomResponsable: '',
  telephone: '',
  whatsapp: '',
  email: '',
  commune: '',
  typeActivite: '',
  produitsProposés: '',
  horaires: '',
  conditionsRetrait: '',
  zonesPossibles: '',
  photosDisponibles: '',
  besoinAideMenu: false,
  message: '',
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Visibilité immédiate',
    text: 'Votre activité est mise en avant auprès de milliers de Martiniquais.',
  },
  {
    icon: Shield,
    title: 'Zéro infrastructure',
    text: 'Pas de site web à créer, pas de système de commande à gérer.',
  },
  {
    icon: Megaphone,
    title: 'Marketing local inclus',
    text: 'DeliKreol fait la promotion de vos plats sur les réseaux.',
  },
  {
    icon: Star,
    title: 'Accompagnement personnalisé',
    text: 'Aide à la rédaction du menu, photos et mise en page.',
  },
];

export default function DevenirPartenairePage() {
  const [form, setForm] = useState<PartnerFormData>(initialFormData);
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
      `🏪 *Candidature partenaire — DeliKreol*`,
      ``,
      `🏷️ Activité : ${form.nomActivite}`,
      `👤 Responsable : ${form.nomResponsable}`,
      `📞 Tél : ${form.telephone}`,
      form.whatsapp ? `💬 WhatsApp : ${form.whatsapp}` : '',
      form.email ? `📧 Email : ${form.email}` : '',
      `📍 Commune : ${form.commune}`,
      `🍽️ Type : ${form.typeActivite}`,
      form.produitsProposés ? `📋 Produits : ${form.produitsProposés}` : '',
      form.horaires ? `🕐 Horaires : ${form.horaires}` : '',
      form.conditionsRetrait ? `🚚 Retrait/livraison : ${form.conditionsRetrait}` : '',
      form.zonesPossibles ? `📍 Zones : ${form.zonesPossibles}` : '',
      `📸 Photos disponibles : ${form.photosDisponibles || 'Non précisé'}`,
      form.besoinAideMenu ? `✅ Besoin aide menu/photo : Oui` : '',
      form.message ? `💬 Message : ${form.message}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem('delikreol_partner_applications') || '[]');
    const entry = {
      ...form,
      id: `partner_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'nouveau',
    };
    existing.push(entry);
    localStorage.setItem('delikreol_partner_applications', JSON.stringify(existing));

    // Tentative de sauvegarde dans Supabase (fallback silencieux si indisponible)
    try {
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          name: form.nomResponsable,
          business_name: form.nomActivite,
          email: form.email || null,
          phone: form.telephone,
          commune: form.commune,
          activity_type: form.typeActivite,
          description: form.message || null,
        });

      if (error) {
        console.warn('[DevenirPartenaire] Supabase insert failed, keeping localStorage only:', error.message);
      }
    } catch (err) {
      console.warn('[DevenirPartenaire] Supabase unavailable, keeping localStorage only:', err);
    }

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
            Statut : <span className="font-bold text-primary">nouveau / à vérifier</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Vous serez contacté rapidement. Contact support si besoin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour DeliKreol, j\'ai postulé pour devenir partenaire et souhaitais un suivi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle size={18} fill="white" />
              Suivi par WhatsApp
            </a>
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
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <Store size={14} />
            Rejoignez le réseau
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Devenir partenaire
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Vous êtes traiteur, restaurateur ou producteur en Martinique ? Rejoignez DeliKreol et
            donnez de la visibilité à votre savoir-faire. Nous nous occupons de la mise en avant,
            des commandes et de la logistique.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Forfaits partenaires */}
        <div className="mb-10">
          <h2 className="text-xl font-display font-bold mb-2">Forfaits DELIKREOL</h2>
          <p className="text-sm text-muted-foreground mb-6">Pendant la phase pilote, envoyez vos corrections à DELIKREOL par WhatsApp. Nous les appliquons gratuitement avant publication. L'accès modification directe arrivera prochainement.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 relative">
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">Phase pilote</div>
              <h3 className="font-bold text-lg mt-1">Accès autonome</h3>
              <p className="text-3xl font-black text-emerald-600 my-2">0 €</p>
              <p className="text-xs text-muted-foreground mb-3">Envoyez vos corrections à DELIKREOL. Nous les appliquons gratuitement.</p>
              <ul className="text-xs space-y-1 text-emerald-700">
                <li>✅ Corrections gratuites par WhatsApp</li>
                <li>✅ Photos, prix, description, bio</li>
                <li>✅ Accès espace partenaire (prochainement)</li>
                <li>✅ Support par email</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-white p-5">
              <h3 className="font-bold text-lg">Mise en ligne</h3>
              <p className="text-3xl font-black text-orange-600 my-2">49 €</p>
              <p className="text-xs text-muted-foreground mb-3">Import jusqu'à 10 photos + correction descriptions</p>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>📸 Import jusqu'à 10 photos</li>
                <li>✏️ Correction descriptions principales</li>
                <li>🚀 Mise en ligne complète</li>
                <li>✅ Validation avant publication</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-white p-5">
              <h3 className="font-bold text-lg">Catalogue optimisé</h3>
              <p className="text-3xl font-black text-orange-600 my-2">89 €</p>
              <p className="text-xs text-muted-foreground mb-3">Import 25 photos + rédaction complète + bio optimisée</p>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>📸 Import jusqu'à 25 photos</li>
                <li>✍️ Rédaction descriptions complètes</li>
                <li>📂 Structuration catégories</li>
                <li>🌟 Bio optimisée et fiche vendeuse</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-bold text-lg">Gestion mensuelle</h3>
              <p className="text-3xl font-black text-amber-600 my-2">39 €<span className="text-sm font-normal text-gray-500">/mois</span></p>
              <p className="text-xs text-muted-foreground mb-3">Mise à jour régulière : nouveaux plats, prix, promos</p>
              <ul className="text-xs space-y-1 text-amber-700">
                <li>🔄 Mise à jour mensuelle</li>
                <li>🍽️ Nouveaux plats et prix</li>
                <li>📸 Photos et promos</li>
                <li>⏰ Disponibilités en temps réel</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">💡 Partenaires pilotes existants (Coco's Food, Ninice, Saveurs d'Afrique) : codes accès déjà préparés. Contactez-nous pour les recevoir.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Votre activité
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nomActivite" className="block text-sm font-semibold text-foreground">
                  Nom de l'activité <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomActivite"
                  name="nomActivite"
                  type="text"
                  required
                  value={form.nomActivite}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Chez Tatie Rose"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="nomResponsable" className="block text-sm font-semibold text-foreground">
                  Nom du responsable <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomResponsable"
                  name="nomResponsable"
                  type="text"
                  required
                  value={form.nomResponsable}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Rose Martin"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                  placeholder="rose@exemple.mq"
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

            <div className="space-y-1.5">
              <label htmlFor="typeActivite" className="block text-sm font-semibold text-foreground">
                Type d'activité <span className="text-red-500">*</span>
              </label>
              <select
                id="typeActivite"
                name="typeActivite"
                required
                value={form.typeActivite}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              >
                <option value="">— Choisir —</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* Details */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Détails de votre offre
            </legend>

            <div className="space-y-1.5">
              <label htmlFor="produitsProposés" className="block text-sm font-semibold text-foreground">
                Produits / plats proposés
              </label>
              <textarea
                id="produitsProposés"
                name="produitsProposés"
                rows={3}
                value={form.produitsProposés}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Colombo poulet, accras, bokit, grillades…"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="horaires" className="block text-sm font-semibold text-foreground">
                  Horaires d'activité
                </label>
                <textarea
                  id="horaires"
                  name="horaires"
                  rows={2}
                  value={form.horaires}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Lundi–Vendredi 10h–14h, Samedi 11h–15h"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="conditionsRetrait" className="block text-sm font-semibold text-foreground">
                  Conditions retrait / livraison
                </label>
                <textarea
                  id="conditionsRetrait"
                  name="conditionsRetrait"
                  rows={2}
                  value={form.conditionsRetrait}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Retrait sur place, livraison possible…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="zonesPossibles" className="block text-sm font-semibold text-foreground">
                Zones de livraison possibles
              </label>
              <textarea
                id="zonesPossibles"
                name="zonesPossibles"
                rows={2}
                value={form.zonesPossibles}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Fort-de-France, Lamentin, Schœlcher…"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="photosDisponibles" className="block text-sm font-semibold text-foreground">
                  <Camera size={14} className="inline mr-1" />
                  Photos de vos plats disponibles ?
                </label>
                <select
                  id="photosDisponibles"
                  name="photosDisponibles"
                  value={form.photosDisponibles}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir —</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="besoinAideMenu"
                    checked={form.besoinAideMenu}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    J'ai besoin d'aide pour le menu / les photos
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          {/* Message */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Message
            </legend>
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
                placeholder="Parlez-nous de votre activité, vos projets…"
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
