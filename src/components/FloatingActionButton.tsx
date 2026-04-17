"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export default function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Aparece después de hacer scroll inicial para no estorbar en el hero
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    
    // Comprobar on mount
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('open-inscription-modal', { detail: { conferencia: null } })
    );
  }, []);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-8 right-6 md:bottom-12 md:right-12 z-[9000] flex items-center justify-center gap-3 bg-[#a8c480] hover:bg-[#c4cf9a] text-neutral-900 px-7 py-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(168,196,128,0.6)] ring-1 ring-white/40 transform transition-all duration-700 ease-[0.16,1,0.3,1] hover:scale-110 active:scale-95 font-body font-black uppercase tracking-widest text-xs md:text-sm group",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}
    >
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-900 group-hover:scale-125 transition-transform"></span>
      </div>
      <span>Inscríbete</span>
    </button>
  );
}
