import { useState, FormEvent } from 'react';
import {
  MessageCircle, Bug, Lightbulb, Send, Inbox, AlertTriangle,
  FileUp, CheckCircle2
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';
const CONTACT_EMAIL = 'contact@delikreol.mq';

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 Bug / Dysfonctionnement', icon: Bug },
  { value: 'suggestion', label: '💡 Suggestion', icon: Lightbulb },
  { value: 'amelioration', label: '🚀 Amélioration', icon: Inbox },
  { value: 'autre', label: '📝 Autre', icon: AlertTriangle },
];

interface FeedbackFormData {
  type: string;
  description: string;
  email: string;
  attachment: File | null;
}

const initialFormData: FeedbackFormData = {
  type: '',
  description: '',
  email: '',
  attachment: null,
};

export function FeedbackPage() {
  const [form, setForm] = useState<FeedbackFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, attachment: file }));
  };

  const buildWhatsAppMessage = (): string => {
    const typeLabel = FEEDBACK_TYPES.find((t) => t.value === form.type)?.label || form.type;
    const lines = [
      `👋 *Nouveau feedback — DeliKreol*`,
      ``,
      `🏷️ Type : ${typeLabel}`,
      form.email ? `📧 Email : ${form.email}` : '',
      `💬 Description : ${form.description}`,
    ];
    return lines.filter(Boolean).join('\n');
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured || isDemoMode) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `feedback_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `feedback/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('delikreol-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('delikreol-files')
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (err) {
      console.warn('[Feedback] Upload échoué, envoi sans pièce jointe.', err);
      return null;
    }
  };

  const saveToSupabase = async (data: {
    type: string;
    description: string;
    email: string;
    attachment_url: string | null;
  }) => {
    const { error: dbError } = await supabase.from('feedback').insert(data);
    if (dbError) throw dbError;
  };

  const saveToLocalStorage = (data: {
    type: string;
    description: string;
    email: string;
    attachment_url: string | null;
  }) => {
    const existing = JSON.parse(localStorage.getItem('delikreol_feedback') || '[]');
    existing.push({
      ...data,
      id: `feedback_${Date.now()}`,
      status: 'new',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('delikreol_feedback', JSON.stringify(existing));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let attachmentUrl: string | null = null;

      if (form.attachment) {
        attachmentUrl = await uploadAttachment(form.attachment);
      }

      const data = {
        type: form.type,
        description: form.description,
        email: form.email,
        attachment_url: attachmentUrl,
      };

      if (isSupabaseConfigured && !isDemoMode) {
        try {
          await saveToSupabase(data);
        } catch (dbErr: any) {
          console.warn('[Feedback] Supabase insert failed, fallback to localStorage', dbErr);
          saveToLocalStorage(data);
        }
      } else {
        saveToLocalStorage(data);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
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
          <h2 className="text-2xl font-bold text-foreground">Message envoyé !</h2>
          <p className="text-muted-foreground leading-relaxed">
            Merci pour votre retour ! Nous lisons chaque message pour améliorer DeliKreol.
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
              className="btn btnPrimary"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <Inbox size={14} />
            Feedback
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
            Boîte à idées &amp; signalement
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Une suggestion ? Un bug ? Envoie-nous un message. On lit tout.
          </p>
        </div>

        {/* Formulaire */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-card rounded-2xl border border-border">
            <h2 className="text-lg font-bold text-foreground">Envoyez-nous votre retour</h2>

            {/* Type */}
            <div className="space-y-1.5">
              <label htmlFor="type" className="block text-sm font-semibold text-foreground">
                Type de retour <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              >
                <option value="">— Choisir un type —</option>
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-semibold text-foreground">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Décrivez votre idée, le bug rencontré ou votre suggestion..."
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="vous@exemple.mq (si vous souhaitez une réponse)"
              />
            </div>

            {/* Pièce jointe */}
            <div className="space-y-1.5">
              <label htmlFor="attachment" className="block text-sm font-semibold text-foreground">
                Pièce jointe <span className="text-muted-foreground text-xs">(optionnel, image ou capture d'écran)</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm cursor-pointer hover:bg-muted/50 transition">
                  <FileUp size={16} />
                  <span>Choisir un fichier</span>
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {form.attachment && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {form.attachment.name}
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btnPrimary w-full inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send size={18} />
                  Envoyer
                </>
              )}
            </button>
          </form>
        </div>

        {/* WhatsApp urgent */}
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-green-600" />
            <h3 className="text-sm font-bold text-green-800">Besoin urgent ?</h3>
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            Si vous avez besoin d'une réponse immédiate, contactez-nous directement sur WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour DeliKreol, j'ai un retour à vous faire (urgent).")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
          >
            <MessageCircle size={16} fill="white" />
            Nous écrire sur WhatsApp
          </a>
        </div>

        {/* Contact email */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Vous pouvez aussi nous écrire à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default FeedbackPage;