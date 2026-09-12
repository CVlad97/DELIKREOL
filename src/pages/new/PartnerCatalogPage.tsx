import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChefHat, Eye, ImagePlus, Loader2, Pencil, PlayCircle, Plus, Save, ShieldCheck, Sparkles, Store, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

type Vendor = {
  id: string;
  business_name: string | null;
  business_type: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  commune: string | null;
  address: string | null;
  specialty: string | null;
  story: string | null;
  hero_image: string | null;
  status: string;
  is_public: boolean;
};

type Product = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  stock_quantity: number | null;
  is_available: boolean;
  status: string;
  is_public: boolean;
  sides: string[] | null;
  menu_options: {
    drinks?: string[];
    included_side_count?: number;
    included_drink_count?: number;
  } | null;
};

const categories = ['Plat', 'Menu', 'Dessert', 'Boisson', 'Buffet', 'Brunch', 'Autre'];
const sideChoices = ['Riz', 'Lentilles', 'Frites', 'Crudités'];
const drinkChoices = ['Eau', 'Jus local', 'Soda'];
const blankProduct = {
  name: '', description: '', category: 'Plat', price: '', stock: '', imageUrl: '', available: true,
  sides: '', drinks: '', includedSideCount: '1', includedDrinkCount: '1',
};
const partnerTutorialImage = `${import.meta.env.BASE_URL}tutorials/tuto-ajouter-plat-delikreol.jpg`;
const menuSuggestions = [
  { label: 'Créole classique', sides: ['Riz', 'Lentilles', 'Crudités'], drinks: ['Eau', 'Jus local'] },
  { label: 'Snack', sides: ['Frites', 'Crudités'], drinks: ['Eau', 'Soda'] },
];

function PartnerTutorial() {
  return (
    <figure className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-[2rem] border border-primary/20 bg-white shadow-soft">
      <img
        src={partnerTutorialImage}
        alt="Tutoriel en quatre étapes pour se connecter à l’espace partenaire, ajouter un plat, compléter sa fiche et le publier"
        className="h-auto w-full"
        loading="lazy"
      />
      <figcaption className="p-4 text-center text-sm font-bold text-stone-600">
        Appuyez sur « + Ajouter un plat » dans votre studio partenaire.
      </figcaption>
    </figure>
  );
}

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}


function parsePartnerCsv(text: string): string[][] {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) { cells.push(cell.trim()); cell = ''; }
      else cell += char;
    }
    cells.push(cell.trim());
    return cells;
  });
}

