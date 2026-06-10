// ID commande unique DeliKreol
// Format : DK-YYYYMMDD-RANDOM (ex: DK-20260610-A7F3KQ)

export function generateOrderId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  // Génère 6 caractères aléatoires (A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  const randomPart = Array.from(randomBytes)
    .map((b) => chars[b % chars.length])
    .join('');

  return `DK-${datePart}-${randomPart}`;
}