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
    
    // ── 1. Identificar método de pago exacto desde Stripe ──
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

    console.log(`[Webhook] ─────────────────────────────────────────────`);
    console.log(`[Webhook] Event: ${evtType}`);
    console.log(`[Webhook] Session ID: ${session.id}`);
    console.log(`[Webhook] Payment Status: ${session.payment_status} | Método: ${stripeMetodoStr}`);
    console.log(`[Webhook] Metadata: nombre=${session.metadata?.nombre} | whatsapp=${session.metadata?.whatsapp}`);

    // ── 2. Validar que tengamos metadata de identidad ──
    if (!session.metadata?.nombre || !session.metadata?.whatsapp) {
      console.warn('[Webhook] ⚠️ Session sin metadata de identidad (nombre/whatsapp). Abortando.', session.id);
      return new Response('No identity metadata found', { status: 400 });
    }

    const nombre = session.metadata.nombre;
    const whatsapp = session.metadata.whatsapp;
    const isPaid = session.payment_status === 'paid';

    // ── 3. Determinar el payload base para upsert ──
    const { getMXTimestamp } = await import('../../lib/date-utils');

    const upsertPayload: Record<string, any> = {
      nombre_completo: nombre,
      whatsapp: whatsapp,
      es_brave: session.metadata.es_brave === 'true',
      es_casa: session.metadata.es_casa === 'true',
      referido_por: session.metadata.quien_invito || 'N/A',
      monto_total: (session.amount_total || 13000) / 100,
      metodo_pago: `Stripe ${stripeMetodoStr}`,
      stripe_session_id: session.id,
    };

    // Solo establecer status_pago y monto_pagado en el payload de inserción base.
    // Para actualizaciones, lo manejamos condicionalmente abajo.
    if (isPaid) {
      upsertPayload.status_pago = 'completado';
      upsertPayload.monto_pagado = (session.amount_total || 0) / 100;
    } else {
      upsertPayload.status_pago = 'pendiente';
      upsertPayload.monto_pagado = 0;
    }

    // ── 4. Buscar registro existente ANTES del upsert ──
    //    Necesitamos saber si ya existe para decidir si actualizar o insertar,
    //    y para proteger el status 'completado' de ser degradado a 'pendiente'.
    let { data: existingRecord, error: lookupError } = await supabase
      .from('asistentes')
      .select('*')
      .eq('nombre_completo', nombre)
      .eq('whatsapp', whatsapp)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error('[Webhook] Error buscando registro existente:', lookupError);
    }

    // También intentar por stripe_session_id si no hubo match por identidad
    if (!existingRecord && !lookupError) {
      const { data: sessionMatch, error: sessionError } = await supabase
        .from('asistentes')
        .select('*')
        .eq('stripe_session_id', session.id)
        .maybeSingle();
      
      if (sessionError) {
        console.error('[Webhook] Error buscando por session_id:', sessionError);
      } else if (sessionMatch) {
        existingRecord = sessionMatch;
      }
    }

    let objAsistente: any = null;
    let asistenteId: string | null = null;

    if (existingRecord) {
      // ── 5a. ACTUALIZACIÓN de registro existente ──
      console.log(`[Webhook] 🛡️ Registro existente encontrado. ID: ${existingRecord.id} | Folio: ${existingRecord.folio} | Status BD: ${existingRecord.status_pago}`);

      const updatePayload: Record<string, any> = {
        stripe_session_id: session.id,
        metodo_pago: `Stripe ${stripeMetodoStr}`,
      };

      // REGLA CLAVE: Nunca degradar un pago 'completado' → 'pendiente'
      if (isPaid && existingRecord.status_pago !== 'completado') {
        console.log(`[Webhook] 💰 Pago confirmado. Actualizando ${existingRecord.id} de '${existingRecord.status_pago}' → 'completado'`);
        updatePayload.status_pago = 'completado';
        updatePayload.monto_pagado = (session.amount_total || 0) / 100;
      } else if (existingRecord.status_pago === 'completado') {
        console.log(`[Webhook] ✅ Registro ya estaba completado. No se degrada el estado.`);
        // No tocamos status_pago ni monto_pagado
      } else {
        // Sigue pendiente, pero refinamos metadata
        console.log(`[Webhook] ⏳ Pago aún pendiente. Refinando metadata del registro.`);
      }

      const { data: updated, error: updateError } = await supabase
        .from('asistentes')
        .update(updatePayload)
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Webhook] ❌ Error actualizando asistente:', updateError);
        return new Response('Database Update Error', { status: 500 });
      }

      objAsistente = updated;
      asistenteId = updated.id;
      console.log(`[Webhook] ✅ Registro actualizado exitosamente. ID: ${asistenteId} | Status final: ${objAsistente.status_pago}`);
    } else {
      // ── 5b. INSERCIÓN de nuevo registro (con protección contra race condition) ──
      console.log(`[Webhook] 🆕 No se encontró registro previo. Insertando nuevo asistente...`);

      // Agregar created_at solo en la inserción
      upsertPayload.created_at = getMXTimestamp();

      const { data: dbData, error: insertError } = await supabase
        .from('asistentes')
        .upsert(upsertPayload, {
          onConflict: 'nombre_completo,whatsapp',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (insertError || !dbData) {
        console.error('[Webhook] ❌ Error en upsert de nuevo asistente:', insertError);
        return new Response('Database Upsert Error', { status: 500 });
      }

      objAsistente = dbData;
      asistenteId = dbData.id;
      console.log(`[Webhook] ✅ Asistente registrado vía upsert. ID: ${asistenteId} | Folio: ${objAsistente.folio} | Status: ${objAsistente.status_pago}`);
    }

    // ── 6. Generación del Ticket: SOLO cuando el pago está 100% confirmado ──
    const finalStatus = objAsistente?.status_pago;
    const alreadyHasTicket = !!objAsistente?.ticket_url;

    if (finalStatus === 'completado' && !alreadyHasTicket) {
      console.log(`[Webhook] 🎟️ Iniciando generación de Ticket para Asistente ID: ${asistenteId}...`);
      try {
        const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
        
        await generateAndUploadTicket({
          asistenteId: asistenteId!,
          nombre_completo: objAsistente.nombre_completo,
          folio: objAsistente.folio,
          es_brave: objAsistente.es_brave,
          fileName: asistenteId!
        });

        console.log('[Webhook] ✅ Ticket generado y subido exitosamente.');
      } catch (qrErr) {
        console.error('[Webhook] ❌ Error generando el Ticket:', qrErr);
      }
    } else if (finalStatus === 'completado' && alreadyHasTicket) {
      console.log(`[Webhook] 🎟️ Ticket ya existe para ${asistenteId}. Omitiendo regeneración.`);
    } else {
      console.log(`[Webhook] ⏳ Pago no confirmado aún (status: ${session.payment_status}). Ticket pendiente hasta confirmación.`);
    }

    console.log(`[Webhook] ─────────────────────────────────────────────`);
  }

  return new Response('Webhook recibido', { status: 200 });
};
