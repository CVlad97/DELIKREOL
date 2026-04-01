import type { MissionStage, OpsDashboardSnapshot } from '../../services/opsService';
import { getMissionStatusSummary, getTelegramShareLink } from '../../services/opsService';

interface MissionPipelineBoardProps {
  snapshot: OpsDashboardSnapshot;
}

const columns: MissionStage[] = ['new', 'qualified', 'assigned', 'in_progress', 'completed', 'cancelled'];

const stageTone: Record<MissionStage, string> = {
  new: 'border-red-200 bg-red-50',
  qualified: 'border-amber-200 bg-amber-50',
  assigned: 'border-orange-200 bg-orange-50',
  in_progress: 'border-emerald-200 bg-emerald-50',
  completed: 'border-slate-200 bg-slate-50',
  cancelled: 'border-zinc-200 bg-zinc-100',
};

export function MissionPipelineBoard({ snapshot }: MissionPipelineBoardProps) {
  return (
    <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Pipeline missions</p>
          <h2 className="mt-2 text-2xl font-black text-[#26150f]">Vue operateur local-first</h2>
        </div>
        <div className="rounded-2xl bg-[#f7ecdb] px-4 py-2 text-sm font-bold text-[#7a4a25]">
          {snapshot.missions.length} missions suivies
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {columns.map((stage) => {
          const items = snapshot.missions.filter((mission) => mission.stage === stage);
          return (
            <div key={stage} className={`rounded-3xl border p-4 ${stageTone[stage]}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#3d2418]">{getMissionStatusSummary(stage)}</h3>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-[#6b3421]">{snapshot.missionPipeline[stage]}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d7c3aa] bg-white/70 px-3 py-4 text-xs font-medium text-[#7b6c62]">Aucune mission</div>
                ) : (
                  items.slice(0, 3).map((mission) => (
                    <div key={mission.id} className="rounded-2xl bg-white/90 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#2e1b13]">{mission.reference}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9b4b28]">{mission.serviceType}</p>
                        </div>
                        <span className="rounded-full bg-[#fff4df] px-2 py-1 text-[10px] font-black text-[#8e5419]">{mission.paymentStatus}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#35231a]">{mission.clientName}</p>
                      <p className="text-xs text-[#6c5c52]">{mission.partnerName} · {mission.zone}</p>
                      <p className="mt-2 text-xs text-[#6c5c52]">{mission.dueLabel}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-[#1c6a45]">{mission.margin.toFixed(2)} EUR marge</span>
                        <a
                          href={getTelegramShareLink(mission.reference)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#7a4a25] underline decoration-dotted underline-offset-4"
                        >
                          Notifier
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
