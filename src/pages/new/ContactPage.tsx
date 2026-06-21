import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

const WHATSAPP_NUMBER = '596696653589';
const CONTACT_EMAIL = 'contact@delikreol.mq';
const WHATSAPP_DISPLAY = '+596 696 65 35 89';

const SUBJECT_OPTIONS = [
  { value: 'commande', label: 'Commande' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'livraison', label: 'Livraison' },
  { value: 'reclamation', label: 'Réclamation' },
  { value: 'autre', label: 'Autre' },
];

interface ContactFormData {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

const initialFormData: ContactFormData = {
  nom: '',
  email: '',
  telephone: '',
  sujet: '',
  message: '',
};

export function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildWhatsAppMessage = (): string => {
    const lines = [
      `👋 *Nouveau message — DeliKreol*`,
      ``,
      `👤 Nom : ${form.nom}`,
      `📧 Email : ${form.email}`,
      `📞 Téléphone : ${form.telephone}`,
      `🏷️ Sujet : ${SUBJECT_OPTIONS.find((s) => s.value === form.sujet)?.label || form.sujet}`,
      `💬 Message : ${form.message}`,
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem('delikreol_contact_messages') || '[]');
    const entry = {
      ...form,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'nouveau',
    };
    existing.push(entry);
    localStorage.setItem('delikreol_contact_messages', JSON.stringify(existing));

    setSubmitted(true);
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
            <Send size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Message envoyé !</h2>
          <p className="text-muted-foreground leading-relaxed">
            Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle size={18} fill="white" />
              Envoyer aussi par WhatsApp
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm(initialFormData);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              Nouveau message
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <MessageCircle size={14} />
            Contact
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
            Contactez Delikreol
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Une question, une suggestion ou une réclamation ? Notre équipe est à votre écoute.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Form — 3/5 width on desktop */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-lg font-bold text-foreground">Envoyez-nous un message</h2>

              <div className="space-y-1.5">
                <label htmlFor="nom" className="block text-sm font-semibold text-foreground">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Votre nom"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                    placeholder="vous@exemple.mq"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="telephone" className="block text-sm font-semibold text-foreground">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    value={form.telephone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                    placeholder="0696 XX XX XX"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sujet" className="block text-sm font-semibold text-foreground">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  required
                  value={form.sujet}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir un sujet —</option>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="block text-sm font-semibold text-foreground">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                  placeholder="Votre message..."
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500 mb-4">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30" />
                <span>J'accepte que mes données soient collectées et traitées conformément à la <Link to="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</Link>. (RGPD art. 6)</span>
              </label>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
              >
                <Send size={18} />
                Envoyer le message
              </button>
            </form>
          </div>

          {/* Sidebar — 2/5 width on desktop */}
          <div className="md:col-span-2 space-y-6">
            {/* Coordonnées */}
            <div className="p-5 bg-card rounded-2xl border border-border space-y-5">
              <h2 className="text-lg font-bold text-foreground">Nos coordonnées</h2>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Email</h3>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">WhatsApp</h3>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cliquez pour nous écrire directement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Téléphone</h3>
                  <a
                    href={`tel:+${WHATSAPP_NUMBER}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp rapide */}
            <div className="p-5 bg-green-50 border border-green-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-green-600" />
                <h3 className="text-sm font-bold text-green-800">WhatsApp rapide</h3>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                Besoin d'une réponse immédiate ? Envoyez-nous un message directement sur WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour DeliKreol, j'ai une question concernant vos services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
              >
                <MessageCircle size={16} fill="white" />
                Nous écrire sur WhatsApp
              </a>
            </div>

            {/* Nos bureaux */}
            <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
              <h2 className="text-lg font-bold text-foreground">Nous trouver</h2>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Martinique / Caraïbe</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Au service de toute la Martinique et de la Caraïbe
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Horaires d'ouverture</h3>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <li>Lun–Ven : 8h – 17h</li>
                    <li>Sam : 9h – 13h</li>
                    <li className="text-red-500">Dim : Fermé</li>
                  </ul>
                </div>
              </div>

              {/* Boutons Waze & Google Maps */}
              <div className="pt-2 space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  S'y rendre
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://waze.com/ul?ll=14.641,-61.014&navigate=yes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-black hover:bg-black/80 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M20.87 10.49C20.87 5.29 16.7 1 11.5 1S2.13 5.29 2.13 10.49c0 3.37 2.34 6.64 5.47 8.14.32.15.48.47.38.8-.11.43-.26 1.22-.36 1.5-.1.28.24.54.52.38l1.87-1.11c.35-.2.75-.3 1.15-.3.38 0 .76.11 1.09.31 1.73 1.02 4.06 1.42 6.49 1.42 1.72 0 3.41-.28 4.93-.83.33-.12.53-.46.43-.8-.07-.28-.24-.88-.38-1.32-.08-.28.1-.57.38-.68 3.12-1.1 5.44-4.3 5.44-7.67z"/>
                    </svg>
                    Waze
                  </a>
                  <a
                    href="https://maps.google.com/maps?q=14.641,-61.014"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2C7.58 2 4 5.58 4 10c0 2.33 1.59 4.97 3.99 7.24 1.55 1.47 3.33 2.8 4.01 3.29.68-.49 2.46-1.82 4.01-3.29C18.41 14.97 20 12.33 20 10c0-4.42-3.58-8-8-8zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                    </svg>
                    Google Maps
                  </a>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Cliquez pour naviguer depuis votre position
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ContactPage;