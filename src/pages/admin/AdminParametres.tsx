import { useEffect, useState } from 'react';
import { Settings, Save, AlertTriangle } from 'lucide-react';

export function AdminParametres() {
  const [settings, setSettings] = useState({
    whatsappNumber: '596696653589',
    contactEmail: 'contact@delikreol.mq',
    minDeliveryAmount: '40',
    deliveryFee: '5',
    platformName: 'DeliKreol',
    paymentActive: false,
  });

  useEffect(() => {
    document.title = 'Paramètres — Admin DeliKreol';
    const saved = localStorage.getItem('delikreol_settings');
    if (saved) {
      try { setSettings(s => ({ ...s, ...JSON.parse(saved) })); } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('delikreol_settings', JSON.stringify(settings));
    alert('Paramètres sauvegardés.');
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        Paramètres
      </h1>

      <div className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">WhatsApp principal</label>
          <input value={settings.whatsappNumber} onChange={e => setSettings(s => ({...s, whatsappNumber: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email contact</label>
          <input value={settings.contactEmail} onChange={e => setSettings(s => ({...s, contactEmail: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Montant minimum livraison éloignée (€)</label>
          <input value={settings.minDeliveryAmount} onChange={e => setSettings(s => ({...s, minDeliveryAmount: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Frais de livraison par défaut (€)</label>
          <input value={settings.deliveryFee} onChange={e => setSettings(s => ({...s, deliveryFee: e.target.value}))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={settings.paymentActive} onChange={e => setSettings(s => ({...s, paymentActive: e.target.checked}))} id="payment" className="rounded" />
          <label htmlFor="payment" className="text-sm">Paiement en ligne actif</label>
        </div>
        {settings.paymentActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">Le paiement en ligne est prévu en phase 2. Ne pas activer sans validation complète.</p>
          </div>
        )}
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>
    </div>
  );
}

export default AdminParametres;
