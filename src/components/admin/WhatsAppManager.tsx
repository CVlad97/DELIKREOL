import { useState, useEffect } from 'react';
import { MessageCircle, Send, Users, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface WhatsAppMessage {
  id: string;
  from_number: string;
  to_number: string;
  message_content: string;
  direction: 'inbound' | 'outbound';
  status: string;
  created_at: string;
}

interface WhatsAppStats {
  totalMessages: number;
  activeSessions: number;
  messagesLast24h: number;
  avgResponseTime: number;
}

export function WhatsAppManager() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    totalMessages: 0,
    activeSessions: 0,
    messagesLast24h: 0,
    avgResponseTime: 0,
  });
  const [, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.user_type === 'admin') {
      loadData();
      setupRealtimeSubscription();
    }
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMessages(), loadStats()]);
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const loadStats = async () => {
    const [totalRes, sessionsRes, recentRes] = await Promise.all([
      supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true }),
      supabase.from('whatsapp_sessions').select('id', { count: 'exact', head: true }),
      supabase
        .from('whatsapp_messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    setStats({
      totalMessages: totalRes.count || 0,
      activeSessions: sessionsRes.count || 0,
      messagesLast24h: recentRes.count || 0,
      avgResponseTime: 2.5,
    });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('whatsapp_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        () => {
          loadMessages();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const groupMessagesByConversation = () => {
    const conversations: Record<string, WhatsAppMessage[]> = {};

    messages.forEach((msg) => {
      const key = msg.direction === 'inbound' ? msg.from_number : msg.to_number;
      if (!conversations[key]) {
        conversations[key] = [];
      }
      conversations[key].push(msg);
    });

    return conversations;
  };

  const conversations = groupMessagesByConversation();

  if (profile?.user_type !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="text-green-600" />
          WhatsApp Business
        </h2>
        <p className="text-gray-600 mt-1">Gestion des conversations et notifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalMessages}</span>
          </div>
          <p className="text-sm text-gray-600">Messages totaux</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.activeSessions}</span>
          </div>
          <p className="text-sm text-gray-600">Sessions actives</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.messagesLast24h}</span>
          </div>
          <p className="text-sm text-gray-600">Dernières 24h</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}min</span>
          </div>
          <p className="text-sm text-gray-600">Temps de réponse</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Conversations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.entries(conversations).map(([number, msgs]) => {
                const lastMessage = msgs[0];
                return (
                  <button
                    key={number}
                    onClick={() => setSelectedConversation(number)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation === number ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{number}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {lastMessage.message_content}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(lastMessage.created_at).toLocaleString('fr-FR')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-green-600 text-white">
                  <h3 className="font-bold">{selectedConversation}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {conversations[selectedConversation]
                    ?.slice()
                    .reverse()
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.direction === 'outbound'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-900 shadow'
                          }`}
                        >
                          <p className="text-sm">{msg.message_content}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.direction === 'outbound' ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Réponse automatique uniquement..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                    <button
                      className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      disabled
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Les réponses sont gérées automatiquement par le bot WhatsApp
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">Configuration WhatsApp Business</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Webhook URL:</strong>{' '}
            <code className="bg-white px-2 py-1 rounded">
              {`${window.location.origin}/functions/v1/whatsapp-webhook`}
            </code>
          </p>
          <p>
            <strong>Verify Token:</strong> delikreol_2024
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Configurez ces paramètres dans votre compte Meta Business Suite
          </p>
        </div>
      </div>
    </div>
  );
}
