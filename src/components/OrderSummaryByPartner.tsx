import { useMemo } from 'react';
import { Store, Package } from 'lucide-react';
import type { Product } from '../lib/supabase';

interface CartItem extends Product {
  quantity: number;
}

interface PartnerGroup {
  key: string;
  name: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface OrderSummaryByPartnerProps {
  items: CartItem[];
  /** Optional minimum order amount per partner, keyed by partner name/id. */
  minOrderByPartner?: Record<string, number>;
  /** Default minimum order amount applied when a partner has no explicit value. */
  defaultMinOrder?: number;
}

/**
 * Resolve a human-readable partner label from a cart item.
 * Falls back gracefully across the vendor relation, vendor_id, then a generic label.
 */
function resolvePartner(item: CartItem): { key: string; name: string } {
  const name = item.vendor?.business_name?.trim();
  if (name) return { key: name, name };
  if (item.vendor_id?.trim()) return { key: item.vendor_id, name: item.vendor_id };
  return { key: '__unknown__', name: 'Partenaire à préciser' };
}

/**
 * Group cart items by partner (traiteur) and compute per-partner subtotals.
 * Pure helper — exported for reuse in the WhatsApp message builder and tests.
 */
export function groupItemsByPartner(items: CartItem[]): PartnerGroup[] {
  const map = new Map<string, PartnerGroup>();
  for (const item of items) {
    const { key, name } = resolvePartner(item);
    const existing = map.get(key);
    const lineTotal = item.price * item.quantity;
    if (existing) {
      existing.items.push(item);
      existing.subtotal += lineTotal;
      existing.itemCount += item.quantity;
    } else {
      map.set(key, {
        key,
        name,
        items: [item],
        subtotal: lineTotal,
        itemCount: item.quantity,
      });
    }
  }
  // Stable alphabetical order by partner name for a predictable display.
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function formatEuro(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

/**
 * Récapitulatif de commande groupé par partenaire.
 * Affiche, pour chaque traiteur, la liste des articles, le nombre d'articles
 * et le sous-total. Met en évidence les commandes sous le minimum requis.
 */
export function OrderSummaryByPartner({
  items,
  minOrderByPartner = {},
  defaultMinOrder = 0,
}: OrderSummaryByPartnerProps) {
  const groups = useMemo(() => groupItemsByPartner(items), [items]);

  if (groups.length === 0) return null;

  const isMultiPartner = groups.length > 1;

  return (
    <div className="bg-card rounded-2xl border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" aria-hidden="true" />
          Récapitulatif par partenaire
        </h2>
        {isMultiPartner && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {groups.length} partenaires
          </span>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const minOrder = minOrderByPartner[group.key] ?? defaultMinOrder;
          const belowMin = minOrder > 0 && group.subtotal < minOrder;
          return (
            <div
              key={group.key}
              className="rounded-xl border border-border-subtle overflow-hidden"
            >
              {/* Partner header */}
              <div className="flex items-center justify-between gap-2 bg-muted/60 px-4 py-2.5">
                <span className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <Store className="w-4 h-4 text-primary" aria-hidden="true" />
                  {group.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {group.itemCount} {group.itemCount === 1 ? 'article' : 'articles'}
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y divide-border-subtle">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                  >
                    <span className="text-foreground truncate">
                      <span className="text-muted-foreground">{item.quantity}×</span> {item.name}
                    </span>
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      {formatEuro(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Partner subtotal */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30">
                <span className="text-sm font-bold text-foreground">Sous-total partenaire</span>
                <span className="text-sm font-black text-primary">
                  {formatEuro(group.subtotal)}
                </span>
              </div>

              {/* Below-minimum warning */}
              {belowMin && (
                <div className="px-4 py-2 text-xs text-secondary bg-secondary/10 border-t border-secondary/25">
                  Minimum de commande chez ce partenaire : {formatEuro(minOrder)}. Ajoutez{' '}
                  {formatEuro(minOrder - group.subtotal)} pour valider.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isMultiPartner && (
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
          Votre panier contient des articles de plusieurs partenaires. Chaque partenaire
          prépare et confirme sa propre commande.
        </p>
      )}
    </div>
  );
}
