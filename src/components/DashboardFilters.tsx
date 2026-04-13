import React from 'react';
import { Filter, Calendar, Users } from 'lucide-react';

interface Filters {
  startDate: string;
  endDate: string;
  type: string;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export default function DashboardFilters({ filters, setFilters }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <div className="glass-card p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col md:flex-row items-center gap-6 border-t-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-brave-light-soft font-black uppercase text-[10px] tracking-[0.2em]">
          <Filter size={14} />
          Filtros <span className="hidden md:inline">Inteligentes</span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Fecha Inicio */}
          <div className="relative group">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-brave-light-soft/40 group-focus-within:text-brave-light-soft transition-colors" size={16} />
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:border-brave-forest transition-all font-bold"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          {/* Fecha Fin */}
          <div className="relative group">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-brave-light-soft/40 group-focus-within:text-brave-light-soft transition-colors" size={16} />
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:border-brave-forest transition-all font-bold"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          {/* Tipo de Boleto */}
          <div className="relative group">
            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-brave-light-soft/40 group-focus-within:text-brave-light-soft transition-colors" size={16} />
            <select
              className="w-full bg-admin-deep border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white focus:outline-none focus:border-brave-forest transition-all appearance-none cursor-pointer font-bold"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">Todos los Tipos</option>
              <option value="Brave">Solo Brave</option>
              <option value="Valiente">Solo Valiente</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setFilters({ startDate: '', endDate: '', type: 'all' })}
          className="text-[10px] font-black text-brave-light-soft/40 hover:text-white uppercase tracking-[0.2em] transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
