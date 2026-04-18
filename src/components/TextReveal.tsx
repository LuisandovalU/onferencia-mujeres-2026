"use client";

import { cn } from "@/lib/utils";
import { useRef, useState, useEffect, useCallback } from "react";

type Line = { text: string };

/**
 * A single line that fades in with a staggered delay.
 * Animates only `opacity` and `translateY` — GPU-composited properties
 * that avoid layout recalculations (no reflow).
 */
function RevealLine({
  text,
  index,
  isVisible,
}: {
  text: string;
  index: number;
  isVisible: boolean;
}) {
  // Staggered delay: each word gets 80ms more delay than the previous
  const delay = index * 80;

  return (
    <p
      className="text-display-sm font-medium tracking-tight text-neutral-900 md:text-display transform-gpu"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {text}
    </p>
  );
}

type TextRevealProps = {
  lines: Line[];
  className?: string;
};

export function TextReveal({ lines, className }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    []
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.2,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col justify-center px-6 py-24",
        className
      )}
    >
      <div className="section-container mx-auto max-w-2xl space-y-10">
        {lines.map((line, i) => (
          <RevealLine
            key={i}
            text={line.text}
            index={i}
            isVisible={isVisible}
          />
        ))}
      </div>
    </div>
  );
}
