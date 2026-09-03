import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, Image, Music, Trash2, Video } from 'lucide-react';
import { ImageLightbox } from '../../components/ImageLightbox';
import { MediaUpload } from '../../components/MediaUpload';
import { traiteurSpaces } from '../../data/traiteurs';
import { isDemoMode, isSupabaseConfigured, supabase } from '../../lib/supabase';

const LOCAL_STORAGE_KEY = 'delikreol_traiteur_media';

type MediaItem = {
  id: string;
  traiteur_slug: string;
  media_type: 'photo' | 'video' | 'audio';
  storage_bucket?: string | null;
  storage_path?: string | null;
  url: string;
  title: string;
  description: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  is_published?: boolean;
  created_at: string;
};

type DisplayMediaItem = MediaItem & { previewUrl: string | null };

function readLocalMedia(): MediaItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? (parsed as MediaItem[]) : [];
  } catch {
    return [];
  }
}

function formatSize(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function typeIcon(type: MediaItem['media_type']) {
  if (type === 'photo') return <Image className="h-4 w-4" />;
  if (type === 'video') return <Video className="h-4 w-4" />;
  return <Music className="h-4 w-4" />;
}

export default function AdminTraiteurMedia() {
  const traiteurs = useMemo(
    () => traiteurSpaces.map((traiteur) => ({ slug: traiteur.slug, name: traiteur.name })),
    [],
  );
  const [slug, setSlug] = useState(traiteurs[0]?.slug || '');
  const [items, setItems] = useState<DisplayMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('supabase');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode || !isSupabaseConfigured) {
      setItems(readLocalMedia().filter((media) => media.traiteur_slug === slug).map((media) => ({ ...media, previewUrl: media.url })));
      setSource('local');
      setLoading(false);
      return;
    }

    const { data, error: loadError } = await supabase
      .from('traiteur_media')
      .select('*')
      .eq('traiteur_slug', slug)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (loadError) {
      setItems([]);
      setError(`Impossible de charger les médias : ${loadError.message}`);
      setLoading(false);
      return;
    }

    const rows = (data || []) as MediaItem[];
    const signed = await Promise.all(rows.map(async (media): Promise<DisplayMediaItem> => {
      if (!media.storage_path) return { ...media, previewUrl: media.url || null };
      const { data: signedData, error: signedError } = await supabase.storage
        .from(media.storage_bucket || 'traiteur-media')
        .createSignedUrl(media.storage_path, 3600);
      if (signedError) return { ...media, previewUrl: null };
      return { ...media, previewUrl: signedData.signedUrl };
    }));
    setItems(signed);
    setSource('supabase');
    setLoading(false);
  };

  useEffect(() => { void load(); }, [slug]);

  const handleDelete = async (item: DisplayMediaItem) => {
    setDeleting(item.id);
    setError('');
    if (isDemoMode || !isSupabaseConfigured) {
      const updated = readLocalMedia().filter((media) => media.id !== item.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setDeleteConfirm(null);
      setDeleting(null);
      await load();
      return;
    }

    const { error: deleteRowError } = await supabase.from('traiteur_media').delete().eq('id', item.id);
    if (deleteRowError) {
      setError(`Suppression refusée : ${deleteRowError.message}`);
      setDeleting(null);
      return;
    }

    if (item.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(item.storage_bucket || 'traiteur-media')
        .remove([item.storage_path]);
      if (storageError) {
        setError(`Métadonnée supprimée, mais nettoyage Storage à reprendre : ${storageError.message}`);
      }
    }
    setDeleteConfirm(null);
    setDeleting(null);
    await load();
  };

  const photoItems = items.filter((item) => item.media_type === 'photo' && item.previewUrl);
  const lightboxImages = photoItems.map((item) => ({
    src: item.previewUrl || '',
    alt: item.title || 'Photo traiteur',
    caption: item.description || item.title,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black">Médias traiteurs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Espace privé de préparation · Source : {source}</p>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Un média uploadé reste privé et non publié jusqu’à validation éditoriale.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {traiteurs.map((traiteur) => (
          <button key={traiteur.slug} type="button" onClick={() => setSlug(traiteur.slug)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${slug === traiteur.slug ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            {traiteur.name}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 font-bold">Ajouter des médias pour {traiteurs.find((traiteur) => traiteur.slug === slug)?.name}</h2>
        <MediaUpload traiteurSlug={slug} onUploaded={() => void load()} />
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="rounded-2xl border bg-card">
        <div className="border-b p-4"><h2 className="font-bold">Médias privés ({items.length})</h2></div>
        {loading && <div className="p-8 text-center text-muted-foreground">Chargement…</div>}
        {!loading && items.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucun média pour ce traiteur.</div>}
        {!loading && items.length > 0 && (
          <div className="divide-y">
            {items.map((item) => {
              const photoIndex = photoItems.findIndex((photo) => photo.id === item.id);
              return (
                <div key={item.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted/30">
                  {item.media_type === 'photo' && item.previewUrl && (
                    <button type="button" onClick={() => setLightboxIndex(photoIndex)} aria-label={`Agrandir ${item.title}`}>
                      <img src={item.previewUrl} alt={item.title} className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                    </button>
                  )}
                  {item.media_type === 'video' && item.previewUrl && <video src={item.previewUrl} className="h-16 w-16 rounded-xl object-cover" controls preload="metadata" />}
                  {item.media_type === 'audio' && <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted"><Music className="h-6 w-6" /></div>}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">{typeIcon(item.media_type)} {item.media_type}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Privé · à valider</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatSize(item.file_size)} · {new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                    {item.media_type === 'audio' && item.previewUrl && <audio src={item.previewUrl} controls className="mt-2 h-8 w-full" />}
                  </div>

                  <div className="flex items-center gap-1">
                    {item.previewUrl && <a href={item.previewUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-primary/10" title="Ouvrir"><ExternalLink className="h-4 w-4" /></a>}
                    {item.previewUrl && <a href={item.previewUrl} download className="rounded-lg p-2 hover:bg-primary/10" title="Télécharger"><Download className="h-4 w-4" /></a>}
                    {deleteConfirm === item.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => void handleDelete(item)} disabled={deleting === item.id} className="rounded-lg bg-destructive/10 p-2 text-destructive disabled:opacity-50" title="Confirmer"><Trash2 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-lg p-2 text-xs hover:bg-muted">Non</button>
                      </div>
                    ) : <button type="button" onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-2 hover:bg-destructive/10 hover:text-destructive" title="Supprimer"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {lightboxIndex !== null && <ImageLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
    </div>
  );
}
