import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  loadCookiePrefs,
  saveCookiePrefs,
  type CookiePreferences,
  DEFAULT_PREFS,
} from '../services/privacy';

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
    const all: CookiePreferences = {
      necessary: true,
      geolocation: true,
      analytics: true,
      marketing: true,
      hasMadeChoice: true,
    };
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
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
        className="mx-auto max-w-3xl rounded-3xl border border-border bg-white/98 p-4 shadow-2xl backdrop-blur-xl sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="cookie-title" className="text-base font-black text-foreground">
              Vos préférences de confidentialité
            </h2>
            <p id="cookie-description" className="mt-1 text-sm leading-6 text-muted-foreground">
              Les cookies nécessaires font fonctionner le panier. Avec votre accord, la géolocalisation et la mesure d’audience améliorent le service.
              {' '}
              <Link to="/confidentialite" className="font-bold text-primary underline underline-offset-2">
                En savoir plus
              </Link>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 grid gap-2 rounded-2xl border border-border bg-muted/40 p-3 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground">
              <input type="checkbox" checked disabled className="h-4 w-4 accent-primary" />
              Nécessaires — toujours actifs
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={prefs.geolocation}
                onChange={(event) => setPrefs((current) => ({ ...current, geolocation: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Géolocalisation
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(event) => setPrefs((current) => ({ ...current, analytics: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Mesure d’audience
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(event) => setPrefs((current) => ({ ...current, marketing: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Offres personnalisées
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="min-h-11 rounded-xl px-4 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-expanded={showDetails}
          >
            {showDetails ? 'Masquer les réglages' : 'Personnaliser'}
          </button>
          <button
            type="button"
            onClick={acceptNecessary}
            className="min-h-11 rounded-xl border border-border bg-white px-4 text-sm font-black text-foreground transition-colors hover:border-primary/35"
          >
            Continuer sans optionnel
          </button>
          {showDetails && (
            <button
              type="button"
              onClick={saveCustom}
              className="min-h-11 rounded-xl bg-foreground px-4 text-sm font-black text-background transition-colors hover:bg-primary"
            >
              Enregistrer mes choix
            </button>
          )}
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Tout accepter
          </button>
        </div>
      </section>
    </div>
  );
}
