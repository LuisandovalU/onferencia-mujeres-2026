import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query, password } = await request.json();

    // 1. Validar Password
    if (password !== import.meta.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Contraseña de administrador incorrecta' }), { status: 401 });
    }

    if (!query) {
      return new Response(JSON.stringify({ results: [] }), { status: 200 });
    }

    // 2. Buscar en Supabase usando service_role (vía backend client)
    // Usamos el formato de postgrest para el filtro .or()
    const { data, error } = await supabase
      .from('asistentes')
      .select('*')
      .or(`nombre_completo.ilike.*${query}*,whatsapp.ilike.*${query}*,email.ilike.*${query}*`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Search API Error:', error);
      return new Response(JSON.stringify({ error: 'Error al buscar en la base de datos' }), { status: 500 });
    }

    return new Response(JSON.stringify({ results: data }), { status: 200 });

  } catch (error: any) {
    console.error('API Search Catch:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
