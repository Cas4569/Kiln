"use client";

import * as React from "react";
import { motion, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ScrollProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  containerRef: React.RefObject<HTMLElement>;
  springOptions?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

/**
 * A horizontal progress bar that reflects the scroll position of a container.
 * The fill is a spring-animated transform, so it eases rather than snapping.
 */
export function ScrollProgress({
  className,
  containerRef,
  springOptions = { stiffness: 280, damping: 18, mass: 0.3 },
  ...props
}: ScrollProgressProps) {
  const x = useSpring(0, springOptions);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = Math.max(1, scrollWidth - clientWidth);
      const p = Math.min(1, Math.max(0, scrollLeft / max));
      x.set(p);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [containerRef, x]);

  return (
    <div
      className={cn("relative h-0.5 w-full overflow-hidden", className)}
      data-slot="scroll-progress-track"
      {...props}
    >
      <motion.div
        className="absolute left-0 top-0 h-full w-full origin-left bg-foreground"
        style={{ scaleX: x }}
      />
      <span className="sr-only">Horizontal scroll progress</span>
    </div>
  );
}