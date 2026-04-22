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
        <section id="recuperar" className="relative w-full bg-brave-dark-deep py-20 md:py-32 overflow-hidden scroll-mt-24">
            {/* Decoración Minimalista - Full Width */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,196,128,0.1),transparent_70%)]" aria-hidden="true"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center px-8 md:px-6">
                <p className="font-body text-[0.65rem] md:text-[0.75rem] font-bold uppercase tracking-[0.4em] text-[#a8c480] mb-8">
                    Busca tu boleto digital
                </p>
                
                <h2 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-white mb-8">
                    ¿Ya te <span className="italic font-medium text-[#a8c480]">inscribiste</span>? Descarga tu acceso.
                </h2>
                
                <p className="font-body text-base md:text-lg text-white/70 leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                    Ingresa el correo o WhatsApp con el que te registraste para recuperar tu entrada de Brave y Valiente.
                </p>

                <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        required
                        placeholder="Tu correo o WhatsApp..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white text-lg focus:outline-none focus:border-[#a8c480] transition-all font-medium placeholder:text-white/20"
                        value={emailOrWhatsapp}
                        onChange={(e) => setEmailOrWhatsapp(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        className="bg-[#a8c480] hover:bg-[#c8de9e] text-black font-bold px-10 py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/10 uppercase tracking-[0.1em] text-[0.75rem] disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Buscar Boleto'}
                    </button>
                </form>

                {result?.error && (
                    <div className="mt-8 inline-block px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm animate-in fade-in zoom-in">
                        ⚠️ {result.error}
                    </div>
                )}

                {result?.success && (
                    <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] animate-in slide-in-from-bottom duration-700">
                        <p className="text-[#def2c1] text-xl font-black mb-8 uppercase tracking-tight">¡Encontrado! Hola, {result.nombre.split(' ')[0]}</p>
                        <a
                            href={result.ticketUrl}
                            target="_blank"
                            className="inline-block bg-[#a8c480] hover:bg-[#c8de9e] text-black font-black py-5 px-14 rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 uppercase tracking-[0.1em] text-sm"
                        >
                            📥 Descargar Mi Boleto
                        </a>
                    </div>
                )}
            </div>
        </section>

    );
}
