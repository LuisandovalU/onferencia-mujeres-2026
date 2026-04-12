import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { generateAndUploadTicket } from '../../../lib/ticket-generator';
import crypto from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre, whatsapp, email, es_brave, es_casa, referido_por, monto_pagado, metodo_pago, password } = body;

    // 1. Validar Password
    if (password !== import.meta.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Contraseña de administrador incorrecta' }), { status: 401 });
    }

    if (!nombre || !whatsapp) {
      return new Response(JSON.stringify({ error: 'Nombre y WhatsApp son obligatorios' }), { status: 400 });
    }

    const totalACobrar = 130;
    const pagado = Number(monto_pagado) || 0;
    const estaPagadoCompletamente = pagado >= totalACobrar;

    // 2. Insertar en Supabase
    const { getMXTimestamp } = await import('../../../lib/date-utils');
    const { data: asistente, error: insertError } = await supabase
      .from('asistentes')
      .insert([{
        nombre_completo: nombre,
        whatsapp: whatsapp,
        email: email || null,
        es_brave: es_brave === true,
        es_casa: es_casa === true,
        referido_por: referido_por || 'N/A',
        monto_total: totalACobrar,
        monto_pagado: pagado,
        metodo_pago: metodo_pago || 'efectivo',
        status_pago: estaPagadoCompletamente ? 'completado' : 'pendiente',
        created_at: getMXTimestamp()
      }])
      .select()
      .single();



    if (insertError || !asistente) {
      console.error('Manual Register Error:', insertError);
      return new Response(JSON.stringify({ error: 'Error al guardar en la base de datos' }), { status: 500 });
    }

    // 3. Generar Ticket SOLO si ya pagó todo
    if (estaPagadoCompletamente) {
      try {
        await generateAndUploadTicket({
          asistenteId: asistente.id,
          nombre_completo: asistente.nombre_completo,
          folio: asistente.folio,
          es_brave: asistente.es_brave,
          fileName: asistente.id // Usamos su ID de base de datos como nombre de archivo
        });

        return new Response(JSON.stringify({ 
          success: true, 
          asistente,
          ticketUrl: `/api/download-ticket?id=${asistente.id}`
        }), { status: 201 });

      } catch (ticketErr) {
        console.error('Error generando ticket:', ticketErr);
        return new Response(JSON.stringify({ 
          success: true, 
          asistente,
          warning: 'Pagado, pero error al generar imagen.'
        }), { status: 201 });
      }
    }

    // Si no pagó todo, retornamos éxito pero sin ticketUrl
    return new Response(JSON.stringify({ 
      success: true, 
      asistente,
      mensaje: `Registrado con saldo pendiente: $${totalACobrar - pagado}`
    }), { status: 201 });


  } catch (error: any) {
    console.error('API Manual Register Catch:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
