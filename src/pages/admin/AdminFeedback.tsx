import { useEffect, useState } from 'react';
import { Bug, Lightbulb, MessageCircle, CheckCircle2, Archive, Inbox, AlertTriangle, ExternalLink, Phone } from 'lucide-react';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

type FeedbackStatus = 'new' | 'read' | 'resolved';
type FeedbackType = 'bug' | 'commande' | 'connexion' | 'suggestion' | 'amelioration' | 'autre';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  description: string;
  email?: string | null;
  phone?: string | null;
  page_url?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  status: FeedbackStatus;
  created_at: string;
}

const TYPE_CONFIG: Record<FeedbackType, { label: string; icon: any; color: string }> = {
  bug: { label: 'Bug', icon: Bug, color: 'text-red-600 bg-red-50' },
  commande: { label: 'Commande', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  connexion: { label: 'Connexion', icon: AlertTriangle, color: 'text-purple-600 bg-purple-50' },
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
  amelioration: { label: 'Amélioration', icon: Inbox, color: 'text-blue-600 bg-blue-50' },
  autre: { label: 'Autre', icon: MessageCircle, color: 'text-gray-600 bg-gray-50' },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  read: { label: 'Lu', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700' },
};

function loadLocalFeedback(): FeedbackItem[] {
  try {
    const stored = localStorage.getItem('delikreol_feedback');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalFeedback(items: FeedbackItem[]) {
  localStorage.setItem('delikreol_feedback', JSON.stringify(items));
}

function getTypeIcon(type: FeedbackType) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.autre;
  const Icon = config.icon;
  return Icon;
}

export function AdminFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFeedback = async () => {
    setLoading(true);
    setLoadError(null);

    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id,type,description,email,phone,page_url,attachment_url,attachment_name,status,created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems((data || []) as FeedbackItem[]);
        setSource('supabase');
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn('[AdminFeedback] Supabase load failed, fallback localStorage', err);
        setLoadError(err?.message || 'Lecture Supabase impossible. Affichage local uniquement.');
      }
    }

    setItems(loadLocalFeedback().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setSource('local');
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Signalements — Admin DeliKreol';
    loadFeedback();
  }, []);

  const updateStatus = async (id: string, newStatus: FeedbackStatus) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setItems(updated);

    if (source === 'supabase' && isSupabaseConfigured && !isDemoMode) {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) {
        console.warn('[AdminFeedback] Update failed', error);
        setLoadError(error.message);
      }
    } else {
      saveLocalFeedback(updated);
    }
  };

  const markAsRead = (id: string) => updateStatus(id, 'read');
  const markAsResolved = (id: string) => updateStatus(id, 'resolved');

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.status === filter);

  const countByStatus = (status: FeedbackStatus) =>
    items.filter((item) => item.status === status).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Signalements & problèmes</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Source : {source === 'supabase' ? 'Supabase' : 'localStorage'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            {items.length} message{items.length !== 1 ? 's' : ''}
            {' · '}
            <span className="text-blue-600 font-semibold">{countByStatus('new')} nouveau</span>
            {' · '}
            <span className="text-green-600 font-semibold">{countByStatus('resolved')} résolu</span>
          </div>
          <button
            onClick={loadFeedback}
            className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            Actualiser
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'new', 'read', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all'
              ? 'Tous'
              : STATUS_CONFIG[f]?.label || f}
            {f !== 'all' && ` (${countByStatus(f)})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-muted-foreground">Chargement des signalements…</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <Inbox size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'Aucun signalement pour le moment.'
              : `Aucun signalement avec le statut "${STATUS_CONFIG[filter]?.label || filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const Icon = getTypeIcon(item.type);
            const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.autre;
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;

            return (
              <div
                key={item.id}
                className={`bg-card rounded-xl border p-4 transition ${
                  item.status === 'new' ? 'border-blue-200 shadow-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                      <Icon size={16} />
                    </div>

                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('fr', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {item.email && (
                          <a href={`mailto:${item.email}`} className="text-primary hover:underline">
                            📧 {item.email}
                          </a>
                        )}
                        {item.phone && (
                          <a href={`https://wa.me/${item.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:underline">
                            <Phone size={13} /> {item.phone}
                          </a>
                        )}
                        {item.page_url && (
                          <a href={item.page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink size={13} /> Page concernée
                          </a>
                        )}
                      </div>

                      {item.attachment_url && (
                        <p className="text-xs">
                          <a
                            href={item.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            📎 Voir la pièce jointe {item.attachment_name ? `(${item.attachment_name})` : ''}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1">
                    {item.status === 'new' && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        title="Marquer comme lu"
                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => markAsResolved(item.id)}
                        title="Marquer comme résolu"
                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {item.status === 'resolved' && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        title="Réouvrir"
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;
