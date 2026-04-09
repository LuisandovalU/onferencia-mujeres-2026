"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import braveTextSrc from "@/assets/brave.webp";
import valienteTextSrc from "@/assets/valiente.webp";

const BRAVE_BG   = '#2F4A2C'; // brave-dark-deep
const VALIENTE_BG = '#E3DBCF'; // valiente-beige
const BRAVE_DARK  = '#2F4A2C';

export default function ConferenceChoiceCard() {
  const [selected, setSelected] = useState<'brave' | 'valiente' | null>(null);

  const openModal = (conf: 'brave' | 'valiente') => {
    window.dispatchEvent(
      new CustomEvent('open-inscription-modal', { detail: { conferencia: conf } })
    );
  };

  return (
    /* El cuadrado interactivo — sin wrapper externo de sección */
    <div className="relative w-full max-w-[460px] mx-auto aspect-[3/4] rounded-[3rem] overflow-hidden bg-neutral-950 shadow-[0_0_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10">

      {/* ── SECCIÓN VALIENTE (base) ── */}
      <motion.div
        onClick={() => setSelected('valiente')}
        animate={{
          filter: selected === 'brave'
            ? 'grayscale(1) brightness(0.15)'
            : 'grayscale(0) brightness(1)',
        }}
        transition={{ duration: 0.6 }}
        style={{ backgroundColor: VALIENTE_BG }}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer touch-none flex flex-col items-center justify-end px-8 pb-10"
      >
        <div className={cn(
          "flex flex-col items-center text-center transition-all duration-700",
          selected === 'brave' ? "opacity-0 translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0",
        )}>
          <img
            src={(valienteTextSrc as any).src ?? valienteTextSrc}
            alt="Valiente"
            className="h-[5.25rem] w-auto object-contain mb-3"
          />
          <p className="font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-[#2F4A2C] bg-[#2F4A2C]/8 px-4 py-1.5 rounded-full mb-2">
            31 DE MAYO
          </p>
          <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[#2F4A2C] text-center px-4">Madres • Casadas • Mujeres Maduras</span>
        </div>
      </motion.div>

      {/* ── SECCIÓN BRAVE (capa superior con corte diagonal) ── */}
      <motion.div
        onClick={() => setSelected('brave')}
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
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        style={{ backgroundColor: BRAVE_BG }}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer shadow-2xl touch-none flex flex-col items-center justify-start px-8 pt-10"
      >
        <div className={cn(
          "flex flex-col items-center text-center transition-all duration-700",
          selected === 'valiente' ? "opacity-0 -translate-y-10 blur-sm" : "opacity-100 translate-y-0 blur-0",
        )}>
          <img
            src={(braveTextSrc as any).src ?? braveTextSrc}
            alt="Brave"
            className="h-[5.25rem] w-auto object-contain mb-3 brightness-0 invert"
          />
          <p className="font-body text-[0.7rem] font-black tracking-[0.35em] uppercase text-white bg-white/12 px-4 py-1.5 rounded-full mb-2">
            24 DE MAYO
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
            className={cn(
              "absolute left-0 z-40 w-full px-10 flex flex-col gap-4",
              selected === 'brave' ? "bottom-12" : "top-12"
            )}
          >
            <button
              onClick={() => openModal(selected)}
              className={cn(
                "w-full rounded-2xl py-5 text-[0.7rem] font-black uppercase tracking-[0.35em] shadow-2xl active:scale-95 transition-all",
                selected === 'brave'
                  ? "bg-white text-[#2F4A2C]"
                  : "bg-[#2F4A2C] text-white"
              )}
            >
              Aparta tu lugar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setSelected(null); }}
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
}
