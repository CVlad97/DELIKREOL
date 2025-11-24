import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count?: number;
  onClick: () => void;
}

export function CategoryCard({ name, icon: Icon, count, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition-all group text-center"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/30 transition-colors">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="font-semibold text-slate-50 mb-1">{name}</h3>
      {count !== undefined && (
        <p className="text-xs text-slate-400">{count} produits</p>
      )}
    </button>
  );
}
