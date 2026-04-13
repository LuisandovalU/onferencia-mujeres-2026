import React, { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ value, duration = 1.5, prefix = '', suffix = '', className = '' }: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    // Para valores grandes que parecen dinero, formatear con comas
    const num = Math.round(latest);
    return prefix + num.toLocaleString() + suffix;
  });

  useEffect(() => {
    const animation = animate(count, value, {
      duration: duration,
      ease: "easeOut",
    });

    return animation.stop;
  }, [value, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
