import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import {
  Loader,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  Store,
  Utensils,
  DollarSign,
  Eye,
  Download,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface CatererApplication {
  id: string;
  name: string;
  business_name: string;
  email: string | null;
  phone: string;
  commune: string;
  activity_type: string;
  description: string | null;
  bio: string | null;
  specialties: string[] | null;
  prix_depart: string | null;
  temps_preparation: string | null;
  heure_limite: string | null;
  creneaux: string[] | null;
  instagram: string | null;
  facebook: string | null;
  site_web: string | null;
  logo_url: string | null;
  photo_urls: string[] | null;
  photo_descriptions: string[] | null;
  status: string;
  reject_reason: string | null;
  created_at: string;
  read_at: string | null;
}

interface RejectDialogState {
  open: boolean;
  application: CatererApplication | null;
  reason: string;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  new: { label: 'Nouveau', class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  contacted: { label: 'Contacté', class: 'bg-blue-100 text-blue-800 border-blue-300' },
  a_verifier: { label: 'À vérifier', class: 'bg-blue-100 text-blue-800 border-blue-300' },
  validated: { label: 'Validé', class: 'bg-green-100 text-green-800 border-green-300' },
  integrated: { label: 'Intégré', class: 'bg-green-100 text-green-800 border-green-300' },
  refused: { label: 'Refusé', class: 'bg-red-100 text-red-800 border-red-300' },
};

const WHATSAPP_ADMIN = '596696653589';

export default function AdminCatererValidation() {
  const [applications, setApplications] = useState<CatererApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false,
    application: null,
    reason: '',
  });
  const [photoViewer, setPhotoViewer] = useState<{ urls: string[]; index: number } | null>(null);
  const { showToast } = useToast();

  const loadApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('activity_type', 'traiteur')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading caterer applications:', error);
      showToast('Erreur lors du chargement des candidatures traiteurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const updateStatus = async (id: string, status: string, rejectReason?: string) => {
    try {
      const updates: Record<string, unknown> = { status };

      const app = applications.find((a) => a.id === id);
      if (!app?.read_at) {
        updates.read_at = new Date().toISOString();
      }

      if (status === 'refused' && rejectReason) {
        updates.reject_reason = rejectReason;
      } else if (status !== 'refused') {
        updates.reject_reason = null;
      }

      const { error } = await supabase
        .from('partner_applications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadApplications();

      const statusLabel = STATUS_CONFIG[status]?.label || status;
      showToast(`Candidature marquée comme "${statusLabel}"`, 'success');
    } catch (error) {
      console.error('Error updating application:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleValidate = async (app: CatererApplication) => {
    await updateStatus(app.id, 'integrated');
  };

  const handleRefuse = () => {
    if (!rejectDialog.application || !rejectDialog.reason.trim()) {
      showToast('Veuillez saisir un motif de refus', 'error');
      return;
    }
    updateStatus(rejectDialog.application.id, 'refused', rejectDialog.reason.trim());
    setRejectDialog({ open: false, application: null, reason: '' });
  };

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const number = cleaned.startsWith('596') ? cleaned : `596${cleaned.replace(/^0+/, '')}`;
    return `https://wa.me/${number}`;
  };

  const getWhatsAppAdminLink = () => `https://wa.me/${WHATSAPP_ADMIN}`;

  const exportCSV = () => {
    const rows = filteredApplications.map((app) => [
      app.business_name,
      app.name,
      app.phone,
      app.commune,
      (app.specialties || []).join('; '),
      app.prix_depart || '',
      STATUS_CONFIG[app.status]?.label || app.status,
      new Date(app.created_at).toLocaleDateString('fr-FR'),
      app.reject_reason || '',
    ]);

    const header = ['Entreprise', 'Responsable', 'Téléphone', 'Commune', 'Spécialités', 'Prix', 'Statut', 'Date', 'Motif refus'];
    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatures_traiteurs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV téléchargé', 'success');
  };

  const statusFilters = [
    { key: 'all', label: 'Toutes' },
    { key: 'new', label: 'Nouveau' },
    { key: 'a_verifier', label: 'À vérifier' },
    { key: 'integrated', label: 'Intégré' },
    { key: 'refused', label: 'Refusé' },
  ];

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'new').length,
    a_verifier: applications.filter((a) => a.status === 'a_verifier').length,
    integrated: applications.filter((a) => a.status === 'integrated').length,
    refused: applications.filter((a) => a.status === 'refused').length,
  };

  const filteredApplications = applications.filter((app) => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        app.business_name.toLowerCase().includes(term) ||
        app.name.toLowerCase().includes(term) ||
        app.phone.includes(term) ||
        app.commune.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Validation traiteurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les candidatures des traiteurs —{' '}
            <a
              href={getWhatsAppAdminLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              contacter le support
            </a>
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <div className="text-xs text-yellow-700 mb-1">Nouveau</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.new}</div>
        </div>
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
          <div className="text-xs text-blue-700 mb-1">À vérifier</div>
          <div className="text-2xl font-bold text-blue-900">{stats.a_verifier}</div>
        </div>
        <div className="bg-green-50 border border-green-300 rounded-xl p-4">
          <div className="text-xs text-green-700 mb-1">Intégré</div>
          <div className="text-2xl font-bold text-green-900">{stats.integrated}</div>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="text-xs text-red-700 mb-1">Refusé</div>
          <div className="text-2xl font-bold text-red-900">{stats.refused}</div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, commune..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const count = stats[f.key as keyof typeof stats] ?? 0;
          const isActive = filter === f.key;
          const bgMap: Record<string, string> = {
            all: '',
            new: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            a_verifier: 'bg-blue-100 border-blue-300 text-blue-800',
            integrated: 'bg-green-100 border-green-300 text-green-800',
            refused: 'bg-red-100 border-red-300 text-red-800',
          };
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isActive
                  ? bgMap[f.key] || 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Application cards */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune candidature traiteur à afficher</p>
            <p className="text-sm mt-1">Les inscriptions de traiteurs apparaîtront ici.</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div
              key={app.id}
              className={`bg-card border rounded-2xl overflow-hidden transition-colors ${
                app.status === 'new' ? 'border-yellow-300' :
                app.status === 'refused' ? 'border-red-300' :
                app.status === 'integrated' ? 'border-green-300' :
                'border-border'
              }`}
            >
              {/* Main info row */}
              <div className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={app.business_name}
                        className="w-14 h-14 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-border">
                        <Store className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">{app.business_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_CONFIG[app.status]?.class || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                        {STATUS_CONFIG[app.status]?.label || app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{app.name || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{app.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{app.commune}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{new Date(app.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}</span>
                      </div>
                    </div>

                    {/* Specialties & Price */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {app.specialties && app.specialties.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                          <Utensils className="w-3 h-3" />
                          {app.specialties.join(', ')}
                        </span>
                      )}
                      {app.prix_depart && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                          <DollarSign className="w-3 h-3" />
                          À partir de {app.prix_depart} €
                        </span>
                      )}
                    </div>

                    {/* Description / Bio */}
                    {app.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{app.description}</p>
                    )}

                    {/* Photos */}
                    {app.photo_urls && app.photo_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {app.photo_urls.slice(0, 4).map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPhotoViewer({ urls: app.photo_urls!, index: idx })}
                            className="w-14 h-14 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0"
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {app.photo_urls.length > 4 && (
                          <button
                            onClick={() => setPhotoViewer({ urls: app.photo_urls!, index: 0 })}
                            className="w-14 h-14 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted/80 transition-colors"
                          >
                            +{app.photo_urls.length - 4}
                          </button>
                        )}
                        <a
                          href={app.photo_urls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                          title="Voir en grand"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                    {(app.status === 'new' || app.status === 'contacted' || app.status === 'a_verifier') && (
                      <>
                        <button
                          onClick={() => handleValidate(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors"
                          title="Valider → Intégré"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Valider
                        </button>
                        <button
                          onClick={() => setRejectDialog({ open: true, application: app, reason: '' })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
                          title="Refuser"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </>
                    )}
                    {app.status === 'refused' && (
                      <button
                        onClick={() => updateStatus(app.id, 'new')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold transition-colors"
                        title="Réouvrir"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Réouvrir
                      </button>
                    )}
                    <a
                      href={getWhatsAppLink(app.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors"
                      title="Contacter par WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Reject reason */}
                {app.status === 'refused' && app.reject_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <span className="font-semibold">Motif du refus :</span> {app.reject_reason}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Photo viewer modal */}
      {photoViewer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPhotoViewer(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPhotoViewer(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
            >
              Fermer ✕
            </button>
            <img
              src={photoViewer.urls[photoViewer.index]}
              alt="Photo traiteur"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {photoViewer.urls.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setPhotoViewer((prev) =>
                      prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : null
                    )
                  }
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium backdrop-blur transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-white/80 text-sm">
                  {photoViewer.index + 1} / {photoViewer.urls.length}
                </span>
                <button
                  onClick={() =>
                    setPhotoViewer((prev) =>
                      prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : null
                    )
                  }
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium backdrop-blur transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {rejectDialog.open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setRejectDialog({ open: false, application: null, reason: '' })}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground mb-2">Refuser la candidature</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Motif du refus pour <strong>{rejectDialog.application?.business_name}</strong>
            </p>
            <textarea
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Saisissez le motif du refus..."
              rows={3}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-500 outline-none transition resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setRejectDialog({ open: false, application: null, reason: '' })}
                className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRefuse}
                disabled={!rejectDialog.reason.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        Contact :{' '}
        <a href="mailto:contact@delikreol.mq" className="text-primary hover:underline">
          contact@delikreol.mq
        </a>
        {' · '}
        <a href={getWhatsAppAdminLink()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// Inline UserIcon since lucide doesn't export one
function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}