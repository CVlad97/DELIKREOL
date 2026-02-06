import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit3, Trash2, Check, X, Package,
  ChevronDown, ToggleLeft, ToggleRight, Store, Loader
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
  stock_quantity: string;
  is_available: boolean;
}

const emptyForm: ProductForm = {
  vendor_id: '', name: '', description: '', category: '',
  price: '', stock_quantity: '', is_available: true,
};

export default function AdminCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [vendors, setVendors] = useState<{ id: string; business_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

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
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
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
      stock_quantity: p.stock_quantity?.toString() || '',
      is_available: p.is_available,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.vendor_id || !form.category || !form.price) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vendor_id: form.vendor_id,
        name: form.name,
        description: form.description || null,
        category: form.category,
        price: parseFloat(form.price),
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
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
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
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-elegant transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Aucun produit</h3>
          <p className="text-sm text-muted-foreground">
            {search || categoryFilter ? 'Aucun resultat pour cette recherche' : 'Commencez par ajouter des produits au catalogue'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                      <div className="font-bold text-foreground text-sm">{p.name}</div>
                      {p.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</div>}
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
                          ? <ToggleRight className="w-6 h-6 text-emerald-500" />
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
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl max-w-lg w-full p-8 shadow-2xl">
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
                        ? <ToggleRight className="w-8 h-8 text-emerald-500" />
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
