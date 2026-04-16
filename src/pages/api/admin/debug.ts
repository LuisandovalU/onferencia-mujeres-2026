export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    const { data } = await supabase
      .from('asistentes')
      .select('nombre_completo, metodo_pago, status_pago, monto_pagado, stripe_session_id')
      .ilike('nombre_completo', '%Pacheco%');
      
    const { data: d2 } = await supabase
      .from('asistentes')
      .select('nombre_completo, metodo_pago, status_pago, monto_pagado, stripe_session_id')
      .ilike('nombre_completo', '%Vidaurri%');

    return new Response(JSON.stringify({ Gabriela: data, Mariana: d2 }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};
