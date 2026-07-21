import { supabase, isSupabaseConfigured } from './supabase';

export const isPublicSupabaseConfigured = isSupabaseConfigured;
export const publicSupabase = isSupabaseConfigured ? supabase : null;
