import { useMemo, useState } from 'react';
import { Copy, ExternalLink, MessageCircle, ShieldCheck } from 'lucide-react';

const PILOT_PARTNERS = [
  { name: "Saveurs d'Afrique", code: 'SAVEURS-PILOTE', contact: '' },
  { name: "Coco's Food", code: 'COCO-PILOTE', contact: '' },
  { name: 'Les Délices de Ninice', code: 'NINICE-PILOTE', contact: '' },
  { name: 'Sweet Family Traiteur Orianne', code: 'SWEETFAMILY-PILOTE', contact: '' },
  { name: 'Virtuel Gouté Mwen', code: 'GOUTE-MWEN-PILOTE', contact: '' },
  { name: 'An Tjè Coco', code: 'ANTJE-COCO-PILOTE', contact: '' },
  { name: "Snack Savè Peyi'A", code: 'SAVE-PEYI-PILOTE', contact: '' },
];

function getBaseUrl() {
  if (typeof window === 'undefined') return 'https://cvlad97.github.io/DELIKREOL';
  const base = import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || '/DELIKREOL/';
  const cleanedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${window.location.origin}${cleanedBase}`;
}

function buildMessage(name: string, link: string) {
  return `Bonjour, voici votre accès pilote DELIKREOL pour vérifier votre fiche avant lancement :\n\n${link}\n\nMerci de tester sur téléphone et de me dire si :\n1. le lien s'ouvre bien\n2. vous pouvez corriger votre fiche\n3. un bouton ou une page bloque\n\nCe lien est provisoire, pas un mot de passe définitif. Si ça bloque, envoyez-moi une capture d'écran ici.\n\nMerci ${name}`;
}

export default function AdminPilotAccess() {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = useMemo(() => getBaseUrl(), []);

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied('Erreur copie');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Pilote partenaires</p>
        <h1 className="text-3xl font-black text-gray-900">Accès de test DELIKREOL</h1>
        <p className="text-gray-600 mt-2 max-w-3xl">
          Utilise ces liens pour un test réel limité. Ce ne sont pas des mots de passe : ce sont des accès pilotes pour corriger les fiches partenaires.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5" />
          <div>
            <h2 className="font-bold text-amber-900">Règle de sécurité</h2>
            <p className="text-sm text-amber-800 mt-1">
              Envoie d'abord à 1 partenaire de confiance. Les corrections sont sauvegardées côté navigateur si Supabase n'est pas configuré et envoyables par WhatsApp.
              Ne partage jamais l'accès admin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {PILOT_PARTNERS.map((partner) => {
          const link = `${baseUrl}/partenaire?code=${encodeURIComponent(partner.code)}`;
          const message = buildMessage(partner.name, link);
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

          return (
            <div key={partner.code} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-gray-900">{partner.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Code pilote : <span className="font-mono font-bold">{partner.code}</span></p>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline break-all mt-2 inline-flex items-center gap-1">
                    {link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button onClick={() => copyText(partner.code, link)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">
                    <Copy className="w-4 h-4" /> Lien
                  </button>
                  <button onClick={() => copyText(`${partner.code}-msg`, message)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">
                    <Copy className="w-4 h-4" /> Message
                  </button>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {copied && <div className="fixed bottom-5 right-5 rounded-xl bg-gray-900 text-white px-4 py-3 text-sm font-bold shadow-lg">Copié : {copied}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-black text-gray-900 mb-3">Checklist test réel</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Tester le lien en navigation privée sur téléphone.</li>
          <li>Vérifier que le nom partenaire s'affiche.</li>
          <li>Remplir responsable, téléphone, commune, modes, plats/prix.</li>
          <li>Envoyer les corrections.</li>
          <li>Demander une capture si le partenaire est bloqué.</li>
          <li>Ne pas envoyer plus de 3 liens avant validation du premier retour.</li>
        </ol>
      </div>
    </div>
  );
}
