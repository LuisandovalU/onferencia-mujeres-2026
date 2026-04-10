import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DniHn0Hs.mjs';
import { manifest } from './manifest_CyNtK3AL.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/checkin.astro.mjs');
const _page2 = () => import('./pages/admin/registro-manual.astro.mjs');
const _page3 = () => import('./pages/api/admin/register-manual.astro.mjs');
const _page4 = () => import('./pages/api/admin/update-payment.astro.mjs');
const _page5 = () => import('./pages/api/admin/verify-password.astro.mjs');
const _page6 = () => import('./pages/api/check-status.astro.mjs');
const _page7 = () => import('./pages/api/checkout.astro.mjs');
const _page8 = () => import('./pages/api/download-ticket.astro.mjs');
const _page9 = () => import('./pages/api/webhook.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/checkin.astro", _page1],
    ["src/pages/admin/registro-manual.astro", _page2],
    ["src/pages/api/admin/register-manual.ts", _page3],
    ["src/pages/api/admin/update-payment.ts", _page4],
    ["src/pages/api/admin/verify-password.ts", _page5],
    ["src/pages/api/check-status.ts", _page6],
    ["src/pages/api/checkout.ts", _page7],
    ["src/pages/api/download-ticket.ts", _page8],
    ["src/pages/api/webhook.ts", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "da4272e2-e0f9-4dc6-9ac8-05261440b00a",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
