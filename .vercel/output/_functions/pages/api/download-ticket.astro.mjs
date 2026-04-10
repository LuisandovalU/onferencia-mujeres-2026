import { s as supabase } from '../../chunks/supabase_jFlVW5lz.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("ID de boleto no provisto", { status: 400 });
    }
    const fileName = id.endsWith(".jpg") ? id : `${id}.jpg`;
    const { data, error } = await supabase.storage.from("tickets").download(fileName);
    if (error || !data) {
      console.error("Download Error:", error);
      return new Response("El boleto no existe o aún se está procesando. Intenta de nuevo en unos segundos.", { status: 404 });
    }
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="Boleto-Mujeres-2026-${id}.jpg"`,
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("API Download Ticket Catch:", error);
    return new Response("Error interno al descargar el boleto", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
