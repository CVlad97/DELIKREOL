import { useState } from 'react';

export default function UpdatePage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Votre panier et votre connexion seront conservés.');
  async function update() {
    setBusy(true);
    setMessage('Vérification de la dernière version…');
    try {
      const response = await fetch(`/release.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Version indisponible');
      await response.json();
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter(r => new URL(r.scope).origin === location.origin).map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('workbox-') || k.startsWith('delikreol-')).map(k => caches.delete(k)));
      }
      location.replace(`/traiteur/langouste-house/?mise-a-jour=${Date.now()}`);
    } catch {
      setMessage('Vérifiez votre connexion puis réessayez.');
      setBusy(false);
    }
  }
  return <main className="mx-auto max-w-lg px-6 py-16"><h1 className="text-3xl font-bold">Mettre DeliKreol à jour</h1><p role="status" className="my-6">{message}</p><button disabled={busy} onClick={() => void update()} className="rounded-xl bg-primary px-5 py-4 font-bold text-white disabled:opacity-60">{busy ? 'Mise à jour…' : 'Mettre à jour et ouvrir Langouste House'}</button></main>;
}
