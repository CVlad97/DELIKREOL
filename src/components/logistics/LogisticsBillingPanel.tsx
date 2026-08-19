import { CheckCircle2, ClipboardCheck, FileText, ShieldCheck, WalletCards } from 'lucide-react';
import {
  buildLogisticsInvoiceDraft,
  getElectronicInvoicingMilestones,
  getLaunchReadiness,
  getRequiredOnboardingDocuments,
  type LogisticsMissionForBilling,
  type LogisticsPartnerKind,
} from '../../services/logisticsPartnerBilling';

type LogisticsBillingPanelProps = {
  partnerKind: LogisticsPartnerKind;
  partnerName: string;
  partnerSiret?: string | null;
  missions?: LogisticsMissionForBilling[];
};

function money(value: number) {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function LogisticsBillingPanel({
  partnerKind,
  partnerName,
  partnerSiret = null,
  missions = [],
}: LogisticsBillingPanelProps) {
  const period = new Date().toISOString().slice(0, 7);
  const invoice = buildLogisticsInvoiceDraft({ partnerKind, partnerName, partnerSiret, period, missions });
  const milestones = getElectronicInvoicingMilestones();
  const documents = getRequiredOnboardingDocuments(partnerKind);
  const readinessItems = [
    { id: 'documents', label: 'Documents indépendants vérifiés', required: true, complete: false },
    { id: 'siret', label: 'SIRET renseigné', required: true, complete: Boolean(partnerSiret) },
    { id: 'invoice', label: 'Brouillon facture disponible', required: true, complete: invoice.lines.length > 0 },
    { id: 'payout', label: 'Reversement validé manuellement', required: true, complete: false },
    { id: 'first_order', label: 'Commande pilote testée', required: true, complete: false },
  ];
  const readiness = getLaunchReadiness(readinessItems);

  const invoiceText = [
    `Facture brouillon ${invoice.invoiceNumber}`,
    `Partenaire : ${invoice.partnerName}`,
    invoice.partnerSiret ? `SIRET : ${invoice.partnerSiret}` : 'SIRET : à compléter',
    `Période : ${invoice.period}`,
    `Total : ${money(invoice.totalTTC)}`,
    'Statut : brouillon non transmis PDP',
    ...invoice.lines.map((line) => `- ${line.label} : ${money(line.total)}`),
  ].join('\n');

  return (
    <div className="p-4 pb-24">
      <div className="mb-6 rounded-3xl bg-foreground p-6 text-background shadow-elegant">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-background/60">
          {partnerKind === 'driver' ? 'Livreur indépendant' : 'Point relais indépendant'}
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Facturation et lancement</h1>
        <p className="mt-2 text-sm text-background/70">
          Préparation des premières commandes : facture brouillon, documents et validation manuelle DELIKREOL.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <WalletCards className="mb-3 h-6 w-6 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">À facturer</p>
          <p className="mt-1 text-3xl font-black text-foreground">{money(invoice.totalTTC)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{invoice.lines.length} prestation(s) terminée(s)</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <FileText className="mb-3 h-6 w-6 text-secondary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Facture</p>
          <p className="mt-1 font-mono text-lg font-black text-foreground">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">Brouillon non transmis à une PDP.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <ShieldCheck className="mb-3 h-6 w-6 text-success" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Go pilote</p>
          <p className="mt-1 text-3xl font-black text-foreground">{readiness.complete}/{readiness.required}</p>
          <p className="mt-1 text-xs text-muted-foreground">{readiness.ready ? 'Prêt à vérifier terrain' : 'Validation manuelle requise'}</p>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Brouillon facture électronique</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Réception e-facture : {milestones.receiveDeadline}. Émission PME/TPE : {milestones.smallBusinessIssueDeadline}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(invoiceText)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2 text-xs font-black text-primary"
          >
            <ClipboardCheck size={16} /> Copier
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Prestation</th>
                <th className="p-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.length === 0 ? (
                <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">Aucune prestation terminée à facturer.</td></tr>
              ) : invoice.lines.map((line) => (
                <tr key={line.label} className="border-t">
                  <td className="p-3">{line.label}</td>
                  <td className="p-3 text-right font-black">{money(line.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 p-3 text-xs font-semibold text-secondary">
          Facture-X/PDP non connecté : ce module prépare les données, il ne transmet aucune facture officielle.
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-lg font-black">Documents à valider</h2>
          <div className="mt-3 space-y-2">
            {documents.map((document) => (
              <div key={document} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>{document}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-lg font-black">Checklist premières commandes</h2>
          <div className="mt-3 space-y-2">
            {readinessItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2 text-sm">
                <span>{item.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.complete ? 'bg-success/[0.15] text-success' : 'bg-secondary/10 text-secondary'}`}>
                  {item.complete ? 'OK' : 'À valider'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
