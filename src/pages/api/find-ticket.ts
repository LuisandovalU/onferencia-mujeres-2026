export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { emailOrWhatsapp } = await request.json();

    if (!emailOrWhatsapp) {
      return new Response(JSON.stringify({ error: 'Ingresa un dato para buscar' }), { status: 400 });
    }

    // Normalizar: quitar espacios y convertir a minúsculas para búsqueda case-insensitive
    const searchValue = emailOrWhatsapp.trim().toLowerCase();

    const query = supabase
      .from('asistentes')
      .select('id, nombre_completo, status_pago, folio, stripe_session_id')
      .or(`email.ilike.${searchValue},whatsapp.ilike.${searchValue}`)
      .eq('status_pago', 'completado')
      .order('created_at', { ascending: false });

    const { data: results, error } = await query;

    if (error || !results || results.length === 0) {
      return new Response(JSON.stringify({ error: 'Boleto no encontrado o aún pendiente de pago' }), { status: 404 });
    }

    const tickets = results.map(asistente => ({
      id: asistente.id,
      nombre: asistente.nombre_completo,
      ticketUrl: `/api/download-ticket?id=${asistente.id}`
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      tickets
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Error de servidor' }), { status: 500 });
  }
};
