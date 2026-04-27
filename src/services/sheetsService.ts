export interface SheetProductRow {
  id?: string;
  name: string;
  vendor: string;
  price: number | string;
  category?: string;
  description?: string;
  image_url?: string;
  image?: string;
  zone?: string;
  available?: string | boolean;
  is_available?: string | boolean;
}

export interface SheetVendorRow {
  id?: string;
  business_name: string;
  business_type?: string;
  description?: string;
  phone?: string;
  address?: string;
  is_active?: string | boolean;
}

const isJsonUrl = (url: string) => url.endsWith('.json') || url.includes('format=json');

const HEADER_ALIASES: Record<string, string> = {
  nom: 'name',
  name: 'name',
  prix: 'price',
  price: 'price',
  image: 'image_url',
  image_url: 'image_url',
  imageurl: 'image_url',
  image_url_: 'image_url',
  imageurl_: 'image_url',
  vendeur: 'vendor',
  vendor: 'vendor',
  disponible: 'available',
  available: 'available',
  is_available: 'available',
  isavailable: 'available',
  disponibilite: 'available',
  categorie: 'category',
  category: 'category',
  description: 'description',
  desc: 'description',
  zone: 'zone',
  id: 'id'
};

function detectDelimiter(line: string): string {
  const commaCount = (line.match(/,/g) || []).length;
  const semiCount = (line.match(/;/g) || []).length;
  return semiCount > commaCount ? ';' : ',';
}

function parseCsvRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return [];
  const delimiter = detectDelimiter(lines[0]);
  return lines.map((line) => parseCsvRow(line, delimiter));
}

function normalizeHeaderKey(rawKey: string): string {
  const base = rawKey.replace(/^\uFEFF/, '').trim().toLowerCase();
  const cleaned = base.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return HEADER_ALIASES[cleaned] ?? cleaned;
}

function rowsToObjects<T>(rows: string[][]): T[] {
  const [header, ...data] = rows;
  if (!header) return [] as T[];
  const normalizedHeader = header.map((rawKey) => normalizeHeaderKey(rawKey));
  return data.map((row) => {
    const obj: Record<string, string> = {};
    normalizedHeader.forEach((key, index) => {
      const value = (row[index] ?? '').trim();
      if (!value) return;
      if (obj[key]) return;
      obj[key] = value;
    });
    return obj as T;
  });
}

export async function fetchSheetData<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sheets fetch failed');
  if (isJsonUrl(url)) {
    return (await res.json()) as T[];
  }
  const text = await res.text();
  return rowsToObjects<T>(parseCsv(text));
}

export function normalizeBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const normalized = String(value).toLowerCase().trim();
  if (['false', '0', 'no', 'non'].includes(normalized)) return false;
  return ['true', '1', 'yes', 'oui', 'vrai'].includes(normalized);
}

export function normalizeNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return Number.NaN;
  let cleaned = String(value).trim();
  if (!cleaned) return Number.NaN;
  cleaned = cleaned.replace(/[^\d,.-]/g, '');
  cleaned = cleaned.replace(/,/g, '.');
  const firstDot = cleaned.indexOf('.');
  if (firstDot >= 0) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : Number.NaN;
}
