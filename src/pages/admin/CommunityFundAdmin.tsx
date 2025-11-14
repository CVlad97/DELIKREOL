import { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  TrendingUp,
  Users,
  BarChart3,
  Edit3,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
  listAllProjects,
  createProject,
  updateProjectStatus,
  getProjectStats,
  InvestmentProject,
  ProjectType,
  ProjectStatus,
} from '../../services/investmentService';

export function CommunityFundAdmin() {
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(
    null
  );
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    project_type: 'relay_hub' as ProjectType,
    target_points: '',
    zone_label: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProjects, projectStats] = await Promise.all([
        listAllProjects(),
        getProjectStats(),
      ]);

      setProjects(allProjects);
      setStats(projectStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const targetPoints = parseInt(newProject.target_points);

    if (!newProject.title || !newProject.description || isNaN(targetPoints)) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const result = await createProject({
      title: newProject.title,
      description: newProject.description,
      project_type: newProject.project_type,
      target_points: targetPoints,
      zone_label: newProject.zone_label || undefined,
      status: 'draft',
    });

    if (result.success) {
      showSuccess('Projet créé avec succès');
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        project_type: 'relay_hub',
        target_points: '',
        zone_label: '',
      });
      loadData();
    } else {
      showError(result.error || 'Erreur lors de la création');
    }
  };

  const handleUpdateStatus = async (
    projectId: string,
    newStatus: ProjectStatus
  ) => {
    const result = await updateProjectStatus(projectId, newStatus);

    if (result.success) {
      showSuccess(`Statut mis à jour: ${newStatus}`);
      setSelectedProject(null);
      loadData();
    } else {
      showError(result.error || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'active':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'funded':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'closed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'active':
        return 'Actif';
      case 'funded':
        return 'Financé';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  const projectTypeLabels: Record<ProjectType, string> = {
    relay_hub: 'Hub Relais',
    dark_kitchen: 'Dark Kitchen',
    storage: 'Entrepôt',
    other: 'Autre',
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-emerald-500" />
          Fonds Communautaire - Admin
        </h1>
        <p className="text-slate-400">Gestion des projets d'investissement participatif</p>
      </div>

      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <div className="text-slate-400 text-sm">Points investis</div>
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              {stats.totalPoints.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div className="text-slate-400 text-sm">Projets totaux</div>
            </div>
            <div className="text-3xl font-bold text-slate-50">{stats.totalProjects}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.activeProjects} actifs
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div className="text-slate-400 text-sm">Contributeurs</div>
            </div>
            <div className="text-3xl font-bold text-slate-50">
              {stats.totalContributors}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Répartition</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Hub Relais:</span>
                <span className="text-slate-50">{stats.byType.relay_hub}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dark Kitchen:</span>
                <span className="text-slate-50">{stats.byType.dark_kitchen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entrepôt:</span>
                <span className="text-slate-50">{stats.byType.storage}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-50">Tous les projets</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg hover:bg-emerald-400 transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau projet
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            Aucun projet
          </h3>
          <p className="text-slate-500">Créez votre premier projet communautaire</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const progress = Math.min(
              Math.round((project.collected_points / project.target_points) * 100),
              100
            );

            return (
              <div
                key={project.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-50 mb-1">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                        {projectTypeLabels[project.project_type]}
                      </span>
                      {project.zone_label && (
                        <span className="text-xs text-slate-400">
                          📍 {project.zone_label}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-300 mb-4">{project.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Progression</span>
                    <span className="text-slate-50 font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400 mt-1">
                    <span>
                      {project.collected_points.toLocaleString()} points collectés
                    </span>
                    <span>Objectif: {project.target_points.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Créé le{' '}
                  {new Date(project.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">
              Créer un nouveau projet
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: Hub Relais Fort-de-France Nord"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Décrivez le projet, son impact, etc."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type de projet *
                  </label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        project_type: e.target.value as ProjectType,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="relay_hub">Hub Relais</option>
                    <option value="dark_kitchen">Dark Kitchen</option>
                    <option value="storage">Entrepôt</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Objectif (points) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProject.target_points}
                    onChange={(e) =>
                      setNewProject({ ...newProject, target_points: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ex: 10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Zone / Localisation
                </label>
                <input
                  type="text"
                  value={newProject.zone_label}
                  onChange={(e) =>
                    setNewProject({ ...newProject, zone_label: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: Fort-de-France nord"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 bg-emerald-500 text-slate-950 px-4 py-3 rounded-lg hover:bg-emerald-400 transition-all font-medium"
                >
                  Créer le projet
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProject({
                      title: '',
                      description: '',
                      project_type: 'relay_hub',
                      target_points: '',
                      zone_label: '',
                    });
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

      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">
              Changer le statut
            </h2>

            <p className="text-slate-300 mb-4">
              Projet: <strong>{selectedProject.title}</strong>
            </p>

            <p className="text-sm text-slate-400 mb-4">
              Statut actuel: {getStatusLabel(selectedProject.status)}
            </p>

            <div className="space-y-2 mb-4">
              {(['draft', 'active', 'funded', 'closed'] as ProjectStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedProject.id, status)}
                    disabled={selectedProject.status === status}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-2 ${
                      selectedProject.status === status
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {selectedProject.status === status && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span>{getStatusLabel(status)}</span>
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="w-full px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
