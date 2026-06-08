import { useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const projects = [
  {
    name: 'DELIKREOL',
    priority: 'Priorité absolue',
    status: 'En cours',
    color: 'bg-orange-500',
    items: [
      'Catalogue & panier ✅',
      'WhatsApp commandes ✅',
      'Formulaires partenaires/livreurs ✅',
      'Dashboard admin ✅',
      'Backend Supabase — en place',
      'Données traiteurs réels — à compléter',
      'GitHub Pages — actif',
      'Domaine delikreol.mq — à configurer',
    ],
  },
  {
    name: 'IKABAY',
    priority: 'Phase suivante',
    status: 'En attente',
    color: 'bg-blue-500',
    items: ['Marketplace caribéenne', 'Import/export', 'Sourcing produits locaux', 'Dropshipping', 'Logistique', 'Emploi & formation', 'Crypto-récompenses'],
  },
  {
    name: 'SOS GALÈRE',
    priority: 'Phase suivante',
    status: 'En attente',
    color: 'bg-emerald-500',
    items: ['Entraide locale', 'Services & artisans', 'Réservation', 'Paiement', 'Géolocalisation', 'Emploi communautaire'],
  },
  {
    name: 'ORCHESTRATEUR IA',
    priority: 'Outil transversal',
    status: 'Actif',
    color: 'bg-purple-500',
    items: ['Hermes Agent', 'OpenClaw/VladClaw', 'GitHub', 'Hostinger', 'WhatsApp Business', 'Telegram', 'Google Drive/Sheets', 'Canva'],
  },
];

export function AdminOrchestrateur() {
  useEffect(() => { document.title = 'Orchestrateur — Admin DeliKreol'; }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-primary" />
        Orchestrateur multi-projets
      </h1>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.name} className="bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${project.color}`} />
              <h2 className="font-bold text-lg">{project.name}</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-muted rounded-full">{project.priority}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'En cours' ? 'bg-green-100 text-green-700' : project.status === 'Actif' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
            </div>
            <ul className="space-y-1.5">
              {project.items.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  {item.includes('✅') ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : item.includes('à') ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{item.replace(' ✅', '')}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrchestrateur;
