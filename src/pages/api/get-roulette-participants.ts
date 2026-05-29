export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Solo traemos a los que ya hicieron check-in y que son de VALIENTE
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('folio, nombre_completo')
      .eq('asistio', true)
      .eq('es_brave', false)
      .not('folio', 'is', null);

    if (error) {
      console.error('[get-roulette] Error Supabase:', error);
      return new Response(JSON.stringify({ error: 'Error al consultar datos' }), { status: 500 });
    }

    if (!asistentes || asistentes.length === 0) {
      return new Response(JSON.stringify({ participants: [] }), { status: 200 });
    }

    // Devolver array de objetos únicos por folio
    const foliosMap = new Map();
    asistentes.forEach(a => {
      if (!foliosMap.has(a.folio)) {
        foliosMap.set(a.folio, {
          folio: a.folio,
          nombre: a.nombre_completo || 'Desconocido'
        });
      }
    });

    const folios = Array.from(foliosMap.values()).sort((a, b) => Number(a.folio) - Number(b.folio));

    return new Response(JSON.stringify({ participants: folios }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('[get-roulette] Error inesperado:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
