import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    const adminPass = import.meta.env.ADMIN_PASSWORD || 'Mujeres2026ICI';
    if (password !== adminPass) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('nombre_completo, whatsapp, referido_por, created_at');

    if (error || !asistentes) {
      return new Response(JSON.stringify({ error: 'Error al obtener datos' }), { status: 500 });
    }

    return new Response(JSON.stringify({ asistentes }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
