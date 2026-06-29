import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminPointsRelais() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('relay_point_applications').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('relay_point_applications').update({ status }).eq('id', id);
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Points relais</h1>
      {loading && <div>Chargement...</div>}
      <div className="rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Commerce</th>
              <th>Responsable</th>
              <th>Téléphone</th>
              <th>Commune</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucune candidature pour l’instant.</td></tr>
            )}
            {items.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3 font-medium">{r.business_name}</td>
                <td>{r.manager_name}</td>
                <td><a href={`https://wa.me/${r.phone?.replace(/\s/g,'')}`} className="text-emerald-600 hover:underline">{r.phone}</a></td>
                <td>{r.commune}</td>
                <td>
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="border rounded px-2 py-0.5 text-xs">
                    {['candidat','à_appeler','validé','suspendu','actif','inactif'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <a href={`https://wa.me/${r.phone?.replace(/\s/g,'')}`} className="text-xs px-3 py-0.5 border rounded">WhatsApp</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPointsRelais;