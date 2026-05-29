import React, { useState, useEffect } from 'react';

interface Attendee {
  id: string;
  nombre_completo: string;
  folio: number | string;
  es_brave: boolean;
  asistio: boolean;
}

export default function LiveCheckinFeed() {
  const [braveAttendees, setBraveAttendees] = useState<Attendee[]>([]);
  const [valienteAttendees, setValienteAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Por defecto, muestra el monitor de Valiente (el de Brave está minimizado)
  const [showBrave, setShowBrave] = useState(false);

  const fetchAttendees = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/get-all-attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) throw new Error('Error al obtener datos');
      
      const data: Attendee[] = await res.json();
      
      const braveInRoom = data.filter(a => a.asistio === true && a.es_brave === true);
      const valienteInRoom = data.filter(a => a.asistio === true && a.es_brave === false);
      
      setBraveAttendees(braveInRoom);
      setValienteAttendees(valienteInRoom);
    } catch (err) {
      console.error('Error fetching live feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(() => {
      fetchAttendees();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center">
      
      {/* Botones para alternar Monitores */}
      <div className="flex gap-4 mb-8 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
        <button
           onClick={() => setShowBrave(false)}
           className={`px-6 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
             !showBrave 
               ? 'bg-[#364e44] text-[#e8e1d3] shadow-lg ring-1 ring-white/20' 
               : 'text-white/40 hover:text-white/80'
           }`}
        >
          Monitor Valiente
        </button>
        <button
           onClick={() => setShowBrave(true)}
           className={`px-6 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
             showBrave 
               ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-white/20' 
               : 'text-white/40 hover:text-white/80'
           }`}
        >
          Monitor Brave
        </button>
      </div>

      {/* Monitor Valiente */}
      {!showBrave && (
        <div className="w-full bg-[#283b31]/90 backdrop-blur-3xl border border-[#e8e1d3]/20 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#e8e1d3]/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#364e44]/50 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-[#e8e1d3]/70 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6">
                Monitor de Ingreso en Tiempo Real
              </h2>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[#e8e1d3]/80 font-bold tracking-widest text-sm md:text-base mb-2">TOTAL VALIENTE EN SALA</span>
                <div className="text-7xl md:text-9xl font-black text-[#e8e1d3] drop-shadow-[0_0_30px_rgba(232,225,211,0.2)] leading-none py-2">
                  {isLoading && valienteAttendees.length === 0 ? '-' : valienteAttendees.length}
                </div>
              </div>
              {isLoading && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-[#e8e1d3]/60 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#e8e1d3]"></div>
                  <span>Sincronizando...</span>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#e8e1d3]/20 to-transparent my-8"></div>

            <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar-valiente">
              {valienteAttendees.length === 0 && !isLoading ? (
                <div className="text-center text-[#e8e1d3]/40 py-12 font-bold tracking-widest uppercase text-sm border border-[#e8e1d3]/10 rounded-2xl border-dashed">
                  Aún no hay ingresos Valiente registrados
                </div>
              ) : (
                <ul className="space-y-4">
                  {valienteAttendees.map((attendee) => (
                    <li 
                      key={attendee.id} 
                      className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-[#364e44]/40 border border-[#e8e1d3]/10 hover:border-[#e8e1d3]/30 hover:bg-[#364e44]/60 transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="text-white/90 font-bold text-lg md:text-xl capitalize leading-tight group-hover:text-[#e8e1d3] transition-colors">
                          {attendee.nombre_completo.toLowerCase()}
                        </span>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#e8e1d3]/10 text-[#e8e1d3] text-[10px] font-black uppercase tracking-widest border border-[#e8e1d3]/20">
                            Folio: {attendee.folio}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#e8e1d3]/10 text-[#e8e1d3] text-xl border border-[#e8e1d3]/20 shadow-[0_0_20px_rgba(232,225,211,0.1)] group-hover:scale-110 transition-transform">
                        ✅
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monitor Brave */}
      {showBrave && (
        <div className="w-full bg-black/60 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-900/30 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-emerald-400/50 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6">
                Monitor de Ingreso en Tiempo Real
              </h2>
              <div className="flex flex-col items-center justify-center">
                <span className="text-white/60 font-bold tracking-widest text-sm md:text-base mb-2">TOTAL BRAVE EN SALA</span>
                <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] leading-none py-2">
                  {isLoading && braveAttendees.length === 0 ? '-' : braveAttendees.length}
                </div>
              </div>
              {isLoading && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-emerald-500/60 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Sincronizando...</span>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent my-8"></div>

            <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar-brave">
              {braveAttendees.length === 0 && !isLoading ? (
                <div className="text-center text-emerald-500/30 py-12 font-bold tracking-widest uppercase text-sm border border-emerald-500/10 rounded-2xl border-dashed">
                  Aún no hay ingresos Brave registrados
                </div>
              ) : (
                <ul className="space-y-4">
                  {braveAttendees.map((attendee) => (
                    <li 
                      key={attendee.id} 
                      className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-900/20 transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="text-white/90 font-bold text-lg md:text-xl capitalize leading-tight group-hover:text-emerald-300 transition-colors">
                          {attendee.nombre_completo.toLowerCase()}
                        </span>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Folio: {attendee.folio}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 text-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform">
                        ✅
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Scrollbar custom styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar-brave::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-brave::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-brave::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.2); border-radius: 20px; }
        
        .custom-scrollbar-valiente::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-valiente::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-valiente::-webkit-scrollbar-thumb { background-color: rgba(232, 225, 211, 0.2); border-radius: 20px; }
      `}} />
    </div>
  );
}
