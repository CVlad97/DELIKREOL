import { useState, useEffect } from 'react';
import { Brain, Send, Zap, TrendingUp, MapPin, Package, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callOpenAI } from '../utils/apiIntegrations';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  prompt: string;
}

export function AdminInsights() {
  const { profile } = useAuth();
  const { showError, showSuccess } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA pour analyser les données Delikreol. Posez-moi des questions sur les commandes, les zones de livraison, les relais ou demandez des recommandations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<any>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'orders_today',
      label: 'Analyser les commandes du jour',
      icon: Package,
      prompt: 'Analyse les commandes d\'aujourd\'hui et donne-moi un résumé : nombre total, chiffre d\'affaires, tendances, et recommandations.',
    },
    {
      id: 'saturated_relays',
      label: 'Identifier les relais saturés',
      icon: MapPin,
      prompt: 'Identifie les points relais qui approchent ou dépassent leur capacité maximale et propose des solutions.',
    },
    {
      id: 'delivery_optimization',
      label: 'Optimiser les zones de livraison',
      icon: TrendingUp,
      prompt: 'Analyse les zones de livraison actuelles et propose une nouvelle découpe plus efficace basée sur le volume de commandes.',
    },
    {
      id: 'performance_metrics',
      label: 'Métriques de performance',
      icon: Zap,
      prompt: 'Donne-moi un rapport sur les KPIs : temps de livraison moyen, taux de satisfaction, efficacité des livreurs, et points d\'amélioration.',
    },
  ];

  useEffect(() => {
    loadContextData();
  }, []);

  const loadContextData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, relaysRes, driversRes, vendorsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .gte('created_at', today.toISOString()),
        supabase.from('relay_points').select('*').eq('is_active', true),
        supabase.from('drivers').select('*, deliveries(*)'),
        supabase.from('vendors').select('*').eq('is_active', true),
      ]);

      const context = {
        orders_today: {
          count: ordersRes.data?.length || 0,
          total_revenue: ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
          by_status: ordersRes.data?.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
        relay_points: relaysRes.data?.map((r) => ({
          name: r.name,
          capacity: r.capacity,
          current_load: r.current_load || 0,
          load_percentage: Math.round(((r.current_load || 0) / r.capacity) * 100),
        })),
        drivers: {
          total: driversRes.data?.length || 0,
          available: driversRes.data?.filter((d) => d.is_available).length || 0,
        },
        vendors: {
          total: vendorsRes.data?.length || 0,
        },
      };

      setContextData(context);
    } catch (error) {
      console.error('Error loading context data:', error);
    }
  };

  const handleSend = async (message?: string) => {
    const userMessage = message || input.trim();
    if (!userMessage || loading) return;

    setInput('');
    setLoading(true);

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const systemContext = `Tu es un assistant IA pour la plateforme DELIKREOL (Martinique).
Voici les données actuelles :

${JSON.stringify(contextData, null, 2)}

Réponds en français de manière claire et actionnable. Propose des recommandations concrètes basées sur les données.`;

      const aiMessages: Array<{ role: string; content: string }> = [
        { role: 'system', content: systemContext },
        ...newMessages,
      ];

      const response = await callOpenAI(aiMessages, 'gpt-4');

      if (response && response.choices && response.choices[0]) {
        const assistantMessage = response.choices[0].message.content;
        setMessages([
          ...newMessages,
          { role: 'assistant', content: assistantMessage },
        ]);
        showSuccess('Analyse terminée');
      } else {
        showError('Erreur lors de l\'analyse');
      }
    } catch (error: any) {
      console.error('Error calling OpenAI:', error);
      showError('Erreur de connexion à l\'IA');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Désolé, je rencontre une erreur. Vérifiez que la clé API OpenAI est configurée.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
  };

  if (profile?.user_type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="text-purple-600" size={32} />
            Assistant IA - Insights
          </h1>
          <p className="text-gray-600 mt-2">
            Posez des questions et obtenez des analyses automatisées de votre plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={loading}
              className="bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-xl p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <action.icon className="text-purple-600 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <Loader className="animate-spin text-purple-600" size={20} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={20} />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </div>
          </div>
        </div>

        {contextData && (
          <div className="mt-6 bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-3">Données en contexte</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{contextData.orders_today?.count || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">
                  {contextData.orders_today?.total_revenue?.toFixed(2) || 0}€
                </p>
              </div>
              <div>
                <p className="text-gray-600">Livreurs disponibles</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contextData.drivers?.available || 0}/{contextData.drivers?.total || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Points relais actifs</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contextData.relay_points?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
