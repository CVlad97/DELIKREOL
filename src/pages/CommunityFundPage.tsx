import { useState, useEffect } from 'react';
import {
  Heart,
  TrendingUp,
  MapPin,
  Target,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserBalance } from '../services/loyaltyService';
import {
  listActiveProjects,
  getUserContributions,
  createDemoContributionFromLoyalty,
  getUserInvestmentPreference,
  setUserInvestmentPreference,
  InvestmentProject,
  InvestmentContribution,
  InvestmentPreference,
  ProjectType,
} from '../services/investmentService';

export function CommunityFundPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [balance, setBalance] = useState(0);
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [contributions, setContributions] = useState<InvestmentContribution[]>([]);
  const [preference, setPreference] = useState<InvestmentPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefMode, setPrefMode] = useState<'auto' | 'manual'>('manual');
  const [prefRatio, setPrefRatio] = useState(0);
  const [prefTypes, setPrefTypes] = useState<ProjectType[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userBalance, activeProjects, userContributions, userPreference] =
        await Promise.all([
          getUserBalance(user.id),
          listActiveProjects(),
          getUserContributions(user.id),
          getUserInvestmentPreference(user.id),
        ]);

      setBalance(userBalance);
      setProjects(activeProjects);
      setContributions(userContributions);
      setPreference(userPreference);

      if (userPreference) {
        setPrefMode(userPreference.mode);
        setPrefRatio(Math.round(userPreference.auto_ratio * 100));
        setPrefTypes(userPreference.preferred_project_types);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!user || !selectedProject) return;

    const amount = parseInt(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Montant invalide');
      return;
    }

    if (amount > balance) {
      showError('Solde insuffisant');
      return;
    }

    const result = await createDemoContributionFromLoyalty(
      user.id,
      selectedProject.id,
      amount
    );

    if (result.success) {
      showSuccess(`Vous avez soutenu "${selectedProject.title}" avec ${amount} points!`);
      setSelectedProject(null);
      setContributionAmount('');
      loadData();
    } else {
      showError(result.error || 'Erreur lors de la contribution');
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    const result = await setUserInvestmentPreference(user.id, {
      mode: prefMode,
      autoRatio: prefRatio / 100,
      preferredProjectTypes: prefTypes,
    });

    if (result.success) {
      showSuccess('Préférences enregistrées');
      setShowPreferences(false);
      loadData();
    } else {
      showError(result.error || 'Erreur lors de la sauvegarde');
    }
  };

  const toggleProjectType = (type: ProjectType) => {
    if (prefTypes.includes(type)) {
      setPrefTypes(prefTypes.filter((t) => t !== type));
    } else {
      setPrefTypes([...prefTypes, type]);
    }
  };

  const getProgressPercentage = (project: InvestmentProject) => {
    return Math.min(
      Math.round((project.collected_points / project.target_points) * 100),
      100
    );
  };

  const projectTypeLabels: Record<ProjectType, string> = {
    relay_hub: 'Hub Relais',
    dark_kitchen: 'Dark Kitchen',
    storage: 'Entrepôt',
    other: 'Autre',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium mb-1">Mode Démonstration</p>
            <p className="text-slate-300">
              Ce module fonctionne en mode DEMO avec des points Delikreol. Il ne
              s'agit pas d'un produit financier ni d'une promesse de rendement.
              Toute évolution vers un produit d'investissement réel nécessitera un
              partenaire régulé.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-emerald-500" />
          Fonds Communautaire
        </h1>
        <p className="text-slate-400">
          Soutenez le développement des hubs logistiques Delikreol avec vos points
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Mon solde de points</div>
          <div className="text-3xl font-bold text-emerald-400">{balance}</div>
          <div className="text-xs text-slate-500 mt-1">Points disponibles</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Mes contributions</div>
          <div className="text-3xl font-bold text-slate-50">
            {contributions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {contributions.reduce((sum, c) => sum + c.contribution_points, 0)} points
            investis
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Mode</div>
          <div className="text-3xl font-bold text-slate-50">
            {preference?.mode === 'auto' ? 'Auto' : 'Manuel'}
          </div>
          <button
            onClick={() => setShowPreferences(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            Configurer
          </button>
        </div>
      </div>

      {contributions.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Mes Contributions
          </h2>
          <div className="space-y-3">
            {contributions.map((contrib) => (
              <div
                key={contrib.id}
                className="bg-slate-900 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-50">
                      {contrib.project?.title || 'Projet'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {contrib.project?.zone_label && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {contrib.project.zone_label}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">
                      {contrib.contribution_points}
                    </div>
                    <div className="text-xs text-slate-500">points</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {new Date(contrib.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
          Projets en cours
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Aucun projet actif pour le moment
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const progress = getProgressPercentage(project);
              return (
                <div
                  key={project.id}
                  className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-50">{project.title}</h3>
                      <span className="inline-block text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 mt-1">
                        {projectTypeLabels[project.project_type]}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    {project.description}
                  </p>

                  {project.zone_label && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                      <MapPin className="w-3 h-3" />
                      {project.zone_label}
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Progression</span>
                      <span className="text-slate-50 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>{project.collected_points} points</span>
                      <span>
                        <Target className="w-3 h-3 inline" />{' '}
                        {project.target_points}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="w-full bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg hover:bg-emerald-400 transition-all font-medium"
                  >
                    Soutenir ce projet
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">
              Soutenir {selectedProject.title}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de points à contribuer
                </label>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: 100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Solde disponible: {balance} points
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleContribute}
                  disabled={!contributionAmount || parseInt(contributionAmount) <= 0}
                  className="flex-1 bg-emerald-500 text-slate-950 px-4 py-3 rounded-lg hover:bg-emerald-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setContributionAmount('');
                  }}
                  className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-500" />
              Préférences de réinvestissement
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrefMode('manual')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      prefMode === 'manual'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600 bg-slate-900 text-slate-300'
                    }`}
                  >
                    Manuel
                  </button>
                  <button
                    onClick={() => setPrefMode('auto')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      prefMode === 'auto'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600 bg-slate-900 text-slate-300'
                    }`}
                  >
                    Automatique
                  </button>
                </div>
              </div>

              {prefMode === 'auto' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ratio de réinvestissement automatique: {prefRatio}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={prefRatio}
                      onChange={(e) => setPrefRatio(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {prefRatio}% de vos nouveaux points seront automatiquement
                      investis
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Types de projets préférés
                    </label>
                    <div className="space-y-2">
                      {(['relay_hub', 'dark_kitchen', 'storage', 'other'] as ProjectType[]).map(
                        (type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={prefTypes.includes(type)}
                              onChange={() => toggleProjectType(type)}
                              className="rounded border-slate-600"
                            />
                            <span className="text-slate-300">
                              {projectTypeLabels[type]}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-emerald-500 text-slate-950 px-4 py-3 rounded-lg hover:bg-emerald-400 transition-all font-medium"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
