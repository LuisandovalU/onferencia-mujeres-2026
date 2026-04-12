"use client";

import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import braveTextSrc from "@/assets/brave.webp";
import valienteTextSrc from "@/assets/valiente.webp";

const BRAVE_BG   = '#2F4A2C'; // brave-dark-deep
const VALIENTE_BG = '#E3DBCF'; // valiente-beige
const SILK_EASE = [0.16, 1, 0.3, 1] as any;

const ConferenceChoiceCard = memo(() => {
  const [selected, setSelected] = useState<'brave' | 'valiente' | null>(null);

  const openModal = useCallback((conf: 'brave' | 'valiente') => {
    window.dispatchEvent(
      new CustomEvent('open-inscription-modal', { detail: { conferencia: conf } })
    );
  }, []);

  const handleBackdropClick = useCallback(() => {
    if (selected) setSelected(null);
  }, [selected]);

  const handleValienteClick = useCallback((e: React.MouseEvent) => {
    if (selected === 'brave') {
      setSelected(null);
      e.stopPropagation();
    } else if (!selected) {
      setSelected('valiente');
    }
  }, [selected]);

  const handleBraveClick = useCallback((e: React.MouseEvent) => {
    if (selected === 'valiente') {
      setSelected(null);
      e.stopPropagation();
    } else if (!selected) {
      setSelected('brave');
    }
  }, [selected]);

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
  }, []);

  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) openModal(selected);
  }, [selected, openModal]);

  return (
    <div 
      onClick={handleBackdropClick}
      className={cn(
        "relative w-full max-w-[460px] mx-auto aspect-[3/4] rounded-[3rem] overflow-hidden bg-neutral-950 shadow-[0_0_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10 transition-all will-change-transform",
        selected ? "cursor-pointer scale-[1.01]" : ""
      )}
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {/* ── SECCIÓN VALIENTE (base) ── */}
      <motion.div
        onClick={handleValienteClick}
        animate={{
          filter: selected === 'brave'
            ? 'grayscale(1) brightness(0.15)'
            : 'grayscale(0) brightness(1)',
          transform: 'translate3d(0,0,0)'
        }}
        transition={{ duration: 0.6, ease: SILK_EASE }}
        style={{ backgroundColor: VALIENTE_BG }}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer touch-pan-y flex flex-col items-center justify-end px-8 pb-10 will-change-transform"
      >
        <div className={cn(
          "flex flex-col items-center text-center transition-all duration-700",
          selected === 'brave' ? "opacity-0 translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0",
        )}>
          <img
            src={(valienteTextSrc as any).src ?? valienteTextSrc}
            alt="Valiente"
            loading="eager"
            // @ts-ignore
            fetchpriority="high"
            className="h-[5.25rem] w-auto object-contain mb-3"
          />
          <p className="font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-[#2F4A2C] bg-[#2F4A2C]/8 px-4 py-1.5 rounded-full mb-1">
            31 DE MAYO • 3:00 PM
          </p>
          <p className="font-body text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#2F4A2C]/60 mb-2">
            Gran Salón del Valle
          </p>
          <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[#2F4A2C] text-center px-4">Madres • Casadas • Mujeres Maduras</span>
        </div>
      </motion.div>
      
      {/* ── SECCIÓN BRAVE (capa superior con corte diagonal) ── */}
      <motion.div
        onClick={handleBraveClick}
        initial={false}
        animate={{
          clipPath: selected === 'brave'
            ? 'polygon(0 0, 100% 0, 100% 90%, 0 100%)'
            : selected === 'valiente'
            ? 'polygon(0 0, 100% 0, 100% 10%, 0 20%)'
            : 'polygon(0 0, 100% 0, 100% 45%, 0 55%)',
          filter: selected === 'valiente'
            ? 'grayscale(1) brightness(0.15)'
            : 'grayscale(0) brightness(1)',
          transform: 'translate3d(0,0,0)'
        }}
        transition={{ duration: 0.8, ease: SILK_EASE }}
        style={{ backgroundColor: BRAVE_BG }}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer shadow-2xl touch-pan-y flex flex-col items-center justify-start px-8 pt-10 will-change-transform"
      >
        <div className={cn(
          "flex flex-col items-center text-center transition-all duration-700",
          selected === 'valiente' ? "opacity-0 -translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0",
        )}>
          <img
            src={(braveTextSrc as any).src ?? braveTextSrc}
            alt="Brave"
            loading="eager"
            // @ts-ignore
            fetchpriority="high"
            className="h-[5.25rem] w-auto object-contain mb-3 brightness-0 invert"
          />
          <p className="font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-white bg-white/12 px-4 py-1.5 rounded-full mb-1">
            24 DE MAYO • 5:00 PM
          </p>
          <p className="font-body text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">
            Gran Salón del Valle
          </p>
          <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-white text-center px-4">Universitarias • Emprendedoras • Profesionales</span>
        </div>

        {/* Línea de brillo cuando no hay selección */}
        {!selected && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        )}
      </motion.div>

      {/* ── PANEL DE ACCIÓN DINÁMICO ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: selected === 'brave' ? 40 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: SILK_EASE }}
            className={cn(
              "absolute left-0 z-40 w-full px-10 flex flex-col gap-4 will-change-transform",
              selected === 'brave' ? "bottom-12" : "top-12"
            )}
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            <button
              onClick={handleActionClick}
              className={cn(
                "w-full rounded-2xl py-5 text-[0.7rem] font-black uppercase tracking-[0.35em] shadow-2xl active:scale-95 transition-all duration-300",
                selected === 'brave'
                  ? "bg-white text-[#2F4A2C]"
                  : "bg-[#2F4A2C] text-white"
              )}
            >
              Aparta tu lugar
            </button>
            <button
              onClick={handleReset}
              className={cn(
                "text-[0.55rem] font-black tracking-[0.3em] uppercase text-center opacity-40 py-2",
                selected === 'brave' ? "text-white" : "text-[#2F4A2C]"
              )}
            >
              ← Volver a elegir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ConferenceChoiceCard.displayName = 'ConferenceChoiceCard';

export default ConferenceChoiceCard;
