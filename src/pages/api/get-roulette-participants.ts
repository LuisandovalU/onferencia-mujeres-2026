export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Solo traemos a los que ya hicieron check-in
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('folio')
      .eq('asistio', true)
      .not('folio', 'is', null);

    if (error) {
      console.error('[get-roulette] Error Supabase:', error);
      return new Response(JSON.stringify({ error: 'Error al consultar datos' }), { status: 500 });
    }

    if (!asistentes || asistentes.length === 0) {
      return new Response(JSON.stringify({ participants: [] }), { status: 200 });
    }

    // Devolver array de folios únicos
    const folios = Array.from(new Set(asistentes.map(a => a.folio))).sort((a, b) => Number(a) - Number(b));

    return new Response(JSON.stringify({ participants: folios }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('[get-roulette] Error inesperado:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
