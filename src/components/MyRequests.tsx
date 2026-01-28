import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Inbox } from 'lucide-react';
import { blink } from '../lib/blink';
import { useAuth } from '../contexts/AuthContext';

interface ClientRequest {
  id: string;
  address: string;
  deliveryPreference: string;
  requestDetails: string;
  preferredTime: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
}

export function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const data = await blink.db.clientRequests.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      }) as ClientRequest[];

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return <Clock className="w-5 h-5" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-[2rem] p-10 border border-border">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-xl w-1/3"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-[2rem] p-16 border-2 border-dashed border-border text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
          <Inbox className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tighter text-foreground/60">Aucune demande</h3>
          <p className="text-muted-foreground font-medium">Vous n'avez pas encore sollicité notre conciergerie.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="group bg-card rounded-[2.5rem] border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-elegant overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {getStatusLabel(request.status)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                  {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <MapPin className="w-3 h-3 text-secondary" />
                      Lieu
                    </div>
                    <p className="text-sm font-bold text-foreground line-clamp-1">{request.address}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Clock className="w-3 h-3 text-primary" />
                      Créneau
                    </div>
                    <p className="text-sm font-bold text-foreground capitalize">{request.preferredTime}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Package className="w-3 h-3 text-accent" />
                    Détails
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-2xl italic">
                    "{request.requestDetails}"
                  </p>
                </div>
              </div>

              {request.adminNotes && (
                <div className="p-5 bg-accent/5 border border-accent/10 rounded-2xl animate-fadeIn">
                  <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-[10px] mb-2">
                    <CheckCircle className="w-4 h-4" />
                    Réponse de l'équipe
                  </div>
                  <p className="text-sm font-bold text-foreground leading-relaxed">{request.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
