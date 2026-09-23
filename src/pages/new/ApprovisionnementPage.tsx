import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, MapPin, MessageCircle, Package, Sprout } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

const REQUESTS_KEY = 'delikreol_supply_requests_v1';
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

type SupplyRequest = {
  id: string;
  created_at: string;
  source: 'kopeagri';
  lot: string;
  product: string;
  producer: string;
  commune: string;
  available: string;
  offered_qty: number;
  requested_qty: number;
  unit: string;
  unit_price: number;
  partner_name: string;
  contact: string;
  trace_url: string;
  status: 'pending';
};

function numberParam(value: string | null, fallback = 0) {
  const n = Number(value ?? '');
  return Number.isFinite(n) ? n : fallback;
}

export default function ApprovisionnementPage() {
  const [params] = useSearchParams();
  const lot = params.get('lot') || 'Lot KopéAgri';
  const product = params.get('product') || 'Produit local';
  const producer = params.get('producer') || 'Producteur à confirmer';
  const commune = params.get('commune') || 'Martinique';
  const unit = params.get('unit') || 'kg';
  const offeredQty = numberParam(params.get('qty'));
  const price = numberParam(params.get('price'));
  const available = params.get('available') || '';
  const traceUrl = params.get('trace') || '';
  const isKopeAgri = params.get('source') === 'kopeagri';

  const [requestedQty, setRequestedQty] = useState(offeredQty || 1);
  const [partnerName, setPartnerName] = useState('');
  const [contact, setContact] = useState('');
  const [saved, setSaved] = useState(false);

  const total = useMemo(() => requestedQty * price, [requestedQty, price]);

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Bonjour DELIKREOL, je souhaite réserver un approvisionnement local.\n` +
      `Lot : ${lot}\nProduit : ${product}\nProducteur : ${producer}\n` +
      `Origine : ${commune}\nQuantité souhaitée : ${requestedQty} ${unit}\n` +
      `Prix indicatif : ${price.toFixed(2)} € / ${unit}\nDisponibilité : ${available || 'à confirmer'}\n` +
      `${partnerName ? `Traiteur / partenaire : ${partnerName}\n` : ''}` +
      `${contact ? `Contact : ${contact}\n` : ''}` +
      `${traceUrl ? `Traçabilité : ${traceUrl}\n` : ''}` +
      `Merci de confirmer disponibilité, logistique et conditions.`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  }, [lot, product, producer, commune, requestedQty, unit, price, available, partnerName, contact, traceUrl]);

  const saveRequest = (event: FormEvent) => {
    event.preventDefault();
    const request: SupplyRequest = {
      id: `SUP-${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      source: 'kopeagri',
      lot,
      product,
      producer,
      commune,
      available,
      offered_qty: offeredQty,
      requested_qty: requestedQty,
      unit,
      unit_price: price,
      partner_name: partnerName.trim(),
      contact: contact.trim(),
      trace_url: traceUrl,
      status: 'pending',
    };
    try {
      const raw = localStorage.getItem(REQUESTS_KEY);
      const previous = raw ? JSON.parse(raw) as SupplyRequest[] : [];
      localStorage.setItem(REQUESTS_KEY, JSON.stringify([request, ...previous].slice(0, 100)));
    } catch {
      // Best-effort local pilot storage; WhatsApp remains the operational handoff.
    }
    setSaved(true);
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-[#09614f]">
          <ArrowLeft className="h-4 w-4" /> Retour DELIKREOL
        </Link>

        <section className="mt-5 overflow-hidden rounded-[2rem] bg-[#173f32] p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">Approvisionnement local — pilote connecté</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Réserver un lot KopéAgri sans ressaisie</h1>
          <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-emerald-50/90">
            Les informations du lot ont été transférées automatiquement. Le traiteur choisit uniquement la quantité souhaitée et confirme son contact.
          </p>
        </section>

        {!isKopeAgri && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Cette page est prévue pour les lots transmis depuis KopéAgri. Vérifiez la provenance avant toute réservation.
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#cc460f]">{lot}</p>
                <h2 className="mt-1 text-3xl font-black text-[#1e1d1a]">{product}</h2>
                <p className="mt-1 font-bold text-[#5d6b64]">{producer}</p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-[#09614f]"><Sprout className="h-6 w-6" /></span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f5faf7] p-4"><MapPin className="mb-2 h-5 w-5 text-[#09614f]" /><strong>Origine</strong><p>{commune}</p></div>
              <div className="rounded-2xl bg-[#f5faf7] p-4"><Package className="mb-2 h-5 w-5 text-[#09614f]" /><strong>Disponible</strong><p>{offeredQty || 'À confirmer'} {unit}</p></div>
              <div className="rounded-2xl bg-[#f5faf7] p-4"><CalendarDays className="mb-2 h-5 w-5 text-[#09614f]" /><strong>Date</strong><p>{available || 'À confirmer'}</p></div>
              <div className="rounded-2xl bg-[#f5faf7] p-4"><strong>Prix indicatif</strong><p className="mt-1 text-xl font-black text-[#cc460f]">{price.toFixed(2)} € / {unit}</p></div>
            </div>

            {traceUrl && (
              <a href={traceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#09614f]">
                Voir la traçabilité KopéAgri <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </section>

          <form onSubmit={saveRequest} className="rounded-[1.75rem] bg-[#fff8ed] p-6 shadow-sm ring-1 ring-orange-100">
            <h2 className="text-2xl font-black text-[#1e1d1a]">Demande du traiteur</h2>
            <p className="mt-1 text-sm font-semibold text-[#6c6157]">Aucun paiement n’est déclenché. DELIKREOL confirme ensuite disponibilité, transport et conditions.</p>

            <label className="mt-5 block text-sm font-black text-[#173f32]">Quantité souhaitée ({unit})</label>
            <input type="number" min="0.1" step="0.1" max={offeredQty || undefined} value={requestedQty} onChange={(e) => setRequestedQty(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 font-bold outline-none focus:border-[#cc460f]" required />

            <label className="mt-4 block text-sm font-black text-[#173f32]">Traiteur / partenaire</label>
            <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Ex. Les Délices de Ninice" className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 font-bold outline-none focus:border-[#cc460f]" required />

            <label className="mt-4 block text-sm font-black text-[#173f32]">Téléphone / WhatsApp</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="06 96 …" className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 font-bold outline-none focus:border-[#cc460f]" required />

            <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-orange-100">
              <p className="text-xs font-black uppercase tracking-widest text-[#6c6157]">Montant indicatif matière première</p>
              <p className="mt-1 text-3xl font-black text-[#cc460f]">{total.toFixed(2)} €</p>
              <p className="mt-1 text-xs font-semibold text-[#6c6157]">Hors collecte, livraison, conditionnement et autres frais éventuels.</p>
            </div>

            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#09614f] px-5 py-3 font-black text-white">
              <CheckCircle2 className="h-5 w-5" /> Enregistrer la demande
            </button>

            {saved && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                Demande enregistrée sur cet appareil. Envoyez-la maintenant à DELIKREOL pour confirmation opérationnelle.
              </div>
            )}

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-black text-white">
              <MessageCircle className="h-5 w-5" /> Envoyer à DELIKREOL sur WhatsApp
            </a>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-[#6c6157]">
          Pilote : la réservation n’est définitive qu’après confirmation du producteur, du traiteur et des conditions logistiques/sanitaires applicables.
        </p>
      </main>
    </Layout>
  );
}
