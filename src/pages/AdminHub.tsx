import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  MapPin,
  Truck,
  Users,
  Send,
  Zap,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { useToast } from '../contexts/ToastContext';
import {
  aggregateDailyMetrics,
  generateCopilotSummary,
  askCopilot,
  DailyMetrics,
  CopilotResponse
} from '../agents/adminCopilot';
import { optimizeRoutes } from '../agents/routeOptimizer';
import { getApplications, updateApplicationStatus } from '../agents/partnerScoring';
import { supabase } from '../lib/supabase';
import { Vendor, RelayPoint, Location } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AdminHub() {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [copilotSummary, setCopilotSummary] = useState<CopilotResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [mapCenter] = useState<Location>({ latitude: 14.6415, longitude: -61.0242 });
  const [routeOptimization, setRouteOptimization] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    try {
      setLoading(true);

      const [metricsData, vendorsRes, relayPointsRes, appsData] = await Promise.all([
        aggregateDailyMetrics().catch(err => {
          console.error('Metrics error:', err);
          return {
            totalOrders: 0,
            ordersByStatus: {},
            totalRevenue: 0,
            activeDrivers: 0,
            availableDrivers: 0,
            totalRelayPoints: 0,
            relayUtilization: [],
            ordersByZone: {},
          };
        }),
        supabase.from('vendors').select('*').eq('is_active', true),
        supabase.from('relay_points').select('*, storage_capacities(*)').eq('is_active', true),
        getApplications({ status: 'submitted' }).catch(() => []),
      ]);

      setMetrics(metricsData);
      setVendors(vendorsRes.data || []);
      setRelayPoints(relayPointsRes.data || []);
      setApplications(appsData);

      if (metricsData.totalOrders > 0) {
        const summary = await generateCopilotSummary(metricsData).catch(err => {
          console.error('Copilot summary error:', err);
          return {
            summary: `${metricsData.totalOrders} commandes aujourd'hui`,
            alerts: [],
            suggestions: [],
          };
        });
        setCopilotSummary(summary);
      }

    } catch (error) {
      console.error('Error loading hub data:', error);
      showError('Certaines données n\'ont pas pu être chargées. Essayez de rafraîchir.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !metrics) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setAiLoading(true);

    try {
      const response = await askCopilot(chatInput, metrics);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      showError('Assistant IA temporairement indisponible');
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateRoutes = async () => {
    try {
      setAiLoading(true);
      showInfo('Génération des tournées optimisées...');

      const result = await optimizeRoutes(60);
      setRouteOptimization(result);

      showSuccess(`${result.summary.assignedOrders} commandes assignées à ${result.summary.driversUsed} livreurs`);
    } catch (error) {
      showError('Erreur lors de l\'optimisation des tournées');
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setChatInput(question);
    await handleChatSubmit();
  };

  const handleApproveApplication = async (appId: string) => {
    try {
      const success = await updateApplicationStatus(appId, 'approved');
      if (success) {
        showSuccess('Candidature approuvée');
        loadHubData();
      }
    } catch (error) {
      showError('Erreur lors de l\'approbation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement du Hub Logistique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hub Logistique DELIKREOL</h1>
          <p className="text-gray-600">Orchestration intelligente des opérations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Commandes</p>
                <p className="text-2xl font-bold">{metrics?.totalOrders || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
                <Truck className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Livreurs</p>
                <p className="text-2xl font-bold">{metrics?.availableDrivers || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Points Relais</p>
                <p className="text-2xl font-bold">{metrics?.totalRelayPoints || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
                <Users className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Candidatures</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Carte des Opérations
              </h2>
              <MapView
                center={mapCenter}
                vendors={vendors.filter(v => v.latitude && v.longitude)}
                relayPoints={relayPoints}
                zoom={11}
                className="h-96 rounded-lg"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Actions Rapides
                </h2>
                <button
                  onClick={handleGenerateRoutes}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  Générer les tournées
                </button>
              </div>

              {routeOptimization && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="font-medium text-emerald-900 mb-2">Résumé de l'optimisation:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Commandes assignées:</span>
                        <span className="font-bold ml-2">{routeOptimization.summary.assignedOrders}/{routeOptimization.summary.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Livreurs utilisés:</span>
                        <span className="font-bold ml-2">{routeOptimization.summary.driversUsed}</span>
                      </div>
                    </div>
                  </div>

                  {routeOptimization.assignments.map((assignment: any) => (
                    <div key={assignment.driverId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{assignment.driverName}</h3>
                        <span className="text-sm text-gray-600">{assignment.orders.length} commandes</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {assignment.orders.map((order: any, idx: number) => (
                          <div key={order.orderId} className="flex items-start gap-2">
                            <span className="font-bold text-emerald-600">{idx + 1}.</span>
                            <div className="flex-1">
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-gray-600 text-xs">{order.address}</p>
                            </div>
                            <span className="text-gray-600 text-xs">{order.distance}km</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between text-xs text-gray-600">
                        <span>Distance totale: {assignment.totalDistance}km</span>
                        <span>Temps estimé: {assignment.estimatedTotalTime}min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleQuickQuestion('Quels relais sont proches de la saturation ?')}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors text-left"
                >
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Relais saturés</span>
                </button>

                <button
                  onClick={() => handleQuickQuestion('Quelle zone est la plus rentable aujourd\'hui ?')}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors text-left"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Zone rentable</span>
                </button>
              </div>
            </div>

            {applications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Candidatures en Attente
                </h2>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{app.applicant_name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{app.partner_type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.ai_score === 'A' ? 'bg-green-100 text-green-800' :
                          app.ai_score === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Score: {app.ai_score}
                        </span>
                      </div>
                      {app.ai_feedback && (
                        <div className="text-sm space-y-1 mb-3">
                          <p className="text-gray-600">
                            Complétude: {app.ai_feedback.completeness_score}%
                          </p>
                          {app.ai_feedback.strengths?.length > 0 && (
                            <p className="text-green-700">
                              ✓ {app.ai_feedback.strengths[0]}
                            </p>
                          )}
                          {app.ai_feedback.weaknesses?.length > 0 && (
                            <p className="text-orange-700">
                              ⚠ {app.ai_feedback.weaknesses[0]}
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        Approuver
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {copilotSummary && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg sticky top-6">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Assistant IA
                  </h2>
                </div>

                {copilotSummary && (
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50">
                    <h3 className="font-bold text-sm text-purple-900 mb-2">Résumé de la journée</h3>
                    <p className="text-sm text-gray-700 mb-3">{copilotSummary.summary}</p>

                    {copilotSummary.alerts.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-bold text-xs text-orange-900 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Alertes
                        </h4>
                        <ul className="space-y-1">
                          {copilotSummary.alerts.map((alert, idx) => (
                            <li key={idx} className="text-xs text-orange-700">• {alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {copilotSummary.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs text-green-900 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Suggestions
                        </h4>
                        <ul className="space-y-1">
                          {copilotSummary.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-xs text-green-700">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Posez-moi des questions sur vos opérations</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`${
                          msg.role === 'user'
                            ? 'bg-emerald-100 ml-8'
                            : 'bg-gray-100 mr-8'
                        } p-3 rounded-lg`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="bg-gray-100 mr-8 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        <p className="text-sm text-gray-600">Réflexion en cours...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                      placeholder="Posez votre question..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      disabled={aiLoading}
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || aiLoading}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Navigation userType="admin" currentView="hub" onNavigate={() => {}} />
    </div>
  );
}
