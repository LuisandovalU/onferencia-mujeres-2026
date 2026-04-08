"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

type Line = { text: string };

function RevealLine({
  text,
  index,
  total,
  scrollYProgress,
}: {
  text: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / (total + 1);
  const end = Math.min(0.98, start + 0.42);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [28, 0]);

  return (
    <motion.p
      style={{ opacity, y }}
      className="text-display-sm font-medium tracking-tight text-neutral-900 md:text-display"
    >
      {text}
    </motion.p>
  );
}

type TextRevealProps = {
  lines: Line[];
  className?: string;
};

export function TextReveal({ lines, className }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-[180vh] flex-col justify-center px-6 py-24",
        className
      )}
    >
      <div className="section-container mx-auto max-w-2xl space-y-10">
        {lines.map((line, i) => (
          <RevealLine
            key={i}
            text={line.text}
            index={i}
            total={lines.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}
