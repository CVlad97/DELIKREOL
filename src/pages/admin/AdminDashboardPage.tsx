import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PartnerSubmission {
  code: string; partnerName: string; responsable: string; telephone: string;
  commune: string; description: string; horaires: string; plats: string;
  prix: string; remarques: string; status: string; created_at: string;
}

interface SiteEvent {
  type: string; code: string; time: string;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<PartnerSubmission[]>([]);
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    document.title = 'Dashboard coordinateur — DELIKREOL';
    try {
      setSubmissions(JSON.parse(localStorage.getItem('delikreol_partner_submissions') || '[]'));
      setEvents(JSON.parse(localStorage.getItem('delikreol_site_events') || '[]'));
      setMessages(JSON.parse(localStorage.getItem('delikreol_contact_messages') || '[]'));
    } catch { /* empty */ }
    // Auto refresh
    const interval = setInterval(() => setRefresh(r => r + 1), 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  const unreadMessages = messages.filter((m: any) => m.status === 'unread').length;
  const newSubmissions = submissions.filter(s => s.status === 'pending').length;
  const partnersOpened = [...new Set(events.filter(e => e.type === 'partner_access_opened').map(e => e.code))];

  const partnerLinks = [
    { name: "Coco's Food", code: 'COCO-PILOTE' },
    { name: 'Les Délices de Ninice', code: 'NINICE-PILOTE' },
    { name: "Saveurs d'Afrique", code: 'SAVEURS-PILOTE' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black mb-6">📊 Dashboard coordinateur</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4"><p className="text-3xl font-black text-orange-600">{events.length}</p><p className="text-xs text-gray-500">Visites partenaires</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-3xl font-black text-orange-600">{unreadMessages}</p><p className="text-xs text-gray-500">Messages non lus</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-3xl font-black text-orange-600">{newSubmissions}</p><p className="text-xs text-gray-500">Corrections reçues</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-3xl font-black text-orange-600">{partnersOpened.length}/3</p><p className="text-xs text-gray-500">Partenaires connectés</p></div>
      </div>

      {/* Alertes */}
      {(newSubmissions > 0 || unreadMessages > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="font-bold text-amber-800 mb-2">🔔 Actions à faire</p>
          {newSubmissions > 0 && <p className="text-sm text-amber-700">• {newSubmissions} correction(s) partenaire à traiter</p>}
          {unreadMessages > 0 && <p className="text-sm text-amber-700">• {unreadMessages} message(s) non lu(s)</p>}
          {partnersOpened.length < 3 && <p className="text-sm text-amber-700">• {3 - partnersOpened.length} partenaire(s) n'ont pas encore ouvert leur accès</p>}
        </div>
      )}

      {/* Accès partenaires */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-3">📋 Accès partenaires</h2>
        <div className="space-y-2">
          {partnerLinks.map(p => {
            const opened = partnersOpened.includes(p.code);
            return (
              <div key={p.code} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="font-semibold">{p.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${opened ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {opened ? '✅ Ouvert' : '⏳ Pas encore'}
                </span>
                <code className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{p.code}</code>
                <button onClick={() => navigator.clipboard.writeText(`https://cvlad97.github.io/DELIKREOL/partenaire?code=${p.code}`)} className="text-xs text-orange-600 hover:underline">Copier lien</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-3">💬 Messages reçus</h2>
          <div className="space-y-2">
            {messages.slice(-5).reverse().map((m: any, i: number) => (
              <div key={i} className="text-sm p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold">{m.nom || 'Anonyme'} <span className="text-gray-400 text-xs">{m.sujet}</span></p>
                <p className="text-gray-600 text-xs">{m.message?.slice(0, 100)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections */}
      {submissions.length > 0 && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-3">📝 Corrections partenaires</h2>
          <div className="space-y-3">
            {submissions.slice(-5).reverse().map((s, i) => (
              <div key={i} className="text-sm p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold">{s.partnerName} <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{s.status}</span></p>
                <p className="text-xs text-gray-500">{s.description?.slice(0, 80)}</p>
                {s.remarques && <p className="text-xs text-orange-600 mt-1">📌 {s.remarques.slice(0, 80)}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(s.created_at).toLocaleString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export pack */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-3">📤 Pack export</h2>
        <div className="space-y-2 text-sm">
          {partnerLinks.map(p => (
            <div key={p.code} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="font-semibold w-44">{p.name}</span>
              <button onClick={() => navigator.clipboard.writeText(`https://cvlad97.github.io/DELIKREOL/partenaire?code=${p.code}`)} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200">Copier lien</button>
              <button onClick={() => navigator.clipboard.writeText(`Bonjour,\n\nVotre espace pilote DELIKREOL est prêt.\n\nLien :\nhttps://cvlad97.github.io/DELIKREOL/partenaire?code=${p.code}\n\nCe lien vous permet d'envoyer vos corrections.\n\nVladimir — DELIKREOL`)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200">Copier message WhatsApp</button>
            </div>
          ))}
        </div>
      </div>

      {/* Activité */}
      {events.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-bold mb-3">🕐 Activité récente</h2>
          <div className="space-y-1 text-xs">
            {events.slice(-10).reverse().map((e, i) => (
              <p key={i} className="text-gray-500"><span className="text-gray-400">{new Date(e.time).toLocaleString('fr-FR')}</span> — {e.code} a ouvert son accès</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}