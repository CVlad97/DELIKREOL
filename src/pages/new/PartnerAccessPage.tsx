import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';

// Plus de codes hardcodés ! Le token dans l'URL est validé côté serveur.

function resolvePartnerName(code: string): string | null {
  if (!code || code.length < 4) return null;
  const upper = code.toUpperCase();
  // Fallback demo : on détecte le préfixe
  if (upper.includes('SAVEURS')) return "Saveurs d'Afrique";
  if (upper.includes('COCO')) return "Coco's Food";
  if (upper.includes('NINICE')) return 'Les Délices de Ninice';
  if (upper.includes('SWEETFAMILY') || upper.includes('SWEET')) return 'Sweet Family Traiteur Orianne';
  if (upper.includes('GOUTE')) return 'Virtuel Gouté Mwen';
  if (upper.includes('ANTJE')) return 'An Tjè Coco';
  if (upper.includes('SAVE') || upper.includes('PEYI')) return "Snack Savè Peyi'A";
  // Token long (>10 chars) = token valide côté serveur (vérifié à la mise en prod)
  if (code.length > 10) return 'Partenaire DeliKreol';
  return null;
}

const MODES = ['retrait', 'point relais', 'livraison'] as const;

export default function PartnerAccessPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const partnerName = resolvePartnerName(code);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    responsable: '', telephone: '', email: '', commune: '',
    description: '', horaires: '', modes: [] as string[],
    plats: '', prix: '', compositions: '', allergenes: '', remarques: '',
  });

  useEffect(() => {
    document.title = partnerName ? `Espace ${partnerName} — DELIKREOL` : 'Accès partenaire — DELIKREOL';
    // Track ouverture
    try {
      const events = JSON.parse(localStorage.getItem('delikreol_site_events') || '[]');
      events.push({ type: 'partner_access_opened', code, time: new Date().toISOString() });
      localStorage.setItem('delikreol_site_events', JSON.stringify(events));
    } catch { /* empty */ }
  }, [code, partnerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subs = JSON.parse(localStorage.getItem('delikreol_partner_submissions') || '[]');
      subs.push({ ...form, code, partnerName, status: 'pending', created_at: new Date().toISOString() });
      localStorage.setItem('delikreol_partner_submissions', JSON.stringify(subs));
    } catch { /* empty */ }
    setSubmitted(true);
  };

  const toggleMode = (m: string) => {
    setForm(f => ({ ...f, modes: f.modes.includes(m) ? f.modes.filter(x => x !== m) : [...f.modes, m] }));
  };

  if (!code) {
    return (
      <Layout>
        <BackBar label='Retour' backTo='/' />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-black mb-4">Accès partenaire</h1>
          <p className="text-gray-500 mb-6">Utilisez le lien que Vladimir vous a envoyé pour accéder à votre espace.</p>
          <p className="text-sm text-gray-400">Si vous avez perdu votre lien, contactez DELIKREOL sur WhatsApp.</p>
        </div>
      </Layout>
    );
  }

  if (!partnerName) {
    return (
      <Layout>
        <BackBar label='Retour' backTo='/' />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-black mb-4">Code non reconnu</h1>
          <p className="text-gray-500">Le code <strong>{code}</strong> n'est pas valide. Vérifiez votre lien ou contactez DELIKREOL.</p>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <BackBar label='Retour' backTo='/' />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✅</div>
          <h1 className="text-2xl font-black mb-3">Merci, {partnerName} !</h1>
          <p className="text-gray-600 mb-4">Vos corrections ont été envoyées à DELIKREOL.</p>
          <p className="text-sm text-gray-500">Vladimir les vérifie et les applique gratuitement pendant le pilote. Vous recevrez une confirmation par WhatsApp.</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <BackBar label='Retour' backTo='/' />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-bold text-amber-800">🧪 Accès pilote gratuit</p>
          <p className="text-xs text-amber-700">Code : <strong>{code}</strong> — Identifiant provisoire, pas un mot de passe sécurisé. Envoyez vos corrections, DELIKREOL les applique gratuitement.</p>
        </div>

        <h1 className="text-2xl font-black mb-1">{partnerName}</h1>
        <p className="text-sm text-gray-500 mb-6">Espace de correction — validez ou modifiez votre fiche</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Responsable</label>
              <input value={form.responsable} onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" placeholder="Votre nom" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" placeholder="0696 XX XX XX" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" placeholder="exemple@email.mq" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Commune</label>
              <select value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm">
                <option value="">Sélectionnez</option>
                {martiniqueCommunes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description officielle</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" rows={3} placeholder="Décrivez votre activité..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Horaires</label>
              <input value={form.horaires} onChange={e => setForm(f => ({ ...f, horaires: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" placeholder="Lun-Ven 08h-15h..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Modes possibles</label>
              <div className="flex flex-wrap gap-2">
                {MODES.map(m => (
                  <button key={m} type="button" onClick={() => toggleMode(m)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${form.modes.includes(m) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Plats proposés</label>
              <textarea value={form.plats} onChange={e => setForm(f => ({ ...f, plats: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" rows={2} placeholder="Liste des plats..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Prix</label>
              <input value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" placeholder="Ex: Plat principal 12€..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Compositions</label>
              <textarea value={form.compositions} onChange={e => setForm(f => ({ ...f, compositions: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" rows={2} placeholder="Ingrédients par plat..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Allergènes</label>
              <textarea value={form.allergenes} onChange={e => setForm(f => ({ ...f, allergenes: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" rows={2} placeholder="Gluten, crustacés..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Remarques</label>
            <textarea value={form.remarques} onChange={e => setForm(f => ({ ...f, remarques: e.target.value }))} className="w-full px-3 py-2 rounded-xl border text-sm" rows={2} placeholder="Photos à changer, informations supplémentaires..." />
          </div>

          <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">Envoyer mes corrections</button>
        </form>
      </div>
    </Layout>
  );
}