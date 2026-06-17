import { useState, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Send,
  MessageCircle,
  CheckCircle2,
  Camera,
  MapPin,
  ChefHat,
  Star,
  Trash2,
  Sparkles,
  Utensils,
  FileText,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

const WHATSAPP_NUMBER = '596696653589';

const SPECIALITES = [
  { value: 'buffet', label: 'Buffet' },
  { value: 'repas_chaud', label: 'Repas chaud' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'grillade', label: 'Grillade' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'bapteme', label: 'Baptême' },
  { value: 'mariage', label: 'Mariage' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'livraison', label: 'Livraison' },
];

const TEMPS_PREPARATION = [
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

const HEURES_LIMITE = [
  { value: '09:00', label: '09:00' },
  { value: '09:30', label: '09:30' },
  { value: '10:00', label: '10:00' },
  { value: '10:30', label: '10:30' },
  { value: '11:00', label: '11:00' },
  { value: '11:30', label: '11:30' },
];

const CRENEAUX = [
  { value: 'midi', label: 'Midi (11h–14h)' },
  { value: 'soir', label: 'Soir (18h–21h)' },
  { value: 'soiree', label: 'Soirée (21h–23h)' },
];

const BENEFITS = [
  {
    icon: MapPin,
    title: 'Visibilité locale',
    text: 'Votre activité est mise en avant auprès des Martiniquais qui recherchent un traiteur près de chez eux.',
  },
  {
    icon: Utensils,
    title: 'Mise en avant des plats',
    text: 'Nous présentons vos spécialités, vos photos et votre savoir-faire sur Delikreol.',
  },
  {
    icon: FileText,
    title: 'Demandes simplifiées',
    text: 'Recevez des demandes de devis directement depuis la plateforme. Plus simple pour vous.',
  },
  {
    icon: Star,
    title: 'Fiche offerte',
    text: 'Pendant la phase bêta, votre fiche traiteur est entièrement gratuite. Aucun frais caché.',
  },
];

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  description: string;
}

interface CatererFormData {
  nomActivite: string;
  nomResponsable: string;
  telephone: string;
  email: string;
  commune: string;
  bio: string;
  description: string;
  specialties: string[];
  prixDepart: string;
  tempsPreparation: string;
  heureLimite: string;
  creneaux: string[];
  logo?: File | null;
  instagram: string;
  facebook: string;
  siteWeb: string;
  statut: string;
}

const initialFormData: CatererFormData = {
  nomActivite: '',
  nomResponsable: '',
  telephone: '',
  email: '',
  commune: '',
  bio: '',
  description: '',
  specialties: [],
  prixDepart: '',
  tempsPreparation: '',
  heureLimite: '',
  creneaux: [],
  logo: null,
  instagram: '',
  facebook: '',
  siteWeb: '',
  statut: 'beta_testeur_gratuit',
};

function validateMartiniquePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-.]/g, '');
  return /^(?:\+596|0)696\d{6}$/.test(cleaned);
}

