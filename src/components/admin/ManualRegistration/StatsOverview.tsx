import React from 'react';
import type { Stats } from './types';

interface StatsOverviewProps {
  stats: Stats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
      {/* Registradas */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-1 font-montserrat">
          Registradas
        </p>
        <p className="text-4xl font-black text-gray-900 tabular-nums font-montserrat">
          {stats.total}
        </p>
      </div>

      {/* Recaudado */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
        <p className="text-[10px] font-extrabold text-emerald-700/60 uppercase tracking-[0.2em] mb-1 font-montserrat">
          Recaudado
        </p>
        <p className="text-3xl font-black text-emerald-700 tabular-nums font-montserrat">
          ${stats.pagado}
        </p>
      </div>

      {/* Pendiente */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
        <p className="text-[10px] font-extrabold text-amber-600/60 uppercase tracking-[0.2em] mb-1 font-montserrat">
          Por Cobrar
        </p>
        <p className="text-3xl font-black text-amber-600 tabular-nums font-montserrat">
          ${stats.pendiente}
        </p>
      </div>

      {/* Categorías */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100
                      hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-2 font-montserrat">
          Categorías
        </p>
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Brave</p>
            <p className="text-xl font-black text-gray-900 font-montserrat">{stats.brave}</p>
          </div>
          <div className="w-px h-8 bg-gray-100 self-center" />
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Vali</p>
            <p className="text-xl font-black text-gray-900 font-montserrat">{stats.valiente}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
