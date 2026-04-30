import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  buildCompliance,
  getRoleRequirements,
  getStorageProvider,
  PartnerDocument,
  PartnerDocumentRequirement,
  PartnerDocumentStatus,
  PartnerDocumentType,
  PartnerRole,
} from '../lib/storageProvider';

const statusLabels: Record<PartnerDocumentStatus, string> = {
  missing: 'Manquant',
  uploaded: 'Déposé',
  under_review: 'En contrôle',
  approved: 'Validé',
  rejected: 'Rejeté',
  expired: 'Expiré',
};

const statusStyles: Record<PartnerDocumentStatus, string> = {
  missing: 'bg-slate-800 text-slate-300 border-slate-700',
  uploaded: 'bg-blue-500/10 text-blue-200 border-blue-500/30',
  under_review: 'bg-amber-500/10 text-amber-200 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-200 border-red-500/30',
  expired: 'bg-orange-500/10 text-orange-200 border-orange-500/30',
};

function isPartnerRole(role: unknown): role is PartnerRole {
  return role === 'vendor' || role === 'driver' || role === 'relay_host';
}

function getLatestDocument(documents: PartnerDocument[], type: PartnerDocumentType) {
  return documents
    .filter((document) => document.document_type === type)
    .sort((a, b) => (b.uploaded_at ?? '').localeCompare(a.uploaded_at ?? ''))[0];
}

function StatusBadge({ status }: { status: PartnerDocumentStatus }) {
  const Icon = status === 'approved' ? CheckCircle2 : status === 'rejected' || status === 'expired' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${statusStyles[status]}`}>
      <Icon size={14} />
      {statusLabels[status]}
    </span>
  );
}

export function PartnerDashboardPage() {
  const { user, profile } = useAuth();
  const { showError, showSuccess } = useToast();
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<PartnerDocumentType | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<PartnerDocumentType, File>>>({});
  const [expiresAt, setExpiresAt] = useState<Partial<Record<PartnerDocumentType, string>>>({});

  const role = isPartnerRole(profile?.user_type) ? profile.user_type : null;
  const requirements = useMemo(() => getRoleRequirements(role), [role]);
  const compliance = useMemo(() => (role ? buildCompliance(role, documents) : null), [documents, role]);
  const storageProvider = getStorageProvider();

  useEffect(() => {
    if (!user || !role) return;
    loadDocuments();
  }, [user, role]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docs = await storageProvider.getDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading partner documents:', error);
      showError('Impossible de charger les documents partenaire');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showError('Format non autorisé. Acceptés : PDF, PNG, JPG, TXT.');
      return false;
    }

    if (file.size > maxSize) {
      showError('Fichier trop volumineux. Limite : 10 Mo.');
      return false;
    }

    return true;
  };

  const handleFileChange = (requirement: PartnerDocumentRequirement, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) {
      setSelectedFiles((current) => ({ ...current, [requirement.type]: undefined }));
      return;
    }
    setSelectedFiles((current) => ({ ...current, [requirement.type]: file }));
  };

  const handleUpload = async (requirement: PartnerDocumentRequirement) => {
    if (!user || !role) return;
    const file = selectedFiles[requirement.type];
    if (!file) {
      showError('Sélectionnez un fichier avant dépôt.');
      return;
    }

    try {
      setUploadingType(requirement.type);
      const document = await storageProvider.uploadDocument({
        userId: user.id,
        role,
        documentType: requirement.type,
        file,
        expiresAt: expiresAt[requirement.type] || undefined,
      });
      setDocuments((current) => [
        document,
        ...current.filter((item) => item.document_type !== requirement.type),
      ]);
      setSelectedFiles((current) => ({ ...current, [requirement.type]: undefined }));
      showSuccess('Document déposé. Statut : en contrôle.');
    } catch (error) {
      console.error('Error uploading partner document:', error);
      showError('Impossible de déposer le document.');
    } finally {
      setUploadingType(null);
    }
  };

  if (!user || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-50">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-300" />
          <h1 className="text-2xl font-black">Accès partenaire requis</h1>
          <p className="mt-3 text-sm text-red-100">
            Cette page est réservée aux vendeurs, livreurs et points relais connectés.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-300">
        Chargement des documents...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6efe7] text-[#24140d]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="rounded-[2rem] bg-[#24140d] p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-200">Portail partenaire</p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">Mes documents</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50/80">
                Les pièces demandées dépendent de votre rôle. Les documents sensibles sont stockés en bucket privé.
                Les photos produits publiques restent séparées.
              </p>
            </div>
            {compliance && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-100">Conformité</p>
                <p className="mt-2 text-2xl font-black">{compliance.approved}/{compliance.total}</p>
                <p className="text-sm text-orange-50/75">
                  {compliance.status === 'complete' && 'Dossier complet'}
                  {compliance.status === 'incomplete' && 'Pièces manquantes'}
                  {compliance.status === 'needs_review' && 'Contrôle admin requis'}
                  {compliance.status === 'rejected' && 'Correction demandée'}
                  {compliance.status === 'expired' && 'Pièce expirée'}
                </p>
              </div>
            )}
          </div>
        </section>

        {compliance && compliance.missing.length > 0 && (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="font-black text-amber-950">Pièces encore manquantes</h2>
                <p className="mt-1 text-sm text-amber-900">
                  {compliance.missing.map((item) => item.label).join(', ')}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {requirements.map((requirement) => {
            const document = getLatestDocument(documents, requirement.type);
            const status = document?.verification_status ?? 'missing';
            const selectedFile = selectedFiles[requirement.type];

            return (
              <article key={requirement.type} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{requirement.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#6f5b4b]">{requirement.description}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className={`rounded-full px-3 py-1 ${requirement.sensitive ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {requirement.sensitive ? 'Stockage privé' : 'Public possible'}
                  </span>
                  {requirement.expires && (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">Expiration suivie</span>
                  )}
                </div>

                {document && (
                  <div className="mt-5 rounded-2xl bg-[#fff8ef] p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-[#6f5b4b]">Fichier</span>
                      <span className="truncate font-black">{document.file_name ?? 'Document déposé'}</span>
                    </div>
                    {document.uploaded_at && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-bold text-[#6f5b4b]">Dépôt</span>
                        <span>{new Date(document.uploaded_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {document.expires_at && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1 font-bold text-[#6f5b4b]"><Calendar size={14} /> Expiration</span>
                        <span>{new Date(document.expires_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {document.review_note && (
                      <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-red-800">
                        <span className="font-black">Commentaire admin : </span>
                        {document.review_note}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black">Déposer / remplacer</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      onChange={(event) => handleFileChange(requirement, event)}
                      className="block w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm"
                    />
                  </label>

                  {requirement.expires && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-black">Date d’expiration</span>
                      <input
                        type="date"
                        value={expiresAt[requirement.type] ?? ''}
                        onChange={(event) => setExpiresAt((current) => ({ ...current, [requirement.type]: event.target.value }))}
                        className="block w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm"
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    disabled={!selectedFile || uploadingType === requirement.type}
                    onClick={() => handleUpload(requirement)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Upload size={18} />
                    {uploadingType === requirement.type ? 'Dépôt en cours...' : 'Déposer la pièce'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="font-black text-emerald-950">Principe de minimisation</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                DELIKREOL ne demande que les pièces nécessaires au rôle sélectionné. Aucun document sensible n’est
                exposé publiquement ; les fichiers privés nécessitent une lecture authentifiée ou une URL signée.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
