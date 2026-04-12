import React, { useState } from 'react';

export default function ManualRegistrationForm() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nuevo' | 'buscar'>('nuevo');
  const [result, setResult] = useState<{ success?: boolean; error?: string; ticketUrl?: string; mensaje?: string } | null>(null);

  // Form states (Registro)
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    email: '',
    es_brave: true,
    es_casa: true,
    referido_por: '',
    monto_pagado: '130',
    metodo_pago: 'efectivo'
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [abonoAmount, setAbonoAmount] = useState('');

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/register-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, password })
      });

      const data = await response.json();
      if (response.ok) {
        setResult({ success: true, ticketUrl: data.ticketUrl, mensaje: data.mensaje });
        setFormData({ ...formData, nombre: '', whatsapp: '', email: '', referido_por: '', monto_pagado: '130', es_brave: true, es_casa: true });
      } else {
        setResult({ error: data.error || 'Error desconocido' });
      }
    } catch (err) {
      setResult({ error: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase
      .from('asistentes')
      .select('*')
      .or(`nombre_completo.ilike.%${searchQuery}%,whatsapp.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(5);
    
    if (data) setSearchResults(data);
    setLoading(false);
  };

  const handleAddAbono = async (id: string) => {
    if (!abonoAmount || Number(abonoAmount) <= 0) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistenteId: id, monto_abono: abonoAmount, password })
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ 
          success: true, 
          mensaje: data.estaPagadoCompletamente ? '¡Pago completado!' : `Abono registrado. Nuevo saldo: $${data.nuevoPagado}`,
          ticketUrl: data.ticketUrl 
        });
        setAbonoAmount('');
        handleSearch(); // Refresh
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error al abonar');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[80vh] px-4">
        <div className="w-full max-w-md bg-emerald-950/80 backdrop-blur-3xl border border-emerald-400/20 p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] text-center">
          <div className="w-20 h-2 bg-emerald-400 mx-auto mb-10 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)]"></div>
          <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-widest">Staff <span className="text-emerald-400">Login</span></h2>
          <p className="text-emerald-200/50 text-xs mb-10 font-medium uppercase tracking-tighter">Conferencia de Mujeres 2026</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="Clave de Acceso"
              className="w-full bg-black/40 border border-emerald-400/10 rounded-2xl p-6 text-white text-center text-2xl focus:outline-none focus:border-emerald-400 transition-all font-bold placeholder:text-emerald-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-6 rounded-2xl transition-all uppercase tracking-widest shadow-2xl shadow-emerald-500/20 disabled:opacity-50 text-lg"
            >
              {loading ? 'Validando...' : 'Acceder al Registro'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-emerald-950/60 backdrop-blur-3xl border border-emerald-400/30 p-12 md:p-20 rounded-[4rem] shadow-[0_50px_120px_rgba(0,0,0,0.8)] relative overflow-hidden my-12 mx-auto text-center">
      {/* Luces decorativas */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400 opacity-10 rounded-full blur-[130px]"></div>
      
      {/* Pestañas */}
      <div className="flex gap-4 justify-center mb-12 relative z-10">
        <button 
          onClick={() => { setActiveTab('nuevo'); setResult(null); }}
          className={`px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${
            activeTab === 'nuevo' ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white/5 text-emerald-400/60'
          }`}
        >
          Nuevo Registro
        </button>
        <button 
          onClick={() => { setActiveTab('buscar'); setResult(null); }}
          className={`px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${
            activeTab === 'buscar' ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white/5 text-emerald-400/60'
          }`}
        >
          Cobrar Saldo
        </button>
        <button 
          onClick={() => window.open(`/api/admin/export-csv?key=${password}`, '_blank')}
          className="px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest transition-all bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
        >
          Exportar CSV 📊
        </button>
      </div>

      <div className="flex flex-col items-center mb-16 relative z-10">
        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
          {activeTab === 'nuevo' ? 'Registro' : 'Cobro'} <span className="text-emerald-400">{activeTab === 'nuevo' ? 'Manual' : 'Digital'}</span>
        </h2>
        <div className="w-40 h-1.5 bg-emerald-500 rounded-full mb-8"></div>
      </div>

      {result?.success && (
        <div className="mb-16 p-12 bg-emerald-500/20 border-2 border-emerald-400/50 rounded-[4rem] text-center animate-in fade-in zoom-in duration-700 shadow-[0_0_60px_rgba(16,185,129,0.3)] relative z-10">
          <p className="text-white font-black text-4xl mb-4 uppercase tracking-tight">{result.mensaje || '¡Éxito Total!'}</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            {result.ticketUrl && (
              <a 
                href={result.ticketUrl} 
                target="_blank" 
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-black py-6 px-14 rounded-3xl transition-all shadow-2xl shadow-emerald-400/40 uppercase tracking-widest text-xl"
              >
                📥 Bajar Boleto
              </a>
            )}
            <button 
              onClick={() => setResult(null)}
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-6 px-14 rounded-3xl transition-all border border-white/20 text-xl"
            >
              Cerrar Aviso
            </button>
          </div>
        </div>
      )}

      {activeTab === 'nuevo' ? (
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 max-w-5xl mx-auto">
          <div className="md:col-span-8">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest text-left ml-4">Nombre Completo</label>
            <input
              type="text"
              className="w-full bg-black/60 border-2 border-emerald-400/10 rounded-2xl p-5 text-white text-2xl font-bold focus:outline-none focus:border-emerald-400 transition-all"
              placeholder="MARÍA GARCÍA"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest text-left ml-4">WhatsApp</label>
            <input
              type="tel"
              className="w-full bg-black/60 border-2 border-emerald-400/10 rounded-2xl p-5 text-white text-2xl font-bold focus:outline-none focus:border-emerald-400"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              required
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest text-left ml-4">Correo Electrónico (Opcional)</label>
            <input
              type="email"
              className="w-full bg-black/60 border-2 border-emerald-400/10 rounded-2xl p-5 text-white text-xl font-bold focus:outline-none focus:border-emerald-400"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest text-left ml-4">¿Cómo se enteró?</label>
            <input
              type="text"
              className="w-full bg-black/60 border-2 border-emerald-400/10 rounded-2xl p-5 text-white text-xl font-bold focus:outline-none focus:border-emerald-400"
              value={formData.referido_por}
              placeholder="Redes sociales, amigo, etc."
              onChange={(e) => setFormData({...formData, referido_por: e.target.value})}
            />
          </div>

          <div className="md:col-span-6 space-y-3">
             <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest text-left ml-4">Categoría</label>
             <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, es_brave: true})} className={`p-4 rounded-xl border-2 font-black uppercase text-xs transition-all ${formData.es_brave ? 'bg-emerald-500 border-emerald-300 text-black' : 'bg-black/40 border-white/5 text-gray-500'}`}>Brave</button>
                <button type="button" onClick={() => setFormData({...formData, es_brave: false})} className={`p-4 rounded-xl border-2 font-black uppercase text-xs transition-all ${!formData.es_brave ? 'bg-emerald-500 border-emerald-300 text-black' : 'bg-black/40 border-white/5 text-gray-500'}`}>Valiente</button>
             </div>
          </div>

          <div className="md:col-span-6 space-y-3">
             <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest text-left ml-4">¿Forma parte de la iglesia?</label>
             <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, es_casa: true})} className={`p-4 rounded-xl border-2 font-black uppercase text-xs transition-all ${formData.es_casa ? 'bg-emerald-500 border-emerald-300 text-black' : 'bg-black/40 border-white/5 text-gray-500'}`}>Casa (ICI)</button>
                <button type="button" onClick={() => setFormData({...formData, es_casa: false})} className={`p-4 rounded-xl border-2 font-black uppercase text-xs transition-all ${!formData.es_casa ? 'bg-emerald-500 border-emerald-300 text-black' : 'bg-black/40 border-white/5 text-gray-500'}`}>Visita (Nueva)</button>
             </div>
          </div>

          <div className="md:col-span-12 mt-4">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-4 tracking-widest text-center">Confirmar Método de Pago (Abono Inicial)</label>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
               {['efectivo', 'transferencia'].map(m => (
                 <button
                   key={m}
                   type="button"
                   onClick={() => setFormData({...formData, metodo_pago: m})}
                   className={`p-4 rounded-xl border-2 font-black uppercase text-[10px] tracking-tighter transition-all ${
                     formData.metodo_pago === m
                     ? 'bg-emerald-500 border-emerald-300 text-black shadow-lg shadow-emerald-500/20'
                     : 'bg-black/40 border-white/5 text-gray-500'
                   }`}
                 >
                   {m}
                 </button>
               ))}
            </div>
          </div>


          <div className="md:col-span-12 mt-4">
            <label className="block text-[10px] font-black text-emerald-400 uppercase mb-4 tracking-widest text-center">Monto a Recibir (Total: $130)</label>
            <div className="flex items-center justify-center gap-4">
               <span className="text-4xl font-black text-white">$</span>
               <input
                type="number"
                className="w-48 bg-emerald-500/10 border-4 border-emerald-500 rounded-3xl p-6 text-white text-5xl font-black text-center focus:outline-none"
                value={formData.monto_pagado}
                onChange={(e) => setFormData({...formData, monto_pagado: e.target.value})}
              />
            </div>
          </div>


          <button 
            type="submit"
            disabled={loading}
            className="md:col-span-12 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-10 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 transition-all uppercase text-2xl tracking-[0.2em] mt-8"
          >
            {loading ? 'ENVIANDO...' : 'REGISTRAR AHORA'}
          </button>
        </form>
      ) : (
        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Nombre, WhatsApp o Email..."
              className="flex-1 bg-black/60 border-2 border-emerald-400/10 rounded-2xl p-6 text-white text-2xl font-bold focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="bg-emerald-500 text-black font-black px-10 rounded-2xl uppercase tracking-widest"
            >
              Buscar
            </button>
          </div>

          <div className="space-y-4">
            {searchResults.map(asistente => (
              <div key={asistente.id} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] text-left hover:border-emerald-500 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase">{asistente.nombre_completo}</h4>
                    <div className="flex gap-4 mt-2">
                       <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">WA: {asistente.whatsapp}</span>
                       <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{asistente.es_casa ? 'Casa' : 'Visita'} • {asistente.es_brave ? 'Brave' : 'Valiente'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-black">Estado de Pago</p>
                    <p className={`text-2xl font-black ${asistente.status_pago === 'completado' ? 'text-emerald-400' : 'text-orange-500 animate-pulse'}`}>
                      {asistente.status_pago === 'completado' ? 'LIQUIDADO' : `DEBE $${asistente.monto_total - asistente.monto_pagado}`}
                    </p>
                  </div>
                </div>

                {asistente.status_pago !== 'completado' && (
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl">
                    <span className="text-lg font-black text-white/50">$</span>
                    <input 
                      type="number" 
                      placeholder="Monto a abonar..."
                      className="flex-1 bg-transparent border-b-2 border-emerald-500/50 p-2 text-white text-2xl font-black focus:outline-none focus:border-emerald-500"
                      onChange={(e) => setAbonoAmount(e.target.value)}
                    />
                    <button 
                      onClick={() => handleAddAbono(asistente.id)}
                      disabled={loading}
                      className="bg-emerald-500 text-black font-black px-8 py-4 rounded-xl uppercase text-[10px] tracking-widest"
                    >
                      Abonar
                    </button>
                  </div>
                )}

                {asistente.status_pago === 'completado' && (
                  <a 
                    href={`/api/download-ticket?id=${asistente.id}`}
                    target="_blank"
                    className="block text-center bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                  >
                    Abrir Boleto Digital
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

