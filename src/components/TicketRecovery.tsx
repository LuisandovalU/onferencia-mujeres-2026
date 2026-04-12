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
        <div id="recuperar" className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 scroll-mt-24">
            <div className="relative overflow-hidden rounded-[3rem] bg-brave-dark-deep px-8 py-16 md:px-20 md:py-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5">
                {/* Capas de profundidad e iluminación idénticas al bloque de inscripción */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.1),transparent_55%)]" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl opacity-50" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-forest/30 blur-3xl opacity-40" aria-hidden="true" />
                
                {/* Contenido */}
                <div className="relative z-10">
                    <p className="font-body text-[0.65rem] font-bold uppercase tracking-[0.4em] text-[#a8c480] mb-6">
                        Busca tu boleto digital
                    </p>
                    <h2 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-white mb-6 uppercase">
                        ¿Ya te <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a8c480] to-[#c8de9e]">inscribiste?</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-white/70 mb-12">
                        Si ya realizaste tu pago, ingresa el correo o WhatsApp con el que te registraste para descargar tu boleto.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 mb-10">
                        <input
                            type="text"
                            required
                            placeholder="Tu correo o WhatsApp..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-full px-8 py-5 text-white text-lg focus:outline-none focus:border-emerald-400 transition-all font-bold placeholder:text-white/20"
                            value={emailOrWhatsapp}
                            onChange={(e) => setEmailOrWhatsapp(e.target.value)}
                        />
                        <button
                            disabled={loading}
                            className="bg-white hover:bg-neutral-100 text-black font-black px-12 py-5 rounded-full transition-all shadow-xl shadow-white/5 uppercase tracking-[0.1em] text-sm disabled:opacity-50 ring-4 ring-white/10"
                        >
                            {loading ? 'BUSCANDO...' : 'BUSCAR BOLETO'}
                        </button>
                    </form>

                    {result?.error && (
                        <div className="inline-block px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm animate-in fade-in zoom-in">
                            ⚠️ {result.error}
                        </div>
                    )}

                    {result?.success && (
                        <div className="mt-4 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] animate-in slide-in-from-bottom duration-700">
                            <p className="text-white text-xl font-black mb-8 uppercase tracking-tight">¡Encontrado! Hola, {result.nombre.split(' ')[0]}</p>
                            <a
                                href={result.ticketUrl}
                                target="_blank"
                                className="inline-block bg-[#a8c480] hover:bg-[#c8de9e] text-black font-black py-5 px-14 rounded-full transition-all shadow-2xl shadow-emerald-500/20 uppercase tracking-[0.1em] text-sm"
                            >
                                📥 Descargar Mi Boleto
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
