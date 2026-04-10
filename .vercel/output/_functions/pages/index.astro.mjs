/* empty css                                   */
import { e as createComponent, m as maybeRenderHead, r as renderTemplate, g as addAttribute, l as renderComponent } from '../chunks/astro/server_DrLJit2O.mjs';
import 'piccolore';
import { h as heroBotanicalBg, $ as $$Layout } from '../chunks/Layout_D4VNa1ZZ.mjs';
import { clsx } from 'clsx';
import { jsx, jsxs } from 'react/jsx-runtime';
import { memo, useState, useCallback, useEffect, useId } from 'react';
import { twMerge } from 'tailwind-merge';
/* empty css                                 */
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import '../chunks/supabase_jFlVW5lz.mjs';
export { renderers } from '../renderers.mjs';

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none"> <div class="max-w-7xl mx-auto flex justify-end"> <!-- El botón de inscripción se manejará como una Isla en el Index si es necesario, 
             o puede ser un link estático si no abre el modal directamente aquí. --> </div> </header>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="bg-neutral-950 text-white/40 py-12 px-6"> <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6"> <div class="font-display font-extrabold text-white text-xl">
Conferencia de Mujeres
</div> <div class="font-body text-sm">
&copy; ${year} Conferencia de Mujeres. Todos los derechos reservados.
</div> </div> </footer>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/Footer.astro", void 0);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const InscribeteButton = ({
  conferencia,
  variant = "dark",
  className,
  children = "Inscribete"
}) => {
  const handleClick = () => {
    const openDialogs = document.querySelectorAll("dialog[open]");
    openDialogs.forEach((dialog) => {
      dialog.close();
    });
    const event = new CustomEvent("open-inscription-modal", {
      detail: { conferencia }
    });
    window.dispatchEvent(event);
  };
  const variants = {
    dark: "bg-neutral-900 text-white hover:bg-neutral-800",
    light: "bg-white text-neutral-900 hover:bg-neutral-100",
    outline: "border-2 border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-50"
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: handleClick,
      className: cn(
        "rounded-full px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 active:scale-95",
        variants[variant],
        className
      ),
      children
    }
  );
};

const $$ConferenceHero = createComponent(($$result, $$props, $$slots) => {
  const HERO_BOTANICAL_BG = heroBotanicalBg.src;
  const inscribetePillClass = "rounded-full border-2 border-neutral-900 bg-white px-5 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-50 sm:px-7 sm:py-3 sm:text-sm sm:tracking-[0.18em]";
  return renderTemplate`${maybeRenderHead()}<section class="relative isolate min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-[2rem] shadow-[0_-16px_48px_-18px_rgba(0,0,0,0.14),14px_0_40px_-20px_rgba(0,0,0,0.1),-14px_0_40px_-20px_rgba(0,0,0,0.1)] sm:min-h-[calc(100svh-2.5rem)] sm:rounded-[2.25rem] md:min-h-[calc(100svh-3rem)] md:rounded-[2.75rem] lg:rounded-[3rem]" style="background: radial-gradient(circle at center, #2d4a24 0%, #0a0a0a 100%);" aria-labelledby="hero-heading" data-astro-cid-tnlla3pe> <h1 id="hero-heading" class="sr-only" data-astro-cid-tnlla3pe>
Conferencia de Mujeres 2026
</h1> <img${addAttribute(HERO_BOTANICAL_BG, "src")} class="hero-image-silk absolute inset-0 z-0 h-full w-full object-cover" fetchpriority="high" loading="eager" decoding="sync" onload="this.classList.add('loaded')" aria-hidden="true" data-astro-cid-tnlla3pe> <div class="relative z-10 flex min-h-[calc(100svh-1.5rem)] flex-col items-center justify-center px-4 pb-28 pt-16 text-center sm:min-h-[calc(100svh-2.5rem)] sm:px-8 sm:pb-32 sm:pt-20 md:min-h-[calc(100svh-3rem)] md:px-12" data-astro-cid-tnlla3pe> <p class="font-hero text-[clamp(0.88rem,3.4vw,1.45rem)] font-bold uppercase leading-tight tracking-[0.28em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]" data-astro-cid-tnlla3pe>
CONFERENCIA DE
</p> <p class="font-hero mt-5 text-[clamp(3.1rem,13.5vw,8.25rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white [font-weight:900] [text-shadow:0_4px_32px_rgba(0,0,0,0.55),0_1px_0_rgba(0,0,0,0.35)] sm:mt-6 md:mt-7" data-astro-cid-tnlla3pe>
MUJERES
</p> <p class="font-hero mt-6 text-[clamp(2.35rem,10.5vw,6rem)] font-black uppercase leading-none tracking-[-0.045em] text-white [font-weight:900] [text-shadow:0_3px_26px_rgba(0,0,0,0.5)] sm:mt-7" data-astro-cid-tnlla3pe>
2026
</p> </div> <div class="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[clamp(5.75rem,20vmin,9.5rem)]" aria-hidden="true" data-astro-cid-tnlla3pe> <svg class="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" data-astro-cid-tnlla3pe> <path fill="#f5f5f5" d="M0 100 L0 74 L216 74 C232 74 238 58 244 46 C250 34 262 28 278 28 L400 28 L400 100 Z" data-astro-cid-tnlla3pe></path> </svg> <div class="pointer-events-none absolute inset-0 flex items-end justify-end pb-[clamp(0.65rem,2.2vmin,1.1rem)] pr-[clamp(0.85rem,4vw,2.25rem)] pt-6" data-astro-cid-tnlla3pe> <div class="pointer-events-auto" data-astro-cid-tnlla3pe> ${renderComponent($$result, "InscribeteButton", InscribeteButton, { "client:load": true, "className": inscribetePillClass, "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscribeteButton", "client:component-export": "InscribeteButton", "data-astro-cid-tnlla3pe": true })} </div> </div> </div> <a href="#contenido" class="absolute bottom-[max(7.25rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-white/90 outline-none ring-offset-2 ring-offset-transparent transition-opacity hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-[max(6.25rem,env(safe-area-inset-bottom))] md:bottom-[max(6.75rem,env(safe-area-inset-bottom))]" aria-label="Desplazarse hacia el contenido siguiente" data-astro-cid-tnlla3pe> <span class="animate-hero-scroll-arrow drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]" data-astro-cid-tnlla3pe> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9 sm:h-11 sm:w-11" aria-hidden="true" data-astro-cid-tnlla3pe> <path d="m6 9 6 6 6-6" data-astro-cid-tnlla3pe></path> </svg> </span> </a> <div class="pointer-events-none absolute inset-x-0 top-0 z-20 h-[min(44vh,520px)] bg-cover bg-no-repeat opacity-[0.58] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.85)_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.85)_45%,transparent_100%)]"${addAttribute({
    backgroundImage: `url(${HERO_BOTANICAL_BG})`,
    backgroundPosition: "center top",
    backgroundSize: "cover"
  }, "style")} aria-hidden="true" data-astro-cid-tnlla3pe></div> </section> `;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ConferenceHero.astro", void 0);

const braveText = new Proxy({"src":"/_astro/brave.DqMB_1Xm.webp","width":1097,"height":612,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave.webp";
							}
							
							return target[name];
						}
					});

