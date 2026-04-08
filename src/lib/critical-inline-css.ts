/**
 * Va en <head> inline: si el CSS de Astro no carga por alguna razón,
 * el sitio sigue teniendo tipografía y espaciado mínimos.
 * Usa :where() (especificidad 0) para no pisar a Tailwind cuando sí carga.
 */
export const CRITICAL_INLINE_CSS = [
  `:where(html,body){margin:0;padding:0}`,
  `:where(body){min-height:100vh;background:#f5f5f5;color:#171717;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}`,
  `:where(main){display:block;min-height:100vh}`,
  `:where([data-conferencia-mujeres-section]){box-sizing:border-box;min-height:100vh;color:#171717}`,
  `:where(.section-container){width:100%;max-width:96rem;margin:0 auto;padding-left:1rem;padding-right:1rem}`,
  `@media(min-width:768px){:where(.section-container){padding-left:1.5rem;padding-right:1.5rem}}`,
  `:where(img){max-width:100%;height:auto;display:block}`,
].join("");
