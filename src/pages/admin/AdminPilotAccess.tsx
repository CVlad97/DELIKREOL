import { useMemo, useState } from'react';
import { partnerProfiles } from '../../data/partnerProfiles';
import { additionalPartnerProfiles } from '../../data/additionalPartnerProfiles';
import { Copy, ExternalLink, MessageCircle, ShieldCheck } from'lucide-react';

const PILOT_PARTNERS = [
 { name:"Saveurs d'Afrique", code:'SAVEURS-PILOTE', contact:'' },
 { name:"Coco's Food", code:'COCO-PILOTE', contact:'' },
 { name:'Les Délices de Ninice', code:'NINICE-PILOTE', contact:'' },
 { name:'Sweet Family Traiteur Orianne', code:'SWEETFAMILY-PILOTE', contact:'' },
 { name:'Virtuel Gouté Mwen', code:'GOUTE-MWEN-PILOTE', contact:'' },
 { name:"Snack Savè Peyi'A", code:'SAVE-PEYI-PILOTE', contact:'' },
];

const INVITEABLE_PARTNERS = [...partnerProfiles, ...additionalPartnerProfiles]
 .filter((partner) => partner.name !== 'An Tjè Coco' && partner.name !== 'Chef à Mada')
 .filter((partner) => partner.type.toLowerCase().includes('traiteur'))
 .filter((partner, index, all) => all.findIndex((item) => item.name === partner.name) === index);

function normalizePhone(phone?: string) {
 const digits = (phone || '').replace(/\D/g, '');
 if (digits.startsWith('596') && digits.length === 12) return digits;
 if (digits.startsWith('0') && digits.length === 10) return `596${digits.slice(1)}`;
 if (digits.startsWith('696') && digits.length === 9) return `596${digits}`;
 return null;
}

function prepareInvitation(name: string, event: boolean, access: boolean, baseUrl: string) {
 const paragraphs = [`Bonjour ${name},`, 'Je vous contacte pour DELIKREOL, la plateforme qui met en avant les traiteurs martiniquais.'];
 if (event) paragraphs.push('Le collectif Chef à Mada organise le vendredi 11 décembre 2026 au Lamentin un concours et une exposition culinaires : dégustations, créations salées, sucrées et cocktails. Souhaiteriez-vous recevoir les modalités pour y participer ?');
 if (access) paragraphs.push(`Je vous propose également de vérifier votre fiche DELIKREOL et de préparer votre espace professionnel : ${baseUrl}/partenaire. Pour l’activation, nous confirmerons ensemble vos coordonnées, horaires, menus, prix, allergènes et informations professionnelles.`);
 paragraphs.push('Pouvez-vous me confirmer votre intérêt et les informations à mettre à jour ? Merci et à bientôt !', 'L’équipe DELIKREOL');
 return paragraphs.join('\n\n');
}

function getBaseUrl() {
 if (typeof window ==='undefined') return'https://delikreol.com';
 const base = import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL ||'/';
 const cleanedBase = base.endsWith('/') ? base.slice(0, -1) : base;
 return `${window.location.origin}${cleanedBase}`;
}

function buildMessage(name: string, link: string) {
 return `Bonjour, voici votre accès pilote DELIKREOL pour vérifier votre fiche avant lancement :\n\n${link}\n\nMerci de tester sur téléphone et de me dire si :\n1. le lien s'ouvre bien\n2. vous pouvez corriger votre fiche\n3. un bouton ou une page bloque\n\nCe lien est provisoire, pas un mot de passe définitif. Si ça bloque, envoyez-moi une capture d'écran ici.\n\nMerci ${name}`;
}

