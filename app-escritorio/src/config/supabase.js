import { createClient } from '@supabase/supabase-js';

// Usamos las variables de entorno de Vite (VITE_...)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Modo Offline: No se detectaron credenciales de Supabase en variables de entorno.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