const valienteText = new Proxy({"src":"/_astro/valiente.o3iPgJpy.webp","width":1543,"height":629,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente.webp";
							}
							
							return target[name];
						}
					});

const BRAVE_BG = "#2F4A2C";
const VALIENTE_BG = "#E3DBCF";
const SILK_EASE = [0.16, 1, 0.3, 1];
const ConferenceChoiceCard = memo(() => {
  const [selected, setSelected] = useState(null);
  const openModal = useCallback((conf) => {
    window.dispatchEvent(
      new CustomEvent("open-inscription-modal", { detail: { conferencia: conf } })
    );
  }, []);
  const handleBackdropClick = useCallback(() => {
    if (selected) setSelected(null);
  }, [selected]);
  const handleValienteClick = useCallback((e) => {
    if (selected === "brave") {
      setSelected(null);
      e.stopPropagation();
    } else if (!selected) {
      setSelected("valiente");
    }
  }, [selected]);
  const handleBraveClick = useCallback((e) => {
    if (selected === "valiente") {
      setSelected(null);
      e.stopPropagation();
    } else if (!selected) {
      setSelected("brave");
    }
  }, [selected]);
  const handleReset = useCallback((e) => {
    e.stopPropagation();
    setSelected(null);
  }, []);
  const handleActionClick = useCallback((e) => {
    e.stopPropagation();
    if (selected) openModal(selected);
  }, [selected, openModal]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: handleBackdropClick,
      className: cn(
        "relative w-full max-w-[460px] mx-auto aspect-[3/4] rounded-[3rem] overflow-hidden bg-neutral-950 shadow-[0_0_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10 transition-all will-change-transform",
        selected ? "cursor-pointer scale-[1.01]" : ""
      ),
      style: { transform: "translate3d(0,0,0)" },
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            onClick: handleValienteClick,
            animate: {
              filter: selected === "brave" ? "grayscale(1) brightness(0.15)" : "grayscale(0) brightness(1)",
              transform: "translate3d(0,0,0)"
            },
            transition: { duration: 0.6, ease: SILK_EASE },
            style: { backgroundColor: VALIENTE_BG },
            className: "absolute inset-0 z-0 h-full w-full cursor-pointer touch-none flex flex-col items-center justify-end px-8 pb-10 will-change-transform",
            children: /* @__PURE__ */ jsxs("div", { className: cn(
              "flex flex-col items-center text-center transition-all duration-700",
              selected === "brave" ? "opacity-0 translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0"
            ), children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: valienteText.src ?? valienteText,
                  alt: "Valiente",
                  loading: "eager",
                  fetchpriority: "high",
                  className: "h-[5.25rem] w-auto object-contain mb-3"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-[#2F4A2C] bg-[#2F4A2C]/8 px-4 py-1.5 rounded-full mb-2", children: "31 DE MAYO" }),
              /* @__PURE__ */ jsx("span", { className: "text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[#2F4A2C] text-center px-4", children: "Madres • Casadas • Mujeres Maduras" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            onClick: handleBraveClick,
            initial: false,
            animate: {
              clipPath: selected === "brave" ? "polygon(0 0, 100% 0, 100% 90%, 0 100%)" : selected === "valiente" ? "polygon(0 0, 100% 0, 100% 10%, 0 20%)" : "polygon(0 0, 100% 0, 100% 45%, 0 55%)",
              filter: selected === "valiente" ? "grayscale(1) brightness(0.15)" : "grayscale(0) brightness(1)",
              transform: "translate3d(0,0,0)"
            },
            transition: { duration: 0.8, ease: SILK_EASE },
            style: { backgroundColor: BRAVE_BG },
            className: "absolute inset-0 z-10 h-full w-full cursor-pointer shadow-2xl touch-none flex flex-col items-center justify-start px-8 pt-10 will-change-transform",
            children: [
              /* @__PURE__ */ jsxs("div", { className: cn(
                "flex flex-col items-center text-center transition-all duration-700",
                selected === "valiente" ? "opacity-0 -translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0"
              ), children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: braveText.src ?? braveText,
                    alt: "Brave",
                    loading: "eager",
                    fetchpriority: "high",
                    className: "h-[5.25rem] w-auto object-contain mb-3 brightness-0 invert"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-white bg-white/12 px-4 py-1.5 rounded-full mb-2", children: "24 DE MAYO" }),
                /* @__PURE__ */ jsx("span", { className: "text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-white text-center px-4", children: "Universitarias • Emprendedoras • Profesionales" })
              ] }),
              !selected && /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { x: "-100%" },
                  animate: { x: "100%" },
                  transition: { repeat: Infinity, duration: 3, ease: "linear" },
                  className: "absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { children: selected && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: selected === "brave" ? 40 : -40 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
            transition: { duration: 0.5, ease: SILK_EASE },
            className: cn(
              "absolute left-0 z-40 w-full px-10 flex flex-col gap-4 will-change-transform",
              selected === "brave" ? "bottom-12" : "top-12"
            ),
            style: { transform: "translate3d(0,0,0)" },
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleActionClick,
                  className: cn(
                    "w-full rounded-2xl py-5 text-[0.7rem] font-black uppercase tracking-[0.35em] shadow-2xl active:scale-95 transition-all duration-300",
                    selected === "brave" ? "bg-white text-[#2F4A2C]" : "bg-[#2F4A2C] text-white"
                  ),
                  children: "Aparta tu lugar"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleReset,
                  className: cn(
                    "text-[0.55rem] font-black tracking-[0.3em] uppercase text-center opacity-40 py-2",
                    selected === "brave" ? "text-white" : "text-[#2F4A2C]"
                  ),
                  children: "← Volver a elegir"
                }
              )
            ]
          },
          selected
        ) })
      ]
    }
  );
});
ConferenceChoiceCard.displayName = "ConferenceChoiceCard";

