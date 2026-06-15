import { useState, useEffect } from 'react';
import { mockProducts } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import { computeClientPrice, getFullBreakdown } from '../../services/pricing';
import { generateOrderId } from '../../utils/orderId';

export default function AdminSimulation() {
  const [log, setLog] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'retrait' | 'relais' | 'livraison'>('retrait');

  const addLog = (msg: string) => setLog(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => { document.title = 'Simulateur — Admin DELIKREOL'; }, []);

  const runCompleteSimulation = () => {
    setLog([]);
    addLog('🧪 Démarrage simulation commande complète');

    // 1. Traiteurs
    addLog(`📋 ${traiteurSpaces.length} traiteurs chargés`);
    const aktifTraiteurs = traiteurSpaces.filter(t => t.status === 'public confirmé');
    addLog(`✅ ${aktifTraiteurs.length} traiteurs publiés`);

    // 2. Produits
    addLog(`📦 ${mockProducts.length} produits au catalogue`);
    const sansDesc = mockProducts.filter(p => !p.description || p.description.includes('valider'));
    addLog(`⚠️ ${sansDesc.length} produits sans description validée`);
    const sansPrix = mockProducts.filter(p => !p.price || p.price === 0);
    addLog(`⚠️ ${sansPrix.length} produits sans prix défini`);

    // 3. Prix
    const testPrice = 20;
    const breakdown = getFullBreakdown(testPrice, selectedMode);
    addLog(`💰 Prix net vendeur: ${breakdown.prixNetVendeur}€ → Client: ${breakdown.prixClientDelikreol}€`);
    addLog(`💰 Commission DELIKREOL: ${breakdown.commissionDelikreol.toFixed(2)}€`);
    addLog(`💰 Frais mode (${selectedMode}): ${breakdown.fraisMode}€ → Total client: ${breakdown.totalClient}€`);
    if (breakdown.partLivreur) addLog(`🚚 Part livreur: ${breakdown.partLivreur}€`);
    if (breakdown.partDelikreolLogistique) addLog(`📊 Logistique DELIKREOL: ${breakdown.partDelikreolLogistique}€`);

    // 4. Commande
    const orderId = generateOrderId();
    addLog(`🆔 Commande générée: ${orderId}`);

    // 5. Sauvegarde locale
    try {
      const existing = JSON.parse(localStorage.getItem('delikreol_local_orders_v1') || '[]');
      existing.push({ id: orderId, mode: selectedMode, total: breakdown.totalClient, created_at: new Date().toISOString(), demo: true });
      localStorage.setItem('delikreol_local_orders_v1', JSON.stringify(existing));
      addLog(`💾 Commande sauvegardée en local (${existing.length} totales)`);
    } catch (e) {
      addLog(`❌ Erreur sauvegarde locale: ${e}`);
    }

    addLog('✅ Simulation terminée');
  };

  const resetDemo = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('delikreol_local_orders_v1') || '[]');
      const filtered = existing.filter((o: any) => !o.demo);
      localStorage.setItem('delikreol_local_orders_v1', JSON.stringify(filtered));
      addLog('🔄 Données demo réinitialisées');
    } catch { /* empty */ }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6">🧪 Simulateur de commande</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setSelectedMode('retrait')} className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedMode === 'retrait' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>Retrait</button>
        <button onClick={() => setSelectedMode('relais')} className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedMode === 'relais' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>Point relais</button>
        <button onClick={() => setSelectedMode('livraison')} className={`px-4 py-2 rounded-xl font-semibold text-sm ${selectedMode === 'livraison' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>Livraison</button>
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={runCompleteSimulation} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">Simuler commande complète</button>
        <button onClick={resetDemo} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Reset demo</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4"><p className="text-2xl font-black text-orange-600">{traiteurSpaces.length}</p><p className="text-xs text-gray-500">Traiteurs</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-2xl font-black text-orange-600">{mockProducts.length}</p><p className="text-xs text-gray-500">Produits</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-2xl font-black text-orange-600">{mockProducts.filter(p => !p.description || p.description.includes('valider')).length}</p><p className="text-xs text-gray-500">Descriptions à valider</p></div>
      </div>

      {/* Log */}
      <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs h-64 overflow-y-auto">
        {log.length === 0 ? (
          <p className="text-gray-500">Cliquez sur "Simuler commande complète" pour démarrer...</p>
        ) : log.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}