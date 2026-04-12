import React, { useState } from 'react';

export default function TicketRecovery() {
    const [emailOrWhatsapp, setEmailOrWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string; ticketUrl?: string; nombre?: string } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const resp = await fetch('/api/find-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrWhatsapp })
            });
            const data = await resp.json();
            if (resp.ok) {
                setResult(data);
            } else {
                setResult({ error: data.error });
            }
        } catch (err) {
            setResult({ error: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="recuperar" className="w-full max-w-4xl mx-auto py-24 px-8 text-center scroll-mt-24">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">¿Ya te inscribiste?</h2>
            <p className="text-emerald-400 font-bold mb-12 tracking-widest uppercase text-sm">Recupera tu boleto digital aquí</p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    type="text"
                    required
                    placeholder="Tu correo o WhatsApp..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-emerald-900"
                    value={emailOrWhatsapp}
                    onChange={(e) => setEmailOrWhatsapp(e.target.value)}
                />
                <button
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-12 py-6 rounded-2xl transition-all uppercase tracking-widest text-lg disabled:opacity-50"
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {result?.error && (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold animate-in fade-in zoom-in">
                    ❌ {result.error}
                </div>
            )}

            {result?.success && (
                <div className="p-10 bg-emerald-500/10 border-2 border-emerald-400/50 rounded-[3rem] animate-in slide-in-from-bottom duration-700">
                    <p className="text-white text-2xl font-black mb-6">¡Hola {result.nombre}! Encontramos tu boleto.</p>
                    <a
                        href={result.ticketUrl}
                        target="_blank"
                        className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black py-6 px-16 rounded-3xl transition-all shadow-xl shadow-emerald-500/30 uppercase tracking-widest text-xl"
                    >
                        📥 Descargar Boleto
                    </a>
                </div>
            )}
        </div>
    );
}
