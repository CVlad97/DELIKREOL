import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'kr', label: 'KR' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
      <Languages className="w-3.5 h-3.5 ml-2 text-gray-400 shrink-0" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => {
            i18n.changeLanguage(lang.code);
            localStorage.setItem('delikreol_lang', lang.code);
          }}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            current === lang.code
              ? 'bg-primary text-white'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
          aria-label={lang.label}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}