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
      className="group bg-card border-2 border-border/50 rounded-3xl p-8 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-elegant text-center flex flex-col items-center gap-4 active:scale-95"
    >
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:rotate-6 transition-all duration-500">
        <Icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="space-y-1">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm group-hover:text-primary transition-colors">{name}</h3>
        {count !== undefined && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">{count} pépites</p>
        )}
      </div>
    </button>
  );
}
