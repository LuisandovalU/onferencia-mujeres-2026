"use client";

import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import braveTextSrc from "@/assets/brave.webp";
import valienteTextSrc from "@/assets/valiente.webp";
import braveBgSrc from "@/assets/Brave-1.webp";
import valienteBgSrc from "@/assets/Val-1.webp";

const DATA = {
  brave: {
    id: 'brave',
    bg: (braveBgSrc as any).src ?? braveBgSrc,
    titleSrc: braveTextSrc,
    date: '24 DE MAYO • 5:00 PM',
    location: 'Gran Salón del Valle',
    target: 'Universitarias • Emprendedoras • Profesionales',
    color: '#ebf2d5',
    themeColor: '#A8C480'
  },
  valiente: {
    id: 'valiente',
    bg: (valienteBgSrc as any).src ?? valienteBgSrc,
    titleSrc: valienteTextSrc,
    date: '31 DE MAYO • 3:00 PM',
    location: 'Gran Salón del Valle',
    target: 'Madres • Casadas • Mujeres +40',
    color: '#e6dfd3',
    themeColor: '#D89982'
  }
};

const ConferenceChoiceCard = memo(() => {
  const [activeItem, setActiveItem] = useState<'brave' | 'valiente'>('brave');
  const [isExpanding, setIsExpanding] = useState(false);

  const activeData = DATA[activeItem];
  const inactiveItem = activeItem === 'brave' ? 'valiente' : 'brave';
  const inactiveData = DATA[inactiveItem];

  const isExpandingRef = useRef(false);

  const triggerSwap = useCallback((id: 'brave' | 'valiente') => {
    if (isExpandingRef.current || id === activeItem) return;
    setIsExpanding(true);
    isExpandingRef.current = true;
    
    // Hacemos el swap rapidísimo a los 0.35s (350ms)
    setTimeout(() => {
      setActiveItem(id);
      setIsExpanding(false);
      isExpandingRef.current = false;
    }, 350);
  }, [activeItem]);

  // Timer "Indestructible" (Una sola instancia, ideal para no congelarse en móviles)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isExpandingRef.current) return;
      
      setIsExpanding(true);
      isExpandingRef.current = true;
      
      setTimeout(() => {
        setActiveItem(prev => prev === 'brave' ? 'valiente' : 'brave');
        setIsExpanding(false);
        isExpandingRef.current = false;
      }, 350);
    }, 4000);
    
    return () => clearInterval(timer);
  }, []);

  const openModal = useCallback((conf: 'brave' | 'valiente') => {
    window.dispatchEvent(
      new CustomEvent('open-inscription-modal', { detail: { conferencia: conf } })
    );
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-0 md:px-8">
      {/* Contenedor Principal (Marco) */}
      <div className="relative w-full h-[550px] md:h-[750px] overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] md:shadow-2xl rounded-none md:rounded-[3rem] bg-[#0d140e]">
        
        {/* 1. FONDO ESTÁTICO CONSTANTE (La tarjeta antigua que será cubierta) */}
        <div className="absolute inset-0 z-0">
          <img 
            src={activeData.bg} 
            alt="Fondo estático"
            className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-90 transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* 2. EL OBJETO VOLADOR (La miniatura que se expande, vuela SOBRE el fondo antiguo) */}
        <motion.div
           layout
           key={`flyer-${inactiveItem}`} // Al cambiar el inactiveItem este nodo se destruye, evitando animaciones de reversa.
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0 }}
           onClick={() => triggerSwap(inactiveItem)}
           // Cuando vuela (isExpanding), se apropia de inset-0.
           className={cn(
             "absolute z-20 overflow-hidden cursor-pointer transform-gpu",
             isExpanding 
               ? "inset-0 rounded-none md:rounded-[3rem]" 
               : "bottom-6 right-4 md:bottom-12 md:right-12 w-[90px] h-[130px] md:w-[160px] md:h-[220px] rounded-2xl md:rounded-3xl shadow-2xl ring-1 md:ring-2 ring-white/30 hover:ring-white group/thumb"
           )}
           style={{ willChange: 'transform' }}
           transition={{ layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }, x: { duration: 0.25 }, opacity: { duration: 0.25 } }}
        >
          {/* Progress Indicator (Solo en miniatura) */}
          {!isExpanding && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <svg className="w-full h-full overflow-visible">
                <motion.rect
                  key={`timer-${activeItem}`}
                  x="2"
                  y="2"
                  width="calc(100% - 4px)"
                  height="calc(100% - 4px)"
                  rx="20"
                  fill="none"
                  stroke={inactiveData.themeColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3.65, ease: "linear" }}
                  style={{ 
                    pathLength: 0,
                    width: 'calc(100% - 4px)',
                    height: 'calc(100% - 4px)'
                  }}
                />
              </svg>
            </div>
          )}

          {/* La Imagen Voladora */}
          <motion.img 
            layout
            src={inactiveData.bg} 
            alt="Miniatura Voladora"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-300 transform-gpu",
              isExpanding ? "opacity-80 md:opacity-90" : "brightness-90 md:brightness-100 group-hover/thumb:scale-110"
            )}
            transition={{ layout: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-200 group-hover/thumb:opacity-80" />
          
          {/* Letras de la miniatura que desaparecen sutilmente mientras vuela */}
          <motion.div 
             animate={{ opacity: isExpanding ? 0 : 1, y: isExpanding ? 10 : 0 }}
             transition={{ duration: 0.15 }}
             className="absolute bottom-3 md:bottom-5 left-0 w-full flex justify-center pointer-events-none z-10"
          >
             <img src={(inactiveData.titleSrc as any).src ?? inactiveData.titleSrc} className="h-4 md:h-9 w-auto brightness-0 invert opacity-80" />
          </motion.div>
        </motion.div>



        {/* 3. CONTENIDO DEL FONDO ACTIVO — Usa CSS Grid 0fr→1fr para expansión fluida sin reflow */}
        <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center pointer-events-none z-30">
          <AnimatePresence mode="wait">
            {!isExpanding && (
              <motion.div
                key={`content-${activeItem}`}
                initial={{ opacity: 0, filter: 'blur(5px)', y: activeItem === 'brave' ? 40 : -40 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: activeItem === 'brave' ? 60 : -60 }}
                exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 0.1 } }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="max-w-xl pointer-events-auto transform-gpu"
                style={{ willChange: 'transform, opacity' }}
              >

                {/* Título Imagen */}
                <img 
                  src={(activeData.titleSrc as any).src ?? activeData.titleSrc} 
                  className="h-16 md:h-24 w-auto mb-8 brightness-0 invert drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
                  alt={activeData.id}
                />
                
                {/* Datos — Grid 0fr→1fr expansion trick (no max-height reflow) */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    !isExpanding ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 mb-10">
                      <p className="font-body text-2xl md:text-3xl font-black text-white tracking-[0.25em] drop-shadow-md">
                        {activeData.date}
                      </p>
                      <p 
                        style={{ color: activeData.themeColor }}
                        className="font-body text-xs md:text-base font-bold tracking-widest uppercase items-center flex gap-2 transition-colors duration-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {activeData.location}
                      </p>
                      {/* Público Objetivo (Minimalista y Simple) */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 opacity-60">
                        {activeData.target.split('•').map((part, i, arr) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="font-body text-[0.6rem] md:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white">
                              {part.trim()}
                            </span>
                            {i < arr.length - 1 && (
                              <div 
                                style={{ backgroundColor: activeData.themeColor }} 
                                className="w-1 h-1 rounded-full opacity-50" 
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => openModal(activeItem)}
                  className="hidden md:inline-flex group relative overflow-hidden bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] w-max transform-gpu"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-black">Apartar mi lugar</span>
                  <div style={{ backgroundColor: activeData.themeColor }} className="absolute inset-0 transform scale-x-0 origin-left group-hover:scale-x-100 transition-all duration-500 ease-[0.16,1,0.3,1] z-0"></div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

ConferenceChoiceCard.displayName = 'ConferenceChoiceCard';

export default ConferenceChoiceCard;
