import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit3, Trash2, Check, X, Package,
  ChevronDown, ToggleLeft, ToggleRight, Store, Loader, ImagePlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface CatalogProduct {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  created_at: string;
  vendor?: { business_name: string };
}

interface ProductForm {
  vendor_id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  stock_quantity: string;
  is_available: boolean;
}

const emptyForm: ProductForm = {
  vendor_id: '', name: '', description: '', category: '',
  price: '', image_url: '', stock_quantity: '', is_available: true,
};


function parseCsvRows(text: string): string[][] {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const cells: string[] = [];
    const separator = line.includes(';') && !line.includes(',') ? ';' : ',';
    let cell = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === separator && !quoted) { cells.push(cell.trim()); cell = ''; }
      else cell += char;
    }
    cells.push(cell.trim());
    return cells;
  });
}

export default function AdminCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [vendors, setVendors] = useState<{ id: string; business_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, vendRes] = await Promise.all([
        supabase.from('products').select('*, vendor:vendors(business_name)').order('created_at', { ascending: false }),
        supabase.from('vendors').select('id, business_name').order('business_name'),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (vendRes.data) setVendors(vendRes.data);
    } catch {
      showError('Erreur de chargement du catalogue');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))].sort();

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.vendor?.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    const matchVendor = !vendorFilter || p.vendor_id === vendorFilter;
    return matchSearch && matchCat && matchVendor;
  });

  const selectedVendor = vendors.find(v => v.id === vendorFilter);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, vendor_id: vendorFilter });
    setSelectedImage(null);
    setImagePreview('');
    setImageLoadError(false);
    setShowModal(true);
  };

  const openEdit = (p: CatalogProduct) => {
    setEditingProduct(p);
    setForm({
      vendor_id: p.vendor_id,
      name: p.name,
      description: p.description || '',
      category: p.category,
      price: p.price.toString(),
      image_url: p.image_url || '',
      stock_quantity: p.stock_quantity?.toString() || '',
      is_available: p.is_available,
    });
    setSelectedImage(null);
    setImagePreview(p.image_url || '');
    setImageLoadError(false);
    setShowModal(true);
  };

  const handleImageSelection = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      showError('Choisissez une image JPG, PNG, WebP ou AVIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('La photo ne doit pas dépasser 5 Mo');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageLoadError(false);
  };

  const uploadSelectedImage = async (): Promise<{ url: string | null; path: string | null }> => {
    if (!selectedImage) return { url: form.image_url.trim() || null, path: null };
    const extension = selectedImage.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension) ? extension : 'jpg';
    const objectPath = `admin/${form.vendor_id}/${crypto.randomUUID()}.${safeExtension}`;
    const { error } = await supabase.storage.from('product-photos').upload(objectPath, selectedImage, {
      cacheControl: '3600',
      contentType: selectedImage.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('product-photos').getPublicUrl(objectPath);
    return { url: data.publicUrl, path: objectPath };
  };

  const handleSave = async () => {
    if (!form.name || !form.vendor_id || !form.category || !form.price) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      const uploadedImage = await uploadSelectedImage();
      uploadedPath = uploadedImage.path;
      const payload = {
        vendor_id: form.vendor_id,
        name: form.name,
        description: form.description || null,
        category: form.category,
        price: parseFloat(form.price),
        image_url: uploadedImage.url,
        stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : null,
        is_available: form.is_available,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        showSuccess('Produit mis a jour');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        showSuccess('Produit cree');
      }
      setShowModal(false);
      setSelectedImage(null);
      setImagePreview('');
      await loadData();
    } catch (err: any) {
      if (uploadedPath) {
        await supabase.storage.from('product-photos').remove([uploadedPath]);
      }
      showError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };


  const handleCsvImport = async (file?: File) => {
    if (!file) return;
    setImporting(true);
    try {
      const rows = parseCsvRows(await file.text());
      if (rows.length < 2) throw new Error('Le fichier CSV est vide.');
      const headers = rows[0].map((header) => header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());
      const at = (...names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
      const nameIndex = at('nom', 'name', 'produit');
      const priceIndex = at('prix', 'price', 'prix_partenaire');
      const vendorIndex = at('traiteur', 'vendeur', 'vendor');
      if (nameIndex < 0 || priceIndex < 0) throw new Error('Colonnes requises : nom et prix.');
      const descriptionIndex = at('description', 'descriptif');
      const categoryIndex = at('categorie', 'category');
      const stockIndex = at('stock', 'quantite', 'quantity');
      const imageIndex = at('image', 'image_url', 'photo', 'photo_url');
      const imported = rows.slice(1).map((row) => {
        const vendorName = vendorIndex >= 0 ? row[vendorIndex] : selectedVendor?.business_name;
        const matchedVendor = vendors.find((item) => item.business_name.toLowerCase() === (vendorName || '').toLowerCase());
        return {
          vendor_id: matchedVendor?.id || vendorFilter,
          name: row[nameIndex] || '',
          description: descriptionIndex >= 0 ? row[descriptionIndex] || null : null,
          category: categoryIndex >= 0 ? row[categoryIndex] || 'Plats' : 'Plats',
          price: Number(String(row[priceIndex] || '').replace(',', '.')),
          image_url: imageIndex >= 0 ? row[imageIndex] || null : null,
          stock_quantity: stockIndex >= 0 && row[stockIndex] ? Math.max(0, Number(row[stockIndex])) : 15,
          is_available: true,
          is_public: true,
          is_demo: false,
          status: 'verified',
        };
      }).filter((item) => item.name && Number.isFinite(item.price) && item.price > 0 && item.vendor_id);
      if (imported.length === 0) throw new Error('Aucune ligne valide. Sélectionnez un traiteur ou ajoutez une colonne traiteur.');
      const { error } = await supabase.from('products').insert(imported);
      if (error) throw error;
      showSuccess(`${imported.length} produit(s) importé(s) et publié(s)`);
      await loadData();
    } catch (error: any) {
      showError(error.message || 'Import CSV impossible');
    } finally {
      setImporting(false);
    }
  };

  const toggleAvailability = async (p: CatalogProduct) => {
    const { error } = await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id);
    if (error) {
      showError('Erreur de mise a jour');
      return;
    }
    setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, is_available: !prod.is_available } : prod));
  };

  const handleDelete = async (p: CatalogProduct) => {
    if (!window.confirm(`Supprimer "${p.name}" ?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) {
      showError('Erreur de suppression');
      return;
    }
    showSuccess('Produit supprime');
    setProducts(prev => prev.filter(prod => prod.id !== p.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Catalogue Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produits - {vendors.length} vendeurs</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-card border border-primary/30 text-primary rounded-2xl font-bold text-sm hover:bg-primary/5 transition-all">
          <ImagePlus className="w-4 h-4" /> {importing ? 'Import en cours…' : 'Importer CSV'}
          <input type="file" accept=".csv,text/csv" className="sr-only" disabled={importing} onChange={e => { void handleCsvImport(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-elegant transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:min-w-64">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={vendorFilter}
            onChange={e => {
              setVendorFilter(e.target.value);
              setCategoryFilter('');
              setSearch('');
            }}
            className="w-full appearance-none pl-10 pr-10 py-2.5 bg-card border border-border rounded-2xl text-foreground text-sm focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label="Filtrer par traiteur"
          >
            <option value="">Choisir un traiteur</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.business_name} ({products.filter(p => p.vendor_id === v.id).length})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un produit ou vendeur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-2xl text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none px-4 pr-10 py-2.5 bg-card border border-border rounded-2xl text-foreground text-sm focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="">Toutes categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {selectedVendor && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="font-bold text-foreground">{selectedVendor.business_name}</p>
          <p className="text-xs text-muted-foreground">{filtered.length} produit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}. Les informations et photos ci-dessous concernent uniquement ce traiteur.</p>
        </div>
      )}

      {!vendorFilter ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/50">
          <Store className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Sélectionnez un traiteur</h3>
          <p className="text-sm text-muted-foreground">Vous verrez uniquement ses produits, descriptions et photos.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Aucun produit</h3>
          <p className="text-sm text-muted-foreground">
            {search || categoryFilter ? 'Aucun resultat pour cette recherche' : 'Commencez par ajouter des produits au catalogue'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Vendeur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Categorie</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Prix</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dispo</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted" title="Aucune photo">
                            <ImagePlus className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm">{p.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description || 'Aucune description enregistrée.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{p.vendor?.business_name || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-foreground">{p.price.toFixed(2)} EUR</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${p.stock_quantity === 0 ? 'text-red-500' : 'text-foreground'}`}>
                        {p.stock_quantity ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleAvailability(p)} className="inline-flex">
                        {p.is_available
                          ? <ToggleRight className="w-6 h-6 text-success" />
                          : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-muted transition-colors" title="Modifier">
                          <Edit3 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-2 rounded-xl hover:bg-red-50 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border/30 md:hidden">
            {filtered.map(p => (
              <article key={p.id} className="space-y-3 p-4">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt={`Photo actuelle de ${p.name}`} className="h-44 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <ImagePlus className="h-5 w-5" /> Aucune photo enregistrée
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-foreground">{p.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{p.vendor?.business_name || 'Vendeur non renseigné'} · {p.category}</p>
                  </div>
                  <span className="shrink-0 font-black text-foreground">{Number(p.price).toFixed(2)} €</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description actuelle</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description || 'Aucune description enregistrée.'}</p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className={p.stock_quantity === 0 ? 'font-bold text-red-500' : 'text-muted-foreground'}>Stock : {p.stock_quantity ?? '—'}</span>
                  <span className={p.is_available ? 'font-bold text-success' : 'font-bold text-muted-foreground'}>{p.is_available ? 'Disponible' : 'Indisponible'}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleAvailability(p)} className="rounded-xl p-2 hover:bg-muted" aria-label={p.is_available ? 'Rendre indisponible' : 'Rendre disponible'}>
                      {p.is_available ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEdit(p)} className="rounded-xl p-2 hover:bg-muted" aria-label="Modifier le produit"><Edit3 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(p)} className="rounded-xl p-2 hover:bg-red-50" aria-label="Supprimer le produit"><Trash2 className="h-4 w-4 text-red-400" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="my-3 w-full max-w-lg rounded-3xl bg-card p-5 shadow-2xl sm:my-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vendeur *</label>
                <select
                  value={form.vendor_id}
                  onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Choisir un vendeur</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.business_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom du produit *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                  placeholder="Ex: Colombo de poulet"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={2}
                  placeholder="Description du produit..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo produit HD</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={e => {
                    setForm(f => ({ ...f, image_url: e.target.value }));
                    setSelectedImage(null);
                    setImagePreview(e.target.value);
                    setImageLoadError(false);
                  }}
                  className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                  placeholder="https://... ou /vendors/traiteur/photo.webp"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Laisse vide si la photo n’est pas assez nette : le site affichera le visuel partenaire ou l’emplacement photo.
                </p>
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10">
                  <ImagePlus className="h-5 w-5" />
                  Choisir une nouvelle photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={e => handleImageSelection(e.target.files?.[0])}
                  />
                </label>
                {(imagePreview || form.image_url) && !imageLoadError && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted">
                    <div className="border-b border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground">
                      {selectedImage ? 'Aperçu de la nouvelle photo — pas encore enregistrée' : 'Photo actuelle'}
                    </div>
                    <img
                      src={imagePreview || form.image_url}
                      alt={selectedImage ? 'Aperçu de la nouvelle photo' : 'Photo actuelle du produit'}
                      className="h-52 w-full object-contain bg-black/5"
                      onError={() => setImageLoadError(true)}
                    />
                  </div>
                )}
                {imageLoadError && <p className="mt-2 text-xs font-bold text-red-500">Impossible d’afficher cette image. Vérifiez le lien ou choisissez un fichier.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categorie *</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Plats"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prix (EUR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                    placeholder="12.50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/30"
                    placeholder="Quantite"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                      className="inline-flex"
                    >
                      {form.is_available
                        ? <ToggleRight className="w-8 h-8 text-success" />
                        : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                      }
                    </button>
                    <span className="text-sm font-bold text-foreground">{form.is_available ? 'Disponible' : 'Indisponible'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-2xl font-bold text-sm hover:bg-muted/80 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-elegant transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingProduct ? 'Mettre a jour' : 'Creer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
