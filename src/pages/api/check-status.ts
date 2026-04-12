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

        // Si el pago fue exitoso, asegurar que el boleto exista
        if (session.payment_status === 'paid') {
            try {
                // Verificar si el ticket ya existe en Supabase Storage
                const { data: fileList } = await supabase.storage
                    .from('tickets')
                    .list('', { search: `${sessionId}.jpg` });

                const ticketExists = fileList && fileList.some(f => f.name === `${sessionId}.jpg`);

                if (!ticketExists) {
                    console.log(`🎟️ check-status: Boleto no encontrado para ${sessionId}, generando...`);
                    
                    // Buscar asistente en la base de datos
                    const { data: asistente } = await supabase
                        .from('asistentes')
                        .select('*')
                        .eq('stripe_session_id', sessionId)
                        .single();

                    if (asistente) {
                        // Generar ticket al vuelo
                        const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
                        await generateAndUploadTicket({
                            asistenteId: asistente.id,
                            nombre_completo: asistente.nombre_completo,
                            folio: asistente.folio,
                            es_brave: asistente.es_brave,
                            fileName: sessionId
                        });
                        console.log(`✅ check-status: Boleto generado exitosamente para ${asistente.nombre_completo}`);
                    } else {
                        // El asistente aún no está en la BD — insertarlo
                        console.log(`📝 check-status: Asistente no encontrado en BD, insertando...`);
                        const { data: newAsistente, error: insertError } = await supabase
                            .from('asistentes')
                            .insert([{
                                nombre_completo: session.metadata?.nombre || 'Sin Nombre',
                                whatsapp: session.metadata?.whatsapp || '',
                                es_brave: session.metadata?.es_brave === 'true',
                                es_casa: session.metadata?.es_casa === 'true',
                                referido_por: session.metadata?.quien_invito || 'N/A',
                                monto_total: 130,
                                status_pago: 'completado',
                                monto_pagado: (session.amount_total || 0) / 100,
                                stripe_session_id: sessionId
                            }])
                            .select()
                            .single();

                        if (!insertError && newAsistente) {
                            const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
                            await generateAndUploadTicket({
                                asistenteId: newAsistente.id,
                                nombre_completo: newAsistente.nombre_completo,
                                folio: newAsistente.folio,
                                es_brave: newAsistente.es_brave,
                                fileName: sessionId
                            });
                            console.log(`✅ check-status: Nuevo asistente registrado y boleto generado`);
                        }
                    }
                }
            } catch (ticketErr: any) {
                // No bloqueamos la respuesta si falla la generación del ticket
                console.error(`⚠️ check-status: Error generando ticket: ${ticketErr.message}`);
            }
        }

        return new Response(JSON.stringify({
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            nombre: session.metadata?.nombre || ""
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
