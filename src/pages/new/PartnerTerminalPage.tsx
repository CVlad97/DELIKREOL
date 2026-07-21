import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  Mail,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { generateOrderId } from '../../utils/orderId';
import type { LucideIcon } from 'lucide-react';

const WHATSAPP_NUMBER = '596696653589';
const DEFAULT_PARTNERS = ["Snack Savè Peyi'A", 'Sweet Family Traiteur', 'Les Délices de Ninice', "Saveurs d'Afrique", "Coco's Food"];
const SECURITY_STEPS: Array<{ title: string; text: string; Icon: LucideIcon }> = [
  { title: 'Encaissement', text: 'Encaissement SumUp manuel ou lien généré dans SumUp', Icon: WalletCards },
  { title: 'Facture', text: 'Brouillon prêt à envoyer email + WhatsApp', Icon: ReceiptText },
  { title: 'Qonto', text: 'Rapprochement à partir du libellé commande', Icon: Banknote },
  { title: '2FA', text: 'Obligatoire sur PSP, Qonto et admin', Icon: LockKeyhole },
];

type PaymentStatus = 'draft' | 'awaiting_payment' | 'paid_external';

type TerminalDraft = {
  order_number: string;
  partner_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_provider: 'manual' | 'sumup_manual' | 'sumup_payment_link' | 'stripe_test';
  external_payment_reference: string;
  payment_note: string;
  invoice_status: 'draft' | 'ready_to_send';
  qonto_status: 'pending_reconciliation';
  source: 'partner_terminal_mvp';
  created_at: string;
};

function money(value: number) {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function parseItems(raw: string) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, quantityPart, pricePart] = line.split(';').map((value) => value?.trim());
      const quantity = Math.max(1, Number(quantityPart || 1));
      const unitPrice = Math.max(0, Number((pricePart || '0').replace(',', '.')));
      return { name: namePart || 'Article', quantity, unit_price: unitPrice };
    });
}

function saveTerminalDraft(draft: TerminalDraft) {
  const localOrders = JSON.parse(localStorage.getItem('delikreol_local_orders_v1') || '[]');
  localOrders.push({
    ...draft,
    id: draft.order_number,
    status: 'confirmed',
    order_number: draft.order_number,
    total_amount: draft.total_amount,
    order_mode: 'partner_terminal',
  });
  localStorage.setItem('delikreol_local_orders_v1', JSON.stringify(localOrders));

  const terminalOrders = JSON.parse(localStorage.getItem('delikreol_partner_terminal_orders_v1') || '[]');
  terminalOrders.push(draft);
  localStorage.setItem('delikreol_partner_terminal_orders_v1', JSON.stringify(terminalOrders));
}