export default function CatererSignupPage() {
  const [form, setForm] = useState<CatererFormData>(initialFormData);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<CatererFormData | null>(null);
  const [submissionPhotos, setSubmissionPhotos] = useState<PhotoItem[]>([]);
  const [submissionLogoPreview, setSubmissionLogoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const [catererCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('delikreol_caterer_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => {
        if (name === 'specialties') {
          const spl = value;
          const updated = checked
            ? [...prev.specialties, spl]
            : prev.specialties.filter((s) => s !== spl);
          return { ...prev, specialties: updated };
        }
        if (name === 'creneaux') {
          const cr = value;
          const updated = checked
            ? [...prev.creneaux, cr]
            : prev.creneaux.filter((c) => c !== cr);
          return { ...prev, creneaux: updated };
        }
        return prev;
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoItem[] = [];
    Array.from(files).forEach((file) => {
      const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      newPhotos.push({
        id,
        file,
        preview: URL.createObjectURL(file),
        description: '',
      });
    });
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const updatePhotoDescription = (id: string, description: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, description } : p))
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, logo: file }));
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  };

  const buildWhatsAppMessage = (data: CatererFormData): string => {
    const specialties = data.specialties.length > 0
      ? data.specialties.map((s) => {
          const found = SPECIALITES.find((sp) => sp.value === s);
          return found ? found.label : s;
        }).join(', ')
      : 'Non précisé';

    const creneaux = data.creneaux.length > 0
      ? data.creneaux.map((c) => {
          const found = CRENEAUX.find((cr) => cr.value === c);
          return found ? found.label : c;
        }).join(', ')
      : 'Non précisé';

    const contact = data.telephone;

    return `Bonjour Vladimir, je souhaite rejoindre DELIKREOL comme traiteur bêta testeur gratuit. Voici mes informations : ${data.nomActivite}, ${data.commune}, ${specialties}, ${data.prixDepart ? data.prixDepart + ' €' : 'Non précisé'}, ${contact}. Je vais aussi envoyer mes photos, ma bio et mes descriptions pour l intégration.`;
  };

  const uploadPhotosToStorage = async (
    photosList: PhotoItem[],
    logoFile: File | null | undefined,
    catererName: string
  ): Promise<{ photoUrls: string[]; photoDescriptions: string[]; logoUrl: string | null }> => {
    const timestamp = Date.now();
    const safeName = catererName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    const folder = `caterer-photos/${safeName}_${timestamp}`;
    const photoUrls: string[] = [];
    const photoDescriptions: string[] = [];
    let logoUrl: string | null = null;

    for (const photo of photosList) {
      try {
        const fileName = `${photo.id}_${photo.file.name}`;
        const { data, error } = await supabase.storage
          .from('caterer-photos')
          .upload(`${safeName}_${timestamp}/${fileName}`, photo.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('caterer-photos')
          .getPublicUrl(data.path);

        photoUrls.push(urlData.publicUrl);
        photoDescriptions.push(photo.description);
      } catch (err) {
        console.warn('[CatererSignup] Photo upload failed:', err);
        throw err;
      }
    }

    if (logoFile) {
      try {
        const ext = logoFile.name.split('.').pop() || 'jpg';
        const fileName = `logo_${timestamp}.${ext}`;
        const { data, error } = await supabase.storage
          .from('caterer-photos')
          .upload(`${safeName}_${timestamp}/${fileName}`, logoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('caterer-photos')
            .getPublicUrl(data.path);
          logoUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.warn('[CatererSignup] Logo upload failed:', err);
      }
    }

    return { photoUrls, photoDescriptions, logoUrl };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateMartiniquePhone(form.telephone)) {
      showError('Le numéro de téléphone doit être un numéro martiniquais valide (0696 XX XX XX).');
      return;
    }

    let storageUsed = false;
    let photoUrls: string[] = [];
    let photoDescriptions: string[] = [];
    let logoUrl: string | null = null;

    // Tentative d'upload des photos vers Supabase Storage
    if (photos.length > 0 || form.logo) {
      try {
        const result = await uploadPhotosToStorage(photos, form.logo, form.nomActivite);
        photoUrls = result.photoUrls;
        photoDescriptions = result.photoDescriptions;
        logoUrl = result.logoUrl;
        storageUsed = photoUrls.length > 0 || logoUrl !== null;
      } catch (err) {
        console.warn('[CatererSignup] Storage upload failed, falling back to localStorage:', err);
      }
    }

    const entry = {
      ...form,
      logo: form.logo ? { name: form.logo.name, size: form.logo.size, type: form.logo.type } : null,
      photos: photos.map((p) => ({
        id: p.id,
        name: p.file.name,
        size: p.file.size,
        type: p.file.type,
        description: p.description,
      })),
      photoUrls: storageUsed ? photoUrls : undefined,
      logoUrl: storageUsed ? logoUrl : undefined,
      id: `caterer_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'nouveau',
      source: 'inscription_traiteur_beta',
    };

    // Sauvegarde dans localStorage (toujours faite)
    const existing = JSON.parse(
      localStorage.getItem('delikreol_caterer_applications') || '[]'
    );
    existing.push(entry);
    localStorage.setItem('delikreol_caterer_applications', JSON.stringify(existing));

    // Tentative Supabase table partner_applications
    try {
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          name: form.nomResponsable || form.nomActivite,
          business_name: form.nomActivite,
          email: form.email || null,
          phone: form.telephone,
          commune: form.commune,
          activity_type: 'traiteur',
          description: form.description || null,
          bio: form.bio || null,
          specialties: form.specialties.length > 0 ? JSON.parse(JSON.stringify(form.specialties)) : null,
          prix_depart: form.prixDepart || null,
          temps_preparation: form.tempsPreparation || null,
          heure_limite: form.heureLimite || null,
          creneaux: form.creneaux.length > 0 ? JSON.parse(JSON.stringify(form.creneaux)) : null,
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          site_web: form.siteWeb || null,
          logo_url: logoUrl,
          photo_urls: photoUrls.length > 0 ? JSON.parse(JSON.stringify(photoUrls)) : null,
          photo_descriptions: photoDescriptions.length > 0 ? JSON.parse(JSON.stringify(photoDescriptions)) : null,
          source: 'inscription_traiteur_beta',
        });

      if (error) {
        console.warn('[CatererSignup] Supabase insert failed, localStorage only:', error.message);
      }
    } catch (err) {
      console.warn('[CatererSignup] Supabase unavailable, localStorage only:', err);
    }

    // Stocker les données pour l'affichage de confirmation
    setSubmissionData(form);
    setSubmissionPhotos(photos);
    setSubmissionLogoPreview(logoPreview);

    setSubmitted(true);

    // Incrémenter le compteur de traiteurs
    const currentCount = parseInt(localStorage.getItem('delikreol_caterer_count') || '0', 10);
    localStorage.setItem('delikreol_caterer_count', String(currentCount + 1));

    if (storageUsed) {
      showSuccess('Photos sauvegardées ! Votre inscription traiteur bêta a bien été reçue !');
    } else if (photos.length > 0 && !storageUsed) {
      showSuccess('Photos enregistrées localement (en attente de configuration Storage). Votre inscription traiteur bêta a bien été reçue !');
    } else {
      showSuccess('Votre inscription traiteur bêta a bien été reçue !');
    }
  };

  const openWhatsApp = () => {
    if (!submissionData) return;
    const msg = encodeURIComponent(buildWhatsAppMessage(submissionData));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center px-4 py-16 space-y-6">
          <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Inscription traiteur bêta reçue !
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Merci {submissionData?.nomResponsable || submissionData?.nomActivite} ! Votre demande
            d'inscription comme traiteur bêta testeur a bien été enregistrée.
          </p>

          {/* Récapitulatif */}
          <div className="text-left bg-card border border-border rounded-2xl p-5 space-y-2 text-sm">
            <h3 className="font-bold text-foreground text-base mb-2">Récapitulatif</h3>
            <p><span className="font-semibold">Activité :</span> {submissionData?.nomActivite}</p>
            <p><span className="font-semibold">Responsable :</span> {submissionData?.nomResponsable || '—'}</p>
            <p><span className="font-semibold">Téléphone :</span> {submissionData?.telephone}</p>
            {submissionData?.email && <p><span className="font-semibold">Email :</span> {submissionData.email}</p>}
            <p><span className="font-semibold">Commune :</span> {submissionData?.commune}</p>
            {submissionData?.specialties && submissionData.specialties.length > 0 && (
              <p>
                <span className="font-semibold">Spécialités :</span>{' '}
                {submissionData.specialties
                  .map((s) => SPECIALITES.find((sp) => sp.value === s)?.label || s)
                  .join(', ')}
              </p>
            )}
            {submissionData?.prixDepart && (
              <p><span className="font-semibold">À partir de :</span> {submissionData.prixDepart} €</p>
            )}
            <p><span className="font-semibold">Statut :</span> Bêta testeur gratuit</p>
            {submissionPhotos.length > 0 && (
              <p><span className="font-semibold">Photos :</span> {submissionPhotos.length} photo(s)</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Statut : <span className="font-bold text-primary">nouveau / à vérifier</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Vous rejoignez DELIKREOL en tant que traiteur bêta testeur. L'intégration est gratuite
            pendant la phase de test. Envoyez vos photos, votre bio, vos descriptions et vos
            informations principales : nous procédons à votre mise en ligne et nous améliorons votre
            fiche avec vous.
          </p>
          <p className="text-sm text-muted-foreground">
            Contactez Vladimir sur WhatsApp pour accélérer votre intégration.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(submissionData || initialFormData))}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openWhatsApp();
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              <MessageCircle size={18} fill="white" />
              Envoyer sur WhatsApp
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <Store size={14} />
            Traiteur bêta
          </div>
          <div className="badge inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            🧪 Bêta test gratuit
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Rejoindre Delikreol comme traiteur bêta
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Vous êtes traiteur en Martinique ? Rejoignez Delikreol gratuitement pendant la phase
            bêta. Nous vous accompagnons pour créer votre fiche, publier vos photos et recevoir
            vos premières commandes.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 leading-relaxed">
            <p>
              Vous rejoignez DELIKREOL en tant que traiteur bêta testeur. L'intégration est gratuite
              pendant la phase de test. Envoyez vos photos, votre bio, vos descriptions et vos
              informations principales : nous procédons à votre mise en ligne et nous améliorons votre
              fiche avec vous.
            </p>
          </div>
        </div>

        {/* 👥 Compteur traiteurs */}
        <div className="mb-6 text-center bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-orange-700">
            👥 {catererCount} traiteur{catererCount !== 1 ? 's' : ''} {catererCount > 1 ? 'ont déjà rejoint' : 'a déjà rejoint'} Delikreol
          </p>
        </div>

        {/* Benefits */}
        <section className="pageSection mb-10">
          <h2 className="sectionTitle text-xl font-display font-bold mb-4">
            Pourquoi rejoindre Delikreol ?
          </h2>
          <div className="cardGrid grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="card flex gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identité */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Identité
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="formGroup space-y-1.5">
                <label htmlFor="nomActivite" className="block text-sm font-semibold text-foreground">
                  Nom activité / entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomActivite"
                  name="nomActivite"
                  type="text"
                  required
                  value={form.nomActivite}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Chez Tatie Rose"
                />
              </div>
              <div className="formGroup space-y-1.5">
                <label htmlFor="nomResponsable" className="block text-sm font-semibold text-foreground">
                  Nom responsable
                </label>
                <input
                  id="nomResponsable"
                  name="nomResponsable"
                  type="text"
                  value={form.nomResponsable}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Rose Martin"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="formGroup space-y-1.5">
                <label htmlFor="telephone" className="block text-sm font-semibold text-foreground">
                  Téléphone WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  value={form.telephone}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="0696 XX XX XX"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Numéro Martinique valide requis (0696 XX XX XX)
                </p>
              </div>
              <div className="formGroup space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="rose@exemple.mq"
                />
              </div>
            </div>

            <div className="formGroup space-y-1.5">
              <label htmlFor="commune" className="block text-sm font-semibold text-foreground">
                Commune / zone <span className="text-red-500">*</span>
              </label>
              <select
                id="commune"
                name="commune"
                required
                value={form.commune}
                onChange={handleChange}
                className="select w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              >
                <option value="">— Choisir une commune —</option>
                {martiniqueCommunes.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* Description */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Présentation
            </legend>

            <div className="formGroup space-y-1.5">
              <label htmlFor="bio" className="block text-sm font-semibold text-foreground">
                Bio courte du traiteur
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                value={form.bio}
                onChange={handleChange}
                className="textArea w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Traiteur passionné depuis 10 ans, spécialiste de la cuisine créole…"
              />
            </div>

            <div className="formGroup space-y-1.5">
              <label htmlFor="description" className="block text-sm font-semibold text-foreground">
                Description activité
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="textArea w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-y"
                placeholder="Décrivez votre activité, votre cuisine, ce qui vous rend unique…"
              />
            </div>
          </fieldset>

          {/* Spécialités & Offre */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Spécialités & Offre
            </legend>

            <div className="formGroup space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Spécialités
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIALITES.map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/30 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      name="specialties"
                      value={s.value}
                      checked={form.specialties.includes(s.value)}
                      onChange={handleChange}
                      className="rounded border-border text-primary focus:ring-primary/30"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="formGroup space-y-1.5">
                <label htmlFor="prixDepart" className="block text-sm font-semibold text-foreground">
                  Prix de départ
                </label>
                <div className="relative">
                  <input
                    id="prixDepart"
                    name="prixDepart"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.prixDepart}
                    onChange={handleChange}
                    className="input w-full px-4 py-2.5 pr-8 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    €
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">À partir de X €</p>
              </div>
              <div className="formGroup space-y-1.5">
                <label htmlFor="tempsPreparation" className="block text-sm font-semibold text-foreground">
                  Temps préparation estimé
                </label>
                <select
                  id="tempsPreparation"
                  name="tempsPreparation"
                  value={form.tempsPreparation}
                  onChange={handleChange}
                  className="select w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir —</option>
                  {TEMPS_PREPARATION.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="formGroup space-y-1.5">
                <label htmlFor="heureLimite" className="block text-sm font-semibold text-foreground">
                  Heure limite commande
                </label>
                <select
                  id="heureLimite"
                  name="heureLimite"
                  value={form.heureLimite}
                  onChange={handleChange}
                  className="select w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                >
                  <option value="">— Choisir —</option>
                  {HEURES_LIMITE.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="formGroup space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Créneaux disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {CRENEAUX.map((c) => (
                    <label
                      key={c.value}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/30 transition-colors text-sm"
                    >
                      <input
                        type="checkbox"
                        name="creneaux"
                        value={c.value}
                        checked={form.creneaux.includes(c.value)}
                        onChange={handleChange}
                        className="rounded border-border text-primary focus:ring-primary/30"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Photos */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              <Camera size={14} className="inline mr-1" />
              Photos
            </legend>

            <div className="formGroup space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                Photos de vos plats / activité
              </label>
              <input
                ref={photoInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:text-sm hover:file:bg-primary/20 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                Vous pouvez sélectionner plusieurs photos
              </p>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <img
                      src={photo.preview}
                      alt="Aperçu"
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-2 space-y-1">
                      <input
                        type="text"
                        value={photo.description}
                        onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
                        placeholder="Description..."
                        className="w-full text-[10px] px-1.5 py-1 border border-border rounded-md bg-background text-foreground focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          {/* Logo */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Logo
            </legend>

            <div className="formGroup space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                Logo de votre activité
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:text-sm hover:file:bg-primary/20 cursor-pointer"
              />
            </div>

            {logoPreview && (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-24 h-24 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (logoPreview) URL.revokeObjectURL(logoPreview);
                    setLogoPreview(null);
                    setForm((prev) => ({ ...prev, logo: null }));
                    if (logoInputRef.current) logoInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </fieldset>

          {/* Réseaux sociaux */}
          <fieldset className="space-y-4 p-5 bg-card rounded-2xl border border-border">
            <legend className="text-sm font-black uppercase tracking-wider text-foreground/60 px-2">
              Réseaux sociaux (optionnel)
            </legend>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="formGroup space-y-1.5">
                <label htmlFor="instagram" className="block text-sm font-semibold text-foreground">
                  Instagram
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={form.instagram}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="@moncompte"
                />
              </div>
              <div className="formGroup space-y-1.5">
                <label htmlFor="facebook" className="block text-sm font-semibold text-foreground">
                  Facebook
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  value={form.facebook}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="facebook.com/monactivite"
                />
              </div>
              <div className="formGroup space-y-1.5">
                <label htmlFor="siteWeb" className="block text-sm font-semibold text-foreground">
                  Site web
                </label>
                <input
                  id="siteWeb"
                  name="siteWeb"
                  type="url"
                  value={form.siteWeb}
                  onChange={handleChange}
                  className="input w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="https://mon-site.com"
                />
              </div>
            </div>
          </fieldset>

          {/* Statut caché */}
          <input type="hidden" name="statut" value="beta_testeur_gratuit" />

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="btn btnPrimary inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-base"
            >
              <Send size={18} />
              Envoyer ma candidature
            </button>
            <Link
              to="/"
              className="btn btnSecondary inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-2xl border-2 border-orange-200 transition-all hover:scale-105 text-base"
            >
              Annuler
            </Link>
          </div>
        </form>

        {/* Info text */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 leading-relaxed">
          <p>
            Vous rejoignez DELIKREOL en tant que traiteur bêta testeur. L'intégration est gratuite
            pendant la phase de test. Envoyez vos photos, votre bio, vos descriptions et vos
            informations principales : nous procédons à votre mise en ligne et nous améliorons votre
            fiche avec vous.
          </p>
        </div>
      </div>
    </Layout>
  );
}