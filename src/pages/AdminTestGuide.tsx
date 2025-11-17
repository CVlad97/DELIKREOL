import { useState } from 'react';
import { CheckCircle, Circle, HelpCircle, ArrowRight, Package, Users, Store, Truck, CheckCheck } from 'lucide-react';

export function AdminTestGuide() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (step: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(step)) {
      newCompleted.delete(step);
    } else {
      newCompleted.add(step);
    }
    setCompletedSteps(newCompleted);
  };

  const testSteps = [
    {
      id: 1,
      icon: Package,
      title: 'Créer une demande test côté client',
      description: 'Testez le flux de création de demande client',
      steps: [
        'Cliquez sur "Changer de rôle" dans le header',
        'Sélectionnez "Mode Client" ou revenez à l\'accueil',
        'Connectez-vous avec un compte test ou créez-en un nouveau',
        'Dans l\'app client, allez dans "Demandes"',
        'Cliquez sur "Nouvelle demande" et remplissez le formulaire',
        'Vérifiez que vous recevez un toast de succès',
      ],
      color: 'blue',
    },
    {
      id: 2,
      icon: Users,
      title: 'Vérifier la demande dans Admin',
      description: 'Assurez-vous que la demande apparaît dans le hub admin',
      steps: [
        'Revenez en mode Admin (bouton "Espace Pro" dans le header)',
        'Allez dans "Demandes" dans le menu admin',
        'Vérifiez que votre demande test apparaît avec le statut "En attente"',
        'La carte affiche : nom du client, adresse, détails de la demande',
        'Le badge jaune indique "En attente"',
      ],
      color: 'purple',
    },
    {
      id: 3,
      icon: CheckCheck,
      title: 'Changer le statut en "En cours"',
      description: 'Testez la prise en charge d\'une demande',
      steps: [
        'Cliquez sur "Prendre en charge" sur la demande test',
        'Une modale s\'ouvre pour ajouter des notes admin (optionnel)',
        'Ajoutez par exemple : "Demande reçue, recherche de partenaires en cours"',
        'Cliquez sur "Passer en cours"',
        'Vérifiez que le badge passe en bleu avec "En cours"',
        'Les notes admin doivent apparaître en vert sous la demande',
      ],
      color: 'orange',
    },
    {
      id: 4,
      icon: Store,
      title: 'Vérifier dans les apps partenaires (optionnel)',
      description: 'Testez l\'affichage pour vendeurs/relais/livreurs',
      steps: [
        'Changez de rôle vers "Vendeur" ou "Point Relais"',
        'Connectez-vous avec un compte partenaire test',
        'Les demandes "En cours" de votre zone devraient être visibles',
        'Badge "DEMANDE CLIENT" indique qu\'il s\'agit d\'une demande de conciergerie',
        'Note : L\'assignation automatique n\'est pas encore implémentée',
      ],
      color: 'green',
    },
    {
      id: 5,
      icon: Truck,
      title: 'Marquer comme "Terminée"',
      description: 'Finalisez le flux de test',
      steps: [
        'Revenez en mode Admin → Demandes',
        'Cliquez sur "Marquer comme terminée" sur la demande test',
        'Ou cliquez sur "Modifier notes" pour ajouter un commentaire final',
        'Le badge passe en vert avec "Terminée"',
        'Revenez en mode Client et vérifiez "Mes demandes"',
        'La demande test apparaît avec le statut "Terminée"',
      ],
      color: 'emerald',
    },
  ];

  const progress = (completedSteps.size / testSteps.length) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-700/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-purple-400 mb-2">Guide & Mode Test</h1>
            <p className="text-slate-300 mb-4">
              Suivez cette checklist interactive pour vérifier que tout fonctionne correctement dans DELIKREOL.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progression du test</span>
                <span className="text-sm font-semibold text-slate-300">
                  {completedSteps.size} / {testSteps.length}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/30 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-50 mb-4">📋 Checklist de vérification</h2>
        <p className="text-slate-400 mb-6">
          Cette checklist ne crée PAS de données automatiquement dans la base.
          Tout est guidé mais manuel pour que vous compreniez le flux complet.
        </p>

        <div className="space-y-6">
          {testSteps.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps.has(step.id);

            return (
              <div
                key={step.id}
                className={`bg-slate-800/50 backdrop-blur border-2 rounded-xl p-6 transition-all ${
                  isCompleted
                    ? `border-${step.color}-500 bg-${step.color}-900/10`
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? `bg-${step.color}-500 border-${step.color}-500`
                        : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-${step.color}-500/20 border border-${step.color}-500/30 flex items-center justify-center`}>
                        <StepIcon className={`w-5 h-5 text-${step.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-50">
                        Étape {step.id}: {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 mb-4">{step.description}</p>

                    <div className="space-y-2">
                      {step.steps.map((substep, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isCompleted ? `text-${step.color}-400` : 'text-slate-500'
                          }`} />
                          <span className={isCompleted ? 'text-slate-300' : 'text-slate-400'}>
                            {substep}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {progress === 100 && (
        <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 backdrop-blur border-2 border-emerald-500 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            Félicitations ! 🎉
          </h2>
          <p className="text-slate-300 mb-4">
            Vous avez complété tous les tests. Votre plateforme DELIKREOL est opérationnelle !
          </p>
          <div className="text-sm text-slate-400">
            Vous pouvez maintenant décocher les étapes et recommencer, ou passer en mode production.
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 backdrop-blur border border-blue-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Astuces</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 flex-shrink-0">•</span>
            <span>
              Utilisez le bouton "Mode Client" / "Espace Pro" dans le header pour naviguer rapidement entre les vues
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 flex-shrink-0">•</span>
            <span>
              Les notes admin sont visibles par tous les utilisateurs admin et peuvent servir de journal de bord
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 flex-shrink-0">•</span>
            <span>
              Les demandes "En cours" peuvent être vues par les partenaires de la zone concernée
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 flex-shrink-0">•</span>
            <span>
              Consultez "Comment ça marche ?" dans l'accueil pour comprendre le flux global de la plateforme
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
