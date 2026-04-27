import { Mail, MapPinned, MessageCircle, Send, ShieldAlert } from 'lucide-react';
import type { OpsDashboardSnapshot } from '../../services/opsService';
import { getGoogleMapsLink, getPartnerWhatsAppLink, getTelegramShareLink, getWazeLink } from '../../services/opsService';

interface OpsEntitiesPanelProps {
  snapshot: OpsDashboardSnapshot;
}

const channelLabel = {
  site: 'Site',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  manual: 'Manuel',
};

export function OpsEntitiesPanel({ snapshot }: OpsEntitiesPanelProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
      <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Clients & missions</p>
          <h2 className="mt-2 text-xl font-black text-[#26150f]">Fiches clients prioritaires</h2>
        </div>
        <div className="space-y-3">
          {snapshot.clients.map((client) => (
            <div key={client.id} className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-[#2f1911]">{client.name}</p>
                  <p className="text-sm text-[#6d5c52]">{client.zone} · {client.phone}</p>
                </div>
                <span className="rounded-full bg-[#f7ecdb] px-3 py-1 text-xs font-black text-[#7a4a25]">{client.priority}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#6d5c52]">
                <span className="rounded-full bg-[#f8f2ea] px-2.5 py-1">{client.requestCount} demandes</span>
                <span className="rounded-full bg-[#f8f2ea] px-2.5 py-1">Canal {channelLabel[client.channel]}</span>
              </div>
              <p className="mt-3 text-sm text-[#4f3a30]">{client.notes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Partenaires & conformite</p>
          <h2 className="mt-2 text-xl font-black text-[#26150f]">Activation partenaires</h2>
        </div>
        <div className="space-y-3">
          {snapshot.partners.slice(0, 5).map((partner) => (
            <div key={partner.id} className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-[#2f1911]">{partner.name}</p>
                  <p className="text-sm text-[#6d5c52]">{partner.category} · {partner.zone}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${partner.complianceStatus === 'valid' ? 'bg-emerald-100 text-emerald-800' : partner.complianceStatus === 'expiring' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {partner.complianceStatus}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#4f3a30]">{partner.story}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#6d5c52]">
                {partner.documents.map((doc) => (
                  <span key={`${partner.id}_${doc.type}`} className="rounded-full bg-[#f8f2ea] px-2.5 py-1">{doc.type}: {doc.status}</span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={getPartnerWhatsAppLink(partner.contactPhone, partner.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1f8f5f] px-3 py-2 text-xs font-black text-white">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={getTelegramShareLink(partner.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#2878b8] px-3 py-2 text-xs font-black text-white">
                  <Send className="h-3.5 w-3.5" /> Telegram
                </a>
                <a href={getGoogleMapsLink(partner.zone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#f5e4c7] px-3 py-2 text-xs font-black text-[#7a4a25]">
                  <MapPinned className="h-3.5 w-3.5" /> Maps
                </a>
                <a href={getWazeLink(partner.zone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#f2f7ff] px-3 py-2 text-xs font-black text-[#21579a]">
                  <MapPinned className="h-3.5 w-3.5" /> Waze
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Finance simplifiee</p>
          <h2 className="mt-2 text-xl font-black text-[#26150f]">Pilotage marge & commission</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#fff8ef] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8f5b34]">Encaisse estime</p>
            <p className="mt-2 text-3xl font-black text-[#2f1911]">{snapshot.finance.grossToday.toFixed(0)} EUR</p>
          </div>
          <div className="rounded-2xl bg-[#eef8f1] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3d7b55]">Marge brute</p>
            <p className="mt-2 text-3xl font-black text-[#18492d]">{snapshot.finance.marginToday.toFixed(0)} EUR</p>
          </div>
          <div className="rounded-2xl bg-[#f8f3ea] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7f5d47]">Cout partenaires</p>
            <p className="mt-2 text-2xl font-black text-[#2f1911]">{snapshot.finance.partnerCostsToday.toFixed(0)} EUR</p>
          </div>
          <div className="rounded-2xl bg-[#f7edf0] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d3b52]">Commissions</p>
            <p className="mt-2 text-2xl font-black text-[#5b1731]">{snapshot.finance.commissionsToday.toFixed(0)} EUR</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#efe2d1] p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#8f5b34]">Categories actives</p>
            <div className="space-y-2 text-sm text-[#4f3a30]">
              {snapshot.finance.topCategories.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="font-black">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#efe2d1] p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#8f5b34]">Zones actives</p>
            <div className="space-y-2 text-sm text-[#4f3a30]">
              {snapshot.finance.topZones.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="font-black">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-[#f7eadf] p-3 text-[#963b25]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Integrations pragmatiques</p>
            <h2 className="text-xl font-black text-[#26150f]">Canaux prets a brancher</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
            <p className="text-sm font-black text-[#2f1911]">WhatsApp / Telegram</p>
            <p className="mt-2 text-sm text-[#6d5c52]">Relance manuelle rapide depuis les fiches missions et partenaires. Pratique pour l'operateur local.</p>
          </div>
          <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
            <p className="text-sm font-black text-[#2f1911]">Google Maps / Waze</p>
            <p className="mt-2 text-sm text-[#6d5c52]">Ouverture directe des zones et destinations sans calcul complexe cote backend.</p>
          </div>
          <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
            <p className="text-sm font-black text-[#2f1911]">Gmail ops</p>
            <p className="mt-2 text-sm text-[#6d5c52]">Structure recommandee: contact@, operations@, partenaires@, support@, legal@.</p>
          </div>
          <div className="rounded-2xl border border-[#efe2d1] bg-[#fffdfa] p-4">
            <p className="text-sm font-black text-[#2f1911]">Storytelling partenaire</p>
            <p className="mt-2 text-sm text-[#6d5c52]">Chaque partenaire peut etre mis en avant avec histoire locale, zone couverte et badge interne de confiance.</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f8f2ea] px-4 py-2 text-xs font-black text-[#7a4a25]">
          <Mail className="h-3.5 w-3.5" /> Integrations preparees sans rendre la V1 dependante du backend
        </div>
      </div>
    </div>
  );
}