const $$EncuentrosGrid = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="flex justify-center"> ${renderComponent($$result, "ConferenceChoiceCard", ConferenceChoiceCard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ConferenceChoiceCard", "client:component-export": "default" })} </div>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/EncuentrosGrid.astro", void 0);

function AutoImageCarousel({
  slides,
  intervalMs = 5e3,
  className,
  sizes,
  priorityFirst
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);
  if (slides.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: cn("relative overflow-hidden bg-neutral-200", className), children: [
    slides.map((slide, i) => /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "absolute inset-0",
        initial: false,
        animate: { opacity: i === index ? 1 : 0 },
        transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
        "aria-hidden": i !== index,
        children: /* @__PURE__ */ jsx(
          "img",
          {
            src: slide.src?.src || slide.src,
            alt: slide.alt,
            className: "absolute inset-0 h-full w-full object-cover",
            sizes
          }
        )
      },
      i
    )),
    slides.length > 1 && /* @__PURE__ */ jsx(
      "div",
      {
        className: "pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5",
        "aria-hidden": true,
        children: slides.map((_, i) => /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-white/90" : "w-1.5 bg-white/40"
            )
          },
          i
        ))
      }
    )
  ] });
}

const braveCarousel1 = new Proxy({"src":"/_astro/brave-carousel-1.HjHKZpvL.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave-carousel-1.webp";
							}
							
							return target[name];
						}
					});

const braveCarousel2 = new Proxy({"src":"/_astro/brave-carousel-2.DMpLevj9.webp","width":1024,"height":888,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave-carousel-2.webp";
							}
							
							return target[name];
						}
					});

const braveCarousel3 = new Proxy({"src":"/_astro/brave-carousel-3.C-a70UYK.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave-carousel-3.webp";
							}
							
							return target[name];
						}
					});

const braveCarousel4 = new Proxy({"src":"/_astro/brave-carousel-4.yXIS7Bcv.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave-carousel-4.webp";
							}
							
							return target[name];
						}
					});

const braveCarousel5 = new Proxy({"src":"/_astro/brave-carousel-5.8Im4pz7D.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/brave-carousel-5.webp";
							}
							
							return target[name];
						}
					});

