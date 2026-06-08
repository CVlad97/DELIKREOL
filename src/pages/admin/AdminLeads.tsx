import { useEffect, useState } from 'react';

function load(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function AdminLeads() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Leads — Admin DeliKreol';
    setItems(load('delikreol_leads'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Leads</h1>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <p className="text-muted-foreground">Aucun lead pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Besoin</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-muted/10">
              <td className="px-4 py-3 text-sm">{item.source || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.name || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.phone || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.need || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr') : '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                      {item.status || 'nouveau'}
                    </span>
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

export default AdminLeads;
