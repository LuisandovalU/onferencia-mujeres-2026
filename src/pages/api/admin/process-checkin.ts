export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { rawText, password } = await request.json();

    // 1. Validar Password
    const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
    if (!password || password !== adminPass) {
      return new Response(JSON.stringify({ error: 'No autorizado - Clave incorrecta' }), { status: 401 });
    }

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Código vacío' }), { status: 400 });
    }

    const cleanText = rawText.trim();
    console.log(`📡 API Check-in: Procesando "${cleanText}"`);

    // 2. Identificar el tipo de ID
    let queryField = 'id';
    let queryValue: any = cleanText;

    // Detectar UUID
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const stripeRegex = /cs_(test|live)_[a-zA-Z0-9]+/;
    const phoneRegex = /^\d{10}$/; // 10 digitos

    const uuidMatch = cleanText.match(uuidRegex);
    const stripeMatch = cleanText.match(stripeRegex);

    if (uuidMatch) {
      queryField = 'id';
      queryValue = uuidMatch[0];
    } else if (stripeMatch) {
      queryField = 'stripe_session_id';
      queryValue = stripeMatch[0];
    } else if (phoneRegex.test(cleanText)) {
      queryField = 'whatsapp';
      queryValue = cleanText;
    } else if (/^\d+$/.test(cleanText)) {
      queryField = 'folio';
      queryValue = Number(cleanText);
    } else if (cleanText.length > 3 && !cleanText.includes('http')) {
      // Buscar por nombre
      queryField = 'nombre_completo';
      queryValue = cleanText;
    } else {
      // Intentar extraer de URL si nada de lo anterior funcionó
      try {
        const url = new URL(cleanText);
        const idParam = url.searchParams.get('id');
        if (idParam) {
          if (idParam.startsWith('cs_')) {
            queryField = 'stripe_session_id';
          } else {
            queryField = 'id';
          }
          queryValue = idParam;
        } else {
          return new Response(JSON.stringify({ error: `Código no reconocido: ${cleanText.slice(0, 15)}` }), { status: 400 });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: `Formato inválido: ${cleanText.slice(0, 15)}` }), { status: 400 });
      }
    }

    // 3. Consultar DB (Usando Service Role Key vía supabase.ts)
    let query = supabase.from('asistentes').select('*');
    
    if (queryField === 'nombre_completo') {
       query = query.ilike('nombre_completo', `%${queryValue}%`).order('created_at', { ascending: false }).limit(1);
    } else {
       query = query.eq(queryField, queryValue).order('created_at', { ascending: false }).limit(1);
    }

    const { data: results, error: selectError } = await query;
    const asistente = results?.[0];

    if (selectError || !asistente) {
      return new Response(JSON.stringify({ error: `No encontrado: ${queryValue}` }), { status: 404 });
    }

    // 4. Validar Estados
    if (asistente.asistio) {
      return new Response(JSON.stringify({ 
        message: `YA ESCANEADO - ${asistente.nombre_completo}`,
        type: 'warning',
        asistente 
      }), { status: 200 });
    }

    if (asistente.status_pago !== 'completado') {
      const deuda = (asistente.monto_total || 130) - (asistente.monto_pagado || 0);
      return new Response(JSON.stringify({ 
        message: `PAGO PENDIENTE - ${asistente.nombre_completo} debe $${deuda}`,
        type: 'error',
        asistente 
      }), { status: 200 });
    }

    // 5. Marcar Asistencia
    const { getMXTimestamp } = await import('../../../lib/date-utils');
    const { error: updateError } = await supabase
      .from('asistentes')
      .update({ 
        asistio: true, 
        fecha_checkin: getMXTimestamp() 
      })
      .eq('id', asistente.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Error al actualizar asistencia' }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `¡BIENVENIDA! - ${asistente.nombre_completo}`,
      asistente 
    }), { status: 200 });

  } catch (err: any) {
    console.error('API Check-in Catch Error:', err.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
