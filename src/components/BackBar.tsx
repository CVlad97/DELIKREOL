import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

/**
 * Barre de navigation retour — s'affiche en haut de chaque page.
 * Un enfant doit pouvoir naviguer facilement.
 */
export function BackBar({ label, backTo }: { label?: string; backTo?: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <button
        onClick={() => backTo ? navigate(backTo) : navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-primary/10"
      >
        <ArrowLeft className="w-4 h-4" />
        {label || 'Retour'}
      </button>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-primary/10"
      >
        <Home className="w-3.5 h-3.5" />
        Accueil
      </Link>
    </div>
  );
}