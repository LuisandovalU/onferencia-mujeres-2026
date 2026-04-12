export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { emailOrWhatsapp } = await request.json();

    if (!emailOrWhatsapp) {
      return new Response(JSON.stringify({ error: 'Ingresa un dato para buscar' }), { status: 400 });
    }

    const query = supabase
      .from('asistentes')
      .select('id, nombre_completo, status_pago, folio, stripe_session_id')
      .or(`email.eq.${emailOrWhatsapp},whatsapp.eq.${emailOrWhatsapp}`)
      .eq('status_pago', 'completado')
      .limit(1);

    const { data: results, error } = await query;

    if (error || !results || results.length === 0) {
      return new Response(JSON.stringify({ error: 'Boleto no encontrado o aún pendiente de pago' }), { status: 404 });
    }

    const asistente = results[0];
    const ticketUrl = `/api/download-ticket?id=${asistente.id}`;

    return new Response(JSON.stringify({ 
      success: true, 
      nombre: asistente.nombre_completo,
      ticketUrl 
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Error de servidor' }), { status: 500 });
  }
};
