import { createClient } from '@supabase/supabase-js';

// Usamos las variables de entorno de Vite (VITE_...)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las credenciales de Supabase en el archivo .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
