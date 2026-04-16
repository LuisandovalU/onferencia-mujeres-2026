import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import path from 'node:path';

// Recuperar las llaves de forma robusta para Vercel
const rawStripeKey = import.meta.env.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : '');
const stripeKey = String(rawStripeKey || '').trim();
const rawEndpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || (typeof process !== 'undefined' ? process.env.STRIPE_WEBHOOK_SECRET : '');
const endpointSecret = String(rawEndpointSecret || '').trim();

if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    console.error('❌ STRIPE_SECRET_KEY is missing or invalid in webhook!');
}

const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia' as any,
});

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    status: 'active', 
    message: 'Webhook endpoint is alive. Use POST for Stripe events.',
    timestamp: new Date().toISOString(),
    hasWebhookSecret: !!endpointSecret,
    secretPrefix: endpointSecret ? endpointSecret.substring(0, 10) + '...' : 'MISSING',
    hasStripeKey: !!stripeKey
  }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
};

export const POST: APIRoute = async ({ request }) => {
  // Obtenemos el cuerpo crudo (Buffer) para validar la firma de Stripe
  const arrayBuffer = await request.arrayBuffer();
  const payload = Buffer.from(arrayBuffer);
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    if (!sig || !endpointSecret) throw new Error('Missing stripe signature or secret');
    // Important: Use the raw buffer, not the text string
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const evtType = event.type;
  
  if (evtType === 'checkout.session.completed' || evtType === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Identificar el método de pago exacto directamente desde Stripe
    let stripeMetodoStr = 'En Línea';
    if (session.payment_intent) {
        try {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, { expand: ['payment_method'] });
            const pt = (pi.payment_method as any)?.type;
            if (pt === 'oxxo') stripeMetodoStr = 'OXXO';
            else if (pt === 'card') stripeMetodoStr = 'Tarjeta';
            else if (pt === 'customer_balance' || pt === 'bank_transfer') stripeMetodoStr = 'Transferencia SPEI';
        } catch(e) {}
    }

    console.log(`[Webhook] Event Received: ${evtType} | Stripe Session ID: ${session.id} | Payment Status: ${session.payment_status} | Métdo: ${stripeMetodoStr}`);

    // 1. BUSCAMOS LOGICA ROBUSTA: OBTENER REGISTRO ACTUAL SI EXISTE
    const { data: existingData, error: searchError } = await supabase
      .from('asistentes')
      .select('*')
      .eq('stripe_session_id', session.id)
      .maybeSingle(); // maybeSingle allows 0 rows without throwing an error

    if (searchError) {
      console.error(`[Webhook] Error buscando registro previo:`, searchError);
    }

    let objAsistente = existingData;
    let asistenteId = existingData?.id;

    if (existingData) {
      console.log(`[Webhook] Registro encontrado en Supabase. ID: ${existingData.id} | Status BD: ${existingData.status_pago}`);
      
      // ACTUALIZACION si ya existe y el estatus cambia a paid
      if (session.payment_status === 'paid' && existingData.status_pago !== 'completado') {
        console.log(`[Webhook] OXXO/Transferencia confirmada. Actualizando registro ${existingData.id} a 'completado'...`);
        const { data: updated, error: updateError } = await supabase
          .from('asistentes')
          .update({ 
            status_pago: 'completado', 
            monto_pagado: (session.amount_total || 0) / 100,
            metodo_pago: `Stripe ${stripeMetodoStr}`
          })
          .eq('id', asistenteId)
          .select()
          .single();
          
        if (updateError) {
          console.error(`[Webhook] Error actualizando asistente a pagado:`, updateError);
        } else {
          objAsistente = updated;
          console.log('[Webhook] ✅ ¡Asistente existente actualizado a PAGADO exitosamente!');
        }
      } else {
        // En caso de que se haya pagado en el registro y fuera un método manual, o simplemente refinar.
        if (existingData.status_pago === 'pendiente' && stripeMetodoStr !== 'En Línea') {
            await supabase.from('asistentes').update({ metodo_pago: `Stripe ${stripeMetodoStr}` }).eq('id', asistenteId);
        }
        console.log(`[Webhook] No se requiere actualización a pagado. Status Stripe: ${session.payment_status}, Status BD: ${existingData.status_pago}`);
      }
    } else {
      // INSERCION DE NUEVO USUARIO (Evita duplicados asegurando que no entra aqui si !existingData no fuera falso)
      console.log(`[Webhook] No se encontró registro previo para session_id: ${session.id}. Insertando nuevo asistente...`);
      if (!session.metadata?.nombre) {
        console.warn('[Webhook] Session sin metadata de nombre:', session.id);
        return new Response('No metadata found', { status: 400 });
      }

      const { getMXTimestamp } = await import('../../lib/date-utils');
      const { data: dbData, error: insertError } = await supabase
        .from('asistentes')
        .insert([{
          nombre_completo: session.metadata.nombre,
          whatsapp: session.metadata.whatsapp,
          es_brave: session.metadata.es_brave === 'true',
          es_casa: session.metadata.es_casa === 'true',
          referido_por: session.metadata.quien_invito || 'N/A',
          monto_total: (session.amount_total || 13000) / 100,
          status_pago: session.payment_status === 'paid' ? 'completado' : 'pendiente',
          monto_pagado: session.payment_status === 'paid' ? (session.amount_total || 0) / 100 : 0,
          metodo_pago: `Stripe ${stripeMetodoStr}`,
          stripe_session_id: session.id,
          created_at: getMXTimestamp()
        }])
        .select()
        .single();
        
      if (insertError || !dbData) {
        console.error('[Webhook] Error insertando nuevo usuario en supabase:', insertError);
        return new Response('Database Error', { status: 500 });
      }
      objAsistente = dbData;
      asistenteId = dbData.id;
      console.log(`[Webhook] Nuevo asistente registrado exitosamente. ID: ${asistenteId} | Estado: ${objAsistente.status_pago}`);
    }

    // 4. Generación del Ticket solo si se ha PAGADO
    if (session.payment_status === 'paid') {
      console.log(`[Webhook] Iniciando generación de Ticket para Asistente ID: ${asistenteId}...`);
      try {
        const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
        
        await generateAndUploadTicket({
          asistenteId: asistenteId,
          nombre_completo: objAsistente.nombre_completo,
          folio: objAsistente.folio,
          es_brave: objAsistente.es_brave,
          fileName: asistenteId
        });

        console.log('[Webhook] ✅ Ticket generado y subido a través de la librería compartida.');
      } catch (qrErr) {
        console.error('[Webhook] ❌ Error generando el QR/Ticket en Webhook:', qrErr);
      }
    } else {
      console.log(`[Webhook] Pago no concretado aún (status: ${session.payment_status}). Omitiendo generación de ticket en este momento.`);
    }
  }

  return new Response('Webhook recibido', { status: 200 });
};
