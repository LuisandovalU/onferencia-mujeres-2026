import React, { useState } from 'react';
import AttendeeCard from './AttendeeCard';
import type { Asistente, ResultMessage } from './types';

interface AttendeeSearchProps {
  password: string;
  onStatsRefresh: () => void;
}

export default function AttendeeSearch({ password, onStatsRefresh }: AttendeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Asistente[]>([]);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultMessage | null>(null);

  const handleSearch = async () => {
    console.log('Iniciando búsqueda:', searchQuery);
    if (!searchQuery) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, password }),
      });
      console.log('Respuesta recibida:', resp.status);
      const data = await resp.json();
      if (resp.ok) {
        console.log('Resultados encontrados:', data.results?.length);
        setSearchResults(data.results || []);
      } else {
        console.error('Error en API:', data.error);
        alert(data.error || 'Error al buscar');
      }
    } catch (err) {
      console.error('Error de catch:', err);
      alert('Error de conexión al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAbono = async (id: string) => {
    if (!abonoAmount || Number(abonoAmount) <= 0) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistenteId: id, monto_abono: abonoAmount, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({
          success: true,
          mensaje: data.estaPagadoCompletamente
            ? '¡Pago completado!'
            : `Abono registrado. Nuevo saldo: $${data.nuevoPagado}`,
          ticketUrl: data.ticketUrl,
        });
        setAbonoAmount('');
        handleSearch(); // Refresh results
        onStatsRefresh(); // Refresh global stats
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error al abonar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, WhatsApp o email…"
          className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 text-lg font-semibold
                     focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                     placeholder:text-gray-300 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 rounded-xl
                     uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-40
                     shrink-0"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Success/Abono Banner */}
      {result?.success && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center
                        animate-[fadeIn_0.4s_ease-out]">
          <p className="text-gray-800 font-bold font-montserrat">{result.mensaje}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            {result.ticketUrl && (
              <a href={result.ticketUrl} target="_blank"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl
                           transition-all duration-200 shadow-sm text-sm uppercase tracking-wider">
                📥 Descargar Boleto
              </a>
            )}
            <button onClick={() => setResult(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-8 rounded-xl
                         transition-all duration-200 text-sm">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {searchResults.map((asistente) => (
          <AttendeeCard
            key={asistente.id}
            asistente={asistente}
            abonoAmount={abonoAmount}
            onAbonoAmountChange={setAbonoAmount}
            onAddAbono={handleAddAbono}
            loading={loading}
          />
        ))}

        {searchResults.length === 0 && searchQuery && !loading && (
          <div className="text-center py-12 text-gray-300">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-sm">Sin resultados para "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
