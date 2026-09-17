import { useEffect, useState } from'react';
import { supabase, isDemoMode, isSupabaseConfigured } from'../../lib/supabase';
import { useToast } from'../../contexts/ToastContext';

function normalizeStatus(value?: string) {
 const normalized = (value ||'candidat').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if (['valide','validated','accepted'].includes(normalized)) return'valide';
 return normalized;
}

function whatsappNumber(value?: string | null) {
 const digits = String(value ||'').replace(/\D/g,'');
 if (!digits) return'';
 if (digits.startsWith('596')) return digits;
 if (digits.startsWith('0')) return `596${digits.slice(1)}`;
 return `596${digits}`;
}

function loadLocal(): any[] {
 try { return JSON.parse(localStorage.getItem('delikreol_driver_applications') ||'[]'); }
 catch { return []; }
}

function formatDate(value?: string) {
 if (!value) return'—';
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return'—';
 return date.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
}

export function AdminLivreurs() {
 const [items, setItems] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [source, setSource] = useState<'supabase' |'local'>('local');
 const [error, setError] = useState<string | null>(null);
 const [updatingId, setUpdatingId] = useState<string | null>(null);
 const { showSuccess, showError } = useToast();

 const loadApplications = async () => {
 setLoading(true);
 setError(null);

 if (isSupabaseConfigured && !isDemoMode) {
 try {
 const { data, error: dbError } = await supabase
 .from('driver_applications')
 .select('id,name,phone,whatsapp,email,commune,transport_mode,zones_acceptees,disponibilite,horaires,experience_livraison,status,created_at')
 .order('created_at', { ascending: false });

 if (dbError) throw dbError;
 setItems(data || []);
 setSource('supabase');
 setLoading(false);
 return;
 } catch (err: any) {
 console.warn('[AdminLivreurs] Supabase load failed', err);
 setError(err?.message ||'Lecture Supabase impossible. Affichage local uniquement.');
 }
 }

 setItems(loadLocal().sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()));
 setSource('local');
 setLoading(false);
 };

 useEffect(() => {
 document.title ='Candidatures livreurs — Admin DeliKreol';
 void loadApplications();
 }, []);

 const updateStatus = async (id: string, status: string) => {
 const previous = items.find((item) => item.id === id)?.status ||'candidat';
 setUpdatingId(id);

 if (source ==='supabase' && isSupabaseConfigured && !isDemoMode) {
 const { data, error: dbError } = await supabase
 .from('driver_applications')
 .update({ status })
 .eq('id', id)
 .select('id,status')
 .maybeSingle();
 if (dbError || !data) {
   setError(dbError?.message ||'La modification n’a pas été enregistrée. Vérifiez les droits administrateur.');
   setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: previous } : item));
   showError('Statut non modifié.');
   setUpdatingId(null);
   return;
 }
 }
 setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
 setError(null);
 showSuccess('Statut du livreur enregistré.');
 setUpdatingId(null);
 };

 return (
 <div>
 <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-display font-bold">Candidatures livreurs</h1>
 <p className="mt-1 text-xs text-muted-foreground">Source : {source ==='supabase' ?'Supabase' :'localStorage'}</p>
 </div>
 <button onClick={loadApplications} className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">
 Actualiser
 </button>
 </div>

 {error && <div className="mb-4 rounded-xl border border-input bg-muted p-3 text-sm text-muted-foreground">{error}</div>}

 {loading ? (
 <div className="text-center py-12 bg-muted/20 rounded-xl">
 <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
 <p className="text-muted-foreground">Chargement des candidatures…</p>
 </div>
 ) : items.length === 0 ? (
 <div className="text-center py-12 bg-muted/20 rounded-xl">
 <p className="text-muted-foreground">Aucune candidature livreur pour le moment.</p>
 </div>
 ) : (
 <div className="bg-card rounded-xl border overflow-x-auto">
 <table className="w-full">
 <thead className="border-b bg-muted/30">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nom</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Commune</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Transport</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Contact</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Zones</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Statut</th>
 </tr>
 </thead>
 <tbody className="divide-y">
 {items.map((item: any) => {
 const phone = item.phone || item.telephone;
 const name = item.name || item.nom ||'—';
 const transport = item.transport_mode || item.transportMode || item.moyenTransport ||'—';
 const zones = item.zones_acceptees || item.zonesAcceptees || [];
 const created = item.created_at || item.createdAt;
 const contactNumber = whatsappNumber(item.whatsapp || phone);
 const activationMessage = `Bonjour ${name}, votre candidature livreur DELIKREOL est enregistrée. Pour poursuivre l’activation, merci de confirmer votre identité, votre moyen de transport, vos zones, vos disponibilités, votre assurance et vos documents. Aucun paiement ne vous sera demandé par WhatsApp. Espace : https://delikreol.com/espace-livreur`;

 return (
 <tr key={item.id} className="hover:bg-muted/10 align-top">
 <td className="px-4 py-3 text-sm font-semibold">{name}</td>
 <td className="px-4 py-3 text-sm">{item.commune ||'—'}</td>
 <td className="px-4 py-3 text-sm">{transport}</td>
 <td className="px-4 py-3 text-sm">
 <div className="space-y-1">
 {contactNumber ? <a className="block text-green-700 hover:underline" href={`https://wa.me/${contactNumber}?text=${encodeURIComponent(activationMessage)}`} target="_blank" rel="noopener noreferrer">Continuer sur WhatsApp · {phone}</a> :'—'}
 {item.email && <a className="block text-primary hover:underline" href={`mailto:${item.email}`}>{item.email}</a>}
 </div>
 </td>
 <td className="px-4 py-3 text-xs max-w-xs">{Array.isArray(zones) && zones.length ? zones.join(',') :'—'}</td>
 <td className="px-4 py-3 text-sm">{formatDate(created)}</td>
 <td className="px-4 py-3 text-sm">
 <select
 value={normalizeStatus(item.status)}
 onChange={(e) => void updateStatus(item.id, e.target.value)}
 disabled={updatingId === item.id}
 className="rounded-full border border-input bg-muted px-2 py-1 text-xs font-bold text-muted-foreground"
 >
 <option value="candidat">Candidat</option>
 <option value="a_appeler">À appeler</option>
 <option value="documents">Documents</option>
 <option value="valide">Validé</option>
 <option value="suspendu">Suspendu</option>
 <option value="inactif">Inactif</option>
 </select>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}

export default AdminLivreurs;
