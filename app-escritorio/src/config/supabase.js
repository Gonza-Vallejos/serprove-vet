import { createClient } from '@supabase/supabase-js';

// Usamos las credenciales del proyecto Serprove Vet
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rbdhmztwczgozrkqmfoj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZGhtenR3Y3pnb3pya3FtZm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1OTMwMjQsImV4cCI6MjEwNzE2OTAyNH0.9M5pTFuot4HBCjsy3kgU6suUuXfEBKBBdSqxf7pKpOE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
