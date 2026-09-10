import { Plus, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ProductThumbnail } from './ProductThumbnail';
import { formatEuro, traiteurSpaces } from '../data/traiteurs';
import { normalizeMenuOptions, type MenuSelection } from '../types/menu';

interface ProductCardProps {
  product: Product;
}

function normalizeVendor(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findPartnerImage(vendorName?: string | null): string | null {
  if (!vendorName) return null;
  const normalized = normalizeVendor(vendorName);
  const space = traiteurSpaces.find((item) => normalizeVendor(item.name) === normalized);
  return space?.heroImage || space?.galleryImages?.[0] || space?.portraitImage || null;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [showSim, setShowSim] = useState(false);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const vendorLabel = product.vendor?.business_name ?? (product.vendor_id ? 'Vendeur local' : null);
  const isAvailable = product.is_available !== false;
  const partnerImage = findPartnerImage(vendorLabel);
  const menuOptions = useMemo(() => normalizeMenuOptions(product.menu_options), [product.menu_options]);

  const menuComplete = !menuOptions || (
    selectedSides.length === menuOptions.included_side_count &&
    selectedDrinks.length === menuOptions.included_drink_count
  );

  const toggleChoice = (
    value: string,
    current: string[],
    max: number,
    setter: (values: string[]) => void,
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }
    if (current.length >= max) return;
    setter([...current, value]);
  };

  const addConfiguredProduct = () => {
    if (!menuComplete) return;
    const selection: MenuSelection | undefined = menuOptions
      ? { sides: selectedSides, drinks: selectedDrinks }
      : undefined;
    addItem(product, selection);
    showSuccess('Ajouté au panier');
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <ProductThumbnail
        src={product.image_url}
        partnerImage={partnerImage}
        productName={product.name}
        vendorName={vendorLabel}
        category={product.category}
        aspectRatio="4 / 3"
        containerClassName="w-full bg-muted"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        showBadge
      />

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold text-foreground">{product.name}</h3>
          {vendorLabel && (
            <div className="text-xs text-muted-foreground">{vendorLabel}</div>
          )}
        </div>

        {menuOptions && (menuOptions.sides.length > 0 || menuOptions.drinks.length > 0) && (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
            {menuOptions.sides.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-foreground">
                  Accompagnements — choisissez {menuOptions.included_side_count}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {menuOptions.sides.map((side) => {
                    const checked = selectedSides.includes(side);
                    const disabled = !checked && selectedSides.length >= menuOptions.included_side_count;
                    return (
                      <label key={side} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleChoice(side, selectedSides, menuOptions.included_side_count, setSelectedSides)}
                        />
                        <span>{side}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {menuOptions.drinks.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-foreground">
                  Boissons — choisissez {menuOptions.included_drink_count}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {menuOptions.drinks.map((drink) => {
                    const checked = selectedDrinks.includes(drink);
                    const disabled = !checked && selectedDrinks.length >= menuOptions.included_drink_count;
                    return (
                      <label key={drink} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleChoice(drink, selectedDrinks, menuOptions.included_drink_count, setSelectedDrinks)}
                        />
                        <span>{drink}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {!menuComplete && (
              <div className="text-xs font-semibold text-destructive">
                Complétez la composition avant d'ajouter au panier.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-black text-foreground">
            {formatEuro(product.price)}
          </div>
          <button
            type="button"
            onClick={addConfiguredProduct}
            disabled={!isAvailable || !menuComplete}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary hover:shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          aria-expanded={showSim}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Délai estimé
        </button>
        {showSim && (
          <div className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Estimation : 25–35 min · Confirmation par le partenaire
          </div>
        )}

        {!isAvailable && (
          <div className="text-xs font-semibold text-destructive">Indisponible pour le moment</div>
        )}
      </div>
    </article>
  );
}
