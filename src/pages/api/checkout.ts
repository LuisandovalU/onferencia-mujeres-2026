export const prerender = false; // Forza a Astro a nunca compilar este archivo en estático

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import Stripe from 'stripe';

const getStripe = () => {
  const key = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing in the environment");
  }
  return new Stripe(key);
};

export const POST: APIRoute = async ({ request, url }) => {
    let nombre = '';
    let whatsapp = '';
    let esBrave = false;
    let esCasa = false;
    let quienInvito = '';

    try {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await request.json();
            nombre = body.nombre;
            whatsapp = body.whatsapp;
            esBrave = String(body.es_brave) === 'true';
            esCasa = String(body.es_casa) === 'true';
            quienInvito = body.quien_invito || '';
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            const data = await request.formData();
            nombre = data.get('nombre') as string;
            whatsapp = data.get('whatsapp') as string;
            esBrave = String(data.get('es_brave')) === 'true';
            esCasa = String(data.get('es_casa')) === 'true';
            quienInvito = (data.get('quien_invito') as string) || '';
        } else {
            const text = await request.text();
            const params = new URLSearchParams(text);
            nombre = params.get('nombre') || '';
            whatsapp = params.get('whatsapp') || '';
            esBrave = String(params.get('es_brave')) === 'true';
            esCasa = String(params.get('es_casa')) === 'true';
            quienInvito = params.get('quien_invito') || '';
        }
    } catch(e) {
        return new Response(JSON.stringify({ error: "Error procesando el cuerpo." }), { status: 400 });
    }

    if (!nombre) return new Response(JSON.stringify({ error: "El nombre es requerido" }), { status: 400 });

    try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded_page',
            payment_method_types: ['card', 'oxxo'],
            line_items: [{
                price_data: {
                    currency: 'mxn',
                    product_data: {
                        name: esBrave ? 'Conferencia BRAVE 2026' : 'Conferencia VALIENTE 2026'
                    },
                    unit_amount: 13000, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: { 
                nombre: String(nombre),
                whatsapp: String(whatsapp),
                es_brave: String(esBrave),
                es_casa: String(esCasa),
                quien_invito: String(quienInvito)
            },
            return_url: `${url.origin}/?session_id={CHECKOUT_SESSION_ID}`,
        });

        // 3. Devolvemos el secreto a React y el Session ID para ubicar el ticket futuro
        return new Response(JSON.stringify({ 
            clientSecret: session.client_secret,
            sessionId: session.id
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (stripeError: any) {
        console.error("Stripe Error:", stripeError);
        return new Response(JSON.stringify({ error: stripeError.message || "Error al crear sesión en Stripe" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};