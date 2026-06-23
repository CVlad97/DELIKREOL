import { useState, FormEvent } from 'react';
import {
  MessageCircle, Bug, Lightbulb, Send, Inbox, AlertTriangle,
  FileUp, CheckCircle2, ArrowLeft, ImagePlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';
const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FEEDBACK_TYPES = [
  { value: 'bug', label: '🐛 Bug / Dysfonctionnement', icon: Bug },
  { value: 'commande', label: '🛒 Problème de commande', icon: AlertTriangle },
  { value: 'connexion', label: '🔐 Problème de connexion', icon: AlertTriangle },
  { value: 'suggestion', label: '💡 Suggestion', icon: Lightbulb },
  { value: 'amelioration', label: '🚀 Amélioration', icon: Inbox },
  { value: 'autre', label: '📝 Autre', icon: AlertTriangle },
];

interface FeedbackFormData {
  type: string;
  description: string;
  email: string;
  phone: string;
  pageUrl: string;
  attachment: File | null;
}

const initialFormData: FeedbackFormData = {
  type: 'bug',
  description: '',
  email: '',
  phone: '',
  pageUrl: typeof window !== 'undefined' ? window.location.href : '',
  attachment: null,
};

export function FeedbackPage() {
  const [form, setForm] = useState<FeedbackFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentWarning, setAttachmentWarning] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachmentWarning(null);

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setForm((prev) => ({ ...prev, attachment: null }));
      setAttachmentWarning(`Fichier trop lourd. Merci d'envoyer une pièce jointe de ${MAX_FILE_SIZE_MB} Mo maximum.`);
      e.target.value = '';
      return;
    }

    setForm((prev) => ({ ...prev, attachment: file }));
  };

  const buildWhatsAppMessage = (): string => {
    const typeLabel = FEEDBACK_TYPES.find((t) => t.value === form.type)?.label || form.type;
    const lines = [
      `👋 *Signalement problème — DeliKreol*`,
      ``,
      `🏷️ Type : ${typeLabel}`,
      form.email ? `📧 Email : ${form.email}` : '',
      form.phone ? `📱 Téléphone : ${form.phone}` : '',
      form.pageUrl ? `🔗 Page : ${form.pageUrl}` : '',
      ``,
      `💬 Description :`,
      form.description,
      ``,
      form.attachment ? `📎 Pièce jointe : ${form.attachment.name} — merci de l'envoyer dans ce WhatsApp si elle n'a pas été transmise automatiquement.` : '',
    ];
    return lines.filter(Boolean).join('\n');
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured || isDemoMode) return null;
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
      const fileName = `feedback_${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
      const filePath = `feedback/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delikreol-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

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

  const saveToSupabase = async (data: Record<string, any>) => {
    const { error: dbError } = await supabase.from('feedback').insert(data);
    if (dbError) throw dbError;
  };

  const saveToLocalStorage = (data: Record<string, any>) => {
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
    setAttachmentWarning(null);

    if (!form.description.trim()) {
      setError('Merci de décrire le problème rencontré.');
      return;
    }

    setSubmitting(true);

    try {
      let attachmentUrl: string | null = null;

      if (form.attachment) {
        attachmentUrl = await uploadAttachment(form.attachment);
        if (!attachmentUrl) {
          setAttachmentWarning('La pièce jointe n’a pas pu être téléversée automatiquement. Vous pourrez l’envoyer par WhatsApp après validation.');
        }
      }

      const data = {
        type: form.type,
        description: form.description.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        page_url: form.pageUrl || (typeof window !== 'undefined' ? window.location.href : null),
        attachment_url: attachmentUrl,
        attachment_name: form.attachment?.name || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        status: 'new',
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
      setError(err?.message || 'Une erreur est survenue. Veuillez réessayer ou envoyer le signalement par WhatsApp.');
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
          <h2 className="text-2xl font-bold text-foreground">Signalement envoyé !</h2>
          <p className="text-muted-foreground leading-relaxed">
            Merci. Le problème est enregistré pour correction. Si c’est urgent ou si la pièce jointe n’a pas été envoyée, utilise aussi WhatsApp.
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
                setForm({ ...initialFormData, pageUrl: typeof window !== 'undefined' ? window.location.href : '' });
              }}
              className="btn btnPrimary"
            >
              Signaler autre chose
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:underline">
          <ArrowLeft size={16} /> Retour accueil
        </Link>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <AlertTriangle size={14} />
            Signalement
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
            Signaler un problème
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Décris le bug ou le blocage. Tu peux ajouter une capture d’écran ou un document.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-card rounded-2xl border border-border shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="type" className="block text-sm font-semibold text-foreground">
              Type de problème <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            >
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-semibold text-foreground">
              Description du problème <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={7}
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
              placeholder="Exemple : je clique sur Commander, mais rien ne se passe. Je suis sur Android / Chrome."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="vous@exemple.mq"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
                Téléphone / WhatsApp <span className="text-muted-foreground text-xs">(optionnel)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="0696 XX XX XX"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pageUrl" className="block text-sm font-semibold text-foreground">
              Page concernée <span className="text-muted-foreground text-xs">(auto)</span>
            </label>
            <input
              id="pageUrl"
              name="pageUrl"
              type="url"
              value={form.pageUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="attachment" className="block text-sm font-semibold text-foreground">
              Pièce jointe <span className="text-muted-foreground text-xs">(optionnel, max {MAX_FILE_SIZE_MB} Mo)</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm cursor-pointer hover:bg-muted/50 transition">
                <ImagePlus size={17} />
                <span>Ajouter une capture / PJ</span>
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
                <span className="text-xs text-muted-foreground truncate max-w-full sm:max-w-[280px]">
                  📎 {form.attachment.name}
                </span>
              )}
            </div>
            {attachmentWarning && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">{attachmentWarning}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
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
                  Envoyer le signalement
                </>
              )}
            </button>
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-bold text-white transition hover:bg-green-600"
            >
              <MessageCircle size={18} />
              WhatsApp urgent
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default FeedbackPage;
