import Stripe from 'stripe';
import { s as supabase } from '../../chunks/supabase_jFlVW5lz.mjs';
export { renderers } from '../../renderers.mjs';

const stripe = new Stripe("sk_test_51TJniyRoz2YqsXbCFw7VAf0CozUCgEynkc4CabYMyx7HGSHT76s2Q4C9HKLudq8piEaFTBWsBYb1aj4ovwS0YvOD00CudORNJr");
const endpointSecret = "whsec_911550d8125899673a8156a6b58900ef02373e585da9d3c4e7d0c93e0b53deab";
const POST = async ({ request }) => {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  let event;
  try {
    if (!sig || !endpointSecret) throw new Error("Missing stripe signature or secret");
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  const evtType = event.type;
  if (evtType === "checkout.session.completed" || evtType === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const { data: existingData } = await supabase.from("asistentes").select("*").eq("stripe_session_id", session.id).single();
    let objAsistente = existingData;
    let asistenteId = existingData?.id;
    if (!existingData) {
      if (!session.metadata?.nombre) {
        console.warn("Session sin metadata de nombre:", session.id);
        return new Response("No metadata found", { status: 400 });
      }
      const { data: dbData, error: insertError } = await supabase.from("asistentes").insert([{
        nombre_completo: session.metadata.nombre,
        whatsapp: session.metadata.whatsapp,
        es_brave: session.metadata.es_brave === "true",
        es_casa: session.metadata.es_casa === "true",
        referido_por: session.metadata.quien_invito || "N/A",
        monto_total: 130,
        status_pago: session.payment_status === "paid" ? "completado" : "pendiente",
        monto_pagado: session.payment_status === "paid" ? (session.amount_total || 0) / 100 : 0,
        stripe_session_id: session.id
      }]).select().single();
      if (insertError || !dbData) {
        console.error("Error insertando nuevo usuario en supabase:", insertError);
        return new Response("Database Error", { status: 500 });
      }
      objAsistente = dbData;
      asistenteId = dbData.id;
      console.log("Nuevo asistente registrado desde Webhook, estado:", objAsistente.status_pago);
    } else {
      if (session.payment_status === "paid" && existingData.status_pago !== "completado") {
        const { data: updated } = await supabase.from("asistentes").update({
          status_pago: "completado",
          monto_pagado: (session.amount_total || 0) / 100
        }).eq("id", asistenteId).select().single();
        objAsistente = updated;
        console.log("Asistente existente OXXO actualizado a PAGADO!");
      }
    }
    if (session.payment_status !== "paid") {
      return new Response("Registrado como pendiente OXXO. Recibo esperado más tarde.", { status: 200 });
    }
    try {
      const { generateAndUploadTicket } = await import('../../chunks/ticket-generator_BoCVCc68.mjs');
      await generateAndUploadTicket({
        asistenteId,
        nombre_completo: objAsistente.nombre_completo,
        folio: objAsistente.folio,
        es_brave: objAsistente.es_brave,
        fileName: session.id
        // Usamos ID de Stripe para el nombre del archivo
      });
      console.log("Ticket generado y subido a través de la librería compartida.");
    } catch (qrErr) {
      console.error("Error generando el QR/Ticket en Webhook:", qrErr);
    }
  }
  return new Response("Webhook recibido", { status: 200 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
