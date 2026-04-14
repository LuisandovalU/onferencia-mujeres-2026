import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AdminMasterGuard({ children }: Props) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Verificar si ya se ingresó la clave maestra en esta sesión
    const savedMasterPass = sessionStorage.getItem('master_admin_password');
    if (savedMasterPass) {
      verificarMasterPassword(savedMasterPass);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  const verificarMasterPassword = async (pass: string) => {
    setLoading(true);
    setError(false);
    try {
      const resp = await fetch('/api/admin/verify-master-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await resp.json();
      
      if (data.isValid) {
        sessionStorage.setItem('master_admin_password', pass);
        setIsUnlocked(true);
      } else {
        sessionStorage.removeItem('master_admin_password');
        setIsUnlocked(false);
        if (pass) setError(true);
      }
    } catch (err) {
      console.error('Error verifying master password:', err);
      setIsUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verificarMasterPassword(password);
  };

  if (isUnlocked === null || (loading && !isUnlocked)) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-t-4 border-amber-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-amber-500/60 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Subiendo Nivel de Seguridad...
        </p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-card p-10 md:p-16 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden text-center bg-zinc-900/40 backdrop-blur-3xl">
          
          {/* Decoración de advertencia */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/20">
              <ShieldCheck className="text-white" size={40} strokeWidth={2.5} />
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                Área Restringida
              </h2>
              <div className="flex items-center justify-center gap-2 text-amber-500/60">
                <AlertTriangle size={14} />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Acceso Maestro Requerido</p>
              </div>
              <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed">
                Esta sección contiene datos sensibles. Por favor, ingresa la llave maestra para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Llave maestra de staff"
                  className={`w-full bg-black/40 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-3xl py-6 pl-16 pr-6 text-white text-center text-xl focus:outline-none focus:border-amber-500/50 transition-all font-bold placeholder:text-zinc-800 shadow-inner`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && (
                  <p className="mt-3 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-bounce">
                    Contraseña incorrecta
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black py-6 rounded-3xl transition-all uppercase tracking-widest shadow-xl shadow-amber-500/20 text-sm active:scale-95 border-t border-white/10"
              >
                Desbloquear Sección
              </button>
            </form>

            <p className="mt-12 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
              Protección de datos conformada • Mujeres 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
