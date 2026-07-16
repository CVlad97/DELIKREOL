import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CookiePreferences, DEFAULT_PREFS, loadCookiePrefs, saveCookiePrefs } from '../services/privacy';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const saved = loadCookiePrefs();
    setVisible(!saved.hasMadeChoice);
    setPrefs(saved);
  }, []);

  const acceptAll = () => {
    const all: CookiePreferences = { necessary: true, geolocation: true, analytics: true, marketing: true, hasMadeChoice: true };
    saveCookiePrefs(all);
    setPrefs(all);
    setVisible(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = { ...DEFAULT_PREFS, hasMadeChoice: true };
    saveCookiePrefs(necessaryOnly);
    setPrefs(necessaryOnly);
    setVisible(false);
  };

  const saveCustom = () => {
    saveCookiePrefs({ ...prefs, necessary: true, hasMadeChoice: true });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-0 bottom-0 z-[100] p-2 sm:p-3" aria-label="Préférences de confidentialité">
      <div className="mx-auto max-w-xl rounded-2xl border border-primary/20 bg-white p-3 shadow-2xl sm:p-4">
        <div className="flex items-start gap-3">
          <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg sm:flex" aria-hidden="true">🍪</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-foreground sm:text-base">Vos préférences de confidentialité</h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">
              Les cookies nécessaires font fonctionner le panier. La géolocalisation, les statistiques et le marketing restent optionnels.
            </p>
            <Link to="/cookies" className="inline-flex min-h-7 items-center text-xs font-bold text-primary underline-offset-2 hover:underline">
              En savoir plus
            </Link>
          </div>
        </div>

        {showDetails && (
          <div className="mt-2 grid gap-2 rounded-2xl bg-muted/60 p-3 sm:grid-cols-2">
            <label className="flex min-h-10 items-center gap-2 text-sm font-semibold text-foreground"><input type="checkbox" checked disabled className="h-5 w-5 accent-primary" /> Nécessaires</label>
            <label className="flex min-h-10 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={prefs.geolocation} onChange={event => setPrefs(current => ({ ...current, geolocation: event.target.checked }))} className="h-5 w-5 accent-primary" />
              Géolocalisation
            </label>
            <label className="flex min-h-10 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={prefs.analytics} onChange={event => setPrefs(current => ({ ...current, analytics: event.target.checked }))} className="h-5 w-5 accent-primary" />
              Statistiques
            </label>
            <label className="flex min-h-10 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={prefs.marketing} onChange={event => setPrefs(current => ({ ...current, marketing: event.target.checked }))} className="h-5 w-5 accent-primary" />
              Marketing
            </label>
          </div>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_1fr]">
          <button type="button" onClick={() => setShowDetails(value => !value)} className="min-h-10 rounded-xl px-3 text-sm font-bold text-primary hover:bg-primary/5">
            {showDetails ? 'Masquer' : 'Personnaliser'}
          </button>
          {showDetails ? (
            <button type="button" onClick={saveCustom} className="min-h-10 rounded-xl border border-input bg-white px-4 text-sm font-bold text-foreground hover:bg-muted">
              Enregistrer mes choix
            </button>
          ) : (
            <button type="button" onClick={acceptNecessary} className="min-h-10 rounded-xl border border-input bg-white px-4 text-sm font-bold text-foreground hover:bg-muted">
              Refuser les optionnels
            </button>
          )}
          <button type="button" onClick={acceptAll} className="min-h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary">
            Tout accepter
          </button>
        </div>
      </div>
    </aside>
  );
}
