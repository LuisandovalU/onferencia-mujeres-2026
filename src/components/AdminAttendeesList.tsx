import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, UserCheck, UserMinus, 
  ExternalLink, Phone, Mail, Clock, AlertCircle
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface Asistente {
  id: string;
  nombre: string;
  whatsapp: string;
  monto_pagado: number;
  monto_total: number;
  status_pago: string;
  es_brave: boolean;
  metodo_pago?: string;
  stripe_session_id?: string;
  created_at: string;
}

export default function AdminAttendeesList() {
  const [loading, setLoading] = useState(true);
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'completado', 'pendiente'
    type: 'all',   // 'all', 'brave', 'valiente'
    method: 'all'  // 'all', 'stripe', 'efectivo', 'transferencia'
  });

  const fetchData = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) return;

    setLoading(true);
    try {
      const resp = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await resp.json();
      if (resp.ok) {
        setAsistentes(data.asistentes || []);
      }
    } catch (err) {
      console.error('Error fetching attendees list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAsistentes = asistentes.filter(a => {
    const nombre = a.nombre || '';
    const whatsapp = a.whatsapp || '';
    
    const matchesSearch = 
      nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      whatsapp.includes(searchQuery);
    
    const matchesType = filters.type === 'all' || (filters.type === 'brave' ? a.es_brave : !a.es_brave);
    
    let matchesMethod = true;
    if (filters.method !== 'all') {
      if (filters.method === 'stripe') {
        matchesMethod = !!a.stripe_session_id;
      } else {
        matchesMethod = a.metodo_pago === filters.method && !a.stripe_session_id;
      }
    }

    return matchesSearch && matchesType && matchesMethod;
  });

  const totalRecaudado = filteredAsistentes.reduce((sum, a) => sum + a.monto_pagado, 0);
  const totalPendiente = filteredAsistentes.reduce((sum, a) => sum + (a.monto_total - a.monto_pagado), 0);

  if (loading && asistentes.length === 0) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-brave-forest/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-brave-light-soft rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-brave-light-soft/50 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Obteniendo Registros...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-32">
      
      {/* Header & Mini Stats */}
      <div className="flex mb-12">
        <div className="glass-card p-6 px-12 rounded-[2.5rem] border-t-white/10 shadow-xl overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brave-forest/20 blur-3xl rounded-full"></div>
          <p className="text-[10px] text-brave-light-soft/50 font-black uppercase tracking-widest mb-1 relative z-10">En esta vista (Inscritas)</p>
          <h3 className="text-4xl text-glow-gold relative z-10">
            <AnimatedCounter value={filteredAsistentes.length} />
          </h3>
        </div>
      </div>

      {/* Control Bar (Advanced Filters) */}
      <div className="glass-card p-6 md:p-8 rounded-[3rem] md:rounded-[4rem] flex flex-col gap-6 mb-12 shadow-2xl border-t-white/10 relative z-50">
        <div className="w-full">
          <p className="text-[10px] text-brave-light-soft/40 font-black uppercase tracking-[0.3em] mb-4 px-2">Buscador Principal</p>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brave-light-soft/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o celular..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:outline-none focus:border-brave-forest/50 transition-all font-bold placeholder:text-brave-light-soft/20 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Boleto */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-brave-light-soft/50 tracking-widest px-2">Marca / Tipo</label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-admin-deep border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brave-forest transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="all">Brave & Valiente</option>
              <option value="brave">Solo Brave 🌿</option>
              <option value="valiente">Solo Valiente 🔥</option>
            </select>
          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-brave-light-soft/50 tracking-widest px-2">Origen del Pago</label>
            <select 
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="w-full bg-admin-deep border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brave-forest transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="all">Cualquier Método</option>
              <option value="stripe">Pago en Línea (Stripe) 💳</option>
              <option value="efectivo">Efectivo 💵</option>
              <option value="transferencia">Transferencia SPEI 🏦</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Asistentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAsistentes.map((a, idx) => (
            <motion.div
              layout
              key={a.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-card p-8 rounded-[3rem] group hover:border-white/30 transition-all border-t-white/20 border-b-white/5 border-x-white/10 shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-3xl ${a.status_pago === 'completado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  {a.status_pago === 'completado' ? <UserCheck size={24} /> : <UserMinus size={24} />}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.es_brave ? 'bg-brave-forest/20 border-brave-forest/30 text-brave-light-soft' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                  {a.es_brave ? 'Brave' : 'Valiente'}
                </div>
              </div>

              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-glow transition-all">{a.nombre}</h4>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <Phone size={14} />
                  </div>
                  <span className="text-xs font-bold font-mono">{a.whatsapp}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <Clock size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {new Date(a.created_at).toLocaleDateString()} • {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Method & Status Section */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 group-hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Pagado</p>
                    <p className="text-2xl font-black text-white">${a.monto_pagado}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Saldo</p>
                    <p className={`text-sm font-black ${a.status_pago === 'completado' ? 'text-emerald-400' : 'text-orange-500 underline decoration-2 underline-offset-4'}`}>
                      {a.status_pago === 'completado' ? 'LIQUIDADO' : `$${a.monto_total - a.monto_pagado}`}
                    </p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-brave-light-soft/40 tracking-tighter">Método:</span>
                       <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                         a.stripe_session_id 
                           ? 'bg-brave-forest/20 border-brave-forest/30 text-brave-light-soft' 
                           : 'bg-white/10 border-white/5 text-brave-light-soft/60'
                       }`}>
                         {a.stripe_session_id ? '💳 Pago en Línea (Stripe)' : (a.metodo_pago || '💵 Efectivo')}
                       </div>
                    </div>
                  </div>

                  {a.stripe_session_id && (
                    <div className="bg-brave-forest/10 rounded-2xl p-4 border border-brave-forest/20 flex flex-col gap-3 group/stripe hover:bg-brave-forest/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brave-light-soft/40 uppercase tracking-widest mb-1">IDC de Transacción</span>
                        <code className="text-[10px] font-mono text-zinc-500 break-all bg-black/20 p-2 rounded-lg">
                          {a.stripe_session_id}
                        </code>
                      </div>
                      <a 
                        href={`https://dashboard.stripe.com/checkout/sessions/${a.stripe_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brave-forest text-white text-[10px] font-black uppercase tracking-widest hover:bg-brave-moss transition-all shadow-lg shadow-black/40 active:scale-95"
                      >
                        <ExternalLink size={12} />
                        Verificar Pago en Stripe
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <a 
                  href={`/admin/registro-manual?search=${a.whatsapp}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white/20 transition-all"
                >
                  <AlertCircle size={14} />
                  Abonar
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAsistentes.length === 0 && (
        <div className="text-center py-20 glass-card rounded-[3rem] mt-12 bg-white/5">
          <AlertCircle size={40} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em]">No se encontraron registros que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
}
