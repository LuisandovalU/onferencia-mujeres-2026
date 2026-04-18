import React, { useState, useEffect } from 'react';
import StatsOverview from './StatsOverview';
import NewRegistrationForm from './NewRegistrationForm';
import AttendeeSearch from './AttendeeSearch';
import type { Stats } from './types';

export default function ManualRegistrationIndex() {
  // ── Auth State ──
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // ── Module State ──
  const [activeTab, setActiveTab] = useState<'nuevo' | 'buscar'>('nuevo');
  const [stats, setStats] = useState<Stats | null>(null);

  // Restore password from session
  useEffect(() => {
    const savedPass = sessionStorage.getItem('admin_password');
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
    }
  }, []);

  // ── Auth Handler ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const resp = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
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
      setAuthLoading(false);
    }
  };

  // ── Stats ──
  const fetchStats = async () => {
    try {
      const resp = await fetch('/api/admin/get-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchStats();
  }, [isAuthenticated]);

  // ─────────────────────────────────────────
  // LOGIN SCREEN (Pinterest / Minimal)
  // ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[80vh] px-4">
        <div className="w-full max-w-sm bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center">
          {/* Accent line */}
          <div className="w-14 h-1 bg-emerald-500 mx-auto mb-8 rounded-full" />

          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wider font-montserrat mb-1">
            Staff <span className="text-emerald-600">Login</span>
          </h2>
          <p className="text-gray-400 text-xs mb-8 font-medium tracking-wide">
            Conferencia de Mujeres 2026
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              placeholder="Clave de Acceso"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800
                         text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/40
                         focus:border-emerald-400 placeholder:text-gray-300 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              disabled={authLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl
                         transition-all duration-200 uppercase tracking-wider text-sm disabled:opacity-50
                         shadow-sm hover:shadow-md"
            >
              {authLoading ? 'Validando…' : 'Acceder'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // MAIN DASHBOARD (Pinterest / Minimal)
  // ─────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* ── Header Banner ── */}
      <div className="bg-gray-900 rounded-3xl p-10 text-center shadow-xl mb-12 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-montserrat">
          {activeTab === 'nuevo' ? 'Registro ' : 'Cobro '}
          <span className="text-emerald-400">
            {activeTab === 'nuevo' ? 'Manual' : 'Digital'}
          </span>
        </h1>
        <div className="w-12 h-1 bg-emerald-500 mx-auto mt-4 rounded-full opacity-50" />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab('nuevo')}
          className={`px-8 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all duration-300
            ${activeTab === 'nuevo'
              ? 'bg-gray-900 text-white shadow-md scale-105'
              : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
            }`}
        >
          Nuevo Registro
        </button>
        <button
          onClick={() => setActiveTab('buscar')}
          className={`px-8 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all duration-300
            ${activeTab === 'buscar'
              ? 'bg-gray-900 text-white shadow-md scale-105'
              : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
            }`}
        >
          Cobrar Saldo
        </button>
        <button
          onClick={() => window.open(`/api/admin/export-csv?key=${password}`, '_blank')}
          className="px-8 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all duration-300
                     bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50"
        >
          Exportar CSV 📊
        </button>
      </div>

      {/* ── Stats Dashboard ── */}
      {stats && <StatsOverview stats={stats} />}

      {/* ── Main Content Area ── */}
      <div className="bg-[#FAFAFA] rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
        {activeTab === 'nuevo' ? (
          <NewRegistrationForm password={password} onSuccess={fetchStats} />
        ) : (
          <AttendeeSearch password={password} onStatsRefresh={fetchStats} />
        )}
      </div>
    </div>
  );
}
