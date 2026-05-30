import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

type ScanMode = 'valiente' | 'brave';

export default function CheckinScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Apuntando cámara...');
  const [colorState, setColorState] = useState<'gray' | 'green' | 'orange' | 'red'>('gray');
  const [scanning, setScanning] = useState(true);
  const [localAttendees, setLocalAttendees] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showList, setShowList] = useState(false);
  const [multipleMatches, setMultipleMatches] = useState<any[] | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('valiente');
  const [pendingSyncs, setPendingSyncs] = useState<{rawText: string, es_brave_mode: boolean}[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('offline_attendees');
    if (stored) {
      try {
        setLocalAttendees(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing offline_attendees', e);
      }
    }

    const storedPending = localStorage.getItem('offline_pending_syncs');
    if (storedPending) {
      try {
        setPendingSyncs(JSON.parse(storedPending));
      } catch (e) {
        console.error('Error parsing offline_pending_syncs', e);
      }
    }
  }, []);

  // Derivados del estado local — filtrados por modo
  const attendeesByMode = (mode: ScanMode) =>
    localAttendees.filter(a => mode === 'brave' ? a.es_brave === true : a.es_brave === false);

  const totalValiente = attendeesByMode('valiente').length;
  const totalBrave = attendeesByMode('brave').length;
  const valienteEnSala = attendeesByMode('valiente').filter(a => a.asistio === true);
  const braveEnSala = attendeesByMode('brave').filter(a => a.asistio === true);

  // Lista que se muestra según el modo actual
  const currentModeAttendees = scanMode === 'brave' ? braveEnSala : valienteEnSala;

  const processPendingSyncs = async (password: string) => {
    if (pendingSyncs.length === 0) return true;
    
    // We try to process them sequentially
    const remaining = [...pendingSyncs];
    let successCount = 0;

    setSyncing(true);
    for (let i = 0; i < pendingSyncs.length; i++) {
      const item = pendingSyncs[i];
      try {
        const res = await fetch('/api/admin/process-checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: item.rawText, password, es_brave_mode: item.es_brave_mode })
        });

        // Si el servidor falla gravemente (500), detenemos la cola para intentarlo después
        if (res.status >= 500) {
          throw new Error('Servidor inestable (500)');
        }
        
        // Si responde 200 (éxito) o 4xx (no encontrado/inválido), lo descartamos de la cola
        // porque ya supimos que el servidor lo procesó o lo rechazó permanentemente.
        remaining.shift();
        successCount++;
      } catch (e) {
        break; // Stop on first network error
      }
    }

    setPendingSyncs(remaining);
    localStorage.setItem('offline_pending_syncs', JSON.stringify(remaining));
    setSyncing(false);

    if (remaining.length > 0) {
      alert(`Se sincronizaron ${successCount} registros, pero aún quedan ${remaining.length} pendientes. Verifica tu conexión.`);
      return false;
    }
    return true;
  };

  const syncDatabase = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) {
      alert('No hay contraseña de administrador guardada en sesión.');
      return;
    }
    setSyncing(true);

    // 1. Intentar subir pendientes primero
    const successPending = await processPendingSyncs(password);
    if (!successPending) {
      setSyncing(false);
      return; // Stop sync if we couldn't upload pending items to avoid overwriting them!
    }

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
    setMultipleMatches(null);
    setScanResult(rawText);
    setStatusText('Verificando...');
    setColorState('gray');

    const password = sessionStorage.getItem('admin_password');

    // 🔑 Extraer el ID real si el QR contiene una URL completa
    let searchText = rawText;
    try {
      if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
        const url = new URL(rawText);
        const idParam = url.searchParams.get('id');
        if (idParam) {
          searchText = idParam;
        }
      }
    } catch (_) {
      // No es una URL válida, usar rawText tal cual
    }

    const lowercaseQuery = searchText.toLowerCase();
    const isBraveMode = scanMode === 'brave';

    // Filtrar por modo actual (es_brave) para evitar confusiones con boletos dobles
    const modeFilteredAttendees = localAttendees.filter(a =>
      isBraveMode ? a.es_brave === true : a.es_brave === false
    );

    // Encontrar TODOS los posibles matches
    const matchedAttendees = modeFilteredAttendees.filter(a =>
      a.id === searchText ||
      String(a.folio) === searchText ||
      a.whatsapp === searchText ||
      a.stripe_session_id === searchText ||
      (a.nombre_completo && a.nombre_completo.toLowerCase().includes(lowercaseQuery))
    );

    if (matchedAttendees.length > 1) {
      setMultipleMatches(matchedAttendees);
      setStatusText('Múltiples opciones');
      setColorState('orange');
      return; // Detenemos aquí para que el usuario elija de la lista
    }

    const foundAttendee = matchedAttendees.length === 1 ? matchedAttendees[0] : null;

    // También necesitamos el índice en el array completo para actualizar
    const globalIndex = foundAttendee
      ? localAttendees.findIndex(a => a.id === foundAttendee.id)
      : -1;

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
        body: JSON.stringify({ rawText: searchText, password, es_brave_mode: isBraveMode })
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

      return;
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
      if (globalIndex !== -1) {
        updatedAttendees[globalIndex] = { ...foundAttendee, asistio: true, fecha_checkin: ahoraISO };
      }
      setLocalAttendees(updatedAttendees);
      localStorage.setItem('offline_attendees', JSON.stringify(updatedAttendees));

      fetch('/api/admin/process-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: searchText, password, es_brave_mode: isBraveMode })
      }).catch(err => {
        console.warn('Fallo de red en process-checkin (segundo plano). Guardando en cola de pendientes.', err);
        const newPending = [...pendingSyncs, { rawText: searchText, es_brave_mode: isBraveMode }];
        setPendingSyncs(newPending);
        localStorage.setItem('offline_pending_syncs', JSON.stringify(newPending));
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

  const modeLabel = scanMode === 'brave' ? 'Brave' : 'Valiente';

  return (
    <div className="w-full transition-all duration-700 flex flex-col items-center justify-start min-h-[60vh] pb-20">
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center relative z-10">

        {/* ── Selector de Modo ── */}
        <div className="w-full mb-6">
          <p className="text-[9px] text-emerald-400/40 font-black uppercase tracking-[0.4em] text-center mb-3">
            Modo de Escaneo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScanMode('valiente')}
              className={`relative py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition-all duration-300 border-2
                ${scanMode === 'valiente'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.5)] scale-[1.02]'
                  : 'bg-white/5 text-zinc-500 border-white/10 hover:border-purple-500/30 hover:text-purple-400'
                }`}
            >
              {scanMode === 'valiente' && (
                <span className="absolute top-1.5 right-2 text-[8px] bg-purple-300/20 text-purple-200 px-2 py-0.5 rounded-full font-bold tracking-widest">
                  ACTIVO
                </span>
              )}
              Valiente
            </button>
            <button
              onClick={() => setScanMode('brave')}
              className={`relative py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition-all duration-300 border-2
                ${scanMode === 'brave'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-[1.02]'
                  : 'bg-white/5 text-zinc-500 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
            >
              {scanMode === 'brave' && (
                <span className="absolute top-1.5 right-2 text-[8px] bg-emerald-300/20 text-emerald-200 px-2 py-0.5 rounded-full font-bold tracking-widest">
                  ACTIVO
                </span>
              )}
              Brave
            </button>
          </div>
        </div>

        {/* Cola de Pendientes Offline */}
        {pendingSyncs.length > 0 && (
          <div className="w-full mb-4 bg-orange-500/20 border border-orange-500 text-orange-200 p-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-pulse">
            <p className="font-bold text-sm text-center mb-2">⚠️ Tienes {pendingSyncs.length} check-ins pendientes de subir.</p>
            <button
              onClick={() => {
                const pwd = sessionStorage.getItem('admin_password');
                if (pwd) processPendingSyncs(pwd);
              }}
              disabled={syncing}
              className="bg-orange-500 text-black font-black uppercase text-xs px-4 py-2 rounded-full hover:bg-orange-400 disabled:opacity-50"
            >
              Subir Pendientes Ahora
            </button>
          </div>
        )}

        {/* Botón de Sincronización Discreto */}
        <button
          onClick={syncDatabase}
          disabled={syncing}
          className="mb-4 text-[10px] text-emerald-500/50 hover:text-emerald-400 font-bold uppercase tracking-[0.2em] border border-emerald-500/20 px-4 py-2 rounded-full transition-all disabled:opacity-50"
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar Base de Datos (Requiere Internet)'}
        </button>

        {/* Indicador de estado */}
        <div className={`w-full p-4 md:p-6 rounded-2xl mb-2 text-center font-black text-lg md:text-xl transition-all duration-500 border-2 uppercase tracking-tight leading-none ${colorClasses[colorState]}`}>
          {statusText}
        </div>

        {/* Indicador del modo actual */}
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 transition-colors duration-300 ${
          scanMode === 'brave' ? 'text-emerald-500/60' : 'text-purple-500/60'
        }`}>
          Escaneando para: {modeLabel}
        </p>

        {/* Visor QR o Multi-Selector */}
        <div className={`w-[90vw] max-w-[450px] min-h-[400px] aspect-square bg-black rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative mx-auto transition-colors duration-500 ${
          scanMode === 'brave' ? 'border-emerald-900/50' : 'border-purple-900/50'
        }`}>
          {multipleMatches ? (
             <div className="w-full h-full flex flex-col p-4 bg-zinc-900/90 overflow-y-auto">
                <p className="text-white font-bold text-center mb-4 mt-2">Múltiples boletos encontrados. Elige uno:</p>
                <div className="flex flex-col gap-3">
                  {multipleMatches.map((a, i) => (
                    <div key={a.id} className="bg-black/50 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <div>
                            <p className="text-white font-bold capitalize">{a.nombre_completo}</p>
                            <p className="text-white/50 text-xs">Folio: {a.folio} | Tel: {a.whatsapp}</p>
                         </div>
                         {a.asistio && <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-1 rounded-full font-bold">Ya en sala</span>}
                       </div>
                       <button
                         onClick={() => procesarBoleto(a.id)}
                         className={`w-full py-2 mt-2 rounded-lg font-bold text-sm uppercase tracking-wider ${
                           a.asistio 
                             ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                             : (scanMode === 'brave' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-purple-600 text-white hover:bg-purple-500')
                         }`}
                         disabled={a.asistio}
                       >
                         {a.asistio ? 'Ingresado' : 'Hacer Check-in'}
                       </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { setMultipleMatches(null); setScanning(true); setStatusText('Esperando Boleto...'); setColorState('gray'); }}
                  disabled={syncing}
                  className="mt-6 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest text-center pb-4 disabled:opacity-50"
                >
                  Cancelar
                </button>
             </div>
          ) : scanning && !syncing ? (
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
              <div className={`w-16 h-16 border-8 border-t-transparent rounded-full animate-spin ${
                scanMode === 'brave' ? 'border-emerald-500' : 'border-purple-500'
              }`}></div>
              <p className={`mt-8 font-black uppercase tracking-widest animate-pulse ${
                scanMode === 'brave' ? 'text-emerald-500' : 'text-purple-500'
              }`}>{syncing ? 'Sincronizando...' : 'Procesando...'}</p>
            </div>
          )}
          {(scanning && !syncing) && <div className={`absolute inset-x-0 top-0 h-2 shadow-[0_0_30px_currentColor] animate-[scan_2s_linear_infinite] ${
            scanMode === 'brave' ? 'bg-emerald-400' : 'bg-purple-400'
          }`}></div>}
        </div>

        {/* Entrada Manual */}
        <div className={`mt-12 w-full max-w-sm bg-black/60 backdrop-blur-3xl border p-6 rounded-[2.5rem] shadow-2xl transition-colors duration-500 ${
          scanMode === 'brave' ? 'border-emerald-400/10' : 'border-purple-400/10'
        }`}>
          <p className={`text-[10px] mb-4 font-black uppercase tracking-[0.4em] text-center transition-colors duration-300 ${
            scanMode === 'brave' ? 'text-emerald-400/40' : 'text-purple-400/40'
          }`}>Entrada Manual — {modeLabel} (Folio, Teléfono o Nombre)</p>
          <input
            type="text"
            disabled={syncing || !scanning}
            placeholder="Ej: 14 o 5512345678"
            className={`w-full bg-transparent text-white border-b-4 rounded-none p-4 text-center text-3xl font-black focus:outline-none transition-all placeholder:opacity-20 disabled:opacity-20 ${
              scanMode === 'brave'
                ? 'border-emerald-500/20 focus:border-emerald-500 placeholder:text-emerald-900'
                : 'border-purple-500/20 focus:border-purple-500 placeholder:text-purple-900'
            }`}
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

        {/* ── Monitor Doble: Valiente y Brave ── */}
        <div className="mt-8 w-full max-w-sm bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Contadores */}
          <div className="grid grid-cols-2 divide-x divide-white/5">
            {/* Valiente */}
            <div className={`p-5 text-center transition-all duration-300 ${scanMode === 'valiente' ? 'bg-purple-500/5' : ''}`}>
              <p className="text-[8px] text-purple-400/50 font-black uppercase tracking-[0.3em] mb-1">Valiente</p>
              <div className="flex items-baseline justify-center gap-1">
                <p className="text-3xl font-black text-purple-400">{valienteEnSala.length}</p>
                <p className="text-sm text-purple-400/40 font-bold">/{totalValiente}</p>
              </div>
              <p className="text-[8px] text-purple-400/30 font-bold uppercase tracking-wider mt-1">en sala</p>
            </div>
            {/* Brave */}
            <div className={`p-5 text-center transition-all duration-300 ${scanMode === 'brave' ? 'bg-emerald-500/5' : ''}`}>
              <p className="text-[8px] text-emerald-400/50 font-black uppercase tracking-[0.3em] mb-1">Brave</p>
              <div className="flex items-baseline justify-center gap-1">
                <p className="text-3xl font-black text-emerald-400">{braveEnSala.length}</p>
                <p className="text-sm text-emerald-400/40 font-bold">/{totalBrave}</p>
              </div>
              <p className="text-[8px] text-emerald-400/30 font-bold uppercase tracking-wider mt-1">en sala</p>
            </div>
          </div>

          {/* Botón Ver Lista del modo actual */}
          <button
            onClick={() => setShowList(v => !v)}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white/70 border-t border-white/5 hover:bg-white/5 transition-all"
          >
            {showList ? `▲ Ocultar Lista (${modeLabel})` : `▼ Ver Lista de ${modeLabel} en Sala`}
          </button>

          {/* Lista Desplegable */}
          {showList && (
            <div className="overflow-y-auto max-h-72 border-t border-white/5">
              {currentModeAttendees.length === 0 ? (
                <p className="text-center text-white/20 text-xs font-bold uppercase py-6 tracking-widest">Sin ingresos aún</p>
              ) : (
                <ul>
                  {currentModeAttendees.map((a, i) => (
                    <li key={a.id} className={`flex items-center justify-between px-5 py-3 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-base flex-shrink-0">✅</span>
                        <div className="overflow-hidden">
                          <p className="text-white font-bold text-sm truncate capitalize leading-tight">
                            {a.nombre_completo?.toLowerCase() || '—'}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            scanMode === 'brave' ? 'text-emerald-400/40' : 'text-purple-400/40'
                          }`}>
                            Folio {a.folio}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-black flex-shrink-0 ml-2 ${
                        scanMode === 'brave' ? 'text-emerald-400/50' : 'text-purple-400/50'
                      }`}>
                        {formatHora(a.fecha_checkin)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

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
