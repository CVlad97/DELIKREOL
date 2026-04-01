import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, ImagePlus, Package, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { productsService } from '../../services/productsService';
import type { Product } from '../../types';

interface VendorProfile {
  name: string;
  category: string;
  phone?: string;
}

const DEFAULT_PROFILE: VendorProfile = {
  name: 'Partenaire DELIKREOL',
  category: 'restaurant',
};

const categoryOptions = [
  'restaurant',
  'producer',
  'merchant',
  'services',
  'transport',
  'artisan',
];

const productCategories = [
  'Plats',
  'Courses',
  'Colis',
  'Service',
  'Boissons',
  'Epicerie',
  'Autre',
];

function getVendorProfileKey(userId: string) {
  return `delikreol_vendor_profile_${userId}`;
}

function getVendorRefKey(userId: string) {
  return `delikreol_vendor_ref_${userId}`;
}

function loadVendorProfile(userId: string): VendorProfile {
  const raw = localStorage.getItem(getVendorProfileKey(userId));
  if (!raw) return DEFAULT_PROFILE;
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveVendorProfile(userId: string, profile: VendorProfile) {
  localStorage.setItem(getVendorProfileKey(userId), JSON.stringify(profile));
}

function parseAmount(value: string) {
  return Number(value.replace(',', '.')) || 0;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function VendorProducts() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<VendorProfile>(DEFAULT_PROFILE);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: productCategories[0],
    price: '',
    partnerFee: '',
    deliveryFee: '',
    commissionRate: '15',
    imageUrl: '',
    stock: '',
    available: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const vendorRef = useMemo(() => {
    if (!user) return 'vendor_demo';
    const key = getVendorRefKey(user.id);
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const generated = `vendor_${user.id}`;
    localStorage.setItem(key, generated);
    return generated;
  }, [user]);

  const pricingPreview = useMemo(() => {
    const vendorPrice = parseAmount(form.price);
    const partnerFee = parseAmount(form.partnerFee);
    const deliveryFee = parseAmount(form.deliveryFee);
    const commissionRate = parseAmount(form.commissionRate);
    const platformFee = Number(((vendorPrice * commissionRate) / 100).toFixed(2));
    const clientPrice = Number((vendorPrice + partnerFee + deliveryFee + platformFee).toFixed(2));
    const commissionShare = clientPrice > 0 ? Number(((platformFee / clientPrice) * 100).toFixed(1)) : 0;
    return {
      vendorPrice,
      partnerFee,
      deliveryFee,
      commissionRate,
      platformFee,
      clientPrice,
      commissionShare,
    };
  }, [form.price, form.partnerFee, form.deliveryFee, form.commissionRate]);

  const catalogMetrics = useMemo(() => {
    const activeProducts = products.filter((product) => product.is_available);
    const totalClientRevenue = activeProducts.reduce((sum, product) => sum + (product.client_price ?? product.price ?? 0), 0);
    const totalVendorBase = activeProducts.reduce((sum, product) => sum + (product.vendor_price ?? product.price ?? 0), 0);
    const totalPlatformFees = activeProducts.reduce((sum, product) => sum + (product.platform_fee ?? 0), 0);
    return {
      activeCount: activeProducts.length,
      totalClientRevenue,
      totalVendorBase,
      totalPlatformFees,
    };
  }, [products]);

  useEffect(() => {
    if (!user) return;
    setProfile(loadVendorProfile(user.id));
    void loadProducts();
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const all = await productsService.listAll();
      setProducts(all.filter((p) => p.vendor_id === vendorRef));
    } catch (err) {
      console.error(err);
      showError('Impossible de charger le catalogue');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = () => {
    if (!user) return;
    saveVendorProfile(user.id, profile);
    showSuccess('Profil partenaire mis a jour');
  };

  const handleFileChange = (file?: File | null) => {
    if (!file) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (url) {
        setImagePreview(url);
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async () => {
    if (!form.name || !form.price) {
      showError('Nom et prix obligatoires');
      return;
    }
    try {
      setSaving(true);
      const { vendorPrice, partnerFee, deliveryFee, commissionRate, platformFee, clientPrice } = pricingPreview;
      const stockValue = form.stock ? Number(form.stock) : null;
      await productsService.create({
        vendor_id: vendorRef,
        name: form.name,
        description: form.description || null,
        category: form.category,
        price: Number.isNaN(clientPrice) ? 0 : clientPrice,
        vendor_price: Number.isNaN(vendorPrice) ? 0 : vendorPrice,
        client_price: Number.isNaN(clientPrice) ? 0 : clientPrice,
        platform_fee: platformFee,
        partner_fee: partnerFee,
        delivery_fee: deliveryFee,
        image_url: form.imageUrl || null,
        stock_quantity: stockValue,
        is_available: form.available,
      });
      setForm({
        name: '',
        description: '',
        category: productCategories[0],
        price: '',
        partnerFee: '',
        deliveryFee: '',
        commissionRate: '15',
        imageUrl: '',
        stock: '',
        available: true,
      });
      setImagePreview(null);
      await loadProducts();
      showSuccess('Produit ajoute au catalogue');
    } catch (err) {
      console.error(err);
      showError('Echec de la creation');
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    downloadFile(
      `delikreol-catalogue-${vendorRef}.json`,
      JSON.stringify(products, null, 2),
      'application/json;charset=utf-8'
    );
    showSuccess('Export JSON telecharge');
  };

  const handleExportCsv = () => {
    const rows = [
      ['nom', 'categorie', 'prix_partenaire', 'frais_partenaire', 'frais_livraison', 'commission_plateforme', 'prix_client', 'stock', 'disponible'],
      ...products.map((product) => [
        product.name,
        product.category,
        String(product.vendor_price ?? product.price ?? 0),
        String(product.partner_fee ?? 0),
        String(product.delivery_fee ?? 0),
        String(product.platform_fee ?? 0),
        String(product.client_price ?? product.price ?? 0),
        String(product.stock_quantity ?? ''),
        product.is_available ? 'oui' : 'non',
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    downloadFile(`delikreol-catalogue-${vendorRef}.csv`, csv, 'text/csv;charset=utf-8');
    showSuccess('Export CSV telecharge');
  };

  const handleRemove = async (id: string) => {
    try {
      await productsService.remove(id);
      await loadProducts();
      showSuccess('Produit retire');
    } catch (err) {
      console.error(err);
      showError('Echec de la suppression');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6efe7] flex items-center justify-center p-6">
        <div className="max-w-md rounded-[28px] border border-[#ead8bb] bg-white p-6 text-center shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
          <Package className="mx-auto h-12 w-12 text-[#b1452c]" />
          <h2 className="mt-4 text-xl font-black text-[#26150f]">Connexion requise</h2>
          <p className="mt-2 text-sm text-[#6d5c52]">Connectez-vous pour gerer votre catalogue vendeur.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6efe7] px-4 py-6 md:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-[#dec3a7] bg-white p-6 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Catalogue vendeur</p>
              <h1 className="mt-2 text-3xl font-black text-[#26150f]">Gerer vos produits</h1>
              <p className="mt-2 text-sm text-[#6d5c52]">Ajoutez photo, description, prix vendeur et DELIKREOL calcule le prix client final avec frais et commission.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 rounded-full border border-[#ead8bb] bg-[#fff7ef] px-4 py-2 text-xs font-black text-[#7a4a25]"
              >
                <Download className="h-4 w-4" /> Export JSON
              </button>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-full border border-[#ead8bb] bg-[#fff7ef] px-4 py-2 text-xs font-black text-[#7a4a25]"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <div className="rounded-2xl bg-[#f7ecdb] px-4 py-2 text-xs font-black text-[#7a4a25]">
                {products.length} produits
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Catalogue actif</p>
            <p className="mt-3 text-3xl font-black text-[#26150f]">{catalogMetrics.activeCount}</p>
            <p className="mt-2 text-sm text-[#6d5c52]">produits visibles et disponibles</p>
          </div>
          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Prix client cumule</p>
            <p className="mt-3 text-3xl font-black text-[#1f6a4a]">{catalogMetrics.totalClientRevenue.toFixed(2)} EUR</p>
            <p className="mt-2 text-sm text-[#6d5c52]">si chaque produit se vend une fois</p>
          </div>
          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Base vendeur cumulee</p>
            <p className="mt-3 text-3xl font-black text-[#26150f]">{catalogMetrics.totalVendorBase.toFixed(2)} EUR</p>
            <p className="mt-2 text-sm text-[#6d5c52]">montant brut vendeur</p>
          </div>
          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-5 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8f5b34]">Commission DELIKREOL</p>
            <p className="mt-3 text-3xl font-black text-[#b1452c]">{catalogMetrics.totalPlatformFees.toFixed(2)} EUR</p>
            <p className="mt-2 text-sm text-[#6d5c52]">estimation catalogue actuel</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-6 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <h2 className="text-lg font-black text-[#26150f]">Profil partenaire</h2>
            <p className="mt-2 text-sm text-[#6d5c52]">Ces informations s'affichent dans la vitrine partenaires.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#8f5b34]">Nom commercial</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#8f5b34]">Categorie</label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#8f5b34]">Telephone</label>
                <input
                  value={profile.phone || ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
              </div>
            </div>
            <button
              onClick={handleProfileSave}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f6a4a] px-5 py-2.5 text-xs font-black text-white shadow-lg"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
          </div>

          <div className="rounded-[28px] border border-[#ead8bb] bg-white p-6 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
            <h2 className="text-lg font-black text-[#26150f]">Ajouter un produit</h2>
            <p className="mt-2 text-sm text-[#6d5c52]">Le vendeur renseigne son prix. DELIKREOL ajoute frais et commission pour afficher le prix client.</p>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Nom du produit"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                rows={3}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                >
                  {productCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <input
                  placeholder="Prix partenaire (EUR)"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  placeholder="Frais partenaire (EUR)"
                  value={form.partnerFee}
                  onChange={(e) => setForm((prev) => ({ ...prev, partnerFee: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
                <input
                  placeholder="Frais livraison (EUR)"
                  value={form.deliveryFee}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryFee: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
                <input
                  placeholder="Commission (%)"
                  value={form.commissionRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Stock (optionnel)"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-2xl border border-[#ead8bb] bg-[#fffdfa] px-4 py-3 text-sm font-medium text-[#2f1911]"
                />
                <label className="flex items-center gap-2 text-sm font-bold text-[#6d5c52]">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                  />
                  Disponible maintenant
                </label>
              </div>
              <div className="rounded-2xl border border-[#ead8bb] bg-[#fffdfa] p-4 text-xs font-bold text-[#7a4a25]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#8f5b34]">Simulation tarifaire</p>
                    <p className="mt-2 text-lg font-black text-[#1f6a4a]">{pricingPreview.clientPrice.toFixed(2)} EUR</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#7a4a25]">
                    Commission reelle: {pricingPreview.commissionShare.toFixed(1)}%
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-2xl bg-white px-3 py-2">
                    Prix vendeur: {pricingPreview.vendorPrice.toFixed(2)} EUR
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    Frais partenaire: {pricingPreview.partnerFee.toFixed(2)} EUR
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    Livraison: {pricingPreview.deliveryFee.toFixed(2)} EUR
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    Commission DELIKREOL: {pricingPreview.platformFee.toFixed(2)} EUR
                  </div>
                </div>
                {pricingPreview.clientPrice > 0 && pricingPreview.commissionShare < 8 && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[#f3d0b2] bg-[#fff4eb] px-3 py-2 text-[11px] font-black text-[#a14a2f]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                    Commission faible. Verifiez si la marge DELIKREOL couvre bien traitement, relance et coordination.
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-dashed border-[#ead8bb] bg-[#fffdfa] p-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-[#8f5b34]">Photo</label>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    placeholder="URL de l'image"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full rounded-2xl border border-[#ead8bb] bg-white px-4 py-3 text-sm font-medium text-[#2f1911]"
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f7ecdb] px-4 py-2 text-xs font-black text-[#7a4a25]">
                      <ImagePlus className="h-4 w-4" /> Importer une photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />
                    </label>
                    {imagePreview && (
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#ead8bb]">
                        <img src={imagePreview} alt="Apercu" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateProduct}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f6a4a] px-5 py-2.5 text-xs font-black text-white shadow-lg"
              >
                <Plus className="h-4 w-4" /> Ajouter au catalogue
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#ead8bb] bg-white p-6 shadow-[0_18px_50px_rgba(73,30,18,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#26150f]">Produits en ligne</h2>
              <p className="text-sm text-[#6d5c52]">Chaque produit est modifiable dans le mode demo.</p>
            </div>
            <button
              onClick={loadProducts}
              className="inline-flex items-center gap-2 rounded-full bg-[#f7ecdb] px-4 py-2 text-xs font-black text-[#7a4a25]"
            >
              <CheckCircle2 className="h-4 w-4" /> Rafraichir
            </button>
          </div>
          {loading ? (
            <div className="mt-6 text-sm text-[#6d5c52]">Chargement du catalogue...</div>
          ) : products.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#ead8bb] bg-[#fffdfa] p-6 text-sm text-[#6d5c52]">
              Aucun produit ajoute. Utilisez le formulaire pour creer votre catalogue.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-[#ead8bb] bg-[#fffdfa] p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#ead8bb] bg-white">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#6d5c52]">Photo</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-[#2f1911]">{product.name}</p>
                          <p className="text-xs text-[#6d5c52]">{product.category}</p>
                        </div>
                        <span className="rounded-full bg-[#f7ecdb] px-2.5 py-1 text-[10px] font-black text-[#7a4a25]">
                          {product.is_available ? 'Actif' : 'Pause'}
                        </span>
                      </div>
                      {product.description && (
                        <p className="mt-2 text-xs text-[#6d5c52] line-clamp-2">{product.description}</p>
                      )}
                      <div className="mt-3 grid gap-1 text-xs text-[#6d5c52]">
                        <span className="font-black text-[#1f6a4a]">Prix client: {product.client_price?.toFixed(2) ?? product.price.toFixed(2)} EUR</span>
                        <span>Prix partenaire: {product.vendor_price?.toFixed(2) ?? product.price.toFixed(2)} EUR</span>
                        <span>Frais partenaire: {(product.partner_fee ?? 0).toFixed(2)} EUR · Commission: {(product.platform_fee ?? 0).toFixed(2)} EUR</span>
                        <span>Livraison: {(product.delivery_fee ?? 0).toFixed(2)} EUR · Stock: {product.stock_quantity ?? 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
