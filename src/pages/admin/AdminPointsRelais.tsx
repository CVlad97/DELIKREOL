import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

function loadLocal(): any[] {
  try { return JSON.parse(localStorage.getItem('delikreol_relay_applications') || '[]'); }
  catch { return []; }
}

function formatDate(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
}

function cleanPhone(p?: string) {
  return p?.replace(/[\s\-+]/g, '')?.replace(/^0/, '596') || '';
}

const STATUSES = ['candidat', 'a_appeler', 'valide', 'actif', 'suspendu', 'inactif'];

export function AdminPointsRelais() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status: string; commune: string }>({ status: '', commune: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    setItems([]);

    if (isSupabaseConfigured) {
      try {
        const { data, error: dbError } = await supabase
          .from('relay_point_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        if (data && data.length > 0) {
          setItems(data);
          setSource('supabase');
        } else {
          // fallback to local if no data from supabase
          const local = loadLocal();
          setItems(local);
        }
        setSource('supabase');
      } catch (error) {
        console.error('Error loading relay points:', error);
        setError('Erreur de connexion à la base de données');
      }
    } else {
      // Supabase not configured - load from localStorage
      const local = loadLocal();
      setItems(local);
      setSource('local');
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    if (source === 'supabase') {
      await supabase.from('relay_point_applications').update({ status }).eq('id', id);
    } else {
      const local = loadLocal().map((r: any) => r.id === id ? { ...r, status } : r);
      localStorage.setItem('delikreol_relay_applications', JSON.stringify(local));
    }
    load();
  };

  const updateCommune = (id: string, commune: string) => {
    const local = loadLocal().map((r: any) => r.id === id ? { ...r, commune } : r);
    localStorage.setItem('delikreol_relay_applications', JSON.stringify(local));
    load();
  };

  useEffect(() => { load(); }, []);

  // Apply filters
  const filteredItems = items.filter((r: any) => {
    if (filters.status && r.status !== filters.status) return false;
    if (filters.commune && r.commune !== filters.commune) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Points relais</h1>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${source === 'supabase' ? 'bg-success/[0.15] text-success' : 'bg-muted text-muted-foreground'}`}>
          Source: {source}
        </span>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground">Statut:</label>
          <select
            className="border rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400 bg-white"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Tous</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground">Commune:</label>
          <input
            type="text"
            className="border rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400"
            placeholder="Filtrer par commune"
            value={filters.commune}
            onChange={e => setFilters(f => ({ ...f, commune: e.target.value }))}
          />
        </div>
        <button
          onClick={() => setFilters({ status: '', commune: '' })}
          className="px-3 py-1 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {loading ? <p className="text-muted-foreground">Chargement...</p> : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Aucune candidature pour l'instant.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted text-left">
                <th className="p-3">Commerce</th>
                <th className="p-3">Responsable</th>
                <th className="p-3">Commune</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Email</th>
                <th className="p-3">Adresse</th>
                <th className="p-3">Horaires</th>
                <th className="p-3">Capacité</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Date</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{r.business_name}</td>
                  <td className="p-3 text-muted-foreground">{r.manager_name || '—'}</td>
                  <td className="p-3">{r.commune}</td>
                  <td className="p-3">{r.phone || '—'}</td>
                  <td className="p-3">
                    {r.whatsapp || r.phone ? (
                      <a href={`https://wa.me/${cleanPhone(r.whatsapp || r.phone)}`} target="_blank" rel="noopener noreferrer" className="text-success hover:underline text-xs">💬 WhatsApp</a>
                    ) : '—'}
                  </td>
                  <td className="p-3 text-xs">{r.email ? <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">{r.email}</a> : '—'}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[120px] truncate">{r.address || '—'}</td>
                  <td className="p-3 text-xs">{r.opening_hours || '—'}</td>
                  <td className="p-3 text-xs">{r.capacity || '—'}</td>
                  <td className="p-3">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                      className="border rounded-lg px-2 py-1 text-xs outline-none focus:border-orange-400 bg-white">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                  <td className="p-3">
                    {(r.whatsapp || r.phone) && (
                      <a href={`https://wa.me/${cleanPhone(r.whatsapp || r.phone)}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-all">
                        💬
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPointsRelais;