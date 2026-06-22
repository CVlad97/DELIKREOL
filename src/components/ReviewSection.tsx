import { Star, MessageCircle, Verified } from 'lucide-react';
import { getReviews, getAverageRating, addReview, type Review } from '../services/reviewsService';
import { useState } from 'react';

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export function ReviewSection({ traiteurSlug, traiteurName }: { traiteurSlug: string; traiteurName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(getReviews(traiteurSlug));
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const { average, count } = getAverageRating(traiteurSlug);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0 || !newComment.trim() || !newAuthor.trim()) return;
    const review = addReview({
      traiteurSlug,
      traiteurName,
      authorName: newAuthor,
      rating: newRating,
      comment: newComment,
      verified: false,
    });
    setReviews([review, ...reviews]);
    setShowForm(false);
    setNewRating(0);
    setNewComment('');
    setNewAuthor('');
  };

  return (
    <div className="mb-8">
      {/* En-tête des avis */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-display font-bold">Avis clients</h2>
          {count > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
              <Stars rating={Math.round(average)} size={14} />
              <span className="text-sm font-bold text-amber-700">{average.toFixed(1)}</span>
              <span className="text-xs text-amber-500">({count} avis)</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-4 py-2 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-colors"
        >
          {showForm ? 'Annuler' : 'Donner mon avis'}
        </button>
      </div>

      {/* Formulaire d'avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-200">
          <h3 className="font-bold text-gray-900 mb-3">Votre avis sur {traiteurName}</h3>
          
          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setNewRating(star)}>
                  <Star
                    size={28}
                    className={`cursor-pointer transition-colors ${
                      star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">Votre prénom</label>
            <input
              type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
              placeholder="Ex: Marie"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-amber-400 outline-none text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">Votre commentaire</label>
            <textarea
              value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-amber-400 outline-none text-sm resize-none h-20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={newRating === 0 || !newComment.trim() || !newAuthor.trim()}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Publier mon avis
          </button>
        </form>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{review.authorName}</span>
                  {review.verified && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-0.5">
                      <Verified size={10} /> Commande vérifiée
                    </span>
                  )}
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-[10px] text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Badge d'étoiles compact pour cartes traiteur */
export function RatingBadge({ traiteurSlug }: { traiteurSlug: string }) {
  const { average, count } = getAverageRating(traiteurSlug);
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <Star size={12} className="text-amber-400 fill-amber-400" />
      <span className="font-semibold text-gray-700">{average.toFixed(1)}</span>
      <span className="text-gray-400">({count})</span>
    </div>
  );
}