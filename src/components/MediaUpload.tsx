import { useState, useRef, useCallback } from 'react';
import { supabase, isDemoMode, isSupabaseConfigured } from '../lib/supabase';
import { Upload, X, AlertCircle, CheckCircle, Loader, Image, Music, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'mp4',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
} as const;

type AllowedMime = keyof typeof ALLOWED_TYPES;

function isAllowedMime(mime: string): mime is AllowedMime {
  return Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, mime);
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

function getMediaType(mime: AllowedMime): 'photo' | 'video' | 'audio' {
  if (mime.startsWith('image/')) return 'photo';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  throw new Error('Type média non supporté');
}

function getTypeIcon(mime: string) {
  if (mime.startsWith('image/')) return Image;
  if (mime.startsWith('video/')) return Video;
  if (mime.startsWith('audio/')) return Music;
  return Image;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  url?: string;
  preview?: string;
}

interface MediaUploadProps {
  traiteurSlug: string;
  onUploaded?: () => void;
}

export function MediaUpload({ traiteurSlug, onUploaded }: MediaUploadProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newItems: UploadItem[] = [];
    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mime = file.type;
      if (!isAllowedMime(mime)) {
        newItems.push({
          id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          file,
          progress: 0,
          status: 'error',
          error: `Format non supporté : .${ext}`,
        });
        continue;
      }
      if (file.size > MAX_SIZE) {
        newItems.push({
          id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          file,
          progress: 0,
          status: 'error',
          error: `Fichier trop volumineux (max 50 Mo)`,
        });
        continue;
      }
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      newItems.push({
        id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        progress: 0,
        status: 'pending',
        preview,
      });
    }
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const uploadFile = async (item: UploadItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

    let uploadedPath: string | null = null;
    try {
      if (!isAllowedMime(item.file.type)) throw new Error('Format MIME non supporté');
      const ext = ALLOWED_TYPES[item.file.type];
      const fileName = `${traiteurSlug}/${crypto.randomUUID()}.${ext}`;
      const mediaType = getMediaType(item.file.type);

      if (isDemoMode || !isSupabaseConfigured) {
        // Demo mode: simulate upload
        for (let p = 0; p <= 100; p += 20) {
          await new Promise(r => setTimeout(r, 200));
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: p } : i));
        }
        const demoUrl = URL.createObjectURL(item.file);
        const demoId = `demo_${Date.now()}`;
        const parsed: unknown = JSON.parse(localStorage.getItem('delikreol_traiteur_media') || '[]');
        const demoRecords: Array<Record<string, unknown>> = Array.isArray(parsed) ? parsed : [];
        demoRecords.push({
          id: demoId,
          traiteur_slug: traiteurSlug,
          media_type: mediaType,
          url: demoUrl,
          title: item.file.name,
          description: '',
          file_size: item.file.size,
          mime_type: item.file.type,
          uploaded_by: user?.id || 'demo',
          sort_order: demoRecords.length,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('delikreol_traiteur_media', JSON.stringify(demoRecords));
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: 100, status: 'done', url: demoUrl } : i));
        onUploaded?.();
        return;
      }

      // Upload to Supabase Storage with progress tracking
      const { data: storageData, error: storageError } = await supabase.storage
        .from('traiteur-media')
        .upload(fileName, item.file, {
          cacheControl: '3600',
          contentType: item.file.type,
          upsert: false,
        });

      if (storageError) throw storageError;
      uploadedPath = storageData.path;

      const { data: urlData, error: signedUrlError } = await supabase.storage
        .from('traiteur-media')
        .createSignedUrl(storageData.path, 3600);
      if (signedUrlError) throw signedUrlError;
      const previewUrl = urlData.signedUrl;

      // Insert metadata into traiteur_media table
      const { error: dbError } = await supabase
        .from('traiteur_media')
        .insert({
          traiteur_slug: traiteurSlug,
          media_type: mediaType,
          storage_bucket: 'traiteur-media',
          storage_path: storageData.path,
          url: '',
          title: item.file.name,
          description: '',
          file_size: item.file.size,
          mime_type: item.file.type,
          uploaded_by: user?.id,
          sort_order: 0,
          is_published: false,
        });

      if (dbError) {
        await supabase.storage.from('traiteur-media').remove([storageData.path]);
        uploadedPath = null;
        throw dbError;
      }

      setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: 100, status: 'done', url: previewUrl } : i));
      onUploaded?.();
    } catch (err: unknown) {
      if (uploadedPath) await supabase.storage.from('traiteur-media').remove([uploadedPath]);
      const message = err instanceof Error ? err.message : 'Échec de l’upload';
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: message } : i));
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    for (const item of items) {
      if (item.status !== 'pending') continue;
      await uploadFile(item);
    }
    setUploading(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find((candidate) => candidate.id === id);
      if (item?.preview?.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Cliquez ou glissez-déposez vos fichiers ici
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WEBP, MP3, WAV, MP4, WEBM — Max 50 Mo
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/mp4,video/mp4,video/webm"
          onChange={e => addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => {
            const TypeIcon = getTypeIcon(item.file.type);
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                {/* Preview */}
                {item.preview ? (
                  <img src={item.preview} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024 / 1024).toFixed(1)} Mo
                    {item.file.type.startsWith('image/') ? ' · Image' : item.file.type.startsWith('video/') ? ' · Vidéo' : ' · Audio'}
                  </p>
                  {/* Progress bar */}
                  {(item.status === 'uploading' || item.status === 'done') && (
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'done' ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.status === 'pending' && (
                    <button onClick={() => removeItem(item.id)} aria-label={`Retirer ${item.file.name}`} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {item.status === 'uploading' && <Loader className="h-4 w-4 animate-spin text-primary" />}
                  {item.status === 'done' && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  {item.status === 'error' && (
                    <div className="group relative">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      {item.error && (
                        <div className="absolute bottom-full right-0 mb-1 w-48 p-2 bg-destructive text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {item.error}
                        </div>
                      )}
                    </div>
                  )}
                  {(item.status === 'done' || item.status === 'error') && (
                    <button onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive rounded-lg">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload button */}
          {items.some(i => i.status === 'pending') && (
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Upload en cours…
                </span>
              ) : (
                `Uploader ${items.filter(i => i.status === 'pending').length} fichier(s)`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}