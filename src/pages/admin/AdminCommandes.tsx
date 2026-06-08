import { useEffect, useState } from 'react';

function load(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function AdminCommandes() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Commandes — Admin DeliKreol';
    setItems(load('delikreol_orders'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Commandes</h1>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <p className="text-muted-foreground">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Commune</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-muted/10">
              <td className="px-4 py-3 text-sm">{item.customerName || item.name || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.commune || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.orderMode || item.mode || '—'}</td>
              <td className="px-4 py-3 text-sm">{(item.subtotal || item.total || 0) + ' €'}</td>
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

export default AdminCommandes;
