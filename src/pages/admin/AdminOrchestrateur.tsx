import { useState, useEffect } from'react';
import { Briefcase, CheckCircle, Clock, AlertTriangle, Play, Pause, RefreshCw, ChevronDown, ChevronRight, Loader } from'lucide-react';
import { supabase } from'../../lib/supabase';

interface Task {
 id: string;
 label: string;
 status:'pending' |'running' |'done' |'blocked';
 dependsOn?: string[];
 action?: string;
}

interface Project {
 name: string;
 priority: string;
 status: string;
 color: string;
 tasks: Task[];
 expanded: boolean;
}

export default function AdminOrchestrateur() {
 const [projects, setProjects] = useState<Project[]>([
 {
 name:'DELIKREOL',
 priority:'Priorité absolue',
 status:'En cours',
 color:'bg-primary',
 expanded: true,
 tasks: [
 { id:'dl-catalogue', label:'Catalogue & panier', status:'done' },
 { id:'dl-whatsapp', label:'WhatsApp commandes', status:'done' },
 { id:'dl-forms', label:'Formulaires partenaires/livreurs', status:'done' },
 { id:'dl-admin', label:'Dashboard admin', status:'done' },
 { id:'dl-supabase', label:'Backend Supabase', status:'done' },
 { id:'dl-traiteurs', label:'Données traiteurs réels', status:'running', dependsOn: ['dl-forms'] },
 { id:'dl-domain', label:'Domaine delikreol.mq', status:'pending' },
 { id:'dl-pilot', label:'Lancement pilote 7 traiteurs', status:'pending', dependsOn: ['dl-traiteurs'] },
 ],
 },
 {
 name:'LIVREURS',
 priority:'Module opérationnel',
 status:'Partiellement déployé',
 color:'bg-success',
 expanded: false,
 tasks: [
 { id:'lv-form', label:'Formulaire inscription', status:'done' },
 { id:'lv-admin', label:'Admin livreurs + statuts', status:'done' },
 { id:'lv-data', label:'Import livreurs inscrits', status:'done' },
 { id:'lv-validation', label:'Validation + envoi accès WhatsApp', status:'running' },
 ],
 },
 {
 name:'POINTS RELAIS',
 priority:'Module opérationnel',
 status:'En déploiement',
 color:'bg-muted0',
 expanded: false,
 tasks: [
 { id:'pr-form', label:'Formulaire inscription', status:'done' },
 { id:'pr-admin', label:'Admin points relais', status:'done' },
 { id:'pr-data', label:'Import points relais inscrits', status:'pending' },
 ],
 },
 {
 name:'PARTENAIRES',
 priority:'Module pilote',
 status:'7 en cours',
 color:'bg-blue-500',
 expanded: false,
 tasks: [
 { id:'pt-access', label:'Tokens d\'accès créés', status:'done' },
 { id:'pt-portal', label:'Page partenaire opérationnelle', status:'done' },
 { id:'pt-messages', label:'Messages WhatsApp prêts', status:'done' },
 { id:'pt-validation', label:'Validation des 7 partenaires', status:'running' },
 ],
 },
 {
 name:'FINANCE & FACTURATION',
 priority:'Module production',
 status:'Tables prêtes',
 color:'bg-purple-500',
 expanded: false,
 tasks: [
 { id:'fi-tables', label:'Tables invoices/payments/commissions', status:'done' },
 { id:'fi-admin', label:'Admin finance', status:'done' },
 { id:'fi-export', label:'Export comptable', status:'done' },
 { id:'fi-qonto', label:'Synchro Qonto', status:'pending' },
 ],
 },
 ]);

 const total = projects.reduce((a, p) => a + p.tasks.length, 0);
 const done = projects.reduce((a, p) => a + p.tasks.filter(t => t.status ==='done').length, 0);
 const running = projects.reduce((a, p) => a + p.tasks.filter(t => t.status ==='running').length, 0);
 const blocked = projects.reduce((a, p) => a + p.tasks.filter(t => t.status ==='blocked').length, 0);

 const toggleProject = (name: string) => {
 setProjects(prev => prev.map(p => p.name === name ? { ...p, expanded: !p.expanded } : p));
 };

 const runNext = () => {
 // Trouve la prochaine tâche à exécuter
 for (const project of projects) {
 for (const task of project.tasks) {
 if (task.status ==='pending' || task.status ==='blocked') {
 const depsMet = !task.dependsOn || task.dependsOn.every(depId =>
 project.tasks.find(t => t.id === depId)?.status ==='done'
 );
 if (depsMet) {
 setProjects(prev => prev.map(p => ({
 ...p,
 tasks: p.tasks.map(t => t.id === task.id ? { ...t, status:'running' as const } : t)
 })));
 return;
 } else {
 setProjects(prev => prev.map(p => ({
 ...p,
 tasks: p.tasks.map(t => t.id === task.id ? { ...t, status:'blocked' as const } : t)
 })));
 }
 }
 }
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black flex items-center gap-3">
 <Briefcase className="w-7 h-7 text-primary" />
 Orchestrateur multi-projets
 </h1>
 <p className="text-sm text-muted-foreground mt-1">Séquencement et pilotage des chantiers DeliKreol</p>
 </div>
 <button onClick={runNext} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
 <Play className="w-4 h-4" /> Lancer la suite
 </button>
 </div>

 {/* Stats globales */}
 <div className="grid grid-cols-4 gap-4">
 <div className="bg-card rounded-2xl border p-4 text-center">
 <div className="text-2xl font-black text-primary">{total}</div>
 <div className="text-xs text-muted-foreground">Tâches</div>
 </div>
 <div className="bg-card rounded-2xl border p-4 text-center">
 <div className="text-2xl font-black text-success">{done}</div>
 <div className="text-xs text-muted-foreground">Terminées</div>
 </div>
 <div className="bg-card rounded-2xl border p-4 text-center">
 <div className="text-2xl font-black text-amber-500">{running}</div>
 <div className="text-xs text-muted-foreground">En cours</div>
 </div>
 <div className="bg-card rounded-2xl border p-4 text-center">
 <div className="text-2xl font-black text-destructive">{blocked}</div>
 <div className="text-xs text-muted-foreground">Bloquées</div>
 </div>
 </div>

 {/* Projets */}
 <div className="space-y-4">
 {projects.map(project => (
 <div key={project.name} className="bg-card rounded-2xl border overflow-hidden">
 <button onClick={() => toggleProject(project.name)} className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
 <div className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full ${project.color}`} />
 <h2 className="text-lg font-bold">{project.name}</h2>
 <span className="text-xs px-2 py-1 bg-muted rounded-full">{project.priority}</span>
 <span className={`text-xs px-2 py-1 rounded-full ${project.status ==='En cours' ?'bg-green-100 text-green-700' :'bg-muted text-muted-foreground'}`}>
 {project.status}
 </span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground">
 {project.tasks.filter(t => t.status ==='done').length}/{project.tasks.length}
 </span>
 {project.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
 </div>
 </button>

 {project.expanded && (
 <div className="border-t px-5 py-3 space-y-2">
 {project.tasks.map(task => (
 <div key={task.id} className="flex items-center gap-3 text-sm">
 {task.status ==='done' ? (
 <CheckCircle className="w-4 h-4 text-success" />
 ) : task.status ==='running' ? (
 <Loader className="w-4 h-4 text-primary animate-spin" />
 ) : task.status ==='blocked' ? (
 <AlertTriangle className="w-4 h-4 text-destructive" />
 ) : (
 <Clock className="w-4 h-4 text-muted-foreground/50" />
 )}
 <span className={task.status ==='done' ?'line-through text-muted-foreground' :''}>
 {task.label}
 </span>
 {task.dependsOn && task.status ==='blocked' && (
 <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full">en attente</span>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}