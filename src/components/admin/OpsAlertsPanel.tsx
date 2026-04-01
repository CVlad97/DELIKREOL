import { AlertCircle, AlertOctagon, ArrowRight } from 'lucide-react';
import type { OpsDashboardSnapshot } from '../../services/opsService';

interface OpsAlertsPanelProps {
  snapshot: OpsDashboardSnapshot;
  onNavigate?: (view: string) => void;
}

const alertTone = {
  high: 'border-red-200 bg-red-50 text-red-900',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  low: 'border-slate-200 bg-slate-50 text-slate-800',
};

export function OpsAlertsPanel({ snapshot, onNavigate }: OpsAlertsPanelProps) {
  return (
    <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-[#f7eadf] p-3 text-[#963b25]">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Alertes ops</p>
          <h2 className="text-xl font-black text-[#26150f]">Points a traiter avant diffusion large</h2>
        </div>
      </div>
      <div className="space-y-3">
        {snapshot.alerts.map((alert) => (
          <div key={alert.id} className={`rounded-2xl border p-4 ${alertTone[alert.level]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-black">{alert.title}</p>
                  <p className="mt-1 text-sm opacity-90">{alert.description}</p>
                </div>
              </div>
              {alert.actionView && alert.actionLabel && (
                <button
                  onClick={() => onNavigate?.(alert.actionView!)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#3d2418]"
                >
                  {alert.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