export default function PartnerTerminalPage() {
  const [partnerName, setPartnerName] = useState(DEFAULT_PARTNERS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rawItems, setRawItems] = useState('Plat du jour;1;12\nBoisson;1;2.50');
  const [paymentProvider, setPaymentProvider] = useState<TerminalDraft['payment_provider']>('sumup_manual');
  const [externalPaymentReference, setExternalPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [createdOrder, setCreatedOrder] = useState<TerminalDraft | null>(null);

  const items = useMemo(() => parseItems(rawItems), [rawItems]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0), [items]);

  const createDraft = () => {
    const orderNumber = generateOrderId();
    const draft: TerminalDraft = {
      order_number: orderNumber,
      partner_name: partnerName,
      customer_name: customerName || 'Client comptoir',
      customer_phone: customerPhone,
      customer_email: customerEmail,
      items,
      total_amount: total,
      payment_status: paymentProvider === 'manual' ? 'draft' : 'awaiting_payment',
      payment_provider: paymentProvider,
      external_payment_reference: externalPaymentReference,
      payment_note: paymentNote || 'Statut payé à confirmer manuellement.',
      invoice_status: 'ready_to_send',
      qonto_status: 'pending_reconciliation',
      source: 'partner_terminal_mvp',
      created_at: new Date().toISOString(),
    };
    saveTerminalDraft(draft);
    setCreatedOrder(draft);
  };

  const invoiceText = createdOrder ? [
    `Facture DELIKREOL ${createdOrder.order_number}`,
    `Partenaire : ${createdOrder.partner_name}`,
    `Client : ${createdOrder.customer_name}`,
    `Total : ${money(createdOrder.total_amount)}`,
    `Paiement : ${createdOrder.payment_provider === 'sumup_manual' ? 'Encaissement SumUp manuel' : createdOrder.payment_provider === 'sumup_payment_link' ? 'Lien de paiement SumUp à générer dans l’app SumUp' : createdOrder.payment_provider === 'stripe_test' ? 'Stripe test' : 'Manuel'}`,
    createdOrder.external_payment_reference ? `Référence externe : ${createdOrder.external_payment_reference}` : '',
    `Note paiement : ${createdOrder.payment_note}`,
    `Suivi : ${window.location.origin}/statut-commande?order=${createdOrder.order_number}`,
  ].join('\n') : '';

  const whatsappInvoiceUrl = createdOrder
    ? `https://wa.me/${customerPhone.replace(/\D/g, '') || WHATSAPP_NUMBER}?text=${encodeURIComponent(invoiceText)}`
    : '#';
  const mailInvoiceUrl = createdOrder
    ? `mailto:${customerEmail}?subject=${encodeURIComponent(`Facture DELIKREOL ${createdOrder.order_number}`)}&body=${encodeURIComponent(invoiceText)}`
    : '#';

  return (
    <Layout>
      <main className="min-h-screen bg-[#fff8ef] text-[#24140d]">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="rounded-[2rem] bg-[#24140d] p-6 text-white shadow-2xl sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200">MVP sécurisé ce soir</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Terminal partenaire mobile</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-orange-50/85">
                  DELIKREOL ne lit jamais les cartes. Pour SumUp, le partenaire encaisse manuellement dans l’app SumUp
                  ou génère un lien SumUp ; l’intégration automatique arrive plus tard.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" /><span className="font-black">PCI safe</span></div>
                <p className="mt-2 text-sm text-orange-50/75">Aucune donnée carte stockée. 2FA et rapprochement Qonto à activer côté comptes PSP/Qonto.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Créer une vente comptoir</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-black">Partenaire</span><select value={partnerName} onChange={(event) => setPartnerName(event.target.value)} className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm">{DEFAULT_PARTNERS.map((name) => <option key={name}>{name}</option>)}</select></label>
                <label className="block"><span className="text-sm font-black">Client</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Client comptoir" className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm" /></label>
                <label className="block"><span className="text-sm font-black">Téléphone WhatsApp</span><input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="0696 XX XX XX" className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm" /></label>
                <label className="block"><span className="text-sm font-black">Email facture</span><input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="client@email.com" className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm" /></label>
                <label className="block"><span className="text-sm font-black">Référence paiement externe</span><input value={externalPaymentReference} onChange={(event) => setExternalPaymentReference(event.target.value)} placeholder="Réf. SumUp / virement / espèces" className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm" /></label>
              </div>
              <label className="mt-4 block"><span className="text-sm font-black">Articles — format : nom; quantité; prix</span><textarea value={rawItems} onChange={(event) => setRawItems(event.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 font-mono text-sm" /></label>
              <label className="mt-4 block"><span className="text-sm font-black">Note paiement</span><textarea value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} rows={2} placeholder="Statut payé à confirmer manuellement." className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm" /></label>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  { id: 'sumup_manual', label: 'SumUp manuel', icon: Smartphone, text: 'À valider dans SumUp' },
                  { id: 'sumup_payment_link', label: 'Lien SumUp', icon: CreditCard, text: 'À générer dans SumUp' },
                  { id: 'stripe_test', label: 'Stripe test', icon: WalletCards, text: 'Pré-prod uniquement' },
                  { id: 'manual', label: 'Manuel', icon: Banknote, text: 'Espèces/virement' },
                ].map((option) => {
                  const Icon = option.icon;
                  return <button key={option.id} type="button" onClick={() => setPaymentProvider(option.id as TerminalDraft['payment_provider'])} className={`rounded-2xl border p-4 text-left transition ${paymentProvider === option.id ? 'border-orange-500 bg-orange-50' : 'border-orange-100 bg-white'}`}><Icon className="mb-3 text-orange-600" /><span className="block font-black">{option.label}</span><span className="text-xs text-[#6f5b4b]">{option.text}</span></button>;
                })}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-3xl bg-[#24140d] p-5 text-white">
                <span className="text-sm font-black uppercase tracking-[0.18em] text-orange-200">Total</span>
                <span className="text-3xl font-black">{money(total)}</span>
              </div>
              <button type="button" disabled={items.length === 0 || total <= 0} onClick={createDraft} className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 font-black text-white disabled:bg-slate-300">
                Générer facture + suivi <ArrowRight size={18} />
              </button>
            </section>

            <section className="space-y-5">
              <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black">Chaîne sécurisée</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {SECURITY_STEPS.map(({ title, text, Icon }) => <div key={title} className="flex gap-3 rounded-2xl bg-[#fff8ef] p-3"><Icon className="mt-1 h-5 w-5 text-orange-600" /><div><p className="font-black">{title}</p><p className="text-[#6f5b4b]">{text}</p></div></div>)}
                </div>
              </div>

              {createdOrder && (
                <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-700" /><h2 className="text-xl font-black text-emerald-950">Vente créée</h2></div>
                  <p className="mt-3 font-mono text-lg font-black">{createdOrder.order_number}</p>
                  <p className="mt-1 text-sm text-emerald-900">Suivi et facture prêts. Statut payé à confirmer manuellement.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Link to={`/statut-commande?order=${createdOrder.order_number}`} className="rounded-2xl bg-[#24140d] px-4 py-3 text-center text-sm font-black text-white">Tester le suivi</Link>
                    <a href={whatsappInvoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"><MessageCircle size={16} /> WhatsApp</a>
                    <a href={mailInvoiceUrl} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 px-4 py-3 text-sm font-black text-emerald-900"><Mail size={16} /> Email</a>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(invoiceText)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 px-4 py-3 text-sm font-black text-emerald-900"><FileText size={16} /> Copier facture</button>
                    <button type="button" onClick={() => setCreatedOrder({ ...createdOrder, payment_status: 'paid_external', payment_note: 'Marqué comme payé manuellement.' })} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 px-4 py-3 text-sm font-black text-emerald-900"><CheckCircle2 size={16} /> Marquer comme payé manuellement</button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </Layout>
  );
}
