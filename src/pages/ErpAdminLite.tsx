import { useEffect, useMemo, useState } from 'react';
import { erpRequest, isErpConfigured } from '../lib/erpClient';

type Partner = {
  id: string;
  name: string;
  type: string;
  status: string;
  address?: string | null;
  commissionRate?: number | null;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  partnerId?: string | null;
  categoryId?: string | null;
  category?: string | null;
  price?: number | null;
  isAvailable?: number | boolean | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: number;
  deliveryType?: string | null;
};

export function ErpAdminLite() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('erp_admin_token') ?? '';
  });
  const [tokenInput, setTokenInput] = useState(adminToken);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    partnerId: '',
    price: ''
  });

  const canUseErp = isErpConfigured;

  const refreshAll = async () => {
    if (!canUseErp) {
      setError('ERP API non configurée. Définis VITE_ERP_API_URL.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [partnersRes, productsRes, ordersRes, categoriesRes] = await Promise.all([
        erpRequest<Partner[]>('/partners?type=vendor'),
        erpRequest<Product[]>('/catalog/products'),
        erpRequest<Order[]>('/orders'),
        erpRequest<{ id: string; name: string }[]>('/catalog/categories')
      ]);
      setPartners(partnersRes || []);
      setProducts(productsRes || []);
      setOrders(ordersRes || []);
      setCategories(categoriesRes || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement ERP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSaveToken = () => {
    const cleaned = tokenInput.trim();
    if (typeof window !== 'undefined') {
      if (cleaned) {
        window.localStorage.setItem('erp_admin_token', cleaned);
      } else {
        window.localStorage.removeItem('erp_admin_token');
      }
    }
    setAdminToken(cleaned);
    setError(null);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', categoryId: '', partnerId: '', price: '' });
    setEditingProduct(null);
  };

  const handleCreateOrUpdateProduct = async () => {
    if (!form.name || !form.price) {
      setError('Nom et prix requis.');
      return;
    }
    setError(null);
    try {
      if (editingProduct) {
        await erpRequest(`/catalog/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            categoryId: form.categoryId || null,
            partnerId: form.partnerId || null,
            price: Number(form.price)
          })
        });
      } else {
        await erpRequest('/catalog/products', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            categoryId: form.categoryId || null,
            partnerId: form.partnerId || null,
            price: Number(form.price)
          })
        });
      }
      resetForm();
      await refreshAll();
    } catch (err: any) {
      setError(err?.message || 'Erreur sauvegarde produit');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await erpRequest(`/catalog/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !(product.isAvailable === 1 || product.isAvailable === true) })
      });
      await refreshAll();
    } catch (err: any) {
      setError(err?.message || 'Erreur update produit');
    }
  };

  const handleSelectOrder = async (orderId: string) => {
    setSelectedOrderId(orderId);
    try {
      const items = await erpRequest<any[]>(`/orders/${orderId}/items`);
      setOrderItems(items || []);
    } catch {
      setOrderItems([]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await erpRequest(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await refreshAll();
    } catch (err: any) {
      setError(err?.message || 'Erreur statut commande');
    }
  };

  const partnerOptions = useMemo(
    () => partners.map((p) => ({ id: p.id, label: `${p.name} (${p.status})` })),
    [partners]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">ERP Admin Lite</h1>
            <p className="text-slate-400">Catalogue, commandes, partenaires</p>
          </div>
          <button
            onClick={refreshAll}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold"
          >
            Rafraîchir
          </button>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold">Admin token</div>
              <div className="text-xs text-slate-400">
                Renseigne le token si l'ERP est protege par `ADMIN_TOKEN`.
              </div>
            </div>
            <input
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 flex-1"
              placeholder="Token admin"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button
              onClick={handleSaveToken}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100"
            >
              {adminToken ? 'Mettre a jour' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {!canUseErp && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            ERP non configuré. Définis `VITE_ERP_API_URL`.
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && <div className="text-slate-400 mb-6">Chargement...</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-4">Produits</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <input
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                placeholder="Nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                placeholder="Prix"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                value={form.partnerId}
                onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
              >
                <option value="">Partenaire</option>
                {partnerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleCreateOrUpdateProduct}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold"
              >
                {editingProduct ? 'Mettre à jour' : 'Créer'}
              </button>
              {editingProduct && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-slate-800"
                >
                  Annuler
                </button>
              )}
            </div>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.category ?? 'Divers'} · {p.price ?? 0} €</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setForm({
                          name: p.name,
                          description: p.description ?? '',
                          categoryId: p.categoryId ?? '',
                          partnerId: p.partnerId ?? '',
                          price: String(p.price ?? '')
                        });
                      }}
                      className="px-3 py-1 rounded-md bg-slate-800"
                    >
                      Editer
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(p)}
                      className="px-3 py-1 rounded-md bg-slate-800"
                    >
                      {(p.isAvailable === 1 || p.isAvailable === true) ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-4">Partenaires</h2>
            <div className="space-y-3">
              {partners.map((p) => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.type} · {p.status}</div>
                  {p.address && <div className="text-xs text-slate-500">{p.address}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-4">Commandes</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{o.orderNumber}</div>
                      <div className="text-xs text-slate-400">{o.totalAmount} € · {o.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-md text-sm px-2 py-1"
                      >
                        {['pending','confirmed','preparing','ready','in_delivery','delivered','cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        className="px-3 py-1 rounded-md bg-slate-800"
                        onClick={() => handleSelectOrder(o.id)}
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div className="font-bold mb-2">Détails commande</div>
              {!selectedOrderId && <div className="text-slate-500 text-sm">Sélectionne une commande.</div>}
              {selectedOrderId && (
                <div className="space-y-2 text-sm">
                  {orderItems.length === 0 ? (
                    <div className="text-slate-500">Aucun item.</div>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.productId}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
