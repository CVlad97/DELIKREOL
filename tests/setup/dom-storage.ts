/**
 * Node 25+ (et donc 26) expose un `localStorage` global expérimental, actif
 * seulement avec `--localstorage-file`. Sans ce drapeau il est `undefined`,
 * et il MASQUE celui que jsdom installe : dans les tests, `localStorage.clear()`
 * échoue alors par « Cannot read properties of undefined (reading 'clear') ».
 *
 * Ce fichier rétablit explicitement les objets de `window` (jsdom) sur `globalThis`.
 * Il ne change rien au comportement applicatif : hors test, le navigateur fournit
 * nativement ces objets.
 */

type StorageName = 'localStorage' | 'sessionStorage';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  } as Storage;
}

function restore(name: StorageName): void {
  const fromWindow = (globalThis as unknown as { window?: Record<string, unknown> }).window?.[name] as Storage | undefined;

  let storage: Storage;
  try {
    // jsdom fournit un Storage fonctionnel dès que l'origine n'est pas opaque.
    storage = fromWindow && typeof fromWindow.clear === 'function' ? fromWindow : memoryStorage();
  } catch {
    storage = memoryStorage();
  }

  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value: storage,
  });
}

restore('localStorage');
restore('sessionStorage');
