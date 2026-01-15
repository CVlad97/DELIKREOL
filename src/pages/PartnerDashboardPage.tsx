import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Clock, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getStorageProvider, PartnerDocument } from '../lib/storageProvider';

export function PartnerDashboardPage() {
  const { user, profile } = useAuth();
  const { showError, showSuccess } = useToast();
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<'haccp' | 'rcpro'>('haccp');
  const [expiryDate, setExpiryDate] = useState('');

  const storageProvider = getStorageProvider();

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docs = await storageProvider.getDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      showError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      showError('Format non autorisé. Acceptés : PDF, PNG, JPG');
      return false;
    }
    if (file.size > maxSize) {
      showError('Fichier trop volumineux (max 10MB)');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) {
      showError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      const doc = await storageProvider.uploadDocument(
        user.id,
        selectedDocType,
        selectedFile,
        expiryDate || undefined
      );
      setDocuments(prev => {
        // Remove old doc of same type
        const filtered = prev.filter(d => d.doc_type !== selectedDocType);
        return [...filtered, doc];
      });
      setSelectedFile(null);
      setExpiryDate('');
      showSuccess('Document téléchargé avec succès');
    } catch (err) {
      console.error('Error uploading document:', err);
      showError('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: 'pending' | 'validated' | 'expired') => {
    try {
      await storageProvider.updateDocumentStatus(docId, newStatus);
      setDocuments(prev =>
        prev.map(d => (d.id === docId ? { ...d, status: newStatus } : d))
      );
      showSuccess('Statut mis à jour');
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    try {
      await storageProvider.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      showSuccess('Document supprimé');
    } catch (err) {
      console.error('Error deleting document:', err);
      showError('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle2 size={14} />
            Validé
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <AlertCircle size={14} />
            Expiré
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock size={14} />
            En attente
          </div>
        );
    }
  };

  const getDocTypeLabel = (type: 'haccp' | 'rcpro') => {
    return type === 'haccp' ? 'Attestation HACCP' : 'Assurance RC Professionnelle';
  };

  const getExistingDoc = (type: 'haccp' | 'rcpro') => documents.find(d => d.doc_type === type);

  if (!user || profile?.user_type !== 'vendor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Accès refusé</h2>
          <p className="text-slate-400">
            Cette page est réservée aux partenaires vendeurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-emerald-400">
            Tableau de bord partenaire
          </h1>
          <p className="text-slate-400 text-lg">
            Gérez vos certifications et documents
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-100 mb-2">Mode démo actif</h3>
              <p className="text-blue-200 text-sm">
                Les documents sont stockés localement dans votre navigateur. Ils ne sont pas conservés sur un serveur.
                En production, les fichiers seront sécurisés via Supabase Storage.
              </p>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* HACCP Document */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <FileText size={24} />
                Attestation HACCP
              </h2>
              <p className="text-slate-400 text-sm">
                Formation hygiène et sécurité alimentaire
              </p>
            </div>

            {getExistingDoc('haccp') ? (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Statut</span>
                    {getStatusBadge(getExistingDoc('haccp')!.status)}
                  </div>
                  {getExistingDoc('haccp')!.uploaded_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Téléchargé le</span>
                      <span className="text-slate-200">
                        {new Date(getExistingDoc('haccp')!.uploaded_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {getExistingDoc('haccp')!.file_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Fichier</span>
                      <span className="text-slate-200 truncate">{getExistingDoc('haccp')!.file_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={getExistingDoc('haccp')!.status}
                    onChange={(e) => handleStatusChange(getExistingDoc('haccp')!.id, e.target.value as any)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="validated">Validé</option>
                    <option value="expired">Expiré</option>
                  </select>
                  <button
                    onClick={() => handleDelete(getExistingDoc('haccp')!.id)}
                    className="px-3 py-2 bg-red-900/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedDocType('haccp')}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 text-center py-8">
                <p className="text-slate-400 text-sm mb-4">Aucun document téléchargé</p>
                <button
                  onClick={() => setSelectedDocType('haccp')}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Téléverser HACCP
                </button>
              </div>
            )}
          </div>

          {/* RC Pro Document */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-orange-400 mb-2 flex items-center gap-2">
                <FileText size={24} />
                Assurance RC Pro
              </h2>
              <p className="text-slate-400 text-sm">
                Responsabilité civile professionnelle à jour
              </p>
            </div>

            {getExistingDoc('rcpro') ? (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Statut</span>
                    {getStatusBadge(getExistingDoc('rcpro')!.status)}
                  </div>
                  {getExistingDoc('rcpro')!.uploaded_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Téléchargé le</span>
                      <span className="text-slate-200">
                        {new Date(getExistingDoc('rcpro')!.uploaded_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {getExistingDoc('rcpro')!.expires_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Expire le</span>
                      <span className="text-slate-200">
                        {new Date(getExistingDoc('rcpro')!.expires_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {getExistingDoc('rcpro')!.file_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Fichier</span>
                      <span className="text-slate-200 truncate">{getExistingDoc('rcpro')!.file_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={getExistingDoc('rcpro')!.status}
                    onChange={(e) => handleStatusChange(getExistingDoc('rcpro')!.id, e.target.value as any)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="validated">Validé</option>
                    <option value="expired">Expiré</option>
                  </select>
                  <button
                    onClick={() => handleDelete(getExistingDoc('rcpro')!.id)}
                    className="px-3 py-2 bg-red-900/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedDocType('rcpro')}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 text-center py-8">
                <p className="text-slate-400 text-sm mb-4">Aucun document téléchargé</p>
                <button
                  onClick={() => setSelectedDocType('rcpro')}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Téléverser Assurance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400 flex items-center gap-2">
            <Upload size={24} />
            Téléverser un document
          </h2>

          <div className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Type de document
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedDocType('haccp')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDocType === 'haccp'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-slate-100">Attestation HACCP</p>
                  <p className="text-xs text-slate-400 mt-1">Formation hygiène alimentaire</p>
                </button>
                <button
                  onClick={() => setSelectedDocType('rcpro')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDocType === 'rcpro'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-slate-100">Assurance RC Pro</p>
                  <p className="text-xs text-slate-400 mt-1">Responsabilité civile</p>
                </button>
              </div>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Fichier (PDF, PNG, JPG - max 10MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center bg-slate-800/50 hover:border-slate-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-200 font-medium">
                    {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">ou glissez-déposez un fichier</p>
                </div>
              </div>
            </div>

            {/* Expiry Date (for RC Pro) */}
            {selectedDocType === 'rcpro' && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                uploading || !selectedFile
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
              }`}
            >
              <Upload size={20} />
              {uploading ? 'Téléchargement...' : 'Téléverser le document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
