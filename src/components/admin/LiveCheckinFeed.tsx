import React, { useState, useEffect } from 'react';

interface Attendee {
  id: string;
  nombre_completo: string;
  folio: number | string;
  es_brave: boolean;
  asistio: boolean;
}

export default function LiveCheckinFeed() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      // Filtramos a las mujeres que asisten al evento Brave y que ya ingresaron
      const braveInRoom = data.filter(a => a.asistio === true && a.es_brave === true);
      
      setAttendees(braveInRoom);
    } catch (err) {
      console.error('Error fetching live feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial al montar el componente
    fetchAttendees();
    
    // Configurar polling cada 15 segundos
    const interval = setInterval(() => {
      fetchAttendees();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="bg-black/60 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Backgrounds */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-900/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-emerald-400/50 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-6">
              Monitor de Ingreso en Tiempo Real
            </h2>
            <div className="flex flex-col items-center justify-center">
              <span className="text-white/60 font-bold tracking-widest text-sm md:text-base mb-2">TOTAL BRAVE EN SALA</span>
              <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] leading-none py-2">
                {isLoading && attendees.length === 0 ? '-' : attendees.length}
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

          {/* Listado con Scroll Interno */}
          <div className="overflow-y-auto max-h-[500px] pr-2">
            {attendees.length === 0 && !isLoading ? (
              <div className="text-center text-emerald-500/30 py-12 font-bold tracking-widest uppercase text-sm border border-emerald-500/10 rounded-2xl border-dashed">
                Aún no hay ingresos Brave registrados
              </div>
            ) : (
              <ul className="space-y-4">
                {attendees.map((attendee) => (
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
      
      {/* Scrollbar custom style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
