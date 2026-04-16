export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const rawStripeKey = import.meta.env.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : '');
const stripeKey = String(rawStripeKey || '').trim();

const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
    apiVersion: '2025-01-27.acacia' as any,
});

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('session_id');

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "Session ID no provisto" }), { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 1. Buscar asistente en la BD independientemente del estado en Stripe
        let { data: asistente } = await supabase
            .from('asistentes')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .maybeSingle(); // maybeSingle evita errores si no existe

        const isPaidInStripe = session.payment_status === 'paid';
        const isPaidInDB = asistente?.status_pago === 'completado';

        // Si el pago fue exitoso en Stripe, O SI un administrador lo marcó manualmente en BD
        if (isPaidInStripe || isPaidInDB) {
            try {
                if (!asistente && isPaidInStripe) {
                    // El asistente aún no está en la BD — insertarlo
                    console.log(`📝 check-status: Asistente no encontrado en BD, insertando...`);
                    const { getMXTimestamp } = await import('../../lib/date-utils');
                    const { data: newAsistente, error: insertError } = await supabase
                        .from('asistentes')
                        .insert([{
                            nombre_completo: session.metadata?.nombre || 'Sin Nombre',
                            whatsapp: session.metadata?.whatsapp || '',
                            es_brave: session.metadata?.es_brave === 'true',
                            es_casa: session.metadata?.es_casa === 'true',
                            referido_por: session.metadata?.quien_invito || 'N/A',
                            monto_total: (session.amount_total || 13000) / 100,
                            status_pago: 'completado',
                            monto_pagado: (session.amount_total || 0) / 100,
                            stripe_session_id: sessionId,
                            created_at: getMXTimestamp()
                        }])
                        .select()
                        .single();
                    
                    if (!insertError && newAsistente) {
                        asistente = newAsistente;
                    }
                }

                if (asistente) {
                    // 2. Verificar si el ticket ya existe en Supabase Storage
                    const { data: fileList } = await supabase.storage
                        .from('tickets')
                        .list('', { search: asistente.id });

                    // Verificamos si existe con el UUID o con el sessionId (legacy)
                    const ticketExists = fileList && fileList.some(f => 
                        f.name === `${asistente.id}.jpg` || f.name === `${sessionId}.jpg`
                    );

                    if (!ticketExists) {
                        console.log(`🎟️ check-status: Boleto no encontrado para ${asistente.nombre_completo}, generando por validación manual o stripe...`);
                        const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
                        await generateAndUploadTicket({
                            asistenteId: asistente.id,
                            nombre_completo: asistente.nombre_completo,
                            folio: asistente.folio,
                            es_brave: asistente.es_brave,
                            fileName: asistente.id // Usamos UUID ahora
                        });
                        console.log(`✅ check-status: Boleto generado exitosamente.`);
                    }

                    // Adjuntar el ID del asistente a la respuesta para que el modal lo use
                    (session as any).asistenteId = asistente.id;
                }
            } catch (ticketErr: any) {
                console.error(`⚠️ check-status: Error procesando ticket en check-status: ${ticketErr.message}`);
            }
        }

        // Si el pago es validado de forma manual en DB, forzamos valores 'paid' / 'complete' al Front-end
        return new Response(JSON.stringify({
            status: isPaidInDB ? 'complete' : session.status,
            payment_status: isPaidInDB ? 'paid' : session.payment_status,
            customer_email: session.customer_details?.email,
            nombre: asistente?.nombre_completo || session.metadata?.nombre || "",
            asistenteId: (session as any).asistenteId || asistente?.id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
