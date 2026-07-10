import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from '../locales/fr.json';
import kr from '../locales/kr.json';
import en from '../locales/en.json';

const savedLang = typeof window !== 'undefined'
  ? localStorage.getItem('delikreol_lang') || navigator.language.slice(0, 2)
  : 'fr';

const detectedLang = ['fr', 'kr', 'en'].includes(savedLang) ? savedLang : 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    kr: { translation: kr },
    en: { translation: en },
  },
  lng: detectedLang,
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
