import { Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MenuOptions, MenuSelection } from '../types/menu';

interface Props {
  productName: string;
  options: MenuOptions;
  onCancel: () => void;
  onConfirm: (selection: MenuSelection) => void;
}

function ChoiceGroup({ title, choices, required, selected, onToggle }: {
  title: string;
  choices: string[];
  required: number;
  selected: string[];
  onToggle: (choice: string) => void;
}) {
  if (choices.length === 0) return null;
  const label = required > 0 ? `${required} choix` : 'optionnel';
  return (
    <fieldset className="space-y-3">
      <legend className="font-black text-foreground">{title} <span className="text-sm font-medium text-muted-foreground">— {label}</span></legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const checked = selected.includes(choice);
          const disabled = required > 0 && !checked && selected.length >= required;
          return (
            <label key={choice} className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 font-semibold transition ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary/50'}`}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(choice)} className="h-5 w-5 accent-primary" />
              {choice}
              {checked && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function MenuCompositionModal({ productName, options, onCancel, onConfirm }: Props) {
  const [sides, setSides] = useState<string[]>([]);
  const [drinks, setDrinks] = useState<string[]>([]);
  const [sauces, setSauces] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const valid = useMemo(() => (
    sides.length === options.included_side_count &&
    drinks.length === options.included_drink_count &&
    sauces.length === options.included_sauce_count
  ), [drinks.length, options.included_drink_count, options.included_sauce_count, options.included_side_count, sauces.length, sides.length]);
  const toggle = (value: string, selected: string[], setSelected: (next: string[]) => void, limit: number) => {
    if (selected.includes(value)) setSelected(selected.filter((item) => item !== value));
    else if (limit === 0 || selected.length < limit) setSelected([...selected, value]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="menu-composition-title">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-widest text-primary">Composez votre menu</p><h2 id="menu-composition-title" className="mt-1 text-2xl font-black">{productName}</h2></div>
          <button type="button" onClick={onCancel} className="rounded-full p-2 hover:bg-muted" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 space-y-6">
          <ChoiceGroup title="Accompagnements" choices={options.sides} required={options.included_side_count} selected={sides} onToggle={(value) => toggle(value, sides, setSides, options.included_side_count)} />
          <ChoiceGroup title="Boissons" choices={options.drinks} required={options.included_drink_count} selected={drinks} onToggle={(value) => toggle(value, drinks, setDrinks, options.included_drink_count)} />
          <ChoiceGroup title="Sauces" choices={options.sauces} required={options.included_sauce_count} selected={sauces} onToggle={(value) => toggle(value, sauces, setSauces, options.included_sauce_count)} />
          {options.instructions_enabled !== false && (
            <label className="block space-y-2">
              <span className="font-black text-foreground">Consigne cuisine <span className="text-sm font-medium text-muted-foreground">— optionnel</span></span>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value.slice(0, 240))}
                rows={3}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ex : sans piment, sauce à part, cuisson bien cuit..."
              />
            </label>
          )}
        </div>
        {!valid && <p className="mt-5 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">Sélectionnez exactement les accompagnements, boissons et sauces inclus pour continuer.</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-border font-bold">Annuler</button>
          <button type="button" disabled={!valid} onClick={() => onConfirm({ sides, drinks, sauces, instructions: instructions.trim().slice(0, 240) || undefined })} className="min-h-12 rounded-xl bg-primary px-4 font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">Ajouter au panier</button>
        </div>
      </div>
    </div>
  );
}
