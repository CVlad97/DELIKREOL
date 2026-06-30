import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { validateMartiniquePhone } from '../../utils/validation';

const WHATSAPP_NUMBER = '596696653589';

export function DevenirPointRelaisPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ business_name: '', manager_name: '', phone: '', whatsapp: '', email: '', commune: '', address: '', opening_hours: '', capacity: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.business_name || !form.phone || !form.commune) { setError('Nom, téléphone et commune requis'); return; }
    if (!validateMartiniquePhone(form.phone)) { setError('Téléphone Martinique invalide (0696/0697)'); return; }
    try {
      const { supabase } = await import('../../lib/supabase');
      if (supabase) {
        const { error: dbErr } = await supabase.from('relay_point_applications').insert([{ ...form }]);
        if (dbErr) throw dbErr;
      } else throw new Error('supabase non disponible');
    } catch {
      const existing = JSON.parse(localStorage.getItem('delikreol_relay_applications') || '[]');
      existing.push({ ...form, id: crypto.randomUUID(), status: 'candidat', created_at: new Date().toISOString() });
      localStorage.setItem('delikreol_relay_applications', JSON.stringify(existing));
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-2xl font-bold mb-2">Merci pour votre candidature</h1>
          <p className="text-gray-500 mb-6">DELIKREOL vous recontactera sous 48h.</p>
          <p className="text-sm text-gray-400 mb-8">Vous avez une question ? Contactez-nous sur WhatsApp.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je viens de candidater comme point relais DELIKREOL.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all">💬 Nous contacter</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Devenir point relais</h1>
        <p className="text-gray-500 mb-8">Proposez votre commerce comme point de retrait et dépôt DELIKREOL.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">Nom de l'établissement *</label><input value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          <div><label className="block text-sm font-semibold mb-1">Responsable</label><input value={form.manager_name} onChange={e => handleChange('manager_name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold mb-1">Téléphone *</label><input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="0696 XX XX XX" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
            <div><label className="block text-sm font-semibold mb-1">WhatsApp</label><input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="0696..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Email</label><input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          <div><label className="block text-sm font-semibold mb-1">Commune *</label>
            <select value={form.commune} onChange={e => handleChange('commune', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400">
              <option value="">Sélectionner une commune</option>
              {martiniqueCommunes.slice(0, 34).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Adresse</label><input value={form.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          <div><label className="block text-sm font-semibold mb-1">Horaires d'ouverture</label><input value={form.opening_hours} onChange={e => handleChange('opening_hours', e.target.value)} placeholder="ex: Lun-Sam 8h-19h" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          <div><label className="block text-sm font-semibold mb-1">Capacité (colis/jour)</label><input value={form.capacity} onChange={e => handleChange('capacity', e.target.value)} placeholder="ex: 30" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" /></div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:scale-[1.02] transition-all">Envoyer ma candidature</button>
        </form>
      </div>
    </Layout>
  );
}