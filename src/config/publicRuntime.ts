function envFlag(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export const PUBLIC_CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || 'contact@delikreol.mq').trim();
export const PUBLIC_OPERATIONS_EMAIL = (import.meta.env.VITE_OPERATIONS_EMAIL || PUBLIC_CONTACT_EMAIL).trim();

export const ORDER_FORM_URL = (import.meta.env.VITE_ORDER_FORM_URL || '').trim();
export const FREE_MODE_ENABLED = envFlag(import.meta.env.VITE_FREE_MODE);
export const ORDER_MODE = String(import.meta.env.VITE_ORDER_MODE || '')
  .trim()
  .toLowerCase();
export const SHEETS_FIRST_MODE = FREE_MODE_ENABLED || ORDER_MODE === 'sheets_first' || ORDER_MODE === 'sheets-first';
