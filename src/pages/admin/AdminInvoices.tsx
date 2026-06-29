import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setInvoices(data || []);
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Factures</h1>
        <p className="text-sm text-muted-foreground">Module facturation Qonto-ready (en construction)</p>
      </div>

      {loading && <div>Chargement...</div>}

      <div className="rounded-2xl border bg-card p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">N° Facture</th>
              <th>Client</th>
              <th>Total TTC</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  Aucune facture pour le moment. Le système est prêt à générer des factures à partir des commandes.
                </td>
              </tr>
            )}
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b">
                <td className="py-3 font-mono">{inv.invoice_number || inv.id.split('-')[0]}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.total_ttc} {inv.currency}</td>
                <td>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        Prochaines étapes :
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Génération automatique des factures depuis les commandes validées</li>
          <li>Export CSV + PDF</li>
          <li>Synchronisation Qonto (Edge Function)</li>
          <li>Reversements aux partenaires (payouts)</li>
        </ul>
      </div>
    </div>
  );
}