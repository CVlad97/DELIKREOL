import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';
import { Layout } from '../../components/layout/Layout';

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  name: string;
  commune: string;
  traiteur: string;
  status: 'new' | 'approved' | 'rejected';
  created_at: string;
}

const TRAITEURS_LIST = [
  { value: '', label: '— Sélectionner un traiteur (optionnel) —' },
  { value: "Les Delices de Ninice", label: "Les Délices de Ninice" },
  { value: "Coco's Food", label: "Coco's Food" },
  { value: "Saveurs d'Afrique", label: "Saveurs d'Afrique" },
  { value: 'An Tjè Coco', label: 'An Tjè Coco' },
  { value: "Snack Savè Peyi'A", label: "Snack Savè Peyi'A" },
  { value: 'Gouté Mwen', label: 'Gouté Mwen' },
  { value: 'Sweet Family Traiteur Orianne', label: 'Sweet Family Traiteur Orianne' },
];

function generateId(): string {
  return `review_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadLocalReviews(): ReviewItem[] {
  try {
    const stored = localStorage.getItem('delikreol_reviews');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalReviews(items: ReviewItem[]) {
  localStorage.setItem('delikreol_reviews', JSON.stringify(items));
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`p-0.5 transition-all ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${!readonly && star <= (hover || value) ? 'drop-shadow-sm' : ''}`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-gray-500">{value}/5</span>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [commune, setCommune] = useState('');
  const [traiteur, setTraiteur] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Donnez votre avis — DeliKreol';
  }, []);

  const isValid = rating >= 1 && comment.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    const review: ReviewItem = {
      id: generateId(),
      rating,
      comment: comment.trim(),
      name: name.trim() || 'Anonyme',
      commune: commune.trim(),
      traiteur,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    // Always save to localStorage
    const existing = loadLocalReviews();
    existing.unshift(review);
    saveLocalReviews(existing);

    // Attempt Supabase save
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { error: sbError } = await supabase
          .from('reviews')
          .insert({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            name: review.name,
            commune: review.commune,
            traiteur: review.traiteur,
            status: 'new',
            created_at: review.created_at,
          });

        if (sbError) {
          console.warn('[ReviewPage] Supabase insert failed:', sbError);
        }
      } catch (err: any) {
        console.warn('[ReviewPage] Supabase error:', err?.message);
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/50">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-[2.5rem] border border-orange-100 p-8 md:p-12 shadow-soft">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                Merci pour votre avis !
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                Votre retour nous aide à améliorer DeliKreol et à mieux servir la Martinique.
              </p>
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                >
                  Retour à l'accueil
                </Link>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-orange-100 text-gray-700 font-bold rounded-xl hover:bg-orange-50 transition-all"
                >
                  <ChefHat className="w-4 h-4" />
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-orange-700">
              Avis client
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-2">
              Donnez votre avis
            </h1>
            <p className="text-gray-500 text-base">
              Votre expérience compte pour nous et pour la communauté DeliKreol
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-orange-100 p-6 md:p-8 shadow-soft space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Note <span className="text-red-500">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
              {rating === 0 && error && (
                <p className="mt-1 text-xs text-red-500">Veuillez donner une note</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Commentaire <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience… (minimum 10 caractères)"
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-y transition-all"
              />
              <div className="flex items-center justify-between mt-1">
                {comment.trim().length > 0 && comment.trim().length < 10 ? (
                  <p className="text-xs text-red-500">
                    Minimum 10 caractères ({comment.trim().length}/10)
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">{comment.length}/1000</span>
              </div>
            </div>

            {/* Name (optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Nom <span className="text-gray-400 font-normal">(optionnel — Anonyme si vide)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom ou pseudo"
                maxLength={60}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Commune (optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Commune <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ex: Fort-de-France, Ducos…"
                maxLength={60}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Traiteur (optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Traiteur commandé <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <select
                  value={traiteur}
                  onChange={(e) => setTraiteur(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 appearance-none bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                >
                  {TRAITEURS_LIST.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all ${
                isValid && !submitting
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer mon avis
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-400">
              Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
}