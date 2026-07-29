import { useEffect, useState } from'react';
import { Star, CheckCircle2, XCircle, Eye, Inbox, ThumbsUp, ThumbsDown } from'lucide-react';
import { supabase, isDemoMode, isSupabaseConfigured } from'../../lib/supabase';
import type { ReviewItem } from'../new/ReviewPage';
import { loadLocalReviews } from'../new/ReviewPage';

type ReviewStatus ='new' |'approved' |'rejected';
type FilterRating = 0 | 1 | 2 | 3 | 4 | 5;

function saveLocalReviews(items: ReviewItem[]) {
 localStorage.setItem('delikreol_reviews', JSON.stringify(items));
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; icon: any }> = {
 new: { label:'Nouveau', color:'bg-blue-100 text-blue-700', icon: Eye },
 approved: { label:'Approuvé', color:'bg-green-100 text-green-700', icon: ThumbsUp },
 rejected: { label:'Rejeté', color:'bg-red-100 text-red-700', icon: ThumbsDown },
};

function ReviewCard({
 review,
 onApprove,
 onReject,
}: {
 review: ReviewItem;
 onApprove: (id: string) => void;
 onReject: (id: string) => void;
}) {
 const statusConfig = STATUS_CONFIG[review.status];
 const StatusIcon = statusConfig.icon;

 return (
 <div
 className={`bg-card rounded-xl border p-4 transition ${
 review.status ==='new' ?'border-blue-200 shadow-sm' :''
 }`}
 >
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0 flex-1 space-y-3">
 {/* Header: name + status + date */}
 <div className="flex flex-wrap items-center gap-2">
 <span className="font-bold text-foreground text-sm">
 {review.name}
 </span>
 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusConfig.color}`}>
 <StatusIcon size={12} />
 {statusConfig.label}
 </span>
 {review.commune && (
 <span className="text-xs text-muted-foreground">
 📍 {review.commune}
 </span>
 )}
 {review.traiteur && (
 <span className="text-xs text-primary font-medium">
 🍽️ {review.traiteur}
 </span>
 )}
 <span className="text-xs text-muted-foreground ml-auto">
 {new Date(review.created_at).toLocaleDateString('fr', {
 day:'numeric',
 month:'long',
 year:'numeric',
 hour:'2-digit',
 minute:'2-digit',
 })}
 </span>
 </div>

 {/* Stars */}
 <div className="flex items-center gap-0.5">
 {[1, 2, 3, 4, 5].map((s) => (
 <Star
 key={s}
 className={`w-4 h-4 ${
 s <= review.rating
 ?'fill-yellow-400 text-yellow-400'
 :'text-gray-200'
 }`}
 />
 ))}
 <span className="ml-2 text-sm font-semibold text-muted-foreground">
 {review.rating}/5
 </span>
 </div>

 {/* Comment */}
 <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
 &ldquo;{review.comment}&rdquo;
 </p>
 </div>

 {/* Actions */}
 <div className="flex-shrink-0 flex flex-col gap-2">
 {review.status !=='approved' && (
 <button
 onClick={() => onApprove(review.id)}
 title="Approuver"
 className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
 >
 <CheckCircle2 size={18} />
 </button>
 )}
 {review.status !=='rejected' && (
 <button
 onClick={() => onReject(review.id)}
 title="Rejeter"
 className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
 >
 <XCircle size={18} />
 </button>
 )}
 </div>
 </div>
 </div>
 );
}

export function AdminReviews() {
 const [items, setItems] = useState<ReviewItem[]>([]);
 const [filterStatus, setFilterStatus] = useState<ReviewStatus |'all'>('all');
 const [filterRating, setFilterRating] = useState<FilterRating>(0);
 const [loading, setLoading] = useState(true);
 const [source, setSource] = useState<'supabase' |'local'>('local');
 const [loadError, setLoadError] = useState<string | null>(null);

 const loadReviews = async () => {
 setLoading(true);
 setLoadError(null);

 if (isSupabaseConfigured && !isDemoMode) {
 try {
 const { data, error } = await supabase
 .from('reviews')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) throw error;
 setItems((data || []) as ReviewItem[]);
 setSource('supabase');
 setLoading(false);
 return;
 } catch (err: any) {
 console.warn('[AdminReviews] Supabase load failed, fallback localStorage', err);
 setLoadError(err?.message ||'Lecture Supabase impossible. Affichage local uniquement.');
 }
 }

 setItems(loadLocalReviews().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
 setSource('local');
 setLoading(false);
 };

 useEffect(() => {
 document.title ='Avis clients — Admin DeliKreol';
 loadReviews();
 }, []);

 const updateStatus = async (id: string, newStatus: ReviewStatus) => {
 const updated = items.map((item) =>
 item.id === id ? { ...item, status: newStatus } : item
 );
 setItems(updated);

 if (source ==='supabase' && isSupabaseConfigured && !isDemoMode) {
 try {
 const { error } = await supabase
 .from('reviews')
 .update({ status: newStatus })
 .eq('id', id);
 if (error) {
 console.warn('[AdminReviews] Supabase update failed', error);
 setLoadError(error.message);
 }
 } catch (err: any) {
 console.warn('[AdminReviews] Supabase update error', err?.message);
 }
 } else {
 saveLocalReviews(updated);
 }
 };

 const handleApprove = (id: string) => updateStatus(id,'approved');
 const handleReject = (id: string) => updateStatus(id,'rejected');

 const filteredItems = items.filter((item) => {
 if (filterStatus !=='all' && item.status !== filterStatus) return false;
 if (filterRating > 0 && item.rating !== filterRating) return false;
 return true;
 });

 // For"Afficher sur l'accueil" — copy approved reviews into a special localStorage key
 const handleShowOnHomepage = () => {
 const approved = items.filter((r) => r.status ==='approved');
 localStorage.setItem('delikreol_home_reviews', JSON.stringify(approved));
 // Brief success feedback
 const btn = document.getElementById('show-home-btn');
 if (btn) {
 const original = btn.textContent;
 btn.textContent ='✅ Mis à jour sur l\'accueil !';
 setTimeout(() => {
 btn.textContent = original;
 }, 2000);
 }
 };

 const countByStatus = (status: ReviewStatus) =>
 items.filter((item) => item.status === status).length;

 return (
 <div>
 <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
 <div>
 <h1 className="text-2xl font-display font-bold">Avis clients</h1>
 <p className="text-xs text-muted-foreground mt-1">
 Source : {source ==='supabase' ?'Supabase' :'localStorage'}
 </p>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-xs text-muted-foreground">
 {items.length} avis
 {' ·'}
 <span className="text-blue-600 font-semibold">{countByStatus('new')} nouveau</span>
 {' ·'}
 <span className="text-green-600 font-semibold">{countByStatus('approved')} approuvé</span>
 {' ·'}
 <span className="text-red-600 font-semibold">{countByStatus('rejected')} rejeté</span>
 </div>
 <button
 onClick={loadReviews}
 className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
 >
 Actualiser
 </button>
 </div>
 </div>

 {loadError && (
 <div className="mb-4 rounded-xl border border-input bg-muted p-3 text-sm text-muted-foreground">
 {loadError}
 </div>
 )}

 {/* Filters */}
 <div className="flex flex-wrap gap-2 mb-4">
 {/* Status filter */}
 {(['all','new','approved','rejected'] as const).map((f) => (
 <button
 key={f}
 onClick={() => setFilterStatus(f)}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
 filterStatus === f
 ?'bg-primary text-primary-foreground'
 :'bg-muted text-muted-foreground hover:text-foreground'
 }`}
 >
 {f ==='all'
 ?'Tous'
 : STATUS_CONFIG[f]?.label || f}
 {f !=='all' && ` (${countByStatus(f)})`}
 </button>
 ))}
 </div>

 {/* Rating filter */}
 <div className="flex flex-wrap items-center gap-2 mb-6">
 <span className="text-xs text-muted-foreground font-semibold">Note :</span>
 {([0, 5, 4, 3, 2, 1] as FilterRating[]).map((r) => (
 <button
 key={r}
 onClick={() => setFilterRating(r === filterRating ? 0 : r)}
 className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
 filterRating === r
 ?'bg-yellow-100 text-yellow-800 border border-yellow-300'
 :'bg-muted text-muted-foreground hover:text-foreground'
 }`}
 >
 {r === 0 ? ('Toutes'
 ) : (
 <>
 {r} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
 </>
 )}
 </button>
 ))}
 </div>

 {/* Afficher sur l'accueil button */}
 <div className="mb-6 flex justify-end">
 <button
 id="show-home-btn"
 onClick={handleShowOnHomepage}
 className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all"
 >
 <Eye className="w-4 h-4" />
 Afficher sur l'accueil
 </button>
 </div>

 {/* Reviews list */}
 {loading ? (
 <div className="text-center py-12 bg-muted/20 rounded-xl">
 <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
 <p className="text-muted-foreground">Chargement des avis…</p>
 </div>
 ) : filteredItems.length === 0 ? (
 <div className="text-center py-12 bg-muted/20 rounded-xl">
 <Inbox size={40} className="mx-auto text-muted-foreground/40 mb-3" />
 <p className="text-muted-foreground">
 {filterStatus !=='all' || filterRating > 0
 ?'Aucun avis ne correspond aux filtres sélectionnés.'
 :'Aucun avis pour le moment.'}
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredItems.map((review) => (
 <ReviewCard
 key={review.id}
 review={review}
 onApprove={handleApprove}
 onReject={handleReject}
 />
 ))}
 </div>
 )}
 </div>
 );
}

export default AdminReviews;