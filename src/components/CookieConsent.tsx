import { useState, useEffect } from 'react';
import { loadCookiePrefs, saveCookiePrefs, CookiePreferences, DEFAULT_PREFS, RGPD_NOTICE } from '../services/privacy';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const saved = loadCookiePrefs();
    if (!saved.analytics && !saved.marketing && !saved.geolocation) {
      setVisible(true);
    }
    setPrefs(saved);
  }, []);

  const acceptAll = () => {
    const all: CookiePreferences = { necessary: true, geolocation: true, analytics: true, marketing: true };
    saveCookiePrefs(all);
    setPrefs(all);
    setVisible(false);
  };

  const acceptNecessary = () => {
    saveCookiePrefs(DEFAULT_PREFS);
    setPrefs(DEFAULT_PREFS);
    setVisible(false);
  };

  const saveCustom = () => {
    saveCookiePrefs(prefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-orange-100 p-5">
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{RGPD_NOTICE}</p>
        {showDetails && (
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked disabled className="accent-orange-500" /> Nécessaires (panier)</label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={prefs.geolocation} onChange={e => setPrefs(p => ({ ...p, geolocation: e.target.checked }))} className="accent-orange-500" />
              Géolocalisation
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))} className="accent-orange-500" />
              Analytics (amélioration du service)
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-gray-500 hover:text-gray-700 underline">{showDetails ? 'Masquer' : 'Personnaliser'}</button>
          <button onClick={acceptNecessary} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Refuser les optionnels</button>
          {showDetails && <button onClick={saveCustom} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600">Sauvegarder</button>}
          <button onClick={acceptAll} className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700">Tout accepter</button>
        </div>
      </div>
    </div>
  );
}