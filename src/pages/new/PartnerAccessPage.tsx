import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { isDemoMode, supabase } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';
const STORAGE_KEY = 'delikreol_partner_submissions';

const PILOT_PARTNERS = [
  { code: 'SAVE-PEYIA-PILOTE', name: "Snack Savè Peyi'A", label: 'Save Peyi’A', zone: 'Rivière-Pilote — Pont de Fer', contact: '+596 696 00 27 64' },
  { code: 'SAVEURS-PILOTE', name: "Saveurs d'Afrique", label: 'Saveurs d’Afrique', zone: 'Cluny / Fort-de-France', contact: '0596 68 12 25' },
  { code: 'COCO-PILOTE', name: "Coco's Food", label: "Coco's Food", zone: 'Rivière-Pilote', contact: '+596 696 25 47 20' },
  { code: 'NINICE-PILOTE', name: 'Les Délices de Ninice', label: 'Les Délices de Ninice', zone: 'Fort-de-France', contact: '+596 696 01 93 21' },
  { code: 'SWEETFAMILY-PILOTE', name: 'Sweet Family Traiteur Orianne', label: 'Sweet Family', zone: 'Martinique', contact: '+596 696 88 75 28' },
  { code: 'GOUTE-MWEN-PILOTE', name: 'Gouté Mwen', label: 'Gouté Mwen', zone: 'Martinique', contact: '+596 696 16 61 93' },
];

const READINESS_TASKS = [
  { id: 'identity', title: 'Identité et contact', detail: 'Nom du responsable, téléphone, email, commune.' },
  { id: 'documents', title: 'Documents', detail: 'SIRET/Kbis ou statut, RIB, assurance, hygiène/HACCP si disponible.' },
  { id: 'catalogue', title: 'Catalogue', detail: 'Plats, prix, photos et disponibilité réelle.' },
  { id: 'composition', title: 'Composition menu', detail: 'Accompagnements, boissons, suppléments et allergènes.' },
  { id: 'operations', title: 'Opérations', detail: 'Retrait, livraison, point relais, capacité et horaires.' },
  { id: 'surplus', title: 'Invendus', detail: 'Panier du jour/lendemain à prix réduit façon anti-gaspillage.' },
  { id: 'events', title: 'Événements', detail: 'Mise à l’honneur, vidéo, repas à gagner, Chef à Mada/GIE.' },
  { id: 'test', title: 'Commande test', detail: 'Commande annulable : aucune préparation, aucun paiement réel.' },
] as const;

type ReadinessId = typeof READINESS_TASKS[number]['id'];
type SubmitStatus = 'idle' | 'saving' | 'saved' | 'local_only' | 'error';

type PartnerForm = {
  responsable: string;
  telephone: string;
  email: string;
  commune: string;
  description: string;
  horaires: string;
  modes: string[];
  plats: string;
  prix: string;
  compositions: string;
  allergenes: string;
  documents: string;
  invendus: string;
  events: string;
  remarques: string;
};

const MODES = ['retrait', 'point relais', 'livraison'] as const;

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function resolvePartner(code: string) {
  const upper = normalizeCode(code);
  if (!upper) return null;
  const direct = PILOT_PARTNERS.find((p) => p.code === upper);
  if (direct) return direct;
  if (upper.includes('SAVEURS')) return PILOT_PARTNERS[1];
  if (upper.includes('COCO')) return PILOT_PARTNERS[2];
  if (upper.includes('NINICE')) return PILOT_PARTNERS[3];
  if (upper.includes('SWEET')) return PILOT_PARTNERS[4];
  if (upper.includes('GOUTE')) return PILOT_PARTNERS[5];
  if (upper.includes('SAVE') || upper.includes('PEYI')) return PILOT_PARTNERS[0];
  return null;
}

function readStoredTasks(code: string): Record<ReadinessId, boolean> {
  try {
    const raw = localStorage.getItem(`delikreol_partner_readiness_${normalizeCode(code)}`);
    if (!raw) return {} as Record<ReadinessId, boolean>;
    return JSON.parse(raw) as Record<ReadinessId, boolean>;
  } catch {
    return {} as Record<ReadinessId, boolean>;
  }
}

