import { useState, useEffect } from 'react';
import { X, User, Mail, Package, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order } from '../lib/supabase';
import { OrderTracking } from './OrderTracking';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
      setEditMode(false);
    }
    setLoading(false);
  };

  if (!isOpen || !user || !profile) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    ready: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    in_delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    in_delivery: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mon profil</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <User className="inline-block mr-2" size={18} />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Package className="inline-block mr-2" size={18} />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className="inline-block mr-2" size={18} />
              Favoris
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Type de compte</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                    {profile.user_type}
                  </span>
                </div>

                {editMode ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                  >
                    Modifier le profil
                  </button>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-8">Chargement...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Aucune commande</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {order.delivery_type === 'home_delivery' ? 'Livraison' : 'Retrait'}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {order.total_amount.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-center py-12">
                <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucun favori pour le moment</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Ajoutez vos restaurants préférés ici
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrderId && (
        <OrderTracking orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </>
  );
}
