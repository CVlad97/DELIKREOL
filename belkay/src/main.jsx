import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hammer, Home, Users, Calculator, MapPin, Star, ShieldCheck, ClipboardList,
  PackageSearch, HardHat, CheckCircle2, Clock, Phone, Menu, X, Euro, MessageCircle,
  Settings, Building2, Wrench, Search, FileText, TrendingUp, AlertTriangle
} from 'lucide-react';
import { artisans, categories, communes, materials, demoProjects, packs } from './data.js';
import './styles.css';

const storageKey = 'belkay-demo-db';

function loadDb() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    projects: demoProjects,
    artisanApplications: [],
    materialRequests: [],
    contacts: []
  };
}

function saveDb(db) {
  localStorage.setItem(storageKey, JSON.stringify(db));
}

function App() {
  const [db, setDb] = useState(loadDb);
  const updateDb = (patch) => setDb((current) => {
    const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
    saveDb(next);
    return next;
  });

  return (
    <BrowserRouter basename="/belkay">
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deposer-projet" element={<ProjectPage db={db} updateDb={updateDb} />} />
          <Route path="/estimation" element={<EstimatePage />} />
          <Route path="/artisans" element={<ArtisansPage />} />
          <Route path="/devenir-artisan" element={<BecomeArtisanPage db={db} updateDb={updateDb} />} />
          <Route path="/materiaux" element={<MaterialsPage db={db} updateDb={updateDb} />} />
          <Route path="/chef-travaux" element={<ChiefPage />} />
          <Route path="/suivi" element={<TrackingPage db={db} />} />
          <Route path="/dashboard-client" element={<ClientDashboard db={db} />} />
          <Route path="/dashboard-artisan" element={<ArtisanDashboard db={db} />} />
          <Route path="/dashboard-admin" element={<AdminDashboard db={db} />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage db={db} updateDb={updateDb} />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ['Accueil', '/'], ['Projet', '/deposer-projet'], ['Estimation', '/estimation'],
    ['Artisans', '/artisans'], ['Matériaux', '/materiaux'], ['Suivi', '/suivi']
  ];
  return (
    <div>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="logo"><Hammer size={22} /></span>
          <span><b>BELKAY</b><small>belkay.mq</small></span>
        </Link>
        <nav className="desktop-nav">
          {nav.map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <Link className="btn ghost" to="/devenir-artisan">Devenir artisan</Link>
          <Link className="btn primary" to="/deposer-projet">Déposer un projet</Link>
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
        </div>
      </header>
      {open && <nav className="mobile-nav">{nav.map(([label, path]) => <NavLink onClick={() => setOpen(false)} key={path} to={path}>{label}</NavLink>)}</nav>}
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Footer() {
  return <footer className="footer">
    <div>
      <h3>BELKAY</h3>
      <p>Artisans locaux, budget cadré, matériaux optimisés et suivi de chantier en Martinique.</p>
    </div>
    <div><b>Zones</b><p>CACEM, Espace Sud, Cap Nord, projets Caraïbe sur demande.</p></div>
    <div><b>Contact</b><p>contact@belkay.mq<br/>WhatsApp : +596 696 00 00 00</p></div>
    <div><b>Important</b><p>Les prix sont indicatifs. Chaque chantier doit être confirmé par devis, assurances et obligations légales.</p></div>
  </footer>
}

function Section({ eyebrow, title, children, className = '' }) {
  return <section className={`section ${className}`}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>
    {children}
  </section>
}

function HomePage() {
  const steps = [
    ['Décrire', 'Besoin, photos, commune, délai et budget.', ClipboardList],
    ['Estimer', 'Fourchette indicative basse, moyenne et haute.', Calculator],
    ['Sélectionner', 'Artisans locaux et matériaux compatibles.', Users],
    ['Suivre', 'Timeline, devis, messages et contrôle étapes.', CheckCircle2]
  ];
  return <>
    <section className="hero">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Travaux • rénovation • construction • dépannage</p>
        <h1>La maison bien faite, au bon prix, avec les bons artisans.</h1>
        <p className="lead">Décrivez votre projet, fixez votre budget, BELKAY vous aide à trouver les bons artisans et les bons matériaux en Martinique.</p>
        <div className="hero-actions">
          <Link className="btn primary large" to="/deposer-projet">Déposer mon projet</Link>
          <Link className="btn light large" to="/estimation">Estimer mon budget</Link>
          <Link className="btn ghost-dark large" to="/devenir-artisan">Je suis artisan</Link>
        </div>
      </motion.div>
      <motion.div className="hero-card" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="status-pill"><ShieldCheck size={18}/> Réseau local vérifié</div>
        <h3>Projet type</h3>
        <p>Deck terrasse 25 m² à Sainte-Luce</p>
        <div className="quote-box"><b>Budget indicatif</b><span>3 500–6 000 €</span></div>
        <div className="mini-grid"><span>3 artisans</span><span>2 matériaux</span><span>1 chef travaux</span></div>
      </motion.div>
    </section>

    <Section eyebrow="Parcours simple" title="Du besoin au chantier suivi">
      <div className="grid four">{steps.map(([t, d, Icon]) => <Card key={t}><Icon/><h3>{t}</h3><p>{d}</p></Card>)}</div>
    </Section>

    <Section eyebrow="Catégories" title="Tous les travaux courants, du dépannage au projet complet">
      <div className="chips">{categories.map(c => <Link to="/artisans" className="chip" key={c}>{c}</Link>)}</div>
    </Section>

    <Section eyebrow="Pourquoi BELKAY ?" title="Une structure inspirée de Delikreol, adaptée au bâtiment">
      <div className="grid three">
        <Feature icon={<Clock/>} title="Gain de temps" text="Une demande structurée évite les appels dans le vide et accélère les devis." />
        <Feature icon={<Euro/>} title="Budget cadré" text="Fourchettes, matériaux et lots pour éviter les mauvaises surprises." />
        <Feature icon={<PackageSearch/>} title="Matériaux optimisés" text="Sourcing local, destockage, import et achats groupés selon disponibilité." />
      </div>
    </Section>
  </>
}

function Card({ children, className = '' }) { return <div className={`card ${className}`}>{children}</div> }
function Feature({ icon, title, text }) { return <Card><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></Card> }

function ProjectPage({ db, updateDb }) {
  const [form, setForm] = useState({ type: 'Dépannage urgent', category: 'Plomberie', town: 'Rivière-Pilote', budget: '500-1500 €', delay: 'Cette semaine', materials: 'Oui', chief: 'Oui', name: '', phone: '', description: '' });
  const [success, setSuccess] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    const id = `BK-${Date.now().toString().slice(-6)}`;
    const project = { id, title: `${form.category} - ${form.type}`, town: form.town, budget: form.budget, status: 'À qualifier', priority: form.delay.includes('Urgent') ? 'Urgent' : 'Normal', ...form };
    updateDb({ ...db, projects: [project, ...db.projects] });
    setSuccess(id);
  };
  return <Section eyebrow="Nouvelle demande" title="Déposer un projet BELKAY">
    {success && <div className="success"><CheckCircle2/> Dossier {success} créé. Prochaine étape : qualification, sélection artisans, puis devis.</div>}
    <form className="form-card" onSubmit={submit}>
      <FormGrid>
        <Select label="Type de besoin" value={form.type} onChange={v=>setForm({...form,type:v})} options={['Dépannage urgent','Petits travaux','Rénovation','Construction','Extension','Entretien','Diagnostic']} />
        <Select label="Catégorie" value={form.category} onChange={v=>setForm({...form,category:v})} options={categories} />
        <Select label="Commune" value={form.town} onChange={v=>setForm({...form,town:v})} options={communes} />
        <Select label="Budget estimé" value={form.budget} onChange={v=>setForm({...form,budget:v})} options={['Moins de 500 €','500-1500 €','1500-5000 €','5000-15000 €','15000-50000 €','Plus de 50000 €']} />
        <Select label="Délai" value={form.delay} onChange={v=>setForm({...form,delay:v})} options={['Urgent 24-48h','Cette semaine','Ce mois-ci','Projet à planifier']} />
        <Select label="Besoin matériaux" value={form.materials} onChange={v=>setForm({...form,materials:v})} options={['Oui','Non','À voir avec artisan']} />
        <Select label="Chef de travaux" value={form.chief} onChange={v=>setForm({...form,chief:v})} options={['Oui','Non','Peut-être']} />
        <Input label="Nom" value={form.name} onChange={v=>setForm({...form,name:v})} required />
        <Input label="Téléphone" value={form.phone} onChange={v=>setForm({...form,phone:v})} required />
      </FormGrid>
      <label>Description du projet<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ex. fuite sous évier, deck 25 m², rénovation salle de bain..." /></label>
      <div className="upload-placeholder">Photos : zone prévue pour ajouter des images du chantier</div>
      <button className="btn primary large">Créer mon dossier</button>
    </form>
  </Section>
}

function EstimatePage() {
  const [state, setState] = useState({ type: 'Rénovation', area: 20, finish: 'Standard', urgent: 'Non', materials: 'Oui' });
  const result = useMemo(() => {
    const base = { 'Dépannage': 180, 'Petits travaux': 250, 'Rénovation': 520, 'Construction': 1500, 'Extension': 1200 }[state.type] || 500;
    const finish = state.finish === 'Économique' ? .85 : state.finish === 'Premium' ? 1.35 : 1;
    const urgent = state.urgent === 'Oui' ? 1.2 : 1;
    const mat = state.materials === 'Oui' ? 1.18 : .9;
    const avg = Math.max(150, Math.round(base * Number(state.area || 1) * finish * urgent * mat));
    return { low: Math.round(avg * .78), avg, high: Math.round(avg * 1.35) };
  }, [state]);
  return <Section eyebrow="Budget indicatif" title="Simulateur simple de budget chantier">
    <div className="split">
      <form className="form-card">
        <Select label="Type de projet" value={state.type} onChange={v=>setState({...state,type:v})} options={['Dépannage','Petits travaux','Rénovation','Construction','Extension']} />
        <Input label="Surface estimée en m²" type="number" value={state.area} onChange={v=>setState({...state,area:v})} />
        <Select label="Niveau de finition" value={state.finish} onChange={v=>setState({...state,finish:v})} options={['Économique','Standard','Premium']} />
        <Select label="Urgent" value={state.urgent} onChange={v=>setState({...state,urgent:v})} options={['Non','Oui']} />
        <Select label="Matériaux inclus" value={state.materials} onChange={v=>setState({...state,materials:v})} options={['Oui','Non']} />
      </form>
      <Card className="estimate-card">
        <Calculator size={34}/><h3>Fourchette indicative</h3>
        <div className="prices"><span>{result.low.toLocaleString('fr-FR')} €</span><b>{result.avg.toLocaleString('fr-FR')} €</b><span>{result.high.toLocaleString('fr-FR')} €</span></div>
        <p>Estimation non contractuelle à confirmer après diagnostic, devis, assurances, contraintes techniques et disponibilité matériaux.</p>
        <Link className="btn primary" to="/deposer-projet">Transformer en demande de devis</Link>
      </Card>
    </div>
  </Section>
}

function ArtisansPage() {
  const [query, setQuery] = useState('');
  const filtered = artisans.filter(a => `${a.name} ${a.trade} ${a.town} ${a.badges.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <Section eyebrow="Réseau local" title="Trouver un artisan compatible avec le projet">
    <div className="searchbar"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Métier, commune, badge, disponibilité..." /></div>
    <div className="grid three">{filtered.map(a => <Card key={a.id} className="artisan-card">
      <div className="card-head"><HardHat/><span className="rating"><Star size={16}/> {a.rating}</span></div>
      <h3>{a.name}</h3><p><b>{a.trade}</b></p><p><MapPin size={15}/> {a.town} • {a.zones.join(', ')}</p>
      <div className="chips small">{a.badges.map(b => <span className="chip" key={b}>{b}</span>)}</div>
      <p>{a.description}</p>
      <Link className="btn ghost" to="/deposer-projet">Demander un devis</Link>
    </Card>)}</div>
  </Section>
}

function BecomeArtisanPage({ db, updateDb }) {
  const [form, setForm] = useState({ company: '', trade: 'Menuiserie', town: 'Rivière-Pilote', phone: '', email: '', experience: '', insurance: 'À fournir' });
  const [ok, setOk] = useState(false);
  const submit = (e) => { e.preventDefault(); updateDb({ ...db, artisanApplications: [{ ...form, status: 'En validation', id: Date.now() }, ...db.artisanApplications] }); setOk(true); };
  return <Section eyebrow="Partenaires" title="Devenir artisan BELKAY">
    <div className="split">
      <Card><h3>Pourquoi rejoindre BELKAY ?</h3><p>Recevoir des projets qualifiés, gagner en visibilité locale, répondre à des devis structurés et profiter de commandes groupées matériaux.</p><div className="chips"><span className="chip">Projets qualifiés</span><span className="chip">Visibilité locale</span><span className="chip">Matériaux</span></div></Card>
      <form className="form-card" onSubmit={submit}>{ok && <div className="success"><CheckCircle2/> Candidature enregistrée en validation.</div>}<Input label="Nom entreprise" value={form.company} onChange={v=>setForm({...form,company:v})} required/><Select label="Métier principal" value={form.trade} onChange={v=>setForm({...form,trade:v})} options={categories}/><Select label="Commune" value={form.town} onChange={v=>setForm({...form,town:v})} options={communes}/><Input label="Téléphone" value={form.phone} onChange={v=>setForm({...form,phone:v})} required/><Input label="Email" value={form.email} onChange={v=>setForm({...form,email:v})}/><Input label="Expérience / réalisations" value={form.experience} onChange={v=>setForm({...form,experience:v})}/><button className="btn primary">Envoyer ma candidature</button></form>
    </div>
  </Section>
}

function MaterialsPage({ db, updateDb }) {
  const request = (m) => updateDb({ ...db, materialRequests: [{ id: Date.now(), material: m.name, status: 'À confirmer', project: 'Projet non lié' }, ...db.materialRequests] });
  return <Section eyebrow="Matériaux & bons plans" title="Sourcing local, destockage et achats groupés">
    <div className="grid three">{materials.map(m => <Card key={m.id}><PackageSearch/><h3>{m.name}</h3><p><b>{m.price}</b></p><p>{m.category} • {m.supplier}</p><p>Stock : {m.stock} — Délai : {m.delay}</p><span className="chip">{m.type}</span><button className="btn ghost" onClick={() => request(m)}>Ajouter au projet</button></Card>)}</div>
    <p className="notice">Les matériaux à bas prix dépendent des stocks, arrivages, destockages, achats groupés et délais import. Validation obligatoire avant commande.</p>
  </Section>
}

function ChiefPage() {
  return <Section eyebrow="Accompagnement" title="Chef de travaux / coordination projet">
    <p className="lead narrow">BELKAY peut cadrer le besoin, consulter plusieurs artisans, suivre le planning, contrôler les étapes et protéger le budget.</p>
    <div className="grid four">{packs.map(p => <Card key={p.name}><Building2/><h3>{p.name}</h3><p><b>{p.price}</b></p><p>{p.text}</p><Link className="btn ghost" to="/contact">Demander</Link></Card>)}</div>
  </Section>
}

function TrackingPage({ db }) {
  const steps = ['Demande reçue', 'Artisans consultés', 'Devis reçus', 'Choix validé', 'Acompte', 'Intervention', 'Contrôle', 'Terminé'];
  return <Section eyebrow="Suivi projet" title="Timeline chantier BELKAY">
    <div className="grid two">{db.projects.map(p => <Card key={p.id}><h3>{p.id} — {p.title}</h3><p>{p.town} • Budget {p.budget}</p><div className="timeline">{steps.map((s,i)=><div className={i < 3 ? 'done' : ''} key={s}><span>{i+1}</span>{s}</div>)}</div></Card>)}</div>
  </Section>
}

function ClientDashboard({ db }) { return <Dashboard title="Dashboard client" icon={<Home/>} db={db} mode="client" /> }
function ArtisanDashboard({ db }) { return <Dashboard title="Dashboard artisan" icon={<Wrench/>} db={db} mode="artisan" /> }
function AdminDashboard({ db }) { return <Dashboard title="Dashboard admin BELKAY" icon={<Settings/>} db={db} mode="admin" /> }

function Dashboard({ title, icon, db, mode }) {
  return <Section eyebrow="Espace démo" title={title}>
    <div className="stats"><Card>{icon}<b>{db.projects.length}</b><span>Projets</span></Card><Card><FileText/><b>{Math.max(2, db.projects.length * 2)}</b><span>Devis estimés</span></Card><Card><TrendingUp/><b>{db.materialRequests.length}</b><span>Demandes matériaux</span></Card><Card><Users/><b>{artisans.length}</b><span>Artisans</span></Card></div>
    <div className="grid two">
      <Card><h3>Projets récents</h3>{db.projects.map(p=><div className="row" key={p.id}><span>{p.id} — {p.title}</span><b>{p.status}</b></div>)}</Card>
      <Card><h3>{mode === 'admin' ? 'Actions admin' : mode === 'artisan' ? 'Demandes disponibles' : 'Messages & documents'}</h3><p>Interface de démonstration prête à brancher ensuite à Hostinger, Supabase, Firebase ou autre backend selon ton choix final.</p><div className="chips"><span className="chip">Devis</span><span className="chip">Messages</span><span className="chip">Photos</span><span className="chip">Paiement placeholder</span></div></Card>
    </div>
  </Section>
}

function AboutPage() { return <Section eyebrow="Mission" title="Structurer les travaux en Martinique">
  <div className="split"><Card><h3>Notre rôle</h3><p>BELKAY aide à formuler le besoin, comparer les artisans, cadrer le budget et valoriser les compétences locales.</p></Card><Card><h3>Neutralité</h3><p>BELKAY ne remplace pas les obligations légales, assurances, garanties décennales ou contrôles professionnels. La plateforme facilite la mise en relation et le suivi.</p></Card></div>
</Section> }

function ContactPage({ db, updateDb }) {
  const [msg, setMsg] = useState({ name: '', phone: '', text: '' });
  const [ok, setOk] = useState(false);
  const submit = (e) => { e.preventDefault(); updateDb({ ...db, contacts: [{ id: Date.now(), ...msg }, ...db.contacts] }); setOk(true); };
  return <Section eyebrow="Contact" title="Parler à BELKAY">
    <div className="split"><Card><Phone/><h3>Contact BELKAY</h3><p>Email : contact@belkay.mq<br/>WhatsApp : +596 696 00 00 00</p><p>Réponse fictive en démo. À connecter ensuite au vrai canal.</p></Card><form className="form-card" onSubmit={submit}>{ok && <div className="success"><MessageCircle/> Message enregistré.</div>}<Input label="Nom" value={msg.name} onChange={v=>setMsg({...msg,name:v})} required/><Input label="Téléphone" value={msg.phone} onChange={v=>setMsg({...msg,phone:v})}/><label>Message<textarea value={msg.text} onChange={e=>setMsg({...msg,text:e.target.value})}/></label><button className="btn primary">Envoyer</button></form></div>
  </Section>
}

function FormGrid({ children }) { return <div className="form-grid">{children}</div> }
function Input({ label, value, onChange, type = 'text', required = false }) { return <label>{label}<input type={type} required={required} value={value} onChange={e=>onChange(e.target.value)} /></label> }
function Select({ label, value, onChange, options }) { return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label> }

createRoot(document.getElementById('root')).render(<App />);
