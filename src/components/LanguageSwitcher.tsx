import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'kr', label: 'KR' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'fr';

  return (
    <label className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-input bg-white px-1.5 text-muted-foreground shadow-sm sm:px-2">
      <Languages className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
      <span className="sr-only">Langue du site</span>
      <select
        value={LANGUAGES.some((language) => language.code === current) ? current : 'fr'}
        onChange={(event) => {
          i18n.changeLanguage(event.target.value);
          localStorage.setItem('delikreol_lang', event.target.value);
        }}
        className="min-h-8 w-[3.25rem] cursor-pointer border-0 bg-transparent px-1 text-xs font-bold text-foreground outline-none sm:w-[3.75rem]"
        aria-label="Choisir la langue"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>{language.label}</option>
        ))}
      </select>
    </label>
  );
}
