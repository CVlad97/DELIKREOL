import { useState } from 'react';
import {
  X, ShoppingBag, Store, Truck, MapPin, Shield, Eye,
  Info, Zap,
} from 'lucide-react';
import { SimulationProvider, useSimulation } from '../simulation/SimulationContext';
import { ClientView } from '../simulation/ClientView';
import { VendorView } from '../simulation/VendorView';
import { DriverView } from '../simulation/DriverView';
import { RelayView } from '../simulation/RelayView';
import { AdminView } from '../simulation/AdminView';

type DemoRole = 'client' | 'vendor' | 'driver' | 'relay' | 'admin';

const roles: { id: DemoRole; label: string; icon: typeof ShoppingBag; desc: string }[] = [
  { id: 'client', label: 'Client', icon: ShoppingBag, desc: 'Passer commande' },
  { id: 'vendor', label: 'Vendeur', icon: Store, desc: 'Gerer commandes' },
  { id: 'driver', label: 'Livreur', icon: Truck, desc: 'Livrer + Navigation' },
  { id: 'relay', label: 'Relais', icon: MapPin, desc: 'Capacite + Froid' },
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Vue globale' },
];

const roleViews: Record<DemoRole, () => JSX.Element> = {
  client: ClientView,
  vendor: VendorView,
  driver: DriverView,
  relay: RelayView,
  admin: AdminView,
};

function SimulationGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-card rounded-3xl border-2 border-primary/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-black text-foreground">Guide de simulation</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {[
          { step: 1, role: 'Client', action: 'Selectionnez des produits et passez une commande (domicile, relais, ou retrait)' },
          { step: 2, role: 'Vendeur', action: 'Acceptez et preparez la commande' },
          { step: 3, role: 'Livreur', action: 'Acceptez la course, recuperez le colis, utilisez Waze/Google Maps pour naviguer, partagez via WhatsApp' },
          { step: 4, role: 'Relais', action: 'Suivez la capacite de stockage et la chaine du froid pour les produits frais' },
          { step: 5, role: 'Client', action: 'Si point relais: confirmez le retrait. Suivez la livraison en temps reel' },
          { step: 6, role: 'Admin', action: 'Supervisez tout le flux en temps reel' },
        ].map(s => (
          <div key={s.step} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs flex-shrink-0">
              {s.step}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">{s.role}</span>
              <p className="text-xs text-muted-foreground">{s.action}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
        <p className="text-xs text-sky-700 font-bold">Les donnees sont partagees entre tous les onglets. Passez d'un role a l'autre pour voir le flux complet.</p>
      </div>
    </div>
  );
}

function NotificationBadge({ role }: { role: DemoRole }) {
  const { notifications, orders } = useSimulation();
  const count = role === 'vendor'
    ? orders.filter(o => o.status === 'pending').length
    : role === 'driver'
      ? orders.filter(o => o.status === 'ready' && !o.assignedDriverId).length
      : role === 'relay'
        ? orders.filter(o => o.status === 'at_relay' || (o.assignedRelayId && ['ready', 'picked_up', 'in_transit'].includes(o.status))).length
        : role === 'admin'
          ? notifications.filter(n => n.role === 'admin').length > 0 ? 1 : 0
          : 0;

  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
      {Math.min(count, 9)}
    </span>
  );
}

function DemoContent({ onExit }: { onExit: () => void }) {
  const [activeRole, setActiveRole] = useState<DemoRole>('client');
  const [showGuide, setShowGuide] = useState(true);
  const RoleView = roleViews[activeRole];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-secondary" />
              <span className="font-black text-sm uppercase tracking-widest">Simulation Interactive</span>
            </div>
            <span className="text-xs opacity-40 hidden sm:inline">Test complet du flux de commande</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1 px-3 py-1.5 bg-background/10 hover:bg-background/20 rounded-lg font-bold text-xs transition-all"
            >
              <Info className="w-3 h-3" />
              <span className="hidden sm:inline">Guide</span>
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-xl font-bold text-sm transition-all"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roles.map(role => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-elegant'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{role.label}</span>
                  <span className="text-[10px] opacity-60 hidden md:inline">{role.desc}</span>
                  {!isActive && <NotificationBadge role={role.id} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {showGuide && <SimulationGuide onClose={() => setShowGuide(false)} />}
        <div className="animate-fadeIn">
          <RoleView />
        </div>
      </div>
    </div>
  );
}

export default function DemoMode({ onExit }: { onExit: () => void }) {
  return (
    <SimulationProvider>
      <DemoContent onExit={onExit} />
    </SimulationProvider>
  );
}
