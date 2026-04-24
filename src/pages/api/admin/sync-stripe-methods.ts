export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import Stripe from 'stripe';

const stripeKey = String(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any });

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const password = url.searchParams.get('key');
  
  const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  if (!password || password !== adminPass) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('*')
      .not('stripe_session_id', 'is', null);

    if (error) throw error;
    if (!asistentes) return new Response('No data', { status: 200 });

    const results = [];
    for (const a of asistentes) {
      try {
        const session = await stripe.checkout.sessions.retrieve(a.stripe_session_id, { 
          expand: ['payment_intent', 'payment_intent.payment_method'] 
        });
        
        let stripeMetodoStr = 'En Línea';
        if (session.payment_intent) {
            const pt = (session.payment_intent as any)?.payment_method?.type;
            if (pt === 'oxxo') stripeMetodoStr = 'OXXO';
            else if (pt === 'card') stripeMetodoStr = 'Tarjeta';
            else if (pt === 'customer_balance' || pt === 'bank_transfer') stripeMetodoStr = 'Transferencia SPEI';
        }
        
        const finalMethodStr = `Stripe ${stripeMetodoStr}`;
        const updates: any = {};
        
        if (a.metodo_pago !== finalMethodStr) {
           updates.metodo_pago = finalMethodStr;
        }

        // ¡RESCATE DE PAGOS ASÍNCRONOS ATRASADOS!
        let isPaid = session.payment_status === 'paid';
        if (!isPaid && session.payment_intent) {
            let piStatus = '';
            if (typeof session.payment_intent === 'string') {
               try { const pi = await stripe.paymentIntents.retrieve(session.payment_intent); piStatus = pi.status; } catch(e){}
            } else {
               piStatus = (session.payment_intent as any).status;
            }
            if (piStatus === 'succeeded') isPaid = true;
        }
        
        if (isPaid && a.status_pago !== 'completado') {
           updates.status_pago = 'completado';
           updates.monto_pagado = (session.amount_total || 13000) / 100;
           results.push(`🚨 ¡RESCATADO DEL PASADO! -> Pago recuperado: ${a.nombre_completo} (Monto: $${updates.monto_pagado})`);
           
           // Generar el boleto para el pago rescatado
           try {
             const { generateAndUploadTicket } = await import('../../../lib/ticket-generator');
             await generateAndUploadTicket({
               asistenteId: a.id,
               nombre_completo: a.nombre_completo,
               folio: a.folio,
               es_brave: a.es_brave,
               fileName: a.id
             });
             
             // Guardar URL
             const ticketUrl = `https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${a.id}.jpg`;
             updates.ticket_url = ticketUrl;
             results.push(`🎟️ Boleto generado exitosamente para ${a.nombre_completo}`);
           } catch (ticketErr: any) {
             results.push(`❌ Error al generar boleto para ${a.nombre_completo}: ${ticketErr.message}`);
           }
        }

        if (Object.keys(updates).length > 0) {
           await supabase.from('asistentes').update(updates).eq('id', a.id);
           results.push(`✅ Registros actualizados para ${a.nombre_completo}: ${Object.keys(updates).join(', ')}`);
        } else {
           results.push(`⏭️ Ya estaba correcto ${a.nombre_completo}`);
        }
      } catch(er: any) {
        results.push(`❌ Falló ${a.nombre_completo}: Stripe Error`);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }, null, 2), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' }  });
  }
};
