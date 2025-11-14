import { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Package,
  Edit3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface ClientRequest {
  id: string;
  user_id: string;
  address: string;
  delivery_preference: string;
  request_details: string;
  preferred_time: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone?: string;
  };
}

export function AdminRequests() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('client_requests')
        .select('*, profiles(full_name, phone)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('client_requests')
        .update({ status: newStatus, admin_notes: adminNotes || undefined })
        .eq('id', requestId);

      if (error) throw error;

      showSuccess(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
      setSelectedRequest(null);
      setAdminNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Erreur lors de la mise à jour');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const statsCounts = {
    all: requests.length,
    pending_admin_review: requests.filter((r) => r.status === 'pending_admin_review').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Demandes Clients</h1>
        <p className="text-slate-400">
          Gérez les demandes de livraison et conciergerie des clients
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'all'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-slate-50">{statsCounts.all}</div>
          <div className="text-sm text-slate-400">Total</div>
        </button>

        <button
          onClick={() => setFilter('pending_admin_review')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'pending_admin_review'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-400">{statsCounts.pending_admin_review}</div>
          <div className="text-sm text-slate-400">En attente</div>
        </button>

        <button
          onClick={() => setFilter('in_progress')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'in_progress'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-blue-400">{statsCounts.in_progress}</div>
          <div className="text-sm text-slate-400">En cours</div>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'completed'
              ? 'border-green-500 bg-green-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="text-2xl font-bold text-green-400">{statsCounts.completed}</div>
          <div className="text-sm text-slate-400">Terminées</div>
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
      ) : requests.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Aucune demande</h3>
          <p className="text-slate-500">
            {filter === 'all'
              ? 'Aucune demande client pour le moment'
              : `Aucune demande avec le statut "${getStatusLabel(filter)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50">
                      {request.profiles?.full_name || 'Client'}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-slate-400">
                  {new Date(request.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{request.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">
                      {request.delivery_preference === 'home_delivery' ? '🏠 Domicile' : '📦 Point relais'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{request.preferred_time}</span>
                  </div>
                  {request.profiles?.phone && (
                    <div className="text-sm">
                      <span className="text-slate-400">Téléphone:</span>
                      <span className="text-slate-300 ml-2">{request.profiles.phone}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-3 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Détails de la demande:</div>
                  <p className="text-sm text-slate-200">{request.request_details}</p>
                </div>
              </div>

              {request.admin_notes && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
                    <Edit3 className="w-4 h-4" />
                    Notes admin
                  </div>
                  <p className="text-slate-300 text-sm">{request.admin_notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {request.status === 'pending_admin_review' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes(request.admin_notes || '');
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Prendre en charge
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, 'cancelled')}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                      Annuler
                    </button>
                  </>
                )}

                {request.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => updateStatus(request.id, 'completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Marquer comme terminée
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes(request.admin_notes || '');
                      }}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                    >
                      Modifier notes
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">
              Mettre à jour la demande
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes admin (optionnel)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: Client recontacté, livraison prévue demain 14h..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                {selectedRequest.status === 'pending_admin_review' && (
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'in_progress')}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Passer en cours
                  </button>
                )}
                {selectedRequest.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'completed')}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Marquer terminée
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