const emptyForm: PartnerForm = {
  responsable: '',
  telephone: '',
  email: '',
  commune: '',
  description: '',
  horaires: '',
  modes: [],
  plats: '',
  prix: '',
  compositions: '',
  allergenes: '',
  documents: '',
  invendus: '',
  events: '',
  remarques: '',
};

export default function PartnerAccessPage() {
  const [searchParams] = useSearchParams();
  const code = normalizeCode(searchParams.get('code') || '');
  const partner = resolvePartner(code);
  const partnerName = partner?.name ?? null;

  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [tasks, setTasks] = useState<Record<ReadinessId, boolean>>(() => readStoredTasks(code));
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const readinessPercent = useMemo(() => {
    const done = READINESS_TASKS.filter((task) => tasks[task.id]).length;
    return Math.round((done / READINESS_TASKS.length) * 100);
  }, [tasks]);

  const eligibilityStatus = readinessPercent >= 100 ? 'ready_for_pilot' : readinessPercent >= 60 ? 'needs_final_review' : 'incomplete';

  useEffect(() => {
    document.title = partnerName ? `Espace ${partnerName} — DELIKREOL` : 'Accès partenaire — DELIKREOL';
    try {
      const events = JSON.parse(localStorage.getItem('delikreol_site_events') || '[]');
      events.push({ type: 'partner_access_opened', code, partnerName, time: new Date().toISOString() });
      localStorage.setItem('delikreol_site_events', JSON.stringify(events.slice(-200)));
    } catch { /* noop */ }
  }, [code, partnerName]);

  useEffect(() => {
    try {
      localStorage.setItem(`delikreol_partner_readiness_${code}`, JSON.stringify(tasks));
    } catch { /* noop */ }
  }, [code, tasks]);

  const updateForm = <K extends keyof PartnerForm>(key: K, value: PartnerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleMode = (mode: string) => {
    setForm((current) => ({
      ...current,
      modes: current.modes.includes(mode) ? current.modes.filter((item) => item !== mode) : [...current.modes, mode],
    }));
  };

  const toggleTask = (id: ReadinessId) => {
    setTasks((current) => ({ ...current, [id]: !current[id] }));
  };

  const saveLocalFallback = () => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    current.push({ ...form, code, partnerName, readinessPercent, tasks, eligibilityStatus, created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(-100)));
  };

  const buildWhatsAppMessage = () => encodeURIComponent([
    'Bonjour Vladimir, voici ma mise à jour partenaire DELIKREOL.',
    '',
    `Partenaire : ${partnerName ?? '-'}`,
    `Code : ${code}`,
    `Préparation : ${readinessPercent}% (${eligibilityStatus})`,
    `Responsable : ${form.responsable || '-'}`,
    `Téléphone : ${form.telephone || '-'}`,
    `Email : ${form.email || '-'}`,
    `Commune : ${form.commune || '-'}`,
    `Modes : ${form.modes.join(', ') || '-'}`,
    `Horaires : ${form.horaires || '-'}`,
    `Description : ${form.description || '-'}`,
    `Plats : ${form.plats || '-'}`,
    `Prix : ${form.prix || '-'}`,
    `Compositions : ${form.compositions || '-'}`,
    `Allergènes : ${form.allergenes || '-'}`,
    `Documents : ${form.documents || '-'}`,
    `Invendus : ${form.invendus || '-'}`,
    `Événements / mise à l’honneur : ${form.events || '-'}`,
    `Remarques : ${form.remarques || '-'}`,
  ].join('\n'));

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitStatus('saving');
    setErrorMessage(null);

    const payload = {
      partner_id: code || partnerName || 'partner-pilot',
      access_code: code,
      partner_name: partnerName,
      responsable: form.responsable || null,
      telephone: form.telephone || null,
      email: form.email || null,
      commune: form.commune || null,
      description: form.description || null,
      horaires: form.horaires || null,
      modes: form.modes.join(', ') || null,
      plats: form.plats || null,
      prix: form.prix || null,
      compositions: form.compositions || null,
      allergenes: form.allergenes || null,
      remarques: [form.remarques, form.invendus && `Invendus: ${form.invendus}`, form.events && `Événements: ${form.events}`].filter(Boolean).join('\n') || null,
      documentation_notes: form.documents || null,
      readiness_percent: readinessPercent,
      readiness_tasks: tasks,
      eligibility_status: eligibilityStatus,
      pricing_acknowledged: Boolean(tasks.composition),
      last_readiness_update_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      status: 'pending',
    };

    try {
      saveLocalFallback();
      if (!isDemoMode) {
        const { error } = await supabase.from('partner_corrections').insert(payload);
        if (error) throw error;
        setSubmitStatus('saved');
      } else {
        setSubmitStatus('local_only');
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erreur sauvegarde partenaire:', err);
      setErrorMessage('La sauvegarde serveur a échoué. Les informations sont gardées localement : confirme aussi sur WhatsApp.');
      setSubmitStatus('error');
      setSubmitted(true);
    }
  };

  if (!code) {
    return (
      <Layout>
        <BackBar label="Retour" backTo="/" />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-3xl font-black">Accès partenaire DELIKREOL</h1>
          <p className="mt-4 text-muted-foreground">Chaque traiteur, livreur ou point relais reçoit un lien pilote. Aucun mot de passe n’est demandé pour compléter la fiche de démarrage.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je souhaite récupérer mon accès partenaire DELIKREOL.')}`} className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-black text-white">Demander mon lien</a>
        </main>
      </Layout>
    );
  }

  if (!partnerName) {
    return (
      <Layout>
        <BackBar label="Retour" backTo="/" />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-3xl font-black">Code non reconnu</h1>
          <p className="mt-4 text-muted-foreground">Le code <strong>{code}</strong> ne correspond pas à un accès pilote connu.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, mon code partenaire DELIKREOL ne fonctionne pas : ${code}`)}`} className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-black text-white">Corriger par WhatsApp</a>
        </main>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <BackBar label="Retour" backTo="/" />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✅</div>
          <h1 className="mt-4 text-3xl font-black">Merci, {partner.label}</h1>
          <p className="mt-3 text-muted-foreground">Préparation enregistrée : <strong>{readinessPercent}%</strong>. Statut : <strong>{eligibilityStatus}</strong>.</p>
          {errorMessage && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{errorMessage}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white">Confirmer sur WhatsApp</a>
            <Link to="/catalogue-partenaire" className="rounded-2xl border border-primary px-5 py-3 font-black text-primary">Tester le tableau de bord</Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Les tests sont annulables : aucun paiement réel, aucun plat préparé sans confirmation humaine.</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackBar label="Retour" backTo="/" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Accès pilote sans mot de passe</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="text-3xl font-black text-foreground">{partner.label}</h1>
              <p className="mt-2 text-muted-foreground">{partner.zone} · Contact connu : {partner.contact}</p>
              <p className="mt-4 text-sm text-muted-foreground">Ce lien sert à corriger la fiche, composer les menus, préparer les invendus, les événements et l’organisation livraison/relais. Pour le vrai compte sécurisé, DELIKREOL active ensuite un email/magic link.</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm font-black"><span>Préparation</span><span>{readinessPercent}%</span></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-green-600 transition-all" style={{ width: `${readinessPercent}%` }} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Objectif 100% avant mise en avant commerciale complète.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-4">
          <Link to="/catalogue-partenaire" className="rounded-2xl border bg-white p-4 font-black shadow-sm">🍽️ Gérer catalogue</Link>
          <Link to="/terminal-partenaire" className="rounded-2xl border bg-white p-4 font-black shadow-sm">💳 Terminal manuel</Link>
          <Link to="/devenir-livreur" className="rounded-2xl border bg-white p-4 font-black shadow-sm">🛵 Test livreur</Link>
          <Link to="/devenir-point-relais" className="rounded-2xl border bg-white p-4 font-black shadow-sm">📍 Test point relais</Link>
        </section>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Checklist qualité</h2>
            <div className="mt-4 space-y-3">
              {READINESS_TASKS.map((task) => (
                <label key={task.id} className="flex cursor-pointer gap-3 rounded-2xl border p-3 text-sm">
                  <input type="checkbox" checked={Boolean(tasks[task.id])} onChange={() => toggleTask(task.id)} className="mt-1" />
                  <span><strong>{task.title}</strong><br /><span className="text-xs text-muted-foreground">{task.detail}</span></span>
                </label>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Informations à valider</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">Responsable<input value={form.responsable} onChange={(e) => updateForm('responsable', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" placeholder="Nom" /></label>
              <label className="text-sm font-bold">Téléphone<input value={form.telephone} onChange={(e) => updateForm('telephone', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" placeholder="0696..." /></label>
              <label className="text-sm font-bold">Email<input value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" placeholder="email" /></label>
              <label className="text-sm font-bold">Commune<select value={form.commune} onChange={(e) => updateForm('commune', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal"><option value="">Sélectionnez</option>{martiniqueCommunes.map((commune) => <option key={commune.name} value={commune.name}>{commune.name}</option>)}</select></label>
            </div>
            <label className="mt-4 block text-sm font-bold">Description / bio<textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={3} placeholder="Bio, histoire, spécialité, vidéo disponible..." /></label>
            <label className="mt-4 block text-sm font-bold">Horaires et capacité<textarea value={form.horaires} onChange={(e) => updateForm('horaires', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={2} placeholder="Jours, heures, capacité max par service..." /></label>
            <div className="mt-4"><p className="text-sm font-bold">Modes opérationnels</p><div className="mt-2 flex flex-wrap gap-2">{MODES.map((mode) => <button key={mode} type="button" onClick={() => toggleMode(mode)} className={`rounded-full border px-3 py-2 text-xs font-black ${form.modes.includes(mode) ? 'bg-primary text-white' : 'bg-white text-muted-foreground'}`}>{mode}</button>)}</div></div>
            <label className="mt-4 block text-sm font-bold">Plats et prix<textarea value={form.plats} onChange={(e) => updateForm('plats', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={3} placeholder="Plat — prix — quantité possible" /></label>
            <label className="mt-4 block text-sm font-bold">Prix / règles commerciales<input value={form.prix} onChange={(e) => updateForm('prix', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" placeholder="Prix partenaire, prix public, menus, suppléments..." /></label>
            <label className="mt-4 block text-sm font-bold">Compositions obligatoires<textarea value={form.compositions} onChange={(e) => updateForm('compositions', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={3} placeholder="Ex : 1 accompagnement + 1 boisson obligatoires, riz/lentilles/légumes/frite/crudités..." /></label>
            <label className="mt-4 block text-sm font-bold">Allergènes<textarea value={form.allergenes} onChange={(e) => updateForm('allergenes', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={2} /></label>
            <label className="mt-4 block text-sm font-bold">Documents / règlement<textarea value={form.documents} onChange={(e) => updateForm('documents', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={2} placeholder="SIRET, RIB, assurance, hygiène, lien SumUp/Stripe si disponible..." /></label>
            <label className="mt-4 block text-sm font-bold">Invendus jour/lendemain<textarea value={form.invendus} onChange={(e) => updateForm('invendus', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={2} placeholder="Paniers anti-gaspillage, prix réduit, créneau retrait..." /></label>
            <label className="mt-4 block text-sm font-bold">Événement / mise à l’honneur<textarea value={form.events} onChange={(e) => updateForm('events', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={2} placeholder="Vidéo, lieu, repas à gagner, Chef à Mada/GIE..." /></label>
            <label className="mt-4 block text-sm font-bold">Remarques / photos à corriger<textarea value={form.remarques} onChange={(e) => updateForm('remarques', e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" rows={3} placeholder="Ex : supprimer Panini saumon, changer photo, rupture produit..." /></label>
            <button disabled={submitStatus === 'saving'} type="submit" className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 font-black text-white disabled:opacity-60">{submitStatus === 'saving' ? 'Enregistrement…' : 'Enregistrer et envoyer à DELIKREOL'}</button>
          </section>
        </form>
      </main>
    </Layout>
  );
}
