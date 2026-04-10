import { s as supabase } from '../../../chunks/supabase_jFlVW5lz.mjs';
import { generateAndUploadTicket } from '../../../chunks/ticket-generator_BoCVCc68.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { asistenteId, monto_abono, password } = await request.json();
    if (password !== "Mujeres2026ICI") {
      return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), { status: 401 });
    }
    if (!asistenteId || !monto_abono) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
    }
    const { data: asistente, error: fetchError } = await supabase.from("asistentes").select("*").eq("id", asistenteId).single();
    if (fetchError || !asistente) {
      return new Response(JSON.stringify({ error: "Asistente no encontrado" }), { status: 404 });
    }
    const nuevoPagado = (asistente.monto_pagado || 0) + Number(monto_abono);
    const estaPagadoCompletamente = nuevoPagado >= asistente.monto_total;
    const { data: updatedAsistente, error: updateError } = await supabase.from("asistentes").update({
      monto_pagado: nuevoPagado,
      status_pago: estaPagadoCompletamente ? "completado" : "pendiente"
    }).eq("id", asistenteId).select().single();
    if (updateError || !updatedAsistente) {
      return new Response(JSON.stringify({ error: "Error al actualizar pago" }), { status: 500 });
    }
    let ticketUrl = null;
    if (estaPagadoCompletamente) {
      try {
        await generateAndUploadTicket({
          asistenteId: updatedAsistente.id,
          nombre_completo: updatedAsistente.nombre_completo,
          folio: updatedAsistente.folio,
          es_brave: updatedAsistente.es_brave,
          fileName: updatedAsistente.id
        });
        ticketUrl = `/api/download-ticket?id=${updatedAsistente.id}`;
      } catch (qrErr) {
        console.error("Error generando ticket post-abono:", qrErr);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      nuevoPagado,
      estaPagadoCompletamente,
      ticketUrl
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
