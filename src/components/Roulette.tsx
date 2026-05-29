import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Participant {
  folio: number;
  nombre: string;
}

export default function Roulette() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [realCount, setRealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [showName, setShowName] = useState(false);
  
  // Guardamos la rotación actual para que los siguientes giros continúen desde ahí
  const [currentRotation, setCurrentRotation] = useState(0);
  const controls = useAnimation();

  // Colores inspirados en el diseño
  const sliceColors = ['#f5f1e7', '#e8e1d3']; // Crema claro y crema un poco más oscuro
  const textColor = '#2d3f37'; // Verde oscuro Valiente

  // Función para generar un "tic" de ruleta usando Web Audio API
  const playTick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime); // tono agudo
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05); // baja rápidamente
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime); // volumen moderado
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // fade out rápido
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Ignorar errores de audio en navegadores restrictivos
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-roulette-participants');
      const data = await res.json();
      if (data.participants) {
        setRealCount(data.participants.length);
        
        // Si hay pocos, duplicamos para que la ruleta se vea llena
        let list = data.participants;
        if (list.length > 0 && list.length < 8) {
            while (list.length < 12) {
                list = [...list, ...data.participants];
            }
        }
        // Desordenar
        list.sort(() => Math.random() - 0.5);
        setParticipants(list);
      }
    } catch (e) {
      console.error('Error fetching participants', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const spinRoulette = () => {
    if (isSpinning || participants.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowName(false);

    // Calcular un ganador al azar
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const selectedParticipant = participants[winnerIndex];

    // Calcular el ángulo para que ese índice quede arriba
    const sliceAngle = 360 / participants.length;
    
    // Si la flecha está en el TOP (270 grados desde el este, o 0 grados si rotamos el viewBox):
    // La rebanada 0 empieza en 0 grados. El centro de la rebanada 0 es sliceAngle / 2.
    // Queremos que el centro del winnerIndex quede apuntando arriba (270deg visualmente, o -90deg).
    // Entonces: rotation = (vueltas * 360) - (winnerIndex * sliceAngle) - (sliceAngle / 2);
    
    const extraSpins = 8 + Math.floor(Math.random() * 4); // 8 a 11 vueltas completas
    const targetRotation = currentRotation + (extraSpins * 360) - (currentRotation % 360) + (360 - (winnerIndex * sliceAngle)) - (sliceAngle / 2);

    // Lógica para reproducir el tictac
    const durationMs = 12000;
    let startTime = Date.now();
    let isTicking = true;

    const tickLoop = () => {
      if (!isTicking) return;
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) return;

      playTick();

      // progress de 0 a 1
      const progress = elapsed / durationMs;
      // empieza en 30ms, termina en ~400ms (curva exponencial para que frene al final)
      const nextDelay = 30 + Math.pow(progress, 3) * 400;

      setTimeout(tickLoop, nextDelay);
    };
    
    // Iniciar tictac
    playTick();
    setTimeout(tickLoop, 30);

    controls.start({
      rotate: targetRotation,
      transition: {
        duration: 12,
        ease: [0.2, 0.8, 0.2, 1], // Ease out cubic
      }
    }).then(() => {
      isTicking = false;
      setIsSpinning(false);
      setCurrentRotation(targetRotation);
      setWinner(selectedParticipant);
      fireConfetti();
    });
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    // IMPORTANTE: zIndex 100 para que se vea por encima del modal (que es z-50)
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const fireBigRevealConfetti = () => {
    // Explosión central masiva
    const defaults = { zIndex: 100, origin: { y: 0.6 } };
    
    confetti({ ...defaults, particleCount: 150, spread: 80, startVelocity: 50 });
    confetti({ ...defaults, particleCount: 100, spread: 120, startVelocity: 40 });
    confetti({ ...defaults, particleCount: 50, spread: 160, startVelocity: 30 });
    
    // Y además lanzamos el confeti normal que dura 3 segundos a los lados
    fireConfetti();
  };

  // Dibujar el SVG de la ruleta
  const renderWheel = () => {
    const total = participants.length;
    const cx = 500;
    const cy = 500;
    const r = 450;

    if (total === 0) return null;

    return (
      <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.3" />
          </filter>
        </defs>
        
        {/* Borde exterior decorativo */}
        <circle cx={cx} cy={cy} r={490} fill="#f5f1e7" />
        <circle cx={cx} cy={cy} r={475} fill="#364e44" />
        <circle cx={cx} cy={cy} r={465} fill="none" stroke="#f5f1e7" strokeWidth="2" strokeDasharray="10 10" />

        <motion.g animate={controls} style={{ transformOrigin: '500px 500px' }} initial={{ rotate: 0 }}>
          {participants.map((folio, i) => {
            const angle = 360 / total;
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;

            // Coordenadas del arco
            const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
            const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
            const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
            const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M ${cx} ${cy}`,
              `L ${x1} ${y1}`,
              `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');

            // Centro del texto
            const textAngle = startAngle + angle / 2;

            return (
              <g key={`${folio.folio}-${i}`}>
                <path d={pathData} fill={sliceColors[i % sliceColors.length]} stroke="#364e44" strokeWidth="2" />
                <g transform={`translate(${cx}, ${cy}) rotate(${textAngle})`}>
                  {/* El texto se escribe a lo largo del radio, terminando cerca del borde exterior */}
                  <text
                    x={400}
                    y={6}
                    fill={textColor}
                    fontSize={total > 30 ? "14" : "18"}
                    fontFamily="serif"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    Folio #{folio.folio}
                  </text>
                  {/* Adornos de hojas/puntos en el borde */}
                  <circle cx={425} cy={0} r={6} fill="#364e44" opacity={0.6} />
                </g>
              </g>
            );
          })}
        </motion.g>

        {/* Círculo central "¡GIRAR!" */}
        <g 
          onClick={spinRoulette} 
          className={isSpinning || participants.length === 0 ? "cursor-not-allowed" : "cursor-pointer hover:opacity-90 transition-opacity"}
          style={{ pointerEvents: isSpinning ? 'none' : 'auto' }}
        >
          <circle cx={cx} cy={cy} r={120} fill="#e8e1d3" filter="url(#shadow)" stroke="#364e44" strokeWidth="4" />
          <text x={cx} y={cy + 15} fill={textColor} fontSize="42" fontFamily="serif" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            ¡GIRAR!
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center py-10">
      
      {/* Controles y Status */}
      <div className="w-full flex justify-between items-center mb-10 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#e8e1d3]/20 rounded-full">
            <Trophy className="text-[#e8e1d3]" size={24} />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-wide uppercase">Participantes</h2>
            <p className="text-white/60 text-sm font-medium">{realCount} folios verificados hoy</p>
          </div>
        </div>
        
        <button
          onClick={fetchParticipants}
          disabled={loading || isSpinning}
          className="flex items-center gap-2 px-6 py-3 bg-[#364e44] hover:bg-[#283b31] border border-[#e8e1d3]/20 rounded-xl text-[#e8e1d3] font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar Asistencias
        </button>
      </div>

      {loading && participants.length === 0 ? (
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#e8e1d3]/20 border-t-[#e8e1d3] rounded-full animate-spin mb-4"></div>
          <p className="text-[#e8e1d3] font-bold uppercase tracking-widest animate-pulse">Cargando asistentes...</p>
        </div>
      ) : (
        <div className="relative w-full max-w-[800px] aspect-square flex items-center justify-center">
          
          {/* Indicador / Flecha Superior */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-xl">
             <div className="w-16 h-20 bg-[#e8e1d3] polygon-arrow flex items-center justify-center border-b-[6px] border-[#364e44]">
                <div className="w-8 h-8 rounded-full border-4 border-[#364e44]/20 mt-2"></div>
             </div>
             <style dangerouslySetInnerHTML={{__html: `
               .polygon-arrow { clip-path: polygon(0% 0%, 100% 0%, 50% 100%); }
             `}} />
          </div>

          {/* La Ruleta */}
          <div className="w-full h-full relative z-10 p-4">
             {renderWheel()}
          </div>

        </div>
      )}

      {/* Modal / Anuncio del Ganador */}
      {winner && !isSpinning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-10 z-50 px-16 py-8 bg-[#e8e1d3] border-4 border-[#364e44] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl flex flex-col items-center min-w-[400px]"
        >
          <h3 className="text-[#364e44] font-black text-2xl uppercase tracking-[0.2em] mb-2 text-center">
            {showName ? "¡Felicidades!" : "¡Folio Seleccionado!"}
          </h3>
          <p className="text-[#364e44] font-serif text-6xl font-bold mt-4 mb-6">Folio #{winner.folio}</p>
          
          {showName ? (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="text-center w-full pt-6 border-t-2 border-[#364e44]/20"
             >
               <p className="text-[#364e44]/60 text-xs font-bold uppercase tracking-widest mb-1">A nombre de</p>
               <p className="text-[#364e44] font-black text-3xl uppercase">{winner.nombre}</p>
             </motion.div>
          ) : (
             <button
               onClick={() => {
                 setShowName(true);
                 fireBigRevealConfetti();
               }}
               className="mt-2 px-8 py-4 bg-[#364e44] hover:bg-[#283b31] text-[#e8e1d3] rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
             >
               Revelar Ganadora
             </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
