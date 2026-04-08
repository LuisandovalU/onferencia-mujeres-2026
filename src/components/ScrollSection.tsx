"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

type ScrollSectionProps = {
  children: ReactNode;
  scrollVh?: number;
  className?: string;
  stickyClassName?: string;
  id?: string;
};

export const ScrollSection = forwardRef<HTMLElement, ScrollSectionProps>(
  function ScrollSection(
    { children, scrollVh = 2.5, className, stickyClassName, id },
    ref
  ) {
    return (
      <section
        ref={ref}
        id={id}
        className={cn("relative w-full", className)}
        style={{ minHeight: `${scrollVh * 100}vh` }}
      >
        <div
          className={cn(
            "sticky top-0 flex h-screen w-full flex-col overflow-hidden",
            stickyClassName
          )}
        >
          {children}
        </div>
      </section>
    );
  }
);
