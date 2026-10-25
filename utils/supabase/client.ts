import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseGlobal = globalThis as typeof globalThis & {
  __anakaboSupabase?: SupabaseClient;
};

export const supabase = supabaseGlobal.__anakaboSupabase ?? createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

supabaseGlobal.__anakaboSupabase = supabase;
