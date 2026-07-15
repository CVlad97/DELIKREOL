import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { PARTENAIRES_DEMO, genererFactureDemo, exporterFacturesCSV, TVA_RATES, calculerTVA, calculerTTC, genererDeclarationTVA, getEcheancesFiscales, type ComptaInvoice } from '../../services/comptabilite';
import { Download, FileText, Calculator, Calendar, CheckCircle, AlertCircle, Euro, Percent, ExternalLink } from 'lucide-react';

const PARTNER_KEYS = Object.keys(PARTENAIRES_DEMO);

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  draft: { label: 'Brouillon', style: 'bg-muted text-muted-foreground' },
  sent: { label: 'Envoyée', style: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Payée', style: 'bg-success/[0.15] text-success' },
  overdue: { label: 'En retard', style: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulée', style: 'bg-muted text-muted-foreground' },
};

export default function ComptabilitePage() {
  const [selectedPartner, setSelectedPartner] = useState(PARTNER_KEYS[0]);
  const [factures, setFactures] = useState<ComptaInvoice[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const partner = PARTENAIRES_DEMO[selectedPartner];

  const chargerFacturesDemo = () => {
    const list = Array.from({ length: 8 }, (_, i) => genererFactureDemo(selectedPartner, i + 1));
    setFactures(list);
    setShowDemo(true);
  };

  const totalHT = useMemo(() => factures.filter(f => f.status !== 'cancelled').reduce((s, f) => s + f.totalHT, 0), [factures]);
  const totalTVA = useMemo(() => factures.filter(f => f.status !== 'cancelled').reduce((s, f) => s + f.totalTVA, 0), [factures]);
  const totalTTC = useMemo(() => factures.filter(f => f.status !== 'cancelled').reduce((s, f) => s + f.totalTTC, 0), [factures]);
  const totalPaye = useMemo(() => factures.filter(f => f.status === 'paid').reduce((s, f) => s + f.totalTTC, 0), [factures]);
  const echeances = useMemo(() => getEcheancesFiscales(2026), []);
  const declaration = useMemo(() => factures.length > 0 ? genererDeclarationTVA(factures, '2026-07') : null, [factures]);

  const handleExportCSV = () => {
    const csv = exporterFacturesCSV(factures);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures-${selectedPartner}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.15] text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            🧾 NOUVEAU
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
            Comptabilité <span className="text-primary">partenaires</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Facturation électronique, TVA Martinique, déclarations DGFiP et gestion administrative 
            simplifiée pour les traiteurs partenaires DELIKREOL.
          </p>
        </div>

        {/* Selecteur partenaire */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-2xl border border-input">
          <label className="text-sm font-bold text-foreground">Partenaire :</label>
          <select value={selectedPartner} onChange={e => { setSelectedPartner(e.target.value); setShowDemo(false); setFactures([]); }}
            className="flex-1 px-4 py-2 rounded-xl border border-input text-sm bg-white outline-none focus:border-ring">
            {PARTNER_KEYS.map(k => <option key={k} value={k}>{PARTENAIRES_DEMO[k].name}</option>)}
          </select>
          {!showDemo ? (
            <button onClick={chargerFacturesDemo} className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all">
              Charger factures démo
            </button>
          ) : (
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-5 py-2 bg-success hover:bg-success text-white font-bold rounded-xl text-sm transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>

        {/* Infos partenaire */}
        {partner && (
          <div className="bg-white rounded-2xl border border-input p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> {partner.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs block">SIRET</span>{partner.siret}</div>
              <div><span className="text-muted-foreground text-xs block">SIREN</span>{partner.siren}</div>
              <div><span className="text-muted-foreground text-xs block">TVA Intracommunautaire</span><span className="font-mono text-xs">{partner.tvaIntra}</span></div>
              <div><span className="text-muted-foreground text-xs block">RCS</span>{partner.rcs}</div>
              <div><span className="text-muted-foreground text-xs block">Forme juridique</span>{partner.legalForm}</div>
              <div><span className="text-muted-foreground text-xs block">Code APE</span>{partner.apeCode}</div>
              <div><span className="text-muted-foreground text-xs block">Régime TVA</span>{partner.tvaRegime === 'franchise_base' ? 'Franchise de base' : partner.tvaRegime}</div>
              <div><span className="text-muted-foreground text-xs block">Adresse</span>{partner.address}</div>
            </div>
          </div>
        )}

        {/* KPI */}
        {showDemo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CA Total (HT)', value: `${totalHT.toFixed(2)} €`, icon: Euro, color: 'text-success bg-success/10' },
              { label: 'TVA Collectée', value: `${totalTVA.toFixed(2)} €`, icon: Percent, color: 'text-blue-600 bg-blue-50' },
              { label: 'Total TTC', value: `${totalTTC.toFixed(2)} €`, icon: Calculator, color: 'text-primary bg-primary/[0.08]' },
              { label: 'Payé', value: `${totalPaye.toFixed(2)} €`, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            ].map(kpi => (
              <div key={kpi.label} className={`rounded-2xl p-5 ${kpi.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{kpi.label}</span>
                </div>
                <p className="text-2xl font-black">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tableau factures */}
        {showDemo && (
          <div className="bg-white rounded-2xl border border-input overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-foreground">Factures ({factures.length})</h2>
              <a href="https://www.dgfip.fr" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">DGFiP <ExternalLink className="w-3 h-3" /></a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted text-left">
                  <th className="p-3">N° Facture</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-right">Montant HT</th>
                  <th className="p-3 text-right">TVA</th>
                  <th className="p-3 text-right">Total TTC</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Échéance</th>
                </tr></thead>
                <tbody>
                  {factures.map(f => (
                    <tr key={f.id} className="border-t border-gray-50 hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{f.invoiceNumber}</td>
                      <td className="p-3">{f.emissionDate}</td>
                      <td className="p-3 text-muted-foreground">{f.clientName}</td>
                      <td className="p-3 text-right">{f.totalHT.toFixed(2)} €</td>
                      <td className="p-3 text-right">{f.totalTVA.toFixed(2)} €</td>
                      <td className="p-3 text-right font-bold">{f.totalTTC.toFixed(2)} €</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_LABELS[f.status]?.style}`}>{STATUS_LABELS[f.status]?.label}</span></td>
                      <td className="p-3 text-xs text-muted-foreground">{f.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Déclaration TVA */}
        {declaration && (
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> Déclaration TVA — {declaration.period}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4"><span className="text-xs text-muted-foreground block">CA HT</span><span className="font-bold text-lg">{declaration.totalCA.toFixed(2)} €</span></div>
              <div className="bg-white rounded-xl p-4"><span className="text-xs text-muted-foreground block">TVA collectée</span><span className="font-bold text-lg">{declaration.totalTvaCollectee.toFixed(2)} €</span></div>
              <div className="bg-white rounded-xl p-4"><span className="text-xs text-muted-foreground block">TVA déductible</span><span className="font-bold text-lg">{declaration.totalTvaDeductible.toFixed(2)} €</span></div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200"><span className="text-xs text-muted-foreground block">TVA due</span><span className="font-bold text-lg text-blue-700">{declaration.totalTvaDue.toFixed(2)} €</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Taux TVA Martinique : 2.1% (alimentation) / 8.5% (prestations)</p>
          </div>
        )}

        {/* Échéances fiscales */}
        <div className="bg-secondary/10/30 rounded-2xl p-6 border border-secondary/20">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" /> Échéances fiscales 2026
          </h2>
          <div className="space-y-2">
            {echeances.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-secondary/15">
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.type === 'tva' ? 'Déclaration TVA' : e.type === 'tva_ca12' ? 'CA12' : 'Déclaration revenus'} — {e.period}</p>
                  <p className="text-xs text-muted-foreground">Échéance : {new Date(e.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${e.status === 'a_faire' ? 'bg-red-100 text-red-700' : 'bg-success/[0.15] text-success'}`}>
                  {e.status === 'a_faire' ? 'À faire' : 'Validée'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-primary to-secondary rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-black mb-3">Vous êtes partenaire DELIKREOL ?</h2>
          <p className="text-primary-foreground/90 mb-6 max-w-lg mx-auto">
            Vos factures sont automatiquement préparées. TVA, DGFiP, URSSAF — 
            DELIKREOL vous accompagne pour une gestion administrative sans stress.
          </p>
          <a href={`https://wa.me/596696653589?text=${encodeURIComponent('Bonjour, je souhaite activer mon espace comptabilité DELIKREOL.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:scale-105 transition-all shadow-lg">
            💬 Activer mon espace
          </a>
        </section>
      </div>
    </Layout>
  );
}