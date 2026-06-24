import { useEffect, useState } from 'react';
import { supabase, isDemoMode, isSupabaseConfigured } from '../../lib/supabase';

function loadLocal(): any[] {
  try { return JSON.parse(localStorage.getItem('delikreol_driver_applications') || '[]'); }
  catch { return []; }
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function AdminLivreurs() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { data, error: dbError } = await supabase
          .from('driver_applications')
          .select('id,name,phone,whatsapp,email,commune,transport_mode,zones_acceptees,disponibilite,horaires,experience_livraison,status,created_at')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setItems(data || []);
        setSource('supabase');
        setLoading(false);
        return;
      } catch (err: any) {
        console.warn('[AdminLivreurs] Supabase load failed', err);
        setError(err?.message || 'Lecture Supabase impossible. Affichage local uniquement.');
      }
    }

    setItems(loadLocal().sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()));
    setSource('local');
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Candidatures livreurs — Admin DeliKreol';
    void loadApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));

    if (source === 'supabase' && isSupabaseConfigured && !isDemoMode) {
      const { error: dbError } = await supabase
        .from('driver_applications')
        .update({ status })
        .eq('id', id);
      if (dbError) setError(dbError.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Candidatures livreurs</h1>
          <p className="mt-1 text-xs text-muted-foreground">Source : {source === 'supabase' ? 'Supabase' : 'localStorage'}</p>
        </div>
        <button onClick={loadApplications} className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">
          Actualiser
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

      {loading ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-muted-foreground">Chargement des candidatures…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <p className="text-muted-foreground">Aucune candidature livreur pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Commune</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Transport</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Zones</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any) => {
                const phone = item.phone || item.telephone;
                const name = item.name || item.nom || '—';
                const transport = item.transport_mode || item.transportMode || item.moyenTransport || '—';
                const zones = item.zones_acceptees || item.zonesAcceptees || [];
                const created = item.created_at || item.createdAt;

                return (
                  <tr key={item.id} className="hover:bg-muted/10 align-top">
                    <td className="px-4 py-3 text-sm font-semibold">{name}</td>
                    <td className="px-4 py-3 text-sm">{item.commune || '—'}</td>
                    <td className="px-4 py-3 text-sm">{transport}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        {phone ? <a className="block text-green-700 hover:underline" href={`https://wa.me/${String(phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{phone}</a> : '—'}
                        {item.email && <a className="block text-primary hover:underline" href={`mailto:${item.email}`}>{item.email}</a>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs">{Array.isArray(zones) && zones.length ? zones.join(', ') : '—'}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(created)}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={item.status || 'candidat'}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700"
                      >
                        <option value="candidat">Candidat</option>
                        <option value="a_appeler">À appeler</option>
                        <option value="documents">Documents</option>
                        <option value="valide">Validé</option>
                        <option value="suspendu">Suspendu</option>
                        <option value="inactif">Inactif</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminLivreurs;
