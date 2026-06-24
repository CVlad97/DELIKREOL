import { Link } from 'react-router-dom';

export function BrandRibbon() {
  return (
    <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 sm:justify-start">
        <Link to="/" className="inline-flex items-center gap-3 rounded-2xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-orange-100">
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
      </div>
    </div>
  );
}

export default BrandRibbon;
