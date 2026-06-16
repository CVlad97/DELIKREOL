import { useEffect, useState } from 'react';
import { Bug, Lightbulb, MessageCircle, CheckCircle2, Archive, Inbox } from 'lucide-react';

type FeedbackStatus = 'new' | 'read' | 'resolved';
type FeedbackType = 'bug' | 'suggestion' | 'amelioration' | 'autre';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  description: string;
  email?: string;
  attachment_url?: string | null;
  status: FeedbackStatus;
  created_at: string;
}

const TYPE_CONFIG: Record<FeedbackType, { label: string; icon: any; color: string }> = {
  bug: { label: 'Bug', icon: Bug, color: 'text-red-600 bg-red-50' },
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
  amelioration: { label: 'Amélioration', icon: Inbox, color: 'text-blue-600 bg-blue-50' },
  autre: { label: 'Autre', icon: MessageCircle, color: 'text-gray-600 bg-gray-50' },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  read: { label: 'Lu', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700' },
};

function loadFeedback(): FeedbackItem[] {
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

function saveFeedback(items: FeedbackItem[]) {
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

  useEffect(() => {
    document.title = 'Feedback — Admin DeliKreol';
    setItems(loadFeedback());
  }, []);

  const updateStatus = (id: string, newStatus: FeedbackStatus) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setItems(updated);
    saveFeedback(updated);
  };

  const markAsRead = (id: string) => updateStatus(id, 'read');
  const markAsResolved = (id: string) => updateStatus(id, 'resolved');

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.status === filter);

  const countByStatus = (status: FeedbackStatus) =>
    items.filter((item) => item.status === status).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold">Feedback</h1>
        <div className="text-xs text-muted-foreground">
          {items.length} message{items.length !== 1 ? 's' : ''}
          {' · '}
          <span className="text-blue-600 font-semibold">{countByStatus('new')} nouveau</span>
          {' · '}
          <span className="text-green-600 font-semibold">{countByStatus('resolved')} résolu</span>
        </div>
      </div>

      {/* Filtres */}
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

      {/* Liste */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <Inbox size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'Aucun feedback pour le moment.'
              : `Aucun feedback avec le statut "${STATUS_CONFIG[filter]?.label || filter}".`}
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
                    {/* Type icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                      <Icon size={16} />
                    </div>

                    <div className="space-y-1 min-w-0">
                      {/* Type + status badges */}
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

                      {/* Description */}
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {item.description}
                      </p>

                      {/* Email */}
                      {item.email && (
                        <p className="text-xs text-muted-foreground">
                          📧{' '}
                          <a href={`mailto:${item.email}`} className="text-primary hover:underline">
                            {item.email}
                          </a>
                        </p>
                      )}

                      {/* Attachment */}
                      {item.attachment_url && (
                        <p className="text-xs">
                          <a
                            href={item.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            📎 Voir la pièce jointe
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
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