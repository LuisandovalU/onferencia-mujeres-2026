"use client";

import { PAGO_PRODUCTO_LABEL } from "@/config/pago";
import {
  ETAPA_LABEL,
  TRANSFERENCIA_COPY,
  WHATSAPP_ENVIO_ITEMS,
  WHATSAPP_NUMERO,
  type ConferenciaKey,
} from "@/config/transferencia";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

type Step = "form" | "resultado";

const ETAPA_A_CONFERENCIA: Record<string, ConferenciaKey> = {
  "brave": "brave",
  "valiente": "valiente",
};

interface InscriptionModalProps {
  open?: boolean;
  onClose?: () => void;
  presetConferencia?: ConferenciaKey | null;
}

function buildWhatsAppMessage(nombre: string, conferencia: ConferenciaKey) {
  const producto = PAGO_PRODUCTO_LABEL[conferencia];
  const etapa = ETAPA_LABEL[conferencia];
  return [
    `Hola, quiero confirmar mi registro para ${producto}.`,
    `Nombre: ${nombre}`,
    `Etapa: ${etapa}`,
    "",
    "Adjunto foto o captura del comprobante de transferencia.",
  ].join("\n");
}

export function InscriptionModal({ open: propOpen, onClose, presetConferencia: propPreset = null }: InscriptionModalProps) {
  const titleId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [etapa, setEtapa] = useState("");
  const [nombre, setNombre] = useState("");
  const [conferencia, setConferencia] = useState<ConferenciaKey | null>(null);

  const open = propOpen !== undefined ? propOpen : internalOpen;

  const resetToForm = useCallback(() => {
    setStep("form");
    setEtapa("");
    setNombre("");
    setConferencia(null);
  }, []);

  const handleClose = useCallback(() => {
    setInternalOpen(false);
    resetToForm();
    onClose?.();
  }, [onClose, resetToForm]);

  useEffect(() => {
    const handleOpenEvent = (e: any) => {
      const { conferencia: preset } = e.detail || {};
      if (preset) {
        setConferencia(preset);
        setStep("resultado");
      } else {
        resetToForm();
      }
      setInternalOpen(true);
    };

    window.addEventListener('open-inscription-modal', handleOpenEvent);
    return () => window.removeEventListener('open-inscription-modal', handleOpenEvent);
  }, [resetToForm]);

  useEffect(() => {
    if (!open) {
      resetToForm();
      return;
    }
    if (propPreset) {
      setStep("resultado");
      setConferencia(propPreset);
    }
  }, [open, propPreset, resetToForm]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = ETAPA_A_CONFERENCIA[etapa];
    if (!key || nombre.trim().length < 2) return;
    setConferencia(key);
    setStep("resultado");
  };

  const waHref = useMemo(() => {
    if (!conferencia || nombre.trim().length < 2) return `https://wa.me/${WHATSAPP_NUMERO}`;
    const text = buildWhatsAppMessage(nombre.trim(), conferencia);
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(text)}`;
  }, [conferencia, nombre]);

  if (!open) return null;

  const transferCopy = conferencia ? TRANSFERENCIA_COPY[conferencia] : null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={handleClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Cerrar ventana"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {step === "form" && (
          <>
            <h2 id={titleId} className="font-display pr-10 text-xl font-bold text-neutral-900 sm:text-2xl">
              Inscripción
            </h2>
            <p className="mt-2 font-body text-sm text-neutral-600">
              Completa los datos para ver la información de transferencia y apartar tu lugar.{" "}
              <span className="text-neutral-500">
                Asegúrate de seleccionar la etapa que mejor describa tu momento de vida actual.
              </span>
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="etapa" className="block font-body text-sm font-medium text-neutral-800">
                  ¿En qué etapa te encuentras?
                </label>
                <select
                  id="etapa"
                  required
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-body text-neutral-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/25"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="brave">Universidad / Joven Profesional (Brave)</option>
                  <option value="valiente">Madre / Mujer Madura (Valiente)</option>
                </select>
              </div>
              <div>
                <label htmlFor="nombre" className="block font-body text-sm font-medium text-neutral-800">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-forest py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-forest/90"
              >
                Ver datos de transferencia
              </button>
            </form>
          </>
        )}

        {step === "resultado" && conferencia && transferCopy && (
          <>
            <h2 id={titleId} className="font-display pr-10 text-xl font-bold text-neutral-900 sm:text-2xl">
              {PAGO_PRODUCTO_LABEL[conferencia]}
            </h2>
            <p className="mt-2 font-body text-sm text-neutral-600">
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-800">
                Etapa: {ETAPA_LABEL[conferencia]}
              </span>
            </p>

            {nombre.trim().length < 2 ? (
              <div className="mt-6">
                <label htmlFor="nombre-resultado" className="block font-body text-sm font-medium text-neutral-800">
                  Nombre completo
                </label>
                <input
                  id="nombre-resultado"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                />
              </div>
            ) : (
              <p className="mt-4 font-body text-sm text-neutral-600">
                Nombre: <strong className="text-neutral-900">{nombre.trim()}</strong>
              </p>
            )}

            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="font-body text-sm font-semibold text-neutral-900">{transferCopy.titulo}</p>
              <ul className="mt-3 space-y-2 font-body text-sm text-neutral-700">
                {transferCopy.lineas.map((linea, i) => (
                  <li key={`${i}-${linea.slice(0, 24)}`} className="leading-snug">
                    {linea}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="font-body text-sm font-medium text-neutral-800">Después de transferir, envía por WhatsApp:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 font-body text-sm text-neutral-600">
                {WHATSAPP_ENVIO_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {nombre.trim().length < 2 ? (
              <button
                type="button"
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-full bg-neutral-200 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Enviar por WhatsApp
              </button>
            ) : (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center rounded-full bg-[#25D366] py-3.5 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#20bd5a]"
              >
                Enviar por WhatsApp
              </a>
            )}

            <p className="mt-4 text-center font-body text-xs text-neutral-500">
              También puedes escribirnos sin mensaje preparado:{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-forest underline"
              >
                abrir WhatsApp
              </a>
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-full border-2 border-neutral-300 bg-white py-3 font-body text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
            >
              Cerrar
            </button>
            {!propPreset && (
              <button
                type="button"
                onClick={resetToForm}
                className="mt-3 w-full rounded-full py-3 font-body text-sm font-medium text-neutral-600 underline-offset-2 transition hover:text-neutral-900 hover:underline"
              >
                Nueva consulta
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
