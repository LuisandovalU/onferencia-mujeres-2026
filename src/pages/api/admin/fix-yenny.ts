export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { generateAndUploadTicket } from '../../../lib/ticket-generator';

export const GET: APIRoute = async () => {
  try {
    // Buscar a Yenny
    const { data: asistentes, error: fetchError } = await supabase
      .from('asistentes')
      .select('*')
      .ilike('nombre_completo', '%Yenny Johana Alvarado Reyes%');
      
    if (fetchError) return new Response(`Error buscando: ${fetchError.message}`);
    if (!asistentes || asistentes.length === 0) return new Response('No se encontro a Yenny Johana en la base de datos');

    const asistente = asistentes[0];

    // Actualizar pago
    const { data: updated, error: updateError } = await supabase
      .from('asistentes')
      .update({ 
        status_pago: 'completado', 
        monto_pagado: 130, 
        metodo_pago: 'Stripe' 
      })
      .eq('id', asistente.id)
      .select()
      .single();

    if (updateError) return new Response(`Error actualizando: ${updateError.message}`);

    // Generar boleto
    let ticketResult = "Boleto ya existia o no se pudo generar";
    try {
      await generateAndUploadTicket({
        asistenteId: updated.id,
        nombre_completo: updated.nombre_completo,
        folio: updated.folio,
        es_brave: updated.es_brave,
        fileName: updated.id
      });
      
      const ticketUrl = `https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${updated.id}.jpg`;
      
      // Guardar la URL del ticket en la BD
      await supabase.from('asistentes').update({ ticket_url: ticketUrl }).eq('id', updated.id);
      
      ticketResult = "Boleto generado exitosamente: " + ticketUrl;
    } catch (qrErr: any) {
      ticketResult = "Error generando boleto: " + qrErr.message;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      mensaje: 'Registro de Yenny actualizado y boleto forzado.', 
      asistente: updated,
      ticketStatus: ticketResult
    }, null, 2), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};
