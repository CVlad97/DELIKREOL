import { useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import { AlertCircle, AlertTriangle, Loader, MessageCircle, RefreshCw } from 'lucide-react';

interface Correction {
  id: string;
  partner_id?: string | null;
  partner_name?: string | null;
  responsable?: string | null;
  telephone?: string | null;
  email?: string | null;
  commune?: string | null;
  description?: string | null;
  horaires?: string | null;
  modes?: string | string[] | null;
  plats?: string | null;
  prix?: string | null;
  compositions?: string | null;
  allergenes?: string | null;
  remarques?: string | null;
  status: 'pending' | 'reviewed' | 'applied';
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'delikreol_partner_corrections_v1';

function readLocalCorrections(): Correction[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? (parsed as Correction[]) : [];
  } catch {
    return [];
  }
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `596${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export default function AdminPartnerCorrections() {
  const [items, setItems] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('supabase');
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode) {
      setItems(readLocalCorrections());
      setSource('local');
    } else {
      const { data, error: loadError } = await supabase
        .from('partner_corrections')
        .select('*')
        .order('created_at', { ascending: false });
      if (loadError) {
        setItems([]);
        setError(`Impossible de charger les corrections : ${loadError.message}`);
      } else {
        setItems((data || []) as Correction[]);
        setSource('supabase');
      }
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (id: string, status: 'reviewed' | 'applied') => {
    setUpdatingId(id);
    setError('');
    if (isDemoMode) {
      const updated = readLocalCorrections().map((correction) =>
        correction.id === id ? { ...correction, status } : correction,
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      setUpdatingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from('partner_corrections')
      .update({ status })
      .eq('id', id);
    if (updateError) {
      setError(`Mise à jour refusée : ${updateError.message}`);
      setUpdatingId(null);
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? items : items.filter(c => c.status === filter);
  const pending = items.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            Corrections partenaires
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modifications soumises par les traiteurs et partenaires
            {pending > 0 && <span className="ml-2 text-amber-600 font-bold">({pending} en attente)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">Source : {source}</div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {['all', 'pending', 'reviewed', 'applied'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            }`}>
            {f === 'all' ? 'Toutes' : f === 'pending' ? '⏳ En attente' : f === 'reviewed' ? '👀 Revues' : '✅ Appliquées'}
            ({f === 'all' ? items.length : items.filter(c => c.status === f).length})
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader className="h-5 w-5 animate-spin" /> Chargement...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune correction soumise pour le moment.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(c => (
          <div key={c.id} className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{c.responsable}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    c.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {c.status === 'pending' ? '⏳ En attente' : c.status === 'reviewed' ? '👀 Revue' : '✅ Appliqué'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Partenaire : {c.partner_name || c.partner_id || 'N/A'} · {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  {c.telephone && <span className="ml-2">📞 {c.telephone}</span>}
                </p>
              </div>
              <div className="flex gap-2">
                {c.telephone && (
                  <a href={whatsappHref(c.telephone)} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-[#25D366] text-white rounded-xl text-xs flex items-center gap-1 hover:bg-[#128C7E]">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
                {c.status === 'pending' && (
                  <>
                    <button onClick={() => void updateStatus(c.id, 'reviewed')} disabled={updatingId === c.id}
                      className="px-2.5 py-1.5 bg-blue-500 text-white rounded-xl text-xs hover:bg-blue-600 disabled:opacity-50">Marquer revue</button>
                    <button onClick={() => void updateStatus(c.id, 'applied')} disabled={updatingId === c.id}
                      className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs hover:bg-emerald-600 disabled:opacity-50">Appliquer</button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {c.description && <div><span className="text-xs text-muted-foreground">Description</span><br />{c.description}</div>}
              {c.horaires && <div><span className="text-xs text-muted-foreground">Horaires</span><br />{c.horaires}</div>}
              {c.modes && <div><span className="text-xs text-muted-foreground">Modes</span><br />{Array.isArray(c.modes) ? c.modes.join(', ') : c.modes}</div>}
              {c.plats && <div><span className="text-xs text-muted-foreground">Plats</span><br />{c.plats}</div>}
              {c.prix && <div><span className="text-xs text-muted-foreground">Prix</span><br />{c.prix}</div>}
              {c.compositions && <div><span className="text-xs text-muted-foreground">Compositions</span><br />{c.compositions}</div>}
              {c.allergenes && <div><span className="text-xs text-muted-foreground">Allergènes</span><br />{c.allergenes}</div>}
              {c.remarques && <div className="col-span-2"><span className="text-xs text-muted-foreground">Remarques</span><br />{c.remarques}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}