const $$BraveDetails = createComponent(($$result, $$props, $$slots) => {
  const BRAVE_SLIDES = [
    { src: braveCarousel1, alt: "Conferencia Brave \u2014 comunidad" },
    { src: braveCarousel2, alt: "Conferencia Brave \u2014 encuentro" },
    { src: braveCarousel3, alt: "Conferencia Brave \u2014 momento en el escenario" },
    { src: braveCarousel4, alt: "Conferencia Brave \u2014 conversaci\xF3n" },
    { src: braveCarousel5, alt: "Conferencia Brave \u2014 adoraci\xF3n y comunidad" }
  ];
  const BRAVE_TEXT_SRC = braveText.src;
  const copy = {
    date: "24 de mayo"};
  return renderTemplate`${maybeRenderHead()}<div class="overflow-hidden rounded-[2rem] bg-brave-dark-deep" data-astro-cid-kr6kanwd> <div class="grid gap-0 md:grid-cols-2" data-astro-cid-kr6kanwd> <div class="relative aspect-[4/3] min-h-[240px] md:aspect-auto md:min-h-[420px]" data-astro-cid-kr6kanwd> ${renderComponent($$result, "AutoImageCarousel", AutoImageCarousel, { "slides": BRAVE_SLIDES, "intervalMs": 5500, "className": "absolute inset-0", "sizes": "(max-width: 768px) 100vw, 50vw", "priorityFirst": true, "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/AutoImageCarousel", "client:component-export": "AutoImageCarousel", "data-astro-cid-kr6kanwd": true })} </div> <div class="flex flex-col justify-center p-8 text-white md:p-12 lg:p-14" data-astro-cid-kr6kanwd> <p class="font-body text-label font-semibold uppercase tracking-[0.28em] text-white/60 text-center md:text-left mb-4" data-astro-cid-kr6kanwd> ${copy.date} </p> <button onclick="document.getElementById('brave-details-modal').showModal()" class="group relative inline-flex items-center justify-center md:justify-start outline-none transition-all" aria-label="Descubre qué es Brave" data-astro-cid-kr6kanwd> <p class="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight text-white text-center md:text-left leading-tight flex items-center transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98] cursor-pointer" data-astro-cid-kr6kanwd>
¿Qué es <img${addAttribute(BRAVE_TEXT_SRC, "src")} alt="Brave" class="inline-block h-[0.9em] w-auto mx-2 -translate-y-1 object-contain brightness-0 invert" data-astro-cid-kr6kanwd>?
</p> <!-- Subrayado estilizado --> <span class="absolute -bottom-1 left-0 h-[3px] rounded-full w-0 bg-white/40 transition-all duration-300 group-hover:w-[90%] md:group-hover:w-[80%]" data-astro-cid-kr6kanwd></span> </button> <!-- Pequeña ventana emergente muy detallada y femenina --> <dialog id="brave-details-modal" class="backdrop:backdrop-blur-md backdrop:bg-black/50 rounded-[2rem] bg-brave-dark-deep border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-sm w-[90vw] overflow-hidden text-white m-auto fixed inset-0 z-50" data-astro-cid-kr6kanwd> <div class="relative p-10 pt-12 text-center flex flex-col items-center" data-astro-cid-kr6kanwd> <button onclick="document.getElementById('brave-details-modal').close()" class="absolute top-5 right-5 text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all outline-none" aria-label="Cerrar detalles" data-astro-cid-kr6kanwd> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-kr6kanwd><line x1="18" y1="6" x2="6" y2="18" data-astro-cid-kr6kanwd></line><line x1="6" y1="6" x2="18" y2="18" data-astro-cid-kr6kanwd></line></svg> </button> <!-- Elemento decorativo simple pero estético --> <div class="w-10 h-1 bg-white/20 rounded-full mb-6" data-astro-cid-kr6kanwd></div> <img${addAttribute(BRAVE_TEXT_SRC, "src")} alt="Brave" class="h-10 mb-6 brightness-0 invert opacity-[0.85]" data-astro-cid-kr6kanwd> <p class="font-body text-[1.05rem] leading-[1.7] text-white/90" data-astro-cid-kr6kanwd>
Diseñado de forma especial para <strong data-astro-cid-kr6kanwd>estudiantes universitarias y jóvenes profesionales</strong>, <strong data-astro-cid-kr6kanwd>Brave</strong> es una conferencia inspiradora creada para que hagas una pausa y escuches la palabra de Dios. Es un encuentro profundo que te apoyará a crecer en tu relación con Él, afirmando tus convicciones para que puedas dar tu siguiente paso con valentía y una fe inquebrantable.
</p> <div class="mt-8 mb-2 w-full flex flex-col gap-4" data-astro-cid-kr6kanwd> ${renderComponent($$result, "InscribeteButton", InscribeteButton, { "client:load": true, "conferencia": "brave", "variant": "light", "className": "w-full py-4 text-base font-bold shadow-xl shadow-black/20", "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscribeteButton", "client:component-export": "InscribeteButton", "data-astro-cid-kr6kanwd": true }, { "default": ($$result2) => renderTemplate`
Aparta tu lugar por $130
` })} </div> </div> </dialog> </div> </div> </div> `;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/BraveDetails.astro", void 0);

const valienteCarousel1 = new Proxy({"src":"/_astro/valiente-carousel-1.C7lrDNIe.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente-carousel-1.webp";
							}
							
							return target[name];
						}
					});

const valienteCarousel2 = new Proxy({"src":"/_astro/valiente-carousel-2.DnfjRpFy.webp","width":682,"height":1024,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente-carousel-2.webp";
							}
							
							return target[name];
						}
					});

const valienteCarousel3 = new Proxy({"src":"/_astro/valiente-carousel-3.CBuafWTL.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente-carousel-3.webp";
							}
							
							return target[name];
						}
					});

const valienteCarousel4 = new Proxy({"src":"/_astro/valiente-carousel-4.DXcFNdVP.webp","width":1024,"height":682,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente-carousel-4.webp";
							}
							
							return target[name];
						}
					});

const valienteCarousel5 = new Proxy({"src":"/_astro/valiente-carousel-5.D-MdovVR.webp","width":682,"height":1024,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/valiente-carousel-5.webp";
							}
							
							return target[name];
						}
					});

