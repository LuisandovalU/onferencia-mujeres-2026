import '../../chunks/supabase_1KpGbJjf.mjs';
import Stripe from 'stripe';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const stripeKey = "sk_test_51TJniyRoz2YqsXbCFw7VAf0CozUCgEynkc4CabYMyx7HGSHT76s2Q4C9HKLudq8piEaFTBWsBYb1aj4ovwS0YvOD00CudORNJr";
const stripe = new Stripe(stripeKey);
const POST = async ({ request, url }) => {
  let nombre = "";
  let whatsapp = "";
  let esBrave = false;
  let esCasa = false;
  let quienInvito = "";
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      nombre = body.nombre;
      whatsapp = body.whatsapp;
      esBrave = String(body.es_brave) === "true";
      esCasa = String(body.es_casa) === "true";
      quienInvito = body.quien_invito || "";
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const data = await request.formData();
      nombre = data.get("nombre");
      whatsapp = data.get("whatsapp");
      esBrave = String(data.get("es_brave")) === "true";
      esCasa = String(data.get("es_casa")) === "true";
      quienInvito = data.get("quien_invito") || "";
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      nombre = params.get("nombre") || "";
      whatsapp = params.get("whatsapp") || "";
      esBrave = String(params.get("es_brave")) === "true";
      esCasa = String(params.get("es_casa")) === "true";
      quienInvito = params.get("quien_invito") || "";
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error procesando el cuerpo." }), { status: 400 });
  }
  if (!nombre) return new Response(JSON.stringify({ error: "El nombre es requerido" }), { status: 400 });
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      payment_method_types: ["card", "oxxo"],
      line_items: [{
        price_data: {
          currency: "mxn",
          product_data: {
            name: esBrave ? "Conferencia BRAVE 2026" : "Conferencia VALIENTE 2026"
          },
          unit_amount: 13e3
        },
        quantity: 1
      }],
      mode: "payment",
      metadata: {
        nombre: String(nombre),
        whatsapp: String(whatsapp),
        es_brave: String(esBrave),
        es_casa: String(esCasa),
        quien_invito: String(quienInvito)
      },
      return_url: `${url.origin}/?session_id={CHECKOUT_SESSION_ID}`
    });
    return new Response(JSON.stringify({
      clientSecret: session.client_secret,
      sessionId: session.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (stripeError) {
    console.error("Stripe Error:", stripeError);
    return new Response(JSON.stringify({ error: stripeError.message || "Error al crear sesión en Stripe" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
