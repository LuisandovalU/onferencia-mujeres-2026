/**
 * Arranca `next dev` y abre el navegador cuando responde.
 * - Escucha en 0.0.0.0 (no solo 127.0.0.1) para que funcione con http://localhost:3000/
 * - OPEN_BROWSER=0 para no abrir el navegador automáticamente
 * - PORT=3001 pnpm dev — otro puerto si 3000 está ocupado
 */
import { execFile, spawn } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "3000";
/** Usar localhost en el navegador: suele funcionar mejor que 127.0.0.1 en vistas previas del IDE */
const openUrl = `http://localhost:${port}/`;

function openBrowser() {
  if (process.env.OPEN_BROWSER === "0") return;
  if (process.platform === "darwin") {
    execFile("open", [openUrl], () => {});
  } else if (process.platform === "win32") {
    execFile("cmd", ["/c", "start", "", openUrl], () => {});
  } else {
    execFile("xdg-open", [openUrl], () => {});
  }
}

let browserOpened = false;

function waitForServer() {
  if (browserOpened) return;
  const req = http.get(openUrl, (res) => {
    res.resume();
    if (!browserOpened) {
      browserOpened = true;
      openBrowser();
    }
  });
  req.on("error", () => setTimeout(waitForServer, 400));
  req.setTimeout(3000, () => {
    req.destroy();
    if (!browserOpened) setTimeout(waitForServer, 250);
  });
}

console.log(`
  Conferencia Mujeres — servidor de desarrollo
  ───────────────────────────────────────────
  En el navegador abre (con el servidor ya en marcha):

    ${openUrl}

  Si ves la página en blanco: recarga (Cmd+R) o prueba en Chrome/Safari fuera del IDE.
`);

const child = spawn(
  "pnpm",
  ["exec", "next", "dev", "-H", "0.0.0.0", "-p", port],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
  }
);

setTimeout(waitForServer, 600);

child.on("exit", (code) => process.exit(code ?? 0));
