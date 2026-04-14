import { Scanner } from '@yudiel/react-qr-scanner';
import AdminMasterGuard from './AdminMasterGuard';

export default function CheckinScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Apuntando cámara...');
  const [colorState, setColorState] = useState<'gray' | 'green' | 'orange' | 'red'>('gray');
  const [scanning, setScanning] = useState(true);

  const procesarBoleto = async (scannedText: string) => {
    const rawText = scannedText.trim();
    if (!rawText) return;

    const password = sessionStorage.getItem('admin_password'); // Necesario para el API de check-in

    setScanning(false);
    setScanResult(rawText);
    setStatusText('Verificando con el Servidor...');
    setColorState('gray');

    try {
      // Llamamos al nuevo API seguro en lugar de consultar Supabase directamente
      const resp = await fetch('/api/admin/process-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, password }) // Enviamos password para autorizar
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      // 3. Manejar Respuestas de Éxito o Advertencia
      if (data.success) {
        setStatusText(data.message);
        setColorState('green');
      } else if (data.type === 'warning') {
        setStatusText(data.message);
        setColorState('red');
      } else if (data.type === 'error') {
        setStatusText(data.message);
        setColorState('orange');
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
    <AdminMasterGuard>
      <div className={`w-full transition-all duration-700 flex flex-col items-center justify-start min-h-[60vh] pb-20`}>
      {/* Indicador de Estado Flotante Refinado */}
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center relative z-10">
        <div className={`w-full p-4 md:p-6 rounded-2xl mb-8 text-center font-black text-lg md:text-xl transition-all duration-500 border-2 uppercase tracking-tight leading-none ${colorClasses[colorState]}`}>
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

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
    </AdminMasterGuard>
  );
}
