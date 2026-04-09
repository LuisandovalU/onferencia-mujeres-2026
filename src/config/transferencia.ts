export type ConferenciaKey = "brave" | "valiente";

/** Brave: Univ/Trabajo · Valiente: Madres/Maduras */
export const ETAPA_LABEL: Record<ConferenciaKey, string> = {
  brave: "Universitarias y Jóvenes Profesionales",
  valiente: "Madres y Mujeres Maduras",
};

export const TRANSFERENCIA_COPY: Record<
  ConferenciaKey,
  { titulo: string; lineas: string[] }
> = {
  brave: {
    titulo: "Conferencia Brave — datos de transferencia",
    lineas: [
      "Banco: (nombre del banco)",
      "Titular: (nombre de la iglesia o cuenta)",
      "CLABE o número de cuenta: 0000 0000 0000 000000",
      "Concepto: Brave + tu nombre",
      "Importe sugerido: (opcional)",
    ],
  },
  valiente: {
    titulo: "Conferencia Valiente — datos de transferencia",
    lineas: [
      "Banco: (nombre del banco)",
      "Titular: (nombre de la iglesia o cuenta)",
      "CLABE o número de cuenta: 0000 0000 0000 000000",
      "Concepto: Valiente + tu nombre",
      "Importe sugerido: (opcional)",
    ],
  },
};

/** Instrucciones para el mensaje de WhatsApp tras transferir */
export const WHATSAPP_ENVIO_ITEMS = [
  "Captura de pantalla o foto del comprobante de transferencia.",
  "Tu nombre completo.",
  "Tu etapa o conferencia (Brave/Valiente).",
];

const DEFAULT_WA = "5210000000000";

/** Número para wa.me (solo dígitos, código de país sin +). Opcional: `NEXT_PUBLIC_WHATSAPP` en `.env` */
export const WHATSAPP_NUMERO =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP
    ? process.env.NEXT_PUBLIC_WHATSAPP.replace(/\D/g, "") || DEFAULT_WA
    : DEFAULT_WA;
