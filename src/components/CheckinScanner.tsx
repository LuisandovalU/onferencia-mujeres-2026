import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../lib/supabase';

export default function CheckinScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Apuntando cámara...');
  const [colorState, setColorState] = useState<'gray' | 'green' | 'orange' | 'red'>('gray');
  const [scanning, setScanning] = useState(true);

  const procesarBoleto = async (scannedText: string) => {
    setScanning(false);
    setScanResult(scannedText);
    setStatusText('Consultando Base de Datos...');
    setColorState('gray');

    try {
      const isFolio = /^\d+$/.test(scannedText);
      let queryId = scannedText;
      const query = supabase.from('asistentes').select('*');
      
      if (isFolio) {
        query.eq('folio', Number(scannedText));
      } else {
        try {
          const url = new URL(scannedText);
          const uuid = url.searchParams.get('id');
          if (!uuid) throw new Error();
          query.eq('id', uuid);
          queryId = uuid;
        } catch(e) {
          throw new Error("No es un boleto de la conferencia");
        }
      }

      const { data: asistente, error } = await query.single();

      if (error || !asistente) {
        setStatusText(`Error: ${isFolio ? 'Folio #' : 'ID '}${queryId.slice(0, 5)} no existe`);
        setColorState('red');
      } else if (asistente.asistio) {
        setStatusText(`⚠️ YA ESCANEADO - ${asistente.nombre_completo}`);
        setColorState('red');
      } else if (asistente.status_pago !== 'completado') {
        setStatusText(`⏳ PAGO PENDIENTE - Debe $${asistente.monto_total - asistente.monto_pagado}`);
        setColorState('orange');
      } else {
        const { error: updateError } = await supabase
          .from('asistentes')
          .update({ asistio: true, fecha_checkin: new Date().toISOString() })
          .eq('id', asistente.id);

        if (updateError) {
          setStatusText('Error al guardar asistencia.');
          setColorState('red');
        } else {
          setStatusText(`✅ ¡BIENVENIDA! - ${asistente.nombre_completo}`);
          setColorState('green');
        }
      }
    } catch (err: any) {
      setStatusText(`Código inválido: ${err.message}`);
      setColorState('red');
    } finally {
      setTimeout(() => {
        setScanResult(null);
        setStatusText('Esperando Boleto...');
        setColorState('gray');
        setScanning(true);
      }, 4000);
    }
  };

  const colorClasses = {
    gray: 'bg-gray-800 text-white border-transparent',
    green: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] border-emerald-400',
    orange: 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-400',
    red: 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border-red-500'
  };

  // Clases para el fondo de pantalla completa (versiones más oscuras para no cegar)
  const screenBgClasses = {
    gray: 'bg-gray-900',
    green: 'bg-emerald-950',
    orange: 'bg-orange-950',
    red: 'bg-red-950'
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-500 flex flex-col items-center justify-start overflow-y-auto ${screenBgClasses[colorState]}`}>
      {/* Overlay de brillo para éxito/error */}
      <div className={`fixed inset-0 pointer-events-none opacity-20 transition-opacity duration-500 ${colorState !== 'gray' ? 'opacity-40' : 'opacity-0'} ${screenBgClasses[colorState]}`}></div>

      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center mt-12 relative z-10">
        <div className={`w-full p-4 rounded-xl mb-8 text-center font-bold text-xl transition-all duration-300 border-2 ${colorClasses[colorState]}`}>
          {statusText}
        </div>
        
        <div className="w-[300px] sm:w-[400px] bg-black rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl relative">
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
            <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-900">
              <div className="w-12 h-12 border-4 border-[#BFA077] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#BFA077] font-semibold animate-pulse">Sincronizando...</p>
            </div>
          )}
          
          {/* Luz de escaneo */}
          {scanning && <div className="absolute inset-x-0 top-0 h-1 bg-[#BFA077] shadow-[0_0_15px_#BFA077] animate-[scan_2s_linear_infinite]"></div>}
        </div>

        {scanResult && (
          <div className="mt-6 break-all text-xs text-gray-400 px-4 text-center bg-black/30 py-2 rounded-full">
            Log: {scanResult}
          </div>
        )}

        {/* Fallback Manual */}
        <div className="mt-10 w-full bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
          <p className="text-[10px] text-gray-500 mb-3 font-semibold uppercase tracking-widest text-center">Entrada Manual Staff</p>
          <div className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="Folio ej: 14"
              className="flex-1 bg-black/60 text-white border border-white/10 rounded-xl p-3 text-center text-lg font-bold focus:outline-none focus:border-[#BFA077] transition-all"
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
