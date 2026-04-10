export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

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