const $$ValienteDetails = createComponent(($$result, $$props, $$slots) => {
  const VALIENTE_SLIDES = [
    { src: valienteCarousel1, alt: "Conferencia Valiente \u2014 comunidad y adoraci\xF3n" },
    { src: valienteCarousel2, alt: "Conferencia Valiente \u2014 encuentro al aire libre" },
    { src: valienteCarousel3, alt: "Conferencia Valiente \u2014 tres mujeres sonriendo" },
    { src: valienteCarousel4, alt: "Conferencia Valiente \u2014 grupo cantando y celebrando" },
    { src: valienteCarousel5, alt: "Conferencia Valiente \u2014 apuntes y ense\xF1anza" }
  ];
  const VALIENTE_TEXT_SRC = valienteText.src;
  const copy = {
    date: "31 de mayo"};
  return renderTemplate`${maybeRenderHead()}<div class="overflow-hidden rounded-[2rem] bg-valiente-beige shadow-card" data-astro-cid-mab5wary> <div class="grid gap-0 md:grid-cols-2" data-astro-cid-mab5wary> <div class="order-2 flex flex-col justify-center p-8 md:order-1 md:p-12 lg:p-14" data-astro-cid-mab5wary> <p class="font-body text-label font-semibold uppercase tracking-[0.28em] text-valiente-dark/50 text-center md:text-left mb-4" data-astro-cid-mab5wary> ${copy.date} </p> <button onclick="document.getElementById('valiente-details-modal').showModal()" class="group relative inline-flex items-center justify-center md:justify-start outline-none transition-all" aria-label="Descubre qué es Valiente" data-astro-cid-mab5wary> <p class="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-tight text-valiente-dark text-center md:text-left leading-tight flex items-center transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98] cursor-pointer" data-astro-cid-mab5wary>
¿Qué es <img${addAttribute(VALIENTE_TEXT_SRC, "src")} alt="Valiente" class="inline-block h-[0.75em] w-auto mx-2 -translate-y-1 object-contain" data-astro-cid-mab5wary>?
</p> <span class="absolute -bottom-1 left-0 h-[3px] rounded-full w-0 bg-valiente-dark/20 transition-all duration-300 group-hover:w-[90%] md:group-hover:w-[80%]" data-astro-cid-mab5wary></span> </button> <!-- Pequeña ventana emergente muy detallada y femenina --> <dialog id="valiente-details-modal" class="backdrop:backdrop-blur-md backdrop:bg-black/50 rounded-[2rem] bg-valiente-beige border border-valiente-dark/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] max-w-sm w-[90vw] overflow-hidden text-valiente-dark m-auto fixed inset-0 z-50" data-astro-cid-mab5wary> <div class="relative p-10 pt-12 text-center flex flex-col items-center" data-astro-cid-mab5wary> <button onclick="document.getElementById('valiente-details-modal').close()" class="absolute top-5 right-5 text-valiente-dark/30 hover:text-valiente-dark hover:bg-valiente-dark/5 p-2 rounded-full transition-all outline-none" aria-label="Cerrar detalles" data-astro-cid-mab5wary> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-mab5wary><line x1="18" y1="6" x2="6" y2="18" data-astro-cid-mab5wary></line><line x1="6" y1="6" x2="18" y2="18" data-astro-cid-mab5wary></line></svg> </button> <div class="w-10 h-1 bg-valiente-dark/10 rounded-full mb-6" data-astro-cid-mab5wary></div> <img${addAttribute(VALIENTE_TEXT_SRC, "src")} alt="Valiente" class="h-10 mb-6 opacity-[0.95]" data-astro-cid-mab5wary> <p class="font-body text-[1.05rem] leading-[1.7] text-valiente-dark/90" data-astro-cid-mab5wary>
Pensado exclusivamente para honrar el corazón de <strong data-astro-cid-mab5wary>madres, mujeres casadas y mujeres maduras</strong>, <strong data-astro-cid-mab5wary>Valiente</strong> es una conferencia inspiradora donde encontrarás tu tribu para tomar un café y compartir vida. Es un respiro espiritual preparado para que escuches la palabra de Dios, renueves tu mirada y crezcas profunda e íntimamente en tu relación con Él, cultivando tus convicciones y una fe sostenida por Su gracia infinita.
</p> <div className="mt-8 mb-2 w-full flex flex-col gap-4" data-astro-cid-mab5wary> ${renderComponent($$result, "InscribeteButton", InscribeteButton, { "client:load": true, "conferencia": "valiente", "variant": "dark", "className": "w-full py-4 text-base font-bold shadow-xl shadow-black/20", "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscribeteButton", "client:component-export": "InscribeteButton", "data-astro-cid-mab5wary": true }, { "default": ($$result2) => renderTemplate`
Aparta tu lugar por $130
` })} </div> </div> </dialog> </div> <div class="relative order-1 aspect-[4/3] min-h-[240px] md:order-2 md:aspect-auto md:min-h-[420px]" data-astro-cid-mab5wary> ${renderComponent($$result, "AutoImageCarousel", AutoImageCarousel, { "slides": VALIENTE_SLIDES, "intervalMs": 6e3, "className": "absolute inset-0", "sizes": "(max-width: 768px) 100vw, 50vw", "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/AutoImageCarousel", "client:component-export": "AutoImageCarousel", "data-astro-cid-mab5wary": true })} </div> </div> </div> `;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ValienteDetails.astro", void 0);

const stripePromise = loadStripe("pk_test_51TJniyRoz2YqsXbCUrcSKKezpuZHzFcqsmeZth6GttO4yA6zgEGMXArL8ThUAZIXhYk28JVOPxyFInrCi6ZSYwWl00LWcbNnsP");
function InscriptionModal({ open: propOpen, onClose, presetConferencia: propPreset = null }) {
  const titleId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [etapa, setEtapa] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [esCasa, setEsCasa] = useState("no");
  const [quienInvito, setQuienInvito] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [asistenteId, setAsistenteId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("verificando");
  const [ticketUrl, setTicketUrl] = useState("");
  const [nombreRespuesta, setNombreRespuesta] = useState("");
  const open = propOpen !== void 0 ? propOpen : internalOpen;
  const resetToForm = useCallback(() => {
    setEtapa("");
    setNombre("");
    setWhatsapp("");
    setStep(1);
    setClientSecret("");
    setAsistenteId("");
    setPaymentStatus("verificando");
  }, []);
  const handleClose = useCallback(() => {
    setInternalOpen(false);
    resetToForm();
    onClose?.();
  }, [onClose, resetToForm]);
  useEffect(() => {
    const handleOpenEvent = (e) => {
      const { conferencia: preset } = e.detail || {};
      if (preset) {
        setEtapa(preset);
      } else {
        resetToForm();
      }
      setInternalOpen(true);
    };
    window.addEventListener("open-inscription-modal", handleOpenEvent);
    return () => window.removeEventListener("open-inscription-modal", handleOpenEvent);
  }, [resetToForm]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get("session_id");
    if (session_id) {
      setInternalOpen(true);
      setStep(4);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetch(`/api/check-status?session_id=${session_id}`).then((res) => res.json()).then((data) => {
        if (data.nombre) setNombreRespuesta(data.nombre);
        if (data.payment_status === "unpaid") {
          setPaymentStatus("unpaid");
        } else if (data.payment_status === "paid") {
          setPaymentStatus("paid");
          setTicketUrl(`https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${session_id}.jpg`);
        }
      }).catch((err) => setPaymentStatus("verificando"));
    }
  }, []);
  useEffect(() => {
    if (open && propPreset) {
      setEtapa(propPreset);
    }
  }, [open, propPreset]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const fetchClientSecret = async (e) => {
    e.preventDefault();
    if (!nombre || !whatsapp || !etapa) return;
    setStep(2);
    try {
      const requestBody = {
        nombre,
        whatsapp,
        es_brave: etapa === "brave",
        es_casa: esCasa === "si",
        quien_invito: quienInvito
      };
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        const bucketUrl = `https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${data.sessionId}.jpg`;
        setTicketUrl(bucketUrl);
        setStep(3);
      } else {
        alert("Ups, no se pudo iniciar la sesión: " + (data.error || "Error deconocido"));
        setStep(1);
      }
    } catch (err) {
      alert("Error de red contactando al servidor.");
      setStep(1);
    }
  };
  if (!open) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "absolute inset-0 bg-black/55 backdrop-blur-[2px]",
            "aria-label": "Cerrar",
            onClick: handleClose
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            className: cn(
              "relative z-10 w-full overflow-hidden bg-white shadow-2xl transition-all duration-300",
              "max-h-[90dvh] max-w-lg rounded-2xl p-6 sm:p-8"
            ),
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleClose,
                  className: "absolute right-4 top-4 z-[210] rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 bg-white/80 backdrop-blur shadow-sm border border-neutral-200",
                  "aria-label": "Cerrar ventana",
                  children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M18 6 6 18M6 6l12 12" }) })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "h-full overflow-y-auto w-full flex flex-col items-center", children: [
                step === 1 && /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-bottom-2 duration-300 w-full", children: [
                  /* @__PURE__ */ jsx("h2", { id: titleId, className: "font-display pr-10 text-xl font-bold text-neutral-900 sm:text-2xl", children: "Inscripción" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-2 font-body text-sm text-neutral-600", children: "Completa tus datos para proceder al pago de tu lugar por $130 MXN (vía Stripe)." }),
                  /* @__PURE__ */ jsxs("form", { onSubmit: fetchClientSecret, className: "mt-6 space-y-5", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { htmlFor: "etapa", className: "block font-body text-sm font-medium text-neutral-800", children: "¿En qué etapa te encuentras?" }),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          id: "etapa",
                          required: true,
                          value: etapa,
                          onChange: (e) => setEtapa(e.target.value),
                          className: "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-body text-neutral-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/25",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona una opción" }),
                            /* @__PURE__ */ jsx("option", { value: "brave", children: "Universidad / Joven Profesional (Brave)" }),
                            /* @__PURE__ */ jsx("option", { value: "valiente", children: "Madre / Mujer Madura (Valiente)" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { htmlFor: "nombre", className: "block font-body text-sm font-medium text-neutral-800", children: "Nombre completo" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: "nombre",
                          type: "text",
                          required: true,
                          minLength: 2,
                          value: nombre,
                          onChange: (e) => setNombre(e.target.value),
                          placeholder: "Tu nombre y apellidos",
                          className: "mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("label", { htmlFor: "whatsapp", className: "block font-body text-sm font-medium text-neutral-800", children: "WhatsApp" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: "whatsapp",
                          type: "tel",
                          required: true,
                          minLength: 10,
                          value: whatsapp,
                          onChange: (e) => setWhatsapp(e.target.value),
                          placeholder: "Tu número a 10 dígitos",
                          className: "mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                        /* @__PURE__ */ jsx("label", { htmlFor: "esCasa", className: "block font-body text-sm font-medium text-neutral-800", children: "¿Eres de casa (VNP)?" }),
                        /* @__PURE__ */ jsxs(
                          "select",
                          {
                            id: "esCasa",
                            required: true,
                            value: esCasa,
                            onChange: (e) => setEsCasa(e.target.value),
                            className: "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-body text-neutral-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/25",
                            children: [
                              /* @__PURE__ */ jsx("option", { value: "no", children: "No" }),
                              /* @__PURE__ */ jsx("option", { value: "si", children: "Sí" })
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                        /* @__PURE__ */ jsx("label", { htmlFor: "quienInvito", className: "block font-body text-sm font-medium text-neutral-800", children: "¿Quién te invitó?" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "quienInvito",
                            type: "text",
                            value: quienInvito,
                            onChange: (e) => setQuienInvito(e.target.value),
                            placeholder: "Nombre de la persona",
                            className: "mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "submit",
                        className: "mt-2 w-full rounded-full bg-[#2F4A2C] py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#2F4A2C]/90 shadow-[0_4px_14px_rgba(47,74,44,0.3)]",
                        children: "Aparta tu lugar por $130"
                      }
                    )
                  ] })
                ] }),
                step === 2 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 mt-10 space-y-4 animate-in fade-in max-w-sm", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-t-[#2F4A2C] border-neutral-200 rounded-full animate-spin" }),
                  /* @__PURE__ */ jsx("p", { className: "text-neutral-600 font-medium font-body text-sm", children: "Conectando con Stripe..." })
                ] }),
                step === 3 && clientSecret && /* @__PURE__ */ jsx("div", { className: "w-full h-full flex-1 bg-white pt-10 pb-6 px-2 sm:px-6 animate-in zoom-in-95 duration-500", children: /* @__PURE__ */ jsx(
                  EmbeddedCheckoutProvider,
                  {
                    stripe: stripePromise,
                    options: { clientSecret },
                    children: /* @__PURE__ */ jsx(EmbeddedCheckout, {})
                  }
                ) }),
                step === 4 && /* @__PURE__ */ jsxs("div", { className: "w-full flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95", children: [
                  paymentStatus === "verificando" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-4", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-t-neutral-800 border-neutral-200 rounded-full animate-spin" }),
                    /* @__PURE__ */ jsx("p", { className: "text-neutral-600 font-body", children: "Verificando sesión con Stripe..." })
                  ] }),
                  paymentStatus === "unpaid" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 items-center flex flex-col max-w-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-sm border border-orange-200 mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
                    /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-bold text-neutral-900", children: "¡Tu ficha está lista!" }),
                    /* @__PURE__ */ jsx("p", { className: "font-body text-neutral-600 text-sm", children: "Has elegido pagar con OXXO. Te llegará el boleto oficial QR una vez que tu pago físico se procese en la sucursal (suele tardar unas horas)." }),
                    /* @__PURE__ */ jsx("button", { onClick: handleClose, className: "mt-8 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full font-body text-sm uppercase tracking-widest hover:bg-neutral-800 transition shadow", children: "Entendido, cerrar" })
                  ] }),
                  paymentStatus === "paid" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 items-center flex flex-col max-w-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm border border-green-200 mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: "3", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }),
                    /* @__PURE__ */ jsxs("h3", { className: "font-display text-2xl font-bold text-neutral-900", children: [
                      "¡Ya estás adentro, ",
                      nombreRespuesta.split(" ")[0],
                      "!"
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "font-body text-neutral-600 text-sm mt-2", children: "Recibimos exitosamente tu pago." }),
                    /* @__PURE__ */ jsx("a", { href: ticketUrl || "#", target: "_blank", rel: "noreferrer", className: "mt-6 block w-full bg-[#2F4A2C] text-white py-4 rounded-full font-body font-bold text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-transform", children: "↓ DESCARGAR BOLETO QR" }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-400 mt-6 !leading-relaxed", children: [
                      "Si el boleto da error o no carga enseguida, dale unos 15 segundos extra y vuelve a picarle (el servidor puede estar dibujándolo).",
                      /* @__PURE__ */ jsx("br", {}),
                      /* @__PURE__ */ jsx("br", {}),
                      "*No te preocupes si lo pierdes, también te enviaremos tu entrada más tarde por correo electrónico.*"
                    ] })
                  ] })
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
}

