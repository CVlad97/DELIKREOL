import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, UploadCloud, RefreshCw, Check } from 'lucide-react';
import { MediaUpload } from '../../components/MediaUpload';
import { isDemoMode, isSupabaseConfigured, supabase } from '../../lib/supabase';

type Row = {
  id: string;
  traiteur_slug: string;
  media_type: string;
  url: string;
  title: string;
  is_published: boolean;
  sort_order: number;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploaded_by?: string | null;
};

type FormData = {
  slug: string;
  media_type: 'photo' | 'video' | 'audio';
  url: string;
  title: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  is_published: boolean;
};

const EMPTY: FormData = {
  slug: '', media_type: 'photo', url: '', title: '', file_size: 0, mime_type: 'image/jpeg', sort_order: 0, is_published: false,
};

export default function AdminTraiteurMedia() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [uploadSlug, setUploadSlug] = useState('');
  const [uploadOk, setUploadOk] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    if (isDemoMode || !isSupabaseConfigured) { setRows([]); setLoading(false); return; }
    const { data, error: e } = await supabase.from('traiteur_media').select('id,traiteur_slug,media_type,url,title,is_published,sort_order,file_size,mime_type,created_at,uploaded_by').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (e) setError(`Chargement refusé : ${e.message}`);
    else setRows((data || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const resetForm = () => { setEditId(null); setForm(EMPTY); };

  const openEdit = (r: Row) => {
    setEditId(r.id); setForm({
      slug: r.traiteur_slug, media_type: r.media_type as FormData['media_type'], url: r.url, title: r.title,
      file_size: r.file_size, mime_type: r.mime_type, sort_order: r.sort_order, is_published: r.is_published,
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (isDemoMode || !isSupabaseConfigured) { setError('Mode démo : sauvegarde désactivée'); return; }
    const payload = {
      traiteur_slug: form.slug, media_type: form.media_type, url: form.url, title: form.title,
      file_size: form.file_size, mime_type: form.mime_type, sort_order: form.sort_order, is_published: form.is_published,
    };
    if (editId) {
      const { error: e } = await supabase.from('traiteur_media').update(payload).eq('id', editId);
      if (e) setError(`MAJ refusée : ${e.message}`);
    } else {
      const { error: e } = await supabase.from('traiteur_media').insert({ ...payload, storage_bucket: 'traiteur-media' });
      if (e) setError(`Insertion refusée : ${e.message}`);
    }
    resetForm(); await load();
  };

  const doDelete = async (id: string) => {
    setDeleting(id); setError('');
    if (isDemoMode || !isSupabaseConfigured) { setDeleting(null); setDelConfirm(null); return; }
    const { error: e } = await supabase.from('traiteur_media').delete().eq('id', id);
    if (e) setError(`Suppression refusée : ${e.message}`);
    setDeleting(null); setDelConfirm(null); await load();
  };

  const handleUpload = () => { setUploadOk(true); setTimeout(() => { setUploadOk(false); setUploadSlug(''); void load(); }, 1200); };

  const cols = ['Slug', 'Type', 'URL', 'Titre', 'Pub.', 'Ord.', 'Taille', 'MIME', 'Créé', 'Par'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Admin Traiteur Media</h1>
        <p className="text-xs text-muted-foreground">Table publique `traiteur_media` — RLS `private.is_delikreol_admin()` — bucket `traiteur-media`</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <h2 className="font-bold">{editId ? 'Mettre à jour' : 'Insérer'} — {editId ? 'Édition' : 'Nouveau'}</h2>
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <input required className="rounded-lg border px-2 py-1.5" placeholder="slug (traiteur_slug)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          <select className="rounded-lg border px-2 py-1.5" value={form.media_type} onChange={e => setForm({ ...form, media_type: e.target.value as FormData['media_type'] })}>
            <option value="photo">photo</option><option value="video">video</option><option value="audio">audio</option>
          </select>
          <input required className="rounded-lg border px-2 py-1.5" placeholder="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <input required className="rounded-lg border px-2 py-1.5" placeholder="titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input type="number" className="rounded-lg border px-2 py-1.5" placeholder="file_size" value={form.file_size} onChange={e => setForm({ ...form, file_size: Number(e.target.value) })} />
          <input className="rounded-lg border px-2 py-1.5" placeholder="mime_type" value={form.mime_type} onChange={e => setForm({ ...form, mime_type: e.target.value })} />
          <input type="number" className="rounded-lg border px-2 py-1.5" placeholder="sort_order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 rounded-lg border px-2 py-1.5"><input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} /> publié</label>
          <div className="md:col-span-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-white font-semibold">{editId ? 'MAJ' : 'Insérer'}</button>
            {editId && <button type="button" onClick={resetForm} className="rounded-lg border px-3 py-1.5">Annuler</button>}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-bold">Upload — bucket `traiteur-media`</h2>
          <input className="rounded-lg border px-2 py-1 text-sm" placeholder="slug pour upload" value={uploadSlug} onChange={e => setUploadSlug(e.target.value)} />
          {uploadOk ? <span className="flex items-center gap-1 text-green-700 text-sm"><Check className="h-4 w-4" /> Envoyé</span> : null}
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <MediaUpload traiteurSlug={uploadSlug || 'default'} onUploaded={handleUpload} />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border bg-card overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-bold">Table (`traiteur_media`) — {rows.length} lignes</h2>
          <button onClick={load} className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-muted"><RefreshCw className="h-3 w-3" /> Rafraîchir</button>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted text-muted-foreground"><tr>{cols.map(c => <th key={c} className="text-left px-2 py-2 font-semibold">{c}</th>)}<th className="px-2 py-2">Actions</th></tr></thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={cols.length + 1} className="p-6 text-center text-muted-foreground">Chargement…</td></tr> :
              rows.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-2 py-2 font-mono text-[11px]">{r.traiteur_slug}</td>
                  <td className="px-2 py-2">{r.media_type}</td>
                  <td className="px-2 py-2 truncate max-w-[140px]">{r.url}</td>
                  <td className="px-2 py-2">{r.title}</td>
                  <td className="px-2 py-2">{r.is_published ? '✓' : '—'}</td>
                  <td className="px-2 py-2">{r.sort_order}</td>
                  <td className="px-2 py-2">{r.file_size}</td>
                  <td className="px-2 py-2 truncate max-w-[90px]">{r.mime_type}</td>
                  <td className="px-2 py-2">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-2 py-2 truncate max-w-[90px]">{r.uploaded_by ? String(r.uploaded_by).slice(0,8)+'…' : '—'}</td>
                  <td className="px-2 py-2 flex gap-1">
                    <button onClick={() => openEdit(r)} className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 text-[11px] font-semibold">Éd.</button>
                    <button onClick={() => setDelConfirm(r.id)} className="rounded bg-red-50 px-2 py-0.5 text-red-700 text-[11px] font-semibold">Del</button>
                  </td>
                </tr>
              ))
            }
            {rows.length === 0 && !loading && <tr><td colSpan={cols.length + 1} className="p-6 text-center text-muted-foreground">Aucun média.</td></tr>}
          </tbody>
        </table>
      </div>

      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="rounded-2xl bg-white p-6 max-w-sm shadow-2xl space-y-3">
            <h3 className="font-bold">Confirmer suppression</h3>
            <p className="text-sm text-muted-foreground">Cette ligne et son objet Storage seront supprimés (RLS `is_delikreol_admin()`).</p>
            <div className="flex gap-2">
              <button onClick={() => doDelete(delConfirm)} disabled={deleting === delConfirm} className="rounded-lg bg-destructive px-3 py-1.5 text-white text-sm font-semibold">Supprimer</button>
              <button onClick={() => setDelConfirm(null)} className="rounded-lg border px-3 py-1.5 text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
