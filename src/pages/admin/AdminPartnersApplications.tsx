import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import {
  Loader,
  MessageCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Store,
  User,
} from 'lucide-react';

interface PartnerApplication {
  id: string;
  name: string;
  business_name: string;
  email: string | null;
  phone: string;
  commune: string;
  activity_type: string;
  description: string | null;
  status: 'new' | 'contacted' | 'validated';
  created_at: string;
  read_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  new: { label: 'Nouveau', class: 'badge badge-warning' },
  contacted: { label: 'Contacté', class: 'badge badge-info' },
  validated: { label: 'Validé', class: 'badge badge-success' },
};

const WHATSAPP_BASE = '596696653589';

export default function AdminPartnersApplications() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'validated'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading partner applications:', error);
      showToast('Erreur lors du chargement des candidatures', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'contacted' | 'validated') => {
    try {
      const updates: Record<string, unknown> = { status };

      // Marquer automatiquement comme lu au premier contact
      const app = applications.find((a) => a.id === id);
      if (!app?.read_at) {
        updates.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('partner_applications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadApplications();
      showToast(
        status === 'contacted'
          ? 'Candidature marquée comme contactée'
          : 'Candidature validée',
        'success'
      );
    } catch (error) {
      console.error('Error updating application:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await loadApplications();
      showToast('Candidature marquée comme lue', 'success');
    } catch (error) {
      console.error('Error marking application as read:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const number = cleaned.startsWith('596') ? cleaned : `596${cleaned.replace(/^0+/, '')}`;
    return `https://wa.me/${number}`;
  };

  const getWhatsAppSupportLink = () => {
    return `https://wa.me/${WHATSAPP_BASE}`;
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'new').length,
    contacted: applications.filter((a) => a.status === 'contacted').length,
    validated: applications.filter((a) => a.status === 'validated').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pageSection">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidatures partenaires</h1>
        <p className="text-gray-600">
          Gérez les candidatures reçues via le formulaire "Devenir partenaire" —{' '}
          <a
            href={getWhatsAppSupportLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            contacter le support
          </a>
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="card" style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
          <div className="text-sm text-amber-700 mb-1">Nouveaux</div>
          <div className="text-3xl font-bold text-amber-900">{stats.new}</div>
        </div>
        <div className="card" style={{ backgroundColor: '#dbeafe', borderColor: '#60a5fa' }}>
          <div className="text-sm text-blue-700 mb-1">Contactés</div>
          <div className="text-3xl font-bold text-blue-900">{stats.contacted}</div>
        </div>
        <div className="card" style={{ backgroundColor: '#d1fae5', borderColor: '#34d399' }}>
          <div className="text-sm text-green-700 mb-1">Validés</div>
          <div className="text-3xl font-bold text-green-900">{stats.validated}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'new', 'contacted', 'validated'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${
                  filter === f ? 'btnPrimary' : ''
                }`}
              >
                {f === 'all' && `Toutes (${stats.total})`}
                {f === 'new' && `Nouvelles (${stats.new})`}
                {f === 'contacted' && `Contactées (${stats.contacted})`}
                {f === 'validated' && `Validées (${stats.validated})`}
              </button>
            ))}
          </div>
        </div>

        {/* Applications list */}
        <div className="divide-y divide-gray-200">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune candidature à afficher
            </div>
          ) : (
            filteredApplications.map((app) => {
              const isUnread = app.status === 'new' && !app.read_at;
              return (
                <div
                  key={app.id}
                  className={`p-6 transition-colors ${
                    isUnread ? 'bg-amber-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-400" />
                          {app.business_name}
                        </h3>
                        <span className={`badge ${STATUS_CONFIG[app.status]?.class || 'badge-warning'}`}>
                          {STATUS_CONFIG[app.status]?.label || app.status}
                        </span>
                        {isUnread && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full uppercase tracking-wider">
                            Non lu
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {app.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {app.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {app.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {app.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {app.commune}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(app.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="capitalize">{app.activity_type}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {app.description && (
                        <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                          {app.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      {app.status === 'new' && (
                        <>
                          <button
                            onClick={() => markAsRead(app.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Marquer comme lu"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'contacted')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Marquer comme contacté"
                          >
                            <Phone className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {app.status === 'contacted' && (
                        <button
                          onClick={() => updateStatus(app.id, 'validated')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Valider le partenaire"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      )}
                      <a
                        href={getWhatsAppLink(app.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Contacter par WhatsApp"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-8">
        Contact support :{' '}
        <a href={`mailto:contact@delikreol.mq`} className="text-emerald-600 hover:underline">
          contact@delikreol.mq
        </a>{' '}
        ·{' '}
        <a href={getWhatsAppSupportLink()} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
          WhatsApp
        </a>
      </div>
    </div>
  );
}