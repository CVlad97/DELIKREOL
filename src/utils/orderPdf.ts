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
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  customerLocality?: string;
  deliveryNotes?: string;
  customerMapsUrl?: string;
  customerLat?: number;
  customerLng?: number;
  customerAccuracy?: number;
  partnerName?: string;
  partnerLocality?: string;
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
  const address = input.deliveryAddress || 'Adresse non fournie';
  const customerLocality = input.customerLocality || extractLocality(address);
  const partnerName = input.partnerName || input.products[0]?.vendor_name || 'Partenaire à confirmer';
  const partnerLocality = input.partnerLocality || input.products[0]?.zone_label || 'Localité partenaire non fournie';
  const notes = input.deliveryNotes || 'Aucune instruction';
  const mapsUrl = input.customerMapsUrl || 'Position GPS non fournie - confirmer adresse manuellement';
  const coordinates =
    typeof input.customerLat === 'number' && typeof input.customerLng === 'number'
      ? `${input.customerLat.toFixed(6)}, ${input.customerLng.toFixed(6)}`
      : 'Non fournies';
  const accuracy = typeof input.customerAccuracy === 'number' ? `${Math.round(input.customerAccuracy)} m` : 'Non fournie';

  return [
    `Commande: ${input.orderNumber}`,
    `Date: ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    'Client:',
    `Nom: ${input.customerName || 'Non renseigne'}`,
    `Telephone: ${input.customerPhone || 'Non renseigne'}`,
    '',
    'Livraison / retrait:',
    `Mode: ${input.deliveryMode}`,
    `Partenaire: ${partnerName}`,
    `Localite partenaire: ${partnerLocality}`,
    `Adresse: ${address}`,
    `Localite client: ${customerLocality}`,
    `Instructions: ${notes}`,
    `Position GPS: ${mapsUrl}`,
    `Coordonnees: ${coordinates}`,
    `Precision: ${accuracy}`,
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
    'Action vendeur: confirmer disponibilite, delai de preparation ou alternative possible.',
    'Action livreur: attendre confirmation vendeur, puis utiliser adresse, instructions et lien Maps.',
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

function extractLocality(value: string) {
  const firstSegment = value.split('—')[0]?.split(',')[0]?.trim();
  return firstSegment || 'Localité client non fournie';
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return 'Prix à confirmer';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}
