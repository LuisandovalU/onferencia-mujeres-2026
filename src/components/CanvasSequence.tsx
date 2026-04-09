"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const BATCH = 12;

type CanvasSequenceProps = {
  scrollProgress: MotionValue<number>;
  frameUrls: string[];
  className?: string;
  /** Canvas CSS width/height are set from container; DPR applied internally */
  aspectRatio?: string;
};

export function CanvasSequence({
  scrollProgress,
  frameUrls,
  className,
  aspectRatio = "16 / 9",
}: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isFirstFrameDrawn, setIsFirstFrameDrawn] = useState(false);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(-1);

  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, frameUrls.length - 1]);

  const lastIndexDrawnRef = useRef(-1);
  const drawFrame = useCallback(
    (idx: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const imgIdx = Math.round(idx);
      const img = imagesRef.current[imgIdx];
      
      // Misión 2: Si el frame no está listo, NO limpies nada. 
      // Simplemente retornamos y el canvas mantiene el frame anterior.
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const { clientWidth, clientHeight } = container;
      const w = Math.max(1, Math.floor(clientWidth * dpr));
      const h = Math.max(1, Math.floor(clientHeight * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Solo llegamos aquí si tenemos una imagen lista para dibujar.
      // Ya no necesitamos rellenar con un color sólido primero porque la imagen cubrirá todo (object-cover logic).
      // Al no limpiar el canvas si la imagen falla, logramos el "Last Frame Cache".
      
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);
      lastIndexDrawnRef.current = imgIdx;
      
      if (!isFirstFrameDrawn) {
        setIsFirstFrameDrawn(true);
      }
    },
    [isFirstFrameDrawn]
  );

  useMotionValueEvent(frameIndex, "change", (latest) => {
    const i = Math.round(latest);
    if (i === lastFrameRef.current) return;
    lastFrameRef.current = i;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(i));
  });

  useEffect(() => {
    imagesRef.current = new Array(frameUrls.length);
    let cancelled = false;
    let cursor = 0;

    const loadNextBatch = () => {
      const end = Math.min(cursor + BATCH, frameUrls.length);
      for (let i = cursor; i < end; i++) {
        const img = new Image();
        img.decoding = "async";
        img.loading = i < BATCH ? "eager" : "lazy";
        img.crossOrigin = "anonymous";
        img.src = frameUrls[i];
        img.onload = () => {
          if (cancelled) return;
          setLoadedCount((c) => c + 1);
          requestAnimationFrame(() => drawFrame(Math.round(frameIndex.get())));
        };
        img.onerror = () => {
          if (cancelled) return;
          setLoadedCount((c) => c + 1);
        };
        imagesRef.current[i] = img;
      }
      cursor = end;
      if (cursor < frameUrls.length) queueMicrotask(loadNextBatch);
    };

    loadNextBatch();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, frameIndex, frameUrls]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => drawFrame(lastFrameRef.current));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawFrame]);

  const progressPct =
    frameUrls.length > 0 ? Math.min(100, Math.round((loadedCount / frameUrls.length) * 100)) : 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden rounded-sm bg-neutral-900", className)}
      style={{ 
        aspectRatio,
        backgroundImage: frameUrls[0] ? `url(${frameUrls[0]})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-700 ease-out",
            isFirstFrameDrawn ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
      {progressPct < 100 && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
          initial={{ opacity: 1 }}
          animate={{ opacity: progressPct < 100 ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.42, 0, 0.58, 1] }}
        >
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
            {progressPct}%
          </span>
        </motion.div>
      )}
    </div>
  );
}
