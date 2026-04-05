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

function parseCsvRow(line: string): string[] {
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
    if (char === ',' && !inQuotes) {
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
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseCsvRow(line));
}

function rowsToObjects<T>(rows: string[][]): T[] {
  const [header, ...data] = rows;
  if (!header) return [] as T[];
  return data.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((key, index) => {
      obj[key] = row[index] ?? '';
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
  return ['true', '1', 'yes', 'oui'].includes(String(value).toLowerCase());
}

export function normalizeNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return Number(String(value).replace(',', '.')) || 0;
}
