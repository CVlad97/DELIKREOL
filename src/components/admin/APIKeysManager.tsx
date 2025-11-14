import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Check, X, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface APIKey {
  id: string;
  service: 'openai' | 'meta' | 'google_sheets';
  key_name: string;
  encrypted_key: string;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

export function APIKeysManager() {
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const [newKey, setNewKey] = useState({
    service: 'openai' as 'openai' | 'meta' | 'google_sheets',
    key_name: '',
    encrypted_key: '',
  });

  useEffect(() => {
    if (profile?.user_type === 'admin') {
      loadAPIKeys();
    }
  }, [profile]);

  const loadAPIKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.key_name || !newKey.encrypted_key) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { error } = await supabase.from('api_keys').insert({
        service: newKey.service,
        key_name: newKey.key_name,
        encrypted_key: newKey.encrypted_key,
        is_active: true,
      });

      if (error) throw error;

      alert('Clé API ajoutée avec succès');
      setShowAddModal(false);
      setNewKey({ service: 'openai', key_name: '', encrypted_key: '' });
      loadAPIKeys();
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;
      loadAPIKeys();
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) return;

    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);

      if (error) throw error;
      loadAPIKeys();
    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'openai':
        return 'OpenAI';
      case 'meta':
        return 'Meta (Facebook/Instagram)';
      case 'google_sheets':
        return 'Google Sheets';
      default:
        return service;
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '•••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  if (profile?.user_type !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Key className="text-orange-600" />
              Gestion des Clés API
            </h2>
            <p className="text-gray-600 mt-1">
              Configuration sécurisée des intégrations tierces
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            Ajouter une clé
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune clé API configurée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{key.key_name}</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {getServiceLabel(key.service)}
                      </span>
                      {key.is_active ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <X size={12} />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono">
                        {visibleKeys.has(key.id) ? key.encrypted_key : maskKey(key.encrypted_key)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={visibleKeys.has(key.id) ? 'Masquer' : 'Afficher'}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {key.usage_count} utilisations
                      </span>
                      {key.last_used_at && (
                        <span>
                          Dernière utilisation : {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleKeyStatus(key.id, key.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        key.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {key.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter une clé API</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <select
                  value={newKey.service}
                  onChange={(e) =>
                    setNewKey({ ...newKey, service: e.target.value as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="openai">OpenAI</option>
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="google_sheets">Google Sheets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la clé
                </label>
                <input
                  type="text"
                  value={newKey.key_name}
                  onChange={(e) => setNewKey({ ...newKey, key_name: e.target.value })}
                  placeholder="Ex: Production OpenAI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API
                </label>
                <input
                  type="text"
                  value={newKey.encrypted_key}
                  onChange={(e) =>
                    setNewKey({ ...newKey, encrypted_key: e.target.value })
                  }
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddKey}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
