import React, { useState, useEffect } from 'react';
import AdminTabs from './AdminTabs';
import { Lock } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AdminSessionGuard({ children }: Props) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar sesión existente en el mount
    const savedPass = sessionStorage.getItem('admin_password');
    if (savedPass) {
      verificarPassword(savedPass);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const verificarPassword = async (pass: string) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await resp.json();
      if (data.isValid) {
        sessionStorage.setItem('admin_password', pass);
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('admin_password');
        setIsAuthenticated(false);
        if (pass) alert('Sesión expirada o contraseña incorrecta');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verificarPassword(password);
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-purple-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 w-16 h-16 border-b-2 border-indigo-500 rounded-full animate-spin-slow"></div>
        </div>
        <p className="mt-8 text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Sistema</p>
        <p className="mt-2 text-zinc-600 font-bold uppercase tracking-widest text-[8px]">Mujeres 2026 Admin Suite</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border-t-white/10">
          {/* Decoración Purpura */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/20">
              <Lock className="text-white" size={32} />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Acceso Staff</h1>
            <p className="text-zinc-500 text-[10px] mb-10 font-bold uppercase tracking-[0.4em]">Puerta de Seguridad</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Introduce la contraseña"
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-center text-xl focus:outline-none focus:border-purple-500 transition-all font-bold placeholder:text-zinc-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-6 rounded-3xl transition-all uppercase tracking-widest shadow-xl shadow-purple-500/20 text-sm"
              >
                Entrar al Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-purple-500 selection:text-white pb-32 md:pb-0">
      
      <header className="pt-12 md:pt-16 pb-6 text-center relative z-20">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2">
          Sistema <span className="text-glow-gold">Staff</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.6em] mb-12">Conferencia de Mujeres 2026</p>
      </header>

      <AdminTabs />
      
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
