export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import Stripe from 'stripe';

const stripeKey = String(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any });

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const password = url.searchParams.get('key');
  const soloSessionId = url.searchParams.get('id'); // ?id=cs_live_... procesa solo esa sesión

  const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  if (!password || password !== adminPass) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    let query = supabase
      .from('asistentes')
      .select('*')
      .not('stripe_session_id', 'is', null);

    if (soloSessionId) {
      query = query.eq('stripe_session_id', soloSessionId) as any;
    }

    const { data: asistentes, error } = await query;

    if (error) throw error;
    if (!asistentes || asistentes.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay registros Stripe que procesar', results: [] }), { status: 200 });
    }

    const results: string[] = [];

    for (const a of asistentes) {
      try {
        // Traer la sesión sin expand para no complicar los tipos
        const session = await stripe.checkout.sessions.retrieve(a.stripe_session_id);

        // ── Detectar método de pago ──
        let stripeMetodoStr = 'En Línea';
        let isPaid = session.payment_status === 'paid';

        if (session.payment_intent && typeof session.payment_intent === 'string') {
          try {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
              expand: ['payment_method'],
            });
            const pt = (pi.payment_method as any)?.type;
            if (pt === 'oxxo') stripeMetodoStr = 'OXXO';
            else if (pt === 'card') stripeMetodoStr = 'Tarjeta';
            else if (pt === 'customer_balance' || pt === 'bank_transfer') stripeMetodoStr = 'Transferencia SPEI';

            if (pi.status === 'succeeded') isPaid = true;
          } catch (piErr) {
            // Si falla la consulta al PI, confiamos en session.payment_status
          }
        }

        // SPEI vía customer_balance puede no tener payment_intent pero sí payment_status='paid'
        if (!session.payment_intent && isPaid) {
          stripeMetodoStr = 'Transferencia SPEI';
        }

        const finalMethodStr = `Stripe ${stripeMetodoStr}`;
        const updates: Record<string, any> = {};

        // Actualizar método si cambió
        if (a.metodo_pago !== finalMethodStr) {
          updates.metodo_pago = finalMethodStr;
        }

        // ── Rescate de pago confirmado pero no registrado ──
        if (isPaid && a.status_pago !== 'completado') {
          updates.status_pago = 'completado';
          updates.monto_pagado = (session.amount_total || 15000) / 100;
          results.push(`🚨 RESCATADO → ${a.nombre_completo} | $${updates.monto_pagado} | ${finalMethodStr}`);

          // Generar boleto
          try {
            const { generateAndUploadTicket } = await import('../../../lib/ticket-generator');
            await generateAndUploadTicket({
              asistenteId: a.id,
              nombre_completo: a.nombre_completo,
              folio: a.folio,
              es_brave: a.es_brave,
              fileName: a.id,
            });
            const ticketUrl = `https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${a.id}.jpg`;
            updates.ticket_url = ticketUrl;
            results.push(`🎟️ Boleto generado para ${a.nombre_completo}`);
          } catch (ticketErr: any) {
            results.push(`❌ Error al generar boleto para ${a.nombre_completo}: ${ticketErr.message}`);
          }
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from('asistentes').update(updates).eq('id', a.id);
          if (!isPaid || a.status_pago === 'completado') {
            results.push(`✅ Actualizado ${a.nombre_completo}: ${Object.keys(updates).join(', ')}`);
          }
        } else {
          results.push(`⏭️  Sin cambios: ${a.nombre_completo} (${a.status_pago})`);
        }

      } catch (er: any) {
        results.push(`❌ Error procesando ${a.nombre_completo}: ${er.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: asistentes.length, results }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

