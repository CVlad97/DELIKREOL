import { PublicCatalogProduct } from '../services/publicCatalogService';

type OrderPdfInput = {
  orderNumber: string;
  products: PublicCatalogProduct[];
  deliveryMode: string;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentStatus: string;
  slot: string;
};

export function downloadOrderPdf(input: OrderPdfInput) {
  const lines = buildInvoiceLines(input);
  const stream = [
    'BT',
    '/F1 18 Tf',
    '50 780 Td',
    pdfText('DELIKREOL - Bon de commande / facture'),
    'Tj',
    '/F1 10 Tf',
    '0 -28 Td',
    ...lines.flatMap((line) => [pdfText(line), 'Tj', '0 -16 Td']),
    'ET',
  ].join('\n');

  const pdf = buildPdf(stream);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${input.orderNumber}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildPartnerDispatchMessage(input: OrderPdfInput) {
  return buildInvoiceLines(input).join('\n');
}

function buildInvoiceLines(input: OrderPdfInput) {
  return [
    `Commande: ${input.orderNumber}`,
    `Date: ${new Date().toLocaleDateString('fr-FR')}`,
    `Mode: ${input.deliveryMode}`,
    `Creneau: ${input.slot}`,
    `Paiement: ${input.paymentStatus}`,
    '',
    'Produits:',
    ...input.products.map((product, index) => `${index + 1}. ${sanitize(product.name)} - ${sanitize(product.vendor_name)} - ${formatMoney(product.price)}`),
    '',
    `Livraison: ${formatMoney(input.deliveryFee)}`,
    `Frais service: ${formatMoney(input.serviceFee)}`,
    `Total: ${formatMoney(input.total)}`,
    '',
    'A preparer par le partenaire: confirmer disponibilite, heure de retrait/livraison et statut paiement.',
  ];
}

function buildPdf(stream: string) {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function pdfText(value: string) {
  return `(${sanitize(value).replace(/[()\\]/g, '\\$&')})`;
}

function sanitize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ');
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}
