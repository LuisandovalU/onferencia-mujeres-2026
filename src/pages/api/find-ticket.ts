export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Extrae solo los dígitos de un string (para comparar teléfonos sin formato)
function onlyDigits(str: string): string {
  return str.replace(/\D/g, '');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { emailOrWhatsapp } = await request.json();

    if (!emailOrWhatsapp) {
      return new Response(JSON.stringify({ error: 'Ingresa un dato para buscar' }), { status: 400 });
    }

    // Normalizar: quitar espacios y convertir a minúsculas
    const searchValue = emailOrWhatsapp.trim().toLowerCase();
    const digits = onlyDigits(searchValue);

    // Construir los filtros de búsqueda
    // Para WhatsApp admitimos variantes: con/sin +52, con/sin espacios/guiones
    const orFilters: string[] = [
      `email.ilike.%${searchValue}%`,
      `whatsapp.ilike.%${searchValue}%`,
    ];

    // Si el valor tiene al menos 8 dígitos, buscar también por los últimos 10 dígitos
    if (digits.length >= 8) {
      const last10 = digits.slice(-10); // 10 dígitos locales
      orFilters.push(`whatsapp.ilike.%${last10}%`);
    }

    const { data: results, error } = await supabase
      .from('asistentes')
      .select('id, nombre_completo, status_pago, folio, stripe_session_id')
      .or(orFilters.join(','))
      .eq('status_pago', 'completado')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[find-ticket] Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Error al buscar en la base de datos' }), { status: 500 });
    }

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No encontramos un boleto con ese dato. Verifica que sea el correo o WhatsApp con el que te registraste.' 
      }), { status: 404 });
    }

    // Deduplicar por id (por si los filtros OR devuelven duplicados)
    const seen = new Set<string>();
    const unique = results.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    const tickets = unique.map(asistente => ({
      id: asistente.id,
      nombre: asistente.nombre_completo,
      ticketUrl: `/api/download-ticket?id=${asistente.id}`
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      tickets
    }), { status: 200 });

  } catch (err: any) {
    console.error('[find-ticket] Error inesperado:', err);
    return new Response(JSON.stringify({ error: 'Error de servidor. Intenta de nuevo.' }), { status: 500 });
  }
};
