import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

// Llama a tu Public Key de test o prod
const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function RegistrationFlow({ esBrave }: { esBrave: boolean }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({ nombre: '', whatsapp: '' });
  const [clientSecret, setClientSecret] = useState('');
  const [asistenteId, setAsistenteId] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');

  const themeColor = esBrave ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700';
  const focusRing = esBrave ? 'focus:ring-orange-500' : 'focus:ring-emerald-500';

  const fetchClientSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.whatsapp) return;

    setStep(2); // Estado de carga (Loading)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          whatsapp: formData.whatsapp,
          es_brave: esBrave
        })
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setAsistenteId(data.asistenteId);
        setStep(3); // Estado de Checkout
      } else {
        alert("Hubo un problema inicializando el pago.");
        setStep(1);
      }
    } catch (err) {
      alert("Error de red");
      setStep(1);
    }
  };

  // Escuchando eventos cuando StripeEmbedded está activo (si la persona paga y regresa a "return_url")
  useEffect(() => {
    // Si estuviéramos en la ruta de éxito (por ej: ?session_id=CS_...)
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');
    
    // Si la URL recibe el session_id, brincar de inmediato al final. O si usas webhook,
    // Embedded Checkout intercepta de manera similar o manda a tú página de retorno.
    if (sessionId) {
      setStep(4);
      // Extraemos el id de la sesion para buscar su boleto
      // Idealmente, Stripe redirige aquí al terminar.
    }
  }, []);

  // Simulación para escuchar la aparición del ticket en step 4 (después de confirmación)
  useEffect(() => {
    if (step === 4) {
      // Como webhook.ts ya está generándolo de fondo, solo calculamos la URL pública
      const url = supabase.storage.from('tickets').getPublicUrl(`${asistenteId}.jpg`).data.publicUrl;
      setTicketUrl(url);
    }
  }, [step, asistenteId]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-all h-full">
      {/* Paso 1: Formulario Clásico */}
      {step === 1 && (
        <div className="animate-fade-in fade-in">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Regístrate para {esBrave ? 'BRAVE' : 'VALIENTE'}
          </h3>
          <form onSubmit={fetchClientSecret} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                required 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej. Ana Pérez"
                className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${focusRing} transition-all`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Número de WhatsApp</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  +52
                </span>
                <input 
                  type="tel" 
                  required 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="55 1234 5678"
                  pattern="[0-9]*"
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${focusRing} transition-all`}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-lg ${themeColor}`}
            >
              Continuar al Pago Seguro
            </button>
          </form>
        </div>
      )}

      {/* Paso 2: Cargando */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-t-white border-white/20 rounded-full animate-spin"></div>
          <p className="text-gray-300 font-medium">Conectando con Stripe...</p>
        </div>
      )}

      {/* Paso 3: Pasarela de Stripe Embebida */}
      {step === 3 && clientSecret && (
        <div className="animate-fade-in fade-in" id="checkout">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {/* Paso 4: Éxito y Ticket */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-fade-in fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-white">¡Dios te bendiga, {formData.nombre}!</h2>
          <p className="text-gray-300">Tu lugar está asegurado. Guarda este código para tu check-in rápido el día del evento.</p>
          
          <div className="w-full mt-6 bg-white/10 p-4 rounded-lg">
             {/* Es posible que el webhook tarde un segundo en subir la foto, si no se ve de inmediato, el usuario la descargará */}
             <a href={ticketUrl} target="_blank" rel="noreferrer" className={`inline-block px-8 py-3 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${themeColor}`}>
               👇 Descargar Boleto QR Oficial
             </a>
             <p className="text-xs text-gray-400 mt-4">También te lo hemos guardado en nuestro registro automáticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
}
