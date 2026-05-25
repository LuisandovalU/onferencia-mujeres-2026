import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function CheckinScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Apuntando cámara...');
  const [colorState, setColorState] = useState<'gray' | 'green' | 'orange' | 'red'>('gray');
  const [scanning, setScanning] = useState(true);
  const [localAttendees, setLocalAttendees] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('offline_attendees');
    if (stored) {
      try {
        setLocalAttendees(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing offline_attendees', e);
      }
    }
  }, []);

  // Derivados del estado local
  const totalBrave = localAttendees.filter(a => a.es_brave === true).length;
  const braveEnSala = localAttendees.filter(a => a.es_brave === true && a.asistio === true);

  const syncDatabase = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) {
      alert('No hay contraseña de administrador guardada en sesión.');
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/get-all-attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al descargar datos');
      setLocalAttendees(data);
      localStorage.setItem('offline_attendees', JSON.stringify(data));
      alert(`¡Sincronización exitosa! Se cargaron ${data.length} asistentes.`);
    } catch (err: any) {
      alert('Error sincronizando: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const procesarBoleto = (scannedText: string) => {
    const rawText = scannedText.trim();
    if (!rawText) return;

    setScanning(false);
    setScanResult(rawText);
    setStatusText('Verificando...');
    setColorState('gray');

    const password = sessionStorage.getItem('admin_password');

    // 🔑 Extraer el ID real si el QR contiene una URL completa
    // Los boletos generados codifican: https://conferencia.icimexico.org/admin/checkin?id=<UUID>
    let searchText = rawText;
    try {
      if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
        const url = new URL(rawText);
        const idParam = url.searchParams.get('id');
        if (idParam) {
          searchText = idParam; // Usar solo el UUID/ID extraído
        }
      }
    } catch (_) {
      // No es una URL válida, usar rawText tal cual
    }

    const lowercaseQuery = searchText.toLowerCase();
    const attendeeIndex = localAttendees.findIndex(a =>
      a.id === searchText ||
      String(a.folio) === searchText ||
      a.whatsapp === searchText ||
      a.stripe_session_id === searchText ||
      (a.nombre_completo && a.nombre_completo.toLowerCase().includes(lowercaseQuery))
    );

    const foundAttendee = attendeeIndex !== -1 ? localAttendees[attendeeIndex] : null;

    if (!foundAttendee) {
      // 🔄 No está en caché → intentar directamente contra la API/Supabase
      if (!password) {
        setStatusText('Sin caché y sin sesión admin');
        setColorState('red');
        setTimeout(() => { setScanResult(null); setStatusText('Esperando Boleto...'); setColorState('gray'); setScanning(true); }, 3000);
        return;
      }

      setStatusText('Buscando en base de datos...');
      setColorState('gray');

      fetch('/api/admin/process-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: searchText, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStatusText('¡BIENVENIDA!');
            setColorState('green');
            // Agregar al caché local para futuros escaneos
            if (data.asistente) {
              const updated = [...localAttendees, { ...data.asistente, asistio: true }];
              setLocalAttendees(updated);
              localStorage.setItem('offline_attendees', JSON.stringify(updated));
            }
          } else if (data.type === 'warning') {
            setStatusText('YA ESCANEADO');
            setColorState('orange');
          } else if (data.type === 'error') {
            setStatusText('DEUDA PENDIENTE');
            setColorState('red');
          } else {
            setStatusText('NO ENCONTRADO EN DB');
            setColorState('red');
          }
        })
        .catch(() => {
          setStatusText('Sin conexión y sin caché');
          setColorState('red');
        })
        .finally(() => {
          setTimeout(() => { setScanResult(null); setStatusText('Esperando Boleto...'); setColorState('gray'); setScanning(true); }, 3000);
        });

      return; // Salir aquí, el timeout lo maneja el .finally()
    } else if (foundAttendee.status_pago !== 'completado') {
      setStatusText('DEUDA PENDIENTE');
      setColorState('red');
    } else if (foundAttendee.asistio) {
      setStatusText('YA ESCANEADO');
      setColorState('orange');
    } else {
      setStatusText('¡BIENVENIDA!');
      setColorState('green');

      const ahoraISO = new Date().toISOString();
      const updatedAttendees = [...localAttendees];
      updatedAttendees[attendeeIndex] = { ...foundAttendee, asistio: true, fecha_checkin: ahoraISO };
      setLocalAttendees(updatedAttendees);
      localStorage.setItem('offline_attendees', JSON.stringify(updatedAttendees));

      fetch('/api/admin/process-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: searchText, password })
      }).catch(err => {
        console.warn('Fallo de red en process-checkin (segundo plano).', err);
      });
    }

    setTimeout(() => {
      setScanResult(null);
      setStatusText('Esperando Boleto...');
      setColorState('gray');
      setScanning(true);
    }, 3000);
  };

  const formatHora = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '—';
    }
  };

  const colorClasses = {
    gray: 'bg-emerald-950/50 text-emerald-400/50 border-emerald-400/10',
    green: 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.8)] border-white scale-105',
    orange: 'bg-orange-500 text-black shadow-[0_0_40px_rgba(249,115,22,0.8)] border-white scale-105',
    red: 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.8)] border-white scale-105'
  };

  return (
    <div className="w-full transition-all duration-700 flex flex-col items-center justify-start min-h-[60vh] pb-20">
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center relative z-10">

        {/* Botón de Sincronización Discreto */}
        <button
          onClick={syncDatabase}
          disabled={syncing}
          className="mb-4 text-[10px] text-emerald-500/50 hover:text-emerald-400 font-bold uppercase tracking-[0.2em] border border-emerald-500/20 px-4 py-2 rounded-full transition-all disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar Base de Datos (Requiere Internet)'}
        </button>

        {/* Indicador de estado */}
        <div className={`w-full p-4 md:p-6 rounded-2xl mb-8 text-center font-black text-lg md:text-xl transition-all duration-500 border-2 uppercase tracking-tight leading-none ${colorClasses[colorState]}`}>
          {statusText}
        </div>

        {/* Visor QR */}
        <div className="w-[90vw] max-w-[450px] aspect-square bg-black rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-8 border-emerald-900/50 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative mx-auto">
          {scanning ? (
            <Scanner
              onScan={(detectedCodes) => {
                if (detectedCodes && detectedCodes.length > 0) {
                  procesarBoleto(detectedCodes[0].rawValue);
                }
              }}
              constraints={{ facingMode: 'environment' }}
              allowMultiple={true}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black">
              <div className="w-16 h-16 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-8 text-emerald-500 font-black uppercase tracking-widest animate-pulse">Procesando...</p>
            </div>
          )}
          {scanning && <div className="absolute inset-x-0 top-0 h-2 bg-emerald-400 shadow-[0_0_30px_#10b981] animate-[scan_2s_linear_infinite]"></div>}
        </div>

        {/* Entrada Manual */}
        <div className="mt-12 w-full max-w-sm bg-black/60 backdrop-blur-3xl border border-emerald-400/10 p-6 rounded-[2.5rem] shadow-2xl">
          <p className="text-[10px] text-emerald-400/40 mb-4 font-black uppercase tracking-[0.4em] text-center">Entrada Manual (Folio, Teléfono o Nombre)</p>
          <input
            type="text"
            placeholder="Ej: 14 o 5512345678"
            className="w-full bg-transparent text-white border-b-4 border-emerald-500/20 rounded-none p-4 text-center text-3xl font-black focus:outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.currentTarget;
                if (!target.value) return;
                procesarBoleto(target.value);
                target.value = '';
              }
            }}
          />
        </div>

        {/* ── Mini Monitor Brave ── */}
        {totalBrave > 0 && (
          <div className="mt-8 w-full max-w-sm bg-black/60 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Contadores */}
            <div className="flex items-center justify-between p-5">
              <div className="text-center flex-1">
                <p className="text-[9px] text-emerald-400/40 font-black uppercase tracking-[0.3em] mb-1">Inscritas Brave</p>
                <p className="text-4xl font-black text-emerald-400">{totalBrave}</p>
              </div>
              <div className="w-px h-12 bg-emerald-500/10"></div>
              <div className="text-center flex-1">
                <p className="text-[9px] text-emerald-400/40 font-black uppercase tracking-[0.3em] mb-1">Brave en Sala</p>
                <p className="text-4xl font-black text-white">{braveEnSala.length}</p>
              </div>
            </div>

            {/* Botón Ver Lista */}
            <button
              onClick={() => setShowList(v => !v)}
              className="w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 hover:text-emerald-400 border-t border-emerald-500/10 hover:bg-emerald-500/5 transition-all"
            >
              {showList ? '▲ Ocultar Lista' : '▼ Ver Lista de Ingresadas'}
            </button>

            {/* Lista Desplegable */}
            {showList && (
              <div className="overflow-y-auto max-h-72 border-t border-emerald-500/10">
                {braveEnSala.length === 0 ? (
                  <p className="text-center text-emerald-500/30 text-xs font-bold uppercase py-6 tracking-widest">Sin ingresos aún</p>
                ) : (
                  <ul>
                    {braveEnSala.map((a, i) => (
                      <li key={a.id} className={`flex items-center justify-between px-5 py-3 ${i % 2 === 0 ? 'bg-emerald-950/20' : ''}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-emerald-400 text-base flex-shrink-0">✅</span>
                          <div className="overflow-hidden">
                            <p className="text-white font-bold text-sm truncate capitalize leading-tight">
                              {a.nombre_completo?.toLowerCase() || '—'}
                            </p>
                            <p className="text-emerald-400/40 text-[10px] font-bold uppercase tracking-widest">
                              Folio {a.folio}
                            </p>
                          </div>
                        </div>
                        <span className="text-emerald-400/50 text-[11px] font-black flex-shrink-0 ml-2">
                          {formatHora(a.fecha_checkin)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
  );
}
