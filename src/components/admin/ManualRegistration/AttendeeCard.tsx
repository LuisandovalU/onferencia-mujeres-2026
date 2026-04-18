import React from 'react';
import type { Asistente } from './types';

interface AttendeeCardProps {
  asistente: Asistente;
  abonoAmount: string;
  onAbonoAmountChange: (value: string) => void;
  onAddAbono: (id: string) => void;
  loading: boolean;
}

export default function AttendeeCard({
  asistente,
  abonoAmount,
  onAbonoAmountChange,
  onAddAbono,
  loading,
}: AttendeeCardProps) {
  const isCompleted = asistente.status_pago === 'completado';
  const deuda = asistente.monto_total - asistente.monto_pagado;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-800 uppercase tracking-tight truncate font-montserrat">
              {asistente.nombre_completo}
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <span className="text-emerald-600 font-semibold text-xs tracking-wide">
                WA: {asistente.whatsapp}
              </span>
              <span className="text-gray-400 font-medium text-xs tracking-wide">
                {asistente.es_casa ? 'Casa' : 'Visita'} · {asistente.es_brave ? 'Brave' : 'Valiente'}
              </span>
            </div>
          </div>

          <div className="text-right ml-4 shrink-0">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest font-montserrat">
              Estado
            </p>
            <p className={`text-xl font-black font-montserrat ${isCompleted ? 'text-emerald-700' : 'text-amber-600'}`}>
              {isCompleted ? 'LIQUIDADO' : `DEBE $${deuda}`}
            </p>
          </div>
        </div>
      </div>

      {/* Payment action or ticket download */}
      {!isCompleted ? (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <span className="text-lg font-black text-gray-300 ml-2">$</span>
            <input
              type="number"
              placeholder="Abonar..."
              className="flex-1 bg-transparent text-gray-900 text-xl font-bold
                         focus:outline-none placeholder:text-gray-300"
              onChange={(e) => onAbonoAmountChange(e.target.value)}
            />
            <button
              onClick={() => onAddAbono(asistente.id)}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white font-black px-8 py-3.5 rounded-xl
                         uppercase text-[10px] tracking-widest transition-all duration-200
                         disabled:opacity-40 shrink-0 font-montserrat"
            >
              Abonar
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <a
            href={`/api/download-ticket?id=${asistente.id}`}
            target="_blank"
            className="block text-center bg-gray-50 hover:bg-gray-100 text-gray-900
                       font-bold py-4 rounded-2xl transition-all duration-200
                       uppercase tracking-widest text-[10px] border border-gray-100 font-montserrat"
          >
            🎟️ Ver Boleto Digital
          </a>
        </div>
      )}
    </div>
  );
}
