import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ClientRequest {
  id: string;
  address: string;
  delivery_preference: string;
  request_details: string;
  preferred_time: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}

export function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
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
        return <Package className="w-5 h-5 text-slate-400" />;
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

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Aucune demande
        </h3>
        <p className="text-slate-400">
          Vous n'avez pas encore fait de demande. Créez-en une ci-dessus!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-50 mb-4">
        Mes Demandes
      </h2>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-slate-900 rounded-lg p-4 border border-slate-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(request.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Adresse:</span>
                <span className="text-slate-200 ml-2">{request.address}</span>
              </div>
              <div>
                <span className="text-slate-400">Livraison:</span>
                <span className="text-slate-200 ml-2">
                  {request.delivery_preference === 'home_delivery' ? '🏠 Domicile' : '📦 Point relais'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Créneau:</span>
                <span className="text-slate-200 ml-2">{request.preferred_time}</span>
              </div>
              <div>
                <span className="text-slate-400">Détails:</span>
                <p className="text-slate-200 mt-1 bg-slate-800 p-2 rounded">
                  {request.request_details}
                </p>
              </div>

              {request.admin_notes && (
                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
                  <span className="text-emerald-400 font-medium text-xs">Note de l'équipe:</span>
                  <p className="text-slate-200 text-xs mt-1">{request.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
