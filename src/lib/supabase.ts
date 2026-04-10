import { createClient } from '@supabase/supabase-js'

// Estas son las llaves que pegaste en tu archivo .env
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
// La SERVICE_ROLE_KEY es secreta y solo estará disponible en el servidor (backend)
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing! Check your Vercel Settings.');
}

// Usamos la Service Key si existe (backend) para tener permisos totales, si no, anon key.
const finalKey = (supabaseServiceKey && supabaseServiceKey.length > 20) ? supabaseServiceKey : supabaseAnonKey;

export const supabase = createClient(
  supabaseUrl || 'https://fkifwxauqdjmfjbceypa.supabase.co', 
  finalKey || 'placeholder'
);