const $$ConferenceMujeresSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div data-conferencia-mujeres-section class="conferencia-root relative isolate min-h-screen text-black antialiased"> <div class="relative z-10 flex flex-col"> ${renderComponent($$result, "InscriptionModal", InscriptionModal, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscriptionModal", "client:component-export": "InscriptionModal" })} <div class="px-4 pb-4 pt-3 sm:px-5 sm:pb-6 sm:pt-5 md:px-6 md:pb-8 md:pt-6 lg:px-8 xl:px-10 2xl:px-12"> ${renderComponent($$result, "ConferenceHero", $$ConferenceHero, {})} </div> <div class="relative overflow-x-visible"> <!-- ═══════════════════════════════════════════
         SECCIÓN CENTRAL: ¿Qué es una conferencia?
         El corazón de la página
    ════════════════════════════════════════════ --> <section id="contenido" class="section-container scroll-mt-4 pb-12 pt-10 md:pb-16 md:pt-12"> <!-- Card único con hojas adentro --> <div class="relative rounded-[2.5rem] overflow-hidden bg-brave-dark-deep shadow-2xl"> <!-- Capas de profundidad --> <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,#4a6e3a,transparent_65%)]" aria-hidden="true"></div> <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,#1e3319,transparent_70%)]" aria-hidden="true"></div> <!-- 🌿 Fondo botánico completo --> <img src="/fondo.webp" alt="" aria-hidden="true" class="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-[0.08] z-0"> <!-- Overlay oscuro para legibilidad --> <div class="pointer-events-none absolute inset-0 bg-brave-dark-deep/70 z-[1]" aria-hidden="true"></div> <!-- Línea decorativa superior --> <div class="absolute z-10 top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div> <div class="relative z-10 px-8 py-12 md:px-14 md:py-16"> <!-- Eyebrow --> <p class="font-body text-[0.65rem] font-bold uppercase tracking-[0.5em] text-white mb-8">
La pregunta central
</p> <!-- Pregunta principal — el corazón --> <h2 class="font-display font-extrabold tracking-tight text-white leading-[1.08] text-[clamp(1.9rem,5.5vw,3.4rem)] max-w-2xl mb-10">
¿Qué es una<br> <span class="relative inline-block"> <span class="relative z-10">conferencia de</span> </span><br> <em class="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#a8c480] via-[#c8de9e] to-[#a8c480]">mujeres?</em> </h2> <!-- Separador con punto --> <div class="flex items-center gap-3 mb-10"> <div class="h-px w-10 bg-white/20"></div> <div class="h-2 w-2 rounded-full bg-[#a8c480]"></div> <div class="h-px flex-1 max-w-[5rem] bg-white/10"></div> </div> <!-- Respuesta / copy --> <p class="font-body text-[1.05rem] leading-[1.8] text-white max-w-xl mb-12">
Es un espacio sagrado para <strong class="font-semibold text-white">encontrarnos con Dios y entre nosotras</strong>.
            Un lugar donde la adoración abre el corazón, la enseñanza transforma la mente, y la comunidad fortalece el camino.
</p> <!-- Los tres pilares — fila horizontal con ícono de línea --> <div class="grid grid-cols-3 gap-4 mb-12 max-w-lg"> <div class="flex flex-col gap-2 animate-fade-in-up" style="animation-delay: 100ms;"> <div class="h-px w-full bg-white/15"></div> <p class="font-body text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#a8c480]">Adoración</p> <p class="font-body text-[0.75rem] text-white leading-snug">El corazón que adora</p> </div> <div class="flex flex-col gap-2 animate-fade-in-up" style="animation-delay: 200ms;"> <div class="h-px w-full bg-white/15"></div> <p class="font-body text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#a8c480]">Enseñanza</p> <p class="font-body text-[0.75rem] text-white leading-snug">La mente que crece</p> </div> <div class="flex flex-col gap-2 animate-fade-in-up" style="animation-delay: 300ms;"> <div class="h-px w-full bg-white/15"></div> <p class="font-body text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#a8c480]">Comunidad</p> <p class="font-body text-[0.75rem] text-white leading-snug">El lazo que une</p> </div> </div> <!-- Cita / frase poderosa --> <blockquote class="border-l-2 border-[#a8c480]/80 pl-6 mb-10"> <p class="font-display italic text-[1.1rem] leading-[1.7] text-white max-w-md">
"Dos encuentros con el mismo corazón, pensados para fortalecer tu fe y tu caminar."
</p> </blockquote> </div> <!-- /card --> </div> <!-- /wrapper botanico --> </section> <section id="encuentros" class="section-container scroll-mt-4 py-12 md:py-20"> ${renderComponent($$result, "EncuentrosGrid", $$EncuentrosGrid, {})} </section> <section class="section-container pb-20 md:pb-28"> ${renderComponent($$result, "BraveDetails", $$BraveDetails, {})} </section> <section class="section-container pb-16 md:pb-24"> ${renderComponent($$result, "ValienteDetails", $$ValienteDetails, {})} </section> <section class="section-container pb-20 md:pb-28"> <div class="relative overflow-hidden rounded-[2rem] bg-brave-dark-deep px-6 py-12 text-center shadow-xl md:px-12 md:py-16"> <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.12),transparent_55%)]" aria-hidden="true"></div> <div class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" aria-hidden="true"></div> <div class="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-forest/40 blur-2xl" aria-hidden="true"></div> <p class="font-body text-label font-semibold uppercase tracking-[0.28em] text-white/70">
No te pierdas tu lugar
</p> <h2 class="mt-4 font-display text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight text-white">
¿Lista para apartar tu lugar?
</h2> <p class="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-white/90 sm:text-lg">
Completa tu inscripción y recibe los datos de transferencia. Te esperamos en Brave y Valiente.
</p> <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 relative z-50"> ${renderComponent($$result, "InscribeteButton", InscribeteButton, { "client:load": true, "variant": "light", "className": "px-5 py-2.5 sm:px-10 sm:py-4 border-2 border-neutral-900 shadow-[0_0_40px_-12px_rgba(255,255,255,0.4)] ring-4 ring-white/20 font-bold", "client:component-hydration": "load", "client:component-path": "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscribeteButton", "client:component-export": "InscribeteButton" })} </div> </div> </section> </div> <!-- /relative z-10 flex flex-col --> </div></div>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ConferenceMujeresSection.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Conferencia de Mujeres 2026", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, { "data-astro-cid-j7pv25f6": true })} ${maybeRenderHead()}<main data-astro-cid-j7pv25f6> ${renderComponent($$result2, "ConferenceMujeresSection", $$ConferenceMujeresSection, { "data-astro-cid-j7pv25f6": true })} </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-j7pv25f6": true })} ` })} `;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/index.astro", void 0);

const $$file = "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
