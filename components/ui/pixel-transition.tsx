"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PixelTransitionProps {
  /** Change this value (e.g. the active market id) to play the transition. */
  triggerKey: string | number;
  cols?: number;
  rows?: number;
  /** Any CSS color. Defaults to the current theme background. */
  color?: string;
  /** Seconds. */
  duration?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps content; when `triggerKey` changes, a grid of "pixels" covers it and
 * dissolves in random order. Skipped on first render and when the user
 * prefers reduced motion. The overlay never blocks clicks.
 */
export function PixelTransition({
  triggerKey,
  cols = 14,
  rows = 8,
  color = "hsl(var(--background))",
  duration = 0.7,
  className,
  children,
}: PixelTransitionProps) {
  const reduce = useReducedMotion();
  const prevKey = React.useRef(triggerKey);
  const [run, setRun] = React.useState<{ id: number; delays: number[] } | null>(null);

  React.useEffect(() => {
    if (prevKey.current === triggerKey) return;
    prevKey.current = triggerKey;
    if (reduce) return;
    setRun({
      id: Date.now(),
      delays: Array.from({ length: cols * rows }, () => Math.random() * duration * 0.6),
    });
    const t = setTimeout(() => setRun(null), duration * 1000 + 250);
    return () => clearTimeout(t);
  }, [triggerKey, cols, rows, duration, reduce]);

  return (
    <div className={cn("relative", className)}>
      {children}
      {run && (
        <div
          key={run.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 grid overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {run.delays.map((delay, i) => (
            <motion.span
              key={i}
              style={{ background: color }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay, duration: duration * 0.4, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}