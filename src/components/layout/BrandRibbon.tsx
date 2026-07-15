import { Link } from 'react-router-dom';
import { Bug } from 'lucide-react';

export function BrandRibbon() {
  return (
    <div className="border-b border-primary/20 bg-gradient-to-r from-primary/[0.08] via-white to-secondary/8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-ring/30 sm:justify-start">
          <img
            src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
            alt="Logo DeliKreol"
            className="h-11 w-11 rounded-xl object-contain"
          />
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-foreground">
              Deli<span className="text-primary">Kreol</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              Le goût local — Martinique
            </div>
          </div>
        </Link>

        <Link
          to="/feedback"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-white/80 px-3 py-2 text-xs font-bold text-primary shadow-sm transition hover:bg-primary/[0.08] hover:text-primary"
          aria-label="Signaler un bug"
          title="Signaler un bug"
        >
          <Bug className="h-4 w-4" />
          Signaler un bug
        </Link>
      </div>
    </div>
  );
}

export default BrandRibbon;
