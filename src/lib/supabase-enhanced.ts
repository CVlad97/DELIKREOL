import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

/**
 * Configuration Supabase avec gestion d'erreurs robuste
 */

// Valeurs par défaut pour éviter les erreurs au build
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérification des variables d'environnement
const isMissingConfig = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (isMissingConfig && import.meta.env.MODE === 'production') {
  console.error('❌ Configuration Supabase manquante en production!');
  console.error('Vérifiez vos variables d\'environnement: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Options de configuration Supabase
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'delikreol-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

/**
 * Client Supabase principal
 */
export const supabase: SupabaseClient<Database> = isMissingConfig
  ? (null as any) // Retourner null si config manquante (évite crash au build)
  : createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);

/**
 * Wrapper pour les requêtes Supabase avec gestion d'erreurs
 */
export async function supabaseQuery<T>(
  queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  // Vérifier configuration
  if (isMissingConfig) {
    return {
      data: null,
      error: 'Configuration Supabase manquante. Vérifiez vos variables d\'environnement.',
    };
  }

  try {
    const { data, error } = await queryFn(supabase);

    if (error) {
      console.error('Supabase query error:', error);
      return {
        data: null,
        error: error.message || 'Une erreur est survenue lors de la requête.',
      };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Supabase unexpected error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Erreur réseau ou timeout.',
    };
  }
}

/**
 * Wrapper pour les mutations Supabase (insert, update, delete)
 */
export async function supabaseMutation<T>(
  mutationFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null; success: boolean }> {
  const { data, error } = await supabaseQuery(mutationFn);

  return {
    data,
    error,
    success: !error,
  };
}

/**
 * Vérifier la santé de la connexion Supabase
 */
export async function checkSupabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  latency?: number;
}> {
  if (isMissingConfig) {
    return {
      healthy: false,
      message: 'Configuration Supabase manquante',
    };
  }

  const start = Date.now();

  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    const latency = Date.now() - start;

    if (error) {
      return {
        healthy: false,
        message: `Erreur de connexion: ${error.message}`,
        latency,
      };
    }

    return {
      healthy: true,
      message: 'Connexion Supabase OK',
      latency,
    };
  } catch (err) {
    const latency = Date.now() - start;
    return {
      healthy: false,
      message: 'Impossible de se connecter à Supabase',
      latency,
    };
  }
}

/**
 * Helper pour gérer les erreurs RLS (Row Level Security)
 */
export function handleRLSError(error: any): string {
  if (error?.code === '42501' || error?.message?.includes('permission denied')) {
    return 'Vous n\'avez pas les permissions pour effectuer cette action.';
  }

  if (error?.code === 'PGRST116') {
    return 'Aucun résultat trouvé.';
  }

  if (error?.message?.includes('timeout')) {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }

  return error?.message || 'Une erreur est survenue.';
}

/**
 * Export du client Supabase et helpers
 */
export default supabase;

export {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isMissingConfig as isSupabaseConfigured,
};
