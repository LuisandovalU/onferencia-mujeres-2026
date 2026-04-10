import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, n as renderScript, k as renderHead, l as renderComponent, o as renderSlot, h as createAstro } from './astro/server_DrLJit2O.mjs';
import 'piccolore';
/* empty css                                   */
import 'clsx';

const $$BotanicalBackground = createComponent(($$result, $$props, $$slots) => {
  const plants = ["version1.webp", "version2.webp", "version3.webp"];
  const parallaxGroups = ["up", "down", "left", "right"];
  const backgroundPlants = [];
  const totalItems = 24;
  for (let i = 0; i < totalItems; i++) {
    const plantIndex = i % plants.length;
    const file = plants[plantIndex];
    const group = parallaxGroups[i % parallaxGroups.length];
    const scale = 1.25;
    backgroundPlants.push({ file, group, scale });
  }
  return renderTemplate`<!-- Botanical background: Perfectly tiled flexbox grid (Zero Overlap) -->${maybeRenderHead()}<div class="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden flex flex-wrap content-start mix-blend-multiply" aria-hidden="true" id="botanical-container"> ${backgroundPlants.map((plant, index) => {
    const isPriority = index < 8;
    return renderTemplate`<div class="w-1/2 md:w-1/4 aspect-square overflow-hidden"> <img${addAttribute(`/plantas/${plant.file}`, "src")} alt=""${addAttribute(plant.group, "data-parallax-group")}${addAttribute(plant.scale, "data-parallax-scale")} class="w-full h-full object-cover planta-parallax will-change-transform"${addAttribute(isPriority ? "eager" : "lazy", "loading")}${addAttribute(isPriority ? "high" : "auto", "fetchpriority")}${addAttribute(isPriority ? "sync" : "async", "decoding")}${addAttribute(`
            opacity: 0.15;
            transform: scale(1.1); /* Estabilizaci\xF3n inicial para evitar salto de JS */
          `, "style")}> </div>`;
  })} </div> ${renderScript($$result, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/BotanicalBackground.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/BotanicalBackground.astro", void 0);

const heroBotanicalBg = new Proxy({"src":"/_astro/hero-botanical-bg.42uN9XSK.webp","width":2560,"height":1808,"format":"webp"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/assets/hero-botanical-bg.webp";
							}
							
							return target[name];
						}
					});

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "Conferencia de Mujeres 2026",
    description = "Conferencia de Mujeres \u2014 Valiente y Brave",
    image = "/og-image.png"
  } = Astro2.props;
  return renderTemplate`<html lang="es" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}><!-- 1. Preconnects & High-Priority Assets --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload"${addAttribute(heroBotanicalBg.src, "href")} as="image" fetchpriority="high"><link rel="preload" href="/plantas/version1.webp" as="image" fetchpriority="high"><link rel="preload" href="/plantas/version2.webp" as="image" fetchpriority="high"><link rel="preload" href="/plantas/version3.webp" as="image" fetchpriority="high"><!-- 2. Critical Path Inline CSS (Antigravity Architecture) --><style>
			:root {
				--hero-bg-skeleton: radial-gradient(circle at center, #2d4a24 0%, #0a0a0a 100%);
			}
			html {
				background: #0a0a0a;
				overflow-x: hidden;
				scroll-behavior: smooth;
				-webkit-text-size-adjust: 100%;
				-webkit-font-smoothing: antialiased;
			}
			body {
				margin: 0;
				min-height: 100vh;
				overflow-x: hidden;
				scroll-behavior: smooth;
			}
			/* Silk transition initial state */
			.hero-image-silk {
				opacity: 0;
				transition: opacity 1.2s cubic-bezier(0.23, 1, 0.32, 1);
			}
			.hero-image-silk.loaded {
				opacity: 1;
			}
		</style><!-- 3. Fonts & Styles (Pre-Tailwind) --><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Nunito:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(Astro2.url, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(new URL(image, Astro2.url), "content")}><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(Astro2.url, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(new URL(image, Astro2.url), "content")}>${renderHead()}</head> <body class="min-h-screen bg-[#f5f5f5] antialiased relative z-0"> ${renderComponent($$result, "BotanicalBackground", $$BotanicalBackground, {})} <div class="relative z-10 flex flex-col min-h-screen"> ${renderSlot($$result, $$slots["default"])} </div> </body></html>`;
}, "/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/layouts/Layout.astro", void 0);

export { $$Layout as $, heroBotanicalBg as h };
