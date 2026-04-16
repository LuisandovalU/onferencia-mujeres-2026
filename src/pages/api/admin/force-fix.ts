export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    const { data: toUpdate } = await supabase.from('asistentes').select('id, nombre_completo, metodo_pago').ilike('nombre_completo', '%Gabriela Estela%');
    
    if (!toUpdate || toUpdate.length === 0) {
       return new Response('No se encontró a Gabriela en supabase');
    }

    const { data, error } = await supabase.from('asistentes')
      .update({ 
        status_pago: 'completado', 
        monto_pagado: 130, 
        metodo_pago: 'Stripe Transferencia SPEI' 
      })
      .ilike('nombre_completo', '%Gabriela Estela Pacheco%')
      .select();

    if (error) {
       return new Response(`Error al actualizar DB: ${error.message} (Detalles: ${error.details})`);
    }

    // UPDATE MARIANA TO SPEI FOR TESTING TOO
    const { data: mData, error: mErr } = await supabase.from('asistentes')
      .update({ metodo_pago: 'Stripe Transferencia SPEI' })
      .ilike('nombre_completo', '%Mariana Vidaurri%')
      .select();

    return new Response(JSON.stringify({ 
      success: true, 
      mensaje: 'Base de datos forzada', 
      gabrielasActualizadas: data,
      marianasActualizadas: mData
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};
