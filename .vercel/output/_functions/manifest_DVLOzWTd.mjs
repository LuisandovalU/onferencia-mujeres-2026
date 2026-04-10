import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_DrLJit2O.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_G4odl8Oy.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/","cacheDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/node_modules/.astro/","outDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/dist/","srcDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/src/","publicDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/public/","buildClientDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/dist/client/","buildServerDir":"file:///Users/luisalbertosandovalramos/Downloads/Pagina%20Confe/section-conferencia-mujeres/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/checkin.CJAeZQmY.css"}],"routeData":{"route":"/admin/checkin","isIndex":false,"type":"page","pattern":"^\\/admin\\/checkin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"checkin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/checkin.astro","pathname":"/admin/checkin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/checkin.CJAeZQmY.css"},{"type":"external","src":"/_astro/registro-manual.B3Gux0x-.css"}],"routeData":{"route":"/admin/registro-manual","isIndex":false,"type":"page","pattern":"^\\/admin\\/registro-manual\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"registro-manual","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/registro-manual.astro","pathname":"/admin/registro-manual","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/register-manual","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/register-manual\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"register-manual","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/register-manual.ts","pathname":"/api/admin/register-manual","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/update-payment","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/update-payment\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"update-payment","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/update-payment.ts","pathname":"/api/admin/update-payment","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/verify-password","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/verify-password\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"verify-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/verify-password.ts","pathname":"/api/admin/verify-password","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/check-status","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/check-status\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"check-status","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/check-status.ts","pathname":"/api/check-status","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/checkout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/checkout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"checkout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/checkout.ts","pathname":"/api/checkout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/download-ticket","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/download-ticket\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"download-ticket","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/download-ticket.ts","pathname":"/api/download-ticket","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/webhook","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/webhook\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"webhook","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/webhook.ts","pathname":"/api/webhook","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/checkin.CJAeZQmY.css"},{"type":"external","src":"/_astro/registro-manual.B3Gux0x-.css"},{"type":"inline","content":"@keyframes hero-scroll-arrow{0%,to{transform:translateY(0)}50%{transform:translateY(6px)}}.animate-hero-scroll-arrow[data-astro-cid-tnlla3pe]{animation:hero-scroll-arrow 2s ease-in-out infinite}dialog[data-astro-cid-kr6kanwd][open]{animation:scale-up .5s cubic-bezier(.16,1,.3,1) forwards}dialog[data-astro-cid-kr6kanwd]::backdrop{animation:fade-in .5s ease-out forwards}dialog[data-astro-cid-mab5wary][open]{animation:scale-up .5s cubic-bezier(.16,1,.3,1) forwards}dialog[data-astro-cid-mab5wary]::backdrop{animation:fade-in .5s ease-out forwards}@keyframes scale-up{0%{opacity:0;transform:scale(.9) translateY(15px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes fade-in{0%{opacity:0;backdrop-filter:blur(0px);background:#0000}to{opacity:1;backdrop-filter:blur(8px);background:#00000080}}main[data-astro-cid-j7pv25f6]{min-height:100vh}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/checkin.astro",{"propagation":"none","containsHead":true}],["/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/admin/registro-manual.astro",{"propagation":"none","containsHead":true}],["/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/admin/checkin@_@astro":"pages/admin/checkin.astro.mjs","\u0000@astro-page:src/pages/admin/registro-manual@_@astro":"pages/admin/registro-manual.astro.mjs","\u0000@astro-page:src/pages/api/admin/register-manual@_@ts":"pages/api/admin/register-manual.astro.mjs","\u0000@astro-page:src/pages/api/admin/update-payment@_@ts":"pages/api/admin/update-payment.astro.mjs","\u0000@astro-page:src/pages/api/admin/verify-password@_@ts":"pages/api/admin/verify-password.astro.mjs","\u0000@astro-page:src/pages/api/check-status@_@ts":"pages/api/check-status.astro.mjs","\u0000@astro-page:src/pages/api/checkout@_@ts":"pages/api/checkout.astro.mjs","\u0000@astro-page:src/pages/api/download-ticket@_@ts":"pages/api/download-ticket.astro.mjs","\u0000@astro-page:src/pages/api/webhook@_@ts":"pages/api/webhook.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DVLOzWTd.mjs","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_QqYvuCSM.mjs","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/lib/ticket-generator.ts":"chunks/ticket-generator_D_nHyrib.mjs","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscriptionModal":"_astro/InscriptionModal.BqwoOSKM.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/InscribeteButton":"_astro/InscribeteButton.UXwHYdGm.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ConferenceChoiceCard":"_astro/ConferenceChoiceCard.CB87Jbyn.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/AutoImageCarousel":"_astro/AutoImageCarousel.BY_GOjKT.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/ManualRegistrationForm":"_astro/ManualRegistrationForm.XJhnx9Kl.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/CheckinScanner":"_astro/CheckinScanner.DbttfyQ0.js","@astrojs/react/client.js":"_astro/client.C_djbAeA.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/components/BotanicalBackground.astro?astro&type=script&index=0&lang.ts":"_astro/BotanicalBackground.astro_astro_type_script_index_0_lang.cHVVTvCk.js","/Users/luisalbertosandovalramos/Downloads/Pagina Confe/section-conferencia-mujeres/src/lib/supabase.ts":"_astro/supabase.CSUl2_si.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/hero-botanical-bg.42uN9XSK.webp","/_astro/brave-carousel-3.C-a70UYK.webp","/_astro/brave-carousel-2.DMpLevj9.webp","/_astro/brave.DqMB_1Xm.webp","/_astro/brave-carousel-1.HjHKZpvL.webp","/_astro/brave-carousel-4.yXIS7Bcv.webp","/_astro/brave-carousel-5.8Im4pz7D.webp","/_astro/valiente-carousel-1.C7lrDNIe.webp","/_astro/valiente-carousel-2.DnfjRpFy.webp","/_astro/valiente-carousel-4.DXcFNdVP.webp","/_astro/valiente.o3iPgJpy.webp","/_astro/valiente-carousel-5.D-MdovVR.webp","/_astro/valiente-carousel-3.CBuafWTL.webp","/_astro/checkin.CJAeZQmY.css","/_astro/registro-manual.B3Gux0x-.css","/favicon.svg","/fondo.webp","/_astro/AutoImageCarousel.BY_GOjKT.js","/_astro/BotanicalBackground.astro_astro_type_script_index_0_lang.cHVVTvCk.js","/_astro/CheckinScanner.DbttfyQ0.js","/_astro/ConferenceChoiceCard.CB87Jbyn.js","/_astro/InscribeteButton.UXwHYdGm.js","/_astro/InscriptionModal.BqwoOSKM.js","/_astro/ManualRegistrationForm.XJhnx9Kl.js","/_astro/client.C_djbAeA.js","/_astro/index.BjMO2Iku.js","/_astro/jsx-runtime.BXvALnih.js","/_astro/proxy.C8eLH2J9.js","/_astro/supabase.CSUl2_si.js","/_astro/utils.C8nBGPD0.js","/fonts/Montserrat-Bold.ttf","/fonts/Nunito-Bold.ttf","/plantas/version1.webp","/plantas/version2.webp","/plantas/version3.webp"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"+buxmj01axLVutaxowOKTGHtrEZO3UXi6Uw/s2Lmg10="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
