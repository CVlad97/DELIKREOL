import { useEffect, useState } from 'react';
import { Brain, Plus, Trash2, Save } from 'lucide-react';

function load(): any[] {
  try { return JSON.parse(localStorage.getItem('delikreol_project_memory') || '[]'); }
  catch { return []; }
}

function save(items: any[]) {
  localStorage.setItem('delikreol_project_memory', JSON.stringify(items));
}

export function AdminMemoire() {
  const [items, setItems] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({ project: 'DELIKREOL', section: '', title: '', content: '', status: 'actif' });

  useEffect(() => {
    document.title = 'Mémoire projet — Admin DeliKreol';
    setItems(load());
  }, []);

  const addEntry = () => {
    if (!newEntry.title.trim()) return;
    const entry = { ...newEntry, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...items, entry];
    setItems(updated);
    save(updated);
    setNewEntry({ project: 'DELIKREOL', section: '', title: '', content: '', status: 'actif' });
  };

  const removeEntry = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    save(updated);
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        Mémoire projet
      </h1>

      {/* Add form */}
      <div className="bg-card rounded-xl border p-5 mb-6">
        <h2 className="font-semibold mb-3">Nouvelle entrée</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <select value={newEntry.project} onChange={e => setNewEntry(p => ({...p, project: e.target.value}))} className="px-3 py-2 rounded-lg border bg-background text-sm">
            <option value="DELIKREOL">DELIKREOL</option>
            <option value="IKABAY">IKABAY</option>
            <option value="SOS GALERE">SOS GALÈRE</option>
            <option value="ORCHESTRATEUR">ORCHESTRATEUR IA</option>
          </select>
          <input value={newEntry.section} onChange={e => setNewEntry(p => ({...p, section: e.target.value}))} placeholder="Section" className="px-3 py-2 rounded-lg border bg-background text-sm" />
        </div>
        <input value={newEntry.title} onChange={e => setNewEntry(p => ({...p, title: e.target.value}))} placeholder="Titre" className="w-full px-3 py-2 rounded-lg border bg-background text-sm mb-3" />
        <textarea value={newEntry.content} onChange={e => setNewEntry(p => ({...p, content: e.target.value}))} placeholder="Contenu" rows={3} className="w-full px-3 py-2 rounded-lg border bg-background text-sm mb-3 resize-none" />
        <button onClick={addEntry} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Entries */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl">
          <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune entrée mémoire. Ajoutez des notes, décisions, et informations projet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="bg-card rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{item.project}</span>
                    {item.section && <span className="text-xs text-muted-foreground">{item.section}</span>}
                  </div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  {item.content && <p className="text-sm text-muted-foreground mt-1">{item.content}</p>}
                </div>
                <button onClick={() => removeEntry(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminMemoire;