export default function PartnerCatalogPage() {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { showError, showSuccess } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    business_name: '', business_type: 'traiteur', description: '', phone: '', whatsapp: '',
    email: '', commune: '', address: '', specialty: '', story: '', hero_image: '',
  });
  const [product, setProduct] = useState(blankProduct);
  const productFormRef = useRef<HTMLFormElement>(null);

  const canPublishDirectly = vendor?.status === 'verified' && vendor.is_public;

  const toggleChoice = (field: 'sides' | 'drinks', choice: string) => {
    setProduct((current) => {
      const selected = current[field].split(',').map((item) => item.trim()).filter(Boolean);
      const next = selected.includes(choice)
        ? selected.filter((item) => item !== choice)
        : [...selected, choice];
      return { ...current, [field]: next.join(', ') };
    });
  };

  const applyMenuSuggestion = (suggestion: typeof menuSuggestions[number]) => {
    setProduct((current) => ({
      ...current,
      category: 'Menu',
      sides: suggestion.sides.join(', '),
      drinks: suggestion.drinks.join(', '),
      includedSideCount: '1',
      includedDrinkCount: '1',
    }));
    productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openProductForm = () => {
    setEditingId(null);
    setProduct(blankProduct);
    productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const publishedCount = useMemo(() => products.filter((item) => item.is_public && item.status === 'verified').length, [products]);
  const availableCount = useMemo(() => products.filter((item) => item.is_available).length, [products]);

  const loadWorkspace = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors').select('id,business_name,business_type,description,phone,whatsapp,email,commune,address,specialty,story,hero_image,status,is_public')
        .eq('user_id', user.id).maybeSingle();
      if (vendorError) throw vendorError;
      const currentVendor = vendorData as Vendor | null;
      setVendor(currentVendor);
      if (!currentVendor) {
        setProducts([]);
        return;
      }
      setProfile({
        business_name: currentVendor.business_name || '',
        business_type: currentVendor.business_type || 'traiteur',
        description: currentVendor.description || '',
        phone: currentVendor.phone || '',
        whatsapp: currentVendor.whatsapp || '',
        email: currentVendor.email || user.email || '',
        commune: currentVendor.commune || '',
        address: currentVendor.address || '',
        specialty: currentVendor.specialty || '',
        story: currentVendor.story || '',
        hero_image: currentVendor.hero_image || '',
      });
      const { data: productData, error: productError } = await supabase
        .from('products').select('id,vendor_id,name,description,category,price,image_url,stock_quantity,is_available,status,is_public,sides,menu_options')
        .eq('vendor_id', currentVendor.id).order('created_at', { ascending: false });
      if (productError) throw productError;
      setProducts((productData || []) as Product[]);
    } catch (error) {
      console.error(error);
      showError('Impossible de charger votre espace partenaire.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) void loadWorkspace(); else setLoading(false); }, [user]);

  const claimAccess = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc('claim_partner_access');
      if (error) throw error;
      if (!data?.claimed) {
        showError("Aucune fiche ne correspond à l’email confirmé de ce compte. Demandez à DELIKREOL d’ajouter votre email à votre fiche.");
        return;
      }
      await refreshProfile();
      await loadWorkspace();
      showSuccess(`Accès à ${data.business_name} activé.`);
    } catch (error) {
      console.error(error);
      showError('Activation impossible. Vérifiez que votre adresse email est confirmée.');
    } finally {
      setClaiming(false);
    }
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!vendor || !profile.business_name.trim()) return;
    setSavingProfile(true);
    try {
      const payload = Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, value.trim() || null]));
      const { error } = await supabase.from('vendors').update(payload).eq('id', vendor.id);
      if (error) throw error;
      await loadWorkspace();
      showSuccess('Profil enregistré et envoyé en contrôle.');
    } catch (error) {
      console.error(error);
      showError('Le profil n’a pas pu être enregistré.');
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showError('Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.');
      return;
    }
    setUploading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('product-photos').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('product-photos').getPublicUrl(path);
      setProduct((current) => ({ ...current, imageUrl: data.publicUrl }));
      showSuccess('Photo ajoutée.');
    } catch (error) {
      console.error(error);
      showError('La photo n’a pas pu être envoyée.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };


  const importCsv = async (file?: File) => {
    if (!file || !vendor) return;
    setImporting(true);
    try {
      const rows = parsePartnerCsv(await file.text());
      if (rows.length < 2) throw new Error('Le fichier CSV est vide.');
      const headers = rows[0].map((header) => header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());
      const at = (...names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
      const nameIndex = at('nom', 'name', 'produit');
      const priceIndex = at('prix', 'price');
      if (nameIndex < 0 || priceIndex < 0) throw new Error('Colonnes requises : nom et prix.');
      const descriptionIndex = at('description', 'descriptif');
      const categoryIndex = at('categorie', 'category');
      const stockIndex = at('stock', 'quantite', 'quantity');
      const imageIndex = at('image', 'image_url', 'photo', 'photo_url');
      const sidesIndex = at('accompagnements', 'sides');
      const drinksIndex = at('boissons', 'drinks');
      const imported = rows.slice(1).map((row) => {
        const sides = sidesIndex >= 0 ? (row[sidesIndex] || '').split(';').map((item) => item.trim()).filter(Boolean) : [];
        const drinks = drinksIndex >= 0 ? (row[drinksIndex] || '').split(';').map((item) => item.trim()).filter(Boolean) : [];
        const isMenu = (categoryIndex >= 0 ? row[categoryIndex] : '') === 'Menu';
        return {
          vendor_id: vendor.id,
          name: row[nameIndex] || '',
          description: descriptionIndex >= 0 ? row[descriptionIndex] || null : null,
          category: categoryIndex >= 0 ? row[categoryIndex] || 'Plat' : 'Plat',
          price: Number(String(row[priceIndex] || '').replace(',', '.')),
          image_url: imageIndex >= 0 ? row[imageIndex] || null : null,
          stock_quantity: stockIndex >= 0 && row[stockIndex] ? Math.max(0, Number(row[stockIndex])) : 15,
          is_available: true,
          status: canPublishDirectly ? 'verified' : 'draft',
          is_public: canPublishDirectly,
          is_demo: false,
          sides,
          menu_options: isMenu ? { drinks, included_side_count: Math.min(sides.length, 1), included_drink_count: Math.min(drinks.length, 1) } : null,
        };
      }).filter((item) => item.name && Number.isFinite(item.price) && item.price > 0);
      if (imported.length === 0) throw new Error('Aucune ligne valide dans le CSV.');
      const { error } = await supabase.from('products').insert(imported);
      if (error) throw error;
      await loadWorkspace();
      showSuccess(canPublishDirectly ? `${imported.length} produit(s) importé(s) et publié(s).` : `${imported.length} produit(s) importé(s), en attente de validation.`);
    } catch (error: any) {
      console.error(error);
      showError(error.message || 'Import CSV impossible.');
    } finally {
      setImporting(false);
    }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!vendor || !product.name.trim() || Number(product.price) <= 0) {
      showError('Indiquez au minimum un nom et un prix supérieur à zéro.');
      return;
    }
    setSavingProduct(true);
    try {
      const sides = product.sides.split(',').map((side) => side.trim()).filter(Boolean);
      const drinks = product.drinks.split(',').map((drink) => drink.trim()).filter(Boolean);
      const isMenu = product.category === 'Menu';
      const payload = {
        vendor_id: vendor.id,
        name: product.name.trim(),
        description: product.description.trim() || null,
        category: product.category,
        price: Number(product.price),
        image_url: product.imageUrl.trim() || null,
        stock_quantity: product.stock ? Math.max(0, Number(product.stock)) : null,
        is_available: product.available,
        status: canPublishDirectly ? 'verified' : 'draft',
        is_public: canPublishDirectly,
        is_demo: false,
        sides,
        menu_options: isMenu ? {
          drinks,
          included_side_count: Math.min(sides.length, Math.max(0, Number(product.includedSideCount) || 0)),
          included_drink_count: Math.min(drinks.length, Math.max(0, Number(product.includedDrinkCount) || 0)),
        } : null,
      };
      const request = editingId
        ? supabase.from('products').update(payload).eq('id', editingId)
        : supabase.from('products').insert(payload);
      const { error } = await request;
      if (error) throw error;
      setProduct(blankProduct);
      setEditingId(null);
      await loadWorkspace();
      showSuccess(canPublishDirectly
        ? (editingId ? 'Plat modifié et publié sur le site.' : 'Plat ajouté et publié sur le site.')
        : (editingId ? 'Modification envoyée en validation.' : 'Produit créé et envoyé en validation.'));
    } catch (error) {
      console.error(error);
      showError('Le produit n’a pas pu être enregistré.');
    } finally {
      setSavingProduct(false);
    }
  };

  const editProduct = (item: Product) => {
    setEditingId(item.id);
    setProduct({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: String(item.price),
      stock: item.stock_quantity == null ? '' : String(item.stock_quantity),
      imageUrl: item.image_url || '',
      available: item.is_available,
      sides: (item.sides || []).join(', '),
      drinks: (item.menu_options?.drinks || []).join(', '),
      includedSideCount: String(item.menu_options?.included_side_count ?? 1),
      includedDrinkCount: String(item.menu_options?.included_drink_count ?? 1),
    });
    window.scrollTo({ top: 650, behavior: 'smooth' });
  };

  const removeProduct = async (item: Product) => {
    if (!window.confirm(`Supprimer « ${item.name} » ?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', item.id);
    if (error) showError('Suppression impossible.');
    else { await loadWorkspace(); showSuccess('Produit supprimé.'); }
  };

  if (authLoading || loading) return <Layout><div className="flex min-h-[65vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></Layout>;

  if (!user) return (
    <Layout><main className="min-h-[70vh] bg-[#fff8ef] px-4 py-16"><section className="mx-auto max-w-xl rounded-[2rem] border border-primary/20 bg-white p-8 text-center shadow-soft">
      <Store className="mx-auto h-12 w-12 text-primary" /><h1 className="mt-4 text-3xl font-black">Votre espace traiteur</h1>
      <p className="mt-3 text-stone-600">Connectez-vous avec l’adresse email enregistrée sur votre fiche DELIKREOL.</p>
      <Link to="/connexion?next=/catalogue-partenaire" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-black text-white">Se connecter</Link>
    </section><PartnerTutorial /></main></Layout>
  );

  if (!vendor) return (
    <Layout><main className="min-h-[70vh] bg-[#fff8ef] px-4 py-16"><section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-primary/20 bg-white shadow-soft">
      <div className="bg-gradient-to-br from-[#26150f] to-[#8d3d23] p-8 text-white"><ChefHat className="h-12 w-12" /><h1 className="mt-4 text-3xl font-black">Activez votre vitrine</h1><p className="mt-3 text-orange-50/85">Un clic suffit si l’email confirmé de votre compte correspond à celui de votre fiche partenaire.</p></div>
      <div className="p-8"><button onClick={claimAccess} disabled={claiming} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-white disabled:opacity-60">{claiming ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />} Activer mon accès sécurisé</button>
      <p className="mt-4 text-center text-sm text-stone-500">Pas encore référencé ? <Link className="font-black text-primary" to="/inscription-traiteur">Créer ma fiche gratuitement</Link></p></div>
    </section><PartnerTutorial /></main></Layout>
  );

  return (
    <Layout><main className="min-h-screen bg-[#fff8ef] px-4 py-8 text-[#26150f]">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#26150f] via-[#5c2819] to-[#d86a35] p-7 text-white shadow-2xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-orange-200">Studio partenaire</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">{vendor.business_name || 'Ma vitrine'}</h1><p className="mt-3 max-w-2xl text-orange-50/85">Mettez à jour votre présentation, vos plats et vos menus depuis votre téléphone.</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={openProductForm} className="inline-flex items-center gap-2 rounded-full bg-[#f6c453] px-5 py-3 text-sm font-black text-[#26150f] shadow-lg"><Plus className="h-5 w-5" /> Ajouter un plat</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black"><ImagePlus className="h-4 w-4" />{importing ? 'Import…' : 'Importer CSV'}<input type="file" accept=".csv,text/csv" className="hidden" disabled={importing} onChange={e=>{void importCsv(e.target.files?.[0]); e.target.value='';}} /></label><Link to="/simulation-partenaires" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black"><PlayCircle className="h-4 w-4" /> Tutoriel interactif</Link><Link to="/partner-documents" className="rounded-full bg-white/15 px-4 py-2 text-sm font-black">Mes documents</Link>{vendor.is_public && <Link to={`/traiteur/${slugify(vendor.business_name || '')}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#5c2819]"><Eye className="h-4 w-4" /> Voir ma vitrine</Link>}</div></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-orange-100">Produits</p><p className="mt-1 text-2xl font-black">{products.length}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-orange-100">Disponibles</p><p className="mt-1 text-2xl font-black">{availableCount}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-orange-100">Publiés</p><p className="mt-1 text-2xl font-black">{publishedCount}</p></div></div>
        </section>

        <section className="rounded-[2rem] border border-[#f6c453]/60 bg-[#fff3c9] p-5 shadow-soft">
          <h2 className="font-black">Comment ajouter un plat ?</h2>
          <ol className="mt-2 grid gap-2 text-sm text-stone-700 sm:grid-cols-3"><li><strong>1.</strong> Appuyez sur « + Ajouter un plat ».</li><li><strong>2.</strong> Indiquez nom, prix, stock, accompagnements et photo.</li><li><strong>3.</strong> Enregistrez : {canPublishDirectly ? 'le plat apparaît immédiatement sur DELIKREOL.' : 'DELIKREOL contrôle le plat avant publication.'}</li></ol>
        </section>
        <PartnerTutorial />

        <section className="rounded-[2rem] border border-primary/20 bg-white p-6 shadow-soft">
          <div className="flex items-start gap-3"><Sparkles className="mt-1 h-6 w-6 text-primary" /><div><h2 className="text-xl font-black">Propositions de menu</h2><p className="text-sm text-stone-600">Ces exemples préremplissent seulement le formulaire. Vérifiez chaque choix avec ce que vous cuisinez réellement avant d’enregistrer.</p></div></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {menuSuggestions.map((suggestion) => <button key={suggestion.label} type="button" onClick={() => applyMenuSuggestion(suggestion)} className="rounded-2xl border border-[#f6c453]/70 bg-[#fff8df] p-4 text-left transition hover:border-primary"><span className="font-black">{suggestion.label}</span><span className="mt-1 block text-xs text-stone-600">{suggestion.sides.join(', ')} · {suggestion.drinks.join(', ')}</span><span className="mt-2 block text-xs font-black text-primary">Utiliser comme brouillon</span></button>)}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-[2rem] border border-primary/20 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3"><Store className="h-6 w-6 text-primary" /><div><h2 className="text-xl font-black">Ma présentation</h2><p className="text-sm text-stone-500">Ce que vos futurs clients verront.</p></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-bold">Nom commercial<input required value={profile.business_name} onChange={e=>setProfile({...profile,business_name:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Commune<input value={profile.commune} onChange={e=>setProfile({...profile,commune:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Spécialité<input value={profile.specialty} onChange={e=>setProfile({...profile,specialty:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="Cuisine créole, brunch…" /></label>
              <label className="text-sm font-bold">Téléphone<input value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">WhatsApp<input value={profile.whatsapp} onChange={e=>setProfile({...profile,whatsapp:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="sm:col-span-2 text-sm font-bold">Description<textarea value={profile.description} onChange={e=>setProfile({...profile,description:e.target.value})} rows={4} className="mt-2 w-full rounded-xl border px-4 py-3" placeholder="Votre savoir-faire, vos produits locaux, votre promesse…" /></label>
              <label className="sm:col-span-2 text-sm font-bold">Votre histoire<textarea value={profile.story} onChange={e=>setProfile({...profile,story:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            </div>
            <button disabled={savingProfile} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#1f6a4a] px-5 py-3 font-black text-white disabled:opacity-60"><Save className="h-4 w-4" />{savingProfile ? 'Enregistrement…' : 'Enregistrer mon profil'}</button>
          </form>

          <form ref={productFormRef} onSubmit={saveProduct} className="scroll-mt-6 rounded-[2rem] border border-primary/20 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3"><Plus className="h-6 w-6 text-primary" /><div><h2 className="text-xl font-black">{editingId ? 'Modifier le plat' : 'Ajouter un plat ou un menu'}</h2><p className="text-sm text-stone-500">{canPublishDirectly ? 'Votre fiche est validée : l’enregistrement publie directement sur le site.' : 'Votre fiche doit être validée avant la publication publique.'}</p></div></div>
            <div className="mt-5 space-y-4">
              <input required placeholder="Nom du plat ou de l’offre" value={product.name} onChange={e=>setProduct({...product,name:e.target.value})} className="w-full rounded-xl border px-4 py-3" />
              <textarea placeholder="Description appétissante, accompagnements, portion…" value={product.description} onChange={e=>setProduct({...product,description:e.target.value})} rows={3} className="w-full rounded-xl border px-4 py-3" />
              <fieldset className="rounded-2xl border p-4">
                <legend className="px-2 text-sm font-black">Accompagnements proposés</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sideChoices.map((choice) => (
                    <label key={choice} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-[#fff8ef] px-4 py-3 text-sm font-bold">
                      <input type="checkbox" checked={product.sides.split(',').map(item=>item.trim()).includes(choice)} onChange={()=>toggleChoice('sides', choice)} className="h-5 w-5 accent-primary" />
                      {choice}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-3"><select value={product.category} onChange={e=>setProduct({...product,category:e.target.value})} className="rounded-xl border px-4 py-3">{categories.map(item=><option key={item}>{item}</option>)}</select><input required type="number" min="0.01" step="0.01" placeholder="Prix €" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})} className="rounded-xl border px-4 py-3" /><input type="number" min="0" placeholder="Stock" value={product.stock} onChange={e=>setProduct({...product,stock:e.target.value})} className="rounded-xl border px-4 py-3" /></div>
              {product.category === 'Menu' && <div className="space-y-4 rounded-2xl border border-[#f6c453]/70 bg-[#fff8df] p-4">
                <div><h3 className="font-black">Composition du menu</h3><p className="text-xs text-stone-600">Le client verra les accompagnements et les boissons compris dans le prix.</p></div>
                <fieldset>
                  <legend className="text-sm font-black">Boissons proposées</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {drinkChoices.map((choice) => (
                      <label key={choice} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-bold">
                        <input type="checkbox" checked={product.drinks.split(',').map(item=>item.trim()).includes(choice)} onChange={()=>toggleChoice('drinks', choice)} className="h-5 w-5 accent-primary" />
                        {choice}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-bold">Accompagnements inclus<input type="number" min="0" max="10" value={product.includedSideCount} onChange={e=>setProduct({...product,includedSideCount:e.target.value})} className="mt-2 w-full rounded-xl border bg-white px-4 py-3" /></label>
                  <label className="text-sm font-bold">Boissons incluses<input type="number" min="0" max="10" value={product.includedDrinkCount} onChange={e=>setProduct({...product,includedDrinkCount:e.target.value})} className="mt-2 w-full rounded-xl border bg-white px-4 py-3" /></label>
                </div>
              </div>}
              <label className="flex items-center gap-3 rounded-xl bg-[#fff8ef] p-3 text-sm font-bold"><input type="checkbox" checked={product.available} onChange={e=>setProduct({...product,available:e.target.checked})} /> Disponible à la commande</label>
              <div className="rounded-2xl border border-dashed border-primary/30 bg-[#fff8ef] p-4"><div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-primary shadow-sm"><ImagePlus className="h-4 w-4" />{uploading ? 'Envoi…' : 'Choisir une photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="hidden" /></label>{product.imageUrl && <img src={product.imageUrl} alt="Aperçu" className="h-20 w-20 rounded-xl object-cover" />}</div></div>
              <div className="flex gap-2"><button disabled={savingProduct||uploading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-white disabled:opacity-60"><Save className="h-4 w-4" />{savingProduct ? 'Enregistrement…' : editingId ? 'Enregistrer la modification' : canPublishDirectly ? 'Publier sur DELIKREOL' : 'Envoyer en validation'}</button>{editingId && <button type="button" onClick={()=>{setEditingId(null);setProduct(blankProduct);}} className="rounded-2xl border px-4 font-black">Annuler</button>}</div>
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] border border-primary/20 bg-white p-6 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Ma carte</h2><p className="text-sm text-stone-500">Un statut « en contrôle » apparaît après chaque modification.</p></div><CheckCircle2 className="h-7 w-7 text-[#1f6a4a]" /></div>
          {products.length===0 ? <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-stone-500">Ajoutez votre premier plat pour donner vie à votre vitrine.</div> :
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map(item=><article key={item.id} className="overflow-hidden rounded-2xl border bg-[#fffdfa]">{item.image_url ? <img src={item.image_url} alt={item.name} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-[#f7ecdb]"><ChefHat className="h-10 w-10 text-primary/50" /></div>}<div className="p-4"><div className="flex justify-between gap-3"><div><h3 className="font-black">{item.name}</h3><p className="text-xs text-stone-500">{item.category}</p></div><strong className="text-primary">{Number(item.price).toFixed(2)} €</strong></div><p className="mt-2 line-clamp-2 text-sm text-stone-600">{item.description || 'Description à compléter'}</p><div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black"><span className={`rounded-full px-2 py-1 ${item.is_available?'bg-emerald-100 text-emerald-800':'bg-stone-100 text-stone-600'}`}>{item.is_available?'Disponible':'En pause'}</span><span className="rounded-full bg-orange-100 px-2 py-1 text-orange-800">{item.is_public&&item.status==='verified'?'Publié':'En contrôle'}</span></div><div className="mt-4 flex gap-2"><button onClick={()=>editProduct(item)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f7ecdb] px-3 py-2 text-xs font-black"><Pencil className="h-3.5 w-3.5" /> Modifier</button><button onClick={()=>void removeProduct(item)} aria-label={`Supprimer ${item.name}`} className="rounded-xl bg-red-50 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
        </section>
      </div>
    </main></Layout>
  );
}
