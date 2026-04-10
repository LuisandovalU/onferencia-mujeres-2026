/* empty css                                      */
import { e as createComponent, k as renderHead, l as renderComponent, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_DrLJit2O.mjs';
import 'piccolore';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Checkin = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Checkin;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Escaner de Boletos | Mujeres 2026</title>${renderHead()}</head> <body class="bg-gray-900 text-white min-h-screen flex flex-col font-sans"> <header class="w-full bg-black/50 p-4 border-b border-gray-800 text-center"> <h1 class="text-2xl font-bold tracking-widest text-[#BFA077]">STAFF CHECK-IN</h1> <p class="text-xs text-gray-400">Escáner Oficial Mujeres 2026</p> </header> <main class="flex-1 overflow-y-auto p-4 flex flex-col items-center pt-8">  ${renderComponent($$result, "CheckinScanner", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/CheckinScanner", "client:component-export": "default" })} </main> </body></html>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/checkin.astro", void 0);

const $$file = "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/checkin.astro";
const $$url = "/admin/checkin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Checkin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
