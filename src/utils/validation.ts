// DELIKREOL — Validation téléphone + email + adresse (P0)

export function validateMartiniquePhone(phone: string): boolean {
  if (!phone || phone.trim() === '0' || phone.trim() === '') return false;
  const cleaned = phone.replace(/[\s+._\-]/g, '');
  if (cleaned === '0' || cleaned.length < 10) return false;
  // Accepted formats: 0696xxxxxx, 0697xxxxxx, +596696xxxxxx, +596697xxxxxx, 596696xxxxxx, 596697xxxxxx
  return /^(?:0|596|00596)?(?:696|697)\d{6}$/.test(cleaned);
}

export const PHONE_ERROR_MESSAGE = 'Merci d\'indiquer un numéro WhatsApp valide, par exemple 0696 XX XX XX ou +596 696 XX XX XX.';

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s+.\-_]/g, '');
  if (cleaned.startsWith('0')) return '+596' + cleaned.slice(1);
  if (cleaned.startsWith('596')) return '+' + cleaned;
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const EMAIL_ERROR_MESSAGE = 'Merci d\'indiquer une adresse email valide (ex: nom@domaine.fr).';

export function validateCommune(commune: string, communes: string[]): boolean {
  return communes.some(c => c.toLowerCase() === commune.toLowerCase().trim());
}

export function validateAddress(address: string, commune: string): boolean {
  if (!address || address.trim().length < 5) return false;
  if (!commune || commune.trim().length < 3) return false;
  return true;
}