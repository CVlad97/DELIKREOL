import { useEffect, useState } from 'react';

function load(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function AdminRelais() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Candidatures points relais — Admin DeliKreol';
    setItems(load('delikreol_relay_applications'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Candidatures points relais</h1>
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <p className="text-muted-foreground">Aucune candidature point relais pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Lieu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Commune</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-muted/10">
              <td className="px-4 py-3 text-sm">{item.placeName || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.ownerName || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.commune || '—'}</td>
              <td className="px-4 py-3 text-sm">{item.phone || '—'}</td>
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

export default AdminRelais;
