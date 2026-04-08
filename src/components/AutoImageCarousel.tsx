"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type CarouselSlide = { src: any; alt: string };

type AutoImageCarouselProps = {
  slides: CarouselSlide[];
  /** Cambio de imagen cada N ms (por defecto 5s) */
  intervalMs?: number;
  className?: string;
  sizes: string;
  priorityFirst?: boolean;
};

export function AutoImageCarousel({
  slides,
  intervalMs = 5000,
  className,
  sizes,
  priorityFirst,
}: AutoImageCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i: number) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden bg-neutral-200", className)}>
      {slides.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden={i !== index}
        >
          <img
            src={slide.src?.src || slide.src}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            sizes={sizes}
          />
        </motion.div>
      ))}
      {slides.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5"
          aria-hidden
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-white/90" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
