/**
 * Rutas a archivos en `/public` cuando el sitio usa subcarpeta
 * (Mismo valor que `base` en `astro.config.mjs`).
 * Úsalo en `url(...)` y strings para asegurar rutas correctas.
 */
export function publicPath(path: string): string {
  const base = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // En Astro, BASE_URL suele ser '/' por defecto, no necesitamos concatenarlo si es solo '/'
  if (base === "" || base === "/") return normalized;
  return `${base}${normalized}`;
}
