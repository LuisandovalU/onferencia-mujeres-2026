export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { password } = await request.json();
    const isValid = password === "Mujeres2026ICI";
    return new Response(JSON.stringify({ isValid }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ isValid: false }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
