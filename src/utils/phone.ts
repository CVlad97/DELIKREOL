// Validation téléphone Martinique
// Formats acceptés :
//   0696xxxxxx
//   0697xxxxxx
//   +596696xxxxxx
//   +596697xxxxxx
//   596696xxxxxx
//   596697xxxxxx

export function validateMartiniquePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return false;

  const cleaned = phone.replace(/[\s+]/g, '');
  if (cleaned === '0') return false;
  if (cleaned.replace(/\D/g, '').length < 8) return false;

  // Martinique : commence par 0696, 0697, 596696, 596697
  return /^(?:0(?:696|697)\d{6}|(?:596)?(?:696|697)\d{6})$/.test(cleaned);
}

export const PHONE_ERROR_MESSAGE =
  "Merci d'indiquer un numéro WhatsApp valide, par exemple 0696 XX XX XX ou +596 696 XX XX XX.";