export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Buscar a los asistentes que tienen asistio=true y están en Valiente (es_brave=false)
    const { data: actuales, error: selectErr } = await supabase
      .from('asistentes')
      .select('id, nombre_completo, folio, es_brave, asistio')
      .eq('asistio', true)
      .eq('es_brave', false);

    if (selectErr) {
       return new Response(`Error select: ${selectErr.message}`);
    }

    // Actualizarlos para que sean de Brave (es_brave=true)
    const { data: actualizados, error: updateErr } = await supabase
      .from('asistentes')
      .update({ es_brave: true })
      .eq('asistio', true)
      .eq('es_brave', false)
      .select();

    if (updateErr) {
       return new Response(`Error update: ${updateErr.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      mensaje: 'Base de datos corregida: Valiente está en 0 checkins, los registros fueron movidos a Brave.', 
      movidosABrave: actualizados
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};
