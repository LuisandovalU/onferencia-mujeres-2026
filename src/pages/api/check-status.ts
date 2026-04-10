export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// Recuperar la llave desde import.meta.env o process.env (Vercel)
const rawStripeKey = import.meta.env.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : '');
const stripeKey = String(rawStripeKey || '').trim();

if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    console.error('❌ STRIPE_SECRET_KEY is missing or invalid in check-status!');
}

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
