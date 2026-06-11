// DELIKREOL — Validation téléphone + adresse

export function validateMartiniquePhone(phone: string): boolean {
  if (!phone || phone.trim() === '0' || phone.trim() === '') return false;
  const cleaned = phone.replace(/[\s+]/g, '');
  if (cleaned === '0') return false;
  if (cleaned.length < 8) return false;
  const valid = /^(?:0(?:696|697)\d{6}|(?:596)?(?:696|697)\d{6})$/.test(cleaned);
  return valid;
}

export const PHONE_ERROR_MESSAGE = 'Merci d\'indiquer un numéro WhatsApp valide, par exemple 0696 XX XX XX ou +596 696 XX XX XX.';

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s+]/g, '');
  if (cleaned.startsWith('0')) return '+596' + cleaned.slice(1);
  if (cleaned.startsWith('596')) return '+' + cleaned;
  return phone;
}

export function validateCommune(commune: string, communes: string[]): boolean {
  return communes.some(c => c.toLowerCase() === commune.toLowerCase().trim());
}

export function validateAddress(address: string, commune: string): boolean {
  if (!address || address.trim().length < 5) return false;
  if (!commune || commune.trim().length < 3) return false;
  return true;
}