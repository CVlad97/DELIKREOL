import { useState, useEffect } from 'react';
import { Store, FileText, Calendar, MapPin, CheckCircle, XCircle, AlertCircle, ExternalLink, Package } from 'lucide-react';
import {
  createPartnerDocumentAccessUrl,
  listPartnerApplications,
  getPartnerApplication,
  updatePartnerApplicationStatus,
  updatePartnerDocumentVerification,
} from '../../services/partnerOnboardingService';
import { useToast } from '../../contexts/ToastContext';
import { buildCompliance, getDocumentLabel, PartnerDocumentStatus, PartnerRole } from '../../lib/storageProvider';

export function AdminPartners() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  const loadApplications = async () => {
    setLoading(true);
    const result = await listPartnerApplications(filterStatus === 'all' ? undefined : filterStatus);
    if (result.success) {
      setApplications(result.data || []);
    } else {
      showError(result.error || 'Erreur de chargement');
    }
    setLoading(false);
  };

  const loadDetailedApplication = async (appId: string) => {
    const result = await getPartnerApplication(appId);
    if (result.success) {
      setSelectedApp(result.data);
      setAdminNotes(result.data.admin_notes || '');
    }
  };

  const handleStatusChange = async (appId: string, status: 'accepted' | 'rejected') => {
    const result = await updatePartnerApplicationStatus(appId, status, adminNotes);
    if (result.success) {
      showSuccess(`Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'}`);
      setSelectedApp(null);
      setAdminNotes('');
      loadApplications();
    } else {
      showError(result.error || 'Erreur');
    }
  };

  const handleDocumentStatus = async (
    documentId: string,
    status: 'under_review' | 'approved' | 'rejected' | 'expired'
  ) => {
    const note = status === 'rejected' ? adminNotes : undefined;
    const result = await updatePartnerDocumentVerification(documentId, status, note);
    if (result.success) {
      showSuccess('Statut document mis à jour');
      if (selectedApp) loadDetailedApplication(selectedApp.id);
    } else {
      showError(result.error || 'Erreur document');
    }
  };

  const openSecureDocument = async (doc: any) => {
    const result = await createPartnerDocumentAccessUrl(doc);
    if (result.success && result.data?.url) {
      window.open(result.data.url, '_blank', 'noopener,noreferrer');
    } else {
      showError(result.error || 'Lien sécurisé indisponible');
    }
  };

  const getDocumentStatusBadge = (status: PartnerDocumentStatus | undefined) => {
    const value = status || 'uploaded';
    const labels: Record<PartnerDocumentStatus, string> = {
      missing: 'Manquant',
      uploaded: 'Déposé',
      under_review: 'En contrôle',
      approved: 'Validé',
      rejected: 'Rejeté',
      expired: 'Expiré',
    };
    const styles: Record<PartnerDocumentStatus, string> = {
      missing: 'bg-slate-500/20 text-slate-300',
      uploaded: 'bg-blue-500/20 text-blue-300',
      under_review: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300',
      expired: 'bg-orange-500/20 text-orange-300',
    };
    return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[value]}`}>{labels[value]}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">En attente</span>;
      case 'accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Acceptée</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Refusée</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
      case 'producer':
      case 'merchant':
        return <Store className="w-5 h-5 text-orange-400" />;
      case 'relay_host':
        return <MapPin className="w-5 h-5 text-blue-400" />;
      case 'driver':
        return <Store className="w-5 h-5 text-green-400" />;
      default:
        return <Store className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      restaurant: 'Restaurant',
      producer: 'Producteur',
      merchant: 'Commerçant',
      relay_host: 'Point Relais',
      driver: 'Livreur',
      vendor: 'Vendeur',
    };
    return labels[type] || type;
  };

  const statsCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const selectedPartnerRole: PartnerRole | null = selectedApp?.business_type === 'driver'
    ? 'driver'
    : selectedApp?.business_type === 'relay_host'
      ? 'relay_host'
      : selectedApp
        ? 'vendor'
        : null;

  const selectedCompliance = selectedPartnerRole
    ? buildCompliance(selectedPartnerRole, selectedApp.partner_documents || [])
    : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Candidatures Partenaires</h1>
        <p className="text-slate-400">Évaluez les candidatures et vérifiez la conformité réglementaire</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'all'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-slate-50">{statsCounts.all}</div>
          <div className="text-sm text-slate-400">Total</div>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'pending'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-400">{statsCounts.pending}</div>
          <div className="text-sm text-slate-400">En attente</div>
        </button>

        <button
          onClick={() => setFilterStatus('accepted')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'accepted'
              ? 'border-green-500 bg-green-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-green-400">{statsCounts.accepted}</div>
          <div className="text-sm text-slate-400">Acceptées</div>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'rejected'
              ? 'border-red-500 bg-red-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-red-400">{statsCounts.rejected}</div>
          <div className="text-sm text-slate-400">Refusées</div>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Aucune candidature</h3>
          <p className="text-slate-500">
            {filterStatus === 'all' ? 'Aucune candidature pour le moment' : `Aucune candidature "${filterStatus}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => loadDetailedApplication(app.id)}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-emerald-500 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(app.business_type)}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50">{app.business_name}</h3>
                    <p className="text-sm text-slate-400">
                      {getTypeLabel(app.business_type)} • {app.zone_label || 'Zone non spécifiée'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(app.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{app.partner_documents?.length || 0} docs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>{app.partner_catalog_files?.length || 0} catalogues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{app.partner_catalog_items?.length || 0} produits</span>
                </div>
              </div>

              {app.details?.siren && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    SIREN: {app.details.siren} {app.details.siret && `• SIRET: ${app.details.siret}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-50">{selectedApp.business_name}</h2>
              {getStatusBadge(selectedApp.status)}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Informations Légales & Réglementaires
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="text-slate-200 ml-2">{getTypeLabel(selectedApp.business_type)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Zone:</span>
                    <span className="text-slate-200 ml-2">{selectedApp.zone_label}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Contact:</span>
                    <span className="text-slate-200 ml-2">{selectedApp.contact_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Téléphone:</span>
                    <span className="text-slate-200 ml-2">{selectedApp.contact_phone}</span>
                  </div>
                  {selectedApp.details?.siren && (
                    <div>
                      <span className="text-slate-400">SIREN:</span>
                      <span className="text-slate-200 ml-2 font-mono">{selectedApp.details.siren}</span>
                    </div>
                  )}
                  {selectedApp.details?.siret && (
                    <div>
                      <span className="text-slate-400">SIRET:</span>
                      <span className="text-slate-200 ml-2 font-mono">{selectedApp.details.siret}</span>
                    </div>
                  )}
                  {selectedApp.details?.legal_status && (
                    <div>
                      <span className="text-slate-400">Statut juridique:</span>
                      <span className="text-slate-200 ml-2">{selectedApp.details.legal_status}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.partner_documents && selectedApp.partner_documents.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents Administratifs ({selectedApp.partner_documents.length})
                  </h3>
                  {selectedCompliance && (
                    <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/70 p-4 text-sm text-slate-300">
                      Statut conformité : <span className="font-bold text-slate-50">{selectedCompliance.status}</span>
                      <span className="ml-2 text-slate-400">({selectedCompliance.approved}/{selectedCompliance.total} validés)</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {selectedApp.partner_documents.map((doc: any) => (
                      <div key={doc.id} className="rounded-lg bg-slate-800 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div className="min-w-0 flex-1">
                            <div className="text-slate-200 text-sm font-medium">
                              {getDocumentLabel(doc.document_type)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {doc.file_name}
                              {doc.expires_at && ` • Expire le ${new Date(doc.expires_at).toLocaleDateString('fr-FR')}`}
                            </div>
                          </div>
                          {getDocumentStatusBadge(doc.verification_status)}
                        </div>
                        {doc.review_note && (
                          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                            Note de rejet : {doc.review_note}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openSecureDocument(doc)}
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600"
                          >
                            Ouvrir lien sécurisé
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocumentStatus(doc.id, 'under_review')}
                            className="rounded-lg bg-yellow-500/20 px-3 py-2 text-sm font-bold text-yellow-200"
                          >
                            En contrôle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocumentStatus(doc.id, 'approved')}
                            className="rounded-lg bg-green-500/20 px-3 py-2 text-sm font-bold text-green-200"
                          >
                            Valider
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocumentStatus(doc.id, 'rejected')}
                            className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-bold text-red-200"
                          >
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.partner_catalog_files && selectedApp.partner_catalog_files.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Catalogues / Matrices Tarifaires ({selectedApp.partner_catalog_files.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedApp.partner_catalog_files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-slate-200 text-sm font-medium">{file.file_name}</div>
                            <div className="text-xs text-slate-400">
                              Format: {file.format.toUpperCase()}
                              {file.note && ` • ${file.note}`}
                            </div>
                          </div>
                        </div>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Télécharger
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.partner_catalog_items && selectedApp.partner_catalog_items.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-400 mb-4">
                    Produits Clés ({selectedApp.partner_catalog_items.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedApp.partner_catalog_items.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-800 rounded-lg">
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-sm text-slate-400 mt-1">
                          {item.price}€ / {item.unit}
                          {item.is_signature && ' ⭐'}
                        </div>
                        {item.category && (
                          <div className="text-xs text-slate-500 mt-1">{item.category}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-400 mb-4">Notes Admin</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={4}
                  placeholder="Notes internes sur cette candidature..."
                />
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'accepted')}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accepter la candidature
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Refuser la candidature
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedApp(null)}
                className="w-full px-6 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
