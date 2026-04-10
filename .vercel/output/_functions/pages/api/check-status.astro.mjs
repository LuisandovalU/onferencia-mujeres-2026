import Stripe from 'stripe';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const stripe = new Stripe("sk_test_51TJniyRoz2YqsXbCFw7VAf0CozUCgEynkc4CabYMyx7HGSHT76s2Q4C9HKLudq8piEaFTBWsBYb1aj4ovwS0YvOD00CudORNJr");
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
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
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
