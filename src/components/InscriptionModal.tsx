"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useState, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { supabase } from "@/lib/supabase"; // asumiendo alias

type ConferenciaKey = "brave" | "valiente";

interface InscriptionModalProps {
  open?: boolean;
  onClose?: () => void;
  presetConferencia?: ConferenciaKey | null;
}

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function InscriptionModal({ open: propOpen, onClose, presetConferencia: propPreset = null }: InscriptionModalProps) {
  const titleId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Estados del Formulario
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [etapa, setEtapa] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [esCasa, setEsCasa] = useState("no");
  const [quienInvito, setQuienInvito] = useState("");
  
  // Estados de Stripe y Status
  const [clientSecret, setClientSecret] = useState('');
  const [asistenteId, setAsistenteId] = useState('');
  
  const [paymentStatus, setPaymentStatus] = useState<"verificando" | "paid" | "unpaid">("verificando");
  const [ticketUrl, setTicketUrl] = useState('');
  const [nombreRespuesta, setNombreRespuesta] = useState("");

  const open = propOpen !== undefined ? propOpen : internalOpen;

  const resetToForm = useCallback(() => {
    setEtapa("");
    setNombre("");
    setWhatsapp("");
    setStep(1);
    setClientSecret('');
    setAsistenteId('');
    setPaymentStatus("verificando");
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
        setEtapa(preset);
      } else {
        resetToForm();
      }
      setInternalOpen(true);
    };

    window.addEventListener('open-inscription-modal', handleOpenEvent);
    return () => window.removeEventListener('open-inscription-modal', handleOpenEvent);
  }, [resetToForm]);

  // 1. Efecto persistente para capturar el regreso de Stripe, independiente del estado open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get('session_id');
    
    if (session_id) {
       // Obligamos a la ventana a abrirse sola mágicamente
       setInternalOpen(true);
       setStep(4);
       
       // Limpiar la URL para que no vuelva a abrirse si actualizan la página mañana
       window.history.replaceState({}, document.title, window.location.pathname);
       
       fetch(`/api/check-status?session_id=${session_id}`)
         .then(res => res.json())
         .then(data => {
            if (data.nombre) setNombreRespuesta(data.nombre);

            if (data.payment_status === "unpaid") {
              setPaymentStatus("unpaid");
            } else if (data.payment_status === "paid") {
              setPaymentStatus("paid");
              setTicketUrl(`https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${session_id}.jpg`);
            }
         })
         .catch(err => setPaymentStatus("verificando")); 
    }
  }, []); // Solo se ejecuta una vez al montar

  // 2. Efecto de sincronización para mantener la Etapa
  useEffect(() => {
    if (open && propPreset) {
      setEtapa(propPreset);
    }
  }, [open, propPreset]);

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

  // Manejador del ciclo Stripe Embedded
  const fetchClientSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !whatsapp || !etapa) return;

    setStep(2); // Loading

    try {
      const requestBody = {
        nombre: nombre,
        whatsapp: whatsapp,
        es_brave: etapa === 'brave',
        es_casa: esCasa === "si",
        quien_invito: quienInvito
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        
        // El frontend asume que el backend generará el ticket JPG con el nombre del ID de Stripe.
        const bucketUrl = `https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/${data.sessionId}.jpg`;
        setTicketUrl(bucketUrl);

        setStep(3); // Muestra Stripe
      } else {
        alert("Ups, no se pudo iniciar la sesión: " + (data.error || 'Error deconocido'));
        setStep(1);
      }
    } catch (err) {
      alert("Error de red contactando al servidor.");
      setStep(1);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"

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
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full overflow-hidden bg-white shadow-2xl transition-all duration-300",
          "max-h-[90dvh] max-w-lg rounded-2xl p-6 sm:p-8"
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-[210] rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 bg-white/80 backdrop-blur shadow-sm border border-neutral-200"
          aria-label="Cerrar ventana"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="h-full overflow-y-auto w-full flex flex-col items-center">
          
          {/* PASO 1: Formulario Original */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
              <h2 id={titleId} className="font-display pr-10 text-xl font-bold text-neutral-900 sm:text-2xl">
                Inscripción
              </h2>
              <p className="mt-2 font-body text-sm text-neutral-600">
                Completa tus datos para proceder al pago de tu lugar por $130 MXN (vía Stripe).
              </p>

              <form onSubmit={fetchClientSecret} className="mt-6 space-y-5">
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
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre y apellidos"
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block font-body text-sm font-medium text-neutral-800">
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    minLength={10}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Tu número a 10 dígitos"
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="esCasa" className="block font-body text-sm font-medium text-neutral-800">
                      ¿Eres de casa (VNP)?
                    </label>
                    <select
                      id="esCasa"
                      required
                      value={esCasa}
                      onChange={(e) => setEsCasa(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-body text-neutral-900 outline-none focus:border-forest focus:ring-2 focus:ring-forest/25"
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="quienInvito" className="block font-body text-sm font-medium text-neutral-800">
                      ¿Quién te invitó?
                    </label>
                    <input
                      id="quienInvito"
                      type="text"
                      value={quienInvito}
                      onChange={(e) => setQuienInvito(e.target.value)}
                      placeholder="Nombre de la persona"
                      className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-body text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-forest focus:ring-2 focus:ring-forest/25"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#2F4A2C] py-3.5 font-body text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#2F4A2C]/90 shadow-[0_4px_14px_rgba(47,74,44,0.3)]"
                >
                  Aparta tu lugar por $130
                </button>
              </form>
            </div>
          )}

          {/* PASO 2: Cargando */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-20 mt-10 space-y-4 animate-in fade-in max-w-sm">
              <div className="w-10 h-10 border-4 border-t-[#2F4A2C] border-neutral-200 rounded-full animate-spin"></div>
              <p className="text-neutral-600 font-medium font-body text-sm">Conectando con Stripe...</p>
            </div>
          )}

          {/* PASO 3: Pasarela de Stripe Full Width */}
          {step === 3 && clientSecret && (
            <div className="w-full h-full flex-1 bg-white pt-10 pb-6 px-2 sm:px-6 animate-in zoom-in-95 duration-500">
                 <EmbeddedCheckoutProvider
                   stripe={stripePromise}
                   options={{ clientSecret }}
                 >
                   <EmbeddedCheckout />
                 </EmbeddedCheckoutProvider>
            </div>
          )}

          {/* PASO 4: Éxito o Pendiente de OXXO */}
          {step === 4 && (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
              
              {paymentStatus === "verificando" && (
                 <div className="flex flex-col items-center space-y-4">
                   <div className="w-10 h-10 border-4 border-t-neutral-800 border-neutral-200 rounded-full animate-spin"></div>
                   <p className="text-neutral-600 font-body">Verificando sesión con Stripe...</p>
                 </div>
              )}

              {paymentStatus === "unpaid" && (
                <div className="space-y-4 items-center flex flex-col max-w-sm">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-sm border border-orange-200 mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-neutral-900">¡Tu ficha está lista!</h3>
                  <p className="font-body text-neutral-600 text-sm">
                    Has elegido pagar con OXXO. Te llegará el boleto oficial QR una vez que tu pago físico se procese en la sucursal (suele tardar unas horas).
                  </p>
                  <button onClick={handleClose} className="mt-8 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full font-body text-sm uppercase tracking-widest hover:bg-neutral-800 transition shadow">
                    Entendido, cerrar
                  </button>
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="space-y-4 items-center flex flex-col max-w-sm">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 shadow-sm border border-green-200 mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-neutral-900">
                    ¡Ya estás adentro, {nombreRespuesta.split(' ')[0]}!
                  </h3>
                  <p className="font-body text-neutral-600 text-sm mt-2">
                    Recibimos exitosamente tu pago.
                  </p>
                  
                  <a href={ticketUrl || '#'} target="_blank" rel="noreferrer" className="mt-6 block w-full bg-[#2F4A2C] text-white py-4 rounded-full font-body font-bold text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-transform">
                    ↓ DESCARGAR BOLETO QR 
                  </a>

                  <p className="text-xs text-neutral-400 mt-6 !leading-relaxed">
                    Si el boleto da error o no carga enseguida, dale unos 15 segundos extra y vuelve a picarle (el servidor puede estar dibujándolo). 
                    <br/><br/>
                    *No te preocupes si lo pierdes, también te enviaremos tu entrada más tarde por correo electrónico.*
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