export default function AdminPilotAccess() {
 const [copied, setCopied] = useState<string | null>(null);
 const [eventInvite, setEventInvite] = useState(true);
 const [accessInvite, setAccessInvite] = useState(true);
 const [selected, setSelected] = useState<string[]>([]);
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
 <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Pilote partenaires</p>
 <h1 className="text-3xl font-black text-foreground">Accès de test DELIKREOL</h1>
 <p className="text-muted-foreground mt-2 max-w-3xl">
 Utilise ces liens pour un test réel limité. Ce ne sont pas des mots de passe : ce sont des accès pilotes pour corriger les fiches partenaires.
 </p>
 </div>

 <div className="rounded-2xl border border-input bg-muted p-5">
 <div className="flex items-start gap-3">
 <ShieldCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
 <div>
 <h2 className="font-bold text-amber-900">Règle de sécurité</h2>
 <p className="text-sm text-muted-foreground mt-1">
 Envoie d'abord à 1 partenaire de confiance. Les corrections sont sauvegardées côté navigateur si Supabase n'est pas configuré et envoyables par WhatsApp.
 Ne partage jamais l'accès admin.
 </p>
 </div>
 </div>
 </div>

 <section className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-5" aria-labelledby="campagne-chef-mada">
 <h2 id="campagne-chef-mada" className="text-xl font-black text-[#6b2b15]">Campagne partenaires · Chef à Mada & activation DELIKREOL</h2>
 <p className="mt-2 text-sm text-[#633d2a]">Vendredi 11 décembre 2026 au Lamentin. Préparez des messages humains personnalisés et ouvrez WhatsApp ou votre messagerie pour confirmer chaque envoi. Aucune diffusion automatique ni inscription au concours n'est déclenchée.</p>
 <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
 <label className="flex items-center gap-2"><input type="checkbox" checked={eventInvite} onChange={(e) => setEventInvite(e.target.checked)} /> Concours Chef à Mada</label>
 <label className="flex items-center gap-2"><input type="checkbox" checked={accessInvite} onChange={(e) => setAccessInvite(e.target.checked)} /> Activation de l'espace partenaire</label>
 </div>
 <p className="mt-4 text-sm text-[#633d2a]">{selected.length} contact(s) sélectionné(s) · vérifiez l'accord du destinataire pour la prospection avant l'envoi.</p>
 <div className="mt-3 flex flex-wrap gap-2">
 <button type="button" className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-bold" onClick={() => setSelected(INVITEABLE_PARTNERS.map((partner) => partner.name))}>Tout sélectionner</button>
 <button type="button" className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-bold" onClick={() => setSelected([])}>Effacer la sélection</button>
 <button type="button" disabled={!selected.length || (!eventInvite && !accessInvite)} className="rounded-lg bg-[#75351f] px-3 py-2 text-sm font-bold text-white disabled:opacity-40" onClick={() => copyText('campagne', INVITEABLE_PARTNERS.filter((partner) => selected.includes(partner.name)).map((partner) => `${partner.name} | ${partner.contactEmail || 'email à confirmer'} | ${partner.contactPhone || 'téléphone à confirmer'}\n${prepareInvitation(partner.name, eventInvite, accessInvite, baseUrl)}`).join('\n\n---\n\n'))}>Copier les messages sélectionnés</button>
 </div>
 <div className="mt-4 grid gap-3 md:grid-cols-2">
 {INVITEABLE_PARTNERS.map((partner) => {
 const phone = normalizePhone(partner.contactPhone);
 const message = prepareInvitation(partner.name, eventInvite, accessInvite, baseUrl);
 return <div key={partner.name} className="rounded-xl border border-orange-200 bg-white p-4">
 <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1" checked={selected.includes(partner.name)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, partner.name] : current.filter((name) => name !== partner.name))} /><span className="font-black">{partner.name}</span></label>
 <p className="mt-2 text-xs text-muted-foreground">{partner.contactEmail || 'Adresse e-mail à vérifier'} · {partner.contactPhone || 'Téléphone à vérifier'}</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {phone && (eventInvite || accessInvite) && <a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">WhatsApp personnel</a>}
 {partner.contactEmail && (eventInvite || accessInvite) && <a href={`mailto:${partner.contactEmail}?subject=${encodeURIComponent('DELIKREOL — Chef à Mada / espace partenaire')}&body=${encodeURIComponent(message)}`} className="rounded-lg border px-3 py-2 text-xs font-black">Préparer l’e-mail</a>}
 <button type="button" className="rounded-lg border px-3 py-2 text-xs font-black" onClick={() => copyText(partner.name, message)}>Copier</button>
 </div>
 </div>;
 })}
 </div>
 <p className="mt-4 text-xs text-[#6b503f]">Mode groupé : préparation et copie de messages individualisés. WhatsApp n'autorise pas ici l'envoi automatique à plusieurs numéros ; aucun message n'est envoyé sans votre action.</p>
 </section>

 <div className="grid gap-4">
 {PILOT_PARTNERS.map((partner) => {
 const link = `${baseUrl}/partenaire?code=${encodeURIComponent(partner.code)}`;
 const message = buildMessage(partner.name, link);
 const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

 return (
 <div key={partner.code} className="rounded-2xl border border-input bg-white p-5 shadow-sm">
 <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
 <div className="min-w-0">
 <h2 className="text-xl font-black text-foreground">{partner.name}</h2>
 <p className="text-sm text-muted-foreground mt-1">Code pilote : <span className="font-mono font-bold">{partner.code}</span></p>
 <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all mt-2 inline-flex items-center gap-1">
 {link}
 <ExternalLink className="w-3 h-3" />
 </a>
 </div>

 <div className="flex flex-wrap gap-2 shrink-0">
 <button onClick={() => copyText(partner.code, link)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-input text-sm font-bold hover:bg-muted">
 <Copy className="w-4 h-4" /> Lien
 </button>
 <button onClick={() => copyText(`${partner.code}-msg`, message)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-input text-sm font-bold hover:bg-muted">
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

 <div className="rounded-2xl border border-input bg-white p-5">
 <h2 className="font-black text-foreground mb-3">Checklist test réel</h2>
 <ol className="list-decimal pl-5 text-sm text-foreground space-y-2">
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
