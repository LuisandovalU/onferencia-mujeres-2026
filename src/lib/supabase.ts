import { createClient } from '@supabase/supabase-js'

// Intentar obtener variables de todas las fuentes posibles (Astro env, process.env de Node)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase configuration missing in server environment. Check Vercel Environment Variables.");
}

export const supabase = createClient(
  supabaseUrl || 'https://fkifwxauqdjmfjbceypa.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)