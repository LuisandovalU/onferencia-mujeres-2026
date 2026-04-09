import React from 'react';
import { cn } from "@/lib/utils";

interface InscribeteButtonProps {
  conferencia?: 'brave' | 'valiente';
  variant?: 'outline' | 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

export const InscribeteButton: React.FC<InscribeteButtonProps> = ({ 
  conferencia, 
  variant = 'dark',
  className,
  children = 'Inscribete'
}) => {
  const handleClick = () => {
    const event = new CustomEvent('open-inscription-modal', { 
      detail: { conferencia } 
    });
    window.dispatchEvent(event);
  };

  const variants = {
    dark: 'bg-neutral-900 text-white hover:bg-neutral-800',
    light: 'bg-white text-neutral-900 hover:bg-neutral-100',
    outline: 'border-2 border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-50'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded-full px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 active:scale-95",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
