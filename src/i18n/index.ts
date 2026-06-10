import { fr } from './fr';
import { kr } from './kr';
import { en } from './en';

export type Lang = 'fr' | 'kr' | 'en';

export const translations: Record<Lang, typeof fr> = { fr, kr, en };
export const LANG_NAMES: Record<Lang, string> = { fr: 'FR', kr: 'KR', en: 'EN' };

export const DEFAULT_LANG: Lang = 'fr';

export function t(lang: Lang, path: string): string {
  const keys = path.split('.');
  let value: any = translations[lang];
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }
  return typeof value === 'string' ? value : path;
}