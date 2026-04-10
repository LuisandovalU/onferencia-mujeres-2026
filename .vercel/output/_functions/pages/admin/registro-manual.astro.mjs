/* empty css                                      */
import { e as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DrLJit2O.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_CKsPeLQ1.mjs';
export { renderers } from '../../renderers.mjs';

const $$RegistroManual = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Registro Manual Staff | Mujeres 2026" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div className="min-h-screen flex flex-col pt-12 bg-[#041204] selection:bg-emerald-500 selection:text-black"> <header className="w-full max-w-6xl mx-auto px-8 mb-12 relative z-20"> <div className="flex items-center justify-between"> <div> <h1 className="text-4xl font-black text-white tracking-widest uppercase">
Sistema <span className="text-emerald-400">Staff</span> </h1> <p className="text-emerald-300/40 text-sm mt-2 font-medium tracking-wide">Conferencia de Mujeres 2026 — Edición Botánica</p> </div> <a href="/admin/checkin" className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 px-6 rounded-full border border-emerald-500/30 transition-all font-black uppercase tracking-widest">
Ir al Escáner →
</a> </div> </header> <main className="flex-1 flex flex-col items-center px-4 pb-20 mt-4"> ${renderComponent($$result2, "ManualRegistrationForm", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ManualRegistrationForm", "client:component-export": "default" })} </main> </div> ` })}`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/registro-manual.astro", void 0);

const $$file = "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/registro-manual.astro";
const $$url = "/admin/registro-manual";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RegistroManual,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
