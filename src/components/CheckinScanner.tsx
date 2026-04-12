import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../lib/supabase';

export default function CheckinScanner() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Apuntando cámara...');
  const [colorState, setColorState] = useState<'gray' | 'green' | 'orange' | 'red'>('gray');
  const [scanning, setScanning] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await resp.json();
      if (data.isValid) {
        setIsAuthenticated(true);
      } else {
        alert('Clave incorrecta');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const procesarBoleto = async (scannedText: string) => {
    const rawText = scannedText.trim();
    setScanning(false);
    setScanResult(rawText);
    setStatusText('Consultando Base de Datos...');
    setColorState('gray');

    try {
      console.log('🔍 Texto escaneado:', rawText);
      
      // 1. Identificar ID o Folio
      let queryId: string | null = null;
      let isFolio = false;

      // Regex para UUID (formato estándar de IDs de Supabase)
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const uuidMatch = rawText.match(uuidRegex);

      if (uuidMatch) {
        // Encontró un ID largo (ya sea solo o dentro de una URL)
        queryId = uuidMatch[0];
        isFolio = false;
      } else if (/^\d+$/.test(rawText)) {
        // Es un número puro (Folio manual)
        queryId = rawText;
        isFolio = true;
      } else {
        // Intentar buscar parámetro ?id= en una URL si la regex falló
        try {
          const url = new URL(rawText);
          queryId = url.searchParams.get('id');
          isFolio = false;
        } catch(e) {
          queryId = null;
        }
      }

      if (!queryId) {
        throw new Error(`Formato no reconocido. Leí: "${rawText.slice(0, 20)}..."`);
      }

      // 2. Ejecutar Query
      const query = supabase.from('asistentes').select('*');
      if (isFolio) {
        query.eq('folio', Number(queryId));
      } else {
        query.eq('id', queryId);
      }

      const { data: asistente, error } = await query.single();

      if (error || !asistente) {
        throw new Error(`${isFolio ? 'Folio #' : 'ID '}${queryId.slice(0, 8)} no encontrado`);
      } 
      
      // 3. Validar Estados
      if (asistente.asistio) {
        setStatusText(`⚠️ YA ESCANEADO - ${asistente.nombre_completo}`);
        setColorState('red');
      } else if (asistente.status_pago !== 'completado') {
        const deuda = (asistente.monto_total || 130) - (asistente.monto_pagado || 0);
        setStatusText(`⏳ PAGO PENDIENTE - Debe $${deuda}`);
        setColorState('orange');
      } else {
        // 4. Marcar Asistencia
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
      console.error('❌ Error escaneo:', err.message);
      setStatusText(err.message);
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

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md bg-emerald-950/80 backdrop-blur-3xl border border-emerald-400/20 p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] text-center mt-12">
        <div className="w-20 h-2 bg-emerald-400 mx-auto mb-10 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)]"></div>
        <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-widest">Escáner <span className="text-emerald-400">Staff</span></h2>
        <p className="text-emerald-200/40 text-[10px] mb-10 font-medium uppercase tracking-[0.3em]">Acceso Restringido</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="password"
            placeholder="Clave de acceso"
            className="w-full bg-black/40 border border-emerald-400/10 rounded-2xl p-6 text-white text-center text-2xl focus:outline-none focus:border-emerald-400 transition-all font-bold placeholder:text-emerald-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-6 rounded-2xl transition-all uppercase tracking-widest shadow-2xl shadow-emerald-500/20 disabled:opacity-50 text-lg"
          >
            {loading ? 'Verificando...' : 'Abrir Cámara'}
          </button>
        </form>
      </div>
    );
  }

  const colorClasses = {
    gray: 'bg-emerald-950/50 text-emerald-400/50 border-emerald-400/10',
    green: 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.8)] border-white scale-105',
    orange: 'bg-orange-500 text-black shadow-[0_0_40px_rgba(249,115,22,0.8)] border-white scale-105',
    red: 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.8)] border-white scale-105'
  };

  const screenBgClasses = {
    gray: 'bg-black',
    green: 'bg-emerald-900',
    orange: 'bg-orange-950',
    red: 'bg-red-950'
  };

  return (
    <div className={`fixed inset-0 transition-all duration-700 flex flex-col items-center justify-start ${screenBgClasses[colorState]}`}>
      {/* Overlay de color envolvente */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${colorState !== 'gray' ? 'opacity-30' : 'opacity-0'} ${screenBgClasses[colorState]}`}></div>

      <div className="w-full max-w-lg mx-auto p-6 flex flex-col items-center mt-8 relative z-10">
        <div className={`w-full p-8 rounded-[2.5rem] mb-10 text-center font-black text-2xl md:text-3xl transition-all duration-500 border-4 uppercase tracking-tight leading-none ${colorClasses[colorState]}`}>
          {statusText}
        </div>
        
        <div className="w-[320px] sm:w-[450px] aspect-square bg-black rounded-[3rem] overflow-hidden border-8 border-emerald-900/50 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative">
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
          
          {/* Luz de escaneo esmeralda */}
          {scanning && <div className="absolute inset-x-0 top-0 h-2 bg-emerald-400 shadow-[0_0_30px_#10b981] animate-[scan_2s_linear_infinite]"></div>}
        </div>

        {/* Entrada Manual de Respaldo */}
        <div className="mt-12 w-full max-w-sm bg-black/60 backdrop-blur-3xl border border-emerald-400/10 p-6 rounded-[2.5rem] shadow-2xl">
          <p className="text-[10px] text-emerald-400/40 mb-4 font-black uppercase tracking-[0.4em] text-center">Entrada Manual (Folio)</p>
          <input 
            type="number" 
            placeholder="Ej: 14"
            className="w-full bg-transparent text-white border-b-4 border-emerald-500/20 rounded-none p-4 text-center text-4xl font-black focus:outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900"
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

        <button 
          onClick={() => window.location.href = '/admin/registro-manual'}
          className="mt-8 text-emerald-400/30 hover:text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] transition-all"
        >
          ← Volver al Registro Manual
        </button>
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

