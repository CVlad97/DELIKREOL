import { Star, MessageCircle, Verified } from 'lucide-react';
import { getReviews, getAverageRating, addReview, type Review } from '../services/reviewsService';
import { useState } from 'react';

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          aria-hidden="true"
          className={star <= rating ? 'text-secondary fill-secondary' : 'text-border-strong'}
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
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full">
              <Stars rating={Math.round(average)} size={14} />
              <span className="text-sm font-bold text-secondary">{average.toFixed(1)}</span>
              <span className="text-xs text-secondary">({count} avis)</span>
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
        <form onSubmit={handleSubmit} className="bg-secondary/10 rounded-2xl p-5 mb-6 border border-secondary/30">
          <h3 className="font-bold text-foreground mb-3">Votre avis sur {traiteurName}</h3>
          
          <div className="mb-3">
            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setNewRating(star)}>
                  <Star
                    size={28}
                    className={`cursor-pointer transition-colors ${
                      star <= newRating ? 'text-secondary fill-secondary' : 'text-muted-foreground hover:text-secondary'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Votre prénom</label>
            <input
              type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
              placeholder="Ex: Marie"
              className="w-full px-3 py-2 rounded-xl border border-input focus:border-ring outline-none text-sm"
              required
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Votre commentaire</label>
            <textarea
              value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="w-full px-3 py-2 rounded-xl border border-input focus:border-ring outline-none text-sm resize-none h-20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={newRating === 0 || !newComment.trim() || !newAuthor.trim()}
            className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Publier mon avis
          </button>
        </form>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-input p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{review.authorName}</span>
                  {review.verified && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-success/15 text-success rounded-full flex items-center gap-0.5">
                      <Verified size={10} /> Commande vérifiée
                    </span>
                  )}
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-[10px] text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
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
      <Star size={12} className="text-secondary fill-secondary" />
      <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </div>
  );
}