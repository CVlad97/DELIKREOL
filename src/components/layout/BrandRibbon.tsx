import { Link } from 'react-router-dom';
import { Bug } from 'lucide-react';

export function BrandRibbon() {
  return (
    <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-orange-100 sm:justify-start">
          <img
            src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
            alt="Logo DeliKreol"
            className="h-11 w-11 rounded-xl object-contain"
          />
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight text-gray-900">
              Deli<span className="text-orange-600">Kreol</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500">
              Le goût local — Martinique
            </div>
          </div>
        </Link>

        <Link
          to="/feedback"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-2 text-xs font-bold text-orange-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-800"
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
