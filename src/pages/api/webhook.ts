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
    timestamp: new Date().toISOString()
  }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
};

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    if (!sig || !endpointSecret) throw new Error('Missing stripe signature or secret');
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const evtType = event.type;
  
  if (evtType === 'checkout.session.completed' || evtType === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. BUSCAMOS SI YA LA TENÍAMOS REGISTRADA (OXXO pagado tardío)
    const { data: existingData } = await supabase
      .from('asistentes')
      .select('*')
      .eq('stripe_session_id', session.id)
      .single();

    let objAsistente = existingData;
    let asistenteId = existingData?.id;

    // 2. INSERCIÓN DE NUEVO USUARIO
    if (!existingData) {
      if (!session.metadata?.nombre) {
        console.warn('Session sin metadata de nombre:', session.id);
        return new Response('No metadata found', { status: 400 });
      }

      const { data: dbData, error: insertError } = await supabase
        .from('asistentes')
        .insert([{
          nombre_completo: session.metadata.nombre,
          whatsapp: session.metadata.whatsapp,
          es_brave: session.metadata.es_brave === 'true',
          es_casa: session.metadata.es_casa === 'true',
          referido_por: session.metadata.quien_invito || 'N/A',
          monto_total: 130,
          status_pago: session.payment_status === 'paid' ? 'completado' : 'pendiente',
          monto_pagado: session.payment_status === 'paid' ? (session.amount_total || 0) / 100 : 0,
          stripe_session_id: session.id
        }])
        .select()
        .single();
        
      if (insertError || !dbData) {
        console.error('Error insertando nuevo usuario en supabase:', insertError);
        return new Response('Database Error', { status: 500 });
      }
      objAsistente = dbData;
      asistenteId = dbData.id;
      console.log('Nuevo asistente registrado desde Webhook, estado:', objAsistente.status_pago);
    } else {
      // 3. ACTUALIZACIÓN (Si era OXXO Pendiente y ahora lo pagó - async_payment)
      if (session.payment_status === 'paid' && existingData.status_pago !== 'completado') {
        const { data: updated } = await supabase
          .from('asistentes')
          .update({ 
            status_pago: 'completado', 
            monto_pagado: (session.amount_total || 0) / 100 
          })
          .eq('id', asistenteId)
          .select()
          .single();
        objAsistente = updated;
        console.log('Asistente existente OXXO actualizado a PAGADO!');
      }
    }

    // Si aún no está cobrado (OXXO ficha sin pagar), truncamos y ahorramos el CPU del Ticket
    if (session.payment_status !== 'paid') {
      return new Response('Registrado como pendiente OXXO. Recibo esperado más tarde.', { status: 200 });
    }

    // 4. Generación del Ticket con Código QR (Lógica Refactorizada)
    try {
      const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
      
      await generateAndUploadTicket({
        asistenteId: asistenteId,
        nombre_completo: objAsistente.nombre_completo,
        folio: objAsistente.folio,
        es_brave: objAsistente.es_brave,
        fileName: session.id // Usamos ID de Stripe para el nombre del archivo
      });

      console.log('Ticket generado y subido a través de la librería compartida.');
    } catch (qrErr) {
      console.error('Error generando el QR/Ticket en Webhook:', qrErr);
    }
  }

  return new Response('Webhook recibido', { status: 200 });
};
