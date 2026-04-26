import React, { useState } from 'react';
import type { FormData, ResultMessage } from './types';

interface NewRegistrationFormProps {
  password: string;
  onSuccess: () => void;
}

const INITIAL_FORM: FormData = {
  nombre: '',
  whatsapp: '',
  email: '',
  es_brave: true,
  es_casa: true,
  referido_por: '',
  monto_pagado: '150',
  metodo_pago: 'efectivo',
};

export default function NewRegistrationForm({ password, onSuccess }: NewRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultMessage | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/register-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult({ success: true, ticketUrl: data.ticketUrl, mensaje: data.mensaje });
        setFormData({ ...INITIAL_FORM });
        onSuccess();
      } else {
        setResult({ error: data.error || 'Error desconocido' });
      }
    } catch (err) {
      setResult({ error: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  const update = (partial: Partial<FormData>) => setFormData(prev => ({ ...prev, ...partial }));

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Success Banner */}
      {result?.success && (
        <div className="mb-8 p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center
                        animate-[fadeIn_0.4s_ease-out]">
          <p className="text-gray-800 font-bold text-lg mb-1 font-montserrat">
            {result.mensaje || '¡Registro exitoso!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
            {result.ticketUrl && (
              <a href={result.ticketUrl} target="_blank"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl
                           transition-all duration-200 shadow-sm hover:shadow-md text-sm uppercase tracking-wider">
                📥 Descargar Boleto
              </a>
            )}
            <button onClick={() => setResult(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-8 rounded-xl
                         transition-all duration-200 text-sm">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-600 font-semibold text-sm">{result.error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Row: Name + WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1 font-montserrat">
              Nombre Completo
            </label>
            <input
              type="text"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 text-lg font-semibold
                         focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                         placeholder:text-gray-300 transition-all duration-200"
              placeholder="María García López"
              value={formData.nombre}
              onChange={(e) => update({ nombre: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1 font-montserrat">
              WhatsApp
            </label>
            <input
              type="tel"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 text-lg font-semibold
                         focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                         placeholder:text-gray-300 transition-all duration-200"
              placeholder="55 1234 5678"
              value={formData.whatsapp}
              onChange={(e) => update({ whatsapp: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Row: Email + Referido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1 font-montserrat">
              Correo Electrónico <span className="text-gray-300 normal-case">(opcional)</span>
            </label>
            <input
              type="email"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 font-medium
                         focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                         placeholder:text-gray-300 transition-all duration-200"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1 font-montserrat">
              ¿Cómo se enteró?
            </label>
            <input
              type="text"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 font-medium
                         focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                         placeholder:text-gray-300 transition-all duration-200"
              placeholder="Redes sociales, amiga, etc."
              value={formData.referido_por}
              onChange={(e) => update({ referido_por: e.target.value })}
            />
          </div>
        </div>

        {/* Row: Category + Church */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 font-montserrat">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => update({ es_brave: true })}
                className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200
                  ${formData.es_brave
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}>
                Brave
              </button>
              <button type="button" onClick={() => update({ es_brave: false })}
                className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200
                  ${!formData.es_brave
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}>
                Valiente
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 font-montserrat">
              ¿Forma parte de la iglesia?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => update({ es_casa: true })}
                className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200
                  ${formData.es_casa
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}>
                Casa (ICI)
              </button>
              <button type="button" onClick={() => update({ es_casa: false })}
                className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200
                  ${!formData.es_casa
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}>
                Visita
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 text-center font-montserrat">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {['efectivo', 'transferencia'].map((m) => (
              <button key={m} type="button" onClick={() => update({ metodo_pago: m })}
                className={`py-3.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all duration-200
                  ${formData.metodo_pago === m
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 font-montserrat">
            Monto a Recibir <span className="text-gray-300">(Total: $150)</span>
          </label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-gray-300">$</span>
            <input
              type="number"
              className="w-36 bg-gray-50 border-2 border-emerald-700 rounded-2xl py-5 text-center
                         text-gray-900 text-4xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-700/20
                         transition-all duration-200"
              value={formData.monto_pagado}
              onChange={(e) => update({ monto_pagado: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white font-black
                     py-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300
                     uppercase tracking-[0.2em] text-sm mt-4 font-montserrat">
          {loading ? 'REGISTRANDO...' : 'REGISTRAR AHORA'}
        </button>
      </form>
    </div>
  );
}
