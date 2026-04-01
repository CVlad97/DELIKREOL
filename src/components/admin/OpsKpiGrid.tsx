import { AlertTriangle, Briefcase, CircleDollarSign, Clock3, FileWarning, HandCoins, Target, Users } from 'lucide-react';
import type { OpsDashboardSnapshot } from '../../services/opsService';

interface OpsKpiGridProps {
  snapshot: OpsDashboardSnapshot;
}

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function OpsKpiGrid({ snapshot }: OpsKpiGridProps) {
  const items = [
            { label: 'Demandes du jour', value: snapshot.kpis.requestsToday, hint: 'tous canaux confondus', icon: Briefcase, tone: 'text-red-700 bg-red-50 border-red-200' },
    { label: 'A qualifier', value: snapshot.kpis.awaitingQualification, hint: 'site, WhatsApp, Telegram', icon: AlertTriangle, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Missions en cours', value: snapshot.kpis.activeMissions, hint: 'suivi terrain', icon: Target, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Partenaires actifs', value: snapshot.kpis.availablePartners, hint: `${snapshot.kpis.nonCompliantPartners} a regulariser`, icon: Users, tone: 'text-teal-700 bg-teal-50 border-teal-200' },
    { label: 'CA estime', value: currency.format(snapshot.kpis.estimatedRevenue), hint: `commission ${currency.format(snapshot.kpis.estimatedCommission)}`, icon: CircleDollarSign, tone: 'text-orange-700 bg-orange-50 border-orange-200' },
    { label: 'Temps moyen', value: `${snapshot.kpis.averageHandlingMinutes} min`, hint: 'prise en charge', icon: Clock3, tone: 'text-sky-700 bg-sky-50 border-sky-200' },
    { label: 'Incidents', value: snapshot.kpis.incidents, hint: 'points critiques', icon: FileWarning, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
    { label: 'Marge brute', value: currency.format(snapshot.finance.marginToday), hint: `panier moyen ${currency.format(snapshot.finance.averageBasket)}`, icon: HandCoins, tone: 'text-lime-700 bg-lime-50 border-lime-200' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-3xl border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7c5a45]">{item.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-[#26150f]">{item.value}</p>
              </div>
              <div className={`rounded-2xl border p-3 ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-[#6f6158]">{item.